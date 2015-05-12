/// <reference path="../../../typings/common.d.ts" />
"use strict";

import {DataSource} from "./constants";
import VideoKey from "./VideoKey";
import RawVideoData from "./RawVideoData";
import GetThumbinfoResponseHandler, {ErrorInfo as ResponseErrorInfo, ErrorCode as ResponseErrorCode} from "./GetThumbinfoResponseHandler";

import NicoThumbinfoActionCreator from "../actions/NicoThumbinfoActionCreator";
import UrlFetchAction from "../actions/UrlFetchAction";
import UrlFetchResponseAction from "../actions/UrlFetchResponseAction";
import UrlFetchErrorAction from "../actions/UrlFetchErrorAction";
import {Request, Response} from "../../util/UrlFetcher";

export const enum State {
    Initial, Loading, Completed, Error
}

export const enum ErrorCode {
    UrlFetch,
    HttpStatus,
    ServerMaintenance,
    Invalid,
    Deleted,
    Community,
    CommunitySubThread,
    NotFound
}

export default class GetThumbinfoFetcher {
    private _state: State = State.Initial;
    private _loadingUrl: string;
    private _errorCode: ErrorCode = undefined;
    private _errorDetail: string = undefined;
    private _key: VideoKey;
    private _optionalKey: VideoKey = undefined;
    private _videoData: RawVideoData = null;

    get state() { return this._state; }
    get errorCode() { return this._errorCode; }
    get errorDetail() { return this._errorDetail; }
    get videoData() { return this._videoData; }

    constructor(key: VideoKey) {
        this._key = key;

        this._fetchGetThumbinfo(this._key);
        this._state = State.Loading;
    }

    handleAction(action: UrlFetchAction, callback: () => void): boolean {
        if (this._state !== State.Initial && this._loadingUrl !== action.request.url) {
            console.warn("status does not match", this._state, action);
            return false;
        }

        if (action instanceof UrlFetchErrorAction) {
            this._errorCode = ErrorCode.UrlFetch;
            this._errorDetail = action.error;
            this._state = State.Error;
            return true;
        }

        if (action instanceof UrlFetchResponseAction) {
            GetThumbinfoResponseHandler.handle(action)
                .then(
                    videoData => {
                        this._videoData = videoData;
                        this._state = State.Completed;
                        callback();
                    },
                    data => {
                        let code = this._convertGetThumbinfoError(data.errorCode);
                        this._errorCode = code;
                        this._errorDetail = data.errorDetail;

                        if (code === ErrorCode.CommunitySubThread) {
                            this._fetchGetFlv(this._key);
                            this._state = State.Loading;
                        } else {
                            this._state = State.Error;
                        }

                        callback();
                    }
                );
            return false;
        }

        console.warn("Fetch response does not handled: ", action);
        return false;
    }

    private _fetchGetThumbinfo(reqKey: VideoKey) {
        let url = "http://ext.nicovideo.jp/api/getthumbinfo/" + reqKey.id;
        this._fetchUrl(reqKey, url);
    }

    private _fetchGetFlv(reqKey: VideoKey) {
        let url = "http://www.nicovideo.jp/api/getflv/" + reqKey.id;
        this._fetchUrl(reqKey, url);
    }

    private _fetchUrl(reqKey: VideoKey, url: string) {
        let req = Request.get(url);
        NicoThumbinfoActionCreator.createUrlFetchAction(
            this._key, req, reqKey, DataSource.GetThumbinfo);
        this._loadingUrl = url;
    }

    private _convertGetThumbinfoError(errorCode: ResponseErrorCode): ErrorCode {
        switch (errorCode) {
        case ResponseErrorCode.HttpStatus:
            return ErrorCode.HttpStatus;
        case ResponseErrorCode.ServerMaintenance:
            return ErrorCode.ServerMaintenance;
        case ResponseErrorCode.Invalid:
            return ErrorCode.Invalid;
        case ResponseErrorCode.Deleted:
            return ErrorCode.Deleted;
        case ResponseErrorCode.Community:
            return ErrorCode.Community;
        case ResponseErrorCode.CommunitySubThread:
            return ErrorCode.CommunitySubThread;
        case ResponseErrorCode.NotFound:
            return ErrorCode.NotFound;
        }
    }
}
