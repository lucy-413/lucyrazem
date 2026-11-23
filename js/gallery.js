/* Galeria (PhotoSwipe v5, MIT License) */
import PhotoSwipeLightbox from '/vendor/photoswipe/photoswipe-lightbox.esm.min.js';

const IMAGE_EXT_RE = /\.(jpe?g|png|webp|avif|gif)$/i;

function resolveAssetUrl(path, baseUrl) {
    if (/^(https?:)?\/\//i.test(path) || path.startsWith('/')) {
        return path;
    }
    const encoded = path
        .split('/')
        .map(segment => encodeURIComponent(segment))
        .join('/');
    return `${baseUrl}${encoded}`;
}

function filenameToAlt(filename) {
    return filename
        .replace(/\.[^.]+$/, '')
        .replace(/[_-]+/g, ' ')
        .trim();
}

function parseDimensions(entry) {
    const width = Number(entry.width || entry.w) || 0;
    const height = Number(entry.height || entry.h) || 0;
    if (width > 0 && height > 0) {
        return { width, height };
    }
    if (typeof entry.size === 'string') {
        const match = entry.size.match(/^(\d+)\s*[-x×]\s*(\d+)$/i);
        if (match) {
            return { width: Number(match[1]), height: Number(match[2]) };
        }
    }
    return { width: 0, height: 0 };
}

function normalizeEntry(entry, baseUrl) {
    if (typeof entry === 'string') {
        const src = resolveAssetUrl(entry, baseUrl);
        return { src, thumb: src, alt: filenameToAlt(entry), caption: '', width: 0, height: 0 };
    }
    if (!entry || typeof entry !== 'object' || !entry.src) {
        return null;
    }
    const src = resolveAssetUrl(entry.src, baseUrl);
    const thumb = entry.thumb ? resolveAssetUrl(entry.thumb, baseUrl) : src;
    const alt = entry.alt || entry.caption || filenameToAlt(entry.src);
    const { width, height } = parseDimensions(entry);
    return {
        src,
        thumb,
        alt,
        caption: entry.caption || '',
        width,
        height
    };
}

async function fetchJsonIfOk(url) {
    try {
        const res = await fetch(url, { headers: { Accept: 'application/json' } });
        if (!res.ok) return null;
        const contentType = res.headers.get('content-type') || '';
        if (!contentType.includes('json')) return null;
        return await res.json();
    } catch {
        return null;
    }
}

async function loadAlbumItems(album) {
    const mediaBase = `/gallery/media/${album}/`;

    // 1. Prefer photos.json on the media mount (supports captions, thumbs, dimensions, ordering)
    const remoteManifest = await fetchJsonIfOk(`${mediaBase}photos.json`);
    if (Array.isArray(remoteManifest)) {
        return remoteManifest.map(e => normalizeEntry(e, mediaBase)).filter(Boolean);
    }

    // 2. Fallback to Nginx autoindex_format json on /gallery/media/<album>/
    const autoindex = await fetchJsonIfOk(mediaBase);
    if (Array.isArray(autoindex)) {
        const hasThumbsDir = autoindex.some(
            item => item && item.type === 'directory' && item.name === 'thumbs'
        );
        const thumbList = hasThumbsDir ? await fetchJsonIfOk(`${mediaBase}thumbs/`) : null;
        const thumbNames = new Set(
            Array.isArray(thumbList)
                ? thumbList.filter(i => i && i.type === 'file').map(i => i.name)
                : []
        );

        return autoindex
            .filter(
                item =>
                    item &&
                    item.type === 'file' &&
                    !item.name.startsWith('.') &&
                    IMAGE_EXT_RE.test(item.name)
            )
            .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }))
            .map(item => {
                const src = resolveAssetUrl(item.name, mediaBase);
                const thumb = thumbNames.has(item.name)
                    ? resolveAssetUrl(`thumbs/${item.name}`, mediaBase)
                    : src;
                return {
                    src,
                    thumb,
                    alt: filenameToAlt(item.name),
                    caption: '',
                    width: 0,
                    height: 0
                };
            });
    }

    // 3. Fallback to a local photos.json next to the album index.html
    const localManifest = await fetchJsonIfOk('./photos.json');
    if (Array.isArray(localManifest)) {
        return localManifest.map(e => normalizeEntry(e, './')).filter(Boolean);
    }

    return [];
}

function syncDimensionsFromImg(link, img) {
    if (link.dataset.pswpWidth && link.dataset.pswpHeight) return;
    if (img.naturalWidth > 0 && img.naturalHeight > 0) {
        link.dataset.pswpWidth = String(img.naturalWidth);
        link.dataset.pswpHeight = String(img.naturalHeight);
    }
}

function renderItems(container, items) {
    const fragment = document.createDocumentFragment();

    items.forEach(item => {
        const link = document.createElement('a');
        link.className = 'gallery-item';
        link.href = item.src;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';

        if (item.width > 0 && item.height > 0) {
            link.dataset.pswpWidth = String(item.width);
            link.dataset.pswpHeight = String(item.height);
        }
        if (item.caption) {
            link.dataset.pswpCaption = item.caption;
        }

        const img = document.createElement('img');
        img.src = item.thumb;
        img.alt = item.alt;
        img.loading = 'lazy';
        img.decoding = 'async';

        if (!(item.width > 0 && item.height > 0)) {
            if (img.complete) {
                syncDimensionsFromImg(link, img);
            } else {
                img.addEventListener('load', () => syncDimensionsFromImg(link, img), { once: true });
            }
        }

        link.appendChild(img);
        fragment.appendChild(link);
    });

    container.replaceChildren(fragment);
}

function initLightbox(container) {
    const lightbox = new PhotoSwipeLightbox({
        gallery: container,
        children: 'a.gallery-item',
        pswpModule: () => import('/vendor/photoswipe/photoswipe.esm.min.js'),
        bgOpacity: 0.96,
        wheelToZoom: true
    });

    // If full-resolution dimensions weren't known beforehand (e.g. raw Nginx autoindex or thumbs),
    // update the slide size once the full image finishes loading.
    lightbox.on('loadComplete', ({ slide, content }) => {
        const img = content && content.element;
        if (
            img &&
            img.tagName === 'IMG' &&
            img.naturalWidth > 0 &&
            img.naturalHeight > 0 &&
            (slide.width !== img.naturalWidth || slide.height !== img.naturalHeight)
        ) {
            content.data.w = img.naturalWidth;
            content.data.h = img.naturalHeight;
            content.width = img.naturalWidth;
            content.height = img.naturalHeight;
            slide.width = img.naturalWidth;
            slide.height = img.naturalHeight;
            if (slide.data && slide.data.element) {
                slide.data.element.dataset.pswpWidth = String(img.naturalWidth);
                slide.data.element.dataset.pswpHeight = String(img.naturalHeight);
            }
            slide.resize();
        }
    });

    // Optional caption bar when an item has data-pswp-caption
    lightbox.on('uiRegister', () => {
        lightbox.pswp.ui.registerElement({
            name: 'custom-caption',
            order: 9,
            isButton: false,
            appendTo: 'root',
            html: '',
            onInit: (el, pswp) => {
                pswp.on('change', () => {
                    const currEl = pswp.currSlide && pswp.currSlide.data && pswp.currSlide.data.element;
                    const caption = currEl ? currEl.dataset.pswpCaption || '' : '';
                    el.textContent = caption;
                    el.hidden = !caption;
                });
            }
        });
    });

    lightbox.init();
}

async function initGallery() {
    const container = document.getElementById('gallery');
    if (!container) return;

    // If static items were placed directly in HTML, wire PhotoSwipe immediately.
    if (container.querySelector('a.gallery-item')) {
        container.querySelectorAll('a.gallery-item').forEach(link => {
            const img = link.querySelector('img');
            if (img && !(link.dataset.pswpWidth && link.dataset.pswpHeight)) {
                if (img.complete) {
                    syncDimensionsFromImg(link, img);
                } else {
                    img.addEventListener('load', () => syncDimensionsFromImg(link, img), { once: true });
                }
            }
        });
        initLightbox(container);
        return;
    }

    const album = container.dataset.album;
    if (!album) return;

    const items = await loadAlbumItems(album);

    if (items.length === 0) {
        const empty = document.createElement('p');
        empty.className = 'gallery-empty';
        empty.textContent = 'No photos in this album yet.';
        container.replaceChildren(empty);
        return;
    }

    renderItems(container, items);
    initLightbox(container);
}

document.addEventListener('DOMContentLoaded', initGallery);
