/// <reference path="../../../typings/common.d.ts" />
"use strict";

import Action from "../../actions/Action";
import VideoKey from "../models/VideoKey";

export default class NicoThumbinfoAction implements Action {
    private _key: VideoKey;

    constructor(key: VideoKey) {
        this._key = key;
    }

    get key() { return this._key; }
}
