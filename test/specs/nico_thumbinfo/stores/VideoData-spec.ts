/// <reference path="../../../../typings/common.d.ts" />
"use strict";

import VideoKey from "../../../../src/nico_thumbinfo/stores/VideoKey";
import VideoData from "../../../../src/nico_thumbinfo/stores/VideoData";
import RawVideoData from "../../../../src/nico_thumbinfo/stores/RawVideoData";
import {DescriptionText as DText} from "../../../../src/nico_thumbinfo/stores/DescriptionNode";
import * as assert from "power-assert";
import {Option, Some, None} from "option-t";

describe("nico_thumbinfo/stores/VideoData", () => {
    let key = VideoKey.fromVideoId("sm9");

    let getThumbinfo = RawVideoData.createGetThumbinfo(key);
    getThumbinfo.description = [new DText("getthumbinfo description")];
    getThumbinfo.title = "getthumbinfo title";
    getThumbinfo.lastResBody = "getthumbinfo lastResBody";

    let videoArray = RawVideoData.createV3VideoArray(key);
    videoArray.description = [new DText("videoarray description")];
    videoArray.title = "videoarray title";

    let watchPage = RawVideoData.createWatchPage(key);
    watchPage.description = [new DText("watchpage description")];

    it("should empty when no raw data is pushed.", () => {
        let data = new VideoData(key);
        assert(data.isEmpty);
    });

    it("should returns pushed data.", () => {
        function check(raw: RawVideoData, value: DText[]) {
            let data = new VideoData(key);
            data.pushRawVideoData(raw);
            assert(data.description.length === 1)
            assert((<DText[]>data.description)[0].text === value[0].text);
        }
        check(getThumbinfo, <DText[]>getThumbinfo.description);
        check(videoArray, <DText[]>videoArray.description);
        check(watchPage, <DText[]>watchPage.description);
    });

    it("should overwrite the property with higher priority rawVideoData's value.", () => {
        let data = new VideoData(key);
        data.pushRawVideoData(getThumbinfo);
        data.pushRawVideoData(videoArray);

        assert(data.description === videoArray.description);
        data.pushRawVideoData(watchPage);
        assert(data.description === watchPage.description);

        data = new VideoData(key);
        data.pushRawVideoData(getThumbinfo);
        data.pushRawVideoData(watchPage);
        assert(data.description === watchPage.description);
    });

    it("should not overwrite the property when higher priority rawVideoData's value is undefined.", () => {
        let data = new VideoData(key);
        data.pushRawVideoData(getThumbinfo);
        data.pushRawVideoData(videoArray);
        data.pushRawVideoData(watchPage);

        assert(data.description === watchPage.description);
        assert(data.title === videoArray.title);
        assert(data.lastResBody === getThumbinfo.lastResBody);
    })
});

