var config = require('./diffConfig.js');
var createElementWith = require('./createElementWith.js');
var $ = require('./jquery-3.1.0.js');
require('./bootstrap.js')(this, $);
function drawDiagonalK(yLength, xLength) {
  var bg = document.getElementById('bg');
  var wrapper = bg.appendChild(createElementWith('div', 'diagonal-k-wrapper'));
  for (var k = -yLength; k <= xLength; ++k) {
    var length = ((k < 0) ? (yLength + k + 2) : (xLength - k + 2)) * 1.414 * config.cellHeight;
    var diagonalK = createElementWith('div', 'diagonal-k', '');
    var x = k < 0 ? -1 : k - 1, y = k < 0 ? -1 - k : -1;
    diagonalK.style.left = (x * config.cellWidth + 2) + 'px', diagonalK.style.top = (y * config.cellHeight - 2) + 'px';
    diagonalK.style.width = length + 'px';
    $(diagonalK).tooltip({
      "placement": 'mouse',
      "container": 'body',
      "title": 'diagonal ' + k
    });
    wrapper.appendChild(diagonalK);
  }
}
function drawPoints(xStr, yStr) {
  var bg = document.getElementById('bg');
  var wrapper = bg.appendChild(createElementWith('div', 'points-wrapper'));
  for (var x = 0; x <= xStr.length; ++x) {
    for (var y = 0; y <= yStr.length; ++y) {
      var pointX = createElementWith('div', 'point-inner');
      var pointY = createElementWith('div', 'point-inner', pointX);
      var pointWrapper = createElementWith('div', 'point-wrapper', pointY);
      pointWrapper.style.left = x * config.cellWidth - config.cellWidth / 8 + 'px', pointWrapper.style.top = y * config.cellHeight - config.cellHeight / 8 + 'px';
      $(pointX).tooltip({
        "placement": 'top',
        "container": 'body',
        "title": '"' + (x ? xStr[x - 1] : '') + '"'
      });
      $(pointY).tooltip({
        "placement": 'left',
        "container": 'body',
        "title": '"' + (y ? yStr[y - 1] : '') + '"'
      });
      $(pointWrapper).tooltip({
        "placement": 'bottom',
        "container": 'body',
        "title": '( ' + x + ' ,  ' + y + ' )\ndiagonal ' + (x - y)
      });
      wrapper.appendChild(pointWrapper);
    }
  }
}
function getXAxis(str) {
  var xAxisWrapper = createElementWith('div');
  xAxisWrapper.id = 'x-axis-wrapper';
  var xAxis = createElementWith('div');
  xAxis.id = 'x-axis';
  for (var i in str) {
    xAxis.appendChild(createElementWith('div', ['axis-cell', 'x-axis-cell'], str[i]));
  }
  xAxisWrapper.appendChild(xAxis);
  return xAxisWrapper;
}
function getYAxis(str) {
  var yAxisWrapper = createElementWith('div');
  yAxisWrapper.id = 'y-axis-wrapper';
  var yAxis = createElementWith('div');
  yAxis.id = 'y-axis';
  for (var i in str) {
    yAxis.appendChild(createElementWith('div', ['axis-cell', 'y-axis-cell'], str[i]));
  }
  yAxisWrapper.appendChild(yAxis);
  return yAxisWrapper;
}
function updateTable1(xStr, yStr) {
  var parent = document.getElementById('main');
  var old = parent.querySelector('#bg');
  if (old) parent.removeChild(old);
  var cur = createElementWith('div');
  cur.id = 'bg';
  cur.style.height = yStr.length * config.cellWidth + 'px';
  cur.style.width = xStr.length * config.cellHeight + 'px';
  cur.appendChild(getXAxis(xStr)), cur.appendChild(getYAxis(yStr)), cur.appendChild(createElementWith('div', 'arrows-wrapper'));
  parent.insertBefore(cur, parent.firstChild);
  drawDiagonalK(yStr.length, xStr.length);
  drawPoints(xStr, yStr);
  return cur;
}
var updateTable = function(xStr, yStr) {
  var $parent = $('#main');
  var $old = $parent.find('#bg');
  if ($old.length) $parent.remove('#bg');
  // var cur = createElementWith('div');
  // cur.id = 'bg';
  // cur.style.height = yStr.length * config.cellWidth + 'px';
  // cur.style.width = xStr.length * config.cellHeight + 'px';
  var $cur = $('<div></div>', {
    "id": 'bg',
  }).css({
    "width": xStr.length * config.cellHeight + 'px',
    "height": yStr.length * config.cellWidth + 'px'
  }).append([
    getXAxis(xStr),
    getYAxis(yStr),
    $('<div></div>').addClass('arrows-wrapper')
  ]);
  // cur.appendChild(getXAxis(xStr)), cur.appendChild(getYAxis(yStr)), cur.appendChild(createElementWith('div', 'arrows-wrapper'));
  $parent.prepend($cur);
  drawDiagonalK(yStr.length, xStr.length);
  drawPoints(xStr, yStr);
  return $cur;
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
    exports['updateTable'] = factory();
  else
    root['updateTable'] = factory();
})(this, function factory() {
  return updateTable;
});

