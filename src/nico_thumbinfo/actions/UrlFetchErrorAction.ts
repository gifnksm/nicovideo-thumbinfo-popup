/// <reference path="../../../typings/common.d.ts" />
"use strict";

import VideoKey from "../stores/VideoKey";
import NicoThumbinfoAction from "./NicoThumbinfoAction";
import UrlFetcher, {Request} from "../../util/UrlFetcher";

export default class UrlFetchErrorAction extends NicoThumbinfoAction {
    private _request: Request;
    private _error: string;
    private _requestKey: VideoKey;
    constructor(key: VideoKey, request: Request, error: string, requestKey: VideoKey) {
        super(key);
        this._request = request;
        this._error = error;
        this._requestKey = requestKey;
    }
    get request() { return this._request; }
    get error() { return this._error; }
    get requestKey() { return this._requestKey; }
}
