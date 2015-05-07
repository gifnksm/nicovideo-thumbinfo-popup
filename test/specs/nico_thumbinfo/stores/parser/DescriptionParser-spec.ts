/// <reference path="../../../../../typings/common.d.ts" />
"use strict";

import DescriptionParser from "../../../../../src/nico_thumbinfo/stores/parser/DescriptionParser";
import {DescriptionElement as DElement, DescriptionText as DText} from "../../../../../src/nico_thumbinfo/stores/DescriptionNode";
import * as assert from "power-assert";

describe("nico_thumbinfo/stores/parser/DescriptionParser", () => {
    it("should convert video URLs into links.", () => {
        let node = document.createElement("div");
        node.textContent = "Watch! http://www.nicovideo.jp/watch/sm9";
        assert.deepEqual([
            new DText("Watch! "),
            new DElement("a", {href: "http://www.nicovideo.jp/watch/sm9"},
                         [new DText("http://www.nicovideo.jp/watch/sm9")]),
        ], DescriptionParser.parse(node.childNodes));
    });

    it("should convert video IDs into links.", () => {
        let node = document.createElement("div");
        node.textContent = "12345sm9 asdf";
        assert.deepEqual([
            new DText("12345"),
            new DElement("a", {href: "http://www.nicovideo.jp/watch/sm9"},
                         [new DText("sm9")]),
            new DText(" asdf")
        ], DescriptionParser.parse(node.childNodes));
    });

    it("should convert many spaces into break lines.", () => {
        let node = document.createElement("div");
        node.textContent = "hello            world";
        assert.deepEqual([
            new DText("hello"),
            new DElement("br"),
            new DText("world")
        ], DescriptionParser.parse(node.childNodes));
    });

    it("should not convert IDs in anchors.", () => {
        let node = document.createElement("div");
        node.textContent = "asdf";
        let anchor = document.createElement("a");
        anchor.textContent = "sm9";
        node.appendChild(anchor);
        assert.deepEqual([
            new DText("asdf"),
            new DElement("a", {}, [new DText("sm9")]),
        ], DescriptionParser.parse(node.childNodes));
    });
});
