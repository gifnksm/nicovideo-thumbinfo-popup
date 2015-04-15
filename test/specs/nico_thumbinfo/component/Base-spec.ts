/// <reference path="../../../../typings/common.d.ts" />

import NicoThumbinfo from "../../../../src/nico_thumbinfo/component/Base";
import * as assert from "power-assert";
import * as React from "react";

describe("nico_thumbinfo/component/Base", () => {
    it("should be able to render with epmty props.", () => {
        let div = document.createElement('div');
        React.render(React.createElement(NicoThumbinfo), div);
    });

    it("should render loading messages with empty props.", () => {
        let div = document.createElement('div');
        React.render(React.createElement(NicoThumbinfo), div);
    });
});
