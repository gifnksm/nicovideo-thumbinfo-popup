/// <reference path="../../../../../typings/bundle.d.ts" />
"use strict";

import ParseResult from "./ParseResult";

import GetThumbinfoParser from "../../../../../src/nico_thumbinfo/models/parser/GetThumbinfoParser";

import {DataSource} from "../../../../../src/nico_thumbinfo/models/constants";
import ErrorInfo, {ErrorCode} from "../../../../../src/nico_thumbinfo/models/ErrorInfo";
import RawVideoData from "../../../../../src/nico_thumbinfo/models/RawVideoData";
import VideoKey from "../../../../../src/nico_thumbinfo/models/VideoKey";

import * as assert from "power-assert";

function getUrl(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
        let req = new XMLHttpRequest();
        req.open("GET", url);
        req.onload = () => {
            if (req.status === 200) {
                resolve(req.response);
            } else {
                reject(new Error(req.statusText));
            }
        };

        req.onerror = () => {
            reject(new Error(req.statusText));
        };

        req.send();
    });
}

function checkError(code: ErrorCode, key: VideoKey, input: string, reg: RegExp|string) {
    let data = GetThumbinfoParser.parse(key, input);
    if (data instanceof ErrorInfo) {
        assert(data.errorCode === code);
        if (reg instanceof RegExp) {
            assert(reg.test(data.errorDetail));
        } else {
            assert(data.errorDetail === reg);
        }
    } else {
        console.error("data is not instance of ErrorInfo: ", data);
        throw new Error("data is not instance of ErrorInfo");
    }
}

describe("nico_thumbinfo/models/parser/GetThumbinfoParser", () => {

    it("should fails if input is empty", () => {
        let key = VideoKey.fromVideoId("dummy");
        checkError(ErrorCode.Invalid, key, "", /^XML Parse Error: /);
    });

    it("should fails if input is odd but valid XML.", () => {
        let key = VideoKey.fromVideoId("dummy");
        checkError(ErrorCode.Invalid, key, "<unknown_element></unknown_element>",
                   `XML Format Error: Root element name is "unknown_element".`);
    })

    it("should return parse result if valid input (sm9) is given.", () => {
        let key = VideoKey.fromVideoId("sm9");
        return getUrl("/base/etc/resource/getthumbinfo/sm9")
            .then(input => GetThumbinfoParser.parse(key, input))
            .then(data => assert.deepEqual(ParseResult["sm9"](DataSource.GetThumbinfo), data));
    });

    it("should return error if deleted video (sm22532786) is given.", () => {
        let key = VideoKey.fromVideoId("sm22532786");
        return getUrl("/base/etc/resource/getthumbinfo/sm22532786")
            .then(input => {
                checkError(ErrorCode.Deleted, key, input, "deleted");
            });
    });

    it("should return error if community only video (1340979099) is given.", () => {
        let key = VideoKey.fromThreadId("1340979099");
        return getUrl("/base/etc/resource/getthumbinfo/1340979099")
            .then(input => {
                checkError(ErrorCode.Community, key, input, "community");
            });
    });

    it("should return error if outdated video (so19903664) is given.", () => {
        let key = VideoKey.fromThreadId("so19903664");
        return getUrl("/base/etc/resource/getthumbinfo/so19903664")
            .then(input => {
                checkError(ErrorCode.NotFound, key, input, "not found or invalid");
            });
    });
});
