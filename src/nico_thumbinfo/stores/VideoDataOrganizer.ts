/// <reference path="../../../typings/common.d.ts" />
"use strict";

import VideoKey from "./VideoKey";
import VideoData from "./VideoData";
import RawVideoData from "./RawVideoData";
import GetThumbinfoParser, {GetThumbinfoError, ErrorCode as GetThumbinfoParserErrorCode} from "./parser/GetThumbinfoParser";

import NicoThumbinfoAction from "../actions/NicoThumbinfoAction";
import NicoThumbinfoActionCreator from "../actions/NicoThumbinfoActionCreator";
import UrlFetchResponseAction from "../actions/UrlFetchResponseAction";
import UrlFetchErrorAction from "../actions/UrlFetchErrorAction";
import {Request, Response} from "../../util/UrlFetcher";

export const enum State {
    Initial, Loading, Confirm, Error, Completed, Abend
}

export class StateStorage {
    private _state: State;
    constructor(state: State) {
        this._state = state;
    }

    get state() { return this._state; }
}

export const enum ErrorCode {
    GetThumbinfoStatus,
    GetThumbinfoEmpty,
    GetThumbinfoInvalid,
    GetThumbinfoDeleted,
    GetThumbinfoCommunity,
    GetThumbinfoCommunitySubThread,
    GetThumbinfoNotFound
}

export module StateStorage {
    export class Initial extends StateStorage {
        constructor() { super(State.Initial); }
    }

    export class Loading extends StateStorage {
        _url: string;
        _target: Loading.Target;
        constructor(url: string, target: Loading.Target) {
            super(State.Loading);
            this._url = url;
            this._target = target;
        }
        get url() { return this._url; }
        get target() { return this._target; }
    }
    export module Loading {
        export const enum Target {
            GetThumbinfo, GetFlv, WatchPage
        }
    }

    export class Confirm extends StateStorage {
        constructor() { super(State.Confirm); }
    }

    export class Error extends StateStorage {
        constructor() { super(State.Error); }
    }

    export class Completed extends StateStorage {
        constructor() { super(State.Completed); }
    }

    export class Abend extends StateStorage {
        _error: string;
        constructor(error: string) { super(State.Abend); }
        get error() { return this._error; }
    }
}

export default class VideoDataOrganizer {
    private _key: VideoKey;
    private _state: StateStorage = new StateStorage.Initial();
    private _videoData: VideoData;
    private _errorCode: ErrorCode = undefined;
    private _errorDetail: string;

    constructor(key: VideoKey) {
        this._key = key;
        this._videoData = new VideoData(key);

        this._fetchGetThumbinfo();
    }

    handleAction(action: NicoThumbinfoAction, callback: () => void): boolean {
        let state = this._state;
        if (action instanceof UrlFetchResponseAction) {
            return this._handleUrlFetchResponse(action, callback);
        }
        if (action instanceof UrlFetchErrorAction) {
            return this._handleUrlFetchError(action, callback);
        }

        return false;
    }

    get key() { return this._key; }
    get state() { return this._state.state; }
    get videoData() { return this._videoData; }
    get errorCode() { return this._errorCode; }
    get errorDetail() { return this._errorDetail; }

    private _fetchGetThumbinfo(reqKey: VideoKey = this._key) {
        let url = "http://ext.nicovideo.jp/api/getthumbinfo/" + reqKey.id;
        let req = Request.get(url);
        NicoThumbinfoActionCreator.createUrlFetchAction(this.key, req, reqKey);
        this._state = new StateStorage.Loading(url, StateStorage.Loading.Target.GetThumbinfo);
    }

    private _fetchGetFlv(reqKey: VideoKey = this._key) {
        let url = "http://www.nicovideo.jp/api/getflv/" + reqKey.id;
        let req = Request.get(url);
        NicoThumbinfoActionCreator.createUrlFetchAction(this.key, req, reqKey);
        this._state = new StateStorage.Loading(url, StateStorage.Loading.Target.GetFlv);
    }

    private _handleUrlFetchError(action: UrlFetchErrorAction, callback: () => void): boolean {
        let state = this._state;
        if ((state instanceof StateStorage.Loading) && (state.url === action.request.url)) {
            this._state = new StateStorage.Abend(action.error);
            return true;
        }

        console.warn("Fetch response does not match: ", state, action);
        return false;
    }

    private _handleUrlFetchResponse(action: UrlFetchResponseAction, callback: () => void): boolean {
        let state = this._state;

        if ((state instanceof StateStorage.Loading) && (state.url === action.request.url)) {
            switch (state.target) {
            case StateStorage.Loading.Target.GetThumbinfo:
                return this._handleGetThumbinfoResponse(action, callback);

            case StateStorage.Loading.Target.GetFlv:
                return this._handleGetFlvResponse(action, callback);

            case StateStorage.Loading.Target.WatchPage:
                return this._handleWatchPageResponse(action, callback);

            default:
                console.error("Unknown target: ", state.target);
            }
        }

        console.warn("Fetch response does not handled: ", state, action);
        return false;
    }

    private _handleGetThumbinfoResponse(action: UrlFetchResponseAction, callback: () => void): boolean {
        if (action.response.status !== 200) {
            this._errorCode = ErrorCode.GetThumbinfoStatus;
            this._errorDetail = action.response.statusText;
            this._state = new StateStorage.Error();
            return true;
        }
        if (action.response.responesText === "") {
            this._errorCode = ErrorCode.GetThumbinfoEmpty;
            this._errorDetail = "";
            this._state = new StateStorage.Error();
            return true;
        }

        GetThumbinfoParser
            .parse(this._key, action.response.responesText)
            .then(
                data => this._handleGetThumbinfoParseResult(action.requestKey, data, callback),
                error => {
                    this._state = new StateStorage.Error();
                    this._errorCode = ErrorCode.GetThumbinfoInvalid;
                    this._errorDetail = "" + error;
                    callback();
                }
            );

        return false;
    }

    private _handleGetThumbinfoParseResult(reqKey: VideoKey, data: RawVideoData|GetThumbinfoError, callback: () => void) {
        // Success
        if (data instanceof RawVideoData) {
            this._videoData.pushRawVideoData(data);

            this._state = new StateStorage.Completed();
            callback();
            return;
        }

        // Failure
        if (data instanceof GetThumbinfoError) {
            this._updateErrorCodeByGetThumbinfoError(reqKey, data);

            switch (this._errorCode) {
            case ErrorCode.GetThumbinfoDeleted:
                this._state = new StateStorage.Confirm();
                break;
            case ErrorCode.GetThumbinfoCommunitySubThread:
                this._fetchGetFlv();
                break;
            case ErrorCode.GetThumbinfoCommunity:
                this._state = new StateStorage.Confirm();
                break;
            case ErrorCode.GetThumbinfoNotFound:
                this._state = new StateStorage.Error();
                break;
            default:
                console.error("Unknown code: ", this._errorCode);
            }

            callback();
            return;
        }

        console.error("invalid data returned.");
    }

    private _updateErrorCodeByGetThumbinfoError(reqKey: VideoKey, data: GetThumbinfoError) {
        switch (data.code) {
        case GetThumbinfoParserErrorCode.Deleted:
            this._errorCode = ErrorCode.GetThumbinfoDeleted;
            break;
        case GetThumbinfoParserErrorCode.Community:
            if (reqKey.type === VideoKey.Type.ThreadId) {
                this._errorCode = ErrorCode.GetThumbinfoCommunitySubThread;
            } else {
                this._errorCode = ErrorCode.GetThumbinfoCommunity;
            }
            break;
        case GetThumbinfoParserErrorCode.NotFound:
            this._errorCode = ErrorCode.GetThumbinfoNotFound;
            break;
        default:
            console.error("Unknown code: ", data.code);
        }
        this._errorDetail = data.description;
    }

    private _handleGetFlvResponse(action: UrlFetchResponseAction, callback: () => void): boolean {
        // TODO: implements
        return false;
    }

    private _handleWatchPageResponse(action: UrlFetchResponseAction, callback: () => void): boolean {
        // TODO: implements
        return false;
    }
}

