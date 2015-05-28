/// <reference path="../../../../typings/bundle.d.ts" />
"use strict";

import VideoKey from "../../../../src/nico_thumbinfo/models/VideoKey";
import {DescriptionText as DText} from "../../../../src/nico_thumbinfo/models/DescriptionNode";
import RawVideoData from "../../../../src/nico_thumbinfo/models/RawVideoData";

import VideoData from "../../../../src/nico_thumbinfo/stores/VideoData";

import * as assert from "power-assert";
import {Option, Some, None} from "option-t";

describe("nico_thumbinfo/stores/VideoData", () => {
    let key = VideoKey.fromVideoId("sm9");

    let getThumbinfo = RawVideoData.createGetThumbinfo(key);
    getThumbinfo.description = new Some([new DText("getthumbinfo description")]);
    getThumbinfo.title = new Some("getthumbinfo title");
    getThumbinfo.lastResBody = new Some("getthumbinfo lastResBody");

    let videoArray = RawVideoData.createV3VideoArray(key);
    videoArray.description = new Some([new DText("videoarray description")]);
    videoArray.title = new Some("videoarray title");

    let watchPage = RawVideoData.createWatchPage(key);
    watchPage.description = new Some([new DText("watchpage description")]);

    it("should empty when no raw data is pushed.", () => {
        let data = new VideoData(key);
        assert(data.isEmpty);
    });

    it("should returns pushed data.", () => {
        function check(raw: RawVideoData, value: DText[]) {
            let data = new VideoData(key);
            data.pushRawVideoData(raw);
            assert.deepEqual(data.description.unwrap(), value);
        }
        check(getThumbinfo, <DText[]>getThumbinfo.description.unwrap());
        check(videoArray, <DText[]>videoArray.description.unwrap());
        check(watchPage, <DText[]>watchPage.description.unwrap());
    });

    it("should overwrite the property with higher priority rawVideoData's value.", () => {
        let data = new VideoData(key);
        data.pushRawVideoData(getThumbinfo);
        data.pushRawVideoData(videoArray);

        assert.deepEqual(data.description, videoArray.description);
        data.pushRawVideoData(watchPage);
        assert.deepEqual(data.description, watchPage.description);

        data = new VideoData(key);
        data.pushRawVideoData(getThumbinfo);
        data.pushRawVideoData(watchPage);
        assert.deepEqual(data.description, watchPage.description);
    });

    it("should not overwrite the property when higher priority rawVideoData's value is None.", () => {
        let data = new VideoData(key);
        data.pushRawVideoData(getThumbinfo);
        data.pushRawVideoData(videoArray);
        data.pushRawVideoData(watchPage);

        assert.deepEqual(data.description, watchPage.description);
        assert.deepEqual(data.title, videoArray.title);
        assert.deepEqual(data.lastResBody, getThumbinfo.lastResBody);
    })
});

