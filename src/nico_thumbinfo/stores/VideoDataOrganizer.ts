/// <reference path="../../../typings/common.d.ts" />
"use strict";

import VideoKey from "./VideoKey";
import VideoData from "./VideoData";
import RawVideoData from "./RawVideoData";
import GetThumbinfoResponseHandler, {ErrorInfo as GetThumbinfoErrorInfo, ErrorCode as GetThumbinfoErrorCode} from "./GetThumbinfoResponseHandler";
import NicoThumbinfoAction from "../actions/NicoThumbinfoAction";
import NicoThumbinfoActionCreator from "../actions/NicoThumbinfoActionCreator";
import UrlFetchAction from "../actions/UrlFetchAction";
import UrlFetchResponseAction from "../actions/UrlFetchResponseAction";
import UrlFetchErrorAction from "../actions/UrlFetchErrorAction";
import {DataSource} from "../stores/constants";
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
        constructor(url: string) {
            super(State.Loading);
            this._url = url;
        }
        get url() { return this._url; }
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

class SourceState {
    private _state: StateStorage = new StateStorage.Initial();
    private _errorCode: ErrorCode = undefined;
    private _errorDetail: string = null;

    get state() { return this._state; }
    get errorCode() { return this._errorCode; }
    get errorDetail() { return this._errorDetail; }

    setError(errorCode: ErrorCode, errorDetail: string) {
        this._errorCode = errorCode;
        this._errorDetail = errorDetail;
    }

    transToLoading(url: string) {
        this._state = new StateStorage.Loading(url);
    }

    transToConfirm(errorCode: ErrorCode, errorDetail: string) {
        this._errorCode = errorCode;
        this._errorDetail = errorDetail;
        this._state = new StateStorage.Confirm();
    }

    transToError(errorCode: ErrorCode, errorDetail: string) {
        this._errorCode = errorCode;
        this._errorDetail = errorDetail;
        this._state = new StateStorage.Error();
    }

    transToCompleted() {
        this._state = new StateStorage.Completed();
    }

    transToAbend(error: string) {
        this._state = new StateStorage.Abend(error);
    }
}

export default class VideoDataOrganizer {
    private _key: VideoKey;
    private _videoData: VideoData;
    private _getThumbinfoState: SourceState;

    constructor(key: VideoKey) {
        this._key = key;
        this._videoData = new VideoData(key);
        this._getThumbinfoState = new SourceState();

        this._fetchGetThumbinfo(this._key);
    }

    handleAction(action: NicoThumbinfoAction, callback: () => void): boolean {
        if (action instanceof UrlFetchAction) {
            switch (action.source) {
            case DataSource.GetThumbinfo:
                return this._handleGetThumbinfoResponse(action, callback);
            }
        }

        return false;
    }

    get key() { return this._key; }
    get videoData() { return this._videoData; }

    // TODO: implements
    // get state() { return this._state.state; }
    // get errorCode() { return this._errorCode; }
    // get errorDetail() { return this._errorDetail; }

    private _fetchGetThumbinfo(reqKey: VideoKey) {
        let url = "http://ext.nicovideo.jp/api/getthumbinfo/" + reqKey.id;
        let req = Request.get(url);
        NicoThumbinfoActionCreator.createUrlFetchAction(this.key, req, reqKey, DataSource.GetThumbinfo);
        this._getThumbinfoState.transToLoading(url);
    }

    private _fetchGetFlv(reqKey: VideoKey) {
        let url = "http://www.nicovideo.jp/api/getflv/" + reqKey.id;
        let req = Request.get(url);
        NicoThumbinfoActionCreator.createUrlFetchAction(this.key, req, reqKey, DataSource.GetThumbinfo);
        this._getThumbinfoState.transToLoading(url);
    }

    private _handleGetThumbinfoResponse(action: UrlFetchAction, callback: () => void): boolean {
        let state = this._getThumbinfoState.state;

        if (!(state instanceof StateStorage.Loading) || (state.url !== action.request.url)) {
            console.warn("status does not match", state, action);
            return false;
        }

        if (action instanceof UrlFetchErrorAction) {
            this._getThumbinfoState.transToAbend(action.error);
            return true;
        }

        if (action instanceof UrlFetchResponseAction) {
            GetThumbinfoResponseHandler.handle(action)
                .then(
                    videoData => {
                        this._videoData.pushRawVideoData(videoData);
                        this._getThumbinfoState.transToCompleted();
                        callback();
                    },
                    (data: GetThumbinfoErrorInfo) => {
                        this._handleGetThumbinfoError(data);
                        callback();
                    }
                );
            return false;
        }

        console.warn("Fetch response does not handled: ", state, action);
        return false;
    }

    private _handleGetThumbinfoError(data: GetThumbinfoErrorInfo) {
        switch (data.errorCode) {
        case GetThumbinfoErrorCode.Status:
            this._getThumbinfoState.transToError(ErrorCode.GetThumbinfoStatus, data.errorDetail);
            break;

        case GetThumbinfoErrorCode.Empty:
            this._getThumbinfoState.transToError(ErrorCode.GetThumbinfoEmpty, data.errorDetail);
            break;

        case GetThumbinfoErrorCode.Invalid:
            this._getThumbinfoState.transToError(ErrorCode.GetThumbinfoInvalid, data.errorDetail);
            break;

        case GetThumbinfoErrorCode.Deleted:
            this._getThumbinfoState.transToConfirm(ErrorCode.GetThumbinfoDeleted, data.errorDetail);
            break;

        case GetThumbinfoErrorCode.Community:
            this._getThumbinfoState.transToConfirm(ErrorCode.GetThumbinfoCommunity, data.errorDetail);
            break;

        case GetThumbinfoErrorCode.CommunitySubThread:
            this._getThumbinfoState.setError(ErrorCode.GetThumbinfoCommunitySubThread, data.errorDetail);
            this._fetchGetFlv(this._key);
            break;

        case GetThumbinfoErrorCode.NotFound:
            this._getThumbinfoState.transToError(ErrorCode.GetThumbinfoNotFound, data.errorDetail);
            break;
        }
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

