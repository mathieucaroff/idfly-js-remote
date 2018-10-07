
import {Box} from '../util/cutil';

let src = "/asset/airship-blueprint.svg";

let b = 1 / 100; // borders width in fraction of image size.

let zoneDict = {
    0: Box(0,     0, 1/3, 2/3 - b),
    1: Box(3/6,   0, 1/3, 2/3 - b),
    2: Box(0,   2/3, 1/3 - b, 1/3),
    3: Box(1/3, 2/3, 2/3, 1/3),
};

let findZone = ([x, y]) => {
    for (let name in zoneDict) {
        if (zoneDict[name].contains([x, y])) {
            return name;
        }
    }
};

let localPosition = ([x, y], zoneId) => {
    let zone = zoneDict[zoneId];
};

export {src, findZone, localPosition};