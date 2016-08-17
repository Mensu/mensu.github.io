/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	var updateTableBg = __webpack_require__(1);
	var OffsetArray = __webpack_require__(3);
	var OneDiff = __webpack_require__(4);
	var ShowResultStack = __webpack_require__(6);
	var config = __webpack_require__(2);

	var string1 = config.oldStr, string2 = config.newStr;

	var scrollToLatest = document.getElementById('scrollToLatest');
	var toScrollToLastestLog = scrollToLatest.checked;
	scrollToLatest.addEventListener('change', function() {
	  toScrollToLastestLog = this.checked;
	}, false);



	// function drawBasicAlgorithm(before, after) {
	//   var beforeLength = before.length;
	//   var afterLength = after.length;
	//   // if (beforeLength == 0) {
	//   //   for (var i in after) drawOneDiff(0, i, DiffType.added);
	//   //   return;
	//   // } else if (afterLength == 0) {
	//   //   for (var i in before) drawOneDiff(i, 0, DiffType.removed);
	//   //   return;
	//   // }
	//   var DMax = beforeLength + afterLength;
	//   var kStartOffset = 0, kEndOffset = 0;
	//   var pathX = new OffsetArray(DMax, -1);
	//   pathX.set(1, 0);
	//   for (var D = 0; D <= DMax; ++D) {
	//     for (var k = -D + kStartOffset; k <= D - kEndOffset; k += 2) {
	//       var newX = null;
	//       if (k == -D || (k != D && pathX.at(k - 1) < pathX.at(k + 1))) {
	//         newX = pathX.at(k + 1);
	//         if (D) drawOneDiff(newX, newX - k - 1, DiffType.added);
	//       } else {
	//         newX = pathX.at(k - 1) + 1;
	//         drawOneDiff(newX - 1, newX - k, DiffType.removed);
	//       }
	//       var newY = newX - k;
	      
	//       while (newX < beforeLength && newY < afterLength && before[newX] == after[newY]) {
	//         drawOneDiff(newX++, newY++, DiffType.common);
	//       }
	//       if (newX > beforeLength) kEndOffset += 2;
	//       else if (newY > afterLength) kStartOffset += 2;
	//       else if (newX == beforeLength && newY == afterLength) {
	//         return D;
	//       }
	//       pathX.set(k, newX);
	//     }
	//   }
	//   throw new Error("Max D not found");
	// }


	function getBasicAlgorithmSteps(before, after) {
	  var beforeLength = before.length;
	  var afterLength = after.length;
	  var ret = new Array();
	  if (beforeLength == 0) {
	    for (var i in after) ret.push(new OneDiff(0, i, DiffType.added, parseInt(i) + 1));
	    return ret;
	  } else if (afterLength == 0) {
	    for (var i in before) ret.push(new OneDiff(i, 0, DiffType.removed, parseInt(i) + 1));
	    return ret;
	  }
	  var DMax = beforeLength + afterLength;
	  var kStartOffset = 0, kEndOffset = 0;
	  var pathX = new OffsetArray(DMax, -1);
	  pathX.set(1, 0);
	  for (var D = 0; D <= DMax; ++D) {
	    for (var k = -D + kStartOffset; k <= D - kEndOffset; k += 2) {
	      var newX = null;
	      if (k == -D || (k != D && pathX.at(k - 1) < pathX.at(k + 1))) {
	        newX = pathX.at(k + 1);
	        if (D) ret.push(new OneDiff(newX, newX - k - 1, DiffType.added, D));
	      } else {
	        newX = pathX.at(k - 1) + 1;
	        ret.push(new OneDiff(newX - 1, newX - k, DiffType.removed, D));
	      }
	      var newY = newX - k;
	      
	      while (newX < beforeLength && newY < afterLength && before[newX] == after[newY]) {
	        ret.push(new OneDiff(newX++, newY++, DiffType.common, D));
	      }
	      if (newX > beforeLength) kEndOffset += 2;
	      else if (newY > afterLength) kStartOffset += 2;
	      else if (newX == beforeLength && newY == afterLength) {
	        return ret;
	      }
	      pathX.set(k, newX);
	    }
	  }
	  throw new Error("Max D not found");
	}


	updateTableBg(string1, string2);
	var resultStack = new ShowResultStack(getBasicAlgorithmSteps(string1, string2));
	var pushing = false;
	var pushingId = null;
	var autoShowId = null;
	function show() {
	  if (!pushing && !autoShowId) {
	    pushing = true;
	    pushingId = setTimeout(function() { return pushingId = null, pushing = false; }, 2000);
	    if (!resultStack.push()) return console.log('It was the last step.'), false;
	  }
	}
	document.getElementById('next').addEventListener('click', show, false);
	document.getElementById('prev').addEventListener('click', function() {
	  clearInterval(autoShowId), clearTimeout(pushingId), autoShowId = pushingId = null, pushing = false; 
	  if (!resultStack.pop()) console.log('It was the first step.');
	}, false);
	function clear() {
	  updateTableBg(string1, string2);
	  resultStack.clear();
	  if (autoShowId !== null) clearInterval(autoShowId), autoShowId = null;
	}
	document.getElementById('clear').addEventListener('click', clear, false);
	document.getElementById('ok').addEventListener('click', function() {
	  string1 = document.getElementById('string1').value;
	  string2 = document.getElementById('string2').value;
	  clear();
	  resultStack = new ShowResultStack(getBasicAlgorithmSteps(string1, string2));
	}, false);

	function autoShow() {
	  return setInterval(function() {
	    if (!resultStack.push()) return console.log('It was the last step.'), clearInterval(autoShowId), autoShowId = null;
	  }, 2000);
	}
	document.getElementById('auto').addEventListener('click', function() {
	  if (autoShowId !== null) clearInterval(autoShowId), autoShowId = null;
	  autoShowId = autoShow();
	}, false);


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	var config = __webpack_require__(2);

	function drawDiagonalK(yLength, xLength) {
	  var bg = document.getElementById('bg');
	  for (var k = -yLength; k <= xLength; ++k) {
	    var length = ((k < 0) ? (yLength + k + 2) : (xLength - k + 2)) * 1.414 * config.cellHeight;
	    var diagonalK = createElementWith('div', 'diagonal-k', '');
	    var x = k < 0 ? -1 : k - 1, y = k < 0 ? -1 - k : -1;
	    diagonalK.style.left = (x * config.cellWidth + 2) + 'px', diagonalK.style.top = (y * config.cellHeight - 2) + 'px';
	    diagonalK.style.width = length + 'px';
	    bg.appendChild(diagonalK);
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
	function updateTable(xStr, yStr) {
	  var parent = document.getElementById('main');
	  var old = parent.querySelector('#bg');
	  if (old) parent.removeChild(old);
	  var cur = createElementWith('div');
	  cur.id = 'bg';
	  cur.style.height = yStr.length * config.cellWidth + 'px';
	  cur.style.width = xStr.length * config.cellHeight + 'px';
	  cur.appendChild(getXAxis(xStr)), cur.appendChild(getYAxis(yStr));
	  parent.insertBefore(cur, parent.firstChild);
	  drawDiagonalK(yStr.length, xStr.length);
	  return cur;
	}
	(function exportModuleUniversally(root, factory) {
	  if (true)
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



/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	var config = {
	  "cellHeight": 76,
	  "cellWidth": 76,
	  "oldStr": 'gergfxas',
	  "newStr": 'hbcvtesa'
	};
	(function exportModuleUniversally(root, factory) {
	  if (true)
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
	  return ;
	});


/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	function OffsetArray(halfSize, initValue) {
	  this.halfSize = halfSize;
	  this.storage = new Array(2 * this.halfSize + 1);
	  for (var i = 0; i <= this.halfSize; ++i) this.storage[i] = this.storage[i + this.halfSize] = initValue;
	}
	OffsetArray.prototype = {
	  "at": function(index) {
	    return this.storage[this.halfSize + index];
	  },
	  "set": function(index, value) {
	    return this.storage[this.halfSize + index] = value;
	  }
	};
	OffsetArray.prototype.constructor = OffsetArray;

	(function exportModuleUniversally(root, factory) {
	  if (true)
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
	    exports['OffsetArray'] = factory();
	  else
	    root['OffsetArray'] = factory();
	})(this, function factory() {
	  return OffsetArray;
	});


/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	var config = __webpack_require__(2);
	var createElementWith = __webpack_require__(5);
	var DiffType = {
	  "removed": -1,
	  "common": 0,
	  "added": 1
	};
	function drawDiagonalLine(x, y, red) {
	  var bg = document.getElementById('bg');
	  var diagonalLineBox = createElementWith('div', ['diagonal-line', 'diagonal-line-' + (red ? 'red' : 'black')]);
	  diagonalLineBox.style.left = x * config.cellWidth + 'px', diagonalLineBox.style.top = y * config.cellHeight + 'px';
	  bg.appendChild(diagonalLineBox);
	  return diagonalLineBox;
	}
	function drawHorizontalLine(x, y, red) {
	  var bg = document.getElementById('bg');
	  var horizontalLineBox = createElementWith('div', ['horizontal-line', 'horizontal-line-' + (red ? 'red' : 'black')]);
	  horizontalLineBox.style.left = (parseFloat(x * config.cellWidth)) + 'px', horizontalLineBox.style.top = (parseFloat(y * config.cellHeight) - parseFloat(28 / 2)) + 'px';
	  bg.appendChild(horizontalLineBox);
	  return horizontalLineBox;
	}
	function drawVerticalLine(x, y, red) {
	  var bg = document.getElementById('bg');
	  var verticalLineBox = createElementWith('div', ['vertical-line', 'vertical-line-' + (red ? 'red' : 'black')]);
	  verticalLineBox.style.left = (parseFloat(x * config.cellWidth) + 1 - parseFloat(28 / 2)) + 'px', verticalLineBox.style.top = (parseFloat(y * config.cellHeight)) + 'px';
	  bg.appendChild(verticalLineBox);
	  return verticalLineBox;
	}
	function drawOneDiff(x, y, diffType, red) {
	  var func = null;
	  if (diffType == DiffType.removed) func = drawHorizontalLine;
	  else if (diffType == DiffType.common) func = drawDiagonalLine;
	  else if (diffType == DiffType.added) func = drawVerticalLine;
	  return func(x, y, red);
	}

	function OneDiff(x, y, type, d) {
	  this.x = x;
	  this.y = y;
	  this.type = type;
	  this.d = d;
	}
	OneDiff.prototype = {
	  "drawFunc": {},

	  "createEndPointSpan": function(endX, endY) {
	    return createElementWith('span', 'log-info-snake-end-point',
	              [
	                createElementWith('span', 'log-info-snake-end-point-text', '(' + endX + ', ' + endY + ')'),
	                createElementWith('span', ['log-info-snake-end-point-json', 'hidden'], '{"endX":' + endX + ',"endY":' + endY + '}')
	              ]
	            );
	  },

	  "createSnakeSpan": function(endX, endY) {
	    return createElementWith('span', ['log-info-snake', 'hidden'],
	              [
	                createElementWith('span', 'log-info-snake-plus', ' + '),
	                createElementWith('span', 'log-info-snake-num', '0'),
	                createElementWith('span', 'log-info-snake-text', '-length snake to '),
	                this.createEndPointSpan(endX, endY)
	              ]
	            );
	  },

	  "logInfo": function(red) {
	    var log = document.getElementById('log');
	    var oneInfo = null;
	    if (log.querySelector('.log-info') === null) log.appendChild(createElementWith('div', 'log-info',
	        [
	          createElementWith('span', ['log-info-d-path-on-diagonal-k', 'log-info-d-path-on-diagonal-k-black'], '0-path on diagonal 0:   (0, 0)'),
	          this.createSnakeSpan(0, 0)
	        ]
	      )
	    );
	    if (this.type) {
	      var endX = parseInt(this.x) + (this.type == DiffType.removed), endY = parseInt(this.y) + (this.type == DiffType.added);
	      var summary = createElementWith('span', ['log-info-d-path-on-diagonal-k', 'log-info-d-path-on-diagonal-k-' + (red ? 'red' : 'black')], this.d + '-path on diagonal ' + (endX - endY) + ':   ');
	      var modifyPath = createElementWith('div', 'log-info-modify-path',
	                            [
	                              createElementWith('div', 'log-info-modify-path-start-point', '(' + this.x + ', ' + this.y + ')'),
	                              createElementWith('div', ['log-info-modify-path-arrow', (this.type == DiffType.removed ? 'horizontal-arrow' : 'vertical-arrow')]),
	                              createElementWith('div', 'log-info-modify-path-end-point', '(' + endX + ', ' + endY + ')')
	                            ]
	                          );
	      oneInfo = createElementWith('div', 'log-info',
	        [
	          summary, modifyPath, this.createSnakeSpan(endX, endY)
	        ]
	      );
	    } else {
	      var snakeSpan = log.lastElementChild.querySelector('.log-info-snake');
	      var numSpan = snakeSpan.querySelector('.log-info-snake-num'), endPointSpan = snakeSpan.querySelector('.log-info-snake-end-point');
	      snakeSpan.classList.remove('hidden');
	      numSpan.textContent = parseInt(numSpan.textContent) + 1;
	      var endPointJson = JSON.parse(endPointSpan.querySelector('.log-info-snake-end-point-json').textContent);
	      var endX = parseInt(endPointJson.endX) + 1, endY = parseInt(endPointJson.endY) + 1;
	      snakeSpan.removeChild(endPointSpan);
	      snakeSpan.appendChild(this.createEndPointSpan(endX, endY));
	    }
	    if (oneInfo) {
	      if (log.lastElementChild && ~log.lastElementChild.className.indexOf(red ? 'black' : 'red')) log.appendChild(createElementWith('br'));
	      log.appendChild(oneInfo);
	      if (toScrollToLastestLog) oneInfo.scrollIntoView();
	    };
	    
	  },

	  "unlogInfo": function() {
	    var log = document.getElementById('log');
	    if (log.lastElementChild) {
	      var snakeSpan = log.lastElementChild.querySelector('.log-info-snake');
	      var numSpan = snakeSpan.querySelector('.log-info-snake-num'), endPointSpan = snakeSpan.querySelector('.log-info-snake-end-point');
	      var curNum = parseInt(numSpan.textContent) - 1;
	      var endPointJson = JSON.parse(endPointSpan.querySelector('.log-info-snake-end-point-json').textContent);
	      if (curNum == -1) {
	        log.removeChild(log.lastElementChild);
	      } else {
	        if (curNum == 0) snakeSpan.classList.add('hidden');
	        var endX = parseInt(endPointJson.endX) - 1, endY = parseInt(endPointJson.endY) - 1;
	        numSpan.textContent = curNum;
	        snakeSpan.removeChild(endPointSpan);
	        snakeSpan.appendChild(this.createEndPointSpan(endX, endY));
	      }
	      if (log.querySelectorAll('.log-info').length == 1) {
	        if (log.querySelector('.log-info').querySelector('.log-info-snake') === null || log.querySelector('.log-info').querySelector('.log-info-snake.hidden')) log.removeChild(log.lastElementChild);
	        return;
	      }
	    }
	  },

	  "draw": function() {
	    if (this.element === undefined) this['element'] = {};
	    this.logInfo(this.d & 1);
	    this.element['arrow'] = this.drawFunc[this.type](this.x, this.y, this.d & 1);
	  },

	  "removeSelf": function() {
	    this.element.arrow.parentNode.removeChild(this.element.arrow);
	    this.element.arrow = undefined;
	    this.unlogInfo();
	  }

	};
	OneDiff.prototype.drawFunc[DiffType.removed] = drawHorizontalLine;
	OneDiff.prototype.drawFunc[DiffType.common] = drawDiagonalLine;
	OneDiff.prototype.drawFunc[DiffType.added] = drawVerticalLine;
	OneDiff.prototype.constructor = OneDiff;


	(function exportModuleUniversally(root, factory) {
	  if (true)
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
	    exports['OneDiff'] = factory();
	  else
	    root['OneDiff'] = factory();
	})(this, function factory() {
	  return OneDiff;
	});



/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	/** 
	 * Create an element of tagName type, optionally add classes and append Nodes to the newly created element
	 * @param {string} tagName
	 * @param {(string | string[] )} [classList] - a class or an array of classes
	 * @param {(string | Node[] | string[] )} [children] - a string or an array of string or an array of Nodes
	 * @return {Node} the created element
	 * independent
	 */
	function createElementWith(tagName, classList, children) {
	  var newElement = document.createElement(tagName);
	  if (classList === undefined) return newElement;
	  if (typeof(classList) === 'string') classList = new Array(classList);
	  classList.forEach(function(oneClass, index, self) {
	    newElement.classList.add(oneClass);
	  });
	  if (children === undefined) return newElement;
	  if (Object.prototype.toString.apply(children) != '[object Array]'
	    || typeof(children) === 'string') children = new Array(children);
	  children.forEach(function(oneChild, index, self) {
	    if (typeof(oneChild) === 'string') oneChild = document.createTextNode(oneChild);
	    newElement.appendChild(oneChild);
	  });
	  return newElement;
	}
	(function exportModuleUniversally(root, factory) {
	  if (true)
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
	    exports['createElementWith'] = factory();
	  else
	    root['createElementWith'] = factory();
	})(this, function factory() {
	  return createElementWith;
	});


/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	function ShowResultStack(result) {
	  this['result'] = result;
	  this['index'] = 0;
	  this['storage'] = new Array();
	  return this;
	}
	ShowResultStack.prototype = {
	  "push": function() {
	    if (this.index == this.result.length) return false;
	    var oneDiff = this.result[this.index];
	    oneDiff.draw();
	    this.storage.push(oneDiff);
	    return ++this.index;
	  },
	  "pop": function() {
	    if (this.index == 0) return false;
	    this.storage.pop().removeSelf();
	    return this.index--;
	  },
	  "clear": function() {
	    while (this.storage.length) this.storage.pop().removeSelf();
	    this.index = 0;
	  }
	};
	ShowResultStack.prototype.constructor = ShowResultStack;

	(function exportModuleUniversally(root, factory) {
	  if (true)
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
	    exports['ShowResultStack'] = factory();
	  else
	    root['ShowResultStack'] = factory();
	})(this, function factory() {
	  return ShowResultStack;
	});


/***/ }
/******/ ]);