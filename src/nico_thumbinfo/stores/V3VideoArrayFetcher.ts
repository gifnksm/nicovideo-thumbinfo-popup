/// <reference path="../../../typings/bundle.d.ts" />
"use strict";

import NicopediaFetcher from "./NicopediaFetcher";

import ErrorInfo, {ErrorCode} from "../models/ErrorInfo";
import VideoKey from "../models/VideoKey";
import RawVideoData from "../models/RawVideoData";
import {User} from "../models/Uploader";

import NicoThumbinfoActionCreator from "../actions/NicoThumbinfoActionCreator";
import NicoThumbinfoAction from "../actions/NicoThumbinfoAction";
import UrlFetchAction, {Source, SourceType} from "../actions/UrlFetchAction";
import V3VideoArrayFetchAction from "../actions/V3VideoArrayFetchAction";
import NicopediaFetchAction from "../actions/NicopediaFetchAction";
import UserNameFetchAction from "../actions/UserNameFetchAction";

import {Option, Some, None} from "option-t";

export default class V3VideoArrayFetcher {
    private _key: VideoKey;
    private _source: Source;

    private _errorInfo: Option<ErrorInfo> = new None<ErrorInfo>();
    private _videoData: Option<RawVideoData> = new None<RawVideoData>();

    get errorInfo() { return this._errorInfo; }
    get videoData() { return this._videoData; }
    get isCompleted() { return this._videoData.isSome }
    get isErrored() { return this._errorInfo.isSome }
    get isStopped() { return this.isCompleted || this.isErrored }

    constructor(key: VideoKey) {
        this._key = key;
        this._source = new Source(SourceType.V3VideoArray, this._key);

        this._fetchV3VideoArray(this._key);
    }

    handleAction(action: NicoThumbinfoAction): boolean {
        if (!(action instanceof UrlFetchAction) ||
            action.source.sourceType !== this._source.sourceType) {
            return false;
        }

        if (action instanceof V3VideoArrayFetchAction) {
            return this._handleV3VideoArrayFetchAction(action);
        }

        if (action instanceof NicopediaFetchAction) {
            return this._handleNicopediaFetchAction(action);
        }

        if (action instanceof UserNameFetchAction) {
            return this._handleUserNameFetchAction(action);
        }

        throw new Error("BUG: unreachable");
    }

    private _fetchV3VideoArray(reqKey: VideoKey) {
        NicoThumbinfoActionCreator.createV3VideoArrayFetchAction(this._source, reqKey);
    }

    private _fetchNicopedia() {
        if (this._videoData.isNone) {
            console.warn("this._videoData.isNone", this);
            return;
        }

        NicopediaFetcher.fetch(this._videoData.unwrap(), this._source);
    }

    private _fetchUserName() {
        if (this._videoData.isNone) {
            console.warn("this._videoData.isNone", this);
            return;
        }

        this._videoData.unwrap().uploader.map(uploader => {
            if (uploader instanceof User) {
                uploader.id.map(id => {
                    NicoThumbinfoActionCreator.createUserNameFetchAction(this._source, id);
                });
            }
        });
    }

    private _handleV3VideoArrayFetchAction(action: V3VideoArrayFetchAction): boolean {
        let payload = action.payload;

        if (payload instanceof RawVideoData) {
            this._videoData = new Some(payload);
            this._fetchNicopedia();
            this._fetchUserName();
            return true;
        }

        if (payload instanceof ErrorInfo) {
            this._errorInfo = new Some(payload);
            return true;
        }

        throw new Error("BUG: unreachable");
    }

    private _handleNicopediaFetchAction(action: NicopediaFetchAction): boolean {
        if (this._videoData.isNone) {
            console.warn("this._videoData.isNone", this);
            return false;
        }
        return NicopediaFetcher.handleAction(action, this._videoData.unwrap());
    }

    private _handleUserNameFetchAction(action: UserNameFetchAction): boolean {
        if (this._videoData.isNone) {
            console.warn("this._videoData.isNone", this);
            return false;
        }

        let payload = action.payload;
        if (typeof payload === "string") {
            this._videoData.unwrap().uploader.map(uploader => {
                uploader.name = new Some(payload);
            });
            return true;
        }
        if (payload instanceof ErrorInfo) {
            // Ignore errors
            return false;
        }

        throw new Error("BUG: unreachable");
    }
}
