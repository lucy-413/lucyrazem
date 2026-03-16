

// Kolorowe Logo
const middleParts = document.querySelectorAll('.ascii-middle');

middleParts.forEach(span => {

  span.addEventListener('mouseenter', () => {
    middleParts.forEach(s => s.classList.add('is-hovered'));
  });


  span.addEventListener('mouseleave', () => {
    middleParts.forEach(s => s.classList.remove('is-hovered'));
  });
});

function loadHTML(id, filename) {
  fetch(filename)
    .then(response => {
      return response.text();
    })
    .then(text => {
      document.getElementById(id).innerHTML = text;
    })
}

// Ładowanie rzeczy

document.addEventListener("DOMContentLoaded", function() {
  loadHTML("nav-placeholder", "nav.html");
});

document.addEventListener("DOMContentLoaded", function() {
  loadHTML("footer-placeholder", "footer.html");
});

document.addEventListener("DOMContentLoaded", function() {
  loadHTML("hobbies-placeholder", "hobbies.html");
});
