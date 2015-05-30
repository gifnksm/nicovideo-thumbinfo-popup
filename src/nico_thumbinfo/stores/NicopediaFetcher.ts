/// <reference path="../../../typings/bundle.d.ts" />
"use strict";

import RawVideoData from "../models/RawVideoData";
import ErrorInfo, {ErrorCode} from "../models/ErrorInfo";

import {Source} from "../actions/UrlFetchAction";
import NicoThumbinfoActionCreator from "../actions/NicoThumbinfoActionCreator";
import NicopediaFetchAction, {NicopediaInfo, Type as NicopediaType} from "../actions/NicopediaFetchAction";

import {Option, Some, None} from "option-t";

module NicopediaFetcher {
    export function fetch(videoData: RawVideoData, source: Source) {
        _fetchVideo(videoData, source);
        _fetchTags(videoData, source);
    }

    export function handleAction(action: NicopediaFetchAction, videoData: RawVideoData): boolean {
        let payload = action.payload;

        if (payload instanceof NicopediaInfo) {
            switch (payload.type) {
            case NicopediaType.Article:
                let found = false;
                for (let tag of videoData.tags) {
                    if (tag.name === payload.name) {
                        tag.nicopediaRegistered = new Some(payload.registered);
                        found = true;
                    }
                }
                if (!found) {
                    console.warn("Not found tag: ", payload.name, action);
                }

                return found;

            case NicopediaType.Video:
                videoData.nicopediaRegistered = new Some(payload.registered);
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

        throw new Error("BUG: unreachable");
    }

    function _fetchVideo(videoData: RawVideoData, source: Source) {
        videoData.videoId.map(videoId => {
            NicoThumbinfoActionCreator.createNicopediaFetchAction(
                source, NicopediaType.Video, videoId);
        });
    }

    function _fetchTags(videoData: RawVideoData, source: Source) {
        for (let tag of videoData.tags) {
            NicoThumbinfoActionCreator.createNicopediaFetchAction(
                source, NicopediaType.Article, tag.name);
        };
    }
}

export default NicopediaFetcher;
