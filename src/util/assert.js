function assert(name, a, b, testFunc) {
    if (!testFunc(a, b)) {
        console.error(`${name} failed. Got:`, a, "Expected:", b);
    }
}

export {assert};