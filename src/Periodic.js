import simpleClass from './simpleClass';

let Periodic = simpleClass(
    "ms, func, args, this, condition".split(", "),
    undefined,
    (that) => {
        that._condition = (_ => true);
    },
);

// Building blocks {{{
Periodic.prototype.__call = function () {
    this._func.apply(this._this, this._args);
};

Periodic.prototype.__stop = function () {
    clearTimeout(this._timeout);
    this._timeout = null;
};

Periodic.prototype.__setTimeout = function (func, ms) {
    this.__stop();
    this._timeout = setTimeout(func, ms);
};

Periodic.prototype.__setNext = function () {
    this.__setTimeout(this._ms);
};
// }}}

// Constructions {{{
Periodic.prototype.__run = function () {
    if (this._condition()) {
        this.__call();
        this.__setTimeout(_ => this.__run(), this._ms);
    }
};
// }}}

// Public methods {{{
Periodic.prototype.start = function (waitFirst=false) {
    this.__setTimeout(_ => this.__run(), waitFirst ? this._ms : 0);
};

Periodic.prototype.stop = Periodic.prototype.__stop;
// }}}


export default Periodic;