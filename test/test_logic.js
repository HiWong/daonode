// Generated by CoffeeScript 1.6.2
(function() {
  var I, base, dao, xexports;

  I = require("./importer");

  base = "../lib/";

  dao = require(base + "dao");

  I.use(base + "dao: Trail, solve, fun, macro vari");

  I.use(base + "builtins/general: add print_");

  I.use(base + "builtins/lisp: quote eval_");

  I.use(base + "builtins/logic: andp orp notp succeed fail unify findall once rule");

  I.use(base + "builtins/parser: char parsetext may any");

  xexports = {};

  exports.Test = {
    "test and print": function(test) {
      test.equal(solve(andp(print_(1), print_(2))), null);
      return test.done();
    },
    "test or print": function(test) {
      test.equal(solve(orp(print_(1))), null);
      test.equal(solve(orp(print_(1), print_(2))), null);
      test.equal(solve(orp(fail, print_(2))), null);
      test.equal(solve(orp(fail, print_(2), print_(3))), null);
      test.equal(solve(orp(fail, fail, print_(3))), null);
      return test.done();
    },
    "test succeed fail": function(test) {
      test.equal(solve(succeed), null);
      test.equal(solve(fail), null);
      return test.done();
    },
    "test not succeed fail": function(test) {
      test.equal(solve(notp(succeed)), null);
      test.equal(solve(notp(fail)), null);
      return test.done();
    },
    "test not print": function(test) {
      test.equal(solve(notp(print_(1))), null);
      return test.done();
    },
    "test unify 1 1, 1 2": function(test) {
      test.equal(solve(unify(1, 1)), true);
      test.equal(solve(unify(1, 2)), false);
      return test.done();
    },
    "test unify a 1": function(test) {
      var a;

      a = vari('a');
      test.equal(solve(unify(a, 1)), true);
      a = vari('a');
      test.equal(solve(andp(unify(a, 1), unify(a, 2))), false);
      a = vari('a');
      test.equal(solve(orp(andp(unify(a, 1), unify(a, 2)), unify(a, 2))), true);
      return test.done();
    },
    "test unify logicvar": function(test) {
      var a;

      a = vari('a');
      test.equal(solve(unify(a, 1)), true);
      a = vari('a');
      test.equal(solve(andp(unify(a, 1), unify(a, 2))), false);
      a = vari('a');
      test.equal(solve(orp(andp(unify(a, 1), unify(a, 2)), unify(a, 2))), true);
      a = vari('a');
      test.equal(solve(orp(unify(a, 1), unify(a, 2))), true);
      return test.done();
    },
    "test macro": function(test) {
      var orpm, same;

      same = macro(1, function(x) {
        return x;
      });
      orpm = macro(2, function(x, y) {
        return orp(x, y);
      });
      test.equal(solve(same(1)), 1);
      test.equal(solve(same(print_(1))), null);
      test.equal(solve(orpm(fail, print_(2))), null);
      return test.done();
    },
    "test unify var": function(test) {
      var a;

      a = vari('a');
      test.equal(solve(unify(a, 1)), true);
      test.equal(solve(andp(unify(a, 1))), true);
      test.equal(solve(andp(unify(a, 1), unify(a, 2))), false);
      test.equal(solve(andp(unify(a, 1), unify(a, 2), unify(a, 2))), false);
      a.binding = a;
      test.equal(solve(orp(andp(unify(a, 1), unify(a, 2)), unify(a, 2))), true);
      test.equal(solve(orp(andp(unify(a, 1), unify(a, 2)))), false);
      return test.done();
    },
    "test findall once": function(test) {
      test.equal(solve(findall(orp(print_(1), print_(2)))), null);
      test.equal(solve(findall(orp(print_(1), print_(2), print_(3)))), null);
      test.equal(solve(findall(once(orp(print_(1), print_(2))))), null);
      return test.done();
    },
    "test rule": function(test) {
      var r;

      r = rule(2, function(x, y) {
        return [[x, y], 1, null];
      });
      test.equal(solve(r(1, 1)), 1);
      test.equal(dao.status, dao.SUCCESS);
      return test.done();
    },
    "test rule2": function(test) {
      var r;

      r = rule(2, function(x, y) {
        return [[1, 2], print_(1), [1, 1], print_(2)];
      });
      test.equal(solve(r(1, 1)), null);
      return test.done();
    },
    "test findall": function(test) {
      test.equal(solve(orp(findall(orp(print_(1), print_(2))), print_(3))), null);
      test.equal(solve(findall(once(orp(print_(1), print_(2))))), null);
      return test.done();
    }
  };

}).call(this);

/*
//@ sourceMappingURL=test_logic.map
*/
