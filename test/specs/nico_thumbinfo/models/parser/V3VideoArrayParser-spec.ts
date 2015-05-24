/// <reference path="../../../../../typings/common.d.ts" />
"use strict";

import ParseResult from "./ParseResult";

import V3VideoArrayParser from "../../../../../src/nico_thumbinfo/models/parser/V3VideoArrayParser";

import {DataSource} from "../../../../../src/nico_thumbinfo/models/constants";
import {ThumbType} from "../../../../../src/nico_thumbinfo/models/constants";
import VideoKey from "../../../../../src/nico_thumbinfo/models/VideoKey";
import ErrorInfo, {ErrorCode} from "../../../../../src/nico_thumbinfo/models/ErrorInfo";
import RawVideoData from "../../../../../src/nico_thumbinfo/models/RawVideoData";

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
    let data = V3VideoArrayParser.parse(key, input);
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

describe("nico_thumbinfo/models/parser/V3VideoArrayParser", () => {
    let key = VideoKey.fromVideoId("sm9");

    it("should fails if input is empty", () => {
        checkError(ErrorCode.Invalid, key, "", /^XML Parse Error: /);
    });

    it("should fails if input is odd but valid XML.", () => {
        checkError(ErrorCode.Invalid, key, "<unknown_element></unknown_element>",
                   `XML Format Error: Root element name is "unknown_element".`);
    });

    it("should return parse result if valid input is given.", () => {
        return getUrl("/base/etc/resource/v3videoarray/sm9")
            .then(input => V3VideoArrayParser.parse(key, input))
            .then(data => assert.deepEqual(ParseResult["sm9"](DataSource.V3VideoArray), data));
    });
    it("should return parse result if deleted video is given.", () => {
        let key = VideoKey.fromVideoId("sm22532786");
        return getUrl("/base/etc/resource/v3videoarray/sm22532786")
            .then(input => V3VideoArrayParser.parse(key, input))
            .then(data => assert.deepEqual(ParseResult["sm22532786"](DataSource.V3VideoArray), data));
    });
    it("should return parse result if community only video is given.", () => {
        let key = VideoKey.fromThreadId("1340979099");
        return getUrl("/base/etc/resource/v3videoarray/1340979099")
            .then(input => V3VideoArrayParser.parse(key, input))
            .then(data => assert.deepEqual(ParseResult["1340979099"](DataSource.V3VideoArray), data));
    });
    it("should return error if outdated video is given.", () => {
        let key = VideoKey.fromVideoId("so19903664");
        return getUrl("/base/etc/resource/v3videoarray/so19903664")
            .then(input => V3VideoArrayParser.parse(key, input))
            .then(data => assert.deepEqual(ParseResult["so19903664"](DataSource.V3VideoArray), data));
    });
});
