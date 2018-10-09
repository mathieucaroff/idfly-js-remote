function createStyle(cssText) {
    var style = document.createElement("style");
    // Add a media (and/or media query) here if you'd like!
    // style.setAttribute("media", "screen")
    // style.setAttribute("media", "only screen and (max-width : 1024px)")
    style.appendChild(document.createTextNode(cssText));
    return style;
}
function insertStyle(style) {
    document.body.appendChild(style);
    return style;
}
function appendCss(cssText) {
    return insertStyle(createStyle(cssText));
}
function loadScript(src) {
    let script = document.createElement("script");
    script.src = src;
    document.body.appendChild(script);
}
function capitalized(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
function justPostJSON(json) {
    DEBUG && console.log(json);
    let r = new Request("/", { method: "POST", body: json });
    return fetch(r);
}
function assemble(n, f) {
    return [].concat(...[...Array(n).keys()].map(f));
}

export {createStyle, insertStyle, appendCss, loadScript, capitalized, justPostJSON, assemble};