/// <reference path="../../../../typings/common.d.ts" />
"use strict";

import VideoKey from "../../../../src/nico_thumbinfo/stores/VideoKey";
import VideoData from "../../../../src/nico_thumbinfo/stores/VideoData";
import RawVideoData from "../../../../src/nico_thumbinfo/stores/RawVideoData";
import * as assert from "power-assert";
import {Option, Some, None} from "option-t";

describe("nico_thumbinfo/stores/VideoData", () => {
    let key = VideoKey.fromVideoId("sm9");

    let getThumbInfo = RawVideoData.createGetThumbinfo(key);
    getThumbInfo.description = ["getthumbinfo description"];
    getThumbInfo.title = "getthumbinfo title";
    getThumbInfo.lastResBody = "getthumbinfo lastResBody";

    let videoArray = RawVideoData.createV3VideoArray(key);
    videoArray.description = ["videoarray description"];
    videoArray.title = "videoarray title";

    let watchPage = RawVideoData.createWatchPage(key);
    watchPage.description = ["watchpage description"];

    it("should empty when no raw data is pushed.", () => {
        let data = new VideoData(key);
        assert(data.isEmpty);
    });

    it("should returns pushed data.", () => {
        function check(raw: RawVideoData, value: string[]) {
            let data = new VideoData(key);
            data.pushRawVideoData(raw);
            assert(data.description.length === 1)
            assert(data.description[0] === value[0]);
        }
        check(getThumbInfo, <string[]>getThumbInfo.description);
        check(videoArray, <string[]>videoArray.description);
        check(watchPage, <string[]>watchPage.description);
    });

    it("should overwrite the property with higher priority rawVideoData's value.", () => {
        let data = new VideoData(key);
        data.pushRawVideoData(getThumbInfo);
        data.pushRawVideoData(videoArray);

        assert(data.description === videoArray.description);
        data.pushRawVideoData(watchPage);
        assert(data.description === watchPage.description);

        data = new VideoData(key);
        data.pushRawVideoData(getThumbInfo);
        data.pushRawVideoData(watchPage);
        assert(data.description === watchPage.description);
    });

    it("should not overwrite the property when higher priority rawVideoData's value is undefined.", () => {
        let data = new VideoData(key);
        data.pushRawVideoData(getThumbInfo);
        data.pushRawVideoData(videoArray);
        data.pushRawVideoData(watchPage);

        assert(data.description === watchPage.description);
        assert(data.title === videoArray.title);
        assert(data.lastResBody === getThumbInfo.lastResBody);
    })
});

