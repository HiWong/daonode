// Generated by CoffeeScript 1.6.2
(function() {
  var Trail, solve, special;

  solve = require("../../src/solve");

  special = solve.special;

  Trail = solve.Trail;

  exports.succeed = special(function(solver, cont) {
    return function(v, solver) {
      return cont(true, solver);
    };
  })();

  exports.fail = special(function(solver, cont) {
    return function(v, solver) {
      return solver.failcont(false, solver);
    };
  })();

  exports.andp = special(function(solver, cont, x, y) {
    return solver.cont(x, solver.cont(y, cont));
  });

  exports.ifp = special(function(solver, cont, test, action) {
    return solver.cont(test, solver.cont(action, cont));
  });

  exports.cutable = special(function(solver, cont, x) {
    return function(v, solver) {
      var cc;

      cc = solver.cutCont;
      return solver.cont(x, function(v, solver) {
        solver.cutCont = cc;
        return cont(v, solver);
      })(exports.NULL, solver);
    };
  });

  exports.orp = special(function(solver, cont, x, y) {
    return function(v, solver) {
      var fc, state, trail, xcont, ycont;

      trail = new Trail;
      state = solver.state;
      fc = solver.failcont;
      xcont = solver.cont(x, cont);
      ycont = solver.cont(y, cont);
      solver.failcont = function(v, solver) {
        trail.undo();
        solver.state = state;
        solver.failcont = fc;
        return ycont(v, solver);
      };
      solver.trail = trail;
      return xcont(null, solver);
    };
  });

  exports.once = special(function(solver, cont, x) {
    return function(v, solver) {
      var fc;

      fc = solver.failcont;
      return solver.cont(x, function(v, solver) {
        solver.failcont = fc;
        return cont(v, solver);
      })(exports.NULL, solver);
    };
  });

  exports.notp = special(function(solver, cont, x) {
    return function(v, solver) {
      var fc, state, trail;

      trail = solver.trail;
      solver.trail = new Trail;
      fc = solver.failcont;
      state = solver.state;
      solver.failcont = function(v, solver) {
        solver.trail.undo();
        solver.trail = trail;
        solver.state = state;
        solver.failcont = fc;
        return cont(v, solver);
      };
      return solver.cont(x, function(v, solver) {
        solver.failcont = fc;
        return fc(v, solver);
      })(v, solver);
    };
  });

  exports.cut = special(function(solver, cont) {
    return function(v, solver) {
      solver.failcont = solver.cutCont;
      return cont(v, solver);
    };
  })();

  exports.repeat = special(function(solver, cont) {
    return function(v, solver) {
      solver.failcont = cont;
      return cont(null, solver);
    };
  })();

  exports.findall = special(function(solver, cont, exp) {
    return function(v, solver) {
      var fc;

      fc = solver.failcont;
      solver.failcont = function(v, solver) {
        solver.failcont = fc;
        return cont(v, solver);
      };
      return solver.cont(exp, function(v, solver) {
        return solver.failcont(v, solver);
      })(v, solver);
    };
  });

  exports.unify = special(function(solver, cont, x, y) {
    return function(v, solver) {
      if (solver.trail.unify(x, y)) {
        return cont(true, solver);
      } else {
        return solver.failcont(false, solver);
      }
    };
  });

  exports.is_ = special(function(solver, cont, vari, exp) {
    return solver.cont(exp, function(v, solver) {
      vari.bind(v, solver.trail);
      return cont(true, solver);
    });
  });

}).call(this);

/*
//@ sourceMappingURL=logic.map
*/
