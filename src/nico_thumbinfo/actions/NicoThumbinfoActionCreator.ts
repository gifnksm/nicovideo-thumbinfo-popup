/// <reference path="../../../typings/bundle.d.ts" />
"use strict";

import {Source} from "./UrlFetchAction";
import GetThumbinfoFetchAction from "./GetThumbinfoFetchAction";
import GetFlvFetchAction from "./GetFlvFetchAction";
import V3VideoArrayFetchAction from "./V3VideoArrayFetchAction";
import NicopediaFetchAction, {NicopediaInfo, Type as NicopediaType} from "./NicopediaFetchAction";
import UserNameFetchAction from "./UserNameFetchAction";

import ErrorInfo, {ErrorCode} from "../models/ErrorInfo";
import VideoKey from "../models/VideoKey";
import RawVideoData from "../models/RawVideoData";
import GetThumbinfoParser from "../models/parser/GetThumbinfoParser";
import GetFlvParser from "../models/parser/GetFlvParser";
import V3VideoArrayParser from "../models/parser/V3VideoArrayParser";
import UserNameParser from "../models/parser/UserNameParser";

import AppDispatcher, {AppDispatcherInterface} from "../../dispatcher/AppDispatcher";
import UrlFetcher, {Request, Response} from "../../util/UrlFetcher";

class CachedUrlFetcher<T> {
    _cache = new Map<string, Promise<T|ErrorInfo>>();
    _fetcher: UrlFetcher;

    constructor(fetcher: UrlFetcher) {
        this._fetcher = fetcher;
    }

    fetch(
        request: Request, id: string, converter: (resp: Response) => T|ErrorInfo,
        dropCache: boolean = false
    ): Promise<T|ErrorInfo> {
        let promise = this._cache.get(id);

        if (promise === undefined || dropCache) {
            promise = this._fetcher
                .fetch(request)
                .then(converter, error => {
                    return new ErrorInfo(ErrorCode.UrlFetch, error);
                });
            this._cache.set(id, promise);
        }

        return promise;
    }
}

class NicoThumbinfoActionCreator {
    private _dispatcher: AppDispatcherInterface;
    private _getThumbinfoFetcher: CachedUrlFetcher<RawVideoData|ErrorInfo>;
    private _getFlvFetcher: CachedUrlFetcher<VideoKey|ErrorInfo>;
    private _nicopediaFetcher: CachedUrlFetcher<NicopediaInfo|ErrorInfo>;
    private _v3VideoArrayFetcher: CachedUrlFetcher<RawVideoData|ErrorInfo>;
    private _userNameFetcher: CachedUrlFetcher<string|ErrorInfo>;

    constructor(dispatcher: AppDispatcherInterface, fetcher: UrlFetcher) {
        this._dispatcher = dispatcher;
        this._getThumbinfoFetcher = new CachedUrlFetcher(fetcher);
        this._getFlvFetcher = new CachedUrlFetcher(fetcher);
        this._nicopediaFetcher = new CachedUrlFetcher(fetcher);
        this._v3VideoArrayFetcher = new CachedUrlFetcher(fetcher);
        this._userNameFetcher = new CachedUrlFetcher(fetcher);
    }

    createGetThumbinfoFetchAction(source: Source, reqKey: VideoKey) {
        let url = "http://ext.nicovideo.jp/api/getthumbinfo/" + reqKey.id;
        let req = Request.get(url);

        this._getThumbinfoFetcher.fetch(
            req,
            reqKey.valueOf(),
            resp => this._handleGetThumbinfoResponse(reqKey, resp)
        ).then(payload => {
            this._dispatcher.handleStoreEvent(
                new GetThumbinfoFetchAction(source, payload));
        });
    }

    createGetFlvFetchAction(source: Source, reqKey: VideoKey) {
        let url = "http://www.nicovideo.jp/api/getflv/" + reqKey.id;
        let req = Request.get(url);

        this._getFlvFetcher.fetch(
            req,
            reqKey.valueOf(),
            this._handleGetFlvResponse
        ).then(payload => {
            this._dispatcher.handleStoreEvent(
                new GetFlvFetchAction(source, payload));
        });
    }

