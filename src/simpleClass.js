import {ValueError} from "./error";

/**
 * `simpleClass` creates a class with the given properties.
 * @param {Array<Strings>} properties The names of the properties of the class
 * 
 * Example:
 *  {{{js
 *  // Generate the class
 *  let Palette = simpleClass("owner color".split(" "));
 * 
 *  // The properties are accessible at `instance._${propertyName}`.
 *  Palette.prototype.show = function () {
 *      this.simpleCheckProperties();
 *      console.log(`Palette <Owner: ${this._owner}, Color: ${this._color}>`);
 *  };
 * 
 *  // You can pass the propertie values in the constructor
 *  pal_b = new Palette("Ary", "blue")
 * 
 *  // You can derive a new instance with a property modified
 *  pal_r = pal_b.color("red")
 * 
 *  // Since a new instance was created, the previous wasn't modified:
 * pal_b.show()
 * > Palette <Owner: Ary, Color: blue>`);
 * pal_r.show()
 * > Palette <Owner: Ary, Color: red>`);
 * 
 *  // Initializing all the parameters isn't necessary. Ommited values will be
 *  // undefined.
 *  pal = new Palette()
 *  pal._owner
 *  > undefined
 *  pal._color
 *  > undefined
 *  pal_Brice_c = pal.owner("Brice").color("cyan")
 * 
 *  simpleClass includes a methode clone()
 *  pal_Brice_m = pal_Brice_c.clone()
 *  pal_Brice_m._color = "magenta"
 * 
 *  // When adding methods to the class, you can call .simpleCheckProperties() at the
 *  // beginning of the methode, to ensure no property is undefined. An
 *  // undefined value will cause an exception to be thrown.
 * 
 *  Palette.prototype.draw = function () {
 *      this.simpleCheckProperties();
 *      console.log(`Drawing with color ${this._color} using the palette of ${this._owner}`);
 *  };
 *  }}}
 */

/* function parametres CHNGD 2018-10-08 */ 
let simpleClass = (properties, parentClass=undefined, init=undefined) => {
    function Class (...args) {
        if (!(this instanceof Class)) {
            return new Class(...args);
        }
        if (parentClass) {
            this.prototype = new parentClass();
        }
        if (init) {
            init(this);
        }
        let pl = properties.length;
        let al = args.length;
        let i;
        for (i = 0; i < pl && i < al; i++) {
            let prop = properties[i];
            this[`_${prop}`] = args[i];
        }
    }

    if (parentClass) {
        Class.prototype = new parentClass();
    }
    let p = Class.prototype;

    Class.__properties__ = p.__properties__ = properties.slice();

    Class.from = p.from = (initObject) => {
        let args = [];
        for (let prop of this.__properties__) {
            let val = initObject[prop];
            args.push(val);
        }
        let that = new Class(...args);
        return that;
    };

    // Since properties can be missing during construction
    p.simpleCheckProperties = function () {
        for (let prop of this.__properties__) {
            let val = this[`_${prop}`];
            let type = typeof(val);
            if (val === undefined) {
                throw new ValueError(`this.${prop} (${val}(${type})) unexpected [erid93275]`);
            }
        }
    };

    // A clone methode using the given properties
    p.clone = function () {
        let args = [];
        for (let prop of this.__properties__) {
            let val = this[`_${prop}`];
            args.push(val);
        }
        let that = new Class(...args);
        return that;
    };

    p.equal = function (other) {
        let eq = true;
        for (let prop of this.__properties__) {
            eq = this[`_${prop}`] === other[`_${prop}`];
            if (!eq) {
                break;
            }
        }
        return eq;
    };

    // Define all the setter methodes of the fluentInterface
    for (let prop of properties) {
        let prop_setter = function (val) {
            let that = this.clone();
            that[`_${prop}`] = val;
            return that;
        };
        p[prop] = prop_setter;
        Class[prop] = function (...args) {
            return prop_setter.call(new Class(), ...args);
        }
    }

    return Class;
};

export default simpleClass;