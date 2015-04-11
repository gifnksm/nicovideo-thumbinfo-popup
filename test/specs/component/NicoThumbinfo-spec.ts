/// <reference path="../../../typings/common.d.ts" />

import NicoThumbinfo from "../../../src/component/NicoThumbinfo";
import * as assert from "power-assert";
import * as React from "react";

describe("NicoThumbinfo", () => {
    it("should be able to render with epmty props.", () => {
        let div = document.createElement('div');
        React.render(React.createElement(NicoThumbinfo), div);
    });

    it("should render loading messages with empty props.", () => {
        let div = document.createElement('div');
        React.render(React.createElement(NicoThumbinfo), div);
    });
});
