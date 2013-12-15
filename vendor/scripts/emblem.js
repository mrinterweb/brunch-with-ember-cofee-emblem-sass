
this.StringScanner = (function() {
  var StringScanner;
  StringScanner = (function() {
    function StringScanner(str) {
      this.str = str != null ? str : '';
      this.str = '' + this.str;
      this.pos = 0;
      this.lastMatch = {
        reset: function() {
          this.str = null;
          this.captures = [];
          return this;
        }
      }.reset();
      this;
    }
    StringScanner.prototype.bol = function() {
      return this.pos <= 0 || (this.str[this.pos - 1] === "\n");
    };
    StringScanner.prototype.captures = function() {
      return this.lastMatch.captures;
    };
    StringScanner.prototype.check = function(pattern) {
      var matches;
      if (this.str.substr(this.pos).search(pattern) !== 0) {
        this.lastMatch.reset();
        return null;
      }
      matches = this.str.substr(this.pos).match(pattern);
      this.lastMatch.str = matches[0];
      this.lastMatch.captures = matches.slice(1);
      return this.lastMatch.str;
    };
    StringScanner.prototype.checkUntil = function(pattern) {
      var matches, patternPos;
      patternPos = this.str.substr(this.pos).search(pattern);
      if (patternPos < 0) {
        this.lastMatch.reset();
        return null;
      }
      matches = this.str.substr(this.pos + patternPos).match(pattern);
      this.lastMatch.captures = matches.slice(1);
      return this.lastMatch.str = this.str.substr(this.pos, patternPos) + matches[0];
    };
    StringScanner.prototype.clone = function() {
      var clone, prop, value, _ref;
      clone = new this.constructor(this.str);
      clone.pos = this.pos;
      clone.lastMatch = {};
      _ref = this.lastMatch;
      for (prop in _ref) {
        value = _ref[prop];
        clone.lastMatch[prop] = value;
      }
      return clone;
    };
    StringScanner.prototype.concat = function(str) {
      this.str += str;
      return this;
    };
    StringScanner.prototype.eos = function() {
      return this.pos === this.str.length;
    };
    StringScanner.prototype.exists = function(pattern) {
      var matches, patternPos;
      patternPos = this.str.substr(this.pos).search(pattern);
      if (patternPos < 0) {
        this.lastMatch.reset();
        return null;
      }
      matches = this.str.substr(this.pos + patternPos).match(pattern);
      this.lastMatch.str = matches[0];
      this.lastMatch.captures = matches.slice(1);
      return patternPos;
    };
    StringScanner.prototype.getch = function() {
      return this.scan(/./);
    };
    StringScanner.prototype.match = function() {
      return this.lastMatch.str;
    };
    StringScanner.prototype.matches = function(pattern) {
      this.check(pattern);
      return this.matchSize();
    };
    StringScanner.prototype.matched = function() {
      return this.lastMatch.str != null;
    };
    StringScanner.prototype.matchSize = function() {
      if (this.matched()) {
        return this.match().length;
      } else {
        return null;
      }
    };
    StringScanner.prototype.peek = function(len) {
      return this.str.substr(this.pos, len);
    };
    StringScanner.prototype.pointer = function() {
      return this.pos;
    };
    StringScanner.prototype.setPointer = function(pos) {
      pos = +pos;
      if (pos < 0) {
        pos = 0;
      }
      if (pos > this.str.length) {
        pos = this.str.length;
      }
      return this.pos = pos;
    };
    StringScanner.prototype.reset = function() {
      this.lastMatch.reset();
      this.pos = 0;
      return this;
    };
    StringScanner.prototype.rest = function() {
      return this.str.substr(this.pos);
    };
    StringScanner.prototype.scan = function(pattern) {
      var chk;
      chk = this.check(pattern);
      if (chk != null) {
        this.pos += chk.length;
      }
      return chk;
    };
    StringScanner.prototype.scanUntil = function(pattern) {
      var chk;
      chk = this.checkUntil(pattern);
      if (chk != null) {
        this.pos += chk.length;
      }
      return chk;
    };
    StringScanner.prototype.skip = function(pattern) {
      this.scan(pattern);
      return this.matchSize();
    };
    StringScanner.prototype.skipUntil = function(pattern) {
      this.scanUntil(pattern);
      return this.matchSize();
    };
    StringScanner.prototype.string = function() {
      return this.str;
    };
    StringScanner.prototype.terminate = function() {
      this.pos = this.str.length;
      this.lastMatch.reset();
      return this;
    };
    StringScanner.prototype.toString = function() {
      return "#<StringScanner " + (this.eos() ? 'fin' : "" + this.pos + "/" + this.str.length + " @ " + (this.str.length > 8 ? "" + (this.str.substr(0, 5)) + "..." : this.str)) + ">";
    };
    return StringScanner;
  })();
  StringScanner.prototype.beginningOfLine = StringScanner.prototype.bol;
  StringScanner.prototype.clear = StringScanner.prototype.terminate;
  StringScanner.prototype.dup = StringScanner.prototype.clone;
  StringScanner.prototype.endOfString = StringScanner.prototype.eos;
  StringScanner.prototype.exist = StringScanner.prototype.exists;
  StringScanner.prototype.getChar = StringScanner.prototype.getch;
  StringScanner.prototype.position = StringScanner.prototype.pointer;
  StringScanner.StringScanner = StringScanner;
  //module.exports = StringScanner;
  return StringScanner;
}).call(this);




// lib/handlebars/base.js

/*jshint eqnull:true*/
this.Handlebars = {};

