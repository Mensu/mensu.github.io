$(document).ready(function() {
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
  