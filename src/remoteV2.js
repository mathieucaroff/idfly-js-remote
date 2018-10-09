import crel from 'crel';
import Hammer from 'hammerjs';

import * as font from './asset/font';
import * as cssnormalize from './asset/cssnormalize';
import {appendCss, assemble, capitalized} from './util/futil';
import * as airship from './asset/airshipBlueprint';
import Motors from './Motors';
import Box from './util/Box';

var el = crel.proxy;

var w = DEBUG ? window : {};
var d = document;
var baseTitle = d.title;
var html = d.documentElement;

var motors;
var hammer;

export default function () {
    let css = appendCss(`
    ${font.cssHead}
    html {
        ${font.css}
        background-color: rgba(127, 63, 191, 0.3);
        font-size: x-large;
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
    let motorDl, svgContainer;
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
            }),
        ),
        svgContainer = el.div({
            class: "airship blueprint",
        })
    );

    motors = new Motors("forward, up, frontT, backT".split(", "), motorDl);
    motors.setCondition(_ => __clickedZone !== null);
    hammer = new Hammer.Manager(html);

    airship.fetchInto(svgContainer);

    w.d = d;
    w.crel = crel;
    w.el = el;
    w.Box = Box;
    w.svgContainer = svgContainer;
    w.motorDl = motorDl;
    w.Motors = Motors;
    w.motors = motors;
    w.airship = airship;

    // for (let evname in "mousedown mouseup mousemove touchstart touchend touchcancel touchmove".split(" ")) {
    //    html.addEventListener(evname, _ => console.log(evname), true);
    // }

    html.addEventListener("mousedown",   handleMouseDown, true);
    html.addEventListener("mouseup",     handleMouseUp,   true);
    html.addEventListener("mousemove",   handleMouseMove, true);


    html.addEventListener("touchstart",  handleMouseDown, {passive: false});
    html.addEventListener("touchend",    handleMouseUp,   {passive: false});
    html.addEventListener("touchcancel", handleMouseUp,   {passive: false});
    html.addEventListener("touchmove",   handleMouseMove, {passive: false});
};

/**
 * Compute image location inside the window, then compute the fractional
 * position of the given point inside (or outside) that image.
 */
function imgFractionalPos([posx, posy]) {
    let windowbox = Box(0, 0, window.innerWidth, window.innerHeight);
    let imgBox = windowbox.fitBox(Box(0, 0, 1, 1));
    return imgBox.getFractionalPosition([posx, posy]);
};

/*** Event handlers ***/

var __clickedZone = null;

function evCoordinate(ev) {
    let click;
    let clients = e => [e.clientX, e.clientY];
    if (ev.clientX !== undefined) {
        return clients(ev);
    } else {
        try {
            return clients(ev.touches[0]);
        } catch (e) {
            w.touches = ev.touches;
        }
    }
}

function updateHover(ev) {
    let hover;
    let [fx, fy] = imgFractionalPos([ev.clientX, ev.clientY]);
    if (__clickedZone) {
        let [ifx, ify] = __clickedZone.getFractionalPosition([fx, fy]);
        hover = Box(0, 0, 1, 1).contains([ifx, ify]);
    } else {
        hover = airship.findZone([fx, fy]) !== null;
    }

    if (hover) {
        html.classList.add("hover");
    } else {
        html.classList.remove("hover");
    }
}

function handleMouseMove(ev) {
    w.ev = ev;
    //--
    updateHover(ev);
    //--
    if (__clickedZone) {
        let [fx, fy] = imgFractionalPos(evCoordinate(ev));
        let [ifx, ify] = __clickedZone.getFractionalPosition([fx, fy]);

        // Handle motor speed
        const SENSITIVITY = 1.45;
        let mousePoint = [ifx, ify].map(w => SENSITIVITY * (2 * w - 1));
        
        let [ix, iy] = Box(-1, -1, 2, 2)
            .fitPoint(mousePoint)
            .map(iv => Math.round(Motors.POWER_VALUE * iv));
        let order = __clickedZone.motorSpeed([ix, iy]);
        motors.setSpeed(order);
        w.order = order;
    //--
        let ztext = `[${__clickedZone._id}]`;
        d.title =
            `${baseTitle}${ztext} (x: ${ix}, y: ${iy})`;
    } else {
        d.title = `${baseTitle}`;
    }
};

function handleMouseDown(ev) {
    w.ev = ev;
    //--
    ev.preventDefault();
    let [fx, fy] = imgFractionalPos(evCoordinate(ev));
    __clickedZone = airship.findZone([fx, fy]);
    if (__clickedZone) {
        __clickedZone._svg.style.fill = "#CCD6FF";
    }
    handleMouseMove(ev);
    //--
};

function handleMouseUp(ev) {
    w.ev = ev;
    if (__clickedZone) {
        __clickedZone._svg.style.fill = "#FFF";
    }
    w.__clickedZone = __clickedZone;
    __clickedZone = null;

    motors.stop();
};