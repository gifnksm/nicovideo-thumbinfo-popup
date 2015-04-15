/// <reference path="../../../../typings/common.d.ts" />

import VideoKey from "../../../../src/nico_thumbinfo/model/VideoKey";
import {Data, RawData} from "../../../../src/nico_thumbinfo/model/VideoData";
import * as assert from "power-assert";
import {Option, Some, None} from "option-t";

describe("nico_thumbinfo/model/VideoData", () => {
    let key = VideoKey.fromVideoId("sm9");

    let getThumbInfo = RawData.createGetThumbinfo(key);
    getThumbInfo.description = "getthumbinfo description";
    getThumbInfo.title = "getthumbinfo title";
    getThumbInfo.lastResBody = "getthumbinfo lastResBody";

    let videoArray = RawData.createV3VideoArray(key);
    videoArray.description = "videoarray description";
    videoArray.title = "videoarray title";

    let watchPage = RawData.createWatchPage(key);
    watchPage.description = "watchpage description";

    it("should empty when no raw data is pushed.", () => {
        let data = new Data(key);
        assert(data.isEmpty);
    });

    it("should returns pushed data.", () => {
        function check(raw: RawData, value: string) {
            let data = new Data(key);
            data.pushRawData(raw);
            assert(data.description === value);
        }
        check(getThumbInfo, getThumbInfo.description);
        check(videoArray, videoArray.description);
        check(watchPage, watchPage.description);
    });

    it("should be overwritten by higher priority rawData when merge is called.", () => {
        let data = new Data(key);
        data.pushRawData(getThumbInfo);
        data.pushRawData(videoArray);

        assert(data.description === videoArray.description);
        data.pushRawData(watchPage);
        assert(data.description === watchPage.description);

        data = new Data(key);
        data.pushRawData(getThumbInfo);
        data.pushRawData(watchPage);
        assert(data.description === watchPage.description);
    });

    it("should not overwrite the property when higher priority rawData's value is undefine.", () => {
        let data = new Data(key);
        data.pushRawData(getThumbInfo);
        data.pushRawData(videoArray);
        data.pushRawData(watchPage);

        assert(data.description === watchPage.description);
        assert(data.title === videoArray.title);
        assert(data.lastResBody === getThumbInfo.lastResBody);
    })
});
