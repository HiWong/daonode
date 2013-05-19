// Generated by CoffeeScript 1.6.2
(function() {
  var Command, DummyVar, Trail, UnquoteSliceValue, Var, debug, done, faildone, maker, reElements, special, _, _ref, _ref1, _ref2, _ref3, _ref4,
    __slice = [].slice,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ = require('underscore');

  exports.debug = debug = function() {
    var items, s, x;

    items = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    return console.log.apply(console, (function() {
      var _i, _len, _results;

      _results = [];
      for (_i = 0, _len = items.length; _i < _len; _i++) {
        x = items[_i];
        if (!(x instanceof Function)) {
          s = x.toString();
          if (s === '[object Object]') {
            _results.push(JSON.stringify(x));
          } else {
            _results.push(s);
          }
        } else {
          _results.push('[Function]');
        }
      }
      return _results;
    })());
  };

  exports.done = done = function(v, solver) {
    console.log("succeed!");
    solver.done = true;
    return [null, solver.trail.getvalue(v), solver];
  };

  exports.faildone = faildone = function(v, solver) {
    console.log("fail!");
    solver.done = true;
    return [null, solver.trail.getvalue(v), solver];
  };

  exports.solve = function(exp, trail, cont, failcont) {
    if (trail == null) {
      trail = new Trail;
    }
    if (cont == null) {
      cont = done;
    }
    if (failcont == null) {
      failcont = faildone;
    }
    return new exports.Solver(trail, failcont).solve(exp, cont);
  };

  exports.solver = function(trail, failcont, state) {
    if (trail == null) {
      trail = new Trail;
    }
    if (failcont == null) {
      failcont = faildone;
    }
    return new exports.Solver(trail, failcont, state);
  };

  exports.Solver = (function() {
    function Solver(trail, failcont, state) {
      this.trail = trail != null ? trail : new exports.Trail;
      this.failcont = failcont != null ? failcont : faildone;
      this.state = state;
      this.cutCont = this.failcont;
      this.catches = {};
      this.exits = {};
      this.continues = {};
      this.done = false;
    }

    Solver.prototype.pushCatch = function(value, cont) {
      var catches, _base, _ref;

      catches = (_ref = (_base = this.catches)[value]) != null ? _ref : _base[value] = [];
      return catches.push(cont);
    };

    Solver.prototype.popCatch = function(value) {
      var catches;

      catches = this.catches[value];
      catches.pop();
      if (catches.length === 0) {
        return delete this.catches[value];
      }
    };

    Solver.prototype.findCatch = function(value) {
      var catches;

      catches = this.catches[value];
      if ((catches == null) || catches.length === 0) {
        throw new NotCatched;
      }
      return catches[catches.length - 1];
    };

    Solver.prototype.protect = function(fun) {
      return fun;
    };

    Solver.prototype.cont = function(exp, cont) {
      return (exp != null ? typeof exp.cont === "function" ? exp.cont(this, cont) : void 0 : void 0) || (function(v, solver) {
        return cont(exp, solver);
      });
    };

    Solver.prototype.quasiquote = function(exp, cont) {
      return (exp != null ? typeof exp.quasiquote === "function" ? exp.quasiquote(this, cont) : void 0 : void 0) || (function(v, solver) {
        return cont(exp, solver);
      });
    };

    Solver.prototype.expsCont = function(exps, cont) {
      var length;

      length = exps.length;
      if (length === 0) {
        throw exports.TypeError(exps);
      } else if (length === 1) {
        return this.cont(exps[0], cont);
      } else {
        return this.cont(exps[0], this.expsCont(exps.slice(1), cont));
      }
    };

    Solver.prototype.argsCont = function(args, cont) {
      var arg0, arg1, arg2, arg3, arg4, arg5, cont0, cont1, cont2, cont3, cont4, cont5, cont6, i, length, params, solver, _cont1, _cont2, _cont3, _cont4, _cont5, _cont6, _i, _ref;

      length = args.length;
      solver = this;
      switch (length) {
        case 0:
          return function(v, solver) {
            return cont([], solver);
          };
        case 1:
          cont0 = function(v, solver) {
            return cont([v], solver);
          };
          return solver.cont(args[0], cont0);
        case 2:
          arg0 = null;
          _cont1 = function(arg1, solver) {
            return cont([arg0, arg1], solver);
          };
          cont1 = solver.cont(args[1], _cont1);
          cont0 = function(v, solver) {
            arg0 = v;
            return cont1(null, solver);
          };
          return solver.cont(args[0], cont0);
        case 3:
          arg0 = null;
          arg1 = null;
          _cont2 = function(arg2, solver) {
            return cont([arg0, arg1, arg2], solver);
          };
          cont2 = solver.cont(args[2], _cont2);
          _cont1 = function(v, solver) {
            arg1 = v;
            return cont2(null, solver);
          };
          cont1 = solver.cont(args[1], _cont1);
          cont0 = function(v, solver) {
            arg0 = v;
            return cont1(null, solver);
          };
          return solver.cont(args[0], cont0);
        case 4:
          arg0 = null;
          arg1 = null;
          arg2 = null;
          _cont3 = function(arg3, solver) {
            return cont([arg0, arg1, arg2, arg3], solver);
          };
          cont3 = solver.cont(args[3], _cont3);
          _cont2 = function(v, solver) {
            arg2 = v;
            return cont3(null, solver);
          };
          cont2 = solver.cont(args[2], _cont2);
          _cont1 = function(v, solver) {
            arg1 = v;
            return cont2(null, solver);
          };
          cont1 = solver.cont(args[1], _cont1);
          cont0 = function(v, solver) {
            arg0 = v;
            return cont1(null, solver);
          };
          return solver.cont(args[0], cont0);
        case 5:
          arg0 = null;
          arg1 = null;
          arg2 = null;
          arg3 = null;
          _cont4 = function(arg4, solver) {
            return cont([arg0, arg1, arg2, arg3, arg4], solver);
          };
          cont4 = solver.cont(args[4], _cont4);
          _cont3 = function(v, solver) {
            arg3 = v;
            return cont4(null, solver);
          };
          cont3 = solver.cont(args[3], _cont3);
          _cont2 = function(v, solver) {
            arg2 = v;
            return cont3(null, solver);
          };
          cont2 = solver.cont(args[2], _cont2);
          _cont1 = function(v, solver) {
            arg1 = v;
            return cont2(null, solver);
          };
          cont1 = solver.cont(args[1], _cont1);
          cont0 = function(v, solver) {
            arg0 = v;
            return cont1(null, solver);
          };
          return solver.cont(args[0], cont0);
        case 6:
          arg0 = null;
          arg1 = null;
          arg2 = null;
          arg3 = null;
          arg4 = null;
          _cont5 = function(arg5, solver) {
            return cont([arg0, arg1, arg2, arg3, arg4, arg5], solver);
          };
          cont5 = solver.cont(args[5], _cont5);
          _cont4 = function(v, solver) {
            arg4 = v;
            return cont5(null, solver);
          };
          cont4 = solver.cont(args[4], _cont4);
          _cont3 = function(v, solver) {
            arg3 = v;
            return cont4(null, solver);
          };
          cont3 = solver.cont(args[3], _cont3);
          _cont2 = function(v, solver) {
            arg2 = v;
            return cont3(null, solver);
          };
          cont2 = solver.cont(args[2], _cont2);
          _cont1 = function(v, solver) {
            arg1 = v;
            return cont2(null, solver);
          };
          cont1 = solver.cont(args[1], _cont1);
          cont0 = function(v, solver) {
            arg0 = v;
            return cont1(null, solver);
          };
          return solver.cont(args[0], cont0);
        case 7:
          arg0 = null;
          arg1 = null;
          arg2 = null;
          arg3 = null;
          arg4 = null;
          arg5 = null;
          _cont6 = function(arg6, solver) {
            return cont([arg0, arg1, arg2, arg3, arg4, arg5, arg6], solver);
          };
          cont6 = solver.cont(args[6], _cont6);
          _cont5 = function(v, solver) {
            arg5 = v;
            return cont6(null, solver);
          };
          cont5 = solver.cont(args[5], _cont5);
          _cont4 = function(v, solver) {
            arg4 = v;
            return cont5(null, solver);
          };
          cont4 = solver.cont(args[4], _cont4);
          _cont3 = function(v, solver) {
            arg3 = v;
            return cont4(null, solver);
          };
          cont3 = solver.cont(args[3], _cont3);
          _cont2 = function(v, solver) {
            arg2 = v;
            return cont3(null, solver);
          };
          cont2 = solver.cont(args[2], _cont2);
          _cont1 = function(v, solver) {
            arg1 = v;
            return cont2(null, solver);
          };
          cont1 = solver.cont(args[1], _cont1);
          cont0 = function(v, solver) {
            arg0 = v;
            return cont1(null, solver);
          };
          return solver.cont(args[0], cont0);
        default:
          params = [];
          for (i = _i = _ref = args.length - 1; _i >= 0; i = _i += -1) {
            cont = (function(i, cont) {
              var _cont;

              _cont = function(argi, solver) {
                params.push(argi);
                return cont(params, solver);
              };
              return solver.cont(args[i], _cont);
            })(i, cont);
          }
          return cont;
      }
    };

    Solver.prototype.solve = function(exp, cont) {
      var solver, value, _ref;

      if (cont == null) {
        cont = done;
      }
      cont = this.cont(exp, cont || done);
      value = null;
      solver = this;
      while (!solver.done) {
        _ref = cont(value, solver), cont = _ref[0], value = _ref[1], solver = _ref[2];
      }
      return value;
    };

    return Solver;

  })();

  Trail = exports.Trail = (function() {
    function Trail(data) {
      this.data = data != null ? data : {};
    }

    Trail.prototype.set = function(vari, value) {
      if (!this.data.hasOwnProperty(vari.name)) {
        return this.data[vari.name] = [vari, value];
      }
    };

    Trail.prototype.undo = function() {
      var name, pair, _ref, _results;

      _ref = this.data;
      _results = [];
      for (name in _ref) {
        pair = _ref[name];
        _results.push(pair[0].binding = pair[1]);
      }
      return _results;
    };

    Trail.prototype.deref = function(x) {
      return (x != null ? typeof x.deref === "function" ? x.deref(this) : void 0 : void 0) || x;
    };

    Trail.prototype.getvalue = function(x) {
      return (x != null ? typeof x.getvalue === "function" ? x.getvalue(this) : void 0 : void 0) || x;
    };

    Trail.prototype.unify = function(x, y) {
      return (x != null ? typeof x.unify === "function" ? x.unify(y, this) : void 0 : void 0) || (y != null ? typeof y.unify === "function" ? y.unify(x, this) : void 0 : void 0) || (x === y);
    };

    return Trail;

  })();

  Var = exports.Var = (function() {
    function Var(name, binding) {
      this.name = name;
      this.binding = binding != null ? binding : this;
    }

    Var.prototype.deref = function(trail) {
      var chains, i, next, v, x, _i, _j, _ref, _ref1;

      v = this;
      next = this.binding;
      if (next === this || !(next instanceof Var)) {
        return next;
      } else {
        chains = [v];
        while (1) {
          chains.push(next);
          v = next;
          next = v.binding;
          if (next === v) {
            for (i = _i = 0, _ref = chains.length - 2; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
              x = chains[i];
              x.binding = next;
              trail.set(x, chains[i + 1]);
            }
            return next;
          } else if (!next instanceof Var) {
            for (i = _j = 0, _ref1 = chains.length - 1; 0 <= _ref1 ? _j < _ref1 : _j > _ref1; i = 0 <= _ref1 ? ++_j : --_j) {
              x = chains[i];
              x.binding = next;
              trail.set(x, chains[i + 1]);
            }
            return next;
          }
        }
      }
    };

    Var.prototype.bind = function(value, trail) {
      trail.set(this, this.binding);
      return this.binding = value;
    };

    Var.prototype.unify = function(y, trail) {
      var x;

      x = this.deref(trail);
      y = trail.deref(y);
      if (x instanceof exports.Var) {
        x.bind(y, trail);
        return true;
      } else if (y instanceof exports.Var) {
        y.bind(x, trail);
        return true;
      } else {
        return (typeof x._unify === "function" ? x._unify(y, trail) : void 0) || (typeof y._unify === "function" ? y._unify(x, trail) : void 0) || x === y;
      }
    };

    Var.prototype._unify = function(y, trail) {
      this.bind(y, trail);
      return true;
    };

    Var.prototype.getvalue = function(trail) {
      var result;

      result = this.deref(trail);
      if (result instanceof exports.Var) {
        return result;
      } else {
        return getvalue(result);
      }
    };

    Var.prototype.cont = function(solver, cont) {
      var _this = this;

      return function(v, solver) {
        return cont(_this.deref(solver.trail), solver);
      };
    };

    Var.prototype.toString = function() {
      return "vari(" + this.name + ")";
    };

    return Var;

  })();

  reElements = /\s*,\s*|\s+/;

  exports.vari = function(name) {
    return new exports.Var(name);
  };

  exports.vars = function(names) {
    var name, _i, _len, _ref, _results;

    _ref = split(names, reElements);
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      name = _ref[_i];
      _results.push(new Var(name));
    }
    return _results;
  };

  exports.DummyVar = DummyVar = (function(_super) {
    __extends(DummyVar, _super);

    function DummyVar() {
      _ref = DummyVar.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    DummyVar.prototype.deref = function(trail) {
      return this;
    };

    DummyVar.prototype.bind = function(value, trail) {
      return this.binding = value;
    };

    DummyVar.prototype._unify = function(y, trail) {
      this.binding = y;
      return true;
    };

    DummyVar.prototype.getvalue = function(trail) {
      var result;

      result = this.binding;
      if (result === this) {
        return result;
      } else {
        return getvalue(result);
      }
    };

    return DummyVar;

  })(Var);

  exports.dummy = function(name) {
    return new exports.DummyVar(name);
  };

  exports.dummies = function(names) {
    var name, _i, _len, _ref1, _results;

    _ref1 = split(names, reElements);
    _results = [];
    for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
      name = _ref1[_i];
      _results.push(new DummyVar(name));
    }
    return _results;
  };

  exports.Apply = (function() {
    function Apply(caller, args) {
      this.caller = caller;
      this.args = args;
    }

    Apply.prototype.toString = function() {
      return "" + this.caller + "(" + (this.args.join(', ')) + ")";
    };

    Apply.prototype.cont = function(solver, cont) {
      return this.caller.apply_cont(solver, cont, this.args);
    };

    Apply.prototype.quasiquote = function(solver, cont) {
      var args, i, params, _i, _ref1,
        _this = this;

      if (this.caller.name === "unquote") {
        return solver.cont(this.args[0], function(v, solver) {
          return cont(v, solver);
        });
      } else if (this.caller.name === "unquoteSlice") {
        return solver.cont(this.args[0], function(v, solver) {
          return cont(new UnquoteSliceValue(v), solver);
        });
      }
      params = [];
      cont = (function(cont) {
        return function(v, solver) {
          return [cont, new _this.constructor(_this.caller, params), solver];
        };
      })(cont);
      args = this.args;
      for (i = _i = _ref1 = args.length - 1; _i >= 0; i = _i += -1) {
        cont = (function(i, cont) {
          return solver.quasiquote(args[i], function(v, solver) {
            var x, _j, _len, _ref2;

            if (v instanceof UnquoteSliceValue) {
              _ref2 = v.value;
              for (_j = 0, _len = _ref2.length; _j < _len; _j++) {
                x = _ref2[_j];
                params.push(x);
              }
            } else {
              params.push(v);
            }
            return cont(null, solver);
          });
        })(i, cont);
      }
      return cont;
    };

    return Apply;

  })();

  UnquoteSliceValue = exports.UnquoteSliceValue = (function() {
    function UnquoteSliceValue(value) {
      this.value = value;
    }

    return UnquoteSliceValue;

  })();

  exports.apply = function(caller, args) {
    return new exports.Apply(caller, args);
  };

  Command = exports.Command = (function() {
    Command.directRun = false;

    Command.done = function(v, solver) {
      solver.done = true;
      return [null, solver.trail.getvalue(v), solver];
    };

    Command.faildone = function(v, solver) {
      solver.done = true;
      return [null, solver.trail.getvalue(v), solver];
    };

    function Command(fun, name) {
      var _this = this;

      this.fun = fun;
      this.name = name;
      this.callable = function() {
        var applied, args, result;

        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        applied = exports.apply(_this, args);
        if (Command.directRun) {
          result = Command.globalSolver.solve(applied, Command.done);
          Command.globalSolver.done = false;
          return result;
        } else {
          return applied;
        }
      };
    }

    Command.prototype.register = function(exports) {
      return exports[this.name] = this.callable;
    };

    Command.prototype.toString = function() {
      return this.name;
    };

    return Command;

  })();

  maker = function(klass) {
    return function(name_or_fun, fun) {
      return (fun != null ? new klass(fun, name_or_fun) : new klass(name_or_fun)).callable;
    };
  };

  exports.Special = (function(_super) {
    __extends(Special, _super);

    function Special() {
      _ref1 = Special.__super__.constructor.apply(this, arguments);
      return _ref1;
    }

    Special.prototype.apply_cont = function(solver, cont, args) {
      return this.fun.apply(this, [solver, cont].concat(__slice.call(args)));
    };

    return Special;

  })(exports.Command);

  exports.special = special = maker(exports.Special);

  exports.Fun = (function(_super) {
    __extends(Fun, _super);

    function Fun() {
      _ref2 = Fun.__super__.constructor.apply(this, arguments);
      return _ref2;
    }

    Fun.prototype.apply_cont = function(solver, cont, args) {
      var _this = this;

      return solver.argsCont(args, function(params, solver) {
        return [cont, _this.fun.apply(_this, params), solver];
      });
    };

    return Fun;

  })(exports.Command);

  exports.fun = maker(exports.Fun);

  exports.Macro = (function(_super) {
    __extends(Macro, _super);

    function Macro() {
      _ref3 = Macro.__super__.constructor.apply(this, arguments);
      return _ref3;
    }

    Macro.prototype.apply_cont = function(solver, cont, args) {
      return solver.cont(this.fun.apply(this, args), cont);
    };

    return Macro;

  })(exports.Command);

  exports.macro = maker(exports.Macro);

  exports.Proc = (function(_super) {
    __extends(Proc, _super);

    function Proc() {
      _ref4 = Proc.__super__.constructor.apply(this, arguments);
      return _ref4;
    }

    Proc.prototype.apply_cont = function(solver, cont, args) {
      var _this = this;

      return function(v, solver) {
        var result, savedSolver;

        Command.directRun = true;
        savedSolver = Command.globalSolver;
        Command.globalSolver = solver;
        result = _this.fun.apply(_this, args);
        Command.globalSolver = savedSolver;
        Command.directRun = false;
        return [cont, result, solver];
      };
    };

    return Proc;

  })(exports.Command);

  exports.proc = maker(exports.Proc);

  exports.tofun = function(name, cmd) {
    if (cmd == null) {
      cmd = name;
      name = 'noname';
    }
    return special(name, function() {
      var args, cont, solver;

      solver = arguments[0], cont = arguments[1], args = 3 <= arguments.length ? __slice.call(arguments, 2) : [];
      return solver.argsCont(args, function(params, solver) {
        return [solver.cont(cmd.apply(null, params), cont), params, solver];
      });
    });
  };

}).call(this);

/*
//@ sourceMappingURL=solve.map
*/
