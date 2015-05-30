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

    let initialDummy = RawVideoData.createInitialDummy(key);
    initialDummy.description = new Some([new DText("getthumbinfo description")]);
    initialDummy.title = new Some("getthumbinfo title");
    initialDummy.lastResBody = new Some("getthumbinfo lastResBody");

    let getThumbinfo = RawVideoData.createGetThumbinfo(key);
    getThumbinfo.description = new Some([new DText("videoarray description")]);
    getThumbinfo.title = new Some("videoarray title");

    let v3VideoArray = RawVideoData.createV3VideoArray(key);
    v3VideoArray.description = new Some([new DText("watchpage description")]);

    it("should returns pushed data.", () => {
        function check(raw: RawVideoData, value: DText[]) {
            let data = new VideoData(key);
            data.pushRawVideoData(raw);
            assert.deepEqual(data.description.unwrap(), value);
        }
        check(initialDummy, <DText[]>initialDummy.description.unwrap());
        check(getThumbinfo, <DText[]>getThumbinfo.description.unwrap());
        check(v3VideoArray, <DText[]>v3VideoArray.description.unwrap());
    });

    it("should overwrite the property with higher priority rawVideoData's value.", () => {
        let data = new VideoData(key);
        data.pushRawVideoData(initialDummy);
        data.pushRawVideoData(getThumbinfo);

        assert.deepEqual(data.description, getThumbinfo.description);
        data.pushRawVideoData(v3VideoArray);
        assert.deepEqual(data.description, v3VideoArray.description);

        data = new VideoData(key);
        data.pushRawVideoData(initialDummy);
        data.pushRawVideoData(v3VideoArray);
        assert.deepEqual(data.description, v3VideoArray.description);
    });

    it("should not overwrite the property when higher priority rawVideoData's value is None.", () => {
        let data = new VideoData(key);
        data.pushRawVideoData(initialDummy);
        data.pushRawVideoData(getThumbinfo);
        data.pushRawVideoData(v3VideoArray);

        assert.deepEqual(data.description, v3VideoArray.description);
        assert.deepEqual(data.title, getThumbinfo.title);
        assert.deepEqual(data.lastResBody, initialDummy.lastResBody);
    })
});

