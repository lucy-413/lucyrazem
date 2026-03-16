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
    
    if (!element) return; 

    fetch(filename)
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
    loadHTML("footer-placeholder", "footer.html");
});