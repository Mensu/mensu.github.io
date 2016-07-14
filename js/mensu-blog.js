/* like button */

// keep "like" button on the same line as "share on"
var previousDistance_dsShare_dsThread = "0px", class_dsMeta_previousWidth = 0;
var dsElementsReady = false;
var class_pseudoDsMeta, class_dsShare, class_dsThread, class_dsMeta;
setInterval(function () {
  // make sure elements needed have been properly gotten
  if (!dsElementsReady) {
    class_pseudoDsMeta = document.getElementsByClassName("pseudo-ds-meta");
    class_dsShare = document.getElementsByClassName("ds-share"),
    class_dsThread = document.getElementsByClassName("ds-thread");
    class_dsMeta = document.getElementsByClassName("ds-meta");
    if (typeof(class_dsMeta[0]) == "undefined" || typeof(class_pseudoDsMeta[0]) == "undefined") return;
    else dsElementsReady = true;
    modifyShareOn();
  }

  // raise "like" button
  var currentDistance_dsShare_dsThread = class_dsShare[0].offsetTop - class_dsThread[0].offsetTop - 5 + "px";
  if (previousDistance_dsShare_dsThread != currentDistance_dsShare_dsThread) {
    previousDistance_dsShare_dsThread = class_dsMeta[0].style.top = currentDistance_dsShare_dsThread;
  }

  // change the offset of "share on" as the width of "like" button changes
  var class_dsMeta_currentWidth = class_dsMeta[0].clientWidth;
  if (class_dsMeta_previousWidth != class_dsMeta_currentWidth) {
    class_pseudoDsMeta[0].style.width = (class_dsMeta_currentWidth > 0) ? (class_dsMeta_currentWidth + 20 + "px") : "0";
    class_dsMeta_previousWidth = class_dsMeta_currentWidth;
  }

}, 60);


/* share on */

function modifyShareOn() {
  // make sure to get the "share on" element
  var class_dsShareIcons = undefined;
  while (typeof(class_dsShareIcons) == "undefined") class_dsShareIcons = document.getElementsByClassName("ds-share-icons-16");

  // fix "undefined" problem
  document.getElementsByClassName("ds-douban")[0].innerHTML = "Douban";
  document.getElementsByClassName("ds-youdao")[0].innerHTML = "Youdao CloudNote";
  // document.getElementsByClassName("ds-more")[0].innerHTML = "Share on";
}


/* back to top button */

var backToTop = document.getElementById("backtotop");
var addEventListenerExistence = window.addEventListener;
if (typeof(addEventListenerExistence) != "undefined") {
  backToTop.addEventListener('click', function () {
    var documentBody = document.body;
    var distanceFromTop = documentBody.scrollTop;
    var pace = distanceFromTop / 12.5;
    window.requestAnimationFrame((function () {
      var calculatedScrollTop = parseInt(documentBody.scrollTop) - pace;
      documentBody.scrollTop = ((calculatedScrollTop < 0) ? 0 : calculatedScrollTop);
      if (parseInt(documentBody.scrollTop) > 0) window.requestAnimationFrame(arguments.callee);
    }));
  }, false);
}
else {
  backToTop.attachEvent('onclick', function () {
    var documentBody = document.body;
    var pace = documentBody.scrollTop / 12.5;
    
  });
}

/* gif view again */
var viewAgains = document.getElementsByClassName("view-again");
for (var i = 0; i < viewAgains.length; i++) {
  var viewAgain = viewAgains[i];
  viewAgain.addEventListener('click', function() {
    var img = this.parentNode.nextElementSibling.firstChild;
    var imgSrc = img.src;
    img.src = "https://www.baidu.com/img/bd_logo1.png";
    img.src = imgSrc;
  }, false);
}
