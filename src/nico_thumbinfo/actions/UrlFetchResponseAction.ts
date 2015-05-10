/// <reference path="../../../typings/common.d.ts" />
"use strict";

import VideoKey from "../stores/VideoKey";
import NicoThumbinfoAction from "./NicoThumbinfoAction";
import UrlFetcher, {Request, Response} from "../../util/UrlFetcher";

export default class UrlFetchResponseAction extends NicoThumbinfoAction {
    private _request: Request;
    private _response: Response;
    private _requestKey: VideoKey;

    constructor(key: VideoKey, request: Request, response: Response, requestKey: VideoKey) {
        super(key);
        this._request = request;
        this._response = response;
        this._requestKey = requestKey;
    }

    get request() { return this._request; }
    get response() { return this._response; }
    get requestKey() { return this._requestKey; }
}
