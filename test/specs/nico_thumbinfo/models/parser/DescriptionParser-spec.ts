/// <reference path="../../../../../typings/common.d.ts" />
"use strict";

import DescriptionParser from "../../../../../src/nico_thumbinfo/models/parser/DescriptionParser";
import {DescriptionElement as DElement, DescriptionText as DText} from "../../../../../src/nico_thumbinfo/models/DescriptionNode";
import * as assert from "power-assert";

describe("nico_thumbinfo/models/parser/DescriptionParser", () => {
    it("should convert video URLs into links.", () => {
        let input = "Watch! http://www.nicovideo.jp/watch/sm9";
        assert.deepEqual([
            new DText("Watch! "),
            new DElement("a", {href: "http://www.nicovideo.jp/watch/sm9"},
                         [new DText("http://www.nicovideo.jp/watch/sm9")]),
        ], DescriptionParser.parse(input, true));
    });

    it("should convert video IDs into links.", () => {
        let input = "12345sm9 asdf";
        assert.deepEqual([
            new DText("12345"),
            new DElement("a", {href: "http://www.nicovideo.jp/watch/sm9"},
                         [new DText("sm9")]),
            new DText(" asdf")
        ], DescriptionParser.parse(input, true));
    });

    it("should convert many spaces into break lines.", () => {
        let input = "hello            world";
        assert.deepEqual([
            new DText("hello"),
            new DElement("br"),
            new DText("world")
        ], DescriptionParser.parse(input, true));
    });

    it("should not convert IDs in anchors.", () => {
        let input = "asdf<a>sm9</a>";
        assert.deepEqual([
            new DText("asdf"),
            new DElement("a", {}, [new DText("sm9")]),
        ], DescriptionParser.parse(input, true));
    });
});
