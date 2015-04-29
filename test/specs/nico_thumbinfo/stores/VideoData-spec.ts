/// <reference path="../../../../typings/common.d.ts" />

import VideoKey from "../../../../src/nico_thumbinfo/stores/VideoKey";
import {Data, RawData} from "../../../../src/nico_thumbinfo/stores/VideoData";
import * as assert from "power-assert";
import {Option, Some, None} from "option-t";

describe("nico_thumbinfo/stores/VideoData", () => {
    let key = VideoKey.fromVideoId("sm9");

    let getThumbInfo = RawData.createGetThumbinfo(key);
    getThumbInfo.description = ["getthumbinfo description"];
    getThumbInfo.title = "getthumbinfo title";
    getThumbInfo.lastResBody = "getthumbinfo lastResBody";

    let videoArray = RawData.createV3VideoArray(key);
    videoArray.description = ["videoarray description"];
    videoArray.title = "videoarray title";

    let watchPage = RawData.createWatchPage(key);
    watchPage.description = ["watchpage description"];

    it("should empty when no raw data is pushed.", () => {
        let data = new Data(key);
        assert(data.isEmpty);
    });

    it("should returns pushed data.", () => {
        function check(raw: RawData, value: string[]) {
            let data = new Data(key);
            data.pushRawData(raw);
            assert(data.description.length === 1)
            assert(data.description[0] === value[0]);
        }
        check(getThumbInfo, <string[]>getThumbInfo.description);
        check(videoArray, <string[]>videoArray.description);
        check(watchPage, <string[]>watchPage.description);
    });

    it("should overwrite the property with higher priority rawData's value.", () => {
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

    it("should not overwrite the property when higher priority rawData's value is undefined.", () => {
        let data = new Data(key);
        data.pushRawData(getThumbInfo);
        data.pushRawData(videoArray);
        data.pushRawData(watchPage);

        assert(data.description === watchPage.description);
        assert(data.title === videoArray.title);
        assert(data.lastResBody === getThumbInfo.lastResBody);
    })
});
