/// <reference path="../../../typings/common.d.ts" />
"use strict";

import VideoKey from "../stores/VideoKey";
import {DataSource} from "../stores/constants";
import UrlFetchAction from "./UrlFetchAction";
import UrlFetcher, {Request, Response} from "../../util/UrlFetcher";

export default class UrlFetchResponseAction extends UrlFetchAction {
    private _response: Response;

    constructor(key: VideoKey, request: Request, response: Response, requestKey: VideoKey, source: DataSource) {
        super(key, request, requestKey, source);
        this._response = response;
    }

    get response() { return this._response; }
}
