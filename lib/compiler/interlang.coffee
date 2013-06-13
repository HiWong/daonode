_ = require("underscore")
{Env, solve} = core = require("./core")

il = exports

exports.NotImplement = class NotImplement extends Error
  constructor: (@exp, @message='', @stack = @) ->  # @stack: to make webstorm nodeunit happy.
  toString: () -> "#{@name} >>> #{@message}"

toString = (o) -> o?.toString?() or o

class Element
  constructor: () ->  @name = @toString()
  isStatement: () -> false
  call: (args...) -> new Apply(@, args)
  toCode: (compiler) -> throw new  NotImplement(@)
  Object.defineProperty @::, '$', get: -> @constructor

class Var extends Element
  constructor: (@name) ->
  toString: () -> @name
  apply: (args) -> il.apply(@, args)
class Assign extends Element
  constructor: (@left, @exp) -> super
  toString: () -> "#{toString(@left)} = #{toString(@exp)}"
class Return extends Element
  constructor: (@value) -> super
  toString: () -> "return(#{toString(@value)})"
class Begin extends Element
  constructor: (@exps) -> super
  toString: () -> "begin(#{(toString(e) for e in @exps).join(',')})"
class Array extends Begin
  toString: () -> "[#{(toString(e) for e in @exps).join(',')}]"
class Print extends Begin
  toString: () -> "print(#{(toString(e) for e in @exps).join(',')})"
class Lamda extends Element
  constructor: (@params, @body) -> super
  toString: () -> "(#{(toString(e) for e in @params).join(', ')} -> #{toString(@body)})"
  call: (args...) -> il.apply(@, args)
  apply: (args) -> il.apply(@, args)
class Clamda extends Element
  constructor: (@v, @body) -> @name = @toString()
  toString: () -> "(#{toString(@v)} -> #{toString(@body)})"
  call: (value) -> il.capply(@, value)
class JSFun extends Element
  constructor: (@fun) -> super
  toString: () -> "jsfun(#{@fun})"
  apply: (args) -> il.apply(@, args)
exports.VirtualOperation = class VirtualOperation extends Element
  constructor: (@name) -> super
  toString: () -> "#{@name}"
  call: (args...) -> new VirtualOperationApply(@, args)
  apply: (args) -> new VirtualOperationApply(@, args)
class BinaryOperation extends VirtualOperation
  constructor: (@symbol) -> super
  toString: () -> "binary(#{@symbol})"
  call: (args...) -> new BinaryOperationApply(@, args)
  apply: (args) -> new BinaryOperationApply(@, args)
  _sideEffect: false
class UnaryOperation extends BinaryOperation
  toString: () -> "unary(#{@symbol})"
  call: (args...) -> new UnaryOperationApply(@, args)
  apply: (args) -> new UnaryOperationApply(@, args)
  _sideEffect: false
class Fun extends Element
  constructor: (@func) -> super
  toString: () -> "fun(#{@func})"
  apply: (args) -> new Apply(@, args)
class Apply extends Element
  constructor: (@caller, @args) -> super
  toString: () -> "(#{toString(@caller)})(#{(toString(arg) for arg in @args).join(', ')})"
class VirtualOperationApply extends Apply
  toString: () -> "vop(#{toString(@caller)})(#{(toString(arg) for arg in @args).join(', ')})"
class BinaryOperationApply extends Apply
  toString: () -> "#{toString(@args[0])}#{toString(@caller.symbol)}#{toString(@args[1])}"
class VirtualOperationApply extends Apply
  toString: () -> "#{toString(@args[0])}#{toString(@caller.symbol)}#{toString(@args[1])}"
class UnaryOperationApply extends Apply
  toString: () -> "#{toString(@caller.symbol)}#{toString(@args[0])}"
class CApply extends Apply
  constructor: (@cont, @value) -> @name = @toString()
  toString: () -> "#{toString(@cont)}(#{toString(@value)})"
class Deref extends Element
  constructor: (@exp) -> super
  toString: () -> "deref(#{toString(@exp)})"
class Code extends Element
  constructor: (@string) -> super
  toString: () -> "code(#{@string})"
