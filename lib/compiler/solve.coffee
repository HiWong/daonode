_ = require('underscore')

# ####class Solver
# the solver for dao expression
class exports.Solver
  constructor: () ->
    @state
    # @trail is used to restore varibale's binding for backtracking multiple logic choices
    @trail=new Trail
    #@catches is used for lisp style catch/throw
    @catches = {}
    @purememo = {}
    @memo = {}
    @finished = false
    solver =  @
    @faildone = (value) ->
      solver.finished = true
      exports.status = exports.FAIL
      [null, value]
    @failcont = @faildone
    # @cutCont is used for cut like in prolog.
    @cutCont = @failcont

  # in callcc, callfc, callcs, the solver is needed to be faked and restored(save all of content in an object.
  fake: () ->
    result = {}
    state = @state
    if state? then state = state.slice?(0) or state.copy?() or state.clone?() or state
    result.state = state
    result.trail = @trail.copy()
    result.catches = _.extend({}, @catches)
    result.exits = _.extend({}, @exits)
    result.continues = _.extend({}, @continues)
    result.purememo = _.extend({}, @purememo)
    result.memo = _.extend({}, @memo)
    result.done = @done
    result.faildone = @faildone
    result.failcont = @failcont
    result.cutCont = @cutCont
    return result

  restore: (faked) ->
    @state = faked.state
    @trail = faked.trail
    @catches = faked.catches
    @exits = faked.exits
    @continues = faked.continues
    @purememo = faked.purememo
    @memo = faked.memo
    @done = faked.done
    @faildone = faked.faildone
    @failcont = faked.failcont
    @cutCont = faked.cutCont
    @finished = false

  solveCompiled: (module) ->
    module.solver = @
    value = @run(module.main)[1]
    @.trail.getvalue(value)

  # run the trampoline from cont until @finished is true.
  run: (cont, value) ->
    while not @finished
      [cont, value] = cont(value)
    [cont, value]

  # used by lisp style quasiquote, unquote, unquoteSlice
  quasiquote: (exp, cont) -> exp?.quasiquote?(@, cont) or ((v) -> cont(exp))

  # an utility that is useful for some logic builtins<br/>
  # when backtracking, execute fun at first, and then go to original failcont
  appendFailcont: (fun) ->
    trail = @trail
    @trail = new Trail
    state = @state
    fc = @failcont
    @failcont = (v) ->
      @trail.undo()
      @trail = trail
      @state = state
      @failcont = fc;
      fun(v)

  # pushCatch/popCatch/findCatch: utlities for lisp style catch/throw
  pushCatch: (value, cont) ->
    catches = @catches[value] ?= []
    catches.push(cont)

  popCatch: (value) -> catches = @catches[value]; catches.pop(); if catches.length is 0 then delete @catches[value]

  findCatch: (value) ->
    catches = @catches[value]
    if not catches? or catches.length is 0 then throw new NotCatched
    catches[catches.length-1]

# record the trail for variable binding <br/>
#  when multiple choices exist, a new Trail for current branch is constructored, <br/>
#  when backtracking, undo the trail to restore the previous variable binding
# todo: when variable is new constrctored in current branch, it could not be recorded.
Trail = class exports.Trail
  constructor: (@data={}) ->
  copy: () -> new Trail(_.extend({},@data))
  set: (vari, value) ->
    data = @data
    if not data.hasOwnProperty(vari.name)
      data[vari.name] = [vari, value]

  undo: () -> for nam, pair of  @data
    vari = pair[0]
    value = pair[1]
    vari.binding = value

  deref: (x) -> x?.deref?(@) or x
  getvalue: (x, memo={}) ->
    getvalue =  x?.getvalue
    if getvalue then getvalue.call(x, @, memo)
    else x
  unify: (x, y) ->
    x = @deref(x); y = @deref(y)
    if x instanceof Var then @set(x, x.binding); x.binding = y; true;
    else if y instanceof Var then @set(y, y.binding); y.binding = x; true;
    else x?.unify?(y, @) or y?.unify?(x, @) or (x is y)

# ####class Var
# Var for logic bindings, used in unify, lisp.assign, inc/dec, parser operation, etc.
Var = class exports.Var
  constructor: (@name, @binding = @) ->
  deref: (trail) ->
    v = @
    next = @binding
    if next is @ or next not instanceof Var then next
    else
      chains = [v]
      length = 1
      while 1
        chains.push(next)
        v = next; next = v.binding
        length++
        if next is v
          for i in [0...chains.length-2]
            x = chains[i]
            x.binding = next
            trail.set(x, chains[i+1])
          return next
        else if next not instanceof Var
          for i in [0...chains.length-1]
            x = chains[i]
            x.binding = next
            trail.set(x, chains[i+1])
          return next

  bind: (value, trail) ->
    trail.set(@, @binding)
    @binding = trail.deref(value)

  getvalue: (trail, memo={}) ->
    name = @name
    if memo.hasOwnProperty(name) then return memo[name]
    result = @deref(trail)
    if result instanceof Var
      memo[name] = result
      result
    else
      result = trail.getvalue(result, memo)
      memo[name] = result
      result

  cont: (solver, cont) -> (v) => cont(@deref(solver.trail))

  # nottodo: variable's applyCont:: canceled. lisp1 should be good.

  toString:() -> "vari(#{@name})"

