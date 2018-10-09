import remoteV1 from './remoteV1';
import remoteV2 from './remoteV2';

// DEBUG
// document.body.innerHTML += "<p> -- OK -- </p>";
import {test_fitBox} from './util/test_Box';
let w = DEBUG ? window : {};

test_fitBox();

// MAIN
var remoteVersionMap = {
    "1": remoteV1,
    "2": remoteV2
};

var arv;
var availableRemoteVersions = arv = "1 2".split(" ");

if (!arv) {
    throw new Error("No availableRemoteVersions!");
}

var remoteVersion = arv[arv.length - 1];

if (location.hash) {
    remoteVersion = location.hash.substr(1);
}

var main = remoteVersionMap[remoteVersion];

main();