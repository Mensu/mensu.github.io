(function (factory) {
  if (typeof module === 'object' && module.exports) {
    // Node/CommonJS
    module.exports = function( root, jQuery ) {
      if ( jQuery === undefined ) {
        // require('jQuery') returns a factory that requires window to
        // build a jQuery instance, we normalize how we use modules
        // that require this pattern but the window provided is a noop
        // if it's defined (how jquery works)
        if ( typeof window !== 'undefined' ) {
          jQuery = require('./jquery.js');
        }
        else {
          jQuery = require('./jquery.js')(root);
        }
      }
      factory(jQuery);
      return jQuery;
    };
  } if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['./jquery.js'], factory);
  } else {
    // Browser globals
    factory(jQuery);
  }
})(function ($) {
    /* like button */
    // keep "like" button on the same line as "share on"
    var previousDistance_dsShare_dsThread = "0px", class_dsMeta_previousWidth = 0;
    var dsElementsReady = false;
    var $pseudoDsMeta = null, $dsShare = null, $dsThread = null, $dsMeta = null;
    $(document).ready(function() {
      $pseudoDsMeta = $('.pseudo-ds-meta');
      $dsShare = $('.ds-share'),
      $dsThread = $('.ds-thread');
      $dsMeta = $('.ds-meta');
      modifyShareOn();
    });
    $('body').on('resize', function() {
      // raise "like" button
      var currentDistance_dsShare_dsThread = $dsShare[0].offsetTop - $dsThread[0].offsetTop - 5 + "px";
      if (previousDistance_dsShare_dsThread != currentDistance_dsShare_dsThread) {
        previousDistance_dsShare_dsThread = $dsMeta[0].style.top = currentDistance_dsShare_dsThread;
      }

      // change the offset of "share on" as the width of "like" button changes
      var class_dsMeta_currentWidth = class_dsMeta[0].clientWidth;
      if (class_dsMeta_previousWidth != class_dsMeta_currentWidth) {
        $pseudoDsMeta[0].style.width = (class_dsMeta_currentWidth > 0) ? (class_dsMeta_currentWidth + 20 + "px") : "0";
        class_dsMeta_previousWidth = class_dsMeta_currentWidth;
      }
    });


    /* share on */
    function modifyShareOn() {
      // fix "undefined" problem
      $('ul.ds-share-icons-16').on('mouseover', function() {
        $('.ds-douban').text('Douban')
        $('.ds-youdao').text('Youdao CloudNote');
        $('ul.ds-share-icons-16').off('mouseover');
      });
    }


    /* back to top button */
    var $backToTop = $('#backtotop');
    $backToTop.on('click', function () {
        var documentBody = document.body;
        var distanceFromTop = documentBody.scrollTop;
        var time = distanceFromTop / 30;
        if (time > 1500) time = 1500;
        else if (time < 200) time = 200;
        $('body').animate({
          scrollTop: 0
        }, time, 'swing');
        // window.requestAnimationFrame((function() {
        //   var calculatedScrollTop = parseInt(documentBody.scrollTop) - pace;
        //   documentBody.scrollTop = ((calculatedScrollTop < 0) ? 0 : calculatedScrollTop);
        //   if (parseInt(documentBody.scrollTop) > 0) window.requestAnimationFrame(arguments.callee);
        // }));
      // }, false);
    });

    /* gif view again */
    $('.view-again').on('click', function() {
      var img = this.parentNode.nextElementSibling.firstChild;
      var imgSrc = img.src;
      img.src = "https://www.baidu.com/img/bd_logo1.png";
      img.src = imgSrc;
    });
});
