/// <reference path="../../../typings/common.d.ts" />
"use strict";

import VideoKey from "../stores/VideoKey";
import {DataSource} from "../stores/constants";
import NicoThumbinfoAction from "./NicoThumbinfoAction";
import UrlFetcher, {Request} from "../../util/UrlFetcher";

export default class UrlFetchAction extends NicoThumbinfoAction {
    private _request: Request;
    private _source: DataSource;

    constructor(key: VideoKey, request: Request, source: DataSource) {
        super(key);
        this._request = request;
        this._source = source;
    }

    get request() { return this._request; }
    get source() { return this._source; }
}
