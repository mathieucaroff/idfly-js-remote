import crel from 'crel';
import {appendCss} from './util/futil';
import cssnormalize from './asset/cssnormalize';
import * as airship from './asset/airshipBlueprint';
import {Box} from './util/cutil';
import {limitRate} from './rateLimit';

var el = crel.proxy;

export default function () {
    var d = document;
    var baseTitle = d.title;

    appendCss(cssnormalize);
    appendCss(`
    .airship.blueprint {
        display: block;
        width: 100%;
        height: 100vh;
        margin: auto;
    }
    .airship.blueprint.hover {
        cursor: crosshair;
    }
    `);
    let img;
    el(d.body,
        img = el.img({
            class: "airship blueprint hover",
            src: airship.src,
            onmousedown: "return false"
        })
    );

    let w = DEBUG ? window : {};
    w.crel = crel;
    w.el = el;
    w.Box = Box;
    w.img = img;

    let gfpoi = function getFracionalPositionOnImage([posx, posy]) {
        let windowbox = new Box(0, 0, window.innerWidth, window.innerHeight);
        let imgBox = windowbox.fitBox(Box(0, 0, 1, 1));
        return imgBox.getFractionalPosition([posx, posy]);
    };

    img.addEventListener("mousedown", handleMouseDown);
    img.addEventListener("mouseup", handleMouseUp);
    img.addEventListener("mousemove", handleMouseMove);

    let __dragging = false;
    let __clickedZone = undefined;

    function handleMouseMove(ev) {
        w.ev = ev;
        let [fx, fy] = gfpoi([ev.clientX, ev.clientY]);
        let zone = airship.findZone([fx, fy]);
        let ztext = "";
        if (zone !== undefined) {
            img.classList.add("hover");
            ztext = `[${zone}]`;
        } else {
            img.classList.remove("hover");
        }
        let [ffx, ffy] = [fx, fy].map(fv => parseInt(1000 * fv));
        d.title =
            `${baseTitle}${ztext} (x: ${ffx}, y: ${ffy})`;
    };

    function handleMouseDown(ev) {
        w.ev = ev;
        let [fx, fy] = gfpoi([ev.clientX, ev.clientY]);
        let zone = airship.findZone([fx, fy]);
        if (zone === undefined) zone = "-";
        console.log(`[${zone}] (x: ${parseInt(1000 * fx)}, y: ${parseInt(1000 * fy)})`);
    };

    function handleMouseUp(ev) {
        w.ev = ev;
    };
};