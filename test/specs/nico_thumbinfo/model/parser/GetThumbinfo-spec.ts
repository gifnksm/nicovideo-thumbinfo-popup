/// <reference path="../../../../../typings/common.d.ts" />

import GetThumbInfo from "../../../../../src/nico_thumbinfo/model/parser/GetThumbInfo";
import VideoKey from "../../../../../src/nico_thumbinfo/model/VideoKey";
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

describe("nico_thumbinfo/model/parser/GetThumbInfo", () => {
    let key = VideoKey.fromVideoId("sm9");

    it("should fails if input is empty", () => {
        return GetThumbInfo.parse(key, "")
            .then(failTest, (e: Error) => {
                assert(/^XML Parse Error: /.test(e.message))
            });
    });

    it("should fails if input is odd but valid XML.", () => {
        return GetThumbInfo.parse(key, "<unknown_element></unknown_element>")
            .then(failTest, (e: Error) => {
                assert(e.message === `XML Format Error: Root element name is "unknown_element".`);
            });
    });

    it("should return parse result if valid input is given.", () => {
        return getUrl("/base/etc/resource/sm9.xml").then((input) => {
            return GetThumbInfo.parse(key, input);
        }).then((a) => {console.log(a)});
    });
});
