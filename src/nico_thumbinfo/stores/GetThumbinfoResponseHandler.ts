/// <reference path="../../../typings/common.d.ts" />
"use strict";

import VideoKey from "./VideoKey";
import VideoData from "./VideoData";
import RawVideoData from "./RawVideoData";
import GetThumbinfoParser, {GetThumbinfoError as ParserError, ErrorCode as ParserErrorCode} from "./parser/GetThumbinfoParser";

import UrlFetchResponseAction from "../actions/UrlFetchResponseAction";

export const enum ErrorCode {
    HttpStatus,
    ServerMaintenance,
    Invalid,
    Deleted,
    Community,
    CommunitySubThread,
    NotFound
}

export interface ErrorInfo {
    errorCode: ErrorCode;
    errorDetail?: string;
}

module GetThumbinfoResponseHandler {
    export function handle(action: UrlFetchResponseAction): Promise<RawVideoData> {
        return new Promise((resolve, reject) => {
            if (action.response.status !== 200) {
                reject(<ErrorInfo>{
                    errorCode: ErrorCode.HttpStatus,
                    errorDetail: action.response.statusText
                });
                return;
            }

            if (action.response.responseText === "") {
                reject(<ErrorInfo>{
                    errorCode: ErrorCode.ServerMaintenance
                });
                return;
            }

            resolve(GetThumbinfoParser.parse(action.requestKey, action.response.responseText));
        }).then(
            (data: RawVideoData|ParserError) => {
                let result: RawVideoData = _handleParseResult(action.requestKey, data);
                return result;
            },
            error => {
                throw <ErrorInfo>{errorCode: ErrorCode.Invalid, errorDetail: "" + error}
                return null; // dummy return value
            }
        );
    }

    function _handleParseResult(reqKey: VideoKey, data: RawVideoData|ParserError): RawVideoData {
        // Success
        if (data instanceof RawVideoData) {
            return data;
        }

        // Failure
        if (data instanceof ParserError) {
            switch (data.code) {
            case ParserErrorCode.Deleted:
                throw <ErrorInfo>{
                    errorCode: ErrorCode.Deleted,
                    errorDetail: data.description
                };

            case ParserErrorCode.Community:
                if (reqKey.type === VideoKey.Type.ThreadId) {
                    throw <ErrorInfo>{
                        errorCode: ErrorCode.CommunitySubThread,
                        errorDetail: data.description
                    };
                }
                throw <ErrorInfo>{
                    errorCode: ErrorCode.Community,
                    errorDetail: data.description
                };

            case ParserErrorCode.NotFound:
                throw <ErrorInfo>{
                    errorCode: ErrorCode.NotFound,
                    errorDetail: data.description
                };

            default:
                throw new Error("Unknown code: " + data.code)
            }
        }

        throw new Error("invalid data returned.");
    }
}

export default GetThumbinfoResponseHandler;
