function OffsetArr(halfSize, initValue) {
  this.halfSize = halfSize;
  this.storage = new Array(2 * this.halfSize + 1);
  for (var i = 0; i <= this.halfSize; ++i) this.storage[i] = this.storage[i + this.halfSize] = initValue;
}
OffsetArr.prototype = {
  "constructor": OffsetArr,
  "at": function(index) {
    return this.storage[this.halfSize + index];
  },
  "set": function(index, value) {
    return this.storage[this.halfSize + index] = value;
  }
};


function OffsetTable(size, halfSize, initValue) {
  this.storage = new Array(size + 1);
  for (var i = 0; i <= size; ++i) this.storage[i] = new OffsetArr(halfSize, initValue);
}
OffsetTable.prototype = {
  "constructor": OffsetTable,
  "at": function(index1, index2) {
    return this.storage[index1 > 0 ? index1 : 0].at(index2);
  },
  "set": function(index1, index2, value) {
    return this.storage[index1 > 0 ? index1 : 0].set(index2, value);
  }
};
OffsetTable['OffsetArr'] = OffsetArr;

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
    exports['OffsetTable'] = factory();
  else
    root['OffsetTable'] = factory();
})(this, function factory() {
  return OffsetTable;
});
