/// <reference path="../../../typings/common.d.ts" />
"use strict";

import UrlFetchResponseAction from "./UrlFetchResponseAction";
import UrlFetchErrorAction from "./UrlFetchErrorAction";
import {DataSource} from "../stores/constants";
import VideoKey from "../stores/VideoKey";

import Action from "../../actions/Action";
import AppDispatcher, {AppDispatcherInterface} from "../../dispatcher/AppDispatcher";
import UrlFetcher, {Request, Response} from "../../util/UrlFetcher";

class NicoThumbinfoActionCreator {
    private _dispatcher: AppDispatcherInterface;
    private _fetcher: UrlFetcher;

    constructor(dispatcher: AppDispatcherInterface, fetcher: UrlFetcher) {
        this._dispatcher = dispatcher;
        this._fetcher = fetcher;
    }

    createUrlFetchAction(key: VideoKey, req: Request, reqKey: VideoKey, source: DataSource) {
        this._fetcher.fetch(req).then(resp => {
            this._dispatcher.handleStoreEvent(new UrlFetchResponseAction(key, req, resp, reqKey, source));
        }, error => {
            this._dispatcher.handleStoreEvent(new UrlFetchErrorAction(key, req, error, reqKey, source));
        });
    }
}

const Creator = new NicoThumbinfoActionCreator(AppDispatcher, UrlFetcher.getInstance());
export default Creator;
