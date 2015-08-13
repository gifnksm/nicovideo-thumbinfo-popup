/// <reference path="../../../../typings/bundle.d.ts" />
"use strict";

import VideoKey from "../VideoKey";
import ErrorInfo, {ErrorCode} from "../ErrorInfo";

import * as querystring from "querystring";

namespace GetFlvParser {
    export function parse(input: string): VideoKey|ErrorInfo {
        let data = querystring.parse(input);
        if (data.hasOwnProperty("error")) {
            switch (data.error) {
            case "invalid_v1":
                return new ErrorInfo(ErrorCode.Deleted);
            case "invalid_v2":
                return new ErrorInfo(ErrorCode.DeletedAsPrivate);
            case "invalid_v3":
                return new ErrorInfo(ErrorCode.DeletedByContentHolder);
            case "invalid_thread":
                return new ErrorInfo(ErrorCode.NotFound);
            case "cant_get_detail":
                return new ErrorInfo(ErrorCode.Deleted);
            case "access_locked":
                return new ErrorInfo(ErrorCode.AccessLocked);
            default:
                console.warn("Unknown getflv error:", data, input);
                return new ErrorInfo(ErrorCode.Unknown);
            }
        }

        if (data.hasOwnProperty("deleted")) {
            switch (data.deleted) {
            case "1":
                return new ErrorInfo(ErrorCode.DeletedByUploader);
            case "2":
                return new ErrorInfo(ErrorCode.DeletedByAdmin);
            case "3":
                return new ErrorInfo(ErrorCode.DeletedByContentHolder);
            case "8":
                return new ErrorInfo(ErrorCode.DeletedAsPrivate);
            default:
                console.warn("Unknown getflv deleted:", data, input);
                return new ErrorInfo(ErrorCode.Unknown);
            }
        }

        if (data.hasOwnProperty("optional_thread_id")) {
            return VideoKey.fromOptionalThreadId(data.optional_thread_id);
        }

        if (data.hasOwnProperty("closed")) {
            return new ErrorInfo(ErrorCode.NotLoggedIn);
        }

        console.warn("unkown getflv error", data);
        return new ErrorInfo(ErrorCode.Unknown);
    }
}

export default GetFlvParser;
