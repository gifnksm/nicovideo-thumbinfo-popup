/// <reference path="../../../typings/common.d.ts" />
"use strict";

import Action from "../../actions/Action";
import VideoKey from "../stores/VideoKey";

export default class NicoThumbinfoAction implements Action {
    private _key: VideoKey;

    constructor(key: VideoKey) {
        this._key = key;
    }

    get key(): VideoKey { return this._key; }
}
