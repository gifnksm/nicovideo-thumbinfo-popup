/// <reference path="../../../../../typings/common.d.ts" />
"use strict";

import GetThumbinfoParser from "../../../../../src/nico_thumbinfo/stores/parser/GetThumbinfoParser";
import {ErrorCode, ErrorInfo} from "../../../../../src/nico_thumbinfo/stores/GetThumbinfoFetcher";
import RawVideoData from "../../../../../src/nico_thumbinfo/stores/RawVideoData";
import VideoKey from "../../../../../src/nico_thumbinfo/stores/VideoKey";
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

function failTest() {
    throw new Error("Expected promise to be rejected but it was fulfilled");
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

describe("nico_thumbinfo/stores/parser/GetThumbinfoParser", () => {
    let key = VideoKey.fromVideoId("sm9");

    it("should fails if input is empty", () => {
        checkError(ErrorCode.Invalid, key, "", /^XML Parse Error: /);
    });

    it("should fails if input is odd but valid XML.", () => {
        checkError(ErrorCode.Invalid, key, "<unknown_element></unknown_element>",
                   `XML Format Error: Root element name is "unknown_element".`);
    });

    it("should return parse result if valid input is given.", () => {
        return getUrl("/base/etc/resource/getthumbinfo/sm9")
            .then(input => GetThumbinfoParser.parse(key, input))
            .then(data => {
                if (data instanceof RawVideoData) {
                    assert(data.thumbType !== undefined);
                    assert(data.videoId === "sm9");
                    assert(data.title !== undefined);
                    assert(data.description !== undefined);
                    assert(data.thumbnailUrl !== undefined);
                    assert(data.postedAt !== undefined);
                    assert(data.lengthInSeconds !== undefined);
                    assert(data.viewCounter !== undefined);
                    assert(data.commentCounter !== undefined);
                    assert(data.mylistCounter !== undefined);
                    assert(data.lastResBody !== undefined);
                    assert(data.tags !== undefined);
                    assert(data.uploader !== undefined);
                } else {
                    console.error("data is not instanceof RawVideoData: ", data);
                    throw new Error("data is not instanceof RawVideoData");
                }
            });
    });

    it("should return error if deleted video is given.", () => {
        let key = VideoKey.fromVideoId("sm22532786");
        return getUrl("/base/etc/resource/getthumbinfo/sm22532786")
            .then(input => {
                checkError(ErrorCode.Deleted, key, input, "deleted");
            });
    });

    it("should return error if community only video is given.", () => {
        let key = VideoKey.fromThreadId("1340979099");
        return getUrl("/base/etc/resource/getthumbinfo/1340979099")
            .then(input => {
                checkError(ErrorCode.Community, key, input, "community");
            });
    });

    it("should return error if outdated video is given.", () => {
        let key = VideoKey.fromThreadId("so19903664");
        return getUrl("/base/etc/resource/getthumbinfo/so19903664")
            .then(input => {
                checkError(ErrorCode.NotFound, key, input, "not found or invalid");
            });
    });
});
