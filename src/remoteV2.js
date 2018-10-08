import crel from 'crel';

import * as font from './asset/font';
import * as cssnormalize from './asset/cssnormalize';
import {appendCss, assemble, capitalized, justPostJSON} from './util/futil';
import * as airship from './asset/airshipBlueprint';
import Box from './util/Box';
import limitRate from './limitRate';

var el = crel.proxy;

const RATE_LIMIT = 250;

var w = DEBUG ? window : {};
var d = document;
var baseTitle = d.title;
var html = d.body.parentElement;

var motorNameArray = "forward, up, frontT, backT".split(", ");
var stoppedMotors = {};
motorNameArray.forEach(name => stoppedMotors[name] = 0);
var motorDl;

export default function () {
    let css = appendCss(`
    ${font.cssHead}
    html {
        ${font.css}
        background-color: rgba(127, 63, 191, 0.3);
    }
    .airship.blueprint > * {
        display: block;
        width: 100%;
        height: 100vh;
    }
    .hover {
        cursor: crosshair;
    }
    .info-container {
        position: absolute;
    }
    .info {
        margin: 0;
        padding: 0 .5em .4em 0;
        background-color: rgba(218, 199, 237, 0.9);
    }
    .info dt {
        font-weight: bold;
    }
    `);
    let svgContainer;
    el(d.body,
        css,
        el.link({
            rel: "stylesheet",
            href: cssnormalize.src,
        }),
        el.div({
                class: "info-container"
            },
            motorDl = el.dl({
                        class: "info",
                    },
                    ...assemble(4, _ => [el.dt(), el.dd()]),
            ),
        ),
        svgContainer = el.div({
            class: "airship blueprint hover",
        })
    );

    airship.fetchInto(svgContainer);

    w.crel = crel;
    w.el = el;
    w.Box = Box;
    w.svgContainer = svgContainer;
    w.motorDl = motorDl;
    w.airship = airship;
    w.stoppedMotors = stoppedMotors;

    writeMotorNames();
    writeMotorValues(stoppedMotors);
    writeMotorSentValues(stoppedMotors);
    setMotorSpeeds(stoppedMotors);

    html.addEventListener("mousedown", handleMouseDown);
    html.addEventListener("mouseup", handleMouseUp);
    html.addEventListener("mousemove", handleMouseMove);
};

/**
 * Write motor Names to the page
 * Usually called only once.
 */
function writeMotorNames () {
    for (let [i, name] of motorNameArray.entries()) {
        motorDl.children[2 * i].innerText = capitalized(name);
    }
}

/**
 * Given an object containing values to set to motores, write the values
 * to the page.
 */
function writeMotorValues (motors, prop="lastV") {
    for (let [i, name] of motorNameArray.entries()) {
        if (motors[name] !== undefined) {
                let dd = motorDl.children[2 * i + 1]
                dd[prop] = motors[name].toString();
                writeMotorDd(dd);
        }
    }
};

function writeMotorSentValues (motors) {
    writeMotorValues(motors, "sentV");
};

function writeMotorDd (dd) {
    dd.innerText = `${dd.lastV} (${dd.sentV})`;
}

/**
 * Public function to set motor speed.
 */
let setMotorSpeeds = limitRate(RATE_LIMIT)((motors) => {
    writeMotorSentValues(motors);
    sendMotorSpeeds(motors)
    .catch(console.warn)
    .then(_ => writeMotorValues(motors));
});

/**
 * Compute image location inside the window, then compute the fractional
 * position of the given point inside (or outside) that image.
 */
function imgFractionalPos([posx, posy]) {
    let windowbox = new Box(0, 0, window.innerWidth, window.innerHeight);
    let imgBox = windowbox.fitBox(Box(0, 0, 1, 1));
    return imgBox.getFractionalPosition([posx, posy]);
};

function sendMotorSpeeds(motors) {
    let json = JSON.stringify(motors);
    console.log(json);
    return justPostJSON(json);
}

/*** Event handlers ***/

var __clickedZone = null;

function handleMouseMove(ev) {
    w.ev = ev;
    //--
    let [fx, fy] = imgFractionalPos([ev.clientX, ev.clientY]);
    let hover;
    if (__clickedZone) {
        let [ifx, ify] = __clickedZone.getFractionalPosition([fx, fy])
        
        // Handle ".hover" class
        hover = Box(0, 0, 1, 1).contains([ifx, ify]);

        // Handle motor speed
        const SENSITIVITY = 1.45;
        let [ix, iy] = Box(-1, -1, 2, 2).fitPoint(
            [ifx, ify].map(w => 2 * w - 1).map(w => SENSITIVITY * w)
        ).map(iv => Math.round(100 * iv));
        let motors = __clickedZone.motorSpeed([ix, iy]);
        setMotorSpeeds(motors);
        w.motors = motors;
    //--
        let ztext = `[${__clickedZone._id}]`;
        d.title =
            `${baseTitle}${ztext} (x: ${ix}, y: ${iy})`;
    } else {
        hover = airship.findZone([fx, fy]) !== undefined;
        d.title = `${baseTitle}`;
    }
    if(hover) {
        html.classList.add("hover");
    } else {
        html.classList.remove("hover");
    }
};

function handleMouseDown(ev) {
    w.ev = ev;
    //--
    let [fx, fy] = imgFractionalPos([ev.clientX, ev.clientY]);
    __clickedZone = airship.findZone([fx, fy]);
    __clickedZone._svg.style.fill = "#CCD6FF";
    ev.preventDefault();
    handleMouseMove(ev);
    //--
};

function handleMouseUp(ev) {
    w.ev = ev;
    __clickedZone._svg.style.fill = "white";
    __clickedZone = null;
    handleMouseMove(ev);
    setMotorSpeeds(stoppedMotors);
};