
function loadHTML(id, filename) {
  fetch(filename)
    .then(response => {
      return response.text();
    })
    .then(text => {
      document.getElementById(id).innerHTML = text;
    })
    .catch(error => {
      console.log('Error loading the file:', error);
    });
}


document.addEventListener("DOMContentLoaded", function() {
  loadHTML("footer-placeholder", "footer.html");
});