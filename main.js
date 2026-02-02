
function loadHTML(id, filename) {
  fetch(filename)
    .then(response => {
      return response.text();
    })
    .then(text => {
      document.getElementById(id).innerHTML = text;
    })
}

document.addEventListener("DOMContentLoaded", function() {
  loadHTML("nav-placeholder", "nav.html");
});

document.addEventListener("DOMContentLoaded", function() {
  loadHTML("footer-placeholder", "footer.html");
});

document.addEventListener("DOMContentLoaded", function() {
  loadHTML("hobbies-placeholder", "hobbies.html");
});