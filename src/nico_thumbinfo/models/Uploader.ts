/// <reference path="../../../typings/common.d.ts" />
"use strict";

import {Option, Some, None} from "option-t";

interface Uploader {
    id: Option<string>;
    name: Option<string>;
    iconUrl: Option<string>;
    url: Option<string>;
    merge: (other: Uploader) => void;
}

export default Uploader;

export class User implements Uploader {
    id: Option<string> = new None<string>();
    name: Option<string> = new None<string>();
    iconUrl: Option<string> = new None<string>();

    get url(): Option<string> {
        return this.id.map(id => `http://www.nicovideo.jp/user/${id}`);
    }

    merge(other: Uploader) {
        if (!(other instanceof User)) {
            console.warn("Cannot merge ", other, "into", this);
            return;
        }

        this.id = this.id.or(other.id);
        this.name = this.name.or(other.name);
        this.iconUrl = this.iconUrl.or(other.iconUrl);
    }
}

export class Channel implements Uploader {
    id: Option<string> = new None<string>();
    name: Option<string> = new None<string>();
    iconUrl: Option<string> = new None<string>();
    get url(): Option<string> {
        return this.id.map(id => `http://ch.nicovideo.jp/channel/ch${id}`);
    }

    merge(other: Uploader) {
        if (!(other instanceof Channel)) {
            console.warn("Cannot merge ", other, "into", this);
            return;
        }

        this.id = this.id.or(other.id);
        this.name = this.name.or(other.name);
        this.iconUrl = this.iconUrl.or(other.iconUrl);
    }
}
