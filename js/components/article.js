var hljs = require('./highlight.pack.js');
var anchors = require('./anchor.min.js');
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
      return factory(jQuery);
    };
  } else if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['./jquery.js'], factory);
  } else {
    // Browser globals
    factory(jQuery);
  }
})(function ($) {
  $(document).ready(function() {

      // highlight code area
      var lanMap = {
        "language-kramdown": 'language-markdown',
        "language-git": 'language-bash',
        'language-liquid': 'language-django'
      };
      $('.post-container > div.highlighter-rouge, .post-container > pre code').each(function(i, e) {
        var code = $(this);
        if (code.prop('tagName').toLowerCase() != 'code') code = code.find('code');
        var result = $(this).prop('className').match(/language-[\w]{1,}/);
        // remove '\n'
        var codeText = code.text();
        if (codeText[codeText.length - 1] == '\n') {
          code.text(codeText.slice(0, -1));
        }
        if (result) {
          var classToAdd = lanMap[result[0].toLowerCase()] || result[0];
          code.removeClass(result[0]);
          code.addClass(classToAdd);
          hljs.highlightBlock(code[0]);
        } else {
          code.addClass('hljs');
          hljs.addLinenum(code[0]);
        }
      });
    });

    // anchors
    anchors.options = {
      visible: 'always',
      placement: 'right',
      icon: '#'
    };

    // side-catalog
    function generateCatalog(catalogSelector, titleSelector) {
        var P = $('div.post-container'),a,n,t,l,i,c;
        a = P.find(titleSelector);
        a.each(function () {
            n = $(this).prop('tagName').toLowerCase();
            i = "#"+$(this).prop('id');
            t = $(this).text();
            c = $('<a href="'+i+'" rel="nofollow">'+t+'</a>');
            l = $('<li class="'+n+'_nav"></li>').append(c);
            $(catalogSelector).append(l);
        });
        $(catalogSelector).onePageNav({
          currentClass: "active",
          changeHash: !1,
          easing: "swing",
          filter: "",
          scrollSpeed: 700,
          scrollOffset: 100,
          scrollThreshold: 0,
          begin: null,
          end: null,
          scrollChange: null,
          endSelector: '#article-end-anchor',
          unbindSelector: null
        }); 
        // toggle side catalog
        $('.catalog-toggle').click((function(e){
            e.preventDefault();
            $('.side-catalog').toggleClass('fold');
        }));
    }
    return {
      "generateCatalog": generateCatalog,
      "anchors": anchors
    };
});