/// <reference path="../../../typings/bundle.d.ts" />
"use strict";

import {Option, Some, None} from "option-t";

export default class TagData {
    isCategory: Option<boolean> = new None<boolean>();
    isLocked: Option<boolean> = new None<boolean>();
    nicopediaRegistered: Option<boolean> = new None<boolean>();

    constructor(public name: string) {}

    static merged(self: TagData, other: TagData): TagData {
        let tag = new TagData(self.name);

        tag.isCategory = self.isCategory.or(other.isCategory);
        tag.isLocked = self.isLocked.or(other.isLocked);
        tag.nicopediaRegistered = self.nicopediaRegistered.or(other.nicopediaRegistered);

        return tag;
    }
}
