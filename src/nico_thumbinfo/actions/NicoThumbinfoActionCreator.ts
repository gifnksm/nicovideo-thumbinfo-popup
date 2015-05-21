/// <reference path="../../../typings/common.d.ts" />
"use strict";

import GetThumbinfoFetchAction from "./GetThumbinfoFetchAction";
import GetFlvFetchAction from "./GetFlvFetchAction";
import {DataSource} from "../stores/constants";
import VideoKey from "../stores/VideoKey";
import RawVideoData from "../stores/RawVideoData";
import {ErrorCode, ErrorInfo} from "../stores/GetThumbinfoFetcher";
import GetThumbinfoParser from "../stores/parser/GetThumbinfoParser";
import GetFlvParser from "../stores/parser/GetFlvParser";

import AppDispatcher, {AppDispatcherInterface} from "../../dispatcher/AppDispatcher";
import UrlFetcher, {Request, Response} from "../../util/UrlFetcher";

class CachedUrlFetcher<T> {
    // TODO: Use ES6 Map
    _cache: {[index: string]: Promise<T>} = Object.create(null);
    _fetcher: UrlFetcher;

    constructor(fetcher: UrlFetcher) {
        this._fetcher = fetcher;
    }

    fetch(request: Request, id: string, converter: (resp: Response) => T,
          dropCache: boolean = false): Promise<T> {
        let promise = this._cache[id];

        if (promise === undefined || dropCache) {
            promise = this._fetcher
                .fetch(request)
                .then(converter, error => {
                    return new ErrorInfo(ErrorCode.UrlFetch, error);
                });
            this._cache[id] = promise;
        }

        return promise;
    }
}

class NicoThumbinfoActionCreator {
    private _dispatcher: AppDispatcherInterface;
    private _getThumbinfoFetcher: CachedUrlFetcher<RawVideoData|ErrorInfo>;
    private _getFlvFetcher: CachedUrlFetcher<VideoKey|ErrorInfo>;

    constructor(dispatcher: AppDispatcherInterface, fetcher: UrlFetcher) {
        this._dispatcher = dispatcher;
        this._getThumbinfoFetcher = new CachedUrlFetcher(fetcher);
        this._getFlvFetcher = new CachedUrlFetcher(fetcher);
    }

    createGetThumbinfoFetchAction(key: VideoKey, reqKey: VideoKey, source: DataSource) {
        let url = "http://ext.nicovideo.jp/api/getthumbinfo/" + reqKey.id;
        let req = Request.get(url);

        this._getThumbinfoFetcher.fetch(
            req,
            reqKey.valueOf(),
            resp => this._handleGetThumbinfoResponse(reqKey, resp)
        ).then(payload => {
            this._dispatcher.handleStoreEvent(
                new GetThumbinfoFetchAction(key, req, reqKey, source, payload));
        });
    }

    createGetFlvFetchAction(key: VideoKey, reqKey: VideoKey, source: DataSource) {
        let url = "http://www.nicovideo.jp/api/getflv/" + reqKey.id;
        let req = Request.get(url);

        this._getFlvFetcher.fetch(
            req,
            reqKey.valueOf(),
            this._handleGetFlvResponse
        ).then(payload => {
            this._dispatcher.handleStoreEvent(
                new GetFlvFetchAction(key, req, reqKey, source, payload));
        });
    }

    _handleGetThumbinfoResponse(requestKey: VideoKey, response: Response): RawVideoData|ErrorInfo {
        if (response.status !== 200) {
            return new ErrorInfo(ErrorCode.HttpStatus, response.statusText);
        }
        if (response.responseText === "") {
            return new ErrorInfo(ErrorCode.ServerMaintenance);
        }

        let result = GetThumbinfoParser.parse(requestKey, response.responseText);

        if (result instanceof RawVideoData) {
            return result;
        }

        if (result instanceof ErrorInfo) {
            if (result.errorCode === ErrorCode.Community &&
                requestKey.type === VideoKey.Type.ThreadId) {
                return new ErrorInfo(ErrorCode.CommunitySubThread, result.errorDetail);
            }
            return result;
        }

        console.warn("Unknown result: ", result);
        return new ErrorInfo(ErrorCode.Invalid, "" + result);
    }

    _handleGetFlvResponse(response: Response): VideoKey|ErrorInfo {
        if (response.status !== 200) {
            return new ErrorInfo(ErrorCode.HttpStatus, response.statusText);
        }
        if (response.responseText === "") {
            return new ErrorInfo(ErrorCode.ServerMaintenance);
        }

        let result = GetFlvParser.parse(response.responseText);

        if (result instanceof VideoKey) {
            return result;
        }

        if (result instanceof ErrorInfo) {
            return result;
        }

        console.warn("Unknown result: ", result);
        return new ErrorInfo(ErrorCode.Invalid, "" + result);
    }
}

const Creator = new NicoThumbinfoActionCreator(AppDispatcher, UrlFetcher.getInstance());
export default Creator;
