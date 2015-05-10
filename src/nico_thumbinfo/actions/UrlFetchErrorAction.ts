/// <reference path="../../../typings/common.d.ts" />
"use strict";

import VideoKey from "../stores/VideoKey";
import {DataSource} from "../stores/constants";
import NicoThumbinfoAction from "./NicoThumbinfoAction";
import UrlFetchAction from "./UrlFetchAction";
import UrlFetcher, {Request} from "../../util/UrlFetcher";

export default class UrlFetchErrorAction extends UrlFetchAction {
    private _error: string;

    constructor(key: VideoKey, request: Request, error: string, requestKey: VideoKey, source: DataSource) {
        super(key, request, requestKey, source);
        this._error = error;
    }

    get error() { return this._error; }
}
