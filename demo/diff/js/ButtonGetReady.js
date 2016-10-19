var pushing = false;
var pushingId = null;
var autoShowId = null;
var interval = 2000;

var ButtonGetReady = {
  "next": function() {
    if (!pushing && !autoShowId) {
      pushing = true, pushingId = setTimeout(function() {
        pushing = false, pushingId = null;
      }, interval);
      return true;
    } else {
      return false;
    }
  },
  "clear": function() {
    clearInterval(autoShowId), clearTimeout(pushingId), autoShowId = pushingId = null, pushing = false;
  },
  "auto": function(resultStack) {
    if (autoShowId !== null) clearTimeout(autoShowId), autoShowId = null;
    function autoFunc() {
      if (false == resultStack.push()) {
        return console.log('It was the last step.'), clearTimeout(autoShowId), autoShowId = null;
      } else {
        return autoShowId = setTimeout(autoFunc, interval);
      }
    }
    autoShowId = setTimeout(autoFunc, interval);
  },
  "setSpeed": function(newSpeed) {
    if (!isNaN(parseInt(newSpeed))) interval = newSpeed;
  }
};

(function exportModuleUniversally(root, factory) {
  if (typeof(exports) === 'object' && typeof(module) === 'object')
    module.exports = factory();
  else if (typeof(define) === 'function' && define.amd)
    define(factory);
  /* amd  // module name: diff
    define([other dependent modules, ...], function(other dependent modules, ...)) {
      return exported object;
    });
    usage: require([required modules, ...], function(required modules, ...) {
      // codes using required modules
    });
  */
  else if (typeof(exports) === 'object')
    exports['ButtonGetReady'] = factory();
  else
    root['ButtonGetReady'] = factory();
})(this, function factory() {
  return ButtonGetReady;
});

