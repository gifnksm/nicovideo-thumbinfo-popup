/// <reference path="../../../../typings/common.d.ts" />
"use strict";

import NicoThumbinfo from "../../../../src/nico_thumbinfo/components/Base";
import GetThumbinfoParser from "../../../../src/nico_thumbinfo/stores/parser/GetThumbinfoParser";
import VideoKey from "../../../../src/nico_thumbinfo/stores/VideoKey";
import RawVideoData from "../../../../src/nico_thumbinfo/stores/RawVideoData";
import VideoData from "../../../../src/nico_thumbinfo/stores/VideoData";
import {VideoDataStoreInterface} from "../../../../src/nico_thumbinfo/stores/VideoDataStore";
import * as assert from "power-assert";
import * as React from "react";

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

class VideoDataStoreDummy implements VideoDataStoreInterface {
    callback: (key: VideoKey) => void = null;
    data: VideoData = new VideoData(this.key);

    constructor(public key: VideoKey) {}

    addChangeListener(callback: (key: VideoKey) => void) {
        assert(this.callback === null);
        this.callback = callback;
    }
    removeChangeListener(callback: (key: VideoKey) => void) {
        assert(callback === this.callback);
        this.callback = null;
    }
    getVideoDataByKey(key: VideoKey) {
        assert(this.key.valueOf() === key.valueOf())
        return this.data;
    }
}

describe("nico_thumbinfo/components/Base", () => {
    it("should renser loading message without any data loaded");

    it("should render sm9 video.", () => {
        let key = VideoKey.fromVideoId("sm9");
        let store = new VideoDataStoreDummy(key);
        let props = <NicoThumbinfo.Props> { videoKey: key, store: store };

        let div = document.createElement('div');
        let component = React.render(React.createElement(NicoThumbinfo, props), div);
        document.body.appendChild(div);

        return getUrl("/base/etc/resource/getthumbinfo/sm9")
            .then(input => GetThumbinfoParser.parse(key, input))
            .then(rawData => {
                assert(rawData instanceof RawVideoData);
                if (rawData instanceof RawVideoData) {
                    store.data.pushRawVideoData(rawData);
                }
                store.callback(key);
            });
    });
});
