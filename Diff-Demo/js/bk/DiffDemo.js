var DiffType = {
  "removed": -1,
  "common": 0,
  "added": 1
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
    exports['DiffDemo'] = factory();
  else
    root['DiffDemo'] = factory();
})(this, function factory() {
  return {
    "DiffType": DiffType
  };
});
