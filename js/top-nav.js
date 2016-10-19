var toggle = document.querySelector('.navbar-toggle');
var navbar = document.querySelector('#huxblog_navbar');
var collapse = document.querySelector('.navbar-collapse');

toggle.addEventListener('click', handleMagic, false);
function handleMagic(e) {
    if (navbar.className.indexOf('in') > 0) {
        // CLOSE
        navbar.className = " ";
        // wait until animation end.
        setTimeout(function() {
            // prevent frequently toggle
            if (navbar.className.indexOf('in') < 0) {
                collapse.style.height = "0px";
            }
        }, 400);
    } else {
        // OPEN
        collapse.style.height = "auto";
        navbar.className += " in";
    }
}
