{solve, special, vari, dummy, cons, vari, macro} = core = require("../../lib/core")
{print_, getvalue, toString} = require("../../lib/builtins/general")
{andp, orp, bind, is_} = require("../../lib/builtins/logic")
{begin} = require("../../lib/builtins/lisp")
{settext} = require("../../lib/builtins/parser")
{expression, operator, atom} = require("../expression")

xexports = {}

exports.Test =
  "test operator": (test) ->
    x = vari('x')
    console.log  solve(begin(
                              settext('+'),
                              operator(x), x))
    test.equal(x.binding, '+');
    test.equal(core.status, core.SUCCESS);
    x.binding = x
    console.log  solve(begin(
                              settext('/'),
                              operator(x), x))
    test.equal(x.binding, '/');
    test.equal(core.status, core.SUCCESS);
    test.done()

xexports.Test =
  "test kleene": (test) ->
    x = vari('x')
    console.log  solve(begin(
      settext('ab'),
      kleene(x), flatString(getvalue(x))))
    test.equal(core.status, core.SUCCESS);
    test.done()