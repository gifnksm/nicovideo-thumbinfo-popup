/// <reference path="../../../typings/bundle.d.ts" />
"use strict";

import NicopediaFetcher from "./NicopediaFetcher";

import ErrorInfo, {ErrorCode} from "../models/ErrorInfo";
import VideoKey from "../models/VideoKey";
import RawVideoData from "../models/RawVideoData";

import NicoThumbinfoActionCreator from "../actions/NicoThumbinfoActionCreator";
import UrlFetchAction, {Source, SourceType} from "../actions/UrlFetchAction";
import GetThumbinfoFetchAction from "../actions/GetThumbinfoFetchAction";
import GetFlvFetchAction from "../actions/GetFlvFetchAction";
import NicopediaFetchAction from "../actions/NicopediaFetchAction";

import {Option, Some, None} from "option-t";
import * as querystring from "querystring";

export const enum State {
    Initial, Loading, Completed, Error
}

export default class GetThumbinfoFetcher {
    private _key: VideoKey;
    private _source: Source;

    private _state: State = State.Initial;
    private _errorInfo: Option<ErrorInfo> = new None<ErrorInfo>();
    private _videoData: Option<RawVideoData> = new None<RawVideoData>();

    get state() { return this._state; }
    get errorInfo() { return this._errorInfo; }
    get videoData() { return this._videoData; }

    constructor(key: VideoKey) {
        this._key = key;
        this._source = new Source(SourceType.GetThumbinfo, this._key);

        this._fetchGetThumbinfo(this._key);
        this._state = State.Loading;
    }

    handleAction(action: UrlFetchAction): boolean {
        if (action instanceof GetThumbinfoFetchAction) {
            return this._handleGetThumbinfoFetchAction(action);
        }

        if (action instanceof GetFlvFetchAction) {
            return this._handleGetFlvFetchAction(action);
        }

        if (action instanceof NicopediaFetchAction) {
            return this._handleNicopediaFetchAction(action);
        }

        console.warn("Fetch response does not handled: ", action);
        return false;
    }

    private _fetchGetThumbinfo(reqKey: VideoKey) {
        NicoThumbinfoActionCreator.createGetThumbinfoFetchAction(this._source, reqKey);
    }

    private _fetchGetFlv(reqKey: VideoKey) {
        NicoThumbinfoActionCreator.createGetFlvFetchAction(this._source, reqKey);
    }

    private _fetchNicopedia() {
        if (this._videoData.isNone) {
            console.warn("this._videoData.isNone", this);
            return;
        }

        NicopediaFetcher.fetch(this._videoData.unwrap(), this._source);
    }

    private _handleGetThumbinfoFetchAction(action: GetThumbinfoFetchAction): boolean {
        let payload = action.payload;

        if (payload instanceof RawVideoData) {
            this._videoData = new Some(payload);
            this._state = State.Completed;
            this._fetchNicopedia();
            return true;
        }

        if (payload instanceof ErrorInfo) {
            this._errorInfo = new Some(payload);

            if (payload.errorCode === ErrorCode.CommunitySubThread ||
                payload.errorCode === ErrorCode.Deleted) {
                // コミュニティ動画の場合、getflv の optional_thread_id により、
                // 元動画の情報を取得できる可能性がある
                // 削除済み動画の場合、getflv の deleted/error により、
                // 詳細な削除理由が取得できる可能性がある
                this._fetchGetFlv(this._key);
                this._state = State.Loading;
            } else {
                this._state = State.Error;
            }

            return true;
        }

        console.warn("Unknown result: ", payload);
        this._state = State.Error;
        return true;
    }

    private _handleGetFlvFetchAction(action: GetFlvFetchAction): boolean {
        let payload = action.payload;

        if (payload instanceof VideoKey) {
            this._fetchGetThumbinfo(payload);
            this._state = State.Loading;
            return true;
        }

        if (payload instanceof ErrorInfo) {
            if (payload.errorCode !== ErrorCode.Unknown) {
                this._errorInfo = new Some(payload);
            } else {
                console.warn("Unknown getflv error:", action);
                // エラーコードは初回の getthumbinfo 時に設定されたもののままにする
            }
            this._state = State.Error;
            return true;
        }

        console.warn("Invalid getflv data:", action);
        // エラーコードは初回の getthumbinfo 時に設定されたもののままにする
        this._state = State.Error;
        return true;
    }

    private _handleNicopediaFetchAction(action: NicopediaFetchAction): boolean {
        if (this._videoData.isNone) {
            console.warn("this._videoData.isNone", this);
            return false;
        }
        return NicopediaFetcher.handleAction(action, this._videoData.unwrap());
    }
}
