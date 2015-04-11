/// <reference path="../../../typings/common.d.ts" />

import NicoThumbinfoKey from "../../../src/model/NicoThumbinfoKey";
import * as assert from "power-assert";
import {Option, Some, None} from "option-t";

const NicoDomain = "www.nicovideo.jp";

describe("NicoThumbinfoKey", () => {

    let getKey = NicoThumbinfoKey.fromUrl;
    function some(url: string, id: string) {
        assert(getKey(url).unwrap() === id);
    }
    function none(url: string) {
        assert(!getKey(url).isSome);
    }

    context("when watch page's URL is given", () => {
        it("should be able to get an ID from valid URL.", () => {
            some("http://www.nicovideo.jp/watch/sm9", "video:sm9");
            some("http://www.nicovideo.jp/watch/sm12345", "video:sm12345")
            some("http://www.nicovideo.jp/watch/1234567890", "thread:1234567890");
            some("http://www.nicovideo.jp/watch/12345678901", "thread:12345678901");
        });

        it("should be able to get an ID from loosely formed URL.", () => {
            some("http://www.nicovideo.jp/watch/zz1", "video:zz1");
            some("http://www.nicovideo.jp/watch/123", "thread:123");
        });

        it("should not be able to get an ID from invalid URL.", () => {
            none("http://www.nicovideo.jp/watch/zzz");
            none("http://www.nicovideo.jp/watch/");
            none("http://www.nicovideo.jp/watch/a12345");
        })

        it("should be able to get an ID if watch page's URL is contained by other URL", () => {
            some("http://b.hatena.ne.jp/entry/http://www.nicovideo.jp/watch/sm9", "video:sm9");
            some("http://b.hatena.ne.jp/entry/www.nicovideo.jp/watch/sm9", "video:sm9");
        });
    });

    context("when tag search page's URL is given", () => {
        it("should be able to get an ID from valid URL.", () => {
            some("http://www.nicovideo.jp/tag/%E6%9C%AC%E5%AE%B6%E2%87%92sm9", "video:sm9");
            some("http://www.nicovideo.jp/tag/%E6%9C%AC%E5%AE%B6%E2%87%92watch%df1234567890", "thread:1234567890");
        });

        it("should not be able to get an ID from loosely formed URL.", () => {
            none("http://www.nicovideo.jp/tag/%E6%9C%AC%E5%AE%B6%E2%87%92zz9");
            none("http://www.nicovideo.jp/tag/%E6%9C%AC%E5%AE%B6%E2%87%92watch%df123abc");
        });
    });

    context("when thumbnail's URL is given", () => {
        it("should be able to get an ID from valid URL.", () => {
            some("http://ext.nicovideo.jp/thumb/sm9", "video:sm9");
            some("http://ext.nicovideo.jp/thumb/sm12345", "video:sm12345")
            some("http://ext.nicovideo.jp/thumb/1234567890", "thread:1234567890");
            some("http://ext.nicovideo.jp/thumb/12345678901", "thread:12345678901");
        });

        it("should be able to get an ID from loosely formed URL.", () => {
            some("http://ext.nicovideo.jp/thumb/zz1", "video:zz1");
            some("http://ext.nicovideo.jp/thumb/123", "thread:123");
        });

        it("should not be able to get an ID from invalid URL.", () => {
            none("http://ext.nicovideo.jp/thumb/zzz");
            none("http://ext.nicovideo.jp/thumb/");
            none("http://ext.nicovideo.jp/thumb/a12345");
        })
    });

    context("when tag nico.ms's URL is given", () => {
        it("should be able to get an ID from valid URL.", () => {
            some("http://nico.ms/sm9", "video:sm9");
            some("http://nico.ms/sm12345", "video:sm12345");
        });

        it("should not be able to get an ID from loosely formed URL.", () => {
            none("http://nico.ms/zz9");
            none("http://nico.ms/12345");
        });
    });
});
