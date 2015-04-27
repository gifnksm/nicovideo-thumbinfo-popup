/// <reference path="../../../../typings/common.d.ts" />

import NicoThumbinfo from "../../../../src/nico_thumbinfo/component/Base";
import GetThumbInfo from "../../../../src/nico_thumbinfo/model/parser/GetThumbInfo";
import VideoKey from "../../../../src/nico_thumbinfo/model/VideoKey";
import {Data, RawData} from "../../../../src/nico_thumbinfo/model/VideoData";
import {VideoDataStoreInterface} from "../../../../src/nico_thumbinfo/store/VideoDataStore";
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

describe("nico_thumbinfo/component/Base", () => {
    it("should renser loading message without any data loaded");

    it("should render sm9 video.", () => {
        let key = VideoKey.fromVideoId("sm9");
        let data: Data = new Data(key);
        let changeCallback: (key: VideoKey) => void = null;
        let props = <NicoThumbinfo.Props> {
            videoKey: key,
            store: <VideoDataStoreInterface>{
                addChangeListener(callback) {
                    changeCallback = callback;
                },
                removeChangeListener(callback) {
                    assert(callback === changeCallback);
                    changeCallback = null;
                },
                getVideoDataByKey(_key: VideoKey) {
                    assert(key.valueOf() === _key.valueOf())
                    return data;
                }
            }
        };

        let div = document.createElement('div');
        let component = React.render(React.createElement(NicoThumbinfo, props), div);
        document.body.appendChild(div);

        return getUrl("/base/etc/resource/getthumbinfo/sm9")
            .then(input => GetThumbInfo.parse(key, input))
            .then(rawData => {
                if (rawData instanceof RawData) {
                    data.pushRawData(rawData);
                }
                changeCallback(key);
            });
    });
});
