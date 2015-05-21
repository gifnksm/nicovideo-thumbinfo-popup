/// <reference path="../../../../typings/common.d.ts" />
"use strict";

import VideoKey from "../../../../src/nico_thumbinfo/models/VideoKey";
import * as assert from "power-assert";
import {Option, Some, None} from "option-t";

const NicoDomain = "www.nicovideo.jp";

describe("nico_thumbinfo/models/VideoKey", () => {
    let getKey = VideoKey.fromUrl;
    function some(url: string, key: VideoKey) {
        assert(getKey(url).unwrap().valueOf() === key.valueOf());
    }
    function video(url: string, id:string) {
        some(url, VideoKey.fromVideoId(id));
    }
    function thread(url: string, id:string) {
        some(url, VideoKey.fromThreadId(id));
    }
    function none(url: string) {
        assert(!getKey(url).isSome);
    }

    context("when watch page's URL is given", () => {
        it("should be able to get an ID from valid URL.", () => {
            video("http://www.nicovideo.jp/watch/sm9", "sm9");
            video("http://www.nicovideo.jp/watch/sm12345", "sm12345")
            thread("http://www.nicovideo.jp/watch/1234567890", "1234567890");
            thread("http://www.nicovideo.jp/watch/12345678901", "12345678901");
        });

        it("should be able to get an ID from loosely formed URL.", () => {
            video("http://www.nicovideo.jp/watch/zz1", "zz1");
            thread("http://www.nicovideo.jp/watch/123", "123");
        });

        it("should not be able to get an ID from invalid URL.", () => {
            none("http://www.nicovideo.jp/watch/zzz");
            none("http://www.nicovideo.jp/watch/");
            none("http://www.nicovideo.jp/watch/a12345");
        })

        it("should be able to get an ID if watch page's URL is contained by other URL", () => {
            video("http://b.hatena.ne.jp/entry/http://www.nicovideo.jp/watch/sm9", "sm9");
            video("http://b.hatena.ne.jp/entry/www.nicovideo.jp/watch/sm9", "sm9");
        });
    });

    context("when tag search page's URL is given", () => {
        it("should be able to get an ID from valid URL.", () => {
            video("http://www.nicovideo.jp/tag/%E6%9C%AC%E5%AE%B6%E2%87%92sm9", "sm9");
            thread("http://www.nicovideo.jp/tag/%E6%9C%AC%E5%AE%B6%E2%87%92watch%df1234567890", "1234567890");
        });

        it("should not be able to get an ID from loosely formed URL.", () => {
            none("http://www.nicovideo.jp/tag/%E6%9C%AC%E5%AE%B6%E2%87%92zz9");
            none("http://www.nicovideo.jp/tag/%E6%9C%AC%E5%AE%B6%E2%87%92watch%df123abc");
        });
    });

    context("when thumbnail's URL is given", () => {
        it("should be able to get an ID from valid URL.", () => {
            video("http://ext.nicovideo.jp/thumb/sm9", "sm9");
            video("http://ext.nicovideo.jp/thumb/sm12345", "sm12345");
            thread("http://ext.nicovideo.jp/thumb/1234567890", "1234567890");
            thread("http://ext.nicovideo.jp/thumb/12345678901", "12345678901");
        });

        it("should be able to get an ID from loosely formed URL.", () => {
            video("http://ext.nicovideo.jp/thumb/zz1", "zz1");
            thread("http://ext.nicovideo.jp/thumb/123", "123");
        });

        it("should not be able to get an ID from invalid URL.", () => {
            none("http://ext.nicovideo.jp/thumb/zzz");
            none("http://ext.nicovideo.jp/thumb/");
            none("http://ext.nicovideo.jp/thumb/a12345");
        })
    });

    context("when short URL is given", () => {
        it("should be able to get an ID from valid URL.", () => {
            video("http://nico.ms/sm9", "sm9");
            video("http://nico.ms/sm12345", "sm12345");
            video("http://nico.sc/sm9", "sm9");
            video("http://nico.sc/sm12345", "sm12345");
        });

        it("should not be able to get an ID from loosely formed URL.", () => {
            none("http://nico.ms/zz9");
            none("http://nico.ms/12345");
            none("http://nico.sc/zz9");
            none("http://nico.sc/12345");
        });
    });
});
