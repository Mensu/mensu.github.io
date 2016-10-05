function Calculator(param) {
  if (Object.prototype.toString.apply(param) != '[object Object]' || !(param.element instanceof Node) ) return;
  this.ans = {
    "type": 'number',
    "value": 0
  };
  this.precision = param.precision || 12;
  this.element = param.element;
  this.curExpression = [];
  this.expressionDiv = this.element.querySelector('.expression');
  this.resultDiv = this.element.querySelector('.result');
  this.justCalculated = true;
  this.init();
}

(function() {
  
  
  Calculator.prototype = {
    "constructor": Calculator,
    "floatParser": floatParser,
    "exprSpliter": exprSpliter,
    "exprEval": exprEval,
    "exprParser": function exprParser(expr) {
      var result = null;
      try {
        result = this.exprEval(this.exprSpliter(expr));
        this.ans = {
          "type": 'number',
          "value": result
        }
        if (Math.round(result) == result) {
          result = parseFloat(result.toPrecision(this.precision));
          if (String(result).length > this.precision) result = result.toExponential();
        } else {
          result = parseFloat(result.toFixed(this.precision));
        }
        ret = {
          "status": 'OK',
          "result": result
        }
      } catch (e) {
        result = e.message;
        ret = {
          "status": 'BAD',
          "result": result
        }
      }
      return ret;
    },
    "appendChar": function(buttonInfo) {
      buttonInfo = JSON.parse(JSON.stringify(buttonInfo));
      var expressionSpan = this.expressionDiv.querySelector('.expr-content');
      var appendedChar = buttonInfo.value;
      if (buttonInfo.description) {
        appendedChar = buttonInfo.description;
      }
      if (buttonInfo.value == '*' && this.curExpression.length && this.curExpression[this.curExpression.length - 1].value == '*') {
        expressionSpan.textContent = expressionSpan.textContent.slice(0, -1) + '**';
        this.curExpression.pop();
        buttonInfo.description = '**';
        buttonInfo.value = '**';
      } else {
        expressionSpan.textContent += appendedChar;
      }
      this.curExpression.push(buttonInfo);
    },
    "deleteChar": function() {
      var expressionSpan = this.expressionDiv.querySelector('.expr-content');
      if (0 == this.curExpression.length) return;
      var deleted = this.curExpression.pop();
      var deletedChar = deleted.value;
      if (deleted.description) {
        deletedChar = deleted.description;
      }
      expressionSpan.textContent = expressionSpan.textContent.slice(0, -1 * deletedChar.length);
    },
    "clear": function() {
      var expressionSpan = this.expressionDiv.querySelector('.expr-content');
      expressionSpan.textContent = '';
      this.curExpression = [];
    },
    "scrollToViewExpression": function() {
      var newScrollLeft = this.expressionDiv.querySelector('.for-scroll').offsetLeft;
      this.expressionDiv.scrollLeft = newScrollLeft;
    },
    "eval": function() {
      var resultDiv = this.resultDiv;
      var expressionToParse = '';
      this.curExpression.forEach(function(curInfo) {
        expressionToParse += curInfo.value;
      });
      if (0 == expressionToParse.length) expressionToParse = '0';
      var parserRet = this.exprParser(expressionToParse);
      if (parserRet.status == 'OK') {
        resultDiv.classList.remove('bad-result');
        this.justCalculated = true;
      } else {
        parserRet.result = parserRet.result.replace('**', '$').replace('*', '×').replace('/', '÷').replace('$', '**');
        resultDiv.classList.add('bad-result');
      }
      resultDiv.textContent = parserRet.result;
    },
    "init": function() {
      var element = this.element;
      var numbersDiv = element.querySelector('.panel .num-op-row .numbers');
      var basicOpDiv = element.querySelector('.panel .num-op-row .basic-op');
      var toolDiv = element.querySelector('.panel .tool-row .tools');
      var calcSelf = this;
      function addNormalListeners(infos, appendDest) {
        infos.forEach(function(curInfo) {
          var isOpInfo = (infos == calcSelf.operatorsInfo);
          var identifyingClassName = (curInfo.name ? curInfo.name : curInfo.value);
          var button = createElementWith('div', ['calc-btn', identifyingClassName], (curInfo.description ? curInfo.description : curInfo.value));
          button['btnInfo'] = curInfo;
          button.addEventListener('click', function() {
            if (calcSelf.justCalculated) {
              calcSelf.clear();
              if (isOpInfo) {
                calcSelf.appendChar(calcSelf.ansInfo);
              }
            }
            calcSelf.appendChar(this.btnInfo);
            calcSelf.scrollToViewExpression();
            calcSelf.justCalculated = false;
          }, false);
          document.body.addEventListener('keyup', function(event) {
            if (event.key == button.btnInfo.value) {
              button.click();
            }
          }, false);
          appendDest.appendChild(button);
        });
      }
      addNormalListeners(this.numbersInfo, numbersDiv);
      addNormalListeners(this.operatorsInfo, basicOpDiv);

      function addToolListeners(infos, appendDest) {
        infos.forEach(function(curInfo) {
          var isOpInfo = (infos == calcSelf.operatorsInfo);
          var identifyingClassName = (curInfo.name ? curInfo.name : curInfo.value);
          if (curInfo.value == ')') {
            var button = createElementWith('div', ['calc-btn', identifyingClassName], (curInfo.description ? curInfo.description : curInfo.value));
            button['btnInfo'] = curInfo;
            button.addEventListener('click', function() {
              if (calcSelf.justCalculated) {
                calcSelf.clear();
              }
              calcSelf.appendChar(this.btnInfo);
              calcSelf.scrollToViewExpression();
              calcSelf.justCalculated = false;
            }, false);
            document.body.addEventListener('keyup', function(event) {
              if (event.key == button.btnInfo.value) {
                button.click();
              }
            }, false);
          } else if (curInfo.value == 'Backspace') {
            var button = createElementWith('div', ['calc-btn', identifyingClassName], createElementWith('span', ['icon', 'fa'], ''));
            button['btnInfo'] = curInfo;
            button.addEventListener('click', function() {
              calcSelf.deleteChar();
              calcSelf.scrollToViewExpression();
              calcSelf.justCalculated = false;
            }, false);
            document.body.addEventListener('keydown', function(event) {
              if (event.key == button.btnInfo.value) {
                button.click();
              }
            }, false);
          } else if (curInfo.value == 'clear') {
            var button = createElementWith('div', ['calc-btn', identifyingClassName], (curInfo.description ? curInfo.description : curInfo.value));
            button['btnInfo'] = curInfo;
            button.addEventListener('click', function() {
              calcSelf.clear();
              calcSelf.scrollToViewExpression();
              calcSelf.justCalculated = false;
            }, false);
          } else if (curInfo.value == '=') {
            var button = createElementWith('div', ['calc-btn', identifyingClassName], (curInfo.description ? curInfo.description : curInfo.value));
            button['btnInfo'] = curInfo;
            button.addEventListener('click', function() {
              calcSelf.eval();
            }, false);
            document.body.addEventListener('keyup', function(event) {
              if (event.key == button.btnInfo.value || event.key == 'Enter') {
                button.click();
              }
            }, false);
          }
          
          appendDest.appendChild(button);
        });
      }
      addToolListeners(this.toolsInfo, toolDiv);
      
      
    },

    "numbersInfo": [{
      "value": '7',
    }, {
      "value": '8'
    }, {
      "value": '9'
    }, {
      "value": '4'
    }, {
      "value": '5'
    }, {
      "value": '6'
    }, {
      "value": '1'
    }, {
      "value": '2'
    }, {
      "value": '3'
    }, {
      "value": '(',
      "name": 'op-left-paren'
    }, {
      "value": '0'
    }, {
      "value": '.',
      "name": 'digit-dot'
    }],

    "operatorsInfo": [{
      "value": '/',
      "description": '÷',
      "name": 'op-devide'
    }, {
      "value": '*',
      "description": '×',
      "name": 'op-multiply'
    }, {
      "value": '+',
      "name": 'op-plus'
    }, {
      "value": '-',
      "name": 'op-minus'
    }],

    "toolsInfo": [{
      "value": ')',
      "name": 'op-right-paren'
    }, {
      "value": 'Backspace',
      "description": '',
      "name": 'backspace'
    }, {
      "value": 'clear',
      "description": 'CE',
      "name": 'clear'
    }, {
      "value": '=',
      "name": 'eval'
    }],

    "ansInfo": {
      "value": 'Ans'
    }

  };

  var input = document.querySelector('.expression input');
  var result = document.querySelector('.result');
  var calculatorEle = document.querySelector('.calculator-wrapper');
  var calc = new Calculator({
    "element": calculatorEle
  });




  var charCodeMap = {};
  var chars = ['0', '9', '.', 'e', 'E'];
  for (var index = 0, length = chars.length; index != length; ++index) {
    var c = chars[index];
    charCodeMap[c] = c.charCodeAt(0);
  }

  function isNum(c) {
    var charCode = String(c).charCodeAt(0);
    return charCodeMap['0'] <= charCode && charCode <= charCodeMap['9'];
  }
  function isDot(c) {
    return charCodeMap['.'] == String(c).charCodeAt(0);
  }
  function isE(c) {
    var charCode = String(c).charCodeAt(0);
    return charCodeMap['e'] == charCode || charCodeMap['E'] == charCode;
  }
  function getSign(c) {
    var retMap = {
      "+": 1,
      "-": -1
    };
    return retMap[c] || 0;
  }
  function roundBetween(num, min, max) {
    return Math.max(min, Math.min(max, num));
  }
  
  var tokens = {
    "(": {
      "regs": [{
        "pass": true,
        "reg": /^\(/,
      }],
      "ret": {
        "type": 'op',
        "isParen": true,
        "priority": -1,
        "value": '('
      }
    },
    ")": {
      "regs": [{
        "pass": true,
        "reg": /^\)/,
      }],
      "ret": {
        "type": 'op',
        "isParen": true,
        "priority": 0,
        "value": ')'
      }
    },
    "+": {
      "regs": [{
        "pass": true,
        "reg": /^\+/,
      }],
      "ret": {
        "type": 'op',
        "priority": 1,
        "value": '+',
        "calc": (function(left, right) {
          return left.value + right.value;
        })
      }
    },
    "-": {
      "regs": [{
        "pass": true,
        "reg": /^\-/,
      }],
      "ret": {
        "type": 'op',
        "priority": 1,
        "value": '-',
        "calc": (function(left, right) {
          return left.value - right.value;
        })
      }
    },
    "*": {
      "regs": [{
        "pass": true,
        "reg": /^\*/,
      }, {
        "pass": false,
        "reg": /^\*{2,}/,
      }],
      "ret": {
        "type": 'op',
        "priority": 2,
        "value": '*',
        "calc": (function(left, right) {
          return left.value * right.value;
        })
      }
    },
    "/": {
      "regs": [{
        "pass": true,
        "reg": /^\//,
      }],
      "ret": {
        "type": 'op',
        "priority": 2,
        "value": '/',
        "calc": (function(left, right) {
          if (right.value == 0) throw new Error('Divisor should not be 0');
          return left.value / right.value;
        })
      }
    },
    " ": {
      "regs": [{
        "pass": true,
        "reg": /^\s{1,}/,
      }],
      "ret": {
        "type": 'space',
        "value": ''
      }
    },
    "**": {
      "regs": [{
        "pass": true,
        "reg": /^\*{2}/,
      }],
      "ret": {
        "type": 'op',
        "priority": 3,
        "value": '**',
        "calc": (function(left, right) {
          return Math.pow(left.value, right.value);
        })
      }
    },
    "ans": {
      "regs": [{
        "pass": true,
        "reg": /^\Ans/,
      }],
      "ret": {
        "type": 'ans',
        "value": ''
      }
    }
  };

  function getTokenInfo(expr) {
    for (var tokenKey in tokens) {
      var curToken = tokens[tokenKey];
      var passAll = true;
      for (var regIndex = 0, curReg = curToken.regs[regIndex], regsLength = curToken.regs.length;
          regIndex != regsLength;
          ++regIndex, curReg = curToken.regs[regIndex]) {
        if ( curReg.pass ^ Boolean(curReg.reg.exec(expr)) ) {
          passAll = false;
          break;
        }
      }

      if (!passAll) continue;
      var ret = getTokenRetCopy(curToken.ret);
      ret.value = curToken.regs[0].reg.exec(expr)[0];
      return ret;
    }
    throw new Error('Unexpected Token ' + expr[0] + ' before ' + (expr.slice(1).length ? '"' + expr.slice(1) + '"' : 'end'));
  }

  function getTokenRetCopy(origin) {
    var ret = JSON.parse(JSON.stringify(origin));
    if (origin.calc) ret['calc'] = origin.calc;
    return ret;
  }

  function floatParser(expr, isInteger) {
    expr = String(expr);
    isInteger = Boolean(isInteger);
    var parseFloatResult = parseFloat(expr);
    var exprCp = expr;

    var intPart = 0;
    var exp = 0;

    var dotShown = false;
    var valid = true;

    var length = expr.length;

    if (0 == length) {
      return {
        "parsedLength": 0,
        "valid": false,
        "remainingStr": expr
      }
    }

    var signCount = 0;
    var tempSign = null;
    var sign = 1;
    while ( (tempSign = getSign(expr[0])) ) {
      sign *= tempSign;
      ++signCount;
      expr = expr.slice(1);
      length = expr.length;
    }

    var index = 0, c = expr[index], lengthAfterE = 0;
    
    for (; index != length; ++index, c = expr[index]) {
      if (isNum(c)) {
        intPart = intPart * 10 + c.charCodeAt(0) - charCodeMap[0];
        exp += 1 * dotShown;
      } else if (isDot(c)) {
        if (isInteger || dotShown) {
          break;
        } else {
          dotShown = true;
        }
      } else if (isE(c)) {
        var afterE = floatParser(expr.slice(index + 1), true);
        if (!isInteger && afterE.valid) {
          exp -= afterE.floatResult;
          lengthAfterE = 1 + afterE.parsedLength;
        }
        break;
      } else {
        break;
      }
    }

    var floatResult = sign * intPart * Math.pow(10, -exp);
    if (0 == index || isNaN(floatResult)) {
      valid = false;
    }
    var info = {};
    if (valid) {
      index += lengthAfterE;
      info['valid'] = valid;
      info['floatResult'] = floatResult;
      info['remainingStr'] = expr.slice(index);
      info['signCount'] = signCount;
      info['parsedLength'] = signCount + index;
      if (floatResult != parseFloatResult && !isNaN(parseFloatResult)) {
        floatResult = parseFloatResult;
      }
      info['isInteger'] = Math.round(floatResult) == floatResult;
      
    } else {
      info['valid'] = false;
      info['remainingStr'] = exprCp;
      info['parsedLength'] = 0;
    }
    return info;
  }

  function exprSpliter(expr) {
    var length = expr.length;
    var index = 0;
    var ret = [];
    var curExpr = expr;
    var prevToken = null;
    var numberShown = false;
    var parenPairCount = 0;
    var danglingParenPos = -1;
    for (; index < length; curExpr = expr.slice(index)) {
      var parseResult = floatParser(curExpr);
      if (parseResult.valid) {
        var result = parseResult.floatResult;
        function prependOperator() {
          if (result < 0) {
            result *= -1;
            ret.push(getTokenRetCopy(tokens['-'].ret));
          } else {
            ret.push(getTokenRetCopy(tokens['+'].ret));
          }
        }
        if (prevToken) {
          if (numberShown && parseResult.signCount && (prevToken.type == 'number' || prevToken.value == ')')) {
            prependOperator();
            
          } else if (prevToken.value == ')') {
            ret.push(getTokenRetCopy(tokens['*'].ret));
          } else if (prevToken.type == 'number') {
            throw new Error('Expected operator before ' + '"' + expr.substr(index, parseResult.parsedLength) + '" at position ' + (index + 1));
          }
          
        } else if (parseResult.signCount) {
          ret.push({
            "type": 'number',
            "value": 0
          });
          prependOperator();
        }
        numberShown = true;

        prevToken = {
          "type": 'number',
          "value": result
        };
        ret.push(prevToken);
        index += parseResult.parsedLength;
      } else {
        var curToken = getTokenInfo(curExpr);
        index += curToken.value.length;
        if (curToken.type == 'space') {
          continue;
        } else if (curToken.type == 'ans') {
          prevToken = this.ans;
          ret.push(prevToken);
          numberShown = true;
          continue;
        }

        if (curToken.priority == 1) {
          if (prevToken && prevToken.type == 'op' && prevToken.priority > curToken.priority) {
            throw new Error('Expected expression after ' + prevToken.value + ' at position ' + (index - prevToken.value.length));
          }
        } else if (curToken.priority > 1) {
          if (prevToken && prevToken.type == 'op' && prevToken.value != ')') {
            throw new Error('Expected expression before ' + curToken.value + ' at position ' + (index - curToken.value.length + 1));
          }
        } else if (curToken.value == '(') {
          ++parenPairCount;
          if (parenPairCount == 1) {
            danglingParenPos = index;
          }
          if (prevToken && (prevToken.type == 'number' || prevToken.value == ')')) {
            ret.push(getTokenRetCopy(tokens['*'].ret));
          }
        } else if (curToken.value == ')') {
          --parenPairCount;
          if (parenPairCount < 0) {
            throw new Error("Missing parenthesis for the one at position " + index);
          } else if (prevToken && prevToken.type == 'op' && prevToken.value != ')') {
            
            if (prevToken.value == '(') {
              throw new Error('Expected expression in () at position ' + (index - 1));
            } else {
              throw new Error('Expected expression after ' + prevToken.value + ' at position ' + (index - prevToken.value.length));
            }

          }
        }
        prevToken = curToken;
        ret.push(curToken);
        
      }
    }
    if (parenPairCount) {
      throw new Error("Missing parenthesis for the one at position " + danglingParenPos);
    } else if (prevToken && prevToken.type == 'op' && !prevToken.isParen) {
      throw new Error('Expected expression after ' + prevToken.value + ' at position ' + (index + 1 - prevToken.value.length));
    }
    
    return ret;
  }

  function exprEval(splitExpr) {
    if (0 == splitExpr.length) throw new Error('Empty expression');

    var operands = [], operators = [];
    var numShown = false;
    var resultedValue = null;

    function cleanStacks(curToken) {
      while (operators.length) {
        var curOperatorTop = operators[operators.length - 1];
        if (curToken && curOperatorTop.priority < curToken.priority) break;
        operators.pop();
        var operator = curOperatorTop.value;
        var calc = curOperatorTop.calc;
        var arguments = [];
        if (!calc) {
          throw new Error('Unexpected operator ' + operator);
        }
        var right = operands.pop();
        if (!right) {
          throw new Error('Expected expression after ' + operator);
        }
        arguments.unshift(right);
        if (calc.length == 2) {
          var left = operands.pop();
          if (!left) {
            throw new Error('Expected expression before ' + operator);
          }
          arguments.unshift(left);
        }
        
        resultedValue = calc.apply(curOperatorTop, arguments);
        operands.push({
          "type": 'number',
          "value": resultedValue
        });
      }
    }
    while (splitExpr.length) {
      var curToken = splitExpr.shift();
      if (curToken.type == 'number') {
        if (resultedValue === null) resultedValue = curToken.value;
        operands.push(curToken);
      } else if (curToken.type == 'op') {
        if (curToken.value == '(') {
          operators.push(curToken);
        } else if (curToken.value == ')') {
          cleanStacks(curToken);
          if (operators.length) operators.pop();
          else throw new Error("Parentheses don't match");
        } else {
          cleanStacks(curToken);
          operators.push(curToken);
        }
      }
    }
    cleanStacks();
    return resultedValue;
  }

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

      // wrap to an array
    if (typeof(classList) === 'string') {
      classList = new Array(classList);
    }
    classList.forEach(function(oneClass) {
      newElement.classList.add(oneClass);
    });
    if (children === undefined) return newElement;

      // wrap to an array
    if ( Object.prototype.toString.apply(children) != '[object Array]' || typeof(children) === 'string' ) {
      children = new Array(children);
    }
    children.forEach(function(oneChild) {
      if (typeof(oneChild) === 'string') oneChild = document.createTextNode(oneChild);
      newElement.appendChild(oneChild);
    });
    return newElement;
  }
      
  

})();