class If extends Element
  constructor: (@test, @then_, @else_) -> super
  toString: () -> "if_(#{toString(@test)}, #{toString(@then_)}, #{toString(@else_)})"

optimize = (exp, env, compiler) ->
  exp_optimize = exp?.optimize
  if exp_optimize then exp_optimize.call(exp, env, compiler)
  else 1

Var::optimize = (env, compiler) -> env.lookup(@)
Assign::optimize = (env, compiler) ->  new Assign(compiler.optimize(@left, env),  compiler.optimize(@exp, env))
If::optimize = (env, compiler) ->
  test = optimize(@test, env, compiler)
  test_bool = boolize(test)
  if test_bool is true
    then_ = optimize(@then_, env, compiler)
    if then_ instanceof If and then_.test is test # (if a (if a b c) d)
      then_ = then_.then_
    then_
  else if test_bool is false
    else_ = optimize(@else_, env, compiler)
    if else_ instanceof If and else_.test is test # (if a b (if a c d))
      else_ = else_.else_
    else_
  else
    then_= optimize(@then_, env, compiler)
    else_ = optimize(@else_, env, compiler)
    if then_ instanceof If and then_.test is test # (if a (if a b c) d)
      then_ = then_.then_
    if else_ instanceof If and else_.test is test # (if a b (if a c d))
      else_ = else_.else_
    new If(test, then_, else_)

Return::optimize = (env, compiler) -> new Return(compiler.optimize(@value, env))
Lamda::optimize = (env, compiler) ->
  result = new Lamda(@params, compiler.optimize(@body, env))
  result.refMap = {}
  result.analyze(compiler,  result.refMap)
  return result
Clamda::optimize = (env, compiler) ->
  result = new Clamda(@v, compiler.optimize(@body, env.extend(@v, @v)))
  result.refMap = {}
  result.analyze(compiler,  result.refMap)
  return result

Apply::optimize = (env, compiler) ->
  caller =  compiler.optimize(@caller, env)
  args = (compiler.optimize(a, env) for a in @args)
  if caller instanceof JSFun
    cont  = args[0]
    args = args[1...]
    cont.call(caller.fun.apply(args)).optimize(env, compiler)
  else if caller instanceof Lamda
    params = caller.params
    body = caller.body
    paramsLength = params.length
    if paramsLength is 0 then return compiler.optimize(body, env)
    newParams = []; newArgs = []; bindings = {}
    refMap = caller.refMap
    for p, i in params
      arg = args[i]
      if sideEffect(arg)
        newParams.push[p]
        newArgs.push(arg)
        continue
      else
        refCount = refMap[p]
        switch refCount
          when 1 then bindings[p] = arg
          else
            if codeSize(arg)*refCount>MAX_EXTEND_CODE_SIZE
              newParams.push(p)
              newArgs.push(arg)
            else bindings[p] = arg
    if newParams.length isnt 0
      if not isEmpty(bindings) then env = env.extendBindings(bindings)
      new Apply(new Lamda(newParams, compiler.optimize(body, env)), newArgs)
    else
      if bindings then compiler.optimize(body, env.extendBindings(bindings))
      else  compiler.optimize(body, env)
  else if caller instanceof Clamda
    CApply::optimize.call(new CApply(caller, args[0]), env, compiler)
  else
    new @constructor(caller, args)

CApply::optimize = (env, compiler) ->
  cont = @cont; body = cont.body; v = cont.v; value = compiler.optimize(@value, env)
  count = cont.refMap[v]
  if sideEffect(value)
    switch count
      when 0 then il.begin(value, compiler.optimize(body, env))
      when 1
        compiler.optimize(body, env.extend(v, compiler.optimize(value, env)))
      else il.begin(il.assign(v, value), compiler.optimize(body, env))
  else compiler.optimize(body, env.extend(v, value))
Begin::optimize = (env, compiler) ->
  return new @constructor(compiler.optimize(exp, env) for exp in @exps)
Deref::optimize = (env, compiler) ->
  if _.isString(@exp) then exp
  else if _.isNumber(@exp) then exp
  else @
Code::optimize = (env, compiler) -> @
JSFun::optimize = (env, compiler) -> new JSFun(compiler.optimize(@fun, env))

