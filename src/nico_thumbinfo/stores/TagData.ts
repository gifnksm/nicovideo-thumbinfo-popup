/// <reference path="../../../typings/common.d.ts" />
"use strict";

export default class TagData {
    isCategory: boolean;
    isLocked: boolean;
    nicopediaRegistered: boolean;

    constructor(public name: string) {}

    static merged(base: TagData, extend: TagData): TagData {
        let tag = new TagData(base.name);

        tag.isCategory = (base.isCategory === undefined) ? extend.isCategory : base.isCategory;
        tag.isLocked = (base.isLocked === undefined) ? extend.isLocked : base.isLocked;
        tag.nicopediaRegistered = (base.nicopediaRegistered === undefined) ? extend.nicopediaRegistered : base.nicopediaRegistered;

        return tag;
    }
}
