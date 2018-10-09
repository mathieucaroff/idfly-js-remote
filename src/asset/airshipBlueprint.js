
import Box from '../util/Box';
import simpleClass from '../simpleClass';

let Zone = simpleClass(
    ["id", "xmov", "ymov", "svg"].concat(Box.__properties__),
    Box,
);

Zone.prototype.motorSpeed = function ([x, y]) {
    return {...this._xmov(x), ...this._ymov(y)};
};

let forward  = pow => ({forward: pow});
let backward = pow => ({forward: -pow});
let down     = pow => ({up: -pow});
let transfer = pow => ({frontT: pow, backT: pow});
let rotate   = pow => ({frontT: pow, backT: -pow});

let zoneArray = [
    Zone("0").x(  0).y(  0).size(1/3, 2/3).xmov(transfer).ymov(backward),
    Zone("1").x(3/6).y(  0).size(1/3, 2/3).xmov(rotate  ).ymov(backward),
    Zone("2").x(  0).y(2/3).size(1/3, 1/3).xmov(transfer).ymov(down),
    Zone("3").x(1/3).y(2/3).size(2/3, 1/3).xmov(forward ).ymov(down),
];

let src = "/asset/airship-blueprint.svg";
src = "/asset/airship-blueprint.min.svg";

function fetchInto(element) {
    return fetch(src)
    .then(resp => resp.text())
    .then(text => {
        element.innerHTML = text;
        let all = element.querySelectorAll("circle, ellipse");
        zoneArray[0]._svg = all[1];
        zoneArray[1]._svg = all[3];
        zoneArray[2]._svg = all[0];
        zoneArray[3]._svg = all[2];
    });
}

let findZone = ([x, y]) => {
    for (let zone of zoneArray) {
        if (zone.contains([x, y])) {
            return zone;
        }
    }
    return null;
};

export {src, fetchInto, findZone, Zone};