/// <reference path="../../../typings/common.d.ts" />
"use strict";

import UrlFetchResponseAction from "./UrlFetchResponseAction";
import UrlFetchErrorAction from "./UrlFetchErrorAction";
import {DataSource, FetchTarget} from "../stores/constants";
import VideoKey from "../stores/VideoKey";

import Action from "../../actions/Action";
import AppDispatcher, {AppDispatcherInterface} from "../../dispatcher/AppDispatcher";
import UrlFetcher, {Request, Response} from "../../util/UrlFetcher";

class CachedUrlFetcher {
    // TODO: Use ES6 Map
    _cache: {[index: string]: Promise<Response>} = Object.create(null);
    _fetcher: UrlFetcher;

    constructor(fetcher: UrlFetcher) {
        this._fetcher = fetcher;
    }

    fetch(request: Request, id: string, dropCache: boolean = false): Promise<Response> {
        let promise = this._cache[id];

        if (promise === undefined || dropCache) {
            promise = this._fetcher
                .fetch(request)
                .catch(error => {
                    // Drop cache if error response returned
                    this._cache[id] = undefined;
                    throw error;
                    return null; // Dummy return value to resolve type error
                });
            this._cache[id] = promise;
        }

        return promise;
    }
}

class NicoThumbinfoActionCreator {
    private _dispatcher: AppDispatcherInterface;
    private _getThumbinfoFetcher: CachedUrlFetcher;
    private _getFlvFetcher: CachedUrlFetcher;

    constructor(dispatcher: AppDispatcherInterface, fetcher: UrlFetcher) {
        this._dispatcher = dispatcher;
        this._getThumbinfoFetcher = new CachedUrlFetcher(fetcher);
        this._getFlvFetcher = new CachedUrlFetcher(fetcher);
    }

    createGetThumbinfoFetchAction(key: VideoKey, reqKey: VideoKey, source: DataSource) {
        let url = "http://ext.nicovideo.jp/api/getthumbinfo/" + reqKey.id;
        this._setupFetchPromise(this._getThumbinfoFetcher, url,
                                key, reqKey, source, FetchTarget.GetThumbinfo);
    }

    createGetFlvFetchAction(key: VideoKey, reqKey: VideoKey, source: DataSource) {
        let url = "http://www.nicovideo.jp/api/getflv/" + reqKey.id;
        this._setupFetchPromise(this._getFlvFetcher, url,
                                key, reqKey, source, FetchTarget.GetFlv);
    }

    _setupFetchPromise(fetcher: CachedUrlFetcher, url: string,
                       key: VideoKey, reqKey: VideoKey,
                       source: DataSource, target: FetchTarget) {
        let req = Request.get(url);
        fetcher.fetch(req, reqKey.valueOf()).then(resp => {
            this._dispatcher.handleStoreEvent(
                new UrlFetchResponseAction(key, req, resp, reqKey, source, target));
        }, error => {
            this._dispatcher.handleStoreEvent(
                new UrlFetchErrorAction(key, req, error, reqKey, source, target));
        });
    }
}

const Creator = new NicoThumbinfoActionCreator(AppDispatcher, UrlFetcher.getInstance());
export default Creator;