MAX_EXTEND_CODE_SIZE = 10

hasOwnProperty = Object::hasOwnProperty
isEmpty = (obj) ->
  for key of obj  then if hasOwnProperty.call(obj, key) then return false
  return true

analyze = (exp, compiler, refMap) ->
  exp_analyze = exp?.analyze
  if exp_analyze then exp_analyze.call(exp, compiler, refMap)

Var::analyze = (compiler, refMap) ->
  if hasOwnProperty.call(refMap, @) then refMap[@]++ else refMap[@] = 1

Assign::analyze = (compiler, refMap) -> analyze(@exp, compiler, refMap)
If::analyze = (compiler, refMap) ->
  analyze(@test, compiler, refMap) + analyze(@then_, compiler, refMap) + analyze(@else_, compiler, refMap)
Begin::analyze = (compiler, refMap) -> analyze(e, compiler, refMap) for e in @exps
Apply::analyze = (compiler, refMap) ->
  analyze(@caller, compiler, refMap); analyze(e, compiler, refMap) for e in @args
CApply::analyze = (compiler, refMap) ->  analyze(@cont, compiler, refMap); analyze(@value, compiler, refMap)
Lamda::analyze = (compiler, refMap) ->
  childMap = @refMap = {}
  analyze(@body, compiler, childMap)
  for x, i of childMap
    if x not in @params
      if hasOwnProperty.call(refMap, x) then refMap[x] += i else refMap[x] = i
Clamda::analyze = (compiler, refMap) ->
  childMap = @refMap = {}
  analyze(@body, compiler, childMap)
  for x, i of childMap
    if x.name!=@v.name
      if hasOwnProperty.call(refMap, x) then refMap[x] += i else refMap[x] = i

codeSize = (exp) ->
  exp_codeSize = exp?.codeSize
  if exp_codeSize then exp_codeSize.call(exp)
  else 1

Var::codeSize = () -> 1
Return::codeSize = () -> codeSize(@value)+1
If::codeSize = () -> sideEffeft(@test) + codeSize(@then_) + codeSize(@else_) + 1
Begin::codeSize = () -> _.reduce(@exps, ((memo, e) -> memo + codeSize(e)), 0)
VirtualOperation::codeSize = () -> 1
Lamda::codeSize = () -> codeSize(@body) + 2
Clamda::codeSize = () -> codeSize(@body) + 1
Apply::codeSize = () -> _.reduce(@args, ((memo, e) -> memo + codeSize(e)), codeSize(@caller))
CApply::codeSize = () -> codeSize(@cont.body) + codeSize(@value) + 2

sideEffect = (exp) ->
  exp_sideEffect = exp?.sideEffect
  if exp_sideEffect then exp_sideEffect.call(exp)
  else if _.isNumber(exp) then false
  else if _.isString(exp) then false
  else if _.isArray(exp) then false
  else true

hasSideEffect = (exp) -> exp._sideEffect = true; exp
noSideEffect = (exp) -> exp._sideEffect = false; exp

Var::sideEffect = () -> false
Return::sideEffect = () -> sideEffect(@value)
If::sideEffect = () -> sideEffeft(@test) or sideEffect(@then_) or sideEffect(@else_)
Begin::sideEffect = () -> _.reduce(@exps, ((memo, e) -> memo or sideEffect(e)), false)
VirtualOperation::sideEffect = () -> @_sideEffects? or true
BinaryOperation::sideEffect = () -> @_sideEffects? or false
UnaryOperation::sideEffect = () -> @_sideEffects? or false
Lamda::sideEffect = () -> false
Clamda::sideEffect = () -> false
Apply::sideEffect = () ->
  caller = @caller
  if caller instanceof Lamda and sideEffeft(caller.body) then return true
  if caller instanceof Clamda and sideEffeft(caller.body) then return true
  if caller instanceof Var then return true
  if sideEffect(caller) then return true
  for a in @args then if sideEffect(a) then return true
  return false
CApply::sideEffect = () -> sideEffeft(@cont.body) or sideEffect(@value)

jsify = (exp) ->
  exp_jsify = exp?.jsify
  if exp_jsify then exp_jsify.call(exp)
  else exp

