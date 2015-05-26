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

function checkOk(key: VideoKey) {
    return getUrl("/base/etc/resource/v3videoarray/" + key.id)
        .then(input => V3VideoArrayParser.parse(key, input))
        .then(data => {
            let expected = ParseResult[key.id](DataSource.V3VideoArray);

            // Help assertion
            for (let key of Object.keys(data)) {
                assert.deepEqual((<any>expected)[key], (<any>data)[key]);
            }
            for (let key of Object.keys(expected)) {
                assert.deepEqual((<any>expected)[key], (<any>data)[key]);
            }

            assert.deepEqual(expected, data)
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
    it("should fails if input is empty", () => {
        let key = VideoKey.fromVideoId("sm9");
        checkError(ErrorCode.Invalid, key, "", /^XML Parse Error: /);
    });

    it("should fails if input is odd but valid XML.", () => {
        let key = VideoKey.fromVideoId("sm9");
        checkError(ErrorCode.Invalid, key, "<unknown_element></unknown_element>",
                   `XML Format Error: Root element name is "unknown_element".`);
    });

    it("should return parse result if valid input is given.", () => {
        return checkOk(VideoKey.fromVideoId("sm9"));
    });
    it("should return parse result if deleted video is given.", () => {
        return checkOk(VideoKey.fromVideoId("sm22532786"));
    });
    it("should return parse result if community only video is given.", () => {
        return checkOk(VideoKey.fromThreadId("1340979099"));
    });
    it("should return parse result if outdated video is given.", () => {
        return checkOk(VideoKey.fromVideoId("so19903664"));
    });
    it("should return parse result if deleted-as-private video is given.", () => {
        return checkOk(VideoKey.fromVideoId("sm1"));
    });
    it("should fails if not found video is given.", () => {
        let key = VideoKey.fromVideoId("sm3");
        return getUrl("/base/etc/resource/v3videoarray/sm3")
            .then(input => {
                checkError(ErrorCode.NotFound, key, input,
                           `XML Format Error: There is no "video_info" elements.`);
            });
    });
    it("should return parse result if deleted-by-content-holder video is given.", () => {
        return checkOk(VideoKey.fromVideoId("sm24"));
    });
    it("should return parse result info if thread id video is given.", () => {
        return checkOk(VideoKey.fromThreadId("1182590816"));
    })
    it("should return parse result info if mymemory's thread id video is given.", () => {
        return checkOk(VideoKey.fromThreadId("1199124049"));
    })
    it("should return parse result info if community thread id video is given.", () => {
        return checkOk(VideoKey.fromThreadId("1406548974"));
    })
});
