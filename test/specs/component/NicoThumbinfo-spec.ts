/// <reference path="../../../target/typings/tsd.d.ts" />

import * as NicoThumbinfo from "../../../src/component/NicoThumbinfo";
import * as assert from "power-assert";
import * as React from "react";

describe("NicoThumbinfo", () => {
    it("should be able to render.", () => {
        let div = document.createElement('div');
        React.render(React.createElement(NicoThumbinfo.Component, {}), div);
    });
});