reElements = /\s*,\s*|\s+/

# utilities for new variables
# sometiems, say in macro, we need unique var to avoid name conflict
nameToIndexMap = {}
exports.vari = (name) ->
  index = nameToIndexMap[name] or 1
  nameToIndexMap[name] = index+1
  new Var(name+index)

exports.vars = (names) -> vari(name) for name in split names,  reElements

# DummyVar never fail when it unify. see tests on any/some/times in test_parser for examples
exports.DummyVar = class DummyVar extends Var
  constructor: (name) -> @name = '_$'+name
  cont:(solver, cont) -> (v) => cont(@binding)
  deref: (trail) -> @
  getvalue: (trail, memo={}) ->
    name = @name
    if memo.hasOwnProperty(name) then return memo[name]
    result = @binding
    if result is @
      memo[name] = result
      result
    else
      result = trail.getvalue(result, memo)
      memo[name] = result
      result

# nottodo: variable's applyCont:: canceled. lisp1 should be good.
exports.dummy = dummy = (name) ->
  index = nameToIndexMap[name] or 1
  nameToIndexMap[name] = index+1
  new exports.DummyVar(name+index)
exports.dummies = (names) -> new dummy(name) for name in split names,  reElements

# A flag class is used to process unquoteSlice
UnquoteSliceValue = class exports.UnquoteSliceValue
  constructor: (@value) ->

# #### class Command
# dao command that can be applied <br/>
#  Special, Fun, Macro, Proc is subclass of Command.
Command = class exports.Command
  @directRun = false
  constructor: (@fun, @name, @arity) ->
    @callable = (args...) =>
      applied = new exports.Apply(@, args)
      if Command.directRun
        solver = Command.globalSolver
        result = solver.solve(applied)
        solver.finished = false
        result
      else applied
    @callable.arity = @arity

  register: (exports) -> exports[@name] = @callable
  toString: () -> @name

exports.UObject = class UObject
  constructor: (@data) ->

  getvalue: (trail, memo) ->
    result = {}
    changed = false
    for key, value of @data
      v = trail.getvalue(value, memo)
      if v isnt value then changed = true
      result[key] = v
    if changed then new UObject(result)
    else @

  unify: (y, trail) ->
    xdata = @data; ydata = y.data
    ykeys = Object.keys(y)
    for key of xdata
      index = ykeys.indexOf(key)
      if index==-1 then return false
      if not trail.unify(xdata[key], ydata[key]) then return false
      ykeys.splice(index, 1);
    if ykeys.length isnt 0 then return false
    true

# make unifable object
exports.uobject = (x) -> new UObject(x)

exports.UArray = class UArray
  constructor: (@data) ->

  getvalue: (trail, memo={}) ->
    result = []
    changed = false
    for x in @data
      v = trail.getvalue(x, memo)
      if v isnt x then changed = true
      result.push(v)
    if changed then new UArray(result)
    else @

  unify: (y, trail) ->
    xdata = @data; ydata = y.data
    length = @length
    if length!=y.length then return false
    for i in [0...length]
      if not trail.unify(xdata[i], ydata[i]) then return false
    true

  toString: () -> @data.toString()

# make unifable array
exports.uarray = uarray = (x) -> new UArray(x)

exports.Cons = class Cons
  constructor: (@head, @tail) ->

  getvalue: (trail, memo={}) ->
    head = @head; tail = @tail
    head1  = trail.getvalue(head, memo)
    tail1  = trail.getvalue(tail, memo)
    if head1 is head and tail1 is tail then @
    else new Cons(head1, tail1)

  unify: (y, trail) ->
    if y not instanceof Cons then false
    else if not trail.unify(@head, y.head) then false
    else trail.unify(@tail, y.tail)

  flatString: () ->
    result = "#{@head}"
    tail = @tail
    if tail is null then null
    else if tail instanceof Cons
      result += ','
      result += tail.flatString()
    else result += tail.toString()
    result

  toString: () -> "cons(#{@head}, #{@tail})"

# cons, like pair in lisp
exports.cons = (x, y) -> new Cons(x, y)

# conslist, like list in lisp
exports.conslist = (args...) ->
  result = null
  for i in [args.length-1..0] by -1
    result = new Cons([args[i], result])
  result

# make unifiable array or unifiable object
exports.unifiable = (x) ->
  if _.isArray(x) then new UArray(x)
  else if _.isObject(x) then new UObject(x)
  else x

exports.BindingError = class Error
  constructor: (@exp, @message='', @stack = @) ->  # @stack: to make webstorm nodeunit happy.
  toString: () -> "#{@constructor.name}: #{@exp} >>> #{@message}"

exports.TypeError = class TypeError extends Error

# solver's status is set to UNKNOWN when start to solve, <br/>
#  if solver successfully run to solver'last continuation, status is set SUCCESS,<br/>
#  else if solver run to solver's failcont, status is set to FAIL.
exports.SUCCESS = 1
exports.UNKNOWN = 0
exports.FAIL = -1
exports.status = exports.UNKNOWN