Assign::jsify = () -> new Assign(@left, jsify(@exp))
If::jsify = () -> new If(@test, jsify(@then_), jsify(@else_))
Begin::jsify = () ->
  exps = @exps
  length = exps.length
  if length is 0 or length is 1
    throw new  Error "begin should have at least one exp"
  result = []
  for e in exps
    result.push(jsify(e))
  new Begin(result)
Lamda::jsify = () ->
  body = jsify(@body)
  body = insertReturn(body)
  new Lamda(@params, body)
Clamda::jsify = () ->
  body = jsify(@body)
  body = insertReturn(body)
  new Clamda(@v, body)
Apply::jsify = () ->
  args = @args
  if args.length>0 then args = [jsify(args[0])].concat(args[1...])
  new @constructor(jsify(@caller), args)
CApply::jsify = () -> new CApply(@cont.jsify(), jsify(@value))

insertReturn = (exp) ->
  exp_insertReturn = exp?.insertReturn
  if exp_insertReturn then exp_insertReturn.call(exp)
  else new Return(exp)

Assign::insertReturn = () -> il.begin(@, il.return(@left))
Return::insertReturn = () -> @
If::insertReturn = () -> new If(@test, insertReturn(@then_), insertReturn(@else_))
Begin::insertReturn = () ->
  exps = @exps
  length = exps.length
  exps[length-1] = insertReturn(exps[length-1])
  il.begin(exps...)

Lamda::toCode = (compiler) -> "function(#{(a.name for a in @params).join(', ')}){#{compiler.toCode(@body)}}"
Clamda::toCode = (compiler) -> "function(#{@v.name}){#{compiler.toCode(@body)}}"
Fun::toCode = (compiler) -> @func.toString()
Return::toCode = (compiler) -> "return #{compiler.toCode(@value)};"
Var::toCode = (compiler) -> @name
Assign::toCode = (compiler) -> "#{compiler.toCode(@left)} = #{compiler.toCode(@exp)}"
If::toCode = (compiler) ->
  "if (#{compiler.toCode(@test)}) #{compiler.toCode(@then_)} else #{compiler.toCode(@else_)};"
Apply::toCode = (compiler) ->
  "(#{compiler.toCode(@caller)})(#{(compiler.toCode(arg) for arg in @args).join(', ')})"
BinaryOperationApply::toCode = (compiler) ->
  "#{compiler.toCode(@args[0])}#{compiler.toCode(@caller.symbol)}#{compiler.toCode(@args[1])}"
UnaryOperationApply::toCode = (compiler) ->
  "#{compiler.toCode(@caller.symbol)}#{compiler.toCode(@args[0])}"
VirtualOperationApply::toCode = (compiler) -> @caller.applyToCode(compiler, @args)
CApply::toCode = (compiler) -> "(#{compiler.toCode(@cont)})(#{compiler.toCode(@value)})"
Begin::toCode = (compiler) -> (compiler.toCode(exp) for exp in @exps).join("; ")
Array::toCode = (compiler) ->  "[#{(compiler.toCode(exp) for exp in @exps).join(', ')}]"
Print::toCode = (compiler) ->  "console.log(#{(compiler.toCode(exp) for exp in @exps).join(', ')})"
Deref::toCode = (compiler) ->  "solver.trail.deref(#{compiler.toCode(@exp)})"
Code::toCode = (compiler) ->  @string
JSFun::toCode = (compiler) ->  "function() {\n"+\
                               " var args, cont;\n "+\
                               "  cont = arguments[0], args = 2 <= arguments.length ? [].slice.call(arguments, 1) : [];\n"+\
                               "   return cont(#{@fun}.apply(this, args));"+\
                               "   }"
BinaryOperationApply::toCode = (compiler) ->  "(#{compiler.toCode(@args[0])})#{@caller.symbol}(#{compiler.toCode(@args[1])})"
UnaryOperationApply::toCode = (compiler) ->  "#{@caller.symbol}(#{compiler.toCode(@args[0])})"

isStatement = (exp) ->
  exp_isStatement = exp?.isStatement
  if exp_isStatement then exp_isStatement.call(exp)
  else false

