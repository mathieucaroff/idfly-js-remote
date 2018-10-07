/*** rateLimit.js - a rate limiter decorator ***/

let limitRate = (ms) => (func) => {
    let __last_args__;
    let __must_run__ = false;
    let __cooling__ = false;
    function rateLimitedFunc (...args) {
        __last_args__ = args;
        __must_run__ = true;
        if (!__cooling__) {
            finishCoolingAndRunIfNeeded()
        }
    }
    function finishCoolingAndRunIfNeeded() {
        __cooling__ = false;
        if (__must_run__) {
            func(__last_args__);
            __must_run__ = false;
            __cooling__ = true;
            setTimeout(finishCoolingAndRunIfNeeded, ms);
        }
    }
    return rateLimitedFunc;
}

export default limitRate;