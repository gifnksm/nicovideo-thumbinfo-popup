/// <reference path="../../../../typings/common.d.ts" />
"use strict";

import VideoKey from "../VideoKey";
import {DescriptionElement} from "../RawVideoData";

module DescriptionParser {
    export function  parse(input: NodeList): DescriptionElement[] {
        let desc = _nodeList2Description(input);
        desc = _convertAnchors(_convertUrls, desc);
        desc = _convertAnchors(_convertIds, desc);
        desc = _convertTexts(_convertSpaces, desc);
        return desc;
    }

    function _nodeList2Description(input: NodeList): DescriptionElement[] {
        return Array.prototype.slice.call(input).map((node: Node) => node.textContent);
    }

    function _convertTexts(conv: (input: string) => DescriptionElement[], input: DescriptionElement[]): DescriptionElement[] {
        let output: DescriptionElement[] = [];
        for (let elem of input) {
            if (typeof elem === "string") {
                output.push(...conv(elem));
            } else {
                output.push({ name: elem.name, attr: elem.attr, children: _convertAnchors(conv, elem.children) });
            }
        }
        return output;
    }

    function _convertAnchors(conv: (input: string) => DescriptionElement[], input: DescriptionElement[]): DescriptionElement[] {
        let output: DescriptionElement[] = [];
        for (let elem of input) {
            if (typeof elem === "string") {
                output.push(...conv(elem));
            } else {
                if (elem.name === "a") {
                    output.push(elem);
                } else {
                    output.push({ name: elem.name, attr: elem.attr, children: _convertAnchors(conv, elem.children) });
                }
            }
        }
        return output;
    }

    function _regExpConverter(regExp: RegExp, conv: (m: RegExpExecArray) => DescriptionElement[], input: string): DescriptionElement[] {
        let rest = input;
        let output: DescriptionElement[] = [];

        let m: RegExpExecArray;
        while (rest !== "" && (m = regExp.exec(rest)) !== null) {
            if (m.index !== 0) {
                output.push(m.input.slice(0, m.index));
            }
            output.push(...conv(m));
            rest = m.input.slice(m.index + m[0].length);
        }
        if (rest !== "") {
            output.push(rest);
        }

        return output;
    }

    module Prefix {
        const Video = VideoKey.Prefix.AutoLink; /// ニコニコ動画
        const VideoFull = VideoKey.Prefix.AutoLink /// ニコニコ動画 (watch/<id>)
            .split("|")
            .map((p) => "watch/" + p)
            .join("|");
        const Seiga = "im|sg|mg|bk"; ///< ニコニコ静画
        const Live = "lv";           ///< ニコニコ生放送
        const Community = "co";      ///< ニコニコミュニティ
        const Channel = "ch|ar";     ///< チャンネル、ブロマガ
        const Direct = "nd";         ///< ニコニコ直販
        const App  = "ap";           ///< ニコニコアプリ
        const Jikkyo = "jk";         ///< ニコニコ実況
        const Commons = "nc";        ///< ニコニコモンズ
        const News = "nw";           ///< ニコニコニュース
        const WwwNicovideo = "watch/|user/|mylist/"; ///< www.nicovideo.jp の URL
        const SeigaNicovideo = "clip/|comic/"; ///< seiga.nicovideo.jp の URL
        const DicNicovideo = "dic/"; ///< dic.nicovideo.jp の URL
        const MyVideo = "myvideo/"; ///< www.nicovideo.jp/user/<id>/video へのリンク

        export const AutoLink = [
            Video, VideoFull, Seiga, Live, Community,
            Channel, Direct, App, Jikkyo, Commons,
            WwwNicovideo, SeigaNicovideo, DicNicovideo,
            MyVideo
        ].join("|");

        export const LinkMap = (() => {
            let pairs: {[index: string]: string | ((id: string) => string)} = {
                [Video]: "http://www.nicovideo.jp/watch/",
                [VideoFull]: "http://www.nicovideo.jp/",
                [Seiga]: "http://seiga.nicovideo.jp/watch/",
                [Live]: "http://live.nicovideo.jp/watch/",
                [Community]: "http://com.nicovideo.jp/community/",
                [Channel]: "http://ch.nicovideo.jp/channel/",
                [Direct]: "http://chokuhan.nicovideo.jp/products/detail/",
                [App]: "http://app.nicovideo.jp/app/",
                [Jikkyo]: "http://jk.nicovideo.jp/watch/",
                [Commons]: "http://www.niconicommons.jp/material/",
                [News]: "http://news.nicovideo.jp/watch/",
                [WwwNicovideo]: "http://www.nicovideo.jp/",
                [SeigaNicovideo]: "http://seiga.nicovideo.jp/",
                [DicNicovideo]: "http://dic.nicovideo.jp/id/",
                [MyVideo]: (id: string) => `http://www.nicovideo.jp/user/${id}/video`
            };

            let map: any = {};
            for (let key in pairs) {
                if (!pairs.hasOwnProperty(key)) {
                    continue;
                }

                for (let pre of key.split("|")) {
                    map[pre] = pairs[key];
                }
            }
            return map;
        })();
    }

    module RegExpStr {
        const Protocol = "(?:h?t?t?ps?|ftp)";
        const Domain = "[-_.!~*\'()a-zA-Z0-9;?:@&=+$,%#]";
        const Path = "[-_.!~*\'()a-zA-Z0-9;?:@&=+$,%#]";
        export const Url = `(${Protocol})://(?:${Domain}+(?:/${Path}*)*)`;
        export const Id = `(${Prefix.AutoLink})\\d+`;
    }

    const UrlRegExp = new RegExp(RegExpStr.Url);
    const IdRegExp = new RegExp(RegExpStr.Id);
    const SpaceRegExp = new RegExp("(?:\\s|　){3,}");

    function _convertUrls(input: string): DescriptionElement[] {
        return _regExpConverter(UrlRegExp, (m) => {
            let url = m[0];
            switch (m[1]) {
            case "p":
                url = "htt" + url;
                break;
            case "tp":
                url = "ht" + url;
                break;
            case "ttp":
                url = "h" + url;
                break;
            default:
                break;
            }
            return [{name: "a", attr: {href: url}, children: [m[0]]}];
        }, input);
    }

    function _convertIds(input: string): DescriptionElement[] {
        return _regExpConverter(IdRegExp, (m) => {
            let id = m[0];
            let prefix = m[1];

            let linkGen = Prefix.LinkMap[prefix];
            if (linkGen === undefined) {
                console.warn("Unknown prefix: ", prefix);
                return [id];
            }
            let url: string;
            if (typeof linkGen === "string") {
                url = linkGen + id;
            } else {
                url = linkGen(id);
            }
            return [{name: "a", attr: {href: url}, children: [id]}];
        }, input);
    }

    function  _convertSpaces(input: string): DescriptionElement[] {
        return _regExpConverter(SpaceRegExp, (m) => {
            return [{name: "br"}];
        }, input);
    }
}

export default DescriptionParser;