(function(Handlebars) {

Handlebars.VERSION = "1.0.rc.2";

Handlebars.helpers  = {};
Handlebars.partials = {};

Handlebars.registerHelper = function(name, fn, inverse) {
  if(inverse) { fn.not = inverse; }
  this.helpers[name] = fn;
};

Handlebars.registerPartial = function(name, str) {
  this.partials[name] = str;
};

Handlebars.registerHelper('helperMissing', function(arg) {
  if(arguments.length === 2) {
    return undefined;
  } else {
    throw new Error("Could not find property '" + arg + "'");
  }
});

var toString = Object.prototype.toString, functionType = "[object Function]";

Handlebars.registerHelper('blockHelperMissing', function(context, options) {
  var inverse = options.inverse || function() {}, fn = options.fn;


  var ret = "";
  var type = toString.call(context);

  if(type === functionType) { context = context.call(this); }

  if(context === true) {
    return fn(this);
  } else if(context === false || context == null) {
    return inverse(this);
  } else if(type === "[object Array]") {
    if(context.length > 0) {
      return Handlebars.helpers.each(context, options);
    } else {
      return inverse(this);
    }
  } else {
    return fn(context);
  }
});

Handlebars.K = function() {};

Handlebars.createFrame = Object.create || function(object) {
  Handlebars.K.prototype = object;
  var obj = new Handlebars.K();
  Handlebars.K.prototype = null;
  return obj;
};

Handlebars.logger = {
  DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3, level: 3,

  methodMap: {0: 'debug', 1: 'info', 2: 'warn', 3: 'error'},

  // can be overridden in the host environment
  log: function(level, obj) {
    if (Handlebars.logger.level <= level) {
      var method = Handlebars.logger.methodMap[level];
      if (typeof console !== 'undefined' && console[method]) {
        console[method].call(console, obj);
      }
    }
  }
};

Handlebars.log = function(level, obj) { Handlebars.logger.log(level, obj); };

Handlebars.registerHelper('each', function(context, options) {
  var fn = options.fn, inverse = options.inverse;
  var i = 0, ret = "", data;

  if (options.data) {
    data = Handlebars.createFrame(options.data);
  }

  if(context && typeof context === 'object') {
    if(context instanceof Array){
      for(var j = context.length; i<j; i++) {
        if (data) { data.index = i; }
        ret = ret + fn(context[i], { data: data });
      }
    } else {
      for(var key in context) {
        if(context.hasOwnProperty(key)) {
          if(data) { data.key = key; }
          ret = ret + fn(context[key], {data: data});
          i++;
        }
      }
    }
  }

  if(i === 0){
    ret = inverse(this);
  }

  return ret;
});

Handlebars.registerHelper('if', function(context, options) {
  var type = toString.call(context);
  if(type === functionType) { context = context.call(this); }

  if(!context || Handlebars.Utils.isEmpty(context)) {
    return options.inverse(this);
  } else {
    return options.fn(this);
  }
});

Handlebars.registerHelper('unless', function(context, options) {
  var fn = options.fn, inverse = options.inverse;
  options.fn = inverse;
  options.inverse = fn;

  return Handlebars.helpers['if'].call(this, context, options);
});

Handlebars.registerHelper('with', function(context, options) {
  return options.fn(context);
});

Handlebars.registerHelper('log', function(context, options) {
  var level = options.data && options.data.level != null ? parseInt(options.data.level, 10) : 1;
  Handlebars.log(level, context);
});

}(this.Handlebars));
;
// lib/handlebars/compiler/parser.js
/* Jison generated parser */
var handlebars = (function(){
var parser = {trace: function trace() { },
yy: {},
symbols_: {"error":2,"root":3,"program":4,"EOF":5,"simpleInverse":6,"statements":7,"statement":8,"openInverse":9,"closeBlock":10,"openBlock":11,"mustache":12,"partial":13,"CONTENT":14,"COMMENT":15,"OPEN_BLOCK":16,"inMustache":17,"CLOSE":18,"OPEN_INVERSE":19,"OPEN_ENDBLOCK":20,"path":21,"OPEN":22,"OPEN_UNESCAPED":23,"OPEN_PARTIAL":24,"partialName":25,"params":26,"hash":27,"DATA":28,"param":29,"STRING":30,"INTEGER":31,"BOOLEAN":32,"hashSegments":33,"hashSegment":34,"ID":35,"EQUALS":36,"PARTIAL_NAME":37,"pathSegments":38,"SEP":39,"$accept":0,"$end":1},
terminals_: {2:"error",5:"EOF",14:"CONTENT",15:"COMMENT",16:"OPEN_BLOCK",18:"CLOSE",19:"OPEN_INVERSE",20:"OPEN_ENDBLOCK",22:"OPEN",23:"OPEN_UNESCAPED",24:"OPEN_PARTIAL",28:"DATA",30:"STRING",31:"INTEGER",32:"BOOLEAN",35:"ID",36:"EQUALS",37:"PARTIAL_NAME",39:"SEP"},
productions_: [0,[3,2],[4,2],[4,3],[4,2],[4,1],[4,1],[4,0],[7,1],[7,2],[8,3],[8,3],[8,1],[8,1],[8,1],[8,1],[11,3],[9,3],[10,3],[12,3],[12,3],[13,3],[13,4],[6,2],[17,3],[17,2],[17,2],[17,1],[17,1],[26,2],[26,1],[29,1],[29,1],[29,1],[29,1],[29,1],[27,1],[33,2],[33,1],[34,3],[34,3],[34,3],[34,3],[34,3],[25,1],[21,1],[38,3],[38,1]],
performAction: function anonymous(yytext,yyleng,yylineno,yy,yystate,$$,_$) {

var $0 = $$.length - 1;
switch (yystate) {
case 1: return $$[$0-1]; 
break;
case 2: this.$ = new yy.ProgramNode([], $$[$0]); 
break;
case 3: this.$ = new yy.ProgramNode($$[$0-2], $$[$0]); 
break;
case 4: this.$ = new yy.ProgramNode($$[$0-1], []); 
break;
case 5: this.$ = new yy.ProgramNode($$[$0]); 
break;
case 6: this.$ = new yy.ProgramNode([], []); 
break;
case 7: this.$ = new yy.ProgramNode([]); 
break;
case 8: this.$ = [$$[$0]]; 
break;
case 9: $$[$0-1].push($$[$0]); this.$ = $$[$0-1]; 
break;
case 10: this.$ = new yy.BlockNode($$[$0-2], $$[$0-1].inverse, $$[$0-1], $$[$0]); 
break;
case 11: this.$ = new yy.BlockNode($$[$0-2], $$[$0-1], $$[$0-1].inverse, $$[$0]); 
break;
case 12: this.$ = $$[$0]; 
break;
case 13: this.$ = $$[$0]; 
break;
case 14: this.$ = new yy.ContentNode($$[$0]); 
break;
case 15: this.$ = new yy.CommentNode($$[$0]); 
break;
case 16: this.$ = new yy.MustacheNode($$[$0-1][0], $$[$0-1][1]); 
break;
case 17: this.$ = new yy.MustacheNode($$[$0-1][0], $$[$0-1][1]); 
break;
case 18: this.$ = $$[$0-1]; 
break;
case 19: this.$ = new yy.MustacheNode($$[$0-1][0], $$[$0-1][1]); 
break;
case 20: this.$ = new yy.MustacheNode($$[$0-1][0], $$[$0-1][1], true); 
break;
case 21: this.$ = new yy.PartialNode($$[$0-1]); 
break;
case 22: this.$ = new yy.PartialNode($$[$0-2], $$[$0-1]); 
break;
case 23: 
break;
case 24: this.$ = [[$$[$0-2]].concat($$[$0-1]), $$[$0]]; 
break;
case 25: this.$ = [[$$[$0-1]].concat($$[$0]), null]; 
break;
case 26: this.$ = [[$$[$0-1]], $$[$0]]; 
break;
case 27: this.$ = [[$$[$0]], null]; 
break;
case 28: this.$ = [[new yy.DataNode($$[$0])], null]; 
break;
case 29: $$[$0-1].push($$[$0]); this.$ = $$[$0-1]; 
break;
case 30: this.$ = [$$[$0]]; 
break;
case 31: this.$ = $$[$0]; 
break;
case 32: this.$ = new yy.StringNode($$[$0]); 
break;
case 33: this.$ = new yy.IntegerNode($$[$0]); 
break;
case 34: this.$ = new yy.BooleanNode($$[$0]); 
break;
case 35: this.$ = new yy.DataNode($$[$0]); 
break;
case 36: this.$ = new yy.HashNode($$[$0]); 
break;
case 37: $$[$0-1].push($$[$0]); this.$ = $$[$0-1]; 
break;
case 38: this.$ = [$$[$0]]; 
break;
case 39: this.$ = [$$[$0-2], $$[$0]]; 
break;
case 40: this.$ = [$$[$0-2], new yy.StringNode($$[$0])]; 
break;
case 41: this.$ = [$$[$0-2], new yy.IntegerNode($$[$0])]; 
break;
case 42: this.$ = [$$[$0-2], new yy.BooleanNode($$[$0])]; 
break;
case 43: this.$ = [$$[$0-2], new yy.DataNode($$[$0])]; 
break;
case 44: this.$ = new yy.PartialNameNode($$[$0]); 
break;
case 45: this.$ = new yy.IdNode($$[$0]); 
break;
case 46: $$[$0-2].push($$[$0]); this.$ = $$[$0-2]; 
break;
case 47: this.$ = [$$[$0]]; 
break;
}
},
table: [{3:1,4:2,5:[2,7],6:3,7:4,8:6,9:7,11:8,12:9,13:10,14:[1,11],15:[1,12],16:[1,13],19:[1,5],22:[1,14],23:[1,15],24:[1,16]},{1:[3]},{5:[1,17]},{5:[2,6],7:18,8:6,9:7,11:8,12:9,13:10,14:[1,11],15:[1,12],16:[1,13],19:[1,19],20:[2,6],22:[1,14],23:[1,15],24:[1,16]},{5:[2,5],6:20,8:21,9:7,11:8,12:9,13:10,14:[1,11],15:[1,12],16:[1,13],19:[1,5],20:[2,5],22:[1,14],23:[1,15],24:[1,16]},{17:23,18:[1,22],21:24,28:[1,25],35:[1,27],38:26},{5:[2,8],14:[2,8],15:[2,8],16:[2,8],19:[2,8],20:[2,8],22:[2,8],23:[2,8],24:[2,8]},{4:28,6:3,7:4,8:6,9:7,11:8,12:9,13:10,14:[1,11],15:[1,12],16:[1,13],19:[1,5],20:[2,7],22:[1,14],23:[1,15],24:[1,16]},{4:29,6:3,7:4,8:6,9:7,11:8,12:9,13:10,14:[1,11],15:[1,12],16:[1,13],19:[1,5],20:[2,7],22:[1,14],23:[1,15],24:[1,16]},{5:[2,12],14:[2,12],15:[2,12],16:[2,12],19:[2,12],20:[2,12],22:[2,12],23:[2,12],24:[2,12]},{5:[2,13],14:[2,13],15:[2,13],16:[2,13],19:[2,13],20:[2,13],22:[2,13],23:[2,13],24:[2,13]},{5:[2,14],14:[2,14],15:[2,14],16:[2,14],19:[2,14],20:[2,14],22:[2,14],23:[2,14],24:[2,14]},{5:[2,15],14:[2,15],15:[2,15],16:[2,15],19:[2,15],20:[2,15],22:[2,15],23:[2,15],24:[2,15]},{17:30,21:24,28:[1,25],35:[1,27],38:26},{17:31,21:24,28:[1,25],35:[1,27],38:26},{17:32,21:24,28:[1,25],35:[1,27],38:26},{25:33,37:[1,34]},{1:[2,1]},{5:[2,2],8:21,9:7,11:8,12:9,13:10,14:[1,11],15:[1,12],16:[1,13],19:[1,19],20:[2,2],22:[1,14],23:[1,15],24:[1,16]},{17:23,21:24,28:[1,25],35:[1,27],38:26},{5:[2,4],7:35,8:6,9:7,11:8,12:9,13:10,14:[1,11],15:[1,12],16:[1,13],19:[1,19],20:[2,4],22:[1,14],23:[1,15],24:[1,16]},{5:[2,9],14:[2,9],15:[2,9],16:[2,9],19:[2,9],20:[2,9],22:[2,9],23:[2,9],24:[2,9]},{5:[2,23],14:[2,23],15:[2,23],16:[2,23],19:[2,23],20:[2,23],22:[2,23],23:[2,23],24:[2,23]},{18:[1,36]},{18:[2,27],21:41,26:37,27:38,28:[1,45],29:39,30:[1,42],31:[1,43],32:[1,44],33:40,34:46,35:[1,47],38:26},{18:[2,28]},{18:[2,45],28:[2,45],30:[2,45],31:[2,45],32:[2,45],35:[2,45],39:[1,48]},{18:[2,47],28:[2,47],30:[2,47],31:[2,47],32:[2,47],35:[2,47],39:[2,47]},{10:49,20:[1,50]},{10:51,20:[1,50]},{18:[1,52]},{18:[1,53]},{18:[1,54]},{18:[1,55],21:56,35:[1,27],38:26},{18:[2,44],35:[2,44]},{5:[2,3],8:21,9:7,11:8,12:9,13:10,14:[1,11],15:[1,12],16:[1,13],19:[1,19],20:[2,3],22:[1,14],23:[1,15],24:[1,16]},{14:[2,17],15:[2,17],16:[2,17],19:[2,17],20:[2,17],22:[2,17],23:[2,17],24:[2,17]},{18:[2,25],21:41,27:57,28:[1,45],29:58,30:[1,42],31:[1,43],32:[1,44],33:40,34:46,35:[1,47],38:26},{18:[2,26]},{18:[2,30],28:[2,30],30:[2,30],31:[2,30],32:[2,30],35:[2,30]},{18:[2,36],34:59,35:[1,60]},{18:[2,31],28:[2,31],30:[2,31],31:[2,31],32:[2,31],35:[2,31]},{18:[2,32],28:[2,32],30:[2,32],31:[2,32],32:[2,32],35:[2,32]},{18:[2,33],28:[2,33],30:[2,33],31:[2,33],32:[2,33],35:[2,33]},{18:[2,34],28:[2,34],30:[2,34],31:[2,34],32:[2,34],35:[2,34]},{18:[2,35],28:[2,35],30:[2,35],31:[2,35],32:[2,35],35:[2,35]},{18:[2,38],35:[2,38]},{18:[2,47],28:[2,47],30:[2,47],31:[2,47],32:[2,47],35:[2,47],36:[1,61],39:[2,47]},{35:[1,62]},{5:[2,10],14:[2,10],15:[2,10],16:[2,10],19:[2,10],20:[2,10],22:[2,10],23:[2,10],24:[2,10]},{21:63,35:[1,27],38:26},{5:[2,11],14:[2,11],15:[2,11],16:[2,11],19:[2,11],20:[2,11],22:[2,11],23:[2,11],24:[2,11]},{14:[2,16],15:[2,16],16:[2,16],19:[2,16],20:[2,16],22:[2,16],23:[2,16],24:[2,16]},{5:[2,19],14:[2,19],15:[2,19],16:[2,19],19:[2,19],20:[2,19],22:[2,19],23:[2,19],24:[2,19]},{5:[2,20],14:[2,20],15:[2,20],16:[2,20],19:[2,20],20:[2,20],22:[2,20],23:[2,20],24:[2,20]},{5:[2,21],14:[2,21],15:[2,21],16:[2,21],19:[2,21],20:[2,21],22:[2,21],23:[2,21],24:[2,21]},{18:[1,64]},{18:[2,24]},{18:[2,29],28:[2,29],30:[2,29],31:[2,29],32:[2,29],35:[2,29]},{18:[2,37],35:[2,37]},{36:[1,61]},{21:65,28:[1,69],30:[1,66],31:[1,67],32:[1,68],35:[1,27],38:26},{18:[2,46],28:[2,46],30:[2,46],31:[2,46],32:[2,46],35:[2,46],39:[2,46]},{18:[1,70]},{5:[2,22],14:[2,22],15:[2,22],16:[2,22],19:[2,22],20:[2,22],22:[2,22],23:[2,22],24:[2,22]},{18:[2,39],35:[2,39]},{18:[2,40],35:[2,40]},{18:[2,41],35:[2,41]},{18:[2,42],35:[2,42]},{18:[2,43],35:[2,43]},{5:[2,18],14:[2,18],15:[2,18],16:[2,18],19:[2,18],20:[2,18],22:[2,18],23:[2,18],24:[2,18]}],
defaultActions: {17:[2,1],25:[2,28],38:[2,26],57:[2,24]},
parseError: function parseError(str, hash) {
    throw new Error(str);
},
parse: function parse(input) {
    var self = this, stack = [0], vstack = [null], lstack = [], table = this.table, yytext = "", yylineno = 0, yyleng = 0, recovering = 0, TERROR = 2, EOF = 1;
    this.lexer.setInput(input);
    this.lexer.yy = this.yy;
    this.yy.lexer = this.lexer;
    this.yy.parser = this;
    if (typeof this.lexer.yylloc == "undefined")
        this.lexer.yylloc = {};
    var yyloc = this.lexer.yylloc;
    lstack.push(yyloc);
    var ranges = this.lexer.options && this.lexer.options.ranges;
    if (typeof this.yy.parseError === "function")
        this.parseError = this.yy.parseError;
    function popStack(n) {
        stack.length = stack.length - 2 * n;
        vstack.length = vstack.length - n;
        lstack.length = lstack.length - n;
    }
    function lex() {
        var token;
        token = self.lexer.lex() || 1;
        if (typeof token !== "number") {
            token = self.symbols_[token] || token;
        }
        return token;
    }
    var symbol, preErrorSymbol, state, action, a, r, yyval = {}, p, len, newState, expected;
    while (true) {
        state = stack[stack.length - 1];
        if (this.defaultActions[state]) {
            action = this.defaultActions[state];
        } else {
            if (symbol === null || typeof symbol == "undefined") {
                symbol = lex();
            }
            action = table[state] && table[state][symbol];
        }
        if (typeof action === "undefined" || !action.length || !action[0]) {
            var errStr = "";
            if (!recovering) {
                expected = [];
                for (p in table[state])
                    if (this.terminals_[p] && p > 2) {
                        expected.push("'" + this.terminals_[p] + "'");
                    }
                if (this.lexer.showPosition) {
                    errStr = "Parse error on line " + (yylineno + 1) + ":\n" + this.lexer.showPosition() + "\nExpecting " + expected.join(", ") + ", got '" + (this.terminals_[symbol] || symbol) + "'";
                } else {
                    errStr = "Parse error on line " + (yylineno + 1) + ": Unexpected " + (symbol == 1?"end of input":"'" + (this.terminals_[symbol] || symbol) + "'");
                }
                this.parseError(errStr, {text: this.lexer.match, token: this.terminals_[symbol] || symbol, line: this.lexer.yylineno, loc: yyloc, expected: expected});
            }
        }
        if (action[0] instanceof Array && action.length > 1) {
            throw new Error("Parse Error: multiple actions possible at state: " + state + ", token: " + symbol);
        }
        switch (action[0]) {
        case 1:
            stack.push(symbol);
            vstack.push(this.lexer.yytext);
            lstack.push(this.lexer.yylloc);
            stack.push(action[1]);
            symbol = null;
            if (!preErrorSymbol) {
                yyleng = this.lexer.yyleng;
                yytext = this.lexer.yytext;
                yylineno = this.lexer.yylineno;
                yyloc = this.lexer.yylloc;
                if (recovering > 0)
                    recovering--;
            } else {
                symbol = preErrorSymbol;
                preErrorSymbol = null;
            }
            break;
        case 2:
            len = this.productions_[action[1]][1];
            yyval.$ = vstack[vstack.length - len];
            yyval._$ = {first_line: lstack[lstack.length - (len || 1)].first_line, last_line: lstack[lstack.length - 1].last_line, first_column: lstack[lstack.length - (len || 1)].first_column, last_column: lstack[lstack.length - 1].last_column};
            if (ranges) {
                yyval._$.range = [lstack[lstack.length - (len || 1)].range[0], lstack[lstack.length - 1].range[1]];
            }
            r = this.performAction.call(yyval, yytext, yyleng, yylineno, this.yy, action[1], vstack, lstack);
            if (typeof r !== "undefined") {
                return r;
            }
            if (len) {
                stack = stack.slice(0, -1 * len * 2);
                vstack = vstack.slice(0, -1 * len);
                lstack = lstack.slice(0, -1 * len);
            }
            stack.push(this.productions_[action[1]][0]);
            vstack.push(yyval.$);
            lstack.push(yyval._$);
            newState = table[stack[stack.length - 2]][stack[stack.length - 1]];
            stack.push(newState);
            break;
        case 3:
            return true;
        }
    }
    return true;
}
};
/* Jison generated lexer */
var lexer = (function(){
var lexer = ({EOF:1,
parseError:function parseError(str, hash) {
        if (this.yy.parser) {
            this.yy.parser.parseError(str, hash);
        } else {
            throw new Error(str);
        }
    },
setInput:function (input) {
        this._input = input;
        this._more = this._less = this.done = false;
        this.yylineno = this.yyleng = 0;
        this.yytext = this.matched = this.match = '';
        this.conditionStack = ['INITIAL'];
        this.yylloc = {first_line:1,first_column:0,last_line:1,last_column:0};
        if (this.options.ranges) this.yylloc.range = [0,0];
        this.offset = 0;
        return this;
    },
input:function () {
        var ch = this._input[0];
        this.yytext += ch;
        this.yyleng++;
        this.offset++;
        this.match += ch;
        this.matched += ch;
        var lines = ch.match(/(?:\r\n?|\n).*/g);
        if (lines) {
            this.yylineno++;
            this.yylloc.last_line++;
        } else {
            this.yylloc.last_column++;
        }
        if (this.options.ranges) this.yylloc.range[1]++;

        this._input = this._input.slice(1);
        return ch;
    },
unput:function (ch) {
        var len = ch.length;
        var lines = ch.split(/(?:\r\n?|\n)/g);

        this._input = ch + this._input;
        this.yytext = this.yytext.substr(0, this.yytext.length-len-1);
        //this.yyleng -= len;
        this.offset -= len;
        var oldLines = this.match.split(/(?:\r\n?|\n)/g);
        this.match = this.match.substr(0, this.match.length-1);
        this.matched = this.matched.substr(0, this.matched.length-1);

        if (lines.length-1) this.yylineno -= lines.length-1;
        var r = this.yylloc.range;

        this.yylloc = {first_line: this.yylloc.first_line,
          last_line: this.yylineno+1,
          first_column: this.yylloc.first_column,
          last_column: lines ?
              (lines.length === oldLines.length ? this.yylloc.first_column : 0) + oldLines[oldLines.length - lines.length].length - lines[0].length:
              this.yylloc.first_column - len
          };

        if (this.options.ranges) {
            this.yylloc.range = [r[0], r[0] + this.yyleng - len];
        }
        return this;
    },
more:function () {
        this._more = true;
        return this;
    },
less:function (n) {
        this.unput(this.match.slice(n));
    },
pastInput:function () {
        var past = this.matched.substr(0, this.matched.length - this.match.length);
        return (past.length > 20 ? '...':'') + past.substr(-20).replace(/\n/g, "");
    },
upcomingInput:function () {
        var next = this.match;
        if (next.length < 20) {
            next += this._input.substr(0, 20-next.length);
        }
        return (next.substr(0,20)+(next.length > 20 ? '...':'')).replace(/\n/g, "");
    },
showPosition:function () {
        var pre = this.pastInput();
        var c = new Array(pre.length + 1).join("-");
        return pre + this.upcomingInput() + "\n" + c+"^";
    },
next:function () {
        if (this.done) {
            return this.EOF;
        }
        if (!this._input) this.done = true;

        var token,
            match,
            tempMatch,
            index,
            col,
            lines;
        if (!this._more) {
            this.yytext = '';
            this.match = '';
        }
        var rules = this._currentRules();
        for (var i=0;i < rules.length; i++) {
            tempMatch = this._input.match(this.rules[rules[i]]);
            if (tempMatch && (!match || tempMatch[0].length > match[0].length)) {
                match = tempMatch;
                index = i;
                if (!this.options.flex) break;
            }
        }
        if (match) {
            lines = match[0].match(/(?:\r\n?|\n).*/g);
            if (lines) this.yylineno += lines.length;
            this.yylloc = {first_line: this.yylloc.last_line,
                           last_line: this.yylineno+1,
                           first_column: this.yylloc.last_column,
                           last_column: lines ? lines[lines.length-1].length-lines[lines.length-1].match(/\r?\n?/)[0].length : this.yylloc.last_column + match[0].length};
            this.yytext += match[0];
            this.match += match[0];
            this.matches = match;
            this.yyleng = this.yytext.length;
            if (this.options.ranges) {
                this.yylloc.range = [this.offset, this.offset += this.yyleng];
            }
            this._more = false;
            this._input = this._input.slice(match[0].length);
            this.matched += match[0];
            token = this.performAction.call(this, this.yy, this, rules[index],this.conditionStack[this.conditionStack.length-1]);
            if (this.done && this._input) this.done = false;
            if (token) return token;
            else return;
        }
        if (this._input === "") {
            return this.EOF;
        } else {
            return this.parseError('Lexical error on line '+(this.yylineno+1)+'. Unrecognized text.\n'+this.showPosition(),
                    {text: "", token: null, line: this.yylineno});
        }
    },
lex:function lex() {
        var r = this.next();
        if (typeof r !== 'undefined') {
            return r;
        } else {
            return this.lex();
        }
    },
begin:function begin(condition) {
        this.conditionStack.push(condition);
    },
popState:function popState() {
        return this.conditionStack.pop();
    },
_currentRules:function _currentRules() {
        return this.conditions[this.conditionStack[this.conditionStack.length-1]].rules;
    },
topState:function () {
        return this.conditionStack[this.conditionStack.length-2];
    },
pushState:function begin(condition) {
        this.begin(condition);
    }});
lexer.options = {};
lexer.performAction = function anonymous(yy,yy_,$avoiding_name_collisions,YY_START) {

var YYSTATE=YY_START
switch($avoiding_name_collisions) {
case 0:
                                   if(yy_.yytext.slice(-1) !== "\\") this.begin("mu");
                                   if(yy_.yytext.slice(-1) === "\\") yy_.yytext = yy_.yytext.substr(0,yy_.yyleng-1), this.begin("emu");
                                   if(yy_.yytext) return 14;
                                 
break;
case 1: return 14; 
break;
case 2:
                                   if(yy_.yytext.slice(-1) !== "\\") this.popState();
                                   if(yy_.yytext.slice(-1) === "\\") yy_.yytext = yy_.yytext.substr(0,yy_.yyleng-1);
                                   return 14;
                                 
break;
case 3: yy_.yytext = yy_.yytext.substr(0, yy_.yyleng-4); this.popState(); return 15; 
break;
case 4: this.begin("par"); return 24; 
break;
case 5: return 16; 
break;
case 6: return 20; 
break;
case 7: return 19; 
break;
case 8: return 19; 
break;
case 9: return 23; 
break;
case 10: return 23; 
break;
case 11: this.popState(); this.begin('com'); 
break;
case 12: yy_.yytext = yy_.yytext.substr(3,yy_.yyleng-5); this.popState(); return 15; 
break;
case 13: return 22; 
break;
case 14: return 36; 
break;
case 15: return 35; 
break;
case 16: return 35; 
break;
case 17: return 39; 
break;
case 18: /*ignore whitespace*/ 
break;
case 19: this.popState(); return 18; 
break;
case 20: this.popState(); return 18; 
break;
case 21: yy_.yytext = yy_.yytext.substr(1,yy_.yyleng-2).replace(/\\"/g,'"'); return 30; 
break;
case 22: yy_.yytext = yy_.yytext.substr(1,yy_.yyleng-2).replace(/\\'/g,"'"); return 30; 
break;
case 23: yy_.yytext = yy_.yytext.substr(1); return 28; 
break;
case 24: return 32; 
break;
case 25: return 32; 
break;
case 26: return 31; 
break;
case 27: return 35; 
break;
case 28: yy_.yytext = yy_.yytext.substr(1, yy_.yyleng-2); return 35; 
break;
case 29: return 'INVALID'; 
break;
case 30: /*ignore whitespace*/ 
break;
case 31: this.popState(); return 37; 
break;
case 32: return 5; 
break;
}
};
lexer.rules = [/^(?:[^\x00]*?(?=(\{\{)))/,/^(?:[^\x00]+)/,/^(?:[^\x00]{2,}?(?=(\{\{|$)))/,/^(?:[\s\S]*?--\}\})/,/^(?:\{\{>)/,/^(?:\{\{#)/,/^(?:\{\{\/)/,/^(?:\{\{\^)/,/^(?:\{\{\s*else\b)/,/^(?:\{\{\{)/,/^(?:\{\{&)/,/^(?:\{\{!--)/,/^(?:\{\{![\s\S]*?\}\})/,/^(?:\{\{)/,/^(?:=)/,/^(?:\.(?=[} ]))/,/^(?:\.\.)/,/^(?:[\/.])/,/^(?:\s+)/,/^(?:\}\}\})/,/^(?:\}\})/,/^(?:"(\\["]|[^"])*")/,/^(?:'(\\[']|[^'])*')/,/^(?:@[a-zA-Z]+)/,/^(?:true(?=[}\s]))/,/^(?:false(?=[}\s]))/,/^(?:[0-9]+(?=[}\s]))/,/^(?:[a-zA-Z0-9_$-]+(?=[=}\s\/.]))/,/^(?:\[[^\]]*\])/,/^(?:.)/,/^(?:\s+)/,/^(?:[a-zA-Z0-9_$-/]+)/,/^(?:$)/];
lexer.conditions = {"mu":{"rules":[4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,32],"inclusive":false},"emu":{"rules":[2],"inclusive":false},"com":{"rules":[3],"inclusive":false},"par":{"rules":[30,31],"inclusive":false},"INITIAL":{"rules":[0,1,32],"inclusive":true}};
return lexer;})()
parser.lexer = lexer;
function Parser () { this.yy = {}; }Parser.prototype = parser;parser.Parser = Parser;
return new Parser;
})();;
// lib/handlebars/compiler/base.js
Handlebars.Parser = handlebars;

Handlebars.parse = function(string) {
  Handlebars.Parser.yy = Handlebars.AST;
  return Handlebars.Parser.parse(string);
};

Handlebars.print = function(ast) {
  return new Handlebars.PrintVisitor().accept(ast);
};;
// lib/handlebars/compiler/ast.js
(function() {

  Handlebars.AST = {};

  Handlebars.AST.ProgramNode = function(statements, inverse) {
    this.type = "program";
    this.statements = statements;
    if(inverse) { this.inverse = new Handlebars.AST.ProgramNode(inverse); }
  };

  Handlebars.AST.MustacheNode = function(rawParams, hash, unescaped) {
    this.type = "mustache";
    this.escaped = !unescaped;
    this.hash = hash;

    var id = this.id = rawParams[0];
    var params = this.params = rawParams.slice(1);

    // a mustache is an eligible helper if:
    // * its id is simple (a single part, not `this` or `..`)
    var eligibleHelper = this.eligibleHelper = id.isSimple;

    // a mustache is definitely a helper if:
    // * it is an eligible helper, and
    // * it has at least one parameter or hash segment
    this.isHelper = eligibleHelper && (params.length || hash);

    // if a mustache is an eligible helper but not a definite
    // helper, it is ambiguous, and will be resolved in a later
    // pass or at runtime.
  };

  Handlebars.AST.PartialNode = function(partialName, context) {
    this.type         = "partial";
    this.partialName  = partialName;
    this.context      = context;
  };

  var verifyMatch = function(open, close) {
    if(open.original !== close.original) {
      throw new Handlebars.Exception(open.original + " doesn't match " + close.original);
    }
  };

  Handlebars.AST.BlockNode = function(mustache, program, inverse, close) {
    verifyMatch(mustache.id, close);
    this.type = "block";
    this.mustache = mustache;
    this.program  = program;
    this.inverse  = inverse;

    if (this.inverse && !this.program) {
      this.isInverse = true;
    }
  };

  Handlebars.AST.ContentNode = function(string) {
    this.type = "content";
    this.string = string;
  };

  Handlebars.AST.HashNode = function(pairs) {
    this.type = "hash";
    this.pairs = pairs;
  };

  Handlebars.AST.IdNode = function(parts) {
    this.type = "ID";
    this.original = parts.join(".");

    var dig = [], depth = 0;

    for(var i=0,l=parts.length; i<l; i++) {
      var part = parts[i];

      if(part === "..") { depth++; }
      else if(part === "." || part === "this") { this.isScoped = true; }
      else { dig.push(part); }
    }

    this.parts    = dig;
    this.string   = dig.join('.');
    this.depth    = depth;

    // an ID is simple if it only has one part, and that part is not
    // `..` or `this`.
    this.isSimple = parts.length === 1 && !this.isScoped && depth === 0;

    this.stringModeValue = this.string;
  };

  Handlebars.AST.PartialNameNode = function(name) {
    this.type = "PARTIAL_NAME";
    this.name = name;
  };

  Handlebars.AST.DataNode = function(id) {
    this.type = "DATA";
    this.id = id;
  };

  Handlebars.AST.StringNode = function(string) {
    this.type = "STRING";
    this.string = string;
    this.stringModeValue = string;
  };

  Handlebars.AST.IntegerNode = function(integer) {
    this.type = "INTEGER";
    this.integer = integer;
    this.stringModeValue = Number(integer);
  };

  Handlebars.AST.BooleanNode = function(bool) {
    this.type = "BOOLEAN";
    this.bool = bool;
    this.stringModeValue = bool === "true";
  };

  Handlebars.AST.CommentNode = function(comment) {
    this.type = "comment";
    this.comment = comment;
  };

})();;
// lib/handlebars/utils.js

var errorProps = ['description', 'fileName', 'lineNumber', 'message', 'name', 'number', 'stack'];

Handlebars.Exception = function(message) {
  var tmp = Error.prototype.constructor.apply(this, arguments);

  // Unfortunately errors are not enumerable in Chrome (at least), so `for prop in tmp` doesn't work.
  for (var idx = 0; idx < errorProps.length; idx++) {
    this[errorProps[idx]] = tmp[errorProps[idx]];
  }
};
Handlebars.Exception.prototype = new Error();

// Build out our basic SafeString type
Handlebars.SafeString = function(string) {
  this.string = string;
};
Handlebars.SafeString.prototype.toString = function() {
  return this.string.toString();
};

(function() {
  var escape = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#x27;",
    "`": "&#x60;"
  };

  var badChars = /[&<>"'`]/g;
  var possible = /[&<>"'`]/;

  var escapeChar = function(chr) {
    return escape[chr] || "&amp;";
  };

  Handlebars.Utils = {
    escapeExpression: function(string) {
      // don't escape SafeStrings, since they're already safe
      if (string instanceof Handlebars.SafeString) {
        return string.toString();
      } else if (string == null || string === false) {
        return "";
      }

      if(!possible.test(string)) { return string; }
      return string.replace(badChars, escapeChar);
    },

    isEmpty: function(value) {
      if (!value && value !== 0) {
        return true;
      } else if(Object.prototype.toString.call(value) === "[object Array]" && value.length === 0) {
        return true;
      } else {
        return false;
      }
    }
  };
})();;
// lib/handlebars/compiler/compiler.js

/*jshint eqnull:true*/
Handlebars.Compiler = function() {};
Handlebars.JavaScriptCompiler = function() {};

(function(Compiler, JavaScriptCompiler) {
  // the foundHelper register will disambiguate helper lookup from finding a
  // function in a context. This is necessary for mustache compatibility, which
  // requires that context functions in blocks are evaluated by blockHelperMissing,
  // and then proceed as if the resulting value was provided to blockHelperMissing.

  Compiler.prototype = {
    compiler: Compiler,

    disassemble: function() {
      var opcodes = this.opcodes, opcode, out = [], params, param;

      for (var i=0, l=opcodes.length; i<l; i++) {
        opcode = opcodes[i];

        if (opcode.opcode === 'DECLARE') {
          out.push("DECLARE " + opcode.name + "=" + opcode.value);
        } else {
          params = [];
          for (var j=0; j<opcode.args.length; j++) {
            param = opcode.args[j];
            if (typeof param === "string") {
              param = "\"" + param.replace("\n", "\\n") + "\"";
            }
            params.push(param);
          }
          out.push(opcode.opcode + " " + params.join(" "));
        }
      }

      return out.join("\n");
    },

    guid: 0,

    compile: function(program, options) {
      this.children = [];
      this.depths = {list: []};
      this.options = options;

      // These changes will propagate to the other compiler components
      var knownHelpers = this.options.knownHelpers;
      this.options.knownHelpers = {
        'helperMissing': true,
        'blockHelperMissing': true,
        'each': true,
        'if': true,
        'unless': true,
        'with': true,
        'log': true
      };
      if (knownHelpers) {
        for (var name in knownHelpers) {
          this.options.knownHelpers[name] = knownHelpers[name];
        }
      }

      return this.program(program);
    },

    accept: function(node) {
      return this[node.type](node);
    },

    program: function(program) {
      var statements = program.statements, statement;
      this.opcodes = [];

      for(var i=0, l=statements.length; i<l; i++) {
        statement = statements[i];
        this[statement.type](statement);
      }
      this.isSimple = l === 1;

      this.depths.list = this.depths.list.sort(function(a, b) {
        return a - b;
      });

      return this;
    },

    compileProgram: function(program) {
      var result = new this.compiler().compile(program, this.options);
      var guid = this.guid++, depth;

      this.usePartial = this.usePartial || result.usePartial;

      this.children[guid] = result;

      for(var i=0, l=result.depths.list.length; i<l; i++) {
        depth = result.depths.list[i];

        if(depth < 2) { continue; }
        else { this.addDepth(depth - 1); }
      }

      return guid;
    },

    block: function(block) {
      var mustache = block.mustache,
          program = block.program,
          inverse = block.inverse;

      if (program) {
        program = this.compileProgram(program);
      }

      if (inverse) {
        inverse = this.compileProgram(inverse);
      }

      var type = this.classifyMustache(mustache);

      if (type === "helper") {
        this.helperMustache(mustache, program, inverse);
      } else if (type === "simple") {
        this.simpleMustache(mustache);

        // now that the simple mustache is resolved, we need to
        // evaluate it by executing `blockHelperMissing`
        this.opcode('pushProgram', program);
        this.opcode('pushProgram', inverse);
        this.opcode('pushHash');
        this.opcode('blockValue');
      } else {
        this.ambiguousMustache(mustache, program, inverse);

        // now that the simple mustache is resolved, we need to
        // evaluate it by executing `blockHelperMissing`
        this.opcode('pushProgram', program);
        this.opcode('pushProgram', inverse);
        this.opcode('pushHash');
        this.opcode('ambiguousBlockValue');
      }

      this.opcode('append');
    },

    hash: function(hash) {
      var pairs = hash.pairs, pair, val;

      this.opcode('pushHash');

      for(var i=0, l=pairs.length; i<l; i++) {
        pair = pairs[i];
        val  = pair[1];

        if (this.options.stringParams) {
          this.opcode('pushStringParam', val.stringModeValue, val.type);
        } else {
          this.accept(val);
        }

        this.opcode('assignToHash', pair[0]);
      }
    },

    partial: function(partial) {
      var partialName = partial.partialName;
      this.usePartial = true;

      if(partial.context) {
        this.ID(partial.context);
      } else {
        this.opcode('push', 'depth0');
      }

      this.opcode('invokePartial', partialName.name);
      this.opcode('append');
    },

    content: function(content) {
      this.opcode('appendContent', content.string);
    },

    mustache: function(mustache) {
      var options = this.options;
      var type = this.classifyMustache(mustache);

      if (type === "simple") {
        this.simpleMustache(mustache);
      } else if (type === "helper") {
        this.helperMustache(mustache);
      } else {
        this.ambiguousMustache(mustache);
      }

      if(mustache.escaped && !options.noEscape) {
        this.opcode('appendEscaped');
      } else {
        this.opcode('append');
      }
    },

    ambiguousMustache: function(mustache, program, inverse) {
      var id = mustache.id, name = id.parts[0];

      this.opcode('getContext', id.depth);

      this.opcode('pushProgram', program);
      this.opcode('pushProgram', inverse);

      this.opcode('invokeAmbiguous', name);
    },

    simpleMustache: function(mustache, program, inverse) {
      var id = mustache.id;

      if (id.type === 'DATA') {
        this.DATA(id);
      } else if (id.parts.length) {
        this.ID(id);
      } else {
        // Simplified ID for `this`
        this.addDepth(id.depth);
        this.opcode('getContext', id.depth);
        this.opcode('pushContext');
      }

      this.opcode('resolvePossibleLambda');
    },

    helperMustache: function(mustache, program, inverse) {
      var params = this.setupFullMustacheParams(mustache, program, inverse),
          name = mustache.id.parts[0];

      if (this.options.knownHelpers[name]) {
        this.opcode('invokeKnownHelper', params.length, name);
      } else if (this.knownHelpersOnly) {
        throw new Error("You specified knownHelpersOnly, but used the unknown helper " + name);
      } else {
        this.opcode('invokeHelper', params.length, name);
      }
    },

    ID: function(id) {
      this.addDepth(id.depth);
      this.opcode('getContext', id.depth);

      var name = id.parts[0];
      if (!name) {
        this.opcode('pushContext');
      } else {
        this.opcode('lookupOnContext', id.parts[0]);
      }

      for(var i=1, l=id.parts.length; i<l; i++) {
        this.opcode('lookup', id.parts[i]);
      }
    },

    DATA: function(data) {
      this.options.data = true;
      this.opcode('lookupData', data.id);
    },

    STRING: function(string) {
      this.opcode('pushString', string.string);
    },

    INTEGER: function(integer) {
      this.opcode('pushLiteral', integer.integer);
    },

    BOOLEAN: function(bool) {
      this.opcode('pushLiteral', bool.bool);
    },

    comment: function() {},

    // HELPERS
    opcode: function(name) {
      this.opcodes.push({ opcode: name, args: [].slice.call(arguments, 1) });
    },

    declare: function(name, value) {
      this.opcodes.push({ opcode: 'DECLARE', name: name, value: value });
    },

    addDepth: function(depth) {
      if(isNaN(depth)) { throw new Error("EWOT"); }
      if(depth === 0) { return; }

      if(!this.depths[depth]) {
        this.depths[depth] = true;
        this.depths.list.push(depth);
      }
    },

    classifyMustache: function(mustache) {
      var isHelper   = mustache.isHelper;
      var isEligible = mustache.eligibleHelper;
      var options    = this.options;

      // if ambiguous, we can possibly resolve the ambiguity now
      if (isEligible && !isHelper) {
        var name = mustache.id.parts[0];

        if (options.knownHelpers[name]) {
          isHelper = true;
        } else if (options.knownHelpersOnly) {
          isEligible = false;
        }
      }

      if (isHelper) { return "helper"; }
      else if (isEligible) { return "ambiguous"; }
      else { return "simple"; }
    },

    pushParams: function(params) {
      var i = params.length, param;

      while(i--) {
        param = params[i];

        if(this.options.stringParams) {
          if(param.depth) {
            this.addDepth(param.depth);
          }

          this.opcode('getContext', param.depth || 0);
          this.opcode('pushStringParam', param.stringModeValue, param.type);
        } else {
          this[param.type](param);
        }
      }
    },

    setupMustacheParams: function(mustache) {
      var params = mustache.params;
      this.pushParams(params);

      if(mustache.hash) {
        this.hash(mustache.hash);
      } else {
        this.opcode('pushHash');
      }

      return params;
    },

    // this will replace setupMustacheParams when we're done
    setupFullMustacheParams: function(mustache, program, inverse) {
      var params = mustache.params;
      this.pushParams(params);

      this.opcode('pushProgram', program);
      this.opcode('pushProgram', inverse);

      if(mustache.hash) {
        this.hash(mustache.hash);
      } else {
        this.opcode('pushHash');
      }

      return params;
    }
  };

  var Literal = function(value) {
    this.value = value;
  };

  JavaScriptCompiler.prototype = {
    // PUBLIC API: You can override these methods in a subclass to provide
    // alternative compiled forms for name lookup and buffering semantics
    nameLookup: function(parent, name, type) {
      if (/^[0-9]+$/.test(name)) {
        return parent + "[" + name + "]";
      } else if (JavaScriptCompiler.isValidJavaScriptVariableName(name)) {
        return parent + "." + name;
      }
      else {
        return parent + "['" + name + "']";
      }
    },

    appendToBuffer: function(string) {
      if (this.environment.isSimple) {
        return "return " + string + ";";
      } else {
        return "buffer += " + string + ";";
      }
    },

    initializeBuffer: function() {
      return this.quotedString("");
    },

    namespace: "Handlebars",
    // END PUBLIC API

    compile: function(environment, options, context, asObject) {
      this.environment = environment;
      this.options = options || {};

      Handlebars.log(Handlebars.logger.DEBUG, this.environment.disassemble() + "\n\n");

      this.name = this.environment.name;
      this.isChild = !!context;
      this.context = context || {
        programs: [],
        aliases: { }
      };

      this.preamble();

      this.stackSlot = 0;
      this.stackVars = [];
      this.registers = { list: [] };
      this.compileStack = [];

      this.compileChildren(environment, options);

      var opcodes = environment.opcodes, opcode;

      this.i = 0;

      for(l=opcodes.length; this.i<l; this.i++) {
        opcode = opcodes[this.i];

        if(opcode.opcode === 'DECLARE') {
          this[opcode.name] = opcode.value;
        } else {
          this[opcode.opcode].apply(this, opcode.args);
        }
      }

      return this.createFunctionContext(asObject);
    },

    nextOpcode: function() {
      var opcodes = this.environment.opcodes, opcode = opcodes[this.i + 1];
      return opcodes[this.i + 1];
    },

    eat: function(opcode) {
      this.i = this.i + 1;
    },

    preamble: function() {
      var out = [];

      if (!this.isChild) {
        var namespace = this.namespace;
        var copies = "helpers = helpers || " + namespace + ".helpers;";
        if (this.environment.usePartial) { copies = copies + " partials = partials || " + namespace + ".partials;"; }
        if (this.options.data) { copies = copies + " data = data || {};"; }
        out.push(copies);
      } else {
        out.push('');
      }

      if (!this.environment.isSimple) {
        out.push(", buffer = " + this.initializeBuffer());
      } else {
        out.push("");
      }

      // track the last context pushed into place to allow skipping the
      // getContext opcode when it would be a noop
      this.lastContext = 0;
      this.source = out;
    },

    createFunctionContext: function(asObject) {
      var locals = this.stackVars.concat(this.registers.list);

      if(locals.length > 0) {
        this.source[1] = this.source[1] + ", " + locals.join(", ");
      }

      // Generate minimizer alias mappings
      if (!this.isChild) {
        var aliases = [];
        for (var alias in this.context.aliases) {
          this.source[1] = this.source[1] + ', ' + alias + '=' + this.context.aliases[alias];
        }
      }

      if (this.source[1]) {
        this.source[1] = "var " + this.source[1].substring(2) + ";";
      }

      // Merge children
      if (!this.isChild) {
        this.source[1] += '\n' + this.context.programs.join('\n') + '\n';
      }

      if (!this.environment.isSimple) {
        this.source.push("return buffer;");
      }

      var params = this.isChild ? ["depth0", "data"] : ["Handlebars", "depth0", "helpers", "partials", "data"];

      for(var i=0, l=this.environment.depths.list.length; i<l; i++) {
        params.push("depth" + this.environment.depths.list[i]);
      }

      if (asObject) {
        params.push(this.source.join("\n  "));

        return Function.apply(this, params);
      } else {
        var functionSource = 'function ' + (this.name || '') + '(' + params.join(',') + ') {\n  ' + this.source.join("\n  ") + '}';
        Handlebars.log(Handlebars.logger.DEBUG, functionSource + "\n\n");
        return functionSource;
      }
    },

    // [blockValue]
    //
    // On stack, before: hash, inverse, program, value
    // On stack, after: return value of blockHelperMissing
    //
    // The purpose of this opcode is to take a block of the form
    // `{{#foo}}...{{/foo}}`, resolve the value of `foo`, and
    // replace it on the stack with the result of properly
    // invoking blockHelperMissing.
    blockValue: function() {
      this.context.aliases.blockHelperMissing = 'helpers.blockHelperMissing';

      var params = ["depth0"];
      this.setupParams(0, params);

      this.replaceStack(function(current) {
        params.splice(1, 0, current);
        return "blockHelperMissing.call(" + params.join(", ") + ")";
      });
    },

    // [ambiguousBlockValue]
    //
    // On stack, before: hash, inverse, program, value
    // Compiler value, before: lastHelper=value of last found helper, if any
    // On stack, after, if no lastHelper: same as [blockValue]
    // On stack, after, if lastHelper: value
    ambiguousBlockValue: function() {
      this.context.aliases.blockHelperMissing = 'helpers.blockHelperMissing';

      var params = ["depth0"];
      this.setupParams(0, params);

      var current = this.topStack();
      params.splice(1, 0, current);

      this.source.push("if (!" + this.lastHelper + ") { " + current + " = blockHelperMissing.call(" + params.join(", ") + "); }");
    },

    // [appendContent]
    //
    // On stack, before: ...
    // On stack, after: ...
    //
    // Appends the string value of `content` to the current buffer
    appendContent: function(content) {
      this.source.push(this.appendToBuffer(this.quotedString(content)));
    },

    // [append]
    //
    // On stack, before: value, ...
    // On stack, after: ...
    //
    // Coerces `value` to a String and appends it to the current buffer.
    //
    // If `value` is truthy, or 0, it is coerced into a string and appended
    // Otherwise, the empty string is appended
    append: function() {
      var local = this.popStack();
      this.source.push("if(" + local + " || " + local + " === 0) { " + this.appendToBuffer(local) + " }");
      if (this.environment.isSimple) {
        this.source.push("else { " + this.appendToBuffer("''") + " }");
      }
    },

    // [appendEscaped]
    //
    // On stack, before: value, ...
    // On stack, after: ...
    //
    // Escape `value` and append it to the buffer
    appendEscaped: function() {
      var opcode = this.nextOpcode(), extra = "";
      this.context.aliases.escapeExpression = 'this.escapeExpression';

      if(opcode && opcode.opcode === 'appendContent') {
        extra = " + " + this.quotedString(opcode.args[0]);
        this.eat(opcode);
      }

      this.source.push(this.appendToBuffer("escapeExpression(" + this.popStack() + ")" + extra));
    },

    // [getContext]
    //
    // On stack, before: ...
    // On stack, after: ...
    // Compiler value, after: lastContext=depth
    //
    // Set the value of the `lastContext` compiler value to the depth
    getContext: function(depth) {
      if(this.lastContext !== depth) {
        this.lastContext = depth;
      }
    },

    // [lookupOnContext]
    //
    // On stack, before: ...
    // On stack, after: currentContext[name], ...
    //
    // Looks up the value of `name` on the current context and pushes
    // it onto the stack.
    lookupOnContext: function(name) {
      this.pushStack(this.nameLookup('depth' + this.lastContext, name, 'context'));
    },

    // [pushContext]
    //
    // On stack, before: ...
    // On stack, after: currentContext, ...
    //
    // Pushes the value of the current context onto the stack.
    pushContext: function() {
      this.pushStackLiteral('depth' + this.lastContext);
    },

    // [resolvePossibleLambda]
    //
    // On stack, before: value, ...
    // On stack, after: resolved value, ...
    //
    // If the `value` is a lambda, replace it on the stack by
    // the return value of the lambda
    resolvePossibleLambda: function() {
      this.context.aliases.functionType = '"function"';

      this.replaceStack(function(current) {
        return "typeof " + current + " === functionType ? " + current + ".apply(depth0) : " + current;
      });
    },

    // [lookup]
    //
    // On stack, before: value, ...
    // On stack, after: value[name], ...
    //
    // Replace the value on the stack with the result of looking
    // up `name` on `value`
    lookup: function(name) {
      this.replaceStack(function(current) {
        return current + " == null || " + current + " === false ? " + current + " : " + this.nameLookup(current, name, 'context');
      });
    },

    // [lookupData]
    //
    // On stack, before: ...
    // On stack, after: data[id], ...
    //
    // Push the result of looking up `id` on the current data
    lookupData: function(id) {
      this.pushStack(this.nameLookup('data', id, 'data'));
    },

    // [pushStringParam]
    //
    // On stack, before: ...
    // On stack, after: string, currentContext, ...
    //
    // This opcode is designed for use in string mode, which
    // provides the string value of a parameter along with its
    // depth rather than resolving it immediately.
    pushStringParam: function(string, type) {
      this.pushStackLiteral('depth' + this.lastContext);

      this.pushString(type);

      if (typeof string === 'string') {
        this.pushString(string);
      } else {
        this.pushStackLiteral(string);
      }
    },

    pushHash: function() {
      this.push('{}');

      if (this.options.stringParams) {
        this.register('hashTypes', '{}');
      }
    },

    // [pushString]
    //
    // On stack, before: ...
    // On stack, after: quotedString(string), ...
    //
    // Push a quoted version of `string` onto the stack
    pushString: function(string) {
      this.pushStackLiteral(this.quotedString(string));
    },

    // [push]
    //
    // On stack, before: ...
    // On stack, after: expr, ...
    //
    // Push an expression onto the stack
    push: function(expr) {
      this.pushStack(expr);
    },

    // [pushLiteral]
    //
    // On stack, before: ...
    // On stack, after: value, ...
    //
    // Pushes a value onto the stack. This operation prevents
    // the compiler from creating a temporary variable to hold
    // it.
    pushLiteral: function(value) {
      this.pushStackLiteral(value);
    },

    // [pushProgram]
    //
    // On stack, before: ...
    // On stack, after: program(guid), ...
    //
    // Push a program expression onto the stack. This takes
    // a compile-time guid and converts it into a runtime-accessible
    // expression.
    pushProgram: function(guid) {
      if (guid != null) {
        this.pushStackLiteral(this.programExpression(guid));
      } else {
        this.pushStackLiteral(null);
      }
    },

    // [invokeHelper]
    //
    // On stack, before: hash, inverse, program, params..., ...
    // On stack, after: result of helper invocation
    //
    // Pops off the helper's parameters, invokes the helper,
    // and pushes the helper's return value onto the stack.
    //
    // If the helper is not found, `helperMissing` is called.
    invokeHelper: function(paramSize, name) {
      this.context.aliases.helperMissing = 'helpers.helperMissing';

      var helper = this.lastHelper = this.setupHelper(paramSize, name);
      this.register('foundHelper', helper.name);

      this.pushStack("foundHelper ? foundHelper.call(" +
        helper.callParams + ") " + ": helperMissing.call(" +
        helper.helperMissingParams + ")");
    },

    // [invokeKnownHelper]
    //
    // On stack, before: hash, inverse, program, params..., ...
    // On stack, after: result of helper invocation
    //
    // This operation is used when the helper is known to exist,
    // so a `helperMissing` fallback is not required.
    invokeKnownHelper: function(paramSize, name) {
      var helper = this.setupHelper(paramSize, name);
      this.pushStack(helper.name + ".call(" + helper.callParams + ")");
    },

    // [invokeAmbiguous]
    //
    // On stack, before: hash, inverse, program, params..., ...
    // On stack, after: result of disambiguation
    //
    // This operation is used when an expression like `{{foo}}`
    // is provided, but we don't know at compile-time whether it
    // is a helper or a path.
    //
    // This operation emits more code than the other options,
    // and can be avoided by passing the `knownHelpers` and
    // `knownHelpersOnly` flags at compile-time.
    invokeAmbiguous: function(name) {
      this.context.aliases.functionType = '"function"';

      this.pushStackLiteral('{}');
      var helper = this.setupHelper(0, name);

      var helperName = this.lastHelper = this.nameLookup('helpers', name, 'helper');
      this.register('foundHelper', helperName);

      var nonHelper = this.nameLookup('depth' + this.lastContext, name, 'context');
      var nextStack = this.nextStack();

      this.source.push('if (foundHelper) { ' + nextStack + ' = foundHelper.call(' + helper.callParams + '); }');
      this.source.push('else { ' + nextStack + ' = ' + nonHelper + '; ' + nextStack + ' = typeof ' + nextStack + ' === functionType ? ' + nextStack + '.apply(depth0) : ' + nextStack + '; }');
    },

    // [invokePartial]
    //
    // On stack, before: context, ...
    // On stack after: result of partial invocation
    //
    // This operation pops off a context, invokes a partial with that context,
    // and pushes the result of the invocation back.
    invokePartial: function(name) {
      var params = [this.nameLookup('partials', name, 'partial'), "'" + name + "'", this.popStack(), "helpers", "partials"];

      if (this.options.data) {
        params.push("data");
      }

      this.context.aliases.self = "this";
      this.pushStack("self.invokePartial(" + params.join(", ") + ")");
    },

    // [assignToHash]
    //
    // On stack, before: value, hash, ...
    // On stack, after: hash, ...
    //
    // Pops a value and hash off the stack, assigns `hash[key] = value`
    // and pushes the hash back onto the stack.
    assignToHash: function(key) {
      var value = this.popStack();

      if (this.options.stringParams) {
        var type = this.popStack();
        this.popStack();
        this.source.push("hashTypes['" + key + "'] = " + type + ";");
      }

      var hash = this.topStack();

      this.source.push(hash + "['" + key + "'] = " + value + ";");
    },

    // HELPERS

    compiler: JavaScriptCompiler,

    compileChildren: function(environment, options) {
      var children = environment.children, child, compiler;

      for(var i=0, l=children.length; i<l; i++) {
        child = children[i];
        compiler = new this.compiler();

        this.context.programs.push('');     // Placeholder to prevent name conflicts for nested children
        var index = this.context.programs.length;
        child.index = index;
        child.name = 'program' + index;
        this.context.programs[index] = compiler.compile(child, options, this.context);
      }
    },

    programExpression: function(guid) {
      this.context.aliases.self = "this";

      if(guid == null) {
        return "self.noop";
      }

      var child = this.environment.children[guid],
          depths = child.depths.list, depth;

      var programParams = [child.index, child.name, "data"];

      for(var i=0, l = depths.length; i<l; i++) {
        depth = depths[i];

        if(depth === 1) { programParams.push("depth0"); }
        else { programParams.push("depth" + (depth - 1)); }
      }

      if(depths.length === 0) {
        return "self.program(" + programParams.join(", ") + ")";
      } else {
        programParams.shift();
        return "self.programWithDepth(" + programParams.join(", ") + ")";
      }
    },

    register: function(name, val) {
      this.useRegister(name);
      this.source.push(name + " = " + val + ";");
    },

    useRegister: function(name) {
      if(!this.registers[name]) {
        this.registers[name] = true;
        this.registers.list.push(name);
      }
    },

    pushStackLiteral: function(item) {
      this.compileStack.push(new Literal(item));
      return item;
    },

    pushStack: function(item) {
      var stack = this.incrStack();
      this.source.push(stack + " = " + item + ";");
      this.compileStack.push(stack);
      return stack;
    },

    replaceStack: function(callback) {
      var stack = this.topStack(),
          item = callback.call(this, stack);

      // Prevent modification of the context depth variable. Through replaceStack
      if (/^depth/.test(stack)) {
        stack = this.nextStack();
      }

      this.source.push(stack + " = " + item + ";");
      return stack;
    },

    nextStack: function(skipCompileStack) {
      var name = this.incrStack();
      this.compileStack.push(name);
      return name;
    },

    incrStack: function() {
      this.stackSlot++;
      if(this.stackSlot > this.stackVars.length) { this.stackVars.push("stack" + this.stackSlot); }
      return "stack" + this.stackSlot;
    },

    popStack: function() {
      var item = this.compileStack.pop();

      if (item instanceof Literal) {
        return item.value;
      } else {
        this.stackSlot--;
        return item;
      }
    },

    topStack: function() {
      var item = this.compileStack[this.compileStack.length - 1];

      if (item instanceof Literal) {
        return item.value;
      } else {
        return item;
      }
    },

    quotedString: function(str) {
      return '"' + str
        .replace(/\\/g, '\\\\')
        .replace(/"/g, '\\"')
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '\\r') + '"';
    },

    setupHelper: function(paramSize, name) {
      var params = [];
      this.setupParams(paramSize, params);
      var foundHelper = this.nameLookup('helpers', name, 'helper');

      return {
        params: params,
        name: foundHelper,
        callParams: ["depth0"].concat(params).join(", "),
        helperMissingParams: ["depth0", this.quotedString(name)].concat(params).join(", ")
      };
    },

    // the params and contexts arguments are passed in arrays
    // to fill in
    setupParams: function(paramSize, params) {
      var options = [], contexts = [], types = [], param, inverse, program;

      options.push("hash:" + this.popStack());

      inverse = this.popStack();
      program = this.popStack();

      // Avoid setting fn and inverse if neither are set. This allows
      // helpers to do a check for `if (options.fn)`
      if (program || inverse) {
        if (!program) {
          this.context.aliases.self = "this";
          program = "self.noop";
        }

        if (!inverse) {
         this.context.aliases.self = "this";
          inverse = "self.noop";
        }

        options.push("inverse:" + inverse);
        options.push("fn:" + program);
      }

      for(var i=0; i<paramSize; i++) {
        param = this.popStack();
        params.push(param);

        if(this.options.stringParams) {
          types.push(this.popStack());
          contexts.push(this.popStack());
        }
      }

      if (this.options.stringParams) {
        options.push("contexts:[" + contexts.join(",") + "]");
        options.push("types:[" + types.join(",") + "]");
        options.push("hashTypes:hashTypes");
      }

      if(this.options.data) {
        options.push("data:data");
      }

      params.push("{" + options.join(",") + "}");
      return params.join(", ");
    }
  };

  var reservedWords = (
    "break else new var" +
    " case finally return void" +
    " catch for switch while" +
    " continue function this with" +
    " default if throw" +
    " delete in try" +
    " do instanceof typeof" +
    " abstract enum int short" +
    " boolean export interface static" +
    " byte extends long super" +
    " char final native synchronized" +
    " class float package throws" +
    " const goto private transient" +
    " debugger implements protected volatile" +
    " double import public let yield"
  ).split(" ");

  var compilerWords = JavaScriptCompiler.RESERVED_WORDS = {};

  for(var i=0, l=reservedWords.length; i<l; i++) {
    compilerWords[reservedWords[i]] = true;
  }

  JavaScriptCompiler.isValidJavaScriptVariableName = function(name) {
    if(!JavaScriptCompiler.RESERVED_WORDS[name] && /^[a-zA-Z_$][0-9a-zA-Z_$]+$/.test(name)) {
      return true;
    }
    return false;
  };

})(Handlebars.Compiler, Handlebars.JavaScriptCompiler);

Handlebars.precompile = function(string, options) {
  if (typeof string !== 'string') {
    throw new Handlebars.Exception("You must pass a string to Handlebars.compile. You passed " + string);
  }

  options = options || {};
  if (!('data' in options)) {
    options.data = true;
  }
  var ast = Handlebars.parse(string);
  var environment = new Handlebars.Compiler().compile(ast, options);
  return new Handlebars.JavaScriptCompiler().compile(environment, options);
};

Handlebars.compile = function(string, options) {
  if (typeof string !== 'string') {
    throw new Handlebars.Exception("You must pass a string to Handlebars.compile. You passed " + string);
  }

  options = options || {};
  if (!('data' in options)) {
    options.data = true;
  }
  var compiled;
  function compile() {
    var ast = Handlebars.parse(string);
    var environment = new Handlebars.Compiler().compile(ast, options);
    var templateSpec = new Handlebars.JavaScriptCompiler().compile(environment, options, undefined, true);
    return Handlebars.template(templateSpec);
  }

  // Template is only compiled on first use and cached after that point.
  return function(context, options) {
    if (!compiled) {
      compiled = compile();
    }
    return compiled.call(this, context, options);
  };
};
;
// lib/handlebars/runtime.js
Handlebars.VM = {
  template: function(templateSpec) {
    // Just add water
    var container = {
      escapeExpression: Handlebars.Utils.escapeExpression,
      invokePartial: Handlebars.VM.invokePartial,
      programs: [],
      program: function(i, fn, data) {
        var programWrapper = this.programs[i];
        if(data) {
          return Handlebars.VM.program(fn, data);
        } else if(programWrapper) {
          return programWrapper;
        } else {
          programWrapper = this.programs[i] = Handlebars.VM.program(fn);
          return programWrapper;
        }
      },
      programWithDepth: Handlebars.VM.programWithDepth,
      noop: Handlebars.VM.noop
    };

    return function(context, options) {
      options = options || {};
      return templateSpec.call(container, Handlebars, context, options.helpers, options.partials, options.data);
    };
  },

  programWithDepth: function(fn, data, $depth) {
    var args = Array.prototype.slice.call(arguments, 2);

    return function(context, options) {
      options = options || {};

      return fn.apply(this, [context, options.data || data].concat(args));
    };
  },
  program: function(fn, data) {
    return function(context, options) {
      options = options || {};

      return fn(context, options.data || data);
    };
  },
  noop: function() { return ""; },
  invokePartial: function(partial, name, context, helpers, partials, data) {
    var options = { helpers: helpers, partials: partials, data: data };

    if(partial === undefined) {
      throw new Handlebars.Exception("The partial " + name + " could not be found");
    } else if(partial instanceof Function) {
      return partial(context, options);
    } else if (!Handlebars.compile) {
      throw new Handlebars.Exception("The partial " + name + " could not be compiled when running in runtime-only mode");
    } else {
      partials[name] = Handlebars.compile(partial, {data: data !== undefined});
      return partials[name](context, options);
    }
  }
};

Handlebars.template = Handlebars.VM.template;
;

// lib/emblem.js
var Emblem;

this.Emblem = {};

Emblem = this.Emblem;

Emblem.VERSION = "0.0.2";

// exports = Emblem;

// 

// 

// 

// 

// 
;
// lib/parser.js

// 
// 

Emblem.Parser = (function() {
  /*
   * Generated by PEG.js 0.7.0.
   *
   * http://pegjs.majda.cz/
   */

  function peg$subclass(child, parent) {
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor();
  }

  function SyntaxError(expected, found, offset, line, column) {
    function buildMessage(expected, found) {
      function stringEscape(s) {
        function hex(ch) { return ch.charCodeAt(0).toString(16).toUpperCase(); }

        return s
          .replace(/\\/g,   '\\\\')
          .replace(/"/g,    '\\"')
          .replace(/\x08/g, '\\b')
          .replace(/\t/g,   '\\t')
          .replace(/\n/g,   '\\n')
          .replace(/\f/g,   '\\f')
          .replace(/\r/g,   '\\r')
          .replace(/[\x00-\x07\x0B\x0E\x0F]/g, function(ch) { return '\\x0' + hex(ch); })
          .replace(/[\x10-\x1F\x80-\xFF]/g,    function(ch) { return '\\x'  + hex(ch); })
          .replace(/[\u0180-\u0FFF]/g,         function(ch) { return '\\u0' + hex(ch); })
          .replace(/[\u1080-\uFFFF]/g,         function(ch) { return '\\u'  + hex(ch); });
      }

      var expectedDesc, foundDesc;

      switch (expected.length) {
        case 0:
          expectedDesc = "end of input";
          break;

        case 1:
          expectedDesc = expected[0];
          break;

        default:
          expectedDesc = expected.slice(0, -1).join(", ")
            + " or "
            + expected[expected.length - 1];
      }

      foundDesc = found ? "\"" + stringEscape(found) + "\"" : "end of input";

      return "Expected " + expectedDesc + " but " + foundDesc + " found.";
    }

    this.expected = expected;
    this.found    = found;
    this.offset   = offset;
    this.line     = line;
    this.column   = column;

    this.name     = "SyntaxError";
    this.message  = buildMessage(expected, found);
  }

  peg$subclass(SyntaxError, Error);

  function parse(input) {
    var options = arguments.length > 1 ? arguments[1] : {},

        peg$startRuleFunctions = { start: peg$parsestart },
        peg$startRuleFunction  = peg$parsestart,

        peg$c0 = [],
        peg$c1 = function(statements) {
          // Coalesce all adjacent ContentNodes into one.

          var compressedStatements = [];
          var buffer = [];

          for(var i = 0; i < statements.length; ++i) {
            var nodes = statements[i];

            for(var j = 0; j < nodes.length; ++j) {
              var node = nodes[j]
              if(node.type === "content") {
                if(node.string) {
                  // Ignore empty strings (comments).
                  buffer.push(node.string);
                }
                continue;
              } 

              // Flush content if present.
              if(buffer.length) {
                compressedStatements.push(new Handlebars.AST.ContentNode(buffer.join('')));
                buffer = [];
              }
              compressedStatements.push(node);
            }
          }

          if(buffer.length) { 
            compressedStatements.push(new Handlebars.AST.ContentNode(buffer.join(''))); 
          }

          return compressedStatements;
        },
        peg$c2 = null,
        peg$c3 = "",
        peg$c4 = "else",
        peg$c5 = "\"else\"",
        peg$c6 = function(c) {return c;},
        peg$c7 = function(c, i) { 
          return new Handlebars.AST.ProgramNode(c, i || []);
        },
        peg$c8 = function(m) { 
          return [m]; 
        },
        peg$c9 = "/",
        peg$c10 = "\"/\"",
        peg$c11 = function() { return []; },
        peg$c12 = /^[A-Z]/,
        peg$c13 = "[A-Z]",
        peg$c14 = function(ret) {
          // TODO make this configurable
          var defaultCapitalizedHelper = 'view';

          if(ret.mustache) {
            // Block. Modify inner MustacheNode and return.

            // Make sure a suffix modifier hasn't already been applied.
            var ch = ret.mustache.id.string.charAt(0);
            if(!ch.match(/[A-Z]/)) return ret;

            ret.mustache = unshiftParam(ret.mustache, defaultCapitalizedHelper);
            return ret;
          } else {

            // Make sure a suffix modifier hasn't already been applied.
            var ch = ret.id.string.charAt(0);
            if(!ch.match(/[A-Z]/)) return ret;

            return unshiftParam(ret, defaultCapitalizedHelper);
          }
        },
        peg$c15 = function(h, c) { 
          var ret = h[0];
          if(c) {
            ret = ret.concat(c[1]);
          }
          ret.push(h[1]);

          return ret;
        },
        peg$c16 = " ",
        peg$c17 = "\" \"",
        peg$c18 = function(h, c, multilineContent) { 
          // h is [[open tag content], closing tag ContentNode]
          var ret = h[0];
          if(c) {
            ret = ret.concat(c);
          }

          if(multilineContent) {
            // Handle multi-line content, e.g.
            // span Hello, 
            //      This is valid markup.

            multilineContent = multilineContent[1];
            for(var i = 0; i < multilineContent.length; ++i) {
              ret = ret.concat(multilineContent[i]);
            }
          }

          // Push the ContentNode
          ret.push(h[1]);

          return ret;
        },
        peg$c19 = function(mustacheNode, block) { 
          if(!block) return mustacheNode;
          var programNode = block[1];
          return new Handlebars.AST.BlockNode(mustacheNode, programNode, programNode.inverse, mustacheNode.id);
        },
        peg$c20 = function(e, ret) {
          var mustache = ret.mustache || ret;
          mustache.escaped = e;
          return ret;
        },
        peg$c21 = function(path, tm, params, hash) { 
          params.unshift(path);

          var mustacheNode = new Handlebars.AST.MustacheNode(params, hash); 

          if(tm == '!') {
            return unshiftParam(mustacheNode, 'unbound');
          } else if(tm == '?') {
            return unshiftParam(mustacheNode, 'if');
          } else if(tm == '^') {
            return unshiftParam(mustacheNode, 'unless');
          }

          return  mustacheNode;
        },
        peg$c22 = function(p, m) { 
          var ret = new String(p);
          ret.trailingModifier = m;
          return ret;
        },
        peg$c23 = function(p) { return p; },
        peg$c24 = "TrailingModifier",
        peg$c25 = /^[!?*\^]/,
        peg$c26 = "[!?*\\^]",
        peg$c27 = function(h) { return new Handlebars.AST.HashNode(h); },
        peg$c28 = "PathIdent",
        peg$c29 = "..",
        peg$c30 = "\"..\"",
        peg$c31 = ".",
        peg$c32 = "\".\"",
        peg$c33 = /^[a-zA-Z0-9_$\-]/,
        peg$c34 = "[a-zA-Z0-9_$\\-]",
        peg$c35 = "=",
        peg$c36 = "\"=\"",
        peg$c37 = function(s) { return s; },
        peg$c38 = "Key",
        peg$c39 = function(h) { return [h[0], h[2]]; },
        peg$c40 = function(first, tail) {
          var ret = [first];
          for(var i = 0; i < tail.length; ++i) {
            //ret = ret.concat(tail[i]);
            ret.push(tail[i]);
          }
          return ret;
        },
        peg$c41 = "PathSeparator",
        peg$c42 = /^[\/.]/,
        peg$c43 = "[\\/.]",
        peg$c44 = function(v) { return new Handlebars.AST.IdNode(v); },
        peg$c45 = function(v) { return new Handlebars.AST.StringNode(v); },
        peg$c46 = function(v) { return new Handlebars.AST.IntegerNode(v); },
        peg$c47 = function(v) { return new Handlebars.AST.BooleanNode(v); },
        peg$c48 = "Boolean",
        peg$c49 = "true",
        peg$c50 = "\"true\"",
        peg$c51 = "false",
        peg$c52 = "\"false\"",
        peg$c53 = "Integer",
        peg$c54 = /^[0-9]/,
        peg$c55 = "[0-9]",
        peg$c56 = function(s) { return parseInt(s); },
        peg$c57 = "\"",
        peg$c58 = "\"\\\"\"",
        peg$c59 = "'",
        peg$c60 = "\"'\"",
        peg$c61 = function(p) { return p[1]; },
        peg$c62 = /^[^"}]/,
        peg$c63 = "[^\"}]",
        peg$c64 = /^[^'}]/,
        peg$c65 = "[^'}]",
        peg$c66 = /^[A-Za-z]/,
        peg$c67 = "[A-Za-z]",
        peg$c68 = function(m) { return [m]; },
        peg$c69 = "|",
        peg$c70 = "\"|\"",
        peg$c71 = "<",
        peg$c72 = "\"<\"",
        peg$c73 = function(t) { return t; },
        peg$c74 = function(nodes, indentedNodes) { 
          for(var i = 0; i < indentedNodes.length; ++i) {
            nodes = nodes.concat(indentedNodes[i]);
          }
          return nodes; 
        },
        peg$c75 = function(first, tail) {
          var ret = [];
          if(first) { ret.push(first); } 
          for(var i = 0; i < tail.length; ++i) {
            var t = tail[i];
            ret.push(t[0]);
            if(t[1]) { ret.push(t[1]); }
          }
          return ret;
        },
        peg$c76 = function(m) { m.escaped = true; return m; },
        peg$c77 = function(m) { m.escaped = false; return m; },
        peg$c78 = function(a) { return new Handlebars.AST.ContentNode(a.join('')); },
        peg$c79 = "any character",
        peg$c80 = function(c) { return c; },
        peg$c81 = "SingleMustacheOpen",
        peg$c82 = "{",
        peg$c83 = "\"{\"",
        peg$c84 = "DoubleMustacheOpen",
        peg$c85 = "{{",
        peg$c86 = "\"{{\"",
        peg$c87 = "TripleMustacheOpen",
        peg$c88 = "{{{",
        peg$c89 = "\"{{{\"",
        peg$c90 = "SingleMustacheClose",
        peg$c91 = "}",
        peg$c92 = "\"}\"",
        peg$c93 = "DoubleMustacheClose",
        peg$c94 = "}}",
        peg$c95 = "\"}}\"",
        peg$c96 = "TripleMustacheClose",
        peg$c97 = "}}}",
        peg$c98 = "\"}}}\"",
        peg$c99 = "InterpolationOpen",
        peg$c100 = "#{",
        peg$c101 = "\"#{\"",
        peg$c102 = "InterpolationClose",
        peg$c103 = "==",
        peg$c104 = "\"==\"",
        peg$c105 = function() { return false; },
        peg$c106 = function() { return true; },
        peg$c107 = function(h, s, m, f) { return [h, s, m, f]; },
        peg$c108 = function(s, m, f) { return [null, s, m, f] },
        peg$c109 = function(h) {
          var tagName = h[0] || 'div',
              shorthandAttributes = h[1] || [],
              inTagMustaches = h[2],
              fullAttributes = h[3],
              id = shorthandAttributes[0],
              classes = shorthandAttributes[1];

          var tagOpenContent = [];
          tagOpenContent.push(new Handlebars.AST.ContentNode('<' + tagName));

          if(id) {
            tagOpenContent.push(new Handlebars.AST.ContentNode(' id="' + id + '"'));
          }

          if(classes && classes.length) {
            tagOpenContent.push(new Handlebars.AST.ContentNode(' class="' + classes.join(' ') + '"'));
          }

          // Pad in tag mustaches with spaces.
          for(var i = 0; i < inTagMustaches.length; ++i) {
            tagOpenContent.push(new Handlebars.AST.ContentNode(' '));
            tagOpenContent.push(inTagMustaches[i]);
          }

          for(var i = 0; i < fullAttributes.length; ++i) {
            tagOpenContent = tagOpenContent.concat(fullAttributes[i]);
          }
          tagOpenContent.push(new Handlebars.AST.ContentNode('>'));

          return [tagOpenContent, new Handlebars.AST.ContentNode('</' + tagName + '>')];
        },
        peg$c110 = function(id, classes) { return [id, classes]; },
        peg$c111 = function(classes) { return [null, classes]; },
        peg$c112 = function(a) {
          return [new Handlebars.AST.ContentNode(' '), a]; 
        },
        peg$c113 = /^[A-Za-z.:0-9]/,
        peg$c114 = "[A-Za-z.:0-9]",
        peg$c115 = function(id) { return new Handlebars.AST.MustacheNode([id]); },
        peg$c116 = function(event, mustacheNode) {
          // Unshift the action helper and augment the hash
          return unshiftParam(mustacheNode, 'action', [['on', new Handlebars.AST.StringNode(event)]]);
        },
        peg$c117 = function(key, value) { 
          var hashNode = new Handlebars.AST.HashNode([[key, new Handlebars.AST.StringNode(value)]]);
          var params = [new Handlebars.AST.IdNode(['bindAttr'])];

          return new Handlebars.AST.MustacheNode(params, hashNode);
        },
        peg$c118 = function(key, value) { 
          var s = key + '=' + '"' + value + '"';
          return new Handlebars.AST.ContentNode(s);
        },
        peg$c119 = "_",
        peg$c120 = "\"_\"",
        peg$c121 = "-",
        peg$c122 = "\"-\"",
        peg$c123 = "#",
        peg$c124 = "\"#\"",
        peg$c125 = function(t) { return t;},
        peg$c126 = "CSSIdentifier",
        peg$c127 = function(nmstart, nmchars) { return nmstart + nmchars; },
        peg$c128 = /^[_a-zA-Z0-9\-]/,
        peg$c129 = "[_a-zA-Z0-9\\-]",
        peg$c130 = /^[_a-zA-Z]/,
        peg$c131 = "[_a-zA-Z]",
        peg$c132 = /^[\x80-\xFF]/,
        peg$c133 = "[\\x80-\\xFF]",
        peg$c134 = "KnownHTMLTagName",
        peg$c135 = "%",
        peg$c136 = "\"%\"",
        peg$c137 = /^[:_a-zA-Z0-9\-]/,
        peg$c138 = "[:_a-zA-Z0-9\\-]",
        peg$c139 = "figcaption",
        peg$c140 = "\"figcaption\"",
        peg$c141 = "blockquote",
        peg$c142 = "\"blockquote\"",
        peg$c143 = "plaintext",
        peg$c144 = "\"plaintext\"",
        peg$c145 = "textarea",
        peg$c146 = "\"textarea\"",
        peg$c147 = "progress",
        peg$c148 = "\"progress\"",
        peg$c149 = "optgroup",
        peg$c150 = "\"optgroup\"",
        peg$c151 = "noscript",
        peg$c152 = "\"noscript\"",
        peg$c153 = "noframes",
        peg$c154 = "\"noframes\"",
        peg$c155 = "frameset",
        peg$c156 = "\"frameset\"",
        peg$c157 = "fieldset",
        peg$c158 = "\"fieldset\"",
        peg$c159 = "datalist",
        peg$c160 = "\"datalist\"",
        peg$c161 = "colgroup",
        peg$c162 = "\"colgroup\"",
        peg$c163 = "basefont",
        peg$c164 = "\"basefont\"",
        peg$c165 = "summary",
        peg$c166 = "\"summary\"",
        peg$c167 = "section",
        peg$c168 = "\"section\"",
        peg$c169 = "marquee",
        peg$c170 = "\"marquee\"",
        peg$c171 = "listing",
        peg$c172 = "\"listing\"",
        peg$c173 = "isindex",
        peg$c174 = "\"isindex\"",
        peg$c175 = "details",
        peg$c176 = "\"details\"",
        peg$c177 = "command",
        peg$c178 = "\"command\"",
        peg$c179 = "caption",
        peg$c180 = "\"caption\"",
        peg$c181 = "bgsound",
        peg$c182 = "\"bgsound\"",
        peg$c183 = "article",
        peg$c184 = "\"article\"",
        peg$c185 = "address",
        peg$c186 = "\"address\"",
        peg$c187 = "acronym",
        peg$c188 = "\"acronym\"",
        peg$c189 = "strong",
        peg$c190 = "\"strong\"",
        peg$c191 = "strike",
        peg$c192 = "\"strike\"",
        peg$c193 = "spacer",
        peg$c194 = "\"spacer\"",
        peg$c195 = "source",
        peg$c196 = "\"source\"",
        peg$c197 = "select",
        peg$c198 = "\"select\"",
        peg$c199 = "script",
        peg$c200 = "\"script\"",
        peg$c201 = "output",
        peg$c202 = "\"output\"",
        peg$c203 = "option",
        peg$c204 = "\"option\"",
        peg$c205 = "object",
        peg$c206 = "\"object\"",
        peg$c207 = "legend",
        peg$c208 = "\"legend\"",
        peg$c209 = "keygen",
        peg$c210 = "\"keygen\"",
        peg$c211 = "iframe",
        peg$c212 = "\"iframe\"",
        peg$c213 = "hgroup",
        peg$c214 = "\"hgroup\"",
        peg$c215 = "header",
        peg$c216 = "\"header\"",
        peg$c217 = "footer",
        peg$c218 = "\"footer\"",
        peg$c219 = "figure",
        peg$c220 = "\"figure\"",
        peg$c221 = "center",
        peg$c222 = "\"center\"",
        peg$c223 = "canvas",
        peg$c224 = "\"canvas\"",
        peg$c225 = "button",
        peg$c226 = "\"button\"",
        peg$c227 = "applet",
        peg$c228 = "\"applet\"",
        peg$c229 = "video",
        peg$c230 = "\"video\"",
        peg$c231 = "track",
        peg$c232 = "\"track\"",
        peg$c233 = "title",
        peg$c234 = "\"title\"",
        peg$c235 = "thead",
        peg$c236 = "\"thead\"",
        peg$c237 = "tfoot",
        peg$c238 = "\"tfoot\"",
        peg$c239 = "tbody",
        peg$c240 = "\"tbody\"",
        peg$c241 = "table",
        peg$c242 = "\"table\"",
        peg$c243 = "style",
        peg$c244 = "\"style\"",
        peg$c245 = "small",
        peg$c246 = "\"small\"",
        peg$c247 = "param",
        peg$c248 = "\"param\"",
        peg$c249 = "meter",
        peg$c250 = "\"meter\"",
        peg$c251 = "label",
        peg$c252 = "\"label\"",
        peg$c253 = "input",
        peg$c254 = "\"input\"",
        peg$c255 = "frame",
        peg$c256 = "\"frame\"",
        peg$c257 = "embed",
        peg$c258 = "\"embed\"",
        peg$c259 = "blink",
        peg$c260 = "\"blink\"",
        peg$c261 = "audio",
        peg$c262 = "\"audio\"",
        peg$c263 = "aside",
        peg$c264 = "\"aside\"",
        peg$c265 = "time",
        peg$c266 = "\"time\"",
        peg$c267 = "span",
        peg$c268 = "\"span\"",
        peg$c269 = "samp",
        peg$c270 = "\"samp\"",
        peg$c271 = "ruby",
        peg$c272 = "\"ruby\"",
        peg$c273 = "nobr",
        peg$c274 = "\"nobr\"",
        peg$c275 = "meta",
        peg$c276 = "\"meta\"",
        peg$c277 = "menu",
        peg$c278 = "\"menu\"",
        peg$c279 = "mark",
        peg$c280 = "\"mark\"",
        peg$c281 = "main",
        peg$c282 = "\"main\"",
        peg$c283 = "link",
        peg$c284 = "\"link\"",
        peg$c285 = "html",
        peg$c286 = "\"html\"",
        peg$c287 = "head",
        peg$c288 = "\"head\"",
        peg$c289 = "form",
        peg$c290 = "\"form\"",
        peg$c291 = "font",
        peg$c292 = "\"font\"",
        peg$c293 = "data",
        peg$c294 = "\"data\"",
        peg$c295 = "code",
        peg$c296 = "\"code\"",
        peg$c297 = "cite",
        peg$c298 = "\"cite\"",
        peg$c299 = "body",
        peg$c300 = "\"body\"",
        peg$c301 = "base",
        peg$c302 = "\"base\"",
        peg$c303 = "area",
        peg$c304 = "\"area\"",
        peg$c305 = "abbr",
        peg$c306 = "\"abbr\"",
        peg$c307 = "xmp",
        peg$c308 = "\"xmp\"",
        peg$c309 = "wbr",
        peg$c310 = "\"wbr\"",
        peg$c311 = "var",
        peg$c312 = "\"var\"",
        peg$c313 = "sup",
        peg$c314 = "\"sup\"",
        peg$c315 = "sub",
        peg$c316 = "\"sub\"",
        peg$c317 = "pre",
        peg$c318 = "\"pre\"",
        peg$c319 = "nav",
        peg$c320 = "\"nav\"",
        peg$c321 = "map",
        peg$c322 = "\"map\"",
        peg$c323 = "kbd",
        peg$c324 = "\"kbd\"",
        peg$c325 = "ins",
        peg$c326 = "\"ins\"",
        peg$c327 = "img",
        peg$c328 = "\"img\"",
        peg$c329 = "div",
        peg$c330 = "\"div\"",
        peg$c331 = "dir",
        peg$c332 = "\"dir\"",
        peg$c333 = "dfn",
        peg$c334 = "\"dfn\"",
        peg$c335 = "del",
        peg$c336 = "\"del\"",
        peg$c337 = "col",
        peg$c338 = "\"col\"",
        peg$c339 = "big",
        peg$c340 = "\"big\"",
        peg$c341 = "bdo",
        peg$c342 = "\"bdo\"",
        peg$c343 = "bdi",
        peg$c344 = "\"bdi\"",
        peg$c345 = "ul",
        peg$c346 = "\"ul\"",
        peg$c347 = "tt",
        peg$c348 = "\"tt\"",
        peg$c349 = "tr",
        peg$c350 = "\"tr\"",
        peg$c351 = "th",
        peg$c352 = "\"th\"",
        peg$c353 = "td",
        peg$c354 = "\"td\"",
        peg$c355 = "rt",
        peg$c356 = "\"rt\"",
        peg$c357 = "rp",
        peg$c358 = "\"rp\"",
        peg$c359 = "ol",
        peg$c360 = "\"ol\"",
        peg$c361 = "li",
        peg$c362 = "\"li\"",
        peg$c363 = "hr",
        peg$c364 = "\"hr\"",
        peg$c365 = "h6",
        peg$c366 = "\"h6\"",
        peg$c367 = "h5",
        peg$c368 = "\"h5\"",
        peg$c369 = "h4",
        peg$c370 = "\"h4\"",
        peg$c371 = "h3",
        peg$c372 = "\"h3\"",
        peg$c373 = "h2",
        peg$c374 = "\"h2\"",
        peg$c375 = "h1",
        peg$c376 = "\"h1\"",
        peg$c377 = "em",
        peg$c378 = "\"em\"",
        peg$c379 = "dt",
        peg$c380 = "\"dt\"",
        peg$c381 = "dl",
        peg$c382 = "\"dl\"",
        peg$c383 = "dd",
        peg$c384 = "\"dd\"",
        peg$c385 = "br",
        peg$c386 = "\"br\"",
        peg$c387 = "u",
        peg$c388 = "\"u\"",
        peg$c389 = "s",
        peg$c390 = "\"s\"",
        peg$c391 = "q",
        peg$c392 = "\"q\"",
        peg$c393 = "p",
        peg$c394 = "\"p\"",
        peg$c395 = "i",
        peg$c396 = "\"i\"",
        peg$c397 = "b",
        peg$c398 = "\"b\"",
        peg$c399 = "a",
        peg$c400 = "\"a\"",
        peg$c401 = "a JS event",
        peg$c402 = "touchStart",
        peg$c403 = "\"touchStart\"",
        peg$c404 = "touchMove",
        peg$c405 = "\"touchMove\"",
        peg$c406 = "touchEnd",
        peg$c407 = "\"touchEnd\"",
        peg$c408 = "touchCancel",
        peg$c409 = "\"touchCancel\"",
        peg$c410 = "keyDown",
        peg$c411 = "\"keyDown\"",
        peg$c412 = "keyUp",
        peg$c413 = "\"keyUp\"",
        peg$c414 = "keyPress",
        peg$c415 = "\"keyPress\"",
        peg$c416 = "mouseDown",
        peg$c417 = "\"mouseDown\"",
        peg$c418 = "mouseUp",
        peg$c419 = "\"mouseUp\"",
        peg$c420 = "contextMenu",
        peg$c421 = "\"contextMenu\"",
        peg$c422 = "click",
        peg$c423 = "\"click\"",
        peg$c424 = "doubleClick",
        peg$c425 = "\"doubleClick\"",
        peg$c426 = "mouseMove",
        peg$c427 = "\"mouseMove\"",
        peg$c428 = "focusIn",
        peg$c429 = "\"focusIn\"",
        peg$c430 = "focusOut",
        peg$c431 = "\"focusOut\"",
        peg$c432 = "mouseEnter",
        peg$c433 = "\"mouseEnter\"",
        peg$c434 = "mouseLeave",
        peg$c435 = "\"mouseLeave\"",
        peg$c436 = "submit",
        peg$c437 = "\"submit\"",
        peg$c438 = "change",
        peg$c439 = "\"change\"",
        peg$c440 = "dragStart",
        peg$c441 = "\"dragStart\"",
        peg$c442 = "drag",
        peg$c443 = "\"drag\"",
        peg$c444 = "dragEnter",
        peg$c445 = "\"dragEnter\"",
        peg$c446 = "dragLeave",
        peg$c447 = "\"dragLeave\"",
        peg$c448 = "dragOver",
        peg$c449 = "\"dragOver\"",
        peg$c450 = "drop",
        peg$c451 = "\"drop\"",
        peg$c452 = "dragEnd",
        peg$c453 = "\"dragEnd\"",
        peg$c454 = "INDENT",
        peg$c455 = "\uEFEF",
        peg$c456 = "\"\\uEFEF\"",
        peg$c457 = function() { return ''; },
        peg$c458 = "DEDENT",
        peg$c459 = "\uEFFE",
        peg$c460 = "\"\\uEFFE\"",
        peg$c461 = "LineEnd",
        peg$c462 = "\n",
        peg$c463 = "\"\\n\"",
        peg$c464 = "\uEFFF",
        peg$c465 = "\"\\uEFFF\"",
        peg$c466 = "RequiredWhitespace",
        peg$c467 = "OptionalWhitespace",
        peg$c468 = "InlineWhitespace",
        peg$c469 = /^[ \t]/,
        peg$c470 = "[ \\t]",

        peg$currPos          = 0,
        peg$reportedPos      = 0,
        peg$cachedPos        = 0,
        peg$cachedPosDetails = { line: 1, column: 1, seenCR: false },
        peg$maxFailPos       = 0,
        peg$maxFailExpected  = [],
        peg$silentFails      = 0,

        peg$result;

    if ("startRule" in options) {
      if (!(options.startRule in peg$startRuleFunctions)) {
        throw new Error("Can't start parsing from rule \"" + options.startRule + "\".");
      }

      peg$startRuleFunction = peg$startRuleFunctions[options.startRule];
    }

    function text() {
      return input.substring(peg$reportedPos, peg$currPos);
    }

    function offset() {
      return peg$reportedPos;
    }

    function line() {
      return peg$computePosDetails(peg$reportedPos).line;
    }

    function column() {
      return peg$computePosDetails(peg$reportedPos).column;
    }

    function peg$computePosDetails(pos) {
      function advance(details, pos) {
        var p, ch;

        for (p = 0; p < pos; p++) {
          ch = input.charAt(p);
          if (ch === "\n") {
            if (!details.seenCR) { details.line++; }
            details.column = 1;
            details.seenCR = false;
          } else if (ch === "\r" || ch === "\u2028" || ch === "\u2029") {
            details.line++;
            details.column = 1;
            details.seenCR = true;
          } else {
            details.column++;
            details.seenCR = false;
          }
        }
      }

      if (peg$cachedPos !== pos) {
        if (peg$cachedPos > pos) {
          peg$cachedPos = 0;
          peg$cachedPosDetails = { line: 1, column: 1, seenCR: false };
        }
        peg$cachedPos = pos;
        advance(peg$cachedPosDetails, peg$cachedPos);
      }

      return peg$cachedPosDetails;
    }

    function peg$fail(expected) {
      if (peg$currPos < peg$maxFailPos) { return; }

      if (peg$currPos > peg$maxFailPos) {
        peg$maxFailPos = peg$currPos;
        peg$maxFailExpected = [];
      }

      peg$maxFailExpected.push(expected);
    }

    function peg$cleanupExpected(expected) {
      var i = 0;

      expected.sort();

      while (i < expected.length) {
        if (expected[i - 1] === expected[i]) {
          expected.splice(i, 1);
        } else {
          i++;
        }
      }
    }

    function peg$parsestart() {
      var s0;

      s0 = peg$parsecontent();

      return s0;
    }

    function peg$parsecontent() {
      var s0, s1, s2;

      s0 = peg$currPos;
      s1 = [];
      s2 = peg$parsestatement();
      while (s2 !== null) {
        s1.push(s2);
        s2 = peg$parsestatement();
      }
      if (s1 !== null) {
        peg$reportedPos = s0;
        s1 = peg$c1(s1);
      }
      if (s1 === null) {
        peg$currPos = s0;
        s0 = s1;
      } else {
        s0 = s1;
      }

      return s0;
    }

    function peg$parseinvertibleContent() {
      var s0, s1, s2, s3, s4, s5, s6, s7, s8;

      s0 = peg$currPos;
      s1 = peg$parsecontent();
      if (s1 !== null) {
        s2 = peg$currPos;
        s3 = peg$parseDEDENT();
        if (s3 !== null) {
          if (input.substr(peg$currPos, 4) === peg$c4) {
            s4 = peg$c4;
            peg$currPos += 4;
          } else {
            s4 = null;
            if (peg$silentFails === 0) { peg$fail(peg$c5); }
          }
          if (s4 !== null) {
            s5 = peg$parse_();
            if (s5 !== null) {
              s6 = peg$parseTERM();
              if (s6 !== null) {
                s7 = peg$parseINDENT();
                if (s7 !== null) {
                  s8 = peg$parsecontent();
                  if (s8 !== null) {
                    peg$reportedPos = s2;
                    s3 = peg$c6(s8);
                    if (s3 === null) {
                      peg$currPos = s2;
                      s2 = s3;
                    } else {
                      s2 = s3;
                    }
                  } else {
                    peg$currPos = s2;
                    s2 = peg$c2;
                  }
                } else {
                  peg$currPos = s2;
                  s2 = peg$c2;
                }
              } else {
                peg$currPos = s2;
                s2 = peg$c2;
              }
            } else {
              peg$currPos = s2;
              s2 = peg$c2;
            }
          } else {
            peg$currPos = s2;
            s2 = peg$c2;
          }
        } else {
          peg$currPos = s2;
          s2 = peg$c2;
        }
        if (s2 === null) {
          s2 = peg$c3;
        }
        if (s2 !== null) {
          peg$reportedPos = s0;
          s1 = peg$c7(s1,s2);
          if (s1 === null) {
            peg$currPos = s0;
            s0 = s1;
          } else {
            s0 = s1;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c2;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c2;
      }

      return s0;
    }

    function peg$parsestatement() {
      var s0;

      s0 = peg$parsecomment();
      if (s0 === null) {
        s0 = peg$parsehtmlElement();
        if (s0 === null) {
          s0 = peg$parsetextLine();
          if (s0 === null) {
            s0 = peg$parsemustache();
          }
        }
      }

      return s0;
    }

    function peg$parsehtmlElement() {
      var s0;

      s0 = peg$parsehtmlElementMaybeBlock();
      if (s0 === null) {
        s0 = peg$parsehtmlElementWithInlineContent();
      }

      return s0;
    }

    function peg$parsemustache() {
      var s0, s1;

      s0 = peg$currPos;
      s1 = peg$parseexplicitMustache();
      if (s1 === null) {
        s1 = peg$parselineStartingMustache();
      }
      if (s1 !== null) {
        peg$reportedPos = s0;
        s1 = peg$c8(s1);
      }
      if (s1 === null) {
        peg$currPos = s0;
        s0 = s1;
      } else {
        s0 = s1;
      }

      return s0;
    }

    function peg$parsecomment() {
      var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9;

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 47) {
        s1 = peg$c9;
        peg$currPos++;
      } else {
        s1 = null;
        if (peg$silentFails === 0) { peg$fail(peg$c10); }
      }
      if (s1 !== null) {
        s2 = peg$parselineContent();
        if (s2 !== null) {
          s3 = peg$parseTERM();
          if (s3 !== null) {
            s4 = peg$currPos;
            s5 = peg$parseINDENT();
            if (s5 !== null) {
              s6 = [];
              s7 = peg$currPos;
              s8 = peg$parselineContent();
              if (s8 !== null) {
                s9 = peg$parseTERM();
                if (s9 !== null) {
                  s8 = [s8, s9];
                  s7 = s8;
                } else {
                  peg$currPos = s7;
                  s7 = peg$c2;
                }
              } else {
                peg$currPos = s7;
                s7 = peg$c2;
              }
              if (s7 !== null) {
                while (s7 !== null) {
                  s6.push(s7);
                  s7 = peg$currPos;
                  s8 = peg$parselineContent();
                  if (s8 !== null) {
                    s9 = peg$parseTERM();
                    if (s9 !== null) {
                      s8 = [s8, s9];
                      s7 = s8;
                    } else {
                      peg$currPos = s7;
                      s7 = peg$c2;
                    }
                  } else {
                    peg$currPos = s7;
                    s7 = peg$c2;
                  }
                }
              } else {
                s6 = peg$c2;
              }
              if (s6 !== null) {
                s7 = peg$parseDEDENT();
                if (s7 !== null) {
                  s5 = [s5, s6, s7];
                  s4 = s5;
                } else {
                  peg$currPos = s4;
                  s4 = peg$c2;
                }
              } else {
                peg$currPos = s4;
                s4 = peg$c2;
              }
            } else {
              peg$currPos = s4;
              s4 = peg$c2;
            }
            if (s4 === null) {
              s4 = peg$c3;
            }
            if (s4 !== null) {
              peg$reportedPos = s0;
              s1 = peg$c11();
              if (s1 === null) {
                peg$currPos = s0;
                s0 = s1;
              } else {
                s0 = s1;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c2;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c2;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c2;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c2;
      }

      return s0;
    }

    function peg$parselineStartingMustache() {
      var s0;

      s0 = peg$parsecapitalizedLineStarterMustache();
      if (s0 === null) {
        s0 = peg$parsemustacheMaybeBlock();
      }

      return s0;
    }

    function peg$parsecapitalizedLineStarterMustache() {
      var s0, s1, s2;

      s0 = peg$currPos;
      s1 = peg$currPos;
      peg$silentFails++;
      if (peg$c12.test(input.charAt(peg$currPos))) {
        s2 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s2 = null;
        if (peg$silentFails === 0) { peg$fail(peg$c13); }
      }
      peg$silentFails--;
      if (s2 !== null) {
        peg$currPos = s1;
        s1 = peg$c3;
      } else {
        s1 = peg$c2;
      }
      if (s1 !== null) {
        s2 = peg$parsemustacheMaybeBlock();
        if (s2 !== null) {
          peg$reportedPos = s0;
          s1 = peg$c14(s2);
          if (s1 === null) {
            peg$currPos = s0;
            s0 = s1;
          } else {
            s0 = s1;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c2;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c2;
      }

      return s0;
    }

    function peg$parsehtmlElementMaybeBlock() {
      var s0, s1, s2, s3, s4, s5, s6, s7;

      s0 = peg$currPos;
      s1 = peg$parsehtmlTagAndOptionalAttributes();
      if (s1 !== null) {
        s2 = peg$parse_();
        if (s2 !== null) {
          s3 = peg$parseTERM();
          if (s3 !== null) {
            s4 = peg$currPos;
            s5 = peg$parseINDENT();
            if (s5 !== null) {
              s6 = peg$parsecontent();
              if (s6 !== null) {
                s7 = peg$parseDEDENT();
                if (s7 !== null) {
                  s5 = [s5, s6, s7];
                  s4 = s5;
                } else {
                  peg$currPos = s4;
                  s4 = peg$c2;
                }
              } else {
                peg$currPos = s4;
                s4 = peg$c2;
              }
            } else {
              peg$currPos = s4;
              s4 = peg$c2;
            }
            if (s4 === null) {
              s4 = peg$c3;
            }
            if (s4 !== null) {
              peg$reportedPos = s0;
              s1 = peg$c15(s1,s4);
              if (s1 === null) {
                peg$currPos = s0;
                s0 = s1;
              } else {
                s0 = s1;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c2;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c2;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c2;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c2;
      }

      return s0;
    }

    function peg$parsehtmlElementWithInlineContent() {
      var s0, s1, s2, s3, s4, s5, s6, s7;

      s0 = peg$currPos;
      s1 = peg$parsehtmlTagAndOptionalAttributes();
      if (s1 !== null) {
        if (input.charCodeAt(peg$currPos) === 32) {
          s2 = peg$c16;
          peg$currPos++;
        } else {
          s2 = null;
          if (peg$silentFails === 0) { peg$fail(peg$c17); }
        }
        if (s2 !== null) {
          s3 = peg$parsehtmlInlineContent();
          if (s3 !== null) {
            s4 = peg$currPos;
            s5 = peg$parseINDENT();
            if (s5 !== null) {
              s6 = [];
              s7 = peg$parsetextNodes();
              if (s7 !== null) {
                while (s7 !== null) {
                  s6.push(s7);
                  s7 = peg$parsetextNodes();
                }
              } else {
                s6 = peg$c2;
              }
              if (s6 !== null) {
                s7 = peg$parseDEDENT();
                if (s7 !== null) {
                  s5 = [s5, s6, s7];
                  s4 = s5;
                } else {
                  peg$currPos = s4;
                  s4 = peg$c2;
                }
              } else {
                peg$currPos = s4;
                s4 = peg$c2;
              }
            } else {
              peg$currPos = s4;
              s4 = peg$c2;
            }
            if (s4 === null) {
              s4 = peg$c3;
            }
            if (s4 !== null) {
              peg$reportedPos = s0;
              s1 = peg$c18(s1,s3,s4);
              if (s1 === null) {
                peg$currPos = s0;
                s0 = s1;
              } else {
                s0 = s1;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c2;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c2;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c2;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c2;
      }

      return s0;
    }

    function peg$parsemustacheMaybeBlock() {
      var s0, s1, s2, s3, s4, s5, s6, s7;

      s0 = peg$currPos;
      s1 = peg$parseinMustache();
      if (s1 !== null) {
        s2 = peg$parse_();
        if (s2 !== null) {
          s3 = peg$parseTERM();
          if (s3 !== null) {
            s4 = peg$currPos;
            s5 = peg$parseINDENT();
            if (s5 !== null) {
              s6 = peg$parseinvertibleContent();
              if (s6 !== null) {
                s7 = peg$parseDEDENT();
                if (s7 !== null) {
                  s5 = [s5, s6, s7];
                  s4 = s5;
                } else {
                  peg$currPos = s4;
                  s4 = peg$c2;
                }
              } else {
                peg$currPos = s4;
                s4 = peg$c2;
              }
            } else {
              peg$currPos = s4;
              s4 = peg$c2;
            }
            if (s4 === null) {
              s4 = peg$c3;
            }
            if (s4 !== null) {
              peg$reportedPos = s0;
              s1 = peg$c19(s1,s4);
              if (s1 === null) {
                peg$currPos = s0;
                s0 = s1;
              } else {
                s0 = s1;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c2;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c2;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c2;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c2;
      }

      return s0;
    }

    function peg$parseexplicitMustache() {
      var s0, s1, s2;

      s0 = peg$currPos;
      s1 = peg$parseequalSign();
      if (s1 !== null) {
        s2 = peg$parsemustacheMaybeBlock();
        if (s2 !== null) {
          peg$reportedPos = s0;
          s1 = peg$c20(s1,s2);
          if (s1 === null) {
            peg$currPos = s0;
            s0 = s1;
          } else {
            s0 = s1;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c2;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c2;
      }

      return s0;
    }

    function peg$parseinMustache() {
      var s0, s1, s2, s3, s4;

      s0 = peg$currPos;
      s1 = peg$parsepathIdNode();
      if (s1 !== null) {
        s2 = peg$parsetrailingModifier();
        if (s2 === null) {
          s2 = peg$c3;
        }
        if (s2 !== null) {
          s3 = [];
          s4 = peg$parseinMustacheParam();
          while (s4 !== null) {
            s3.push(s4);
            s4 = peg$parseinMustacheParam();
          }
          if (s3 !== null) {
            s4 = peg$parsehash();
            if (s4 === null) {
              s4 = peg$c3;
            }
            if (s4 !== null) {
              peg$reportedPos = s0;
              s1 = peg$c21(s1,s2,s3,s4);
              if (s1 === null) {
                peg$currPos = s0;
                s0 = s1;
              } else {
                s0 = s1;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c2;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c2;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c2;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c2;
      }

      return s0;
    }

    function peg$parsemodifiedParam() {
      var s0, s1, s2;

      s0 = peg$currPos;
      s1 = peg$parseparam();
      if (s1 !== null) {
        s2 = peg$parsetrailingModifier();
        if (s2 !== null) {
          peg$reportedPos = s0;
          s1 = peg$c22(s1,s2);
          if (s1 === null) {
            peg$currPos = s0;
            s0 = s1;
          } else {
            s0 = s1;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c2;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c2;
      }

      return s0;
    }

    function peg$parseinMustacheParam() {
      var s0, s1, s2;

      s0 = peg$currPos;
      s1 = peg$parse_();
      if (s1 !== null) {
        s2 = peg$parseparam();
        if (s2 !== null) {
          peg$reportedPos = s0;
          s1 = peg$c23(s2);
          if (s1 === null) {
            peg$currPos = s0;
            s0 = s1;
          } else {
            s0 = s1;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c2;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c2;
      }

      return s0;
    }

    function peg$parsetrailingModifier() {
      var s0, s1;

      peg$silentFails++;
      if (peg$c25.test(input.charAt(peg$currPos))) {
        s0 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s0 = null;
        if (peg$silentFails === 0) { peg$fail(peg$c26); }
      }
      peg$silentFails--;
      if (s0 === null) {
        s1 = null;
        if (peg$silentFails === 0) { peg$fail(peg$c24); }
      }

      return s0;
    }

    function peg$parsehash() {
      var s0, s1, s2;

      s0 = peg$currPos;
      s1 = [];
      s2 = peg$parsehashSegment();
      if (s2 !== null) {
        while (s2 !== null) {
          s1.push(s2);
          s2 = peg$parsehashSegment();
        }
      } else {
        s1 = peg$c2;
      }
      if (s1 !== null) {
        peg$reportedPos = s0;
        s1 = peg$c27(s1);
      }
      if (s1 === null) {
        peg$currPos = s0;
        s0 = s1;
      } else {
        s0 = s1;
      }

      return s0;
    }

    function peg$parsepathIdent() {
      var s0, s1, s2, s3;

      peg$silentFails++;
      if (input.substr(peg$currPos, 2) === peg$c29) {
        s0 = peg$c29;
        peg$currPos += 2;
      } else {
        s0 = null;
        if (peg$silentFails === 0) { peg$fail(peg$c30); }
      }
      if (s0 === null) {
        if (input.charCodeAt(peg$currPos) === 46) {
          s0 = peg$c31;
          peg$currPos++;
        } else {
          s0 = null;
          if (peg$silentFails === 0) { peg$fail(peg$c32); }
        }
        if (s0 === null) {
          s0 = peg$currPos;
          s1 = peg$currPos;
          s2 = [];
          if (peg$c33.test(input.charAt(peg$currPos))) {
            s3 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s3 = null;
            if (peg$silentFails === 0) { peg$fail(peg$c34); }
          }
          if (s3 !== null) {
            while (s3 !== null) {
              s2.push(s3);
              if (peg$c33.test(input.charAt(peg$currPos))) {
                s3 = input.charAt(peg$currPos);
                peg$currPos++;
              } else {
                s3 = null;
                if (peg$silentFails === 0) { peg$fail(peg$c34); }
              }
            }
          } else {
            s2 = peg$c2;
          }
          if (s2 !== null) {
            s2 = input.substring(s1, peg$currPos);
          }
          s1 = s2;
          if (s1 !== null) {
            s2 = peg$currPos;
            peg$silentFails++;
            if (input.charCodeAt(peg$currPos) === 61) {
              s3 = peg$c35;
              peg$currPos++;
            } else {
              s3 = null;
              if (peg$silentFails === 0) { peg$fail(peg$c36); }
            }
            peg$silentFails--;
            if (s3 === null) {
              s2 = peg$c3;
            } else {
              peg$currPos = s2;
              s2 = peg$c2;
            }
            if (s2 !== null) {
              peg$reportedPos = s0;
              s1 = peg$c37(s1);
              if (s1 === null) {
                peg$currPos = s0;
                s0 = s1;
              } else {
                s0 = s1;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c2;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c2;
          }
        }
      }
      peg$silentFails--;
      if (s0 === null) {
        s1 = null;
        if (peg$silentFails === 0) { peg$fail(peg$c28); }
      }

      return s0;
    }

    function peg$parsekey() {
      var s0, s1;

      peg$silentFails++;
      s0 = peg$parseident();
      peg$silentFails--;
      if (s0 === null) {
        s1 = null;
        if (peg$silentFails === 0) { peg$fail(peg$c38); }
      }

      return s0;
    }

    function peg$parsehashSegment() {
      var s0, s1, s2, s3, s4, s5;

      s0 = peg$currPos;
      s1 = peg$parse_();
      if (s1 !== null) {
        s2 = peg$currPos;
        s3 = peg$parsekey();
        if (s3 !== null) {
          if (input.charCodeAt(peg$currPos) === 61) {
            s4 = peg$c35;
            peg$currPos++;
          } else {
            s4 = null;
            if (peg$silentFails === 0) { peg$fail(peg$c36); }
          }
          if (s4 !== null) {
            s5 = peg$parsepathIdNode();
            if (s5 !== null) {
              s3 = [s3, s4, s5];
              s2 = s3;
            } else {
              peg$currPos = s2;
              s2 = peg$c2;
            }
          } else {
            peg$currPos = s2;
            s2 = peg$c2;
          }
        } else {
          peg$currPos = s2;
          s2 = peg$c2;
        }
        if (s2 === null) {
          s2 = peg$currPos;
          s3 = peg$parsekey();
          if (s3 !== null) {
            if (input.charCodeAt(peg$currPos) === 61) {
              s4 = peg$c35;
              peg$currPos++;
            } else {
              s4 = null;
              if (peg$silentFails === 0) { peg$fail(peg$c36); }
            }
            if (s4 !== null) {
              s5 = peg$parsestringNode();
              if (s5 !== null) {
                s3 = [s3, s4, s5];
                s2 = s3;
              } else {
                peg$currPos = s2;
                s2 = peg$c2;
              }
            } else {
              peg$currPos = s2;
              s2 = peg$c2;
            }
          } else {
            peg$currPos = s2;
            s2 = peg$c2;
          }
          if (s2 === null) {
            s2 = peg$currPos;
            s3 = peg$parsekey();
            if (s3 !== null) {
              if (input.charCodeAt(peg$currPos) === 61) {
                s4 = peg$c35;
                peg$currPos++;
              } else {
                s4 = null;
                if (peg$silentFails === 0) { peg$fail(peg$c36); }
              }
              if (s4 !== null) {
                s5 = peg$parseintegerNode();
                if (s5 !== null) {
                  s3 = [s3, s4, s5];
                  s2 = s3;
                } else {
                  peg$currPos = s2;
                  s2 = peg$c2;
                }
              } else {
                peg$currPos = s2;
                s2 = peg$c2;
              }
            } else {
              peg$currPos = s2;
              s2 = peg$c2;
            }
            if (s2 === null) {
              s2 = peg$currPos;
              s3 = peg$parsekey();
              if (s3 !== null) {
                if (input.charCodeAt(peg$currPos) === 61) {
                  s4 = peg$c35;
                  peg$currPos++;
                } else {
                  s4 = null;
                  if (peg$silentFails === 0) { peg$fail(peg$c36); }
                }
                if (s4 !== null) {
                  s5 = peg$parsebooleanNode();
                  if (s5 !== null) {
                    s3 = [s3, s4, s5];
                    s2 = s3;
                  } else {
                    peg$currPos = s2;
                    s2 = peg$c2;
                  }
                } else {
                  peg$currPos = s2;
                  s2 = peg$c2;
                }
              } else {
                peg$currPos = s2;
                s2 = peg$c2;
              }
            }
          }
        }
        if (s2 !== null) {
          peg$reportedPos = s0;
          s1 = peg$c39(s2);
          if (s1 === null) {
            peg$currPos = s0;
            s0 = s1;
          } else {
            s0 = s1;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c2;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c2;
      }

      return s0;
    }

    function peg$parseparam() {
      var s0;

      s0 = peg$parsepathIdNode();
      if (s0 === null) {
        s0 = peg$parsestringNode();
        if (s0 === null) {
          s0 = peg$parseintegerNode();
          if (s0 === null) {
            s0 = peg$parsebooleanNode();
          }
        }
      }

      return s0;
    }

    function peg$parsepath() {
      var s0, s1, s2, s3, s4, s5;

      s0 = peg$currPos;
      s1 = peg$parsepathIdent();
      if (s1 !== null) {
        s2 = [];
        s3 = peg$currPos;
        s4 = peg$parseseperator();
        if (s4 !== null) {
          s5 = peg$parsepathIdent();
          if (s5 !== null) {
            peg$reportedPos = s3;
            s4 = peg$c23(s5);
            if (s4 === null) {
              peg$currPos = s3;
              s3 = s4;
            } else {
              s3 = s4;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$c2;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$c2;
        }
        while (s3 !== null) {
          s2.push(s3);
          s3 = peg$currPos;
          s4 = peg$parseseperator();
          if (s4 !== null) {
            s5 = peg$parsepathIdent();
            if (s5 !== null) {
              peg$reportedPos = s3;
              s4 = peg$c23(s5);
              if (s4 === null) {
                peg$currPos = s3;
                s3 = s4;
              } else {
                s3 = s4;
              }
            } else {
              peg$currPos = s3;
              s3 = peg$c2;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$c2;
          }
        }
        if (s2 !== null) {
          peg$reportedPos = s0;
          s1 = peg$c40(s1,s2);
          if (s1 === null) {
            peg$currPos = s0;
            s0 = s1;
          } else {
            s0 = s1;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c2;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c2;
      }

      return s0;
    }

    function peg$parseseperator() {
      var s0, s1;

      peg$silentFails++;
      if (peg$c42.test(input.charAt(peg$currPos))) {
        s0 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s0 = null;
        if (peg$silentFails === 0) { peg$fail(peg$c43); }
      }
      peg$silentFails--;
      if (s0 === null) {
        s1 = null;
        if (peg$silentFails === 0) { peg$fail(peg$c41); }
      }

      return s0;
    }

    function peg$parsepathIdNode() {
      var s0, s1;

      s0 = peg$currPos;
      s1 = peg$parsepath();
      if (s1 !== null) {
        peg$reportedPos = s0;
        s1 = peg$c44(s1);
      }
      if (s1 === null) {
        peg$currPos = s0;
        s0 = s1;
      } else {
        s0 = s1;
      }

      return s0;
    }

    function peg$parsestringNode() {
      var s0, s1;

      s0 = peg$currPos;
      s1 = peg$parsestring();
      if (s1 !== null) {
        peg$reportedPos = s0;
        s1 = peg$c45(s1);
      }
      if (s1 === null) {
        peg$currPos = s0;
        s0 = s1;
      } else {
        s0 = s1;
      }

      return s0;
    }

    function peg$parseintegerNode() {
      var s0, s1;

      s0 = peg$currPos;
      s1 = peg$parseinteger();
      if (s1 !== null) {
        peg$reportedPos = s0;
        s1 = peg$c46(s1);
      }
      if (s1 === null) {
        peg$currPos = s0;
        s0 = s1;
      } else {
        s0 = s1;
      }

      return s0;
    }

    function peg$parsebooleanNode() {
      var s0, s1;

      s0 = peg$currPos;
      s1 = peg$parseboolean();
      if (s1 !== null) {
        peg$reportedPos = s0;
        s1 = peg$c47(s1);
      }
      if (s1 === null) {
        peg$currPos = s0;
        s0 = s1;
      } else {
        s0 = s1;
      }

      return s0;
    }

    function peg$parseboolean() {
      var s0, s1;

      peg$silentFails++;
      if (input.substr(peg$currPos, 4) === peg$c49) {
        s0 = peg$c49;
        peg$currPos += 4;
      } else {
        s0 = null;
        if (peg$silentFails === 0) { peg$fail(peg$c50); }
      }
      if (s0 === null) {
        if (input.substr(peg$currPos, 5) === peg$c51) {
          s0 = peg$c51;
          peg$currPos += 5;
        } else {
          s0 = null;
          if (peg$silentFails === 0) { peg$fail(peg$c52); }
        }
      }
      peg$silentFails--;
      if (s0 === null) {
        s1 = null;
        if (peg$silentFails === 0) { peg$fail(peg$c48); }
      }

      return s0;
    }

    function peg$parseinteger() {
      var s0, s1, s2, s3;

      peg$silentFails++;
      s0 = peg$currPos;
      s1 = peg$currPos;
      s2 = [];
      if (peg$c54.test(input.charAt(peg$currPos))) {
        s3 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s3 = null;
        if (peg$silentFails === 0) { peg$fail(peg$c55); }
      }
      if (s3 !== null) {
        while (s3 !== null) {
          s2.push(s3);
          if (peg$c54.test(input.charAt(peg$currPos))) {
            s3 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s3 = null;
            if (peg$silentFails === 0) { peg$fail(peg$c55); }
          }
        }
      } else {
        s2 = peg$c2;
      }
      if (s2 !== null) {
        s2 = input.substring(s1, peg$currPos);
      }
      s1 = s2;
      if (s1 !== null) {
        peg$reportedPos = s0;
        s1 = peg$c56(s1);
      }
      if (s1 === null) {
        peg$currPos = s0;
        s0 = s1;
      } else {
        s0 = s1;
      }
      peg$silentFails--;
      if (s0 === null) {
        s1 = null;
        if (peg$silentFails === 0) { peg$fail(peg$c53); }
      }

      return s0;
    }

    function peg$parsestring() {
      var s0, s1, s2, s3, s4;

      s0 = peg$currPos;
      s1 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 34) {
        s2 = peg$c57;
        peg$currPos++;
      } else {
        s2 = null;
        if (peg$silentFails === 0) { peg$fail(peg$c58); }
      }
      if (s2 !== null) {
        s3 = peg$parsehashDoubleQuoteStringValue();
        if (s3 !== null) {
          if (input.charCodeAt(peg$currPos) === 34) {
            s4 = peg$c57;
            peg$currPos++;
          } else {
            s4 = null;
            if (peg$silentFails === 0) { peg$fail(peg$c58); }
          }
          if (s4 !== null) {
            s2 = [s2, s3, s4];
            s1 = s2;
          } else {
            peg$currPos = s1;
            s1 = peg$c2;
          }
        } else {
          peg$currPos = s1;
          s1 = peg$c2;
        }
      } else {
        peg$currPos = s1;
        s1 = peg$c2;
      }
      if (s1 === null) {
        s1 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 39) {
          s2 = peg$c59;
          peg$currPos++;
        } else {
          s2 = null;
          if (peg$silentFails === 0) { peg$fail(peg$c60); }
        }
        if (s2 !== null) {
          s3 = peg$parsehashSingleQuoteStringValue();
          if (s3 !== null) {
            if (input.charCodeAt(peg$currPos) === 39) {
              s4 = peg$c59;
              peg$currPos++;
            } else {
              s4 = null;
              if (peg$silentFails === 0) { peg$fail(peg$c60); }
            }
            if (s4 !== null) {
              s2 = [s2, s3, s4];
              s1 = s2;
            } else {
              peg$currPos = s1;
              s1 = peg$c2;
            }
          } else {
            peg$currPos = s1;
            s1 = peg$c2;
          }
        } else {
          peg$currPos = s1;
          s1 = peg$c2;
        }
      }
      if (s1 !== null) {
        peg$reportedPos = s0;
        s1 = peg$c61(s1);
      }
      if (s1 === null) {
        peg$currPos = s0;
        s0 = s1;
      } else {
        s0 = s1;
      }

      return s0;
    }

    function peg$parsehashDoubleQuoteStringValue() {
      var s0, s1, s2, s3, s4;

      s0 = peg$currPos;
      s1 = [];
      s2 = peg$currPos;
      s3 = peg$currPos;
      peg$silentFails++;
      s4 = peg$parseTERM();
      peg$silentFails--;
      if (s4 === null) {
        s3 = peg$c3;
      } else {
        peg$currPos = s3;
        s3 = peg$c2;
      }
      if (s3 !== null) {
        if (peg$c62.test(input.charAt(peg$currPos))) {
          s4 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s4 = null;
          if (peg$silentFails === 0) { peg$fail(peg$c63); }
        }
        if (s4 !== null) {
          s3 = [s3, s4];
          s2 = s3;
        } else {
          peg$currPos = s2;
          s2 = peg$c2;
        }
      } else {
        peg$currPos = s2;
        s2 = peg$c2;
      }
      while (s2 !== null) {
        s1.push(s2);
        s2 = peg$currPos;
        s3 = peg$currPos;
        peg$silentFails++;
        s4 = peg$parseTERM();
        peg$silentFails--;
        if (s4 === null) {
          s3 = peg$c3;
        } else {
          peg$currPos = s3;
          s3 = peg$c2;
        }
        if (s3 !== null) {
          if (peg$c62.test(input.charAt(peg$currPos))) {
            s4 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s4 = null;
            if (peg$silentFails === 0) { peg$fail(peg$c63); }
          }
          if (s4 !== null) {
            s3 = [s3, s4];
            s2 = s3;
          } else {
            peg$currPos = s2;
            s2 = peg$c2;
          }
        } else {
          peg$currPos = s2;
          s2 = peg$c2;
        }
      }
      if (s1 !== null) {
        s1 = input.substring(s0, peg$currPos);
      }
      s0 = s1;

      return s0;
    }

    function peg$parsehashSingleQuoteStringValue() {
      var s0, s1, s2, s3, s4;

      s0 = peg$currPos;
      s1 = [];
      s2 = peg$currPos;
      s3 = peg$currPos;
      peg$silentFails++;
      s4 = peg$parseTERM();
      peg$silentFails--;
      if (s4 === null) {
        s3 = peg$c3;
      } else {
        peg$currPos = s3;
        s3 = peg$c2;
      }
      if (s3 !== null) {
        if (peg$c64.test(input.charAt(peg$currPos))) {
          s4 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s4 = null;
          if (peg$silentFails === 0) { peg$fail(peg$c65); }
        }
        if (s4 !== null) {
          s3 = [s3, s4];
          s2 = s3;
        } else {
          peg$currPos = s2;
          s2 = peg$c2;
        }
      } else {
        peg$currPos = s2;
        s2 = peg$c2;
      }
      while (s2 !== null) {
        s1.push(s2);
        s2 = peg$currPos;
        s3 = peg$currPos;
        peg$silentFails++;
        s4 = peg$parseTERM();
        peg$silentFails--;
        if (s4 === null) {
          s3 = peg$c3;
        } else {
          peg$currPos = s3;
          s3 = peg$c2;
        }
        if (s3 !== null) {
          if (peg$c64.test(input.charAt(peg$currPos))) {
            s4 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s4 = null;
            if (peg$silentFails === 0) { peg$fail(peg$c65); }
          }
          if (s4 !== null) {
            s3 = [s3, s4];
            s2 = s3;
          } else {
            peg$currPos = s2;
            s2 = peg$c2;
          }
        } else {
          peg$currPos = s2;
          s2 = peg$c2;
        }
      }
      if (s1 !== null) {
        s1 = input.substring(s0, peg$currPos);
      }
      s0 = s1;

      return s0;
    }

    function peg$parsealpha() {
      var s0;

      if (peg$c66.test(input.charAt(peg$currPos))) {
        s0 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s0 = null;
        if (peg$silentFails === 0) { peg$fail(peg$c67); }
      }

      return s0;
    }

    function peg$parsehtmlInlineContent() {
      var s0, s1;

      s0 = peg$currPos;
      s1 = peg$parseexplicitMustache();
      if (s1 !== null) {
        peg$reportedPos = s0;
        s1 = peg$c68(s1);
      }
      if (s1 === null) {
        peg$currPos = s0;
        s0 = s1;
      } else {
        s0 = s1;
      }
      if (s0 === null) {
        s0 = peg$parsetextNodes();
      }

      return s0;
    }

    function peg$parsetextLine() {
      var s0, s1, s2, s3, s4, s5, s6, s7;

      s0 = peg$currPos;
      s1 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 124) {
        s2 = peg$c69;
        peg$currPos++;
      } else {
        s2 = null;
        if (peg$silentFails === 0) { peg$fail(peg$c70); }
      }
      if (s2 !== null) {
        if (input.charCodeAt(peg$currPos) === 32) {
          s3 = peg$c16;
          peg$currPos++;
        } else {
          s3 = null;
          if (peg$silentFails === 0) { peg$fail(peg$c17); }
        }
        if (s3 === null) {
          s3 = peg$c3;
        }
        if (s3 !== null) {
          s2 = [s2, s3];
          s1 = s2;
        } else {
          peg$currPos = s1;
          s1 = peg$c2;
        }
      } else {
        peg$currPos = s1;
        s1 = peg$c2;
      }
      if (s1 === null) {
        s1 = peg$currPos;
        peg$silentFails++;
        if (input.charCodeAt(peg$currPos) === 60) {
          s2 = peg$c71;
          peg$currPos++;
        } else {
          s2 = null;
          if (peg$silentFails === 0) { peg$fail(peg$c72); }
        }
        peg$silentFails--;
        if (s2 !== null) {
          peg$currPos = s1;
          s1 = peg$c3;
        } else {
          s1 = peg$c2;
        }
      }
      if (s1 !== null) {
        s2 = peg$parsetextNodes();
        if (s2 !== null) {
          s3 = [];
          s4 = peg$currPos;
          s5 = peg$parseINDENT();
          if (s5 !== null) {
            s6 = peg$parsetextNodes();
            if (s6 !== null) {
              s7 = peg$parseDEDENT();
              if (s7 !== null) {
                peg$reportedPos = s4;
                s5 = peg$c73(s6);
                if (s5 === null) {
                  peg$currPos = s4;
                  s4 = s5;
                } else {
                  s4 = s5;
                }
              } else {
                peg$currPos = s4;
                s4 = peg$c2;
              }
            } else {
              peg$currPos = s4;
              s4 = peg$c2;
            }
          } else {
            peg$currPos = s4;
            s4 = peg$c2;
          }
          while (s4 !== null) {
            s3.push(s4);
            s4 = peg$currPos;
            s5 = peg$parseINDENT();
            if (s5 !== null) {
              s6 = peg$parsetextNodes();
              if (s6 !== null) {
                s7 = peg$parseDEDENT();
                if (s7 !== null) {
                  peg$reportedPos = s4;
                  s5 = peg$c73(s6);
                  if (s5 === null) {
                    peg$currPos = s4;
                    s4 = s5;
                  } else {
                    s4 = s5;
                  }
                } else {
                  peg$currPos = s4;
                  s4 = peg$c2;
                }
              } else {
                peg$currPos = s4;
                s4 = peg$c2;
              }
            } else {
              peg$currPos = s4;
              s4 = peg$c2;
            }
          }
          if (s3 !== null) {
            peg$reportedPos = s0;
            s1 = peg$c74(s2,s3);
            if (s1 === null) {
              peg$currPos = s0;
              s0 = s1;
            } else {
              s0 = s1;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c2;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c2;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c2;
      }

      return s0;
    }

    function peg$parsetextNodes() {
      var s0, s1, s2, s3, s4, s5;

      s0 = peg$currPos;
      s1 = peg$parsepreMustacheText();
      if (s1 === null) {
        s1 = peg$c3;
      }
      if (s1 !== null) {
        s2 = [];
        s3 = peg$currPos;
        s4 = peg$parserawMustache();
        if (s4 !== null) {
          s5 = peg$parsepreMustacheText();
          if (s5 === null) {
            s5 = peg$c3;
          }
          if (s5 !== null) {
            s4 = [s4, s5];
            s3 = s4;
          } else {
            peg$currPos = s3;
            s3 = peg$c2;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$c2;
        }
        while (s3 !== null) {
          s2.push(s3);
          s3 = peg$currPos;
          s4 = peg$parserawMustache();
          if (s4 !== null) {
            s5 = peg$parsepreMustacheText();
            if (s5 === null) {
              s5 = peg$c3;
            }
            if (s5 !== null) {
              s4 = [s4, s5];
              s3 = s4;
            } else {
              peg$currPos = s3;
              s3 = peg$c2;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$c2;
          }
        }
        if (s2 !== null) {
          s3 = peg$parseTERM();
          if (s3 !== null) {
            peg$reportedPos = s0;
            s1 = peg$c75(s1,s2);
            if (s1 === null) {
              peg$currPos = s0;
              s0 = s1;
            } else {
              s0 = s1;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c2;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c2;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c2;
      }

      return s0;
    }

    function peg$parserawMustache() {
      var s0;

      s0 = peg$parserawMustacheUnescaped();
      if (s0 === null) {
        s0 = peg$parserawMustacheEscaped();
      }

      return s0;
    }

    function peg$parserawMustacheSingle() {
      var s0, s1, s2, s3, s4, s5;

      s0 = peg$currPos;
      s1 = peg$parsesingleOpen();
      if (s1 !== null) {
        s2 = peg$parse_();
        if (s2 !== null) {
          s3 = peg$parseinMustache();
          if (s3 !== null) {
            s4 = peg$parse_();
            if (s4 !== null) {
              s5 = peg$parsesingleClose();
              if (s5 !== null) {
                peg$reportedPos = s0;
                s1 = peg$c76(s3);
                if (s1 === null) {
                  peg$currPos = s0;
                  s0 = s1;
                } else {
                  s0 = s1;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c2;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c2;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c2;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c2;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c2;
      }

      return s0;
    }

    function peg$parserawMustacheEscaped() {
      var s0, s1, s2, s3, s4, s5;

      s0 = peg$currPos;
      s1 = peg$parsedoubleOpen();
      if (s1 !== null) {
        s2 = peg$parse_();
        if (s2 !== null) {
          s3 = peg$parseinMustache();
          if (s3 !== null) {
            s4 = peg$parse_();
            if (s4 !== null) {
              s5 = peg$parsedoubleClose();
              if (s5 !== null) {
                peg$reportedPos = s0;
                s1 = peg$c76(s3);
                if (s1 === null) {
                  peg$currPos = s0;
                  s0 = s1;
                } else {
                  s0 = s1;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c2;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c2;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c2;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c2;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c2;
      }
      if (s0 === null) {
        s0 = peg$currPos;
        s1 = peg$parsehashStacheOpen();
        if (s1 !== null) {
          s2 = peg$parse_();
          if (s2 !== null) {
            s3 = peg$parseinMustache();
            if (s3 !== null) {
              s4 = peg$parse_();
              if (s4 !== null) {
                s5 = peg$parsehashStacheClose();
                if (s5 !== null) {
                  peg$reportedPos = s0;
                  s1 = peg$c76(s3);
                  if (s1 === null) {
                    peg$currPos = s0;
                    s0 = s1;
                  } else {
                    s0 = s1;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$c2;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c2;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c2;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c2;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c2;
        }
      }

      return s0;
    }

    function peg$parserawMustacheUnescaped() {
      var s0, s1, s2, s3, s4, s5;

      s0 = peg$currPos;
      s1 = peg$parsetripleOpen();
      if (s1 !== null) {
        s2 = peg$parse_();
        if (s2 !== null) {
          s3 = peg$parseinMustache();
          if (s3 !== null) {
            s4 = peg$parse_();
            if (s4 !== null) {
              s5 = peg$parsetripleClose();
              if (s5 !== null) {
                peg$reportedPos = s0;
                s1 = peg$c77(s3);
                if (s1 === null) {
                  peg$currPos = s0;
                  s0 = s1;
                } else {
                  s0 = s1;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c2;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c2;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c2;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c2;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c2;
      }

      return s0;
    }

    function peg$parsepreMustacheText() {
      var s0, s1, s2;

      s0 = peg$currPos;
      s1 = [];
      s2 = peg$parsepreMustacheUnit();
      if (s2 !== null) {
        while (s2 !== null) {
          s1.push(s2);
          s2 = peg$parsepreMustacheUnit();
        }
      } else {
        s1 = peg$c2;
      }
      if (s1 !== null) {
        peg$reportedPos = s0;
        s1 = peg$c78(s1);
      }
      if (s1 === null) {
        peg$currPos = s0;
        s0 = s1;
      } else {
        s0 = s1;
      }

      return s0;
    }

    function peg$parsepreMustacheUnit() {
      var s0, s1, s2;

      s0 = peg$currPos;
      s1 = peg$currPos;
      peg$silentFails++;
      s2 = peg$parsetripleOpen();
      if (s2 === null) {
        s2 = peg$parsedoubleOpen();
        if (s2 === null) {
          s2 = peg$parsehashStacheOpen();
          if (s2 === null) {
            s2 = peg$parseDEDENT();
            if (s2 === null) {
              s2 = peg$parseTERM();
            }
          }
        }
      }
      peg$silentFails--;
      if (s2 === null) {
        s1 = peg$c3;
      } else {
        peg$currPos = s1;
        s1 = peg$c2;
      }
      if (s1 !== null) {
        if (input.length > peg$currPos) {
          s2 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s2 = null;
          if (peg$silentFails === 0) { peg$fail(peg$c79); }
        }
        if (s2 !== null) {
          peg$reportedPos = s0;
          s1 = peg$c80(s2);
          if (s1 === null) {
            peg$currPos = s0;
            s0 = s1;
          } else {
            s0 = s1;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c2;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c2;
      }

      return s0;
    }

    function peg$parseinTagMustache() {
      var s0;

      s0 = peg$parserawMustacheSingle();
      if (s0 === null) {
        s0 = peg$parserawMustacheUnescaped();
        if (s0 === null) {
          s0 = peg$parserawMustacheEscaped();
        }
      }

      return s0;
    }

    function peg$parsesingleOpen() {
      var s0, s1;

      peg$silentFails++;
      if (input.charCodeAt(peg$currPos) === 123) {
        s0 = peg$c82;
        peg$currPos++;
      } else {
        s0 = null;
        if (peg$silentFails === 0) { peg$fail(peg$c83); }
      }
      peg$silentFails--;
      if (s0 === null) {
        s1 = null;
        if (peg$silentFails === 0) { peg$fail(peg$c81); }
      }

      return s0;
    }

    function peg$parsedoubleOpen() {
      var s0, s1;

      peg$silentFails++;
      if (input.substr(peg$currPos, 2) === peg$c85) {
        s0 = peg$c85;
        peg$currPos += 2;
      } else {
        s0 = null;
        if (peg$silentFails === 0) { peg$fail(peg$c86); }
      }
      peg$silentFails--;
      if (s0 === null) {
        s1 = null;
        if (peg$silentFails === 0) { peg$fail(peg$c84); }
      }

      return s0;
    }

    function peg$parsetripleOpen() {
      var s0, s1;

      peg$silentFails++;
      if (input.substr(peg$currPos, 3) === peg$c88) {
        s0 = peg$c88;
        peg$currPos += 3;
      } else {
        s0 = null;
        if (peg$silentFails === 0) { peg$fail(peg$c89); }
      }
      peg$silentFails--;
      if (s0 === null) {
        s1 = null;
        if (peg$silentFails === 0) { peg$fail(peg$c87); }
      }

      return s0;
    }

    function peg$parsesingleClose() {
      var s0, s1;

      peg$silentFails++;
      if (input.charCodeAt(peg$currPos) === 125) {
        s0 = peg$c91;
        peg$currPos++;
      } else {
        s0 = null;
        if (peg$silentFails === 0) { peg$fail(peg$c92); }
      }
      peg$silentFails--;
      if (s0 === null) {
        s1 = null;
        if (peg$silentFails === 0) { peg$fail(peg$c90); }
      }

      return s0;
    }

    function peg$parsedoubleClose() {
      var s0, s1;

      peg$silentFails++;
      if (input.substr(peg$currPos, 2) === peg$c94) {
        s0 = peg$c94;
        peg$currPos += 2;
      } else {
        s0 = null;
        if (peg$silentFails === 0) { peg$fail(peg$c95); }
      }
      peg$silentFails--;
      if (s0 === null) {
        s1 = null;
        if (peg$silentFails === 0) { peg$fail(peg$c93); }
      }

      return s0;
    }

    function peg$parsetripleClose() {
      var s0, s1;

      peg$silentFails++;
      if (input.substr(peg$currPos, 3) === peg$c97) {
        s0 = peg$c97;
        peg$currPos += 3;
      } else {
        s0 = null;
        if (peg$silentFails === 0) { peg$fail(peg$c98); }
      }
      peg$silentFails--;
      if (s0 === null) {
        s1 = null;
        if (peg$silentFails === 0) { peg$fail(peg$c96); }
      }

      return s0;
    }

    function peg$parsehashStacheOpen() {
      var s0, s1;

      peg$silentFails++;
      if (input.substr(peg$currPos, 2) === peg$c100) {
        s0 = peg$c100;
        peg$currPos += 2;
      } else {
        s0 = null;
        if (peg$silentFails === 0) { peg$fail(peg$c101); }
      }
      peg$silentFails--;
      if (s0 === null) {
        s1 = null;
        if (peg$silentFails === 0) { peg$fail(peg$c99); }
      }

      return s0;
    }

    function peg$parsehashStacheClose() {
      var s0, s1;

      peg$silentFails++;
      if (input.charCodeAt(peg$currPos) === 125) {
        s0 = peg$c91;
        peg$currPos++;
      } else {
        s0 = null;
        if (peg$silentFails === 0) { peg$fail(peg$c92); }
      }
      peg$silentFails--;
      if (s0 === null) {
        s1 = null;
        if (peg$silentFails === 0) { peg$fail(peg$c102); }
      }

      return s0;
    }

    function peg$parseequalSign() {
      var s0, s1, s2;

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 2) === peg$c103) {
        s1 = peg$c103;
        peg$currPos += 2;
      } else {
        s1 = null;
        if (peg$silentFails === 0) { peg$fail(peg$c104); }
      }
      if (s1 !== null) {
        if (input.charCodeAt(peg$currPos) === 32) {
          s2 = peg$c16;
          peg$currPos++;
        } else {
          s2 = null;
          if (peg$silentFails === 0) { peg$fail(peg$c17); }
        }
        if (s2 === null) {
          s2 = peg$c3;
        }
        if (s2 !== null) {
          peg$reportedPos = s0;
          s1 = peg$c105();
          if (s1 === null) {
            peg$currPos = s0;
            s0 = s1;
          } else {
            s0 = s1;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c2;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c2;
      }
      if (s0 === null) {
        s0 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 61) {
          s1 = peg$c35;
          peg$currPos++;
        } else {
          s1 = null;
          if (peg$silentFails === 0) { peg$fail(peg$c36); }
        }
        if (s1 !== null) {
          if (input.charCodeAt(peg$currPos) === 32) {
            s2 = peg$c16;
            peg$currPos++;
          } else {
            s2 = null;
            if (peg$silentFails === 0) { peg$fail(peg$c17); }
          }
          if (s2 === null) {
            s2 = peg$c3;
          }
          if (s2 !== null) {
            peg$reportedPos = s0;
            s1 = peg$c106();
            if (s1 === null) {
              peg$currPos = s0;
              s0 = s1;
            } else {
              s0 = s1;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c2;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c2;
        }
      }

      return s0;
    }

    function peg$parsehtmlTagAndOptionalAttributes() {
      var s0, s1, s2, s3, s4, s5, s6;

      s0 = peg$currPos;
      s1 = peg$currPos;
      s2 = peg$parsehtmlTagName();
      if (s2 !== null) {
        s3 = peg$parseshorthandAttributes();
        if (s3 === null) {
          s3 = peg$c3;
        }
        if (s3 !== null) {
          s4 = [];
          s5 = peg$parseinTagMustache();
          while (s5 !== null) {
            s4.push(s5);
            s5 = peg$parseinTagMustache();
          }
          if (s4 !== null) {
            s5 = [];
            s6 = peg$parsefullAttribute();
            while (s6 !== null) {
              s5.push(s6);
              s6 = peg$parsefullAttribute();
            }
            if (s5 !== null) {
              peg$reportedPos = s1;
              s2 = peg$c107(s2,s3,s4,s5);
              if (s2 === null) {
                peg$currPos = s1;
                s1 = s2;
              } else {
                s1 = s2;
              }
            } else {
              peg$currPos = s1;
              s1 = peg$c2;
            }
          } else {
            peg$currPos = s1;
            s1 = peg$c2;
          }
        } else {
          peg$currPos = s1;
          s1 = peg$c2;
        }
      } else {
        peg$currPos = s1;
        s1 = peg$c2;
      }
      if (s1 === null) {
        s1 = peg$currPos;
        s2 = peg$parseshorthandAttributes();
        if (s2 !== null) {
          s3 = [];
          s4 = peg$parseinTagMustache();
          while (s4 !== null) {
            s3.push(s4);
            s4 = peg$parseinTagMustache();
          }
          if (s3 !== null) {
            s4 = [];
            s5 = peg$parsefullAttribute();
            while (s5 !== null) {
              s4.push(s5);
              s5 = peg$parsefullAttribute();
            }
            if (s4 !== null) {
              peg$reportedPos = s1;
              s2 = peg$c108(s2,s3,s4);
              if (s2 === null) {
                peg$currPos = s1;
                s1 = s2;
              } else {
                s1 = s2;
              }
            } else {
              peg$currPos = s1;
              s1 = peg$c2;
            }
          } else {
            peg$currPos = s1;
            s1 = peg$c2;
          }
        } else {
          peg$currPos = s1;
          s1 = peg$c2;
        }
      }
      if (s1 !== null) {
        peg$reportedPos = s0;
        s1 = peg$c109(s1);
      }
      if (s1 === null) {
        peg$currPos = s0;
        s0 = s1;
      } else {
        s0 = s1;
      }

      return s0;
    }

    function peg$parseshorthandAttributes() {
      var s0;

      s0 = peg$parseattributesAtLeastID();
      if (s0 === null) {
        s0 = peg$parseattributesAtLeastClass();
      }

      return s0;
    }

    function peg$parseattributesAtLeastID() {
      var s0, s1, s2, s3;

      s0 = peg$currPos;
      s1 = peg$parseidShorthand();
      if (s1 !== null) {
        s2 = [];
        s3 = peg$parseclassShorthand();
        while (s3 !== null) {
          s2.push(s3);
          s3 = peg$parseclassShorthand();
        }
        if (s2 !== null) {
          peg$reportedPos = s0;
          s1 = peg$c110(s1,s2);
          if (s1 === null) {
            peg$currPos = s0;
            s0 = s1;
          } else {
            s0 = s1;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c2;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c2;
      }

      return s0;
    }

    function peg$parseattributesAtLeastClass() {
      var s0, s1, s2;

      s0 = peg$currPos;
      s1 = [];
      s2 = peg$parseclassShorthand();
      if (s2 !== null) {
        while (s2 !== null) {
          s1.push(s2);
          s2 = peg$parseclassShorthand();
        }
      } else {
        s1 = peg$c2;
      }
      if (s1 !== null) {
        peg$reportedPos = s0;
        s1 = peg$c111(s1);
      }
      if (s1 === null) {
        peg$currPos = s0;
        s0 = s1;
      } else {
        s0 = s1;
      }

      return s0;
    }

    function peg$parsefullAttribute() {
      var s0, s1, s2;

      s0 = peg$currPos;
      s1 = [];
      if (input.charCodeAt(peg$currPos) === 32) {
        s2 = peg$c16;
        peg$currPos++;
      } else {
        s2 = null;
        if (peg$silentFails === 0) { peg$fail(peg$c17); }
      }
      if (s2 !== null) {
        while (s2 !== null) {
          s1.push(s2);
          if (input.charCodeAt(peg$currPos) === 32) {
            s2 = peg$c16;
            peg$currPos++;
          } else {
            s2 = null;
            if (peg$silentFails === 0) { peg$fail(peg$c17); }
          }
        }
      } else {
        s1 = peg$c2;
      }
      if (s1 !== null) {
        s2 = peg$parseactionAttribute();
        if (s2 === null) {
          s2 = peg$parseboundAttribute();
          if (s2 === null) {
            s2 = peg$parsenormalAttribute();
          }
        }
        if (s2 !== null) {
          peg$reportedPos = s0;
          s1 = peg$c112(s2);
          if (s1 === null) {
            peg$currPos = s0;
            s0 = s1;
          } else {
            s0 = s1;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c2;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c2;
      }

      return s0;
    }

    function peg$parseboundAttributeValueText() {
      var s0, s1, s2;

      s0 = peg$currPos;
      s1 = [];
      if (peg$c113.test(input.charAt(peg$currPos))) {
        s2 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s2 = null;
        if (peg$silentFails === 0) { peg$fail(peg$c114); }
      }
      if (s2 !== null) {
        while (s2 !== null) {
          s1.push(s2);
          if (peg$c113.test(input.charAt(peg$currPos))) {
            s2 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s2 = null;
            if (peg$silentFails === 0) { peg$fail(peg$c114); }
          }
        }
      } else {
        s1 = peg$c2;
      }
      if (s1 !== null) {
        s1 = input.substring(s0, peg$currPos);
      }
      s0 = s1;

      return s0;
    }

    function peg$parseactionValue() {
      var s0, s1;

      s0 = peg$parsequotedActionValue();
      if (s0 === null) {
        s0 = peg$currPos;
        s1 = peg$parsepathIdNode();
        if (s1 !== null) {
          peg$reportedPos = s0;
          s1 = peg$c115(s1);
        }
        if (s1 === null) {
          peg$currPos = s0;
          s0 = s1;
        } else {
          s0 = s1;
        }
      }

      return s0;
    }

    function peg$parsequotedActionValue() {
      var s0, s1, s2, s3, s4;

      s0 = peg$currPos;
      s1 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 34) {
        s2 = peg$c57;
        peg$currPos++;
      } else {
        s2 = null;
        if (peg$silentFails === 0) { peg$fail(peg$c58); }
      }
      if (s2 !== null) {
        s3 = peg$parseinMustache();
        if (s3 !== null) {
          if (input.charCodeAt(peg$currPos) === 34) {
            s4 = peg$c57;
            peg$currPos++;
          } else {
            s4 = null;
            if (peg$silentFails === 0) { peg$fail(peg$c58); }
          }
          if (s4 !== null) {
            s2 = [s2, s3, s4];
            s1 = s2;
          } else {
            peg$currPos = s1;
            s1 = peg$c2;
          }
        } else {
          peg$currPos = s1;
          s1 = peg$c2;
        }
      } else {
        peg$currPos = s1;
        s1 = peg$c2;
      }
      if (s1 === null) {
        s1 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 39) {
          s2 = peg$c59;
          peg$currPos++;
        } else {
          s2 = null;
          if (peg$silentFails === 0) { peg$fail(peg$c60); }
        }
        if (s2 !== null) {
          s3 = peg$parseinMustache();
          if (s3 !== null) {
            if (input.charCodeAt(peg$currPos) === 39) {
              s4 = peg$c59;
              peg$currPos++;
            } else {
              s4 = null;
              if (peg$silentFails === 0) { peg$fail(peg$c60); }
            }
            if (s4 !== null) {
              s2 = [s2, s3, s4];
              s1 = s2;
            } else {
              peg$currPos = s1;
              s1 = peg$c2;
            }
          } else {
            peg$currPos = s1;
            s1 = peg$c2;
          }
        } else {
          peg$currPos = s1;
          s1 = peg$c2;
        }
      }
      if (s1 !== null) {
        peg$reportedPos = s0;
        s1 = peg$c61(s1);
      }
      if (s1 === null) {
        peg$currPos = s0;
        s0 = s1;
      } else {
        s0 = s1;
      }

      return s0;
    }

    function peg$parseactionAttribute() {
      var s0, s1, s2, s3;

      s0 = peg$currPos;
      s1 = peg$parseknownEvent();
      if (s1 !== null) {
        if (input.charCodeAt(peg$currPos) === 61) {
          s2 = peg$c35;
          peg$currPos++;
        } else {
          s2 = null;
          if (peg$silentFails === 0) { peg$fail(peg$c36); }
        }
        if (s2 !== null) {
          s3 = peg$parseactionValue();
          if (s3 !== null) {
            peg$reportedPos = s0;
            s1 = peg$c116(s1,s3);
            if (s1 === null) {
              peg$currPos = s0;
              s0 = s1;
            } else {
              s0 = s1;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c2;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c2;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c2;
      }

      return s0;
    }

    function peg$parseboundAttribute() {
      var s0, s1, s2, s3;

      s0 = peg$currPos;
      s1 = peg$parsekey();
      if (s1 !== null) {
        if (input.charCodeAt(peg$currPos) === 61) {
          s2 = peg$c35;
          peg$currPos++;
        } else {
          s2 = null;
          if (peg$silentFails === 0) { peg$fail(peg$c36); }
        }
        if (s2 !== null) {
          s3 = peg$parseboundAttributeValueText();
          if (s3 !== null) {
            peg$reportedPos = s0;
            s1 = peg$c117(s1,s3);
            if (s1 === null) {
              peg$currPos = s0;
              s0 = s1;
            } else {
              s0 = s1;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c2;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c2;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c2;
      }

      return s0;
    }

    function peg$parsenormalAttribute() {
      var s0, s1, s2, s3;

      s0 = peg$currPos;
      s1 = peg$parsekey();
      if (s1 !== null) {
        if (input.charCodeAt(peg$currPos) === 61) {
          s2 = peg$c35;
          peg$currPos++;
        } else {
          s2 = null;
          if (peg$silentFails === 0) { peg$fail(peg$c36); }
        }
        if (s2 !== null) {
          s3 = peg$parsestring();
          if (s3 !== null) {
            peg$reportedPos = s0;
            s1 = peg$c118(s1,s3);
            if (s1 === null) {
              peg$currPos = s0;
              s0 = s1;
            } else {
              s0 = s1;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c2;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c2;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c2;
      }

      return s0;
    }

    function peg$parseattributeName() {
      var s0, s1, s2;

      s0 = peg$currPos;
      s1 = [];
      s2 = peg$parseattributeChar();
      while (s2 !== null) {
        s1.push(s2);
        s2 = peg$parseattributeChar();
      }
      if (s1 !== null) {
        s1 = input.substring(s0, peg$currPos);
      }
      s0 = s1;

      return s0;
    }

    function peg$parseattributeValue() {
      var s0;

      s0 = peg$parsestring();
      if (s0 === null) {
        s0 = peg$parseparam();
      }

      return s0;
    }

    function peg$parseattributeChar() {
      var s0;

      s0 = peg$parsealpha();
      if (s0 === null) {
        if (peg$c54.test(input.charAt(peg$currPos))) {
          s0 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s0 = null;
          if (peg$silentFails === 0) { peg$fail(peg$c55); }
        }
        if (s0 === null) {
          if (input.charCodeAt(peg$currPos) === 95) {
            s0 = peg$c119;
            peg$currPos++;
          } else {
            s0 = null;
            if (peg$silentFails === 0) { peg$fail(peg$c120); }
          }
          if (s0 === null) {
            if (input.charCodeAt(peg$currPos) === 45) {
              s0 = peg$c121;
              peg$currPos++;
            } else {
              s0 = null;
              if (peg$silentFails === 0) { peg$fail(peg$c122); }
            }
          }
        }
      }

      return s0;
    }

    function peg$parseidShorthand() {
      var s0, s1, s2;

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 35) {
        s1 = peg$c123;
        peg$currPos++;
      } else {
        s1 = null;
        if (peg$silentFails === 0) { peg$fail(peg$c124); }
      }
      if (s1 !== null) {
        s2 = peg$parsecssIdentifier();
        if (s2 !== null) {
          peg$reportedPos = s0;
          s1 = peg$c125(s2);
          if (s1 === null) {
            peg$currPos = s0;
            s0 = s1;
          } else {
            s0 = s1;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c2;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c2;
      }

      return s0;
    }

    function peg$parseclassShorthand() {
      var s0, s1, s2;

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 46) {
        s1 = peg$c31;
        peg$currPos++;
      } else {
        s1 = null;
        if (peg$silentFails === 0) { peg$fail(peg$c32); }
      }
      if (s1 !== null) {
        s2 = peg$parsecssIdentifier();
        if (s2 !== null) {
          peg$reportedPos = s0;
          s1 = peg$c80(s2);
          if (s1 === null) {
            peg$currPos = s0;
            s0 = s1;
          } else {
            s0 = s1;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c2;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c2;
      }

      return s0;
    }

    function peg$parsecssIdentifier() {
      var s0, s1;

      peg$silentFails++;
      s0 = peg$parseident();
      peg$silentFails--;
      if (s0 === null) {
        s1 = null;
        if (peg$silentFails === 0) { peg$fail(peg$c126); }
      }

      return s0;
    }

    function peg$parseident() {
      var s0, s1, s2, s3, s4;

      s0 = peg$currPos;
      s1 = peg$parsenmstart();
      if (s1 !== null) {
        s2 = peg$currPos;
        s3 = [];
        s4 = peg$parsenmchar();
        while (s4 !== null) {
          s3.push(s4);
          s4 = peg$parsenmchar();
        }
        if (s3 !== null) {
          s3 = input.substring(s2, peg$currPos);
        }
        s2 = s3;
        if (s2 !== null) {
          peg$reportedPos = s0;
          s1 = peg$c127(s1,s2);
          if (s1 === null) {
            peg$currPos = s0;
            s0 = s1;
          } else {
            s0 = s1;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c2;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c2;
      }

      return s0;
    }

    function peg$parsenmchar() {
      var s0;

      if (peg$c128.test(input.charAt(peg$currPos))) {
        s0 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s0 = null;
        if (peg$silentFails === 0) { peg$fail(peg$c129); }
      }
      if (s0 === null) {
        s0 = peg$parsenonascii();
      }

      return s0;
    }

    function peg$parsenmstart() {
      var s0;

      if (peg$c130.test(input.charAt(peg$currPos))) {
        s0 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s0 = null;
        if (peg$silentFails === 0) { peg$fail(peg$c131); }
      }
      if (s0 === null) {
        s0 = peg$parsenonascii();
      }

      return s0;
    }

    function peg$parsenonascii() {
      var s0;

      if (peg$c132.test(input.charAt(peg$currPos))) {
        s0 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s0 = null;
        if (peg$silentFails === 0) { peg$fail(peg$c133); }
      }

      return s0;
    }

    function peg$parsehtmlTagName() {
      var s0, s1, s2, s3, s4;

      peg$silentFails++;
      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 37) {
        s1 = peg$c135;
        peg$currPos++;
      } else {
        s1 = null;
        if (peg$silentFails === 0) { peg$fail(peg$c136); }
      }
      if (s1 !== null) {
        s2 = peg$currPos;
        s3 = [];
        s4 = peg$parsetagChar();
        if (s4 !== null) {
          while (s4 !== null) {
            s3.push(s4);
            s4 = peg$parsetagChar();
          }
        } else {
          s3 = peg$c2;
        }
        if (s3 !== null) {
          s3 = input.substring(s2, peg$currPos);
        }
        s2 = s3;
        if (s2 !== null) {
          peg$reportedPos = s0;
          s1 = peg$c80(s2);
          if (s1 === null) {
            peg$currPos = s0;
            s0 = s1;
          } else {
            s0 = s1;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c2;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c2;
      }
      if (s0 === null) {
        s0 = peg$parseknownTagName();
      }
      peg$silentFails--;
      if (s0 === null) {
        s1 = null;
        if (peg$silentFails === 0) { peg$fail(peg$c134); }
      }

      return s0;
    }

    function peg$parsetagChar() {
      var s0;

      if (peg$c137.test(input.charAt(peg$currPos))) {
        s0 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s0 = null;
        if (peg$silentFails === 0) { peg$fail(peg$c138); }
      }

      return s0;
    }

    function peg$parseknownTagName() {
      var s0, s1;

      peg$silentFails++;
      if (input.substr(peg$currPos, 10) === peg$c139) {
        s0 = peg$c139;
        peg$currPos += 10;
      } else {
        s0 = null;
        if (peg$silentFails === 0) { peg$fail(peg$c140); }
      }
      if (s0 === null) {
        if (input.substr(peg$currPos, 10) === peg$c141) {
          s0 = peg$c141;
          peg$currPos += 10;
        } else {
          s0 = null;
          if (peg$silentFails === 0) { peg$fail(peg$c142); }
        }
        if (s0 === null) {
          if (input.substr(peg$currPos, 9) === peg$c143) {
            s0 = peg$c143;
            peg$currPos += 9;
          } else {
            s0 = null;
            if (peg$silentFails === 0) { peg$fail(peg$c144); }
          }
          if (s0 === null) {
            if (input.substr(peg$currPos, 8) === peg$c145) {
              s0 = peg$c145;
              peg$currPos += 8;
            } else {
              s0 = null;
              if (peg$silentFails === 0) { peg$fail(peg$c146); }
            }
            if (s0 === null) {
              if (input.substr(peg$currPos, 8) === peg$c147) {
                s0 = peg$c147;
                peg$currPos += 8;
              } else {
                s0 = null;
                if (peg$silentFails === 0) { peg$fail(peg$c148); }
              }
              if (s0 === null) {
                if (input.substr(peg$currPos, 8) === peg$c149) {
                  s0 = peg$c149;
                  peg$currPos += 8;
                } else {
                  s0 = null;
                  if (peg$silentFails === 0) { peg$fail(peg$c150); }
                }
                if (s0 === null) {
                  if (input.substr(peg$currPos, 8) === peg$c151) {
                    s0 = peg$c151;
                    peg$currPos += 8;
                  } else {
                    s0 = null;
                    if (peg$silentFails === 0) { peg$fail(peg$c152); }
                  }
                  if (s0 === null) {
                    if (input.substr(peg$currPos, 8) === peg$c153) {
                      s0 = peg$c153;
                      peg$currPos += 8;
                    } else {
                      s0 = null;
                      if (peg$silentFails === 0) { peg$fail(peg$c154); }
                    }
                    if (s0 === null) {
                      if (input.substr(peg$currPos, 8) === peg$c155) {
                        s0 = peg$c155;
                        peg$currPos += 8;
                      } else {
                        s0 = null;
                        if (peg$silentFails === 0) { peg$fail(peg$c156); }
                      }
                      if (s0 === null) {
                        if (input.substr(peg$currPos, 8) === peg$c157) {
                          s0 = peg$c157;
                          peg$currPos += 8;
                        } else {
                          s0 = null;
                          if (peg$silentFails === 0) { peg$fail(peg$c158); }
                        }
                        if (s0 === null) {
                          if (input.substr(peg$currPos, 8) === peg$c159) {
                            s0 = peg$c159;
                            peg$currPos += 8;
                          } else {
                            s0 = null;
                            if (peg$silentFails === 0) { peg$fail(peg$c160); }
                          }
                          if (s0 === null) {
                            if (input.substr(peg$currPos, 8) === peg$c161) {
                              s0 = peg$c161;
                              peg$currPos += 8;
                            } else {
                              s0 = null;
                              if (peg$silentFails === 0) { peg$fail(peg$c162); }
                            }
                            if (s0 === null) {
                              if (input.substr(peg$currPos, 8) === peg$c163) {
                                s0 = peg$c163;
                                peg$currPos += 8;
                              } else {
                                s0 = null;
                                if (peg$silentFails === 0) { peg$fail(peg$c164); }
                              }
                              if (s0 === null) {
                                if (input.substr(peg$currPos, 7) === peg$c165) {
                                  s0 = peg$c165;
                                  peg$currPos += 7;
                                } else {
                                  s0 = null;
                                  if (peg$silentFails === 0) { peg$fail(peg$c166); }
                                }
                                if (s0 === null) {
                                  if (input.substr(peg$currPos, 7) === peg$c167) {
                                    s0 = peg$c167;
                                    peg$currPos += 7;
                                  } else {
                                    s0 = null;
                                    if (peg$silentFails === 0) { peg$fail(peg$c168); }
                                  }
                                  if (s0 === null) {
                                    if (input.substr(peg$currPos, 7) === peg$c169) {
                                      s0 = peg$c169;
                                      peg$currPos += 7;
                                    } else {
                                      s0 = null;
                                      if (peg$silentFails === 0) { peg$fail(peg$c170); }
                                    }
                                    if (s0 === null) {
                                      if (input.substr(peg$currPos, 7) === peg$c171) {
                                        s0 = peg$c171;
                                        peg$currPos += 7;
                                      } else {
                                        s0 = null;
                                        if (peg$silentFails === 0) { peg$fail(peg$c172); }
                                      }
                                      if (s0 === null) {
                                        if (input.substr(peg$currPos, 7) === peg$c173) {
                                          s0 = peg$c173;
                                          peg$currPos += 7;
                                        } else {
                                          s0 = null;
                                          if (peg$silentFails === 0) { peg$fail(peg$c174); }
                                        }
                                        if (s0 === null) {
                                          if (input.substr(peg$currPos, 7) === peg$c175) {
                                            s0 = peg$c175;
                                            peg$currPos += 7;
                                          } else {
                                            s0 = null;
                                            if (peg$silentFails === 0) { peg$fail(peg$c176); }
                                          }
                                          if (s0 === null) {
                                            if (input.substr(peg$currPos, 7) === peg$c177) {
                                              s0 = peg$c177;
                                              peg$currPos += 7;
                                            } else {
                                              s0 = null;
                                              if (peg$silentFails === 0) { peg$fail(peg$c178); }
                                            }
                                            if (s0 === null) {
                                              if (input.substr(peg$currPos, 7) === peg$c179) {
                                                s0 = peg$c179;
                                                peg$currPos += 7;
                                              } else {
                                                s0 = null;
                                                if (peg$silentFails === 0) { peg$fail(peg$c180); }
                                              }
                                              if (s0 === null) {
                                                if (input.substr(peg$currPos, 7) === peg$c181) {
                                                  s0 = peg$c181;
                                                  peg$currPos += 7;
                                                } else {
                                                  s0 = null;
                                                  if (peg$silentFails === 0) { peg$fail(peg$c182); }
                                                }
                                                if (s0 === null) {
                                                  if (input.substr(peg$currPos, 7) === peg$c183) {
                                                    s0 = peg$c183;
                                                    peg$currPos += 7;
                                                  } else {
                                                    s0 = null;
                                                    if (peg$silentFails === 0) { peg$fail(peg$c184); }
                                                  }
                                                  if (s0 === null) {
                                                    if (input.substr(peg$currPos, 7) === peg$c185) {
                                                      s0 = peg$c185;
                                                      peg$currPos += 7;
                                                    } else {
                                                      s0 = null;
                                                      if (peg$silentFails === 0) { peg$fail(peg$c186); }
                                                    }
                                                    if (s0 === null) {
                                                      if (input.substr(peg$currPos, 7) === peg$c187) {
                                                        s0 = peg$c187;
                                                        peg$currPos += 7;
                                                      } else {
                                                        s0 = null;
                                                        if (peg$silentFails === 0) { peg$fail(peg$c188); }
                                                      }
                                                      if (s0 === null) {
                                                        if (input.substr(peg$currPos, 6) === peg$c189) {
                                                          s0 = peg$c189;
                                                          peg$currPos += 6;
                                                        } else {
                                                          s0 = null;
                                                          if (peg$silentFails === 0) { peg$fail(peg$c190); }
                                                        }
                                                        if (s0 === null) {
                                                          if (input.substr(peg$currPos, 6) === peg$c191) {
                                                            s0 = peg$c191;
                                                            peg$currPos += 6;
                                                          } else {
                                                            s0 = null;
                                                            if (peg$silentFails === 0) { peg$fail(peg$c192); }
                                                          }
                                                          if (s0 === null) {
                                                            if (input.substr(peg$currPos, 6) === peg$c193) {
                                                              s0 = peg$c193;
                                                              peg$currPos += 6;
                                                            } else {
                                                              s0 = null;
                                                              if (peg$silentFails === 0) { peg$fail(peg$c194); }
                                                            }
                                                            if (s0 === null) {
                                                              if (input.substr(peg$currPos, 6) === peg$c195) {
                                                                s0 = peg$c195;
                                                                peg$currPos += 6;
                                                              } else {
                                                                s0 = null;
                                                                if (peg$silentFails === 0) { peg$fail(peg$c196); }
                                                              }
                                                              if (s0 === null) {
                                                                if (input.substr(peg$currPos, 6) === peg$c197) {
                                                                  s0 = peg$c197;
                                                                  peg$currPos += 6;
                                                                } else {
                                                                  s0 = null;
                                                                  if (peg$silentFails === 0) { peg$fail(peg$c198); }
                                                                }
                                                                if (s0 === null) {
                                                                  if (input.substr(peg$currPos, 6) === peg$c199) {
                                                                    s0 = peg$c199;
                                                                    peg$currPos += 6;
                                                                  } else {
                                                                    s0 = null;
                                                                    if (peg$silentFails === 0) { peg$fail(peg$c200); }
                                                                  }
                                                                  if (s0 === null) {
                                                                    if (input.substr(peg$currPos, 6) === peg$c201) {
                                                                      s0 = peg$c201;
                                                                      peg$currPos += 6;
                                                                    } else {
                                                                      s0 = null;
                                                                      if (peg$silentFails === 0) { peg$fail(peg$c202); }
                                                                    }
                                                                    if (s0 === null) {
                                                                      if (input.substr(peg$currPos, 6) === peg$c203) {
                                                                        s0 = peg$c203;
                                                                        peg$currPos += 6;
                                                                      } else {
                                                                        s0 = null;
                                                                        if (peg$silentFails === 0) { peg$fail(peg$c204); }
                                                                      }
                                                                      if (s0 === null) {
                                                                        if (input.substr(peg$currPos, 6) === peg$c205) {
                                                                          s0 = peg$c205;
                                                                          peg$currPos += 6;
                                                                        } else {
                                                                          s0 = null;
                                                                          if (peg$silentFails === 0) { peg$fail(peg$c206); }
                                                                        }
                                                                        if (s0 === null) {
                                                                          if (input.substr(peg$currPos, 6) === peg$c207) {
                                                                            s0 = peg$c207;
                                                                            peg$currPos += 6;
                                                                          } else {
                                                                            s0 = null;
                                                                            if (peg$silentFails === 0) { peg$fail(peg$c208); }
                                                                          }
                                                                          if (s0 === null) {
                                                                            if (input.substr(peg$currPos, 6) === peg$c209) {
                                                                              s0 = peg$c209;
                                                                              peg$currPos += 6;
                                                                            } else {
                                                                              s0 = null;
                                                                              if (peg$silentFails === 0) { peg$fail(peg$c210); }
                                                                            }
                                                                            if (s0 === null) {
                                                                              if (input.substr(peg$currPos, 6) === peg$c211) {
                                                                                s0 = peg$c211;
                                                                                peg$currPos += 6;
                                                                              } else {
                                                                                s0 = null;
                                                                                if (peg$silentFails === 0) { peg$fail(peg$c212); }
                                                                              }
                                                                              if (s0 === null) {
                                                                                if (input.substr(peg$currPos, 6) === peg$c213) {
                                                                                  s0 = peg$c213;
                                                                                  peg$currPos += 6;
                                                                                } else {
                                                                                  s0 = null;
                                                                                  if (peg$silentFails === 0) { peg$fail(peg$c214); }
                                                                                }
                                                                                if (s0 === null) {
                                                                                  if (input.substr(peg$currPos, 6) === peg$c215) {
                                                                                    s0 = peg$c215;
                                                                                    peg$currPos += 6;
                                                                                  } else {
                                                                                    s0 = null;
                                                                                    if (peg$silentFails === 0) { peg$fail(peg$c216); }
                                                                                  }
                                                                                  if (s0 === null) {
                                                                                    if (input.substr(peg$currPos, 6) === peg$c217) {
                                                                                      s0 = peg$c217;
                                                                                      peg$currPos += 6;
                                                                                    } else {
                                                                                      s0 = null;
                                                                                      if (peg$silentFails === 0) { peg$fail(peg$c218); }
                                                                                    }
                                                                                    if (s0 === null) {
                                                                                      if (input.substr(peg$currPos, 6) === peg$c219) {
                                                                                        s0 = peg$c219;
                                                                                        peg$currPos += 6;
                                                                                      } else {
                                                                                        s0 = null;
                                                                                        if (peg$silentFails === 0) { peg$fail(peg$c220); }
                                                                                      }
                                                                                      if (s0 === null) {
                                                                                        if (input.substr(peg$currPos, 6) === peg$c221) {
                                                                                          s0 = peg$c221;
                                                                                          peg$currPos += 6;
                                                                                        } else {
                                                                                          s0 = null;
                                                                                          if (peg$silentFails === 0) { peg$fail(peg$c222); }
                                                                                        }
                                                                                        if (s0 === null) {
                                                                                          if (input.substr(peg$currPos, 6) === peg$c223) {
                                                                                            s0 = peg$c223;
                                                                                            peg$currPos += 6;
                                                                                          } else {
                                                                                            s0 = null;
                                                                                            if (peg$silentFails === 0) { peg$fail(peg$c224); }
                                                                                          }
                                                                                          if (s0 === null) {
                                                                                            if (input.substr(peg$currPos, 6) === peg$c225) {
                                                                                              s0 = peg$c225;
                                                                                              peg$currPos += 6;
                                                                                            } else {
                                                                                              s0 = null;
                                                                                              if (peg$silentFails === 0) { peg$fail(peg$c226); }
                                                                                            }
                                                                                            if (s0 === null) {
                                                                                              if (input.substr(peg$currPos, 6) === peg$c227) {
                                                                                                s0 = peg$c227;
                                                                                                peg$currPos += 6;
                                                                                              } else {
                                                                                                s0 = null;
                                                                                                if (peg$silentFails === 0) { peg$fail(peg$c228); }
                                                                                              }
                                                                                              if (s0 === null) {
                                                                                                if (input.substr(peg$currPos, 5) === peg$c229) {
                                                                                                  s0 = peg$c229;
                                                                                                  peg$currPos += 5;
                                                                                                } else {
                                                                                                  s0 = null;
                                                                                                  if (peg$silentFails === 0) { peg$fail(peg$c230); }
                                                                                                }
                                                                                                if (s0 === null) {
                                                                                                  if (input.substr(peg$currPos, 5) === peg$c231) {
                                                                                                    s0 = peg$c231;
                                                                                                    peg$currPos += 5;
                                                                                                  } else {
                                                                                                    s0 = null;
                                                                                                    if (peg$silentFails === 0) { peg$fail(peg$c232); }
                                                                                                  }
                                                                                                  if (s0 === null) {
                                                                                                    if (input.substr(peg$currPos, 5) === peg$c233) {
                                                                                                      s0 = peg$c233;
                                                                                                      peg$currPos += 5;
                                                                                                    } else {
                                                                                                      s0 = null;
                                                                                                      if (peg$silentFails === 0) { peg$fail(peg$c234); }
                                                                                                    }
                                                                                                    if (s0 === null) {
                                                                                                      if (input.substr(peg$currPos, 5) === peg$c235) {
                                                                                                        s0 = peg$c235;
                                                                                                        peg$currPos += 5;
                                                                                                      } else {
                                                                                                        s0 = null;
                                                                                                        if (peg$silentFails === 0) { peg$fail(peg$c236); }
                                                                                                      }
                                                                                                      if (s0 === null) {
                                                                                                        if (input.substr(peg$currPos, 5) === peg$c237) {
                                                                                                          s0 = peg$c237;
                                                                                                          peg$currPos += 5;
                                                                                                        } else {
                                                                                                          s0 = null;
                                                                                                          if (peg$silentFails === 0) { peg$fail(peg$c238); }
                                                                                                        }
                                                                                                        if (s0 === null) {
                                                                                                          if (input.substr(peg$currPos, 5) === peg$c239) {
                                                                                                            s0 = peg$c239;
                                                                                                            peg$currPos += 5;
                                                                                                          } else {
                                                                                                            s0 = null;
                                                                                                            if (peg$silentFails === 0) { peg$fail(peg$c240); }
                                                                                                          }
                                                                                                          if (s0 === null) {
                                                                                                            if (input.substr(peg$currPos, 5) === peg$c241) {
                                                                                                              s0 = peg$c241;
                                                                                                              peg$currPos += 5;
                                                                                                            } else {
                                                                                                              s0 = null;
                                                                                                              if (peg$silentFails === 0) { peg$fail(peg$c242); }
                                                                                                            }
                                                                                                            if (s0 === null) {
                                                                                                              if (input.substr(peg$currPos, 5) === peg$c243) {
                                                                                                                s0 = peg$c243;
                                                                                                                peg$currPos += 5;
                                                                                                              } else {
                                                                                                                s0 = null;
                                                                                                                if (peg$silentFails === 0) { peg$fail(peg$c244); }
                                                                                                              }
                                                                                                              if (s0 === null) {
                                                                                                                if (input.substr(peg$currPos, 5) === peg$c245) {
                                                                                                                  s0 = peg$c245;
                                                                                                                  peg$currPos += 5;
                                                                                                                } else {
                                                                                                                  s0 = null;
                                                                                                                  if (peg$silentFails === 0) { peg$fail(peg$c246); }
                                                                                                                }
                                                                                                                if (s0 === null) {
                                                                                                                  if (input.substr(peg$currPos, 5) === peg$c247) {
                                                                                                                    s0 = peg$c247;
                                                                                                                    peg$currPos += 5;
                                                                                                                  } else {
                                                                                                                    s0 = null;
                                                                                                                    if (peg$silentFails === 0) { peg$fail(peg$c248); }
                                                                                                                  }
                                                                                                                  if (s0 === null) {
                                                                                                                    if (input.substr(peg$currPos, 5) === peg$c249) {
                                                                                                                      s0 = peg$c249;
                                                                                                                      peg$currPos += 5;
                                                                                                                    } else {
                                                                                                                      s0 = null;
                                                                                                                      if (peg$silentFails === 0) { peg$fail(peg$c250); }
                                                                                                                    }
                                                                                                                    if (s0 === null) {
                                                                                                                      if (input.substr(peg$currPos, 5) === peg$c251) {
                                                                                                                        s0 = peg$c251;
                                                                                                                        peg$currPos += 5;
                                                                                                                      } else {
                                                                                                                        s0 = null;
                                                                                                                        if (peg$silentFails === 0) { peg$fail(peg$c252); }
                                                                                                                      }
                                                                                                                      if (s0 === null) {
                                                                                                                        if (input.substr(peg$currPos, 5) === peg$c253) {
                                                                                                                          s0 = peg$c253;
                                                                                                                          peg$currPos += 5;
                                                                                                                        } else {
                                                                                                                          s0 = null;
                                                                                                                          if (peg$silentFails === 0) { peg$fail(peg$c254); }
                                                                                                                        }
                                                                                                                        if (s0 === null) {
                                                                                                                          if (input.substr(peg$currPos, 5) === peg$c255) {
                                                                                                                            s0 = peg$c255;
                                                                                                                            peg$currPos += 5;
                                                                                                                          } else {
                                                                                                                            s0 = null;
                                                                                                                            if (peg$silentFails === 0) { peg$fail(peg$c256); }
                                                                                                                          }
                                                                                                                          if (s0 === null) {
                                                                                                                            if (input.substr(peg$currPos, 5) === peg$c257) {
                                                                                                                              s0 = peg$c257;
                                                                                                                              peg$currPos += 5;
                                                                                                                            } else {
                                                                                                                              s0 = null;
                                                                                                                              if (peg$silentFails === 0) { peg$fail(peg$c258); }
                                                                                                                            }
                                                                                                                            if (s0 === null) {
                                                                                                                              if (input.substr(peg$currPos, 5) === peg$c259) {
                                                                                                                                s0 = peg$c259;
                                                                                                                                peg$currPos += 5;
                                                                                                                              } else {
                                                                                                                                s0 = null;
                                                                                                                                if (peg$silentFails === 0) { peg$fail(peg$c260); }
                                                                                                                              }
                                                                                                                              if (s0 === null) {
                                                                                                                                if (input.substr(peg$currPos, 5) === peg$c261) {
                                                                                                                                  s0 = peg$c261;
                                                                                                                                  peg$currPos += 5;
                                                                                                                                } else {
                                                                                                                                  s0 = null;
                                                                                                                                  if (peg$silentFails === 0) { peg$fail(peg$c262); }
                                                                                                                                }
                                                                                                                                if (s0 === null) {
                                                                                                                                  if (input.substr(peg$currPos, 5) === peg$c263) {
                                                                                                                                    s0 = peg$c263;
                                                                                                                                    peg$currPos += 5;
                                                                                                                                  } else {
                                                                                                                                    s0 = null;
                                                                                                                                    if (peg$silentFails === 0) { peg$fail(peg$c264); }
                                                                                                                                  }
                                                                                                                                  if (s0 === null) {
                                                                                                                                    if (input.substr(peg$currPos, 4) === peg$c265) {
                                                                                                                                      s0 = peg$c265;
                                                                                                                                      peg$currPos += 4;
                                                                                                                                    } else {
                                                                                                                                      s0 = null;
                                                                                                                                      if (peg$silentFails === 0) { peg$fail(peg$c266); }
                                                                                                                                    }
                                                                                                                                    if (s0 === null) {
                                                                                                                                      if (input.substr(peg$currPos, 4) === peg$c267) {
                                                                                                                                        s0 = peg$c267;
                                                                                                                                        peg$currPos += 4;
                                                                                                                                      } else {
                                                                                                                                        s0 = null;
                                                                                                                                        if (peg$silentFails === 0) { peg$fail(peg$c268); }
                                                                                                                                      }
                                                                                                                                      if (s0 === null) {
                                                                                                                                        if (input.substr(peg$currPos, 4) === peg$c269) {
                                                                                                                                          s0 = peg$c269;
                                                                                                                                          peg$currPos += 4;
                                                                                                                                        } else {
                                                                                                                                          s0 = null;
                                                                                                                                          if (peg$silentFails === 0) { peg$fail(peg$c270); }
                                                                                                                                        }
                                                                                                                                        if (s0 === null) {
                                                                                                                                          if (input.substr(peg$currPos, 4) === peg$c271) {
                                                                                                                                            s0 = peg$c271;
                                                                                                                                            peg$currPos += 4;
                                                                                                                                          } else {
                                                                                                                                            s0 = null;
                                                                                                                                            if (peg$silentFails === 0) { peg$fail(peg$c272); }
                                                                                                                                          }
                                                                                                                                          if (s0 === null) {
                                                                                                                                            if (input.substr(peg$currPos, 4) === peg$c273) {
                                                                                                                                              s0 = peg$c273;
                                                                                                                                              peg$currPos += 4;
                                                                                                                                            } else {
                                                                                                                                              s0 = null;
                                                                                                                                              if (peg$silentFails === 0) { peg$fail(peg$c274); }
                                                                                                                                            }
                                                                                                                                            if (s0 === null) {
                                                                                                                                              if (input.substr(peg$currPos, 4) === peg$c275) {
                                                                                                                                                s0 = peg$c275;
                                                                                                                                                peg$currPos += 4;
                                                                                                                                              } else {
                                                                                                                                                s0 = null;
                                                                                                                                                if (peg$silentFails === 0) { peg$fail(peg$c276); }
                                                                                                                                              }
                                                                                                                                              if (s0 === null) {
                                                                                                                                                if (input.substr(peg$currPos, 4) === peg$c277) {
                                                                                                                                                  s0 = peg$c277;
                                                                                                                                                  peg$currPos += 4;
                                                                                                                                                } else {
                                                                                                                                                  s0 = null;
                                                                                                                                                  if (peg$silentFails === 0) { peg$fail(peg$c278); }
                                                                                                                                                }
                                                                                                                                                if (s0 === null) {
                                                                                                                                                  if (input.substr(peg$currPos, 4) === peg$c279) {
                                                                                                                                                    s0 = peg$c279;
                                                                                                                                                    peg$currPos += 4;
                                                                                                                                                  } else {
                                                                                                                                                    s0 = null;
                                                                                                                                                    if (peg$silentFails === 0) { peg$fail(peg$c280); }
                                                                                                                                                  }
                                                                                                                                                  if (s0 === null) {
                                                                                                                                                    if (input.substr(peg$currPos, 4) === peg$c281) {
                                                                                                                                                      s0 = peg$c281;
                                                                                                                                                      peg$currPos += 4;
                                                                                                                                                    } else {
                                                                                                                                                      s0 = null;
                                                                                                                                                      if (peg$silentFails === 0) { peg$fail(peg$c282); }
                                                                                                                                                    }
                                                                                                                                                    if (s0 === null) {
                                                                                                                                                      if (input.substr(peg$currPos, 4) === peg$c283) {
                                                                                                                                                        s0 = peg$c283;
                                                                                                                                                        peg$currPos += 4;
                                                                                                                                                      } else {
                                                                                                                                                        s0 = null;
                                                                                                                                                        if (peg$silentFails === 0) { peg$fail(peg$c284); }
                                                                                                                                                      }
                                                                                                                                                      if (s0 === null) {
                                                                                                                                                        if (input.substr(peg$currPos, 4) === peg$c285) {
                                                                                                                                                          s0 = peg$c285;
                                                                                                                                                          peg$currPos += 4;
                                                                                                                                                        } else {
                                                                                                                                                          s0 = null;
                                                                                                                                                          if (peg$silentFails === 0) { peg$fail(peg$c286); }
                                                                                                                                                        }
                                                                                                                                                        if (s0 === null) {
                                                                                                                                                          if (input.substr(peg$currPos, 4) === peg$c287) {
                                                                                                                                                            s0 = peg$c287;
                                                                                                                                                            peg$currPos += 4;
                                                                                                                                                          } else {
                                                                                                                                                            s0 = null;
                                                                                                                                                            if (peg$silentFails === 0) { peg$fail(peg$c288); }
                                                                                                                                                          }
                                                                                                                                                          if (s0 === null) {
                                                                                                                                                            if (input.substr(peg$currPos, 4) === peg$c289) {
                                                                                                                                                              s0 = peg$c289;
                                                                                                                                                              peg$currPos += 4;
                                                                                                                                                            } else {
                                                                                                                                                              s0 = null;
                                                                                                                                                              if (peg$silentFails === 0) { peg$fail(peg$c290); }
                                                                                                                                                            }
                                                                                                                                                            if (s0 === null) {
                                                                                                                                                              if (input.substr(peg$currPos, 4) === peg$c291) {
                                                                                                                                                                s0 = peg$c291;
                                                                                                                                                                peg$currPos += 4;
                                                                                                                                                              } else {
                                                                                                                                                                s0 = null;
                                                                                                                                                                if (peg$silentFails === 0) { peg$fail(peg$c292); }
                                                                                                                                                              }
                                                                                                                                                              if (s0 === null) {
                                                                                                                                                                if (input.substr(peg$currPos, 4) === peg$c293) {
                                                                                                                                                                  s0 = peg$c293;
                                                                                                                                                                  peg$currPos += 4;
                                                                                                                                                                } else {
                                                                                                                                                                  s0 = null;
                                                                                                                                                                  if (peg$silentFails === 0) { peg$fail(peg$c294); }
                                                                                                                                                                }
                                                                                                                                                                if (s0 === null) {
                                                                                                                                                                  if (input.substr(peg$currPos, 4) === peg$c295) {
                                                                                                                                                                    s0 = peg$c295;
                                                                                                                                                                    peg$currPos += 4;
                                                                                                                                                                  } else {
                                                                                                                                                                    s0 = null;
                                                                                                                                                                    if (peg$silentFails === 0) { peg$fail(peg$c296); }
                                                                                                                                                                  }
                                                                                                                                                                  if (s0 === null) {
                                                                                                                                                                    if (input.substr(peg$currPos, 4) === peg$c297) {
                                                                                                                                                                      s0 = peg$c297;
                                                                                                                                                                      peg$currPos += 4;
                                                                                                                                                                    } else {
                                                                                                                                                                      s0 = null;
                                                                                                                                                                      if (peg$silentFails === 0) { peg$fail(peg$c298); }
                                                                                                                                                                    }
                                                                                                                                                                    if (s0 === null) {
                                                                                                                                                                      if (input.substr(peg$currPos, 4) === peg$c299) {
                                                                                                                                                                        s0 = peg$c299;
                                                                                                                                                                        peg$currPos += 4;
                                                                                                                                                                      } else {
                                                                                                                                                                        s0 = null;
                                                                                                                                                                        if (peg$silentFails === 0) { peg$fail(peg$c300); }
                                                                                                                                                                      }
                                                                                                                                                                      if (s0 === null) {
                                                                                                                                                                        if (input.substr(peg$currPos, 4) === peg$c301) {
                                                                                                                                                                          s0 = peg$c301;
                                                                                                                                                                          peg$currPos += 4;
                                                                                                                                                                        } else {
                                                                                                                                                                          s0 = null;
                                                                                                                                                                          if (peg$silentFails === 0) { peg$fail(peg$c302); }
                                                                                                                                                                        }
                                                                                                                                                                        if (s0 === null) {
                                                                                                                                                                          if (input.substr(peg$currPos, 4) === peg$c303) {
                                                                                                                                                                            s0 = peg$c303;
                                                                                                                                                                            peg$currPos += 4;
                                                                                                                                                                          } else {
                                                                                                                                                                            s0 = null;
                                                                                                                                                                            if (peg$silentFails === 0) { peg$fail(peg$c304); }
                                                                                                                                                                          }
                                                                                                                                                                          if (s0 === null) {
                                                                                                                                                                            if (input.substr(peg$currPos, 4) === peg$c305) {
                                                                                                                                                                              s0 = peg$c305;
                                                                                                                                                                              peg$currPos += 4;
                                                                                                                                                                            } else {
                                                                                                                                                                              s0 = null;
                                                                                                                                                                              if (peg$silentFails === 0) { peg$fail(peg$c306); }
                                                                                                                                                                            }
                                                                                                                                                                            if (s0 === null) {
                                                                                                                                                                              if (input.substr(peg$currPos, 3) === peg$c307) {
                                                                                                                                                                                s0 = peg$c307;
                                                                                                                                                                                peg$currPos += 3;
                                                                                                                                                                              } else {
                                                                                                                                                                                s0 = null;
                                                                                                                                                                                if (peg$silentFails === 0) { peg$fail(peg$c308); }
                                                                                                                                                                              }
                                                                                                                                                                              if (s0 === null) {
                                                                                                                                                                                if (input.substr(peg$currPos, 3) === peg$c309) {
                                                                                                                                                                                  s0 = peg$c309;
                                                                                                                                                                                  peg$currPos += 3;
                                                                                                                                                                                } else {
                                                                                                                                                                                  s0 = null;
                                                                                                                                                                                  if (peg$silentFails === 0) { peg$fail(peg$c310); }
                                                                                                                                                                                }
                                                                                                                                                                                if (s0 === null) {
                                                                                                                                                                                  if (input.substr(peg$currPos, 3) === peg$c311) {
                                                                                                                                                                                    s0 = peg$c311;
                                                                                                                                                                                    peg$currPos += 3;
                                                                                                                                                                                  } else {
                                                                                                                                                                                    s0 = null;
                                                                                                                                                                                    if (peg$silentFails === 0) { peg$fail(peg$c312); }
                                                                                                                                                                                  }
                                                                                                                                                                                  if (s0 === null) {
                                                                                                                                                                                    if (input.substr(peg$currPos, 3) === peg$c313) {
                                                                                                                                                                                      s0 = peg$c313;
                                                                                                                                                                                      peg$currPos += 3;
                                                                                                                                                                                    } else {
                                                                                                                                                                                      s0 = null;
                                                                                                                                                                                      if (peg$silentFails === 0) { peg$fail(peg$c314); }
                                                                                                                                                                                    }
                                                                                                                                                                                    if (s0 === null) {
                                                                                                                                                                                      if (input.substr(peg$currPos, 3) === peg$c315) {
                                                                                                                                                                                        s0 = peg$c315;
                                                                                                                                                                                        peg$currPos += 3;
                                                                                                                                                                                      } else {
                                                                                                                                                                                        s0 = null;
                                                                                                                                                                                        if (peg$silentFails === 0) { peg$fail(peg$c316); }
                                                                                                                                                                                      }
                                                                                                                                                                                      if (s0 === null) {
                                                                                                                                                                                        if (input.substr(peg$currPos, 3) === peg$c317) {
                                                                                                                                                                                          s0 = peg$c317;
                                                                                                                                                                                          peg$currPos += 3;
                                                                                                                                                                                        } else {
                                                                                                                                                                                          s0 = null;
                                                                                                                                                                                          if (peg$silentFails === 0) { peg$fail(peg$c318); }
                                                                                                                                                                                        }
                                                                                                                                                                                        if (s0 === null) {
                                                                                                                                                                                          if (input.substr(peg$currPos, 3) === peg$c319) {
                                                                                                                                                                                            s0 = peg$c319;
                                                                                                                                                                                            peg$currPos += 3;
                                                                                                                                                                                          } else {
                                                                                                                                                                                            s0 = null;
                                                                                                                                                                                            if (peg$silentFails === 0) { peg$fail(peg$c320); }
                                                                                                                                                                                          }
                                                                                                                                                                                          if (s0 === null) {
                                                                                                                                                                                            if (input.substr(peg$currPos, 3) === peg$c321) {
                                                                                                                                                                                              s0 = peg$c321;
                                                                                                                                                                                              peg$currPos += 3;
                                                                                                                                                                                            } else {
                                                                                                                                                                                              s0 = null;
                                                                                                                                                                                              if (peg$silentFails === 0) { peg$fail(peg$c322); }
                                                                                                                                                                                            }
                                                                                                                                                                                            if (s0 === null) {
                                                                                                                                                                                              if (input.substr(peg$currPos, 3) === peg$c323) {
                                                                                                                                                                                                s0 = peg$c323;
                                                                                                                                                                                                peg$currPos += 3;
                                                                                                                                                                                              } else {
                                                                                                                                                                                                s0 = null;
                                                                                                                                                                                                if (peg$silentFails === 0) { peg$fail(peg$c324); }
                                                                                                                                                                                              }
                                                                                                                                                                                              if (s0 === null) {
                                                                                                                                                                                                if (input.substr(peg$currPos, 3) === peg$c325) {
                                                                                                                                                                                                  s0 = peg$c325;
                                                                                                                                                                                                  peg$currPos += 3;
                                                                                                                                                                                                } else {
                                                                                                                                                                                                  s0 = null;
                                                                                                                                                                                                  if (peg$silentFails === 0) { peg$fail(peg$c326); }
                                                                                                                                                                                                }
                                                                                                                                                                                                if (s0 === null) {
                                                                                                                                                                                                  if (input.substr(peg$currPos, 3) === peg$c327) {
                                                                                                                                                                                                    s0 = peg$c327;
                                                                                                                                                                                                    peg$currPos += 3;
                                                                                                                                                                                                  } else {
                                                                                                                                                                                                    s0 = null;
                                                                                                                                                                                                    if (peg$silentFails === 0) { peg$fail(peg$c328); }
                                                                                                                                                                                                  }
                                                                                                                                                                                                  if (s0 === null) {
                                                                                                                                                                                                    if (input.substr(peg$currPos, 3) === peg$c329) {
                                                                                                                                                                                                      s0 = peg$c329;
                                                                                                                                                                                                      peg$currPos += 3;
                                                                                                                                                                                                    } else {
                                                                                                                                                                                                      s0 = null;
                                                                                                                                                                                                      if (peg$silentFails === 0) { peg$fail(peg$c330); }
                                                                                                                                                                                                    }
                                                                                                                                                                                                    if (s0 === null) {
                                                                                                                                                                                                      if (input.substr(peg$currPos, 3) === peg$c331) {
                                                                                                                                                                                                        s0 = peg$c331;
                                                                                                                                                                                                        peg$currPos += 3;
                                                                                                                                                                                                      } else {
                                                                                                                                                                                                        s0 = null;
                                                                                                                                                                                                        if (peg$silentFails === 0) { peg$fail(peg$c332); }
                                                                                                                                                                                                      }
                                                                                                                                                                                                      if (s0 === null) {
                                                                                                                                                                                                        if (input.substr(peg$currPos, 3) === peg$c333) {
                                                                                                                                                                                                          s0 = peg$c333;
                                                                                                                                                                                                          peg$currPos += 3;
                                                                                                                                                                                                        } else {
                                                                                                                                                                                                          s0 = null;
                                                                                                                                                                                                          if (peg$silentFails === 0) { peg$fail(peg$c334); }
                                                                                                                                                                                                        }
                                                                                                                                                                                                        if (s0 === null) {
                                                                                                                                                                                                          if (input.substr(peg$currPos, 3) === peg$c335) {
                                                                                                                                                                                                            s0 = peg$c335;
                                                                                                                                                                                                            peg$currPos += 3;
                                                                                                                                                                                                          } else {
                                                                                                                                                                                                            s0 = null;
                                                                                                                                                                                                            if (peg$silentFails === 0) { peg$fail(peg$c336); }
                                                                                                                                                                                                          }
                                                                                                                                                                                                          if (s0 === null) {
                                                                                                                                                                                                            if (input.substr(peg$currPos, 3) === peg$c337) {
                                                                                                                                                                                                              s0 = peg$c337;
                                                                                                                                                                                                              peg$currPos += 3;
                                                                                                                                                                                                            } else {
                                                                                                                                                                                                              s0 = null;
                                                                                                                                                                                                              if (peg$silentFails === 0) { peg$fail(peg$c338); }
                                                                                                                                                                                                            }
                                                                                                                                                                                                            if (s0 === null) {
                                                                                                                                                                                                              if (input.substr(peg$currPos, 3) === peg$c339) {
                                                                                                                                                                                                                s0 = peg$c339;
                                                                                                                                                                                                                peg$currPos += 3;
                                                                                                                                                                                                              } else {
                                                                                                                                                                                                                s0 = null;
                                                                                                                                                                                                                if (peg$silentFails === 0) { peg$fail(peg$c340); }
                                                                                                                                                                                                              }
                                                                                                                                                                                                              if (s0 === null) {
                                                                                                                                                                                                                if (input.substr(peg$currPos, 3) === peg$c341) {
                                                                                                                                                                                                                  s0 = peg$c341;
                                                                                                                                                                                                                  peg$currPos += 3;
                                                                                                                                                                                                                } else {
                                                                                                                                                                                                                  s0 = null;
                                                                                                                                                                                                                  if (peg$silentFails === 0) { peg$fail(peg$c342); }
                                                                                                                                                                                                                }
                                                                                                                                                                                                                if (s0 === null) {
                                                                                                                                                                                                                  if (input.substr(peg$currPos, 3) === peg$c343) {
                                                                                                                                                                                                                    s0 = peg$c343;
                                                                                                                                                                                                                    peg$currPos += 3;
                                                                                                                                                                                                                  } else {
                                                                                                                                                                                                                    s0 = null;
                                                                                                                                                                                                                    if (peg$silentFails === 0) { peg$fail(peg$c344); }
                                                                                                                                                                                                                  }
                                                                                                                                                                                                                  if (s0 === null) {
                                                                                                                                                                                                                    if (input.substr(peg$currPos, 2) === peg$c345) {
                                                                                                                                                                                                                      s0 = peg$c345;
                                                                                                                                                                                                                      peg$currPos += 2;
                                                                                                                                                                                                                    } else {
                                                                                                                                                                                                                      s0 = null;
                                                                                                                                                                                                                      if (peg$silentFails === 0) { peg$fail(peg$c346); }
                                                                                                                                                                                                                    }
                                                                                                                                                                                                                    if (s0 === null) {
                                                                                                                                                                                                                      if (input.substr(peg$currPos, 2) === peg$c347) {
                                                                                                                                                                                                                        s0 = peg$c347;
                                                                                                                                                                                                                        peg$currPos += 2;
                                                                                                                                                                                                                      } else {
                                                                                                                                                                                                                        s0 = null;
                                                                                                                                                                                                                        if (peg$silentFails === 0) { peg$fail(peg$c348); }
                                                                                                                                                                                                                      }
                                                                                                                                                                                                                      if (s0 === null) {
                                                                                                                                                                                                                        if (input.substr(peg$currPos, 2) === peg$c349) {
                                                                                                                                                                                                                          s0 = peg$c349;
                                                                                                                                                                                                                          peg$currPos += 2;
                                                                                                                                                                                                                        } else {
                                                                                                                                                                                                                          s0 = null;
                                                                                                                                                                                                                          if (peg$silentFails === 0) { peg$fail(peg$c350); }
                                                                                                                                                                                                                        }
                                                                                                                                                                                                                        if (s0 === null) {
                                                                                                                                                                                                                          if (input.substr(peg$currPos, 2) === peg$c351) {
                                                                                                                                                                                                                            s0 = peg$c351;
                                                                                                                                                                                                                            peg$currPos += 2;
                                                                                                                                                                                                                          } else {
                                                                                                                                                                                                                            s0 = null;
                                                                                                                                                                                                                            if (peg$silentFails === 0) { peg$fail(peg$c352); }
                                                                                                                                                                                                                          }
                                                                                                                                                                                                                          if (s0 === null) {
                                                                                                                                                                                                                            if (input.substr(peg$currPos, 2) === peg$c353) {
                                                                                                                                                                                                                              s0 = peg$c353;
                                                                                                                                                                                                                              peg$currPos += 2;
                                                                                                                                                                                                                            } else {
                                                                                                                                                                                                                              s0 = null;
                                                                                                                                                                                                                              if (peg$silentFails === 0) { peg$fail(peg$c354); }
                                                                                                                                                                                                                            }
                                                                                                                                                                                                                            if (s0 === null) {
                                                                                                                                                                                                                              if (input.substr(peg$currPos, 2) === peg$c355) {
                                                                                                                                                                                                                                s0 = peg$c355;
                                                                                                                                                                                                                                peg$currPos += 2;
                                                                                                                                                                                                                              } else {
                                                                                                                                                                                                                                s0 = null;
                                                                                                                                                                                                                                if (peg$silentFails === 0) { peg$fail(peg$c356); }
                                                                                                                                                                                                                              }
                                                                                                                                                                                                                              if (s0 === null) {
                                                                                                                                                                                                                                if (input.substr(peg$currPos, 2) === peg$c357) {
                                                                                                                                                                                                                                  s0 = peg$c357;
                                                                                                                                                                                                                                  peg$currPos += 2;
                                                                                                                                                                                                                                } else {
                                                                                                                                                                                                                                  s0 = null;
                                                                                                                                                                                                                                  if (peg$silentFails === 0) { peg$fail(peg$c358); }
                                                                                                                                                                                                                                }
                                                                                                                                                                                                                                if (s0 === null) {
                                                                                                                                                                                                                                  if (input.substr(peg$currPos, 2) === peg$c359) {
                                                                                                                                                                                                                                    s0 = peg$c359;
                                                                                                                                                                                                                                    peg$currPos += 2;
                                                                                                                                                                                                                                  } else {
                                                                                                                                                                                                                                    s0 = null;
                                                                                                                                                                                                                                    if (peg$silentFails === 0) { peg$fail(peg$c360); }
                                                                                                                                                                                                                                  }
                                                                                                                                                                                                                                  if (s0 === null) {
                                                                                                                                                                                                                                    if (input.substr(peg$currPos, 2) === peg$c361) {
                                                                                                                                                                                                                                      s0 = peg$c361;
                                                                                                                                                                                                                                      peg$currPos += 2;
                                                                                                                                                                                                                                    } else {
                                                                                                                                                                                                                                      s0 = null;
                                                                                                                                                                                                                                      if (peg$silentFails === 0) { peg$fail(peg$c362); }
                                                                                                                                                                                                                                    }
                                                                                                                                                                                                                                    if (s0 === null) {
                                                                                                                                                                                                                                      if (input.substr(peg$currPos, 2) === peg$c363) {
                                                                                                                                                                                                                                        s0 = peg$c363;
                                                                                                                                                                                                                                        peg$currPos += 2;
                                                                                                                                                                                                                                      } else {
                                                                                                                                                                                                                                        s0 = null;
                                                                                                                                                                                                                                        if (peg$silentFails === 0) { peg$fail(peg$c364); }
                                                                                                                                                                                                                                      }
                                                                                                                                                                                                                                      if (s0 === null) {
                                                                                                                                                                                                                                        if (input.substr(peg$currPos, 2) === peg$c365) {
                                                                                                                                                                                                                                          s0 = peg$c365;
                                                                                                                                                                                                                                          peg$currPos += 2;
                                                                                                                                                                                                                                        } else {
                                                                                                                                                                                                                                          s0 = null;
                                                                                                                                                                                                                                          if (peg$silentFails === 0) { peg$fail(peg$c366); }
                                                                                                                                                                                                                                        }
                                                                                                                                                                                                                                        if (s0 === null) {
                                                                                                                                                                                                                                          if (input.substr(peg$currPos, 2) === peg$c367) {
                                                                                                                                                                                                                                            s0 = peg$c367;
                                                                                                                                                                                                                                            peg$currPos += 2;
                                                                                                                                                                                                                                          } else {
                                                                                                                                                                                                                                            s0 = null;
                                                                                                                                                                                                                                            if (peg$silentFails === 0) { peg$fail(peg$c368); }
                                                                                                                                                                                                                                          }
                                                                                                                                                                                                                                          if (s0 === null) {
                                                                                                                                                                                                                                            if (input.substr(peg$currPos, 2) === peg$c369) {
                                                                                                                                                                                                                                              s0 = peg$c369;
                                                                                                                                                                                                                                              peg$currPos += 2;
                                                                                                                                                                                                                                            } else {
                                                                                                                                                                                                                                              s0 = null;
                                                                                                                                                                                                                                              if (peg$silentFails === 0) { peg$fail(peg$c370); }
                                                                                                                                                                                                                                            }
                                                                                                                                                                                                                                            if (s0 === null) {
                                                                                                                                                                                                                                              if (input.substr(peg$currPos, 2) === peg$c371) {
                                                                                                                                                                                                                                                s0 = peg$c371;
                                                                                                                                                                                                                                                peg$currPos += 2;
                                                                                                                                                                                                                                              } else {
                                                                                                                                                                                                                                                s0 = null;
                                                                                                                                                                                                                                                if (peg$silentFails === 0) { peg$fail(peg$c372); }
                                                                                                                                                                                                                                              }
                                                                                                                                                                                                                                              if (s0 === null) {
                                                                                                                                                                                                                                                if (input.substr(peg$currPos, 2) === peg$c373) {
                                                                                                                                                                                                                                                  s0 = peg$c373;
                                                                                                                                                                                                                                                  peg$currPos += 2;
                                                                                                                                                                                                                                                } else {
                                                                                                                                                                                                                                                  s0 = null;
                                                                                                                                                                                                                                                  if (peg$silentFails === 0) { peg$fail(peg$c374); }
                                                                                                                                                                                                                                                }
                                                                                                                                                                                                                                                if (s0 === null) {
                                                                                                                                                                                                                                                  if (input.substr(peg$currPos, 2) === peg$c375) {
                                                                                                                                                                                                                                                    s0 = peg$c375;
                                                                                                                                                                                                                                                    peg$currPos += 2;
                                                                                                                                                                                                                                                  } else {
                                                                                                                                                                                                                                                    s0 = null;
                                                                                                                                                                                                                                                    if (peg$silentFails === 0) { peg$fail(peg$c376); }
                                                                                                                                                                                                                                                  }
                                                                                                                                                                                                                                                  if (s0 === null) {
                                                                                                                                                                                                                                                    if (input.substr(peg$currPos, 2) === peg$c377) {
                                                                                                                                                                                                                                                      s0 = peg$c377;
                                                                                                                                                                                                                                                      peg$currPos += 2;
                                                                                                                                                                                                                                                    } else {
                                                                                                                                                                                                                                                      s0 = null;
                                                                                                                                                                                                                                                      if (peg$silentFails === 0) { peg$fail(peg$c378); }
                                                                                                                                                                                                                                                    }
                                                                                                                                                                                                                                                    if (s0 === null) {
                                                                                                                                                                                                                                                      if (input.substr(peg$currPos, 2) === peg$c379) {
                                                                                                                                                                                                                                                        s0 = peg$c379;
                                                                                                                                                                                                                                                        peg$currPos += 2;
                                                                                                                                                                                                                                                      } else {
                                                                                                                                                                                                                                                        s0 = null;
                                                                                                                                                                                                                                                        if (peg$silentFails === 0) { peg$fail(peg$c380); }
                                                                                                                                                                                                                                                      }
                                                                                                                                                                                                                                                      if (s0 === null) {
                                                                                                                                                                                                                                                        if (input.substr(peg$currPos, 2) === peg$c381) {
                                                                                                                                                                                                                                                          s0 = peg$c381;
                                                                                                                                                                                                                                                          peg$currPos += 2;
                                                                                                                                                                                                                                                        } else {
                                                                                                                                                                                                                                                          s0 = null;
                                                                                                                                                                                                                                                          if (peg$silentFails === 0) { peg$fail(peg$c382); }
                                                                                                                                                                                                                                                        }
                                                                                                                                                                                                                                                        if (s0 === null) {
                                                                                                                                                                                                                                                          if (input.substr(peg$currPos, 2) === peg$c383) {
                                                                                                                                                                                                                                                            s0 = peg$c383;
                                                                                                                                                                                                                                                            peg$currPos += 2;
                                                                                                                                                                                                                                                          } else {
                                                                                                                                                                                                                                                            s0 = null;
                                                                                                                                                                                                                                                            if (peg$silentFails === 0) { peg$fail(peg$c384); }
                                                                                                                                                                                                                                                          }
                                                                                                                                                                                                                                                          if (s0 === null) {
                                                                                                                                                                                                                                                            if (input.substr(peg$currPos, 2) === peg$c385) {
                                                                                                                                                                                                                                                              s0 = peg$c385;
                                                                                                                                                                                                                                                              peg$currPos += 2;
                                                                                                                                                                                                                                                            } else {
                                                                                                                                                                                                                                                              s0 = null;
                                                                                                                                                                                                                                                              if (peg$silentFails === 0) { peg$fail(peg$c386); }
                                                                                                                                                                                                                                                            }
                                                                                                                                                                                                                                                            if (s0 === null) {
                                                                                                                                                                                                                                                              if (input.charCodeAt(peg$currPos) === 117) {
                                                                                                                                                                                                                                                                s0 = peg$c387;
                                                                                                                                                                                                                                                                peg$currPos++;
                                                                                                                                                                                                                                                              } else {
                                                                                                                                                                                                                                                                s0 = null;
                                                                                                                                                                                                                                                                if (peg$silentFails === 0) { peg$fail(peg$c388); }
                                                                                                                                                                                                                                                              }
                                                                                                                                                                                                                                                              if (s0 === null) {
                                                                                                                                                                                                                                                                if (input.charCodeAt(peg$currPos) === 115) {
                                                                                                                                                                                                                                                                  s0 = peg$c389;
                                                                                                                                                                                                                                                                  peg$currPos++;
                                                                                                                                                                                                                                                                } else {
                                                                                                                                                                                                                                                                  s0 = null;
                                                                                                                                                                                                                                                                  if (peg$silentFails === 0) { peg$fail(peg$c390); }
                                                                                                                                                                                                                                                                }
                                                                                                                                                                                                                                                                if (s0 === null) {
                                                                                                                                                                                                                                                                  if (input.charCodeAt(peg$currPos) === 113) {
                                                                                                                                                                                                                                                                    s0 = peg$c391;
                                                                                                                                                                                                                                                                    peg$currPos++;
                                                                                                                                                                                                                                                                  } else {
                                                                                                                                                                                                                                                                    s0 = null;
                                                                                                                                                                                                                                                                    if (peg$silentFails === 0) { peg$fail(peg$c392); }
                                                                                                                                                                                                                                                                  }
                                                                                                                                                                                                                                                                  if (s0 === null) {
                                                                                                                                                                                                                                                                    if (input.charCodeAt(peg$currPos) === 112) {
                                                                                                                                                                                                                                                                      s0 = peg$c393;
                                                                                                                                                                                                                                                                      peg$currPos++;
                                                                                                                                                                                                                                                                    } else {
                                                                                                                                                                                                                                                                      s0 = null;
                                                                                                                                                                                                                                                                      if (peg$silentFails === 0) { peg$fail(peg$c394); }
                                                                                                                                                                                                                                                                    }
                                                                                                                                                                                                                                                                    if (s0 === null) {
                                                                                                                                                                                                                                                                      if (input.charCodeAt(peg$currPos) === 105) {
                                                                                                                                                                                                                                                                        s0 = peg$c395;
                                                                                                                                                                                                                                                                        peg$currPos++;
                                                                                                                                                                                                                                                                      } else {
                                                                                                                                                                                                                                                                        s0 = null;
                                                                                                                                                                                                                                                                        if (peg$silentFails === 0) { peg$fail(peg$c396); }
                                                                                                                                                                                                                                                                      }
                                                                                                                                                                                                                                                                      if (s0 === null) {
                                                                                                                                                                                                                                                                        if (input.charCodeAt(peg$currPos) === 98) {
                                                                                                                                                                                                                                                                          s0 = peg$c397;
                                                                                                                                                                                                                                                                          peg$currPos++;
                                                                                                                                                                                                                                                                        } else {
                                                                                                                                                                                                                                                                          s0 = null;
                                                                                                                                                                                                                                                                          if (peg$silentFails === 0) { peg$fail(peg$c398); }
                                                                                                                                                                                                                                                                        }
                                                                                                                                                                                                                                                                        if (s0 === null) {
                                                                                                                                                                                                                                                                          if (input.charCodeAt(peg$currPos) === 97) {
                                                                                                                                                                                                                                                                            s0 = peg$c399;
                                                                                                                                                                                                                                                                            peg$currPos++;
                                                                                                                                                                                                                                                                          } else {
                                                                                                                                                                                                                                                                            s0 = null;
                                                                                                                                                                                                                                                                            if (peg$silentFails === 0) { peg$fail(peg$c400); }
                                                                                                                                                                                                                                                                          }
                                                                                                                                                                                                                                                                        }
                                                                                                                                                                                                                                                                      }
                                                                                                                                                                                                                                                                    }
                                                                                                                                                                                                                                                                  }
                                                                                                                                                                                                                                                                }
                                                                                                                                                                                                                                                              }
                                                                                                                                                                                                                                                            }
                                                                                                                                                                                                                                                          }
                                                                                                                                                                                                                                                        }
                                                                                                                                                                                                                                                      }
                                                                                                                                                                                                                                                    }
                                                                                                                                                                                                                                                  }
                                                                                                                                                                                                                                                }
                                                                                                                                                                                                                                              }
                                                                                                                                                                                                                                            }
                                                                                                                                                                                                                                          }
                                                                                                                                                                                                                                        }
                                                                                                                                                                                                                                      }
                                                                                                                                                                                                                                    }
                                                                                                                                                                                                                                  }
                                                                                                                                                                                                                                }
                                                                                                                                                                                                                              }
                                                                                                                                                                                                                            }
                                                                                                                                                                                                                          }
                                                                                                                                                                                                                        }
                                                                                                                                                                                                                      }
                                                                                                                                                                                                                    }
                                                                                                                                                                                                                  }
                                                                                                                                                                                                                }
                                                                                                                                                                                                              }
                                                                                                                                                                                                            }
                                                                                                                                                                                                          }
                                                                                                                                                                                                        }
                                                                                                                                                                                                      }
                                                                                                                                                                                                    }
                                                                                                                                                                                                  }
                                                                                                                                                                                                }
                                                                                                                                                                                              }
                                                                                                                                                                                            }
                                                                                                                                                                                          }
                                                                                                                                                                                        }
                                                                                                                                                                                      }
                                                                                                                                                                                    }
                                                                                                                                                                                  }
                                                                                                                                                                                }
                                                                                                                                                                              }
                                                                                                                                                                            }
                                                                                                                                                                          }
                                                                                                                                                                        }
                                                                                                                                                                      }
                                                                                                                                                                    }
                                                                                                                                                                  }
                                                                                                                                                                }
                                                                                                                                                              }
                                                                                                                                                            }
                                                                                                                                                          }
                                                                                                                                                        }
                                                                                                                                                      }
                                                                                                                                                    }
                                                                                                                                                  }
                                                                                                                                                }
                                                                                                                                              }
                                                                                                                                            }
                                                                                                                                          }
                                                                                                                                        }
                                                                                                                                      }
                                                                                                                                    }
                                                                                                                                  }
                                                                                                                                }
                                                                                                                              }
                                                                                                                            }
                                                                                                                          }
                                                                                                                        }
                                                                                                                      }
                                                                                                                    }
                                                                                                                  }
                                                                                                                }
                                                                                                              }
                                                                                                            }
                                                                                                          }
                                                                                                        }
                                                                                                      }
                                                                                                    }
                                                                                                  }
                                                                                                }
                                                                                              }
                                                                                            }
                                                                                          }
                                                                                        }
                                                                                      }
                                                                                    }
                                                                                  }
                                                                                }
                                                                              }
                                                                            }
                                                                          }
                                                                        }
                                                                      }
                                                                    }
                                                                  }
                                                                }
                                                              }
                                                            }
                                                          }
                                                        }
                                                      }
                                                    }
                                                  }
                                                }
                                              }
                                            }
                                          }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
      peg$silentFails--;
      if (s0 === null) {
        s1 = null;
        if (peg$silentFails === 0) { peg$fail(peg$c134); }
      }

      return s0;
    }

    function peg$parseknownEvent() {
      var s0, s1;

      peg$silentFails++;
      if (input.substr(peg$currPos, 10) === peg$c402) {
        s0 = peg$c402;
        peg$currPos += 10;
      } else {
        s0 = null;
        if (peg$silentFails === 0) { peg$fail(peg$c403); }
      }
      if (s0 === null) {
        if (input.substr(peg$currPos, 9) === peg$c404) {
          s0 = peg$c404;
          peg$currPos += 9;
        } else {
          s0 = null;
          if (peg$silentFails === 0) { peg$fail(peg$c405); }
        }
        if (s0 === null) {
          if (input.substr(peg$currPos, 8) === peg$c406) {
            s0 = peg$c406;
            peg$currPos += 8;
          } else {
            s0 = null;
            if (peg$silentFails === 0) { peg$fail(peg$c407); }
          }
          if (s0 === null) {
            if (input.substr(peg$currPos, 11) === peg$c408) {
              s0 = peg$c408;
              peg$currPos += 11;
            } else {
              s0 = null;
              if (peg$silentFails === 0) { peg$fail(peg$c409); }
            }
            if (s0 === null) {
              if (input.substr(peg$currPos, 7) === peg$c410) {
                s0 = peg$c410;
                peg$currPos += 7;
              } else {
                s0 = null;
                if (peg$silentFails === 0) { peg$fail(peg$c411); }
              }
              if (s0 === null) {
                if (input.substr(peg$currPos, 5) === peg$c412) {
                  s0 = peg$c412;
                  peg$currPos += 5;
                } else {
                  s0 = null;
                  if (peg$silentFails === 0) { peg$fail(peg$c413); }
                }
                if (s0 === null) {
                  if (input.substr(peg$currPos, 8) === peg$c414) {
                    s0 = peg$c414;
                    peg$currPos += 8;
                  } else {
                    s0 = null;
                    if (peg$silentFails === 0) { peg$fail(peg$c415); }
                  }
                  if (s0 === null) {
                    if (input.substr(peg$currPos, 9) === peg$c416) {
                      s0 = peg$c416;
                      peg$currPos += 9;
                    } else {
                      s0 = null;
                      if (peg$silentFails === 0) { peg$fail(peg$c417); }
                    }
                    if (s0 === null) {
                      if (input.substr(peg$currPos, 7) === peg$c418) {
                        s0 = peg$c418;
                        peg$currPos += 7;
                      } else {
                        s0 = null;
                        if (peg$silentFails === 0) { peg$fail(peg$c419); }
                      }
                      if (s0 === null) {
                        if (input.substr(peg$currPos, 11) === peg$c420) {
                          s0 = peg$c420;
                          peg$currPos += 11;
                        } else {
                          s0 = null;
                          if (peg$silentFails === 0) { peg$fail(peg$c421); }
                        }
                        if (s0 === null) {
                          if (input.substr(peg$currPos, 5) === peg$c422) {
                            s0 = peg$c422;
                            peg$currPos += 5;
                          } else {
                            s0 = null;
                            if (peg$silentFails === 0) { peg$fail(peg$c423); }
                          }
                          if (s0 === null) {
                            if (input.substr(peg$currPos, 11) === peg$c424) {
                              s0 = peg$c424;
                              peg$currPos += 11;
                            } else {
                              s0 = null;
                              if (peg$silentFails === 0) { peg$fail(peg$c425); }
                            }
                            if (s0 === null) {
                              if (input.substr(peg$currPos, 9) === peg$c426) {
                                s0 = peg$c426;
                                peg$currPos += 9;
                              } else {
                                s0 = null;
                                if (peg$silentFails === 0) { peg$fail(peg$c427); }
                              }
                              if (s0 === null) {
                                if (input.substr(peg$currPos, 7) === peg$c428) {
                                  s0 = peg$c428;
                                  peg$currPos += 7;
                                } else {
                                  s0 = null;
                                  if (peg$silentFails === 0) { peg$fail(peg$c429); }
                                }
                                if (s0 === null) {
                                  if (input.substr(peg$currPos, 8) === peg$c430) {
                                    s0 = peg$c430;
                                    peg$currPos += 8;
                                  } else {
                                    s0 = null;
                                    if (peg$silentFails === 0) { peg$fail(peg$c431); }
                                  }
                                  if (s0 === null) {
                                    if (input.substr(peg$currPos, 10) === peg$c432) {
                                      s0 = peg$c432;
                                      peg$currPos += 10;
                                    } else {
                                      s0 = null;
                                      if (peg$silentFails === 0) { peg$fail(peg$c433); }
                                    }
                                    if (s0 === null) {
                                      if (input.substr(peg$currPos, 10) === peg$c434) {
                                        s0 = peg$c434;
                                        peg$currPos += 10;
                                      } else {
                                        s0 = null;
                                        if (peg$silentFails === 0) { peg$fail(peg$c435); }
                                      }
                                      if (s0 === null) {
                                        if (input.substr(peg$currPos, 6) === peg$c436) {
                                          s0 = peg$c436;
                                          peg$currPos += 6;
                                        } else {
                                          s0 = null;
                                          if (peg$silentFails === 0) { peg$fail(peg$c437); }
                                        }
                                        if (s0 === null) {
                                          if (input.substr(peg$currPos, 5) === peg$c253) {
                                            s0 = peg$c253;
                                            peg$currPos += 5;
                                          } else {
                                            s0 = null;
                                            if (peg$silentFails === 0) { peg$fail(peg$c254); }
                                          }
                                          if (s0 === null) {
                                            if (input.substr(peg$currPos, 6) === peg$c438) {
                                              s0 = peg$c438;
                                              peg$currPos += 6;
                                            } else {
                                              s0 = null;
                                              if (peg$silentFails === 0) { peg$fail(peg$c439); }
                                            }
                                            if (s0 === null) {
                                              if (input.substr(peg$currPos, 9) === peg$c440) {
                                                s0 = peg$c440;
                                                peg$currPos += 9;
                                              } else {
                                                s0 = null;
                                                if (peg$silentFails === 0) { peg$fail(peg$c441); }
                                              }
                                              if (s0 === null) {
                                                if (input.substr(peg$currPos, 4) === peg$c442) {
                                                  s0 = peg$c442;
                                                  peg$currPos += 4;
                                                } else {
                                                  s0 = null;
                                                  if (peg$silentFails === 0) { peg$fail(peg$c443); }
                                                }
                                                if (s0 === null) {
                                                  if (input.substr(peg$currPos, 9) === peg$c444) {
                                                    s0 = peg$c444;
                                                    peg$currPos += 9;
                                                  } else {
                                                    s0 = null;
                                                    if (peg$silentFails === 0) { peg$fail(peg$c445); }
                                                  }
                                                  if (s0 === null) {
                                                    if (input.substr(peg$currPos, 9) === peg$c446) {
                                                      s0 = peg$c446;
                                                      peg$currPos += 9;
                                                    } else {
                                                      s0 = null;
                                                      if (peg$silentFails === 0) { peg$fail(peg$c447); }
                                                    }
                                                    if (s0 === null) {
                                                      if (input.substr(peg$currPos, 8) === peg$c448) {
                                                        s0 = peg$c448;
                                                        peg$currPos += 8;
                                                      } else {
                                                        s0 = null;
                                                        if (peg$silentFails === 0) { peg$fail(peg$c449); }
                                                      }
                                                      if (s0 === null) {
                                                        if (input.substr(peg$currPos, 4) === peg$c450) {
                                                          s0 = peg$c450;
                                                          peg$currPos += 4;
                                                        } else {
                                                          s0 = null;
                                                          if (peg$silentFails === 0) { peg$fail(peg$c451); }
                                                        }
                                                        if (s0 === null) {
                                                          if (input.substr(peg$currPos, 7) === peg$c452) {
                                                            s0 = peg$c452;
                                                            peg$currPos += 7;
                                                          } else {
                                                            s0 = null;
                                                            if (peg$silentFails === 0) { peg$fail(peg$c453); }
                                                          }
                                                        }
                                                      }
                                                    }
                                                  }
                                                }
                                              }
                                            }
                                          }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
      peg$silentFails--;
      if (s0 === null) {
        s1 = null;
        if (peg$silentFails === 0) { peg$fail(peg$c401); }
      }

      return s0;
    }

    function peg$parseINDENT() {
      var s0, s1;

      peg$silentFails++;
      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 61423) {
        s1 = peg$c455;
        peg$currPos++;
      } else {
        s1 = null;
        if (peg$silentFails === 0) { peg$fail(peg$c456); }
      }
      if (s1 !== null) {
        peg$reportedPos = s0;
        s1 = peg$c457();
      }
      if (s1 === null) {
        peg$currPos = s0;
        s0 = s1;
      } else {
        s0 = s1;
      }
      peg$silentFails--;
      if (s0 === null) {
        s1 = null;
        if (peg$silentFails === 0) { peg$fail(peg$c454); }
      }

      return s0;
    }

    function peg$parseDEDENT() {
      var s0, s1;

      peg$silentFails++;
      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 61438) {
        s1 = peg$c459;
        peg$currPos++;
      } else {
        s1 = null;
        if (peg$silentFails === 0) { peg$fail(peg$c460); }
      }
      if (s1 !== null) {
        peg$reportedPos = s0;
        s1 = peg$c457();
      }
      if (s1 === null) {
        peg$currPos = s0;
        s0 = s1;
      } else {
        s0 = s1;
      }
      peg$silentFails--;
      if (s0 === null) {
        s1 = null;
        if (peg$silentFails === 0) { peg$fail(peg$c458); }
      }

      return s0;
    }

    function peg$parseTERM() {
      var s0, s1, s2;

      peg$silentFails++;
      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 10) {
        s1 = peg$c462;
        peg$currPos++;
      } else {
        s1 = null;
        if (peg$silentFails === 0) { peg$fail(peg$c463); }
      }
      if (s1 !== null) {
        if (input.charCodeAt(peg$currPos) === 61439) {
          s2 = peg$c464;
          peg$currPos++;
        } else {
          s2 = null;
          if (peg$silentFails === 0) { peg$fail(peg$c465); }
        }
        if (s2 !== null) {
          s1 = [s1, s2];
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c2;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c2;
      }
      peg$silentFails--;
      if (s0 === null) {
        s1 = null;
        if (peg$silentFails === 0) { peg$fail(peg$c461); }
      }

      return s0;
    }

    function peg$parse__() {
      var s0, s1;

      peg$silentFails++;
      s0 = [];
      s1 = peg$parsewhitespace();
      if (s1 !== null) {
        while (s1 !== null) {
          s0.push(s1);
          s1 = peg$parsewhitespace();
        }
      } else {
        s0 = peg$c2;
      }
      peg$silentFails--;
      if (s0 === null) {
        s1 = null;
        if (peg$silentFails === 0) { peg$fail(peg$c466); }
      }

      return s0;
    }

    function peg$parse_() {
      var s0, s1;

      peg$silentFails++;
      s0 = [];
      s1 = peg$parsewhitespace();
      while (s1 !== null) {
        s0.push(s1);
        s1 = peg$parsewhitespace();
      }
      peg$silentFails--;
      if (s0 === null) {
        s1 = null;
        if (peg$silentFails === 0) { peg$fail(peg$c467); }
      }

      return s0;
    }

    function peg$parsewhitespace() {
      var s0, s1;

      peg$silentFails++;
      if (peg$c469.test(input.charAt(peg$currPos))) {
        s0 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s0 = null;
        if (peg$silentFails === 0) { peg$fail(peg$c470); }
      }
      peg$silentFails--;
      if (s0 === null) {
        s1 = null;
        if (peg$silentFails === 0) { peg$fail(peg$c468); }
      }

      return s0;
    }

    function peg$parselineChar() {
      var s0, s1, s2;

      s0 = peg$currPos;
      s1 = peg$currPos;
      peg$silentFails++;
      s2 = peg$parseINDENT();
      if (s2 === null) {
        s2 = peg$parseDEDENT();
        if (s2 === null) {
          s2 = peg$parseTERM();
        }
      }
      peg$silentFails--;
      if (s2 === null) {
        s1 = peg$c3;
      } else {
        peg$currPos = s1;
        s1 = peg$c2;
      }
      if (s1 !== null) {
        if (input.length > peg$currPos) {
          s2 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s2 = null;
          if (peg$silentFails === 0) { peg$fail(peg$c79); }
        }
        if (s2 !== null) {
          peg$reportedPos = s0;
          s1 = peg$c80(s2);
          if (s1 === null) {
            peg$currPos = s0;
            s0 = s1;
          } else {
            s0 = s1;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c2;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c2;
      }

      return s0;
    }

    function peg$parselineContent() {
      var s0, s1, s2;

      s0 = peg$currPos;
      s1 = [];
      s2 = peg$parselineChar();
      while (s2 !== null) {
        s1.push(s2);
        s2 = peg$parselineChar();
      }
      if (s1 !== null) {
        s1 = input.substring(s0, peg$currPos);
      }
      s0 = s1;

      return s0;
    }


      // Returns a new MustacheNode with a new preceding param (id).
      function unshiftParam(mustacheNode, helperName, newHashPairs) {

        var hash = mustacheNode.hash;

        // Merge hash.
        if(newHashPairs) {
          hash = hash || new Handlebars.AST.HashNode([]);

          for(var i = 0; i < newHashPairs.length; ++i) {
            hash.pairs.push(newHashPairs[i]);
          }
        }

        var params = [mustacheNode.id].concat(mustacheNode.params);
        params.unshift(new Handlebars.AST.IdNode([helperName]));
        return new Handlebars.AST.MustacheNode(params, hash, !mustacheNode.escaped);
      }


    peg$result = peg$startRuleFunction();

    if (peg$result !== null && peg$currPos === input.length) {
      return peg$result;
    } else {
      peg$cleanupExpected(peg$maxFailExpected);
      peg$reportedPos = Math.max(peg$currPos, peg$maxFailPos);

      throw new SyntaxError(
        peg$maxFailExpected,
        peg$reportedPos < input.length ? input.charAt(peg$reportedPos) : null,
        peg$reportedPos,
        peg$computePosDetails(peg$reportedPos).line,
        peg$computePosDetails(peg$reportedPos).column
      );
    }
  }

  return {
    SyntaxError: SyntaxError,
    parse      : parse
  };
})();

// exports = Emblem.Parser;
;
// lib/compiler.js
var Emblem, Handlebars,
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

// 

// 

Emblem.throwCompileError = function(line, msg) {
  throw new Error("Emblem syntax error, line " + line + ": " + msg);
};

Emblem.parse = function(string) {
  var line, lines, msg, processed;
  try {
    processed = Emblem.Preprocessor.processSync(string);
    return new Handlebars.AST.ProgramNode(Emblem.Parser.parse(processed), []);
  } catch (e) {
    if (e instanceof Emblem.Parser.SyntaxError) {
      lines = string.split("\n");
      line = lines[e.line - 1];
      msg = "" + e.message + "\n" + line + "\n";
      msg += new Array(e.column).join("-");
      msg += "^";
      return Emblem.throwCompileError(e.line, msg);
    } else {
      throw e;
    }
  }
};

Emblem.precompileRaw = function(string, options) {
  var ast, environment;
  if (options == null) {
    options = {};
  }
  if (typeof string !== 'string') {
    throw new Handlebars.Exception("You must pass a string to Emblem.precompile. You passed " + string);
  }
  if (__indexOf.call(options, 'data') < 0) {
    options.data = true;
  }
  ast = Emblem.parse(string);
  environment = new Handlebars.Compiler().compile(ast, options);
  return new Handlebars.JavaScriptCompiler().compile(environment, options);
};

Emblem.compileRaw = function(string, options) {
  var compile, compiled;
  if (options == null) {
    options = {};
  }
  if (typeof string !== 'string') {
    throw new Handlebars.Exception("You must pass a string to Emblem.compile. You passed " + string);
  }
  if (__indexOf.call(options, 'data') < 0) {
    options.data = true;
  }
  compiled = null;
  compile = function() {
    var ast, environment, templateSpec;
    ast = Emblem.parse(string);
    environment = new Handlebars.Compiler().compile(ast, options);
    templateSpec = new Handlebars.JavaScriptCompiler().compile(environment, options, void 0, true);
    return Handlebars.template(templateSpec);
  };
  return function(context, options) {
    if (!compiled) {
      compiled = compile();
    }
    return compiled.call(this, context, options);
  };
};

Emblem.precompile = Emblem.precompileRaw;

Emblem.compile = Emblem.compileRaw;

Emblem.precompileEmber = function(string) {
  var ast, environment, options;
  ast = Emblem.parse(string);
  options = {
    knownHelpers: {
      action: true,
      unbound: true,
      bindAttr: true,
      template: true,
      view: true,
      _triageMustache: true
    },
    data: true,
    stringParams: true
  };
  environment = new Ember.Handlebars.Compiler().compile(ast, options);
  return new Ember.Handlebars.JavaScriptCompiler().compile(environment, options, void 0, true);
};

Emblem.compileEmber = function(string) {
  var ast, environment, options, templateSpec;
  ast = Emblem.parse(string);
  options = {
    data: true,
    stringParams: true
  };
  environment = new Ember.Handlebars.Compiler().compile(ast, options);
  templateSpec = new Ember.Handlebars.JavaScriptCompiler().compile(environment, options, void 0, true);
  return Ember.Handlebars.template(templateSpec);
};
;
// lib/preprocessor.js
var Emblem, Preprocessor, StringScanner;

// 

// 

Emblem.Preprocessor = Preprocessor = (function() {
  var DEDENT, INDENT, TERM, anyWhitespaceAndNewlinesTouchingEOF, any_whitespaceFollowedByNewlines_, processInput, ws;

  ws = '\\t\\x0B\\f \\xA0\\u1680\\u180E\\u2000-\\u200A\\u202F\\u205F\\u3000\\uFEFF';

  INDENT = '\uEFEF';

  DEDENT = '\uEFFE';

  TERM = '\uEFFF';

  anyWhitespaceAndNewlinesTouchingEOF = RegExp("[" + ws + "\\n]*$");

  any_whitespaceFollowedByNewlines_ = RegExp("(?:[" + ws + "]*\\n)+");

  function Preprocessor() {
    this.base = null;
    this.indents = [];
    this.context = [];
    this.context.peek = function() {
      if (this.length) {
        return this[this.length - 1];
      } else {
        return null;
      }
    };
    this.context.err = function(c) {
      throw new Error("Unexpected " + c);
    };
    this.output = '';
    this.context.observe = function(c) {
      var top;
      top = this.peek();
      switch (c) {
        case INDENT:
          this.push(c);
          break;
        case DEDENT:
          if (top !== INDENT) {
            this.err(c);
          }
          this.pop();
          break;
        case '\n':
          if (top !== '/') {
            this.err(c);
          }
          this.pop();
          break;
        case '/':
          this.push(c);
          break;
        case 'end-\\':
          if (top !== '\\') {
            this.err(c);
          }
          this.pop();
          break;
        default:
          throw new Error("undefined token observed: " + c);
      }
      return this;
    };
    this.ss = new StringScanner('');
  }

  Preprocessor.prototype.p = function(s) {
    if (s) {
      this.output += s;
    }
    return s;
  };

  Preprocessor.prototype.scan = function(r) {
    return this.p(this.ss.scan(r));
  };

  Preprocessor.prototype.discard = function(r) {
    return this.ss.scan(r);
  };

  processInput = function(isEnd) {
    return function(data) {
      var b, indent, lines, message, newIndent, tok;
      if (!isEnd) {
        this.ss.concat(data);
        this.discard(any_whitespaceFollowedByNewlines_);
      }
      while (!this.ss.eos()) {
        switch (this.context.peek()) {
          case null:
          case INDENT:
            if (this.ss.bol() || this.discard(any_whitespaceFollowedByNewlines_)) {
              if (this.base != null) {
                if ((this.discard(this.base)) == null) {
                  throw new Error("inconsistent base indentation");
                }
              } else {
                b = this.discard(RegExp("[" + ws + "]*"));
                this.base = RegExp("" + b);
              }
              if (this.indents.length === 0) {
                if (newIndent = this.discard(RegExp("[" + ws + "]+"))) {
                  this.indents.push(newIndent);
                  this.context.observe(INDENT);
                  this.p(INDENT);
                }
              } else {
                indent = this.indents[this.indents.length - 1];
                if (newIndent = this.discard(RegExp("(" + indent + "[" + ws + "]+)"))) {
                  this.indents.push(newIndent);
                  this.context.observe(INDENT);
                  this.p(INDENT);
                } else {
                  while (this.indents.length) {
                    indent = this.indents[this.indents.length - 1];
                    if (this.discard(RegExp("(?:" + indent + ")"))) {
                      break;
                    }
                    this.context.observe(DEDENT);
                    this.p(DEDENT);
                    this.indents.pop();
                  }
                  if (this.ss.check(RegExp("[" + ws + "]+"))) {
                    lines = this.ss.str.substr(0, this.ss.pos).split(/\n/) || [''];
                    message = "Invalid indentation";
                    Emblem.throwCompileError(lines.length, message);
                  }
                }
              }
            }
            this.scan(/[^\n\\]+/);
            if (tok = this.discard(/\//)) {
              this.context.observe(tok);
            } else if (this.scan(/\n/)) {
              this.p("" + TERM);
            }
            this.discard(any_whitespaceFollowedByNewlines_);
        }
      }
      if (isEnd) {
        this.scan(anyWhitespaceAndNewlinesTouchingEOF);
        while (this.context.length && INDENT === this.context.peek()) {
          this.context.observe(DEDENT);
          this.p(DEDENT);
        }
        if (this.context.length) {
          throw new Error('Unclosed ' + (this.context.peek()) + ' at EOF');
        }
      }
    };
  };

  Preprocessor.prototype.processData = processInput(false);

  Preprocessor.prototype.processEnd = processInput(true);

  Preprocessor.processSync = function(input) {
    var pre;
    input += "\n";
    pre = new Preprocessor;
    pre.processData(input);
    pre.processEnd();
    return pre.output;
  };

  return Preprocessor;

})();
;
// lib/emberties.js
var ENV, Emblem, _base;

// 

Emblem.bootstrap = function(ctx) {
  if (ctx == null) {
    ctx = Ember.$(document);
  }
  Emblem.precompile = Emblem.precompileEmber;
  Emblem.compile = Emblem.compileEmber;
  return Ember.$('script[type="text/x-emblem"]', ctx).each(function() {
    var script, templateName;
    script = Ember.$(this);
    templateName = script.attr('data-template-name') || script.attr('id') || 'application';
    Ember.TEMPLATES[templateName] = Emblem.compile(script.html());
    return script.remove();
  });
};

this.ENV || (this.ENV = {});

ENV = this.ENV;

ENV.EMBER_LOAD_HOOKS || (ENV.EMBER_LOAD_HOOKS = {});

(_base = ENV.EMBER_LOAD_HOOKS).application || (_base.application = []);

ENV.EMBER_LOAD_HOOKS.application.push(function() {
  return Emblem.bootstrap();
});
;
