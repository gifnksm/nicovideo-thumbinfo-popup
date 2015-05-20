/// <reference path="../../../typings/common.d.ts" />
"use strict";

import VideoKey from "./VideoKey";
import VideoData from "./VideoData";
import RawVideoData from "./RawVideoData";
import GetThumbinfoParser from "./parser/GetThumbinfoParser";
import {ErrorCode, ErrorInfo} from "./GetThumbinfoFetcher";

import UrlFetchResponseAction from "../actions/UrlFetchResponseAction";

module GetThumbinfoResponseHandler {
    export function handle(action: UrlFetchResponseAction): RawVideoData|ErrorInfo {
        if (action.response.status !== 200) {
            return new ErrorInfo(ErrorCode.HttpStatus, action.response.statusText);
        }

        if (action.response.responseText === "") {
            return new ErrorInfo(ErrorCode.ServerMaintenance);
        }

        let result = GetThumbinfoParser.parse(action.requestKey, action.response.responseText);

        if (result instanceof RawVideoData) {
            return result;
        }

        if (result instanceof ErrorInfo) {
            if (result.errorCode === ErrorCode.Community &&
                action.requestKey.type === VideoKey.Type.ThreadId) {
                return new ErrorInfo(ErrorCode.CommunitySubThread, result.errorDetail);
            }
            return result;
        }

        console.warn("Unknown result: ", result);
        return new ErrorInfo(ErrorCode.Invalid, "" + result);
    }
}

export default GetThumbinfoResponseHandler;
