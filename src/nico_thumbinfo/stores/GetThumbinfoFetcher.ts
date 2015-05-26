/// <reference path="../../../typings/common.d.ts" />
"use strict";

import ErrorInfo, {ErrorCode} from "../models/ErrorInfo";
import VideoKey from "../models/VideoKey";
import RawVideoData from "../models/RawVideoData";

import NicoThumbinfoActionCreator from "../actions/NicoThumbinfoActionCreator";
import UrlFetchAction, {Source, SourceType} from "../actions/UrlFetchAction";
import GetThumbinfoFetchAction from "../actions/GetThumbinfoFetchAction";
import GetFlvFetchAction from "../actions/GetFlvFetchAction";
import NicopediaFetchAction, {NicopediaInfo, Type as NicopediaType} from "../actions/NicopediaFetchAction";

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

    private _fetchNicopediaVideo() {
        if (this._videoData.isNone) {
            console.warn("this._videoData.isNone", this);
            return;
        }

        this._videoData.map(videoData => {
            videoData.videoId.map(videoId => {
                NicoThumbinfoActionCreator.createNicopediaFetchAction(
                    this._source, NicopediaType.Video, videoId);
            });
        });
    }

    private _fetchNicopediaTag() {
        if (this._videoData.isNone) {
            console.warn("this._videoData.isNone", this);
            return;
        }

        this._videoData.map(videoData => {
            for (let tag of videoData.tags) {
                NicoThumbinfoActionCreator.createNicopediaFetchAction(
                    this._source, NicopediaType.Article, tag.name);
            };
        });

    }

    private _handleGetThumbinfoFetchAction(action: GetThumbinfoFetchAction): boolean {
        let payload = action.payload;

        if (payload instanceof RawVideoData) {
            this._videoData = new Some(payload);
            this._state = State.Completed;
            this._fetchNicopediaVideo();
            this._fetchNicopediaTag();
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
        let payload = action.payload;

        if (payload instanceof NicopediaInfo) {
            if (this._videoData.isNone) {
                console.warn("this._videoData.isNone", this);
                return false;
            }

            switch (payload.type) {
            case NicopediaType.Article:
                let found = false;
                this._videoData.map(videoData => {
                    for (let tag of videoData.tags) {
                        if (tag.name === payload.name) {
                            tag.nicopediaRegistered = new Some(payload.registered);
                            found = true;
                        }
                    }
                });
                if (!found) {
                    console.warn("Not found tag: ", payload.name, action);
                }

                return found;

            case NicopediaType.Video:
                this._videoData.map(videoData => {
                    videoData.nicopediaRegistered = new Some(payload.registered);
                });
                return false;

            default:
                console.warn("Invalid nicopedia type:", payload.type, action);
                return false;
            }
        }

        if (payload instanceof ErrorInfo) {
            // Ignore errors
            return false;
        }

        console.warn("Invalid nicopedia data:", action);
        return false;
    }
}
