var $ = require('./jquery.js');
require('./bootstrap.js')(this, $);

var DiffCanvas = require('./DiffCanvas.js');
var DiffTable = require('./DiffTable.js');
var ResultStack = require('./ResultStack.js');
var ButtonGetReady = require('./ButtonGetReady.js');

var config = require('./diffConfig.js');
var oldStr = document.getElementById('oldStr').value = config.oldStr,
    newStr = document.getElementById('newStr').value = config.newStr;
var basicDiffCanvas = null, forwardDiffCanvas = null, reverseDiffCanvas = null,
    globalCanvas = null, diffTable = null, resultStack = null;


function init(curDiffAlgorithm, toOverwrite) {
  function createTabsIn(selector, tabsInfo, additionalClass) {
    var $parent = $(selector);
    var $wrapper = $('<div>').addClass('switch-canvas-outer-wrapper').appendTo($parent);
    var canvases = new Array();
        lis = new Array();
    var heightClass = additionalClass ? ' ' + additionalClass : '';
    tabsInfo.forEach(function(oneTab) {
      canvases.push($('<div>', {
          "id": oneTab.id,
          "class": 'canvas mensuFade'
        }));
      lis.push($('<li><a href="#' + oneTab.id + '">' + oneTab.title + '</a></li>'));
    });
      
    var $canvasesWrapper = $('<div>')
      .addClass('canvases-wrapper' + heightClass)
      .appendTo($wrapper)
      .append(canvases);

    var $switch = $('<ul>')
      .addClass('nav nav-pills')
      .prependTo($wrapper)
      .append(lis)
      .find('a')
        .click(function(e) {
          e.preventDefault();
          $(this).tab('show');
        })
        .first()
          .tab('show');
  }

  var $main = $('#main');
  var originalAlgorithm = (curDiffAlgorithm == 'basic') ? 'advanced' : 'basic';
  if ($main.data(originalAlgorithm)) $main.data(originalAlgorithm).$wrappers.detach();
  if (toOverwrite) {
    $main.empty();
    $main.removeData(curDiffAlgorithm), $main.removeData(originalAlgorithm, undefined);
  } else if ($main.data(curDiffAlgorithm)) {
    var cur = $main.data(curDiffAlgorithm);
    cur.$wrappers.appendTo($main);
    diffTable.detach();
    diffTable = cur.diffTable;
    diffTable.reattach();
    resultStack = cur.resultStack;
    return;
  }
  if (curDiffAlgorithm == 'basic') {
    var tabsInfo = [{
      "id": 'basic-canvas',
      "title": 'Basic'
    }];
    createTabsIn('#main', tabsInfo, 'has-one-canvas');

    basicCanvas = new DiffCanvas('#' + tabsInfo[0].id, oldStr, newStr);
    diffTable = new DiffTable('#diff-table', 1, oldStr.length + newStr.length);
    diffTable.modify([{
      "row": 0,
      "col": 0,
      "value": 0
    }]);
    resultStack = new ResultStack(oldStr, newStr, {
      "diffCanvas": basicCanvas
    }, diffTable);

  } else if (curDiffAlgorithm == 'advanced') {
    var tabsInfo = [{
      "id": 'forward-canvas',
      "title": 'Forward'
    }, {
      "id": 'reverse-canvas',
      "title": 'Reverse'
    }];
    var globalTabInfo = {
      "id": 'global-canvas',
      "title": 'Global'
    };
    createTabsIn('#main', tabsInfo, 'has-two-canvases-top');
    createTabsIn('#main', [globalTabInfo], 'has-two-canvases-bottom');

    forwardDiffCanvas = new DiffCanvas('#' + tabsInfo[0].id, oldStr, newStr);
    reverseDiffCanvas = new DiffCanvas('#' + tabsInfo[1].id, oldStr.split('').reverse().join(''), newStr.split('').reverse().join(''));
    globalCanvas = new DiffCanvas('#' + globalTabInfo.id, oldStr, newStr);
    diffTable = new DiffTable('#diff-table', 2, oldStr.length + newStr.length);
    resultStack = new ResultStack(oldStr, newStr, {
      "diffCanvas": forwardDiffCanvas,
      "reverseDiffCanvas": reverseDiffCanvas,
      "globalCanvas": globalCanvas
    }, diffTable);
  }
  $main.data(curDiffAlgorithm, {
    "$wrappers": $(main).find('.switch-canvas-outer-wrapper'),
    "diffTable": diffTable,
    "resultStack": resultStack
  });
}

var diffAlgorithmBtns = [].slice.call(document.getElementsByName('diffAlgorithm'), 0);
diffAlgorithmBtns.forEach(function(oneBtn) {
  oneBtn.addEventListener('change', function() {
    ButtonGetReady.clear();
    init(this.value);
  }, false);
  if (oneBtn.value == 'advanced') oneBtn.click();
});

document.getElementById('auto').addEventListener('click', function() {
  ButtonGetReady.auto(resultStack);
}, false);
document.getElementById('next').addEventListener('click', function() {
  if (ButtonGetReady.next() && false == resultStack.push()) {
    console.log('It was the last step.');
  }
}, false);
document.getElementById('prev').addEventListener('click', function() {
  ButtonGetReady.clear();
  if (false == resultStack.pop()) console.log('It was the first step.');
}, false);
document.getElementById('clear').addEventListener('click', function() {
  ButtonGetReady.clear();
  resultStack.clear();
}, false);
document.getElementById('ok').addEventListener('click', function() {
  ButtonGetReady.clear();
  oldStr = document.getElementById('oldStr').value;
  newStr = document.getElementById('newStr').value;
  diffAlgorithmBtns.forEach(function(oneBtn) {
    if (oneBtn.checked) init(oneBtn.value, true);
  });
  
}, false);
document.getElementById('speed').addEventListener('change', function() {
  ButtonGetReady.setSpeed(this.value);
}, false);
