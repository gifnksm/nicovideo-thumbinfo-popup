/// <reference path="../../../../typings/common.d.ts" />
"use strict";

import VideoKey from "../VideoKey";
import {DescriptionNode as DNode,
        DescriptionElement as DElement,
        DescriptionText as DText} from "../DescriptionNode";

module DescriptionParser {
    const Parser = new DOMParser();

    /**
     * 説明文中で利用可能なHTMLタグにマッチする正規表現
     *
     * 利用可能なタグについては下記URLを参照。
     * a, span については、一般会員は利用不可能だが、
     * 公式動画で利用される場合があるため許容している。
     *
     * 参考: http://blog.nicovideo.jp/niconews/ni033472.html
     */
    const SafeHtmlElementRegExp = /^(?:font|b|i|s|u|br|a|span)$/;

    export function parse(input: string, convertSpaces: boolean): DNode[] {
        // DOMParser で HTML 文書の一部分をパースすると html/head/body 要素などが追加される。
        // この挙動はブラウザ毎に動作が違うかもしれないので、
        // あらかじめめ追加しておくことで予想外の結果となることを防ぐ。
        let html = "<html><head></head><body>" + input + "</body></html>";
        let doc = Parser.parseFromString(html, "text/html");

        let desc = _nodeList2Description(doc.body.childNodes);
        desc = _convertAnchors(_convertUrls, desc);
        desc = _convertAnchors(_convertIds, desc);
        if (convertSpaces) {
            desc = _convertTexts(_convertSpaces, desc);
        }
        return desc;
    }

    function _escapeHtml(input: string): string {
        return input.replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function _nodeList2Description(input: NodeList): DNode[] {
        let results: DNode[] = [];

        // TODO: Use ES6 for-of
        // for (let node of input) {
        for (let node of Array.prototype.slice.call(input)) {
            switch (node.nodeType) {
            case Node.ELEMENT_NODE:
                let name = node.nodeName.toLowerCase();

                // 未知のHTMLをそのまま文章中に追加するのは危険なので、
                // ホワイトリスト方式で安全なもののみ追加する。
                if (!SafeHtmlElementRegExp.test(name)) {
                    let attrs = Array.prototype.map.call(node.attributes, (attr: Attr) => {
                        return `${_escapeHtml(attr.name)}="${_escapeHtml(attr.value)}"`;
                    });
                    attrs.unshift(name);

                    if (node.childNodes === null) {
                        results.push(new DText(`<${attrs.join(" ")}/>`));
                    } else {
                        results.push(new DText(`<${attrs.join(" ")}>`),
                                     ..._nodeList2Description(node.childNodes),
                                     new DText(`</${name}>`));
                    }
                    break;
                }

                let attrs: any = {};
                // TODO: Use ES6 for-of
                // for (let attr of node.attributes) {
                for (let attr of Array.prototype.slice.call(node.attributes)) {
                    attrs[attr.name] = attr.value;
                }
                let children = _nodeList2Description(node.childNodes);

                results.push(new DElement(name, attrs, children));
                break;

            default:
                results.push(new DText(node.textContent));
                break;
            }
        }
        return results;
    }

    function _convertTexts(conv: (input: string) => DNode[], input: DNode[]): DNode[] {
        let output: DNode[] = [];
        for (let node of input) {
            output.push(...node.mapText(text => conv(text.text)));
        }
        return output;
    }

    function _convertAnchors(conv: (input: string) => DNode[], input: DNode[]): DNode[] {
        let output: DNode[] = [];
        for (let node of input) {
            output.push(...node.mapTextCond(elem => elem.name !== "a",
                                            text => conv(text.text)));
        }
        return output;
    }

    function _regExpConverter(regExp: RegExp, conv: (m: RegExpExecArray) => DNode[], input: string): DNode[] {
        let rest = input;
        let output: DNode[] = [];

        let m: RegExpExecArray;
        while (rest !== "" && (m = regExp.exec(rest)) !== null) {
            if (m.index !== 0) {
                output.push(new DText(m.input.slice(0, m.index)));
            }
            output.push(...conv(m));
            rest = m.input.slice(m.index + m[0].length);
        }
        if (rest !== "") {
            output.push(new DText(rest));
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
            let pairs: {[index: string]: ((id: string) => string)} = {
                [Video]: id => "http://www.nicovideo.jp/watch/" + id,
                [VideoFull]: id => "http://www.nicovideo.jp/" + id,
                [Seiga]: id => "http://seiga.nicovideo.jp/watch/" + id,
                [Live]: id => "http://live.nicovideo.jp/watch/" + id,
                [Community]: id => "http://com.nicovideo.jp/community/" + id,
                [Channel]: id => "http://ch.nicovideo.jp/channel/" + id,
                [Direct]: id => "http://chokuhan.nicovideo.jp/products/detail/" + id,
                [App]: id => "http://app.nicovideo.jp/app/" + id,
                [Jikkyo]: id => "http://jk.nicovideo.jp/watch/" + id,
                [Commons]: id => "http://www.niconicommons.jp/material/" + id,
                [News]: id => "http://news.nicovideo.jp/watch/" + id,
                [WwwNicovideo]: id => "http://www.nicovideo.jp/" + id,
                [SeigaNicovideo]: id => "http://seiga.nicovideo.jp/" + id,
                [DicNicovideo]: id => "http://dic.nicovideo.jp/id/" + id,
                [MyVideo]: id => `http://www.nicovideo.jp/user/${id}/video`
            };

            let map: any = {};
            for (let key of Object.keys(pairs)) {
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

    function _convertUrls(input: string): DNode[] {
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
            return [new DElement("a", {href: url}, [new DText(m[0])])];
        }, input);
    }

    function _convertIds(input: string): DNode[] {
        return _regExpConverter(IdRegExp, (m) => {
            let id = m[0];
            let prefix = m[1];

            let linkGen = Prefix.LinkMap[prefix];
            if (linkGen === undefined) {
                console.error("Unknown prefix: ", prefix);
                return [new DText(id)];
            }
            return [new DElement("a", {href: linkGen(id)}, [new DText(id)])];
        }, input);
    }

    function  _convertSpaces(input: string): DNode[] {
        return _regExpConverter(SpaceRegExp, (m) => {
            return [new DElement("br")];
        }, input);
    }
}

export default DescriptionParser;