    createNicopediaFetchAction(source: Source, type: NicopediaType, name: string) {
        let category = "";
        switch (type) {
        case NicopediaType.Article:
            category = "a";
            break;
        case NicopediaType.Video:
            category = "v";
            break;
        default:
            throw new Error("Unknown type: " + type);
        }

        let id = `${category}/${encodeURIComponent(name)}`;

        let url = "http://api.nicodic.jp/page.exist/n/" + id;
        let req = Request.get(url);
        this._nicopediaFetcher.fetch(
            req,
            id,
            resp => this._handleNicopediaResponse(type, name, resp)
        ).then(payload => {
            this._dispatcher.handleStoreEvent(
                new NicopediaFetchAction(source, payload));
        })
    }

    createV3VideoArrayFetchAction(source: Source, reqKey: VideoKey) {
        let url = "http://i.nicovideo.jp/v3/video.array?v=" + reqKey.id;
        let req = Request.get(url);

        this._v3VideoArrayFetcher.fetch(
            req,
            reqKey.valueOf(),
            resp => this._handleV3VideoArrayResponse(reqKey, resp)
        ).then(payload => {
            this._dispatcher.handleStoreEvent(
                new V3VideoArrayFetchAction(source, payload));
        });
    }

    createUserNameFetchAction(source: Source, id: string) {
        let url = `http://seiga.nicovideo.jp/api/user/info?id=${id}`;
        let req = Request.get(url);

        this._userNameFetcher.fetch(
            req,
            id,
            this._handleUserNameResponse
        ).then(payload => {
            this._dispatcher.handleStoreEvent(
                new UserNameFetchAction(source, payload));
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

        if (result instanceof ErrorInfo) {
            if (result.code === ErrorCode.Community &&
                requestKey.type === VideoKey.Type.ThreadId) {
                return new ErrorInfo(ErrorCode.CommunitySubThread, result.detail);
            }
        }

        return result;
    }

    _handleGetFlvResponse(response: Response): VideoKey|ErrorInfo {
        if (response.status !== 200) {
            return new ErrorInfo(ErrorCode.HttpStatus, response.statusText);
        }
        if (response.responseText === "") {
            return new ErrorInfo(ErrorCode.ServerMaintenance);
        }
        return GetFlvParser.parse(response.responseText);
    }

    _handleNicopediaResponse(type: NicopediaType, name: string, response: Response): NicopediaInfo|ErrorInfo {
        if (response.status !== 200) {
            return new ErrorInfo(ErrorCode.HttpStatus, response.statusText);
        }
        if (response.responseText === "") {
            return new ErrorInfo(ErrorCode.ServerMaintenance);
        }

        if (/n\((.)\);/.test(response.responseText)) {
            return new NicopediaInfo(type, name, !!parseInt(RegExp.$1, 10));
        }

        return new ErrorInfo(ErrorCode.Unknown);
    }

    _handleV3VideoArrayResponse(requestKey: VideoKey, response: Response): RawVideoData|ErrorInfo {
        if (response.status !== 200) {
            return new ErrorInfo(ErrorCode.HttpStatus, response.statusText);
        }
        if (response.responseText === "") {
            return new ErrorInfo(ErrorCode.ServerMaintenance);
        }
        return V3VideoArrayParser.parse(requestKey, response.responseText);
    }

    _handleUserNameResponse(response: Response): string|ErrorInfo {
        if (response.status !== 200) {
            return new ErrorInfo(ErrorCode.HttpStatus, response.statusText);
        }
        if (response.responseText === "") {
            return new ErrorInfo(ErrorCode.ServerMaintenance);
        }
        return UserNameParser.parse(response.responseText);
    }
}

const Creator = new NicoThumbinfoActionCreator(AppDispatcher, UrlFetcher.getInstance());
export default Creator;
