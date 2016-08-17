var config = {
  "cellHeight": 50,
  "cellWidth": 50,
  "oldStr": 'abcabba',
  "newStr": 'cbabac'
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
    exports['diffConfig'] = factory();
  else
    root['diffConfig'] = factory();
})(this, function factory() {
  return config;
});
