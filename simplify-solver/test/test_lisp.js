// Generated by CoffeeScript 1.6.2
(function() {
  var Trail, UnquoteSliceValue, add, assign, begin, block, break_, callcc, callfc, catch_, continue_, core, dec, done, dummy, eq, eval_, faildone, fun, fun2, if_, iff, inc, le, loop_, macro, orp, print_, proc, protect, qq, quote, rule, solve, throw_, tofun, until_, uq, uqs, vari, while_, xexports, _, _ref, _ref1, _ref2,
    __slice = [].slice;

  _ = require("underscore");

  _ref = core = require('../core'), solve = _ref.solve, vari = _ref.vari, Trail = _ref.Trail, fun = _ref.fun, fun2 = _ref.fun2, macro = _ref.macro, proc = _ref.proc, rule = _ref.rule, tofun = _ref.tofun, dummy = _ref.dummy, done = _ref.done, faildone = _ref.faildone, UnquoteSliceValue = _ref.UnquoteSliceValue;

  _ref1 = require("../builtins/general"), add = _ref1.add, print_ = _ref1.print_, inc = _ref1.inc, dec = _ref1.dec, eq = _ref1.eq, le = _ref1.le;

  _ref2 = require("../builtins/lisp"), quote = _ref2.quote, eval_ = _ref2.eval_, if_ = _ref2.if_, iff = _ref2.iff, begin = _ref2.begin, quote = _ref2.quote, eval_ = _ref2.eval_, block = _ref2.block, break_ = _ref2.break_, continue_ = _ref2.continue_, assign = _ref2.assign, loop_ = _ref2.loop_, while_ = _ref2.while_, until_ = _ref2.until_, catch_ = _ref2.catch_, throw_ = _ref2.throw_, protect = _ref2.protect, callcc = _ref2.callcc, callfc = _ref2.callfc, qq = _ref2.qq, uq = _ref2.uq, uqs = _ref2.uqs;

  orp = require("../builtins/logic").orp;

  xexports = {};

  exports.Test = {
    "test assign inc dec": function(test) {
      var a;

      a = vari('a');
      test.equal(solve(begin(assign(a, 1), block('a', if_(eq(a, 10000000), break_('a', a)), inc(a), continue_('a')))), 10000000);
      return test.done();
    }
  };

  exports.Test = {
    "test if_ iff begin": function(test) {
      test.equal(solve(begin(1)), 1);
      test.equal(solve(begin(1, 2)), 2);
      test.equal(solve(begin(1, 2, 3)), 3);
      test.equal(solve(if_(1, 2, 3)), 2);
      test.equal(solve(iff([[1, 2]], 3)), 2);
      test.equal(solve(iff([[0, 2], [1, 3]], 5)), 3);
      return test.done();
    },
    "test eval_ quote": function(test) {
      var exp;

      exp = if_(1, 2, 3);
      test.equal(solve(quote(exp)), exp);
      test.equal(solve(eval_(quote(exp))), 2);
      return test.done();
    },
    "test assign inc dec": function(test) {
      var a;

      a = vari('a');
      test.equal(solve(begin(assign(a, 1), a)), 1);
      return test.done();
    },
    "test catch throw": function(test) {
      var a;

      a = vari('a');
      test.equal(solve(catch_(1, 2)), 2);
      test.equal(solve(catch_(1, throw_(1, 2), 3)), 2);
      return test.done();
    }
  };

  xexports.Test = {
    "test protect": function(test) {
      var a;

      a = vari('a');
      test.equal(solve(block('foo', protect(break_('foo', 1), print_(2)))), 1);
      test.equal(solve(block('foo', protect(break_('foo', 1), print_(2), print_(3)))), 1);
      return test.done();
    }
  };

  xexports.Test = {
    "test proc,aka online function in dao": function(test) {
      var a, r;

      r = proc(0, 'a', function() {
        var i;

        i = 0;
        return add(1, 2);
      });
      a = r();
      test.equal(solve(a), 3);
      return test.done();
    }
  };

  exports.Test = {
    "test block break continue": function(test) {
      var a;

      test.equal(solve(block('a', 1)), 1);
      test.equal(solve(block('a', break_('a', 2), 1)), 2);
      test.equal(solve(block('a', block('b', break_('b', 2), 1), 3)), 3);
      a = vari('a');
      test.equal(solve(begin(assign(a, 1), block('a', if_(eq(a, 5), break_('a', a)), inc(a), continue_('a')))), 5);
      return test.done();
    },
    "test assign inc dec": function(test) {
      var a;

      a = vari('a');
      test.equal(solve(begin(assign(a, 1), block('a', if_(eq(a, 5), break_('a', a)), print_(a), inc(a), continue_('a')))), 5);
      test.equal(solve(begin(assign(a, 1), loop_('a', if_(eq(a, 5), break_('a', a)), print_(a), inc(a)))), 5);
      test.equal(solve(begin(assign(a, 1), block('a', if_(eq(a, 5), break_(a)), print_(a), inc(a), continue_()))), 5);
      test.equal(solve(begin(assign(a, 1), loop_('a', print_(a), if_(eq(a, 5), break_(a)), inc(a)))), 5);
      test.equal(solve(begin(assign(a, 1), while_('a', le(a, 5), print_(a), inc(a)))), null);
      return test.done();
    }
  };

  xexports.Test = {
    "test callcc": function(test) {
      var a;

      a = null;
      solve(begin(callcc(function(k) {
        return a = k;
      }), add(1, 2)));
      test.equal(a(null), 3);
      return test.done();
    },
    "test callfc": function(test) {
      var a, x;

      a = null;
      solve(orp(callfc(function(k) {
        return a = k;
      }), add(1, 2)));
      test.equal(a(null), 3);
      x = vari('x');
      x.binding = 5;
      solve(orp(callfc(function(k) {
        return a = k;
      }), add(x, 2)));
      test.equal(a(null), 7);
      return test.done();
    }
  };

  xexports.Test = {
    "test quasiquote": function(test) {
      test.equal(solve(qq(1)), 1);
      return test.done();
    }
  };

  xexports.Test = {
    "test argsCont": function(test) {
      var incall;

      incall = fun(-1, function() {
        var args;

        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        return _.map(args, function(x) {
          return x + 1;
        });
      });
      test.deepEqual(solve(incall(1)), [2]);
      test.deepEqual(solve(incall(1, 2)), [2, 3]);
      test.deepEqual(solve(incall(1, 2, 3)), [2, 3, 4]);
      test.deepEqual(solve(incall(1, 2, 3, 4)), [2, 3, 4, 5]);
      test.deepEqual(solve(incall(1, 2, 3, 4, 5)), [2, 3, 4, 5, 6]);
      test.deepEqual(solve(incall(1, 2, 3, 4, 5, 6)), [2, 3, 4, 5, 6, 7]);
      test.deepEqual(solve(incall(1, 2, 3, 4, 5, 6, 7)), [2, 3, 4, 5, 6, 7, 8]);
      test.deepEqual(solve(incall(1, 2, 3, 4, 5, 6, 7, 8)), [2, 3, 4, 5, 6, 7, 8, 9]);
      test.deepEqual(solve(incall(1, 2, 3, 4, 5, 6, 7, 8, 9)), [2, 3, 4, 5, 6, 7, 8, 9, 10]);
      return test.done();
    }
  };

}).call(this);

/*
//@ sourceMappingURL=test_lisp.map
*/
