// Generated by CoffeeScript 1.6.2
(function() {
  var I, base, dqstring, sqstring, _,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  _ = require('underscore');

  I = require("f:/node-utils/src/importer");

  base = "f:/daonode/src/";

  I.use(base + "solve: Trail, solve, Var,  ExpressionError, TypeError, special");

  exports.parse = special(function(solver, cont, exp, state) {
    return function(v, solver) {
      var old_state;

      old_state = solver.state;
      solver.state = state;
      return solver.cont(exp, function(v, solver) {
        solver.state = old_state;
        return cont(v, solver);
      })(true, solver);
    };
  });

  exports.parsetext = exports.parsesequence = function(exp, sequence) {
    return exports.parse(exp, [sequence, 0]);
  };

  exports.setstate = special(function(solver, cont, state) {
    return function(v, solver) {
      solver.state = state;
      return cont(v, solver);
    };
  });

  exports.settext = exports.setsequence = function(sequence) {
    return exports.setstate([sequence, 0]);
  };

  exports.getstate = special(function(solver, cont) {
    return function(v, solver) {
      return cont(solver.state, solver);
    };
  });

  exports.gettext = exports.getsequence = special(function(solver, cont) {
    return function(v, solver) {
      return cont(solver.state[0], solver);
    };
  });

  exports.getpos = special(function(solver, cont) {
    return function(v, solver) {
      return cont(solver.state[1], solver);
    };
  });

  exports.eoi = special(function(solver, cont) {
    return function(v, solver) {
      var data, pos, _ref;

      _ref = solver.state, data = _ref[0], pos = _ref[1];
      if (pos === data.length) {
        return cont(true, solver);
      } else {
        return solver.failcont(v, solver);
      }
    };
  })();

  exports.boi = special(function(solver, cont) {
    return function(v, solver) {
      if (solver.state[1] === 0) {
        return cont(true, solver);
      } else {
        return solver.failcont(v, solver);
      }
    };
  })();

  exports.step = special(function(solver, cont, n) {
    if (n == null) {
      n = 1;
    }
    return function(v, solver) {
      var pos, text, _ref;

      _ref = solver.state, text = _ref[0], pos = _ref[1];
      solver.state = [text, pos + n];
      return cont(pos + n, solver);
    };
  });

  exports.lefttext = special(function(solver, cont) {
    return function(v, solver) {
      var pos, text, _ref;

      _ref = solver.state, text = _ref[0], pos = _ref[1];
      return cont(text.slice(pos), solver);
    };
  });

  exports.subtext = exports.subsequence = special(function(solver, cont, start, end) {
    return function(v, solver) {
      var pos, text, _ref;

      _ref = solver.state, text = _ref[0], pos = _ref[1];
      return cont(text.slice(start || 0, end || text.length), solver);
    };
  });

  exports.nextchar = special(function(solver, cont) {
    return function(v, solver) {
      var pos, text, _ref;

      _ref = solver.state, text = _ref[0], pos = _ref[1];
      return cont(text[pos], solver);
    };
  });

  exports.may = special(function(solver, cont, exp) {
    return function(v, solver) {
      var exp_cont, fc;

      fc = solver.failcont;
      exp_cont = solver.cont(exp, cont);
      solver.failcont = function(v, solver) {
        solver.failcont = fc;
        return cont(v, solver);
      };
      return exp_cont(v, solver);
    };
  });

  exports.lazymay = special(function(solver, cont, exp) {
    return function(v, solver) {
      var fc;

      fc = solver.failcont;
      solver.failcont = function(v, solver) {
        solver.failcont = fc;
        return solver.cont(exp, cont)(v, solver);
      };
      return cont(v, solver);
    };
  });

  exports.greedymay = special(function(solver, cont, exp) {
    return function(v, solver) {
      var fc;

      fc = solver.failcont;
      solver.failcont = function(v, solver) {
        solver.failcont = fc;
        return cont(v, solver);
      };
      return solver.cont(exp, function(v, solver) {
        return solver.failcont = fc;
      }, cont(v, solver))(v, solver);
    };
  });

  exports.any = special(function(solver, cont, exp) {
    var anyCont;

    return anyCont = function(v, solver) {
      var fc;

      fc = solver.failcont;
      solver.failcont = function(v, solver) {
        solver.failcont = fc;
        return cont(v, solver);
      };
      return solver.cont(exp, anyCont)(v, solver);
    };
  });

  exports.lazyany = special(function(solver, cont, exp) {
    return function(v, solver) {
      var anyCont, anyFcont, fc;

      fc = solver.failcont;
      anyCont = function(v, solver) {
        solver.failcont = anyFcont;
        return cont(v, solver);
      };
      anyFcont = function(v, solver) {
        solver.failcont = fc;
        return solver.cont(exp, anyCont);
      };
      return anyCont(v, solver);
    };
  });

  exports.greedyany = special(function(solver, cont, exp) {
    return function(v, solver) {
      var anyCont, fc;

      fc = solver.failcont;
      anyCont = function(v, solver) {
        solver.failcont = function(v, solver) {
          solver.failcont = fc;
          return cont(v, solver);
        };
        return solver.cont(exp, anyCont);
      };
      return anyCont(v, solver);
    };
  });

  exports.char = special(function(solver, cont, x) {
    return function(v, solver) {
      var c, data, pos, trail, _ref;

      _ref = solver.state, data = _ref[0], pos = _ref[1];
      if (pos === data.length) {
        return solver.failcont(false, solver);
      }
      trail = solver.trail;
      x = trail.deref(x);
      c = data[pos];
      if (x instanceof Var) {
        trail.set(x, c);
        return cont(pos + 1, solver);
      } else if (x === c) {
        solver.state = [data, pos + 1];
        return cont(pos + 1, solver);
      } else if (_.isString(x)) {
        if (x.length === 1) {
          return solver.failcont(false, solver);
        } else {
          throw new ExpressionError(x);
        }
      } else {
        throw new TypeError(x);
      }
    };
  });

  exports.charWhen = special(function(solver, cont, test) {
    return function(v, solver) {
      var c, data, pos, _ref;

      _ref = solver.state, data = _ref[0], pos = _ref[1];
      if (pos === data.length) {
        return solver.failcont(false, solver);
      }
      c = data[pos];
      if (test(c)) {
        return cont(c, solver);
      } else {
        return solver.failcont(c, solver);
      }
    };
  });

  exports.charBetween = function(x, start, end) {
    return exports.charWhen(x, function(c) {
      return (start < c && c < end);
    });
  };

  exports.charIn = function(x, set) {
    return exports.charWhen(x, function(c) {
      return __indexOf.call(set, c) >= 0;
    });
  };

  exports.digit = exports.charWhen(function(c) {
    return ('0' <= c && c <= '9');
  });

  exports.digit1_9 = exports.charWhen(function(c) {
    return ('1' <= c && c <= '9');
  });

  exports.lower = exports.charWhen(function(c) {
    return ('a' <= c && c <= 'z');
  });

  exports.upper = exports.charWhen(function(c) {
    return ('A' <= c && c <= 'Z');
  });

  exports.letter = exports.charWhen(function(c) {
    return (('a' <= c && c <= 'z')) || (('A' <= c && c <= 'Z'));
  });

  exports.underlineLetter = exports.charWhen(function(c) {
    return (c === '_') || (('a' <= c && c <= 'z')) || (('A' <= c && c <= 'Z'));
  });

  exports.underlineLetterDight = exports.charWhen(function(c) {
    return (c === '_') || (('a' <= c && c <= 'z')) || (('A' <= c && c <= 'Z')) || (('0' <= c && c <= '9'));
  });

  exports.tabspace = exports.charIn(' \t');

  exports.whitespace = exports.charIn(' \t\r\n');

  exports.newline = exports.charIn('\r\n');

  exports.stringWhile = special(function(solver, cont, test) {
    return function(v, solver) {
      var c, data, length, p, pos, _ref;

      _ref = solver.state, data = _ref[0], pos = _ref[1];
      length = data.length;
      if (pos === length) {
        return solver.failcont(false, solver);
      }
      c = data[pos];
      if (!test(c)) {
        return solver.failcont(c, solver);
      }
      p = pos + 1;
      while (p < length && test(data[p])) {
        p;
      }
      return cont(text.slice(pos, p), solver);
    };
  });

  exports.stringBetween = function(start, end) {
    return exports.stringWhile(function(c) {
      return (start < c && c < end);
    });
  };

  exports.stringIn = function(set) {
    return exports.stringWhile(function(c) {
      return __indexOf.call(set, c) >= 0;
    });
  };

  exports.digits = exports.stringWhile(function(c) {
    return ('0' <= c && c <= '9');
  });

  exports.digits1_9 = exports.stringWhile(function(c) {
    return ('1' <= c && c <= '9');
  });

  exports.lowers = exports.stringWhile(function(c) {
    return ('a' <= c && c <= 'z');
  });

  exports.uppers = exports.stringWhile(function(c) {
    return ('A' <= c && c <= 'Z');
  });

  exports.letters = exports.stringWhile(function(c) {
    return (('a' <= c && c <= 'z')) || (('A' <= c && c <= 'Z'));
  });

  exports.underlineLetters = exports.stringWhile(function(c) {
    return (c === '_') || (('a' <= c && c <= 'z')) || (('A' <= c && c <= 'Z'));
  });

  exports.underlineLetterDights = exports.stringWhile(function(c) {
    return (c === '_') || (('a' <= c && c <= 'z')) || (('A' <= c && c <= 'Z')) || (('0' <= c && c <= '9'));
  });

  exports.tabspaces = exports.stringIn(' \t');

  exports.whitespaces = exports.stringIn(' \t\r\n');

  exports.newlinespaces = exports.stringIn('\r\n');

  exports.stringWhile0 = special(function(solver, cont, test) {
    return function(v, solver) {
      var c, data, length, p, pos, _ref;

      _ref = solver.state, data = _ref[0], pos = _ref[1];
      length = data.length;
      if (pos === length) {
        return cont('', solver);
      }
      c = data[pos];
      if (!test(c)) {
        return cont('', solver);
      }
      p = pos + 1;
      while (p < length && test(data[p])) {
        p;
      }
      return cont(text.slice(pos, p), solver);
    };
  });

  exports.stringBetween0 = function(start, end) {
    return exports.stringWhile0(function(c) {
      return (start < c && c < end);
    });
  };

  exports.stringIn0 = function(set) {
    return exports.stringWhile0(function(c) {
      return __indexOf.call(set, c) >= 0;
    });
  };

  exports.digits0 = exports.stringWhile0(function(c) {
    return ('0' <= c && c <= '9');
  });

  exports.digits1_90 = exports.stringWhile0(function(c) {
    return ('1' <= c && c <= '9');
  });

  exports.lowers0 = exports.stringWhile0(function(c) {
    return ('a' <= c && c <= 'z');
  });

  exports.uppers0 = exports.stringWhile0(function(c) {
    return ('A' <= c && c <= 'Z');
  });

  exports.letters0 = exports.stringWhile0(function(c) {
    return (('a' <= c && c <= 'z')) || (('A' <= c && c <= 'Z'));
  });

  exports.underlineLetters0 = exports.stringWhile0(function(c) {
    return (c === '_') || (('a' <= c && c <= 'z')) || (('A' <= c && c <= 'Z'));
  });

  exports.underlineLetterDights0 = exports.stringWhile0(function(c) {
    return (c === '_') || (('a' <= c && c <= 'z')) || (('A' <= c && c <= 'Z')) || (('0' <= c && c <= '9'));
  });

  exports.tabspaces0 = exports.stringIn0(' \t');

  exports.whitespaces0 = exports.stringIn0(' \t\r\n');

  exports.newlines0 = exports.stringIn0('\r\n');

  exports.float = special(function(solver, cont, arg) {
    return function(v, solver) {
      var length, p, pos, text, val, value, _ref, _ref1, _ref2, _ref3, _ref4, _ref5;

      _ref = solver.parse_state, text = _ref[0], pos = _ref[1];
      length = text.length;
      if (pos >= length) {
        return solver.failcont(v, solver);
      }
      if ((!'0' <= (_ref1 = text[pos]) && _ref1 <= '9') && text[pos] !== '.') {
        return solver.failcont(v, solver);
      }
      p = pos;
      while (p < length && ('0' <= (_ref2 = text[p]) && _ref2 <= '9')) {
        p++;
      }
      if (p < length && text[p] === '.') {
        p++;
      }
      while (p < length && ('0' <= (_ref3 = text[p]) && _ref3 <= '9')) {
        p++;
      }
      if (p < length - 1 && (_ref4 = text[p], __indexOf.call('eE', _ref4) >= 0)) {
        p++;
        p++;
      }
      while (p < length && ('0' <= (_ref5 = text[p]) && _ref5 <= '9')) {
        p++;
      }
      if (text[{
        pos: p
      }] === '.') {
        return solver.failcont(v, solver);
      }
      val = eval(text.slice(pos, p));
      arg = solver.trail.deref(arg);
      value = eval(text[{
        pos: p
      }]);
      if (arg instanceof Var) {
        arg.bind(value, solver.trail);
        return cont(value, solver);
      } else {
        if (_.isNumber(arg)) {
          if (arg === value) {
            return cont(arg, solver);
          } else {
            return solver.failcont(v, solver)(s);
          }
        } else {
          throw new exports.TypeError(arg);
        }
      }
    };
  });

  exports.literal = special(function(solver, cont, arg) {
    return function(v, solver) {
      var length, pos, text, _ref;

      _ref = solver.parse_state, text = _ref[0], pos = _ref[1];
      length = text.length;
      if (pos >= length) {
        return solver.failcont(v, solver);
      }
      arg = solver.trail.deref(arg);
      if (arg instanceof Var) {
        throw new exports.TypeError(arg);
      } else {
        if (text.slice(pos).indexOf(arg) === 0) {
          solver.state = [text, pos + arg.length];
          return cont(pos + arg.length, solver);
        } else {
          return solver.failcont(false, solver);
        }
      }
    };
  });

  exports.quoteString = special(function(solver, cont, quote) {
    return function(v, solver) {
      var char, length, p, pos, string, text, _ref;

      string = '';
      _ref = solver.parse_state, text = _ref[0], pos = _ref[1];
      length = text.length;
      if (pos >= length) {
        return solver.failcont(v, solver);
      }
      quote = solver.trail.deref(quote);
      if (arg instanceof Var) {
        throw new exports.TypeError(arg);
      }
      if (text[pos] !== quote) {
        return solver.failcont(v, solver);
      }
      p = pos + 1;
      while (p < length) {
        char = text[p];
        p += 1;
        if (char === '\\') {
          p++;
        } else if (char === quote) {
          string = text.slice(pos + 1, p);
          break;
        }
      }
      if (p === length) {
        return solver.failcont(v, solver);
      }
      return cont(string, solver);
    };
  });

  dqstring = exports.quoteString('"');

  sqstring = exports.quoteString("'");

}).call(this);

/*
//@ sourceMappingURL=parser.map
*/
