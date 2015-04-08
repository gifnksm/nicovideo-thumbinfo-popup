/// <reference path="../target/typings/tsd.d.ts" />

import HelloWorld from "../src/hello-world";
import * as assert from "power-assert";

describe("Hello World", function() {
    it('should say "Hello, world."', function() {
        let hello = new HelloWorld();
        assert(hello.say() === "Hello, world.");
    })
})
