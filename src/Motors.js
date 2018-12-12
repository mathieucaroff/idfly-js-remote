import crel from 'crel';

import simpleClass from './simpleClass';
import LimitRate from './LimitRate';
import Periodic from './Periodic';
import {justPostJSON} from './util/futil';

var el = crel.proxy;

const RATE_LIMIT = 250; // ms
const AUTO_RESEND_TIMING = 700; // ms
const POWER_VALUE = 100;

let AbstractMotors = simpleClass(
    "nameArray, motorDl".split(", "),
);

/**
 * Object to manage informations related to `marray`, the array of motors,
 * and to remotely command them.
 */
class Motors extends AbstractMotors {
    constructor(...args) {
        super(...args);

        // Init components
        this._periodic = Periodic(AUTO_RESEND_TIMING, justPostJSON);
        this._limitRate = LimitRate
            .ms(RATE_LIMIT)
            .func((...args) => this.__setSpeed(...args))
            .this(this)
        ;

        // Init methods
        /**
         * Public methods to set motor speed.
         */
        this.setSpeed = (...args) => this._limitRate.execute(...args);
        this.setSpeedNow = (...args) => this._limitRate.force(...args);

        // Init a property
        this._stopped = {};
        let stoppedMarray = [];
        for (let [i, name] of this._nameArray.entries()) {
            this._stopped[name] = 0;
            stoppedMarray.push([i, name, 0]);
            el(this._motorDl,
                el.dt(name),
                el.dd(),
            )
        }

        // Write to page and to server
        this.write(stoppedMarray);
        this.stop();
    }
    setCondition(c) {
        this._periodic._condition = c;
    }
    // .setSpeed = limitRate(__setSpeed) // See after class declaration
    __setSpeed(input) {
        let order = {};
        let marray = [];
        for (let [i, name] of this._nameArray.entries()) {
            if (input[name] !== undefined) {
                order[name] = input[name];
                marray.push([i, name, input[name]]);
            }
        }
        //
        this.writeSent(marray);
        let promise = this.__send(order)
            .catch(console.warn)
            .then(_ => this.write(marray));
        this.__keep(marray);
        return promise;
    }
    __send(order) {
        let json = JSON.stringify(order);
        return justPostJSON(json);
    }
    __keep(marray) {
        let order = {};
        for (let [i, name, val] of marray) {
            order[name] = null;
        }
        this._periodic._args = [JSON.stringify(order)];
        let waitFirst = true;
        this._periodic.start(waitFirst);
    }
    stop() {
        this.setSpeedNow(this._stopped).then(_ => {
            //this.setSpeedNow(this._stopped);
            //this._periodic.stop();
        }); // Not sure why it won't work properly without those two lines.
        // this._periodic.stop();
    }
    /**
     * Given an object containing values to set to motores, write the values
     * to the page.
     */
    write(marray, now=true, prop="lastV") {
        for (let [i, name, val] of marray) {
            let dd = this._motorDl.children[2 * i + 1];
            dd[prop] = val.toString();
            now && this.__writeDd(dd);
        }
    }
    writeSent(marray, now=true) {
        this.write(marray, now, "sentV");
    }
    __writeDd(dd) {
        dd.innerText = `${dd.lastV} (${dd.sentV})`;
    }
}

Motors.POWER_VALUE = POWER_VALUE;

export default Motors;