/* ASCII Gradient */
function initAsciiHover() {
    const middleParts = document.querySelectorAll('.ascii-middle');

    middleParts.forEach(span => {
        span.addEventListener('mouseenter', () => {
            middleParts.forEach(s => s.classList.add('is-hovered'));
        });

        span.addEventListener('mouseleave', (e) => {
            if (!e.relatedTarget || !Array.from(middleParts).includes(e.relatedTarget)) {
                middleParts.forEach(s => s.classList.remove('is-hovered'));
            }
        });
    });
}

function initAsciiTouch() {
    const middleParts = document.querySelectorAll('.ascii-middle');

    middleParts.forEach(span => {
        span.addEventListener('touchstart', () => {
            middleParts.forEach(s => s.classList.add('is-hovered'));
        }, { passive: true });

        span.addEventListener('touchend', () => {
            middleParts.forEach(s => s.classList.remove('is-hovered'));
        });

        span.addEventListener('touchcancel', () => {
            middleParts.forEach(s => s.classList.remove('is-hovered'));
        });
    });
}

/* Ładowanie */
function loadHTML(id, filename) {
    const element = document.getElementById(id);
    if (!element) return Promise.resolve();

    return fetch(filename)
        .then(response => {
            if (!response.ok) throw new Error(`Could not load ${filename}`);
            return response.text();
        })
        .then(text => {
            element.innerHTML = text;
        })
        .catch(error => console.error(`Error loading HTML (${filename}):`, error));
}

document.addEventListener("DOMContentLoaded", async () => {
    initAsciiHover();
    initAsciiTouch();

    await Promise.all([
        loadHTML("nav-placeholder", "nav.html"),
        loadHTML("hobbies-placeholder", "hobbies.html"),
        loadHTML("footer-placeholder", "footer.html")
    ]);
});
