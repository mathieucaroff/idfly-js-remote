
import simpleClass from './simpleClass';

/**
 * LimitRate
 * 
 * Given a function, prevent it being executed too often by delaying
 * such executions. Some executions may be skipped. At the time the
 * function can be executed again, the argument from the last execution
 * request will be used.
 * 
 * Use `.execute()` to call the rate-limited function.
 * The other public methods are `.force()` and `.cancel()`, to force a
 * (managed) early execution or to cancel any scheduled execution.
 * 
 * `hot` means that the function was recently executed and should not be
 * executed again too soon.
 * `pending` means that the function is hot and another call has been
 * delayed.
 * `timeout` is the timeout id for cancellation in case a call to `force` occures
 * 
 * `_this` will be the `this` in the function.
 * `__args__` will be passed to the function.
 */
let LimitRate = simpleClass(
    "ms, func, this, condition".split(", "),
    undefined,
    (me) => {
        me._condition = (_ => true);

        me.__hot__ = false;
        me.__pending__ = false;
        me.__timeout__ = null;

        me.__args__ = [];
    },
);

// Constructions {{{
LimitRate.prototype.__call = function () {
    this.__pending__ = false;
    if (this.condition) { // /!\ It should probably be `this.condition()`
        var result = this._func.apply(this._this, this.__args__);
        this.__hot__ = true;
        clearTimeout(this.__timeout__);
        this.__timeout__ = setTimeout(_ => this.__ready(), this._ms);
    }
    return result;
};

/**
 * Ready
 * Executed when the cooling period finishes.
 */
LimitRate.prototype.__ready = function () {
    this.__hot__ = false;
    if (this.__pending__) {
        this.__call()
    }
};
// }}}

// Public methods {{{
/**
 * If the limiter is cold, execute the function right away and heat the
 * limiter. If the limiter is hot and no execution is pending
 */
LimitRate.prototype.execute = function (...args) {
    this.__args__ = args;
    this.__pending__ = true;
    if (!this.__hot__) {
        this.__call();
    }
};

/**
 * Execute the function with the given arguments right away, whenever
 * the limiter was cold, hot but not pending or hot and pending.
 * Leaves the limiter hot but not pending.
 * will be delayed.
 */
LimitRate.prototype.force = function (...args) {
    this.__args__ = args;
    return this.__call();
};

/**
 * Cancel the pending call.
 * 
 * If no call is pending, do nothing.
 */
LimitRate.prototype.cancel = function () {
    this.__pending__ = false;
    this.__args__ = [];
};
// }}}

export default LimitRate;