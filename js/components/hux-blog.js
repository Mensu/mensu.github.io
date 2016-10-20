/*!
 * Clean Blog v1.0.0 (http://startbootstrap.com)
 * Copyright 2015 Start Bootstrap
 * Licensed under Apache 2.0 (https://github.com/IronSummitMedia/startbootstrap/blob/gh-pages/LICENSE)
 */

 /*!
 * Hux Blog v1.6.0 (http://startbootstrap.com)
 * Copyright 2016 @huxpro
 * Licensed under Apache 2.0 
 */

// Tooltip Init
// Unuse by Hux since V1.6: Titles now display by default so there is no need for tooltip
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
  $(document).ready(function() {
    $("[data-toggle='tooltip']").tooltip();
    require('./top-nav.js')(this, $);
    // var FastClickAttach = require('./fastclick.min.js');
    // var $nav = $('nav');
    // if ($nav.length) {
    //   FastClickAttach($nav[0]);
    // }
  });
  
});
