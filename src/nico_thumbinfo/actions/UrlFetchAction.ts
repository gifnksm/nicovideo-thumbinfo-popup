/// <reference path="../../../typings/common.d.ts" />
"use strict";

import VideoKey from "../stores/VideoKey";
import {DataSource, FetchTarget} from "../stores/constants";
import NicoThumbinfoAction from "./NicoThumbinfoAction";
import UrlFetcher, {Request} from "../../util/UrlFetcher";

export default class UrlFetchAction extends NicoThumbinfoAction {
    private _request: Request;
    private _requestKey: VideoKey;
    private _source: DataSource;
    private _target: FetchTarget;

    constructor(key: VideoKey, request: Request, requestKey: VideoKey, 
                source: DataSource, target: FetchTarget) {
        super(key);
        this._request = request;
        this._requestKey = requestKey;
        this._source = source;
        this._target = target;
    }

    get request() { return this._request; }
    get requestKey() { return this._requestKey; }
    get source() { return this._source; }
    get target() { return this._target; }
}
