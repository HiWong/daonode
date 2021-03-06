_ = require "underscore"

{solve} = core = require('../lib/core')
solvebase = require('../lib/solve')
{begin, assign, print_, string,
array, uarray, cons, makeobject, uobject
funcall, lamda, macro,
if_, add, eq, le, inc, not_,
logicvar, unify, succeed, fail, andp, orp, orp2, notp, getvalue
cutable, cut, findall, once
} = require('../lib/util')

vari = (name) -> name

xexports = {}

exports.Test =
  "test succeed fail": (test) ->
    test.equal solve(succeed), true
    test.equal solve(fail), false
    test.done()

#xexports.Test =
  "test and print": (test) ->
    test.equal  solve(andp(print_(1), print_(2))), null
    test.done()

#exports.Test =
  "test or print": (test) ->
    test.equal  solve(orp(print_(1))), null
    test.equal  solve(orp(print_(1), print_(2))), null
    test.equal  solve(orp(fail, print_(2))), null
    test.equal  solve(orp(fail, print_(2), print_(3))), null
    test.equal  solve(orp(fail, fail, print_(3))), null
    test.done()

#xexports.Test =
  "test not succeed fail": (test) ->
    test.equal  solve(notp(succeed)), true
    test.equal  solve(notp(fail)), false
    test.done()

  "test not print": (test) ->
    test.equal  solve(notp(print_(1))), null
    test.done()

  "test unify 1 1, 1 2": (test) ->
    test.equal  solve(unify(1, 1)), true
    test.equal  solve(unify(1, 2)), false
    test.done()

#exports.Test =
  "test unify logicvar": (test) ->
    a = vari('a')
    $a = logicvar('a')
    test.equal  solve(unify($a, 1)), true
    test.equal  solve(andp(assign(a, $a), unify(a, 1), unify(a, 2))), false
    test.equal  solve(begin(assign(a, $a), orp2(andp(unify(a, 1), unify(a, 2)), unify(a, 2)))), true
    test.done()

#exports.Test =
  "test cut": (test) ->
    test.equal  solve(orp(andp(print_(1), fail), print_(2))), null
    test.equal  solve(orp(andp(print_(1), cut, fail), print_(2))), false
    test.equal  solve(orp(cutable(orp(andp(print_(1), cut, fail), print_(2))), print_(3))), null
    test.done()

#exports.Test =
  "test findall once": (test) ->
    x = vari('x')
    result = vari('result')
    test.equal  solve(findall(orp(print_(1), print_(2)))), null
    test.equal  solve(findall(orp(print_(1), print_(2), print_(3)))), null
    test.deepEqual solve(andp(assign(x, logicvar('x')), assign(result, logicvar('result')),
                              findall(orp2(unify(x, 1), unify(x, 2)), result, x), getvalue(result))), [1,2]
    test.deepEqual  solve(andp(assign(result, logicvar('result')), findall(fail, result, 1), getvalue(result))), []
    test.deepEqual  solve(andp(assign(result, logicvar('result')),findall(succeed, result, 1), getvalue(result))), [1]
    test.deepEqual  solve(andp(assign(result, logicvar('result')),
                               findall(once(orp(print_(1), print_(2))), result, 1), getvalue(result))), [1]
    test.done()

#exports.Test =
  "test unify cons": (test) ->
    a = vari('a')
    $a = logicvar('a')
    test.equal  solve(unify(cons(1, null), cons(1, null))), true
    test.equal  solve(unify(cons($a, null), cons(1, null))), true
    test.equal  solve(andp(assign(a, $a), unify(cons(a, null), cons(1, null)), unify(a, 2))), false
    test.equal  solve(begin(assign(a, $a), orp2(andp(unify(cons(a, null), cons(1, null)),
                                                    unify(a, 2)), unify(a, 2)))), true
    test.done()

#exports.Test =
  "test unify uobject": (test) ->
    a = vari('a')
    $a = logicvar('a')
    test.equal  solve(unify(makeobject(string('a'), 1), {a:1})), false
    test.equal  solve(unify(uobject(string('a'), 1), {a:1})), true
    test.equal  solve(unify(uobject(string('a'), $a), {a:1})), true
    test.equal  solve(andp(assign(a, $a), unify(uobject(string('a'), a), {a:1}), unify(a, 2))), false
    test.equal  solve(begin(assign(a, $a), orp2(andp(unify(uobject(string('a'), a), {a:1}),
                                                    unify(a, 2)), unify(a, 2)))), true
    test.done()

#exports.Test =
  "test unify array, uarray": (test) ->
    a = vari('a')
    $a = logicvar('a')
    test.equal  solve(unify(array($a), [])), false
    test.equal  solve(unify(uarray($a), ['1'])), true
    test.equal  solve(andp(assign(a, $a), unify(uarray(a), ['1']), unify(a, 2))), false
    test.equal  solve(begin(assign(a, $a), orp2(andp(unify(uarray(a), ['1']), unify(a, 2)), unify(a, 2)))), true
    test.done()

