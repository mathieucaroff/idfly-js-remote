import Box from './Box';
import {assert} from './assert';

function test_fitBox() {
    var frame = new Box().x(0).y(0).width(2000).height(1000);
    var box = frame.width(500);
    var res = box.x(750);
    assert("test_fitBox(1)", frame.fitBox(box), res, (a, b) => a.equal(b));
}

export {test_fitBox};