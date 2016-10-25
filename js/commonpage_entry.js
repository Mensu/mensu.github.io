var componentsPath = './components/';
var jQuery = require(componentsPath + 'jquery.js');
var $ = jQuery;
require(componentsPath + 'bootstrap.js')(this, $);
var mensuBlogJs = require(componentsPath + 'mensu-blog.js');
var huxBlogJs = require(componentsPath + 'hux-blog.js');
var tagcloudJs = require(componentsPath + 'jquery.tagcloud.js');
var duoshuoJs = require(componentsPath + 'duoshuo-embed.js');

$(document).ready(function() {
  huxBlogJs(this, $);
  mensuBlogJs(this, $);
  
  if (siteOptions.tagcloud) {
    tagcloudJs(this, $);
    $.fn.tagcloud.defaults = {
        // size: {start: 1, end: 1, unit: 'em'},
        "color": {
          "start": '#bbbbee',
          "end": '#0085a1'
        }
    };
    $('#tag_cloud a').tagcloud();
  }

  if (siteOptions.duoshuoQuery) {
    duoshuoJs();
  }
  if (siteOptions.disqus) {
    window.disqus_config = function() {
      window.page.url = siteOptions.disqus.page.url;
      window.page.identifier = siteOptions.disqus.page.id;
    };
    siteOptions.disqus.count['name'] = 'disqus count';
    scriptLoader(siteOptions.disqus.count);
    scriptLoader({
      "src": siteOptions.disqus.src,
      "name": 'Disqus Comment'
    }, function($script) {
      $script.attr('data-timetamp', new Date());
    }); 
  }
  if (siteOptions.mathjax) {
    scriptLoader({
      "type": 'text/x-mathjax-config',
      "name": 'Mathjax Config'
    }, function($script) {
      $script.text("window.MathJax.Hub.Config({tex2jax: {inlineMath: [['$$','$$'], ['\\\\(','\\\\)']]}});");
    });
    scriptLoader({
      "src": 'https://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS_CHTML',
      "name": 'Mathjax Src',
      "async": true
    });
  }
  
});

function scriptLoader(options, callback) {
  var $script = $('<script>');
  $script.prop('src', options.src);
  if (options.type) {
    $script.prop('type', options.type);
  }
  if (options.async) {
    $script.prop('async', options.async);
    $script.prop('defer', options.async);
  }
  if (callback) {
    callback($script);
  }
  $('body').append('<!-- ' + options.name + ' starts -->')
           .append($script)
           .append('<!-- ' + options.name + ' ends -->');
}
