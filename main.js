/* Kolorki ASCII */


const middleParts = document.querySelectorAll('.ascii-middle');

middleParts.forEach(span => {
    span.addEventListener('mouseenter', () => {
        middleParts.forEach(s => s.classList.add('is-hovered'));
    });

    span.addEventListener('mouseleave', () => {
        middleParts.forEach(s => s.classList.remove('is-hovered'));
    });
});

/* Ładowanie rzeczy */

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
        .catch(error => console.error('Error loading HTML:', error));
}

document.addEventListener("DOMContentLoaded", () => {
    loadHTML("nav-placeholder", "nav.html");
    loadHTML("hobbies-placeholder", "hobbies.html");
    loadHTML("footer-placeholder", "footer.html").then(applyEvents);
});

const events = [
    { name: "mayday", date: "May 01" },
    { name: "birthday", date: "May 05" }
];

function applyEvents() {
    const today = Date().substring(4, 10);
    events.forEach(({ name, date }) => {
        const active = today === date;
        document.body.classList.toggle(name, active);
        document.querySelectorAll(`[data-event="${name}"]`).forEach(el => {
            el.classList.toggle("hidden", !active);
        });
    });
}

