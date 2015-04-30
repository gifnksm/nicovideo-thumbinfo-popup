/// <reference path="../../../../typings/common.d.ts" />
"use strict";

import TagData from "../../../../src/nico_thumbinfo/stores/TagData";
import TagListData from "../../../../src/nico_thumbinfo/stores/TagListData";
import * as assert from "power-assert";
import {Option, Some, None} from "option-t";

describe("nico_thumbinfo/stores/TagListData", () => {
    function checkTag(tag: TagData, name: string, isLocked: boolean, isCategory: boolean, nicopediaRegistered: boolean) {
        assert(tag.name === name);
        assert(tag.isLocked === isLocked);
        assert(tag.isCategory === isCategory);
        assert(tag.nicopediaRegistered === nicopediaRegistered);
    }
    function genBase(n0 = "a", n1 = "b", n2 = "c") {
        let tags = [new TagData(n0), new TagData(n1), new TagData(n2)];
        tags[0].isLocked = true;
        tags[1].isCategory = false;
        tags[2].nicopediaRegistered = true;

        let list = new TagListData();
        list.tags.push(...tags);
        return list;
    }
    function genExtend(n0 = "a", n1 = "b", n2 = "c") {
        let tags = [new TagData(n0), new TagData(n1), new TagData(n2)];
        tags[1].isLocked = false;
        tags[2].isCategory = true;
        tags[0].nicopediaRegistered = false;

        let list = new TagListData();
        list.tags.push(...tags);
        return list;
    }

    it("should merge each elements' attributes.", () => {
        let merged = new TagListData();
        merged.merge(genBase());
        merged.merge(genExtend());
        assert(merged.tags.length === 3);
        checkTag(merged.tags[0], "a", true, undefined, false);
        checkTag(merged.tags[1], "b", false, false, undefined);
        checkTag(merged.tags[2], "c", undefined, true, true);
    });

    it("should overwrite with base's value if both have valid values.", () => {
        let merged = new TagListData();
        merged.merge(genBase("a", "b", "c"));
        merged.merge(genExtend("c", "a", "b"));
        assert(merged.tags.length === 3);
        checkTag(merged.tags[0], "a", true, undefined, undefined);
        checkTag(merged.tags[1], "b", undefined, false, undefined);
        checkTag(merged.tags[2], "c", undefined, undefined, true);
    });

    it("should be able to merge without affecting original TagListData.", () => {
        let base = genBase();
        let extend = genExtend();
        let merged = new TagListData();
        merged.merge(base);
        merged.merge(extend);

        assert(base.tags.length === 3);
        checkTag(base.tags[0], "a", true, undefined, undefined);
        checkTag(base.tags[1], "b", undefined, false, undefined);
        checkTag(base.tags[2], "c", undefined, undefined, true);

        assert(extend.tags.length === 3);
        checkTag(extend.tags[0], "a", undefined, undefined, false);
        checkTag(extend.tags[1], "b", false, undefined, undefined);
        checkTag(extend.tags[2], "c", undefined, true, undefined);
    });

    it("should append elements at last if both list have no common elements.", () => {
        let merged = new TagListData();
        merged.merge(genBase("a", "b", "c"));
        merged.merge(genExtend("d", "e", "f"));
        assert(merged.tags.length === 6);
        checkTag(merged.tags[0], "a", true, undefined, undefined);
        checkTag(merged.tags[1], "b", undefined, false, undefined);
        checkTag(merged.tags[2], "c", undefined, undefined, true);
        checkTag(merged.tags[3], "d", undefined, undefined, false);
        checkTag(merged.tags[4], "e", false, undefined, undefined);
        checkTag(merged.tags[5], "f", undefined, true, undefined);
    });

    it("should order by the same ordering with base if some elements order are swapped.", () => {
        let merged = new TagListData();
        merged.merge(genBase("a", "b", "c"));
        merged.merge(genExtend("a", "c", "b"));
        assert(merged.tags.length === 3);
        checkTag(merged.tags[0], "a", true, undefined, false);
        checkTag(merged.tags[1], "b", undefined, false, undefined);
        checkTag(merged.tags[2], "c", false, undefined, true);
    });

    it("should merge elements saving original ordering.", () => {
        let merged = new TagListData();
        merged.merge(genBase("a", "b", "c"));
        merged.merge(genExtend("a", "x", "b"));
        assert(merged.tags.length === 4);
        checkTag(merged.tags[0], "a", true, undefined, false);
        checkTag(merged.tags[1], "x", false, undefined, undefined);
        checkTag(merged.tags[2], "b", undefined, false, undefined);
        checkTag(merged.tags[3], "c", undefined, undefined, true);

        merged.merge(genExtend("p", "q", "x"));
        assert(merged.tags.length === 6);
        checkTag(merged.tags[0], "a", true, undefined, false);
        checkTag(merged.tags[1], "p", undefined, undefined, false);
        checkTag(merged.tags[2], "q", false, undefined, undefined);
        checkTag(merged.tags[3], "x", false, true, undefined);
        checkTag(merged.tags[4], "b", undefined, false, undefined);
        checkTag(merged.tags[5], "c", undefined, undefined, true);
    });
});