If::isStatement = () -> isStatement(@then_) or isStatement(@else_)
Begin::isStatement = () -> true
Return::isStatement = () -> true
Assign::isStatement = () -> true

il.vari = (name) -> new Var(name)
il.assign = (left, exp) -> new Assign(left, exp)
il.if_ = (test, then_, else_) -> new If(test, then_, else_)
il.deref = (exp) -> new Deref(exp)
il.apply = (caller, args) -> new Apply(caller, args)
il.capply = (cont, value) -> new CApply(cont, value)
il.begin = (exps...) ->
  length = exps.length
  if length is 0 then throw new Error "begin should have at least one exp"
  if length is 1 then return exps[0]
  result = []
  for e in exps
    if e instanceof Begin then result = result.concat(e.exps)
    else result.push e
  new Begin(result)
il.array = (exps...) -> new Array(exps)
il.print = (exps...) -> new Print(exps)
il.return = (value) -> new Return(value)
il.lamda = (params, body...) -> new Lamda(params, il.begin(body...))
il.clamda = (v, body...) -> new Clamda(v, il.begin(body...))
il.code = (string) -> new Code(string)
il.jsfun = (fun) -> new JSFun(fun)

binary = (symbol) -> new BinaryOperation(symbol)
unary = (symbol) -> new UnaryOperation(symbol)

il.eq = binary("===")
il.ne = binary("!==")
il.lt = binary("<")
il.le = binary("<=")
il.gt = binary(">")
il.ge = binary(">=")

il.add = binary("+")
il.sub = binary("-")
il.mul = binary("*")
il.div = binary("/")
il.mod = binary("%")
il.and_ = binary("&&")
il.or_ = binary("||")
il.bitand = binary("&")
il.bitor = binary("|")
il.lshift = binary("<<")
il.rshift = binary(">>")

il.not_ = unary("!")
il.neg = unary("-")
il.bitnot = unary("~")
il.inc = hasSideEffect(unary("++"))
il.dec = hasSideEffect(unary("--"))

vop = (name, toCode) ->
  class Vop extends VirtualOperation
    applyToCode: toCode
    _sideEffect: true
  new Vop(name)

il.suffixinc = vop('suffixdec', (compiler, args)->"#{compiler.toCode(args[0])}++")
il.suffixdec = vop('suffixdec', (compiler, args)->"#{compiler.toCode(args[0])}--")
il.pushCatch = vop('pushCatch', (compiler, args)->"solver.pushCatch(#{compiler.toCode(args[0])}, #{compiler.toCode(args[1])})")
il.popCatch = vop('popCatch', (compiler, args)->"solver.popCatch(#{compiler.toCode(args[0])})")
il.findCatch = noSideEffect(vop('findCatch', (compiler, args)->"solver.findCatch(#{compiler.toCode(args[0])})"))
il.fake = vop('fake', (compiler, args)->"solver.fake(#{compiler.toCode(args[0])})").apply([])
il.restore = vop('restore', (compiler, args)->"solver.restore(#{compiler.toCode(args[0])})")
il.getvalue = noSideEffect(vop('getvalue', (compiler, args)->"solver.trail.getvalue(#{compiler.toCode(args[0])})"))
il.list = noSideEffect(vop('list', (compiler, args)->"[#{(compiler.toCode(a) for a in args).join(', ')}]"))
il.index = noSideEffect(vop('index', (compiler, args)->"(#{compiler.toCode(args[0])})[#{compiler.toCode(args[1])}]"))
il.push = vop('push', (compiler, args)->"(#{compiler.toCode(args[0])}).push(#{compiler.toCode(args[1])})")
il.concat = vop('concat', (compiler, args)->"(#{compiler.toCode(args[0])}).concat(#{compiler.toCode(args[1])})")
il.run = vop('run', (compiler, args)->"solver.run(#{compiler.toCode(args[0])}, #{compiler.toCode(args[1])})")
il.failcont = vop('failcont', (compiler, args)->"solver.failcont(#{compiler.toCode(args[0])})")

il.evalexpr = vop('evalexpr', (compiler, args)->"solve(#{compiler.toCode(args[0])}, #{compiler.toCode(args[1])})")

il.fun = (f) -> new Fun(f)
