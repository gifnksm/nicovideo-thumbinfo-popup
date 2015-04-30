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

        // TODO: replace with ES6's Array.prototype.findIndex
        function searchIndex(needle: TagData, haystack: TagData[]) {
            for (let i = 0; i < haystack.length; i++) {
                if (haystack[i].name === needle.name) {
                    return i;
                }
            }
            return -1;
        }

        let newTags = this.tags.slice();
        let notFound: TagData[] = [];

        for (let t of tags.tags) {
            let i = searchIndex(t, newTags);
            if (i === -1) {
                notFound.push(t);
            } else {
                newTags[i] = TagData.merged(newTags[i], t);
                if (notFound.length > 0) {
                    newTags.splice(i, 0, ...notFound);
                    notFound = [];
                }
            }
        }
        if (notFound.length > 0) {
            newTags.push(...notFound);
            notFound = [];
        }

        this._tags = newTags;
    }
}
