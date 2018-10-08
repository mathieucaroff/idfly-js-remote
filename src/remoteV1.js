import crel from 'crel';

import {appendCss, capitalized, justPostJSON} from './util/futil';
import * as cssnormalize from './asset/cssnormalize';
import {gradientFCA1B, gradientECA} from './asset/colorGradient';

export default function () {

var BASIC_ACTIONS = "forward up".split(" "); // "forward down frontT backT"
var POWER_VALUES = [-100, 100];
var AUTO_RESEND_TIMING = 500; // ms
var TRANSFER = {
    title: "Transfer",
    nameA: "frontT", kA: 1,
    nameB: "backT", kB: 1};
var ROTATION = {
    title: "Rotate",
    nameA: "frontT", kA: 1,
    nameB: "backT", kB: -1};


var tbody = document.createElement("tbody");
// tbody.style.width = "100vw";
var buttonWidth  = `${(100 / POWER_VALUES.length).toFixed(2)}vw`;
var buttonHeight = `${(100 / (BASIC_ACTIONS.length + 2)).toFixed(2)}vh`;
// tbody.style.height = "100vh";
document.body.appendChild(tbody);

appendCss(`
body {
    overflow: hidden;
}

.commandButton {
    width: ${buttonWidth};
    height: ${buttonHeight};

    ${gradientFCA1B}
}

.commandButton.active {
    ${gradientECA}
}
`);

let link = document.createElement("link");
link.rel = "stylesheet";
link.href = cssnormalize.src;
document.body.appendChild(link);
crel(document.body,
    crel("link", {
        rel: "stylesheet",
        href: cssnormalize.src,
    })
);


function ifSpaceOrEnter(func) {
    function wrapper(ev) {
        let enterKeyCode = 13;
        let spaceKeyCode = 32;
        if (ev.keyCode === enterKeyCode || ev.keyCode === spaceKeyCode) {
            return func(ev);
        }
    }
    return wrapper;
}


function addButton(tr, text, activation, deactivation) {
    let td = document.createElement("td");
    let button = document.createElement("button");

    button.innerText = text
    button.addEventListener("mousedown", activation, true);
    button.addEventListener("mouseup", deactivation, true);
    button.addEventListener("keydown", ifSpaceOrEnter(activation), true);
    button.addEventListener("keyup", ifSpaceOrEnter(deactivation), true);
    button.classList.add("commandButton")

    td.appendChild(button);
    tr.appendChild(td);

    return button;
}


function addPOSTButton(tr, text, jsonON, jsonKEEP, jsonOFF) {
    let button;
    let timeout;
    let lastActivation = 0;
    let skipDeactivationOnce = false;
    function periodicPostJSONKeep() {
        justPostJSON(jsonKEEP);
        clearTimeout(timeout);
        timeout = setTimeout(periodicPostJSONKeep, AUTO_RESEND_TIMING);
    }
    function activation() {
        button.classList.add("active");
        let currentTime = (new Date()).getTime(); // in ms
        if (currentTime - lastActivation < 150) {
            doubleActivation();
        }
        lastActivation = currentTime;
        justPostJSON(jsonON);
        periodicPostJSONKeep()
    }
    function doubleActivation() {
        skipDeactivationOnce = true;
    }
    function deactivation() {
        if (skipDeactivationOnce) {
            skipDeactivationOnce = false;
        }
        else {
            button.classList.remove("active");
            clearTimeout(timeout);
            justPostJSON(jsonOFF);
        }
    }
    button = addButton(tr, text, activation, deactivation);
}


function genButtonText(title, value) {
    return `${title}::\n${value}`;
}

for (let name of BASIC_ACTIONS) {
    let tr = document.createElement("tr");
    tbody.appendChild(tr);
    for (let valueON of POWER_VALUES) {
        let text = genButtonText(capitalized(name), valueON)
        let jsonON   = `{"${name}": ${valueON}}`;
        let jsonKEEP = `{"${name}": null}`;
        let jsonOFF  = `{"${name}": 0}`;
        addPOSTButton(tr, text, jsonON, jsonKEEP, jsonOFF);
    }
}

for (let {title, nameA, kA, nameB, kB} of [TRANSFER, ROTATION]) {
    let tr = document.createElement("tr");
    tbody.appendChild(tr);
    for (let valueON of POWER_VALUES) {
        let valueOFF = 0;
        let valueAAA = valueON * kA;
        let valueBBB = valueON * kB;
        let text = genButtonText(title, valueON);
        let jsonON   = `{"${nameA}": ${valueAAA}, "${nameB}": ${valueBBB}}`;
        let jsonKEEP = `{"${nameA}": null, "${nameB}": null}`;
        let jsonOFF  = `{"${nameA}": 0, "${nameB}": 0}`;
        addPOSTButton(tr, text, jsonON, jsonKEEP, jsonOFF);
    }
}

}