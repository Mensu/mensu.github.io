/* like button */

// keep "like" button on the same line as "share to"
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
    modifyShareTo();
  }

  // raise "like" button
  var currentDistance_dsShare_dsThread = class_dsShare[0].offsetTop - class_dsThread[0].offsetTop - 5 + "px";
  if (previousDistance_dsShare_dsThread != currentDistance_dsShare_dsThread) {
    previousDistance_dsShare_dsThread = class_dsMeta[0].style.top = currentDistance_dsShare_dsThread;
  }

  // change the offset of "share to" as the width of "like" button changes
  var class_dsMeta_currentWidth = class_dsMeta[0].clientWidth;
  if (class_dsMeta_previousWidth != class_dsMeta_currentWidth) {
    class_pseudoDsMeta[0].style.width = (class_dsMeta_currentWidth > 0) ? (class_dsMeta_currentWidth + 20 + "px") : "0";
    class_dsMeta_previousWidth = class_dsMeta_currentWidth;
  }

}, 60);


/* share to */

function modifyShareTo() {
  // make sure to get the "share to" element
  var class_dsShareIcons = undefined;
  while (typeof(class_dsShareIcons) == "undefined") class_dsShareIcons = document.getElementsByClassName("ds-share-icons-16");

  // fix "undefined" problem, translate the names of the sites to English
  document.getElementsByClassName("ds-weibo")[1].innerHTML = "Sina Weibo";
  document.getElementsByClassName("ds-qzone")[0].innerHTML = "Qzone";
  document.getElementsByClassName("ds-qqt")[0].innerHTML = "Tencent Weibo";
  document.getElementsByClassName("ds-douban")[0].innerHTML = "Douban";
  document.getElementsByClassName("ds-google")[0].innerHTML = "Google+";
  document.getElementsByClassName("ds-youdao")[0].innerHTML = "Youdao CloudNote";
  document.getElementsByClassName("ds-weibo flat")[0].innerHTML = "Weibo";
  document.getElementsByClassName("ds-more")[0].innerHTML = "Share to";
  document.getElementsByClassName("ds-thread-cancel-like")[0].innerHTML = "Cancel like";

  // remove sites that are not famous from "share to"
  var sitesToBeRemoved = new Array("ds-sohu", "ds-renren", "ds-netease", "ds-kaixin", "ds-meilishuo", "ds-mogujie", "ds-baidu", "ds-taobao", "ds-wechat", "ds-diandian", "ds-huaban", "ds-duitang", "ds-pengyou", "ds-msn");
  for (var i = 0; i < sitesToBeRemoved.length; i++) (function(name) {
    var toBeRemoved = document.getElementsByClassName(name)[0].parentNode;
  toBeRemoved.parentNode.removeChild(toBeRemoved);
  }(sitesToBeRemoved[i]));
}


/* back to top button */

var backToTop = document.getElementById("backtotop");
var addEventListenerExistence = window.addEventListener;
if (typeof(addEventListenerExistence) != "undefined") {
  backToTop.addEventListener('click', function () {
    var documentBody = document.body;
    var pace = documentBody.scrollTop / 12.5;
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
