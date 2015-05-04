/// <reference path="../../../../../typings/common.d.ts" />
"use strict";

import GetThumbinfoParser, {ErrorCode, GetThumbinfoError} from "../../../../../src/nico_thumbinfo/stores/parser/GetThumbinfoParser";
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

describe("nico_thumbinfo/stores/parser/GetThumbinfoParser", () => {
    let key = VideoKey.fromVideoId("sm9");

    it("should fails if input is empty", () => {
        return GetThumbinfoParser.parse(key, "")
            .then(failTest, (e: Error) => {
                assert(/^XML Parse Error: /.test(e.message))
            });
    });

    it("should fails if input is odd but valid XML.", () => {
        return GetThumbinfoParser.parse(key, "<unknown_element></unknown_element>")
            .then(failTest, (e: Error) => {
                assert(e.message === `XML Format Error: Root element name is "unknown_element".`);
            });
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
            .then(input => GetThumbinfoParser.parse(key, input))
            .then(data => {
                if (data instanceof GetThumbinfoError) {
                    assert(data.code === ErrorCode.Deleted);
                    assert(data.description === "deleted");
                } else {
                    console.error("data is not instance of GetThumbinfoError: ", data);
                    throw new Error("data is not instance of GetThumbinfoError");
                }
            });
    });

    it("should return error if community only video is given.", () => {
        let key = VideoKey.fromThreadId("1340979099");
        return getUrl("/base/etc/resource/getthumbinfo/1340979099")
            .then(input => GetThumbinfoParser.parse(key, input))
            .then(data => {
                if (data instanceof GetThumbinfoError) {
                    assert(data.code === ErrorCode.Community);
                    assert(data.description === "community");
                } else {
                    console.error("data is not instance of GetThumbinfoError: ", data);
                    throw new Error("data is not instance of GetThumbinfoError");
                }
            });
    });

    it("should return error if outdated video is given.", () => {
        let key = VideoKey.fromThreadId("so19903664");
        return getUrl("/base/etc/resource/getthumbinfo/so19903664")
            .then(input => GetThumbinfoParser.parse(key, input))
            .then(data => {
                if (data instanceof GetThumbinfoError) {
                    assert(data.code === ErrorCode.NotFound);
                    assert(data.description === "not found or invalid");
                } else {
                    console.error("data is not instance of GetThumbinfoError: ", data);
                    throw new Error("data is not instance of GetThumbinfoError");
                }
            });
    });
});
