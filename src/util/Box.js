import simpleClass from '../simpleClass';

let Box = simpleClass("x, y, width, height".split(", "));

Box.prototype.size = function(width, height) {
    let c = this.clone();
    c._width = width;
    c._height = height;
    return c
};

Box.prototype.T = function() {
    return Box(this._y, this._x, this._height, this._width);
};

Box.prototype.contains = function([x, y]) {
    let dx = x - this._x;
    let dy = y - this._y;

    return 0 <= dx && dx <= this._width &&
           0 <= dy && dy <= this._height;
};

Box.prototype.fitPoint = function([xx, yy]) {
    let [x, y] = [xx, yy];
    let dx = xx - this._x;
    let dy = yy - this._y;
    if (dx < 0) x = this._x;
    if (dy < 0) y = this._y;
    if (dx > this._width)  x = this._x + this._width;
    if (dy > this._height) y = this._y + this._height;
    return [x, y];
};

Box.prototype.getFractionalPosition = function ([posx, posy]) {
    var x = posx - this._x;
    var y = posy - this._y;
    return [x / this._width, y / this._height]
};

Box.prototype.fitBox = function(box) {
    let frame = this;
    let contact = "h";
    if (frame._height * box._width > frame._width * box._height) {
        contact = "v";
        // `.T()` gives the transposed box (diagonal symmetric)
        // We can now do as if `contact == "h"`
        // DRY
        frame = frame.T();
        box = box.T();
    }

    let sub = new Box();

    sub._height = frame._height;
    sub._width = sub._height * box._width / box._height; // Unfinished
    sub._y = frame._y;
    sub._x = parseInt(frame._width / 2 - sub._width / 2);
    sub._width = parseInt(sub._width); // Finished

    if (contact == "v") {
        sub = sub.T();
    }
    return sub;
};

export default Box;