/// <reference path="../../../../../typings/common.d.ts" />
"use strict";

import DescriptionParser from "../../../../../src/nico_thumbinfo/stores/parser/DescriptionParser";
import * as assert from "power-assert";

describe("nico_thumbinfo/stores/parser/DescriptionParser", () => {
    it("should convert video URLs into links.", () => {
        let node = document.createElement("div");
        node.textContent = "Watch! http://www.nicovideo.jp/watch/sm9";
        assert.deepEqual([
            "Watch! ",
            { name: "a", attr: {href: "http://www.nicovideo.jp/watch/sm9"}, children: ["http://www.nicovideo.jp/watch/sm9"]},
        ], DescriptionParser.parse(node.childNodes));
    });

    it("should convert video IDs into links.", () => {
        let node = document.createElement("div");
        node.textContent = "12345sm9 asdf";
        assert.deepEqual([
            "12345",
            { name: "a", attr: {href: "http://www.nicovideo.jp/watch/sm9"}, children: ["sm9"]},
            " asdf"
        ], DescriptionParser.parse(node.childNodes));
    });

    it("should convert many spaces into break lines.", () => {
        let node = document.createElement("div");
        node.textContent = "hello            world";
        assert.deepEqual([
            "hello",
            { name: "br"},
            "world"
        ], DescriptionParser.parse(node.childNodes));
    });

    it("should not convert IDs in anchors.", () => {
        let node = document.createElement("div");
        node.textContent = "asdf";
        let anchor = document.createElement("a");
        anchor.textContent = "sm9";
        node.appendChild(anchor);
        assert.deepEqual([
            "asdf",
            { name: "a", attr: {}, children: ["sm9"]},
        ], DescriptionParser.parse(node.childNodes));
    });
});
