/// <reference path="../../../typings/common.d.ts" />
"use strict";

import TagData from "./TagData";

export default class TagListData {
    private _tags: TagData[] = [];

    get tags() { return this._tags; }

    merge(tags: TagListData) {
        // A, B, C + A, B, C => A, B, C
        // A, B, C + A, D, B => A, D, B, C
        // A, B, C + A, C, B => A, B, C
        // A, B, C + A, D, C, B => A, B, D, C

        // TODO: replace with ES6's Array.prototype.find
        function search(needle: TagData, heystack: TagData[]) {
            for (let t of heystack) {
                if (t.name === needle.name) {
                    return t;
                }
            }
            return null;
        }

        let newTags: TagData[] = [];
        let notFound: TagData[] = [];

        for (let t of tags.tags) {
            let base = search(t, this._tags);
            if (base === null) {
                notFound.push(t);
            } else {
                if (notFound.length > 0) {
                    newTags.push(...notFound);
                    notFound = [];
                }
                newTags.push(TagData.merged(base, t));
            }
        }
        if (notFound.length > 0) {
            newTags.push(...notFound);
            notFound = [];
        }

        this._tags = newTags;
    }
}
