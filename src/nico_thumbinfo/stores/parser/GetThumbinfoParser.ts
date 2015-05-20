/// <reference path="../../../../typings/common.d.ts" />
"use strict";

import {ThumbType} from "../constants";
import TagData from "../TagData";
import {User, Channel} from "../Uploader";
import VideoKey from "../VideoKey";
import RawVideoData from "../RawVideoData";
import DescriptionParser from "./DescriptionParser";
import {ErrorCode, ErrorInfo} from "../GetThumbinfoFetcher";

module GetThumbinfoParser {
    const Parser = new DOMParser();

    export function parse(key: VideoKey, input: string): RawVideoData|ErrorInfo {
        try {
            let xml = Parser.parseFromString(input, "application/xml");

            // パースに失敗した場合、以下のXMLが返される。
            // Firefox の場合、下記要素のみからなる XML 文書が返るが、
            // Google Chrome の場合、下記要素を含む HTML 文書が返されるので注意。
            //
            //     <parsererror xmlns="http://www.mozilla.org/newlayout/xml/parsererror.xml">
            //       (error description)
            //       <sourcetext>(a snippet of the source XML)</sourcetext>
            //     </parsererror>
            let error = xml.getElementsByTagName("parsererror");
            if (error.length > 0) {
                return new ErrorInfo(ErrorCode.Invalid, "XML Parse Error: " + error[0].textContent);
            }

            // レスポンスを簡単にバリデーションする
            let docElem = xml.documentElement;
            if (docElem.nodeName !== "nicovideo_thumb_response") {
                return new ErrorInfo(ErrorCode.Invalid,
                                     `XML Format Error: Root element name is "${docElem.nodeName}".`);
            }
            if (!docElem.hasAttribute("status")) {
                return new ErrorInfo(ErrorCode.Invalid,
                                     `XML Format Error: Root element does not have "status" attribute.`);
            }

            let status = xml.documentElement.getAttribute("status");
            switch (status) {
            case "ok":
                return _parseOk(key, xml);

            case "fail":
                return _parseFail(key, xml);

            default:
                return new ErrorInfo(ErrorCode.Invalid,
                                     `XML Format Error: Unknown status "${status}".`);
            }
        } catch (e) {
            // XMLツリーの走査時にエラーが起きるかもしれないので、念の為catchしておく
            return new ErrorInfo(ErrorCode.Invalid, "" + e);
        }
    }

    function _parseOk(key: VideoKey, xml: XMLDocument): RawVideoData|ErrorInfo {
        let data = RawVideoData.createGetThumbinfo(key);
        let user: User = new User();
        let channel: Channel = new Channel();

        let thums = xml.getElementsByTagName("thumb");
        if (thums.length === 0) {
            return new ErrorInfo(ErrorCode.Invalid, `XML Format Error: There is no "thumb" element.`);
        }

        // for (let node of thums[0].childNodes) {
        for (let node of Array.prototype.slice.call(thums[0].childNodes)) {
            if (node.nodeType !== Node.ELEMENT_NODE) {
                continue;
            }

            let text: string = node.textContent;
            switch (node.nodeName) {
            case "thumb_type":
                if (key.type === VideoKey.Type.OptionalThreadId) {
                    data.thumbType = ThumbType.Community;
                } else {
                    switch (text) {
                    case "video":
                        data.thumbType = ThumbType.Video;
                        break;
                    case "mymemory":
                        data.thumbType = ThumbType.MyMemory;
                        break;
                    default:
                        console.warn("Unknown thumb_type: ", text);
                        break;
                    }
                }
                break;

            case "video_id": data.videoId = text; break;

            case "title": data.title = text; break;
            case "description":
                data.description = DescriptionParser.parse(node.childNodes);
                break;
            case "thumbnail_url": data.thumbnailUrl = text; break;
            case "first_retrieve": data.postedAt = new Date(text); break;
            case "length":
                data.lengthInSeconds = text
                    .split(":")
                    .reduce((i: number, x: string) => i * 60 + parseInt(x, 10), 0);
                break;

            case "view_counter": data.viewCounter = parseInt(text, 10); break;
            case "comment_num": data.commentCounter = parseInt(text, 10); break;
            case "mylist_counter": data.mylistCounter = parseInt(text, 10); break;
            case "last_res_body": data.lastResBody = text; break;

            case "tags":
                Array.prototype.forEach.call(
                    node.getElementsByTagName("tag"),
                    (elem: Element) => {
                        let tag = new TagData(elem.textContent);
                        tag.isLocked = elem.hasAttribute("lock");
                        tag.isCategory = elem.hasAttribute("category");
                        tag.nicopediaRegistered = undefined;
                        data.tags.push(tag);
                    }
                );
                break;

            case "user_id":
                user.id = text;
                data.uploader = user;
                break;
            case "user_nickname":
                user.name = text;
                data.uploader = user;
                break;
            case "user_icon_url":
                user.iconUrl = text;
                data.uploader = user;
                break;

            case "ch_id":
                channel.id = text;
                data.uploader = channel;
                break;
            case "ch_name":
                channel.name = text;
                data.uploader = channel;
                break;
            case "ch_icon_url":
                channel.iconUrl = text;
                data.uploader = channel;
                break;

            case "movie_type":
            case "size_high":
            case "size_low":
            case "watch_url": // Ignore. This url may be wrong if this data is fetched by optional thread ID.
            case "embeddable":
            case "no_live_play":
                break;

            default:
                console.warn("Unknown element:", node);
                break;
            }
        }
        return data;
    }

    function _parseFail(key: VideoKey, xml: XMLDocument): ErrorInfo {
        let code: ErrorCode;
        let desc: string;

        let errors = xml.getElementsByTagName("error");
        if (errors.length === 0) {
            return new ErrorInfo(ErrorCode.Invalid,
                                 `XML Format Error: There is no "error" element.`);
        }

        // for (let node of errors[0].childNodes) {
        for (let node of Array.prototype.slice.call(errors[0].childNodes)) {
            if (node.nodeType !== Node.ELEMENT_NODE) {
                continue;
            }

            let text = node.textContent;
            switch (node.nodeName) {
            case "code":
                switch (text) {
                case "DELETED":
                    code = ErrorCode.Deleted;
                    break;
                case "COMMUNITY":
                    code = ErrorCode.Community;
                    break;
                case "NOT_FOUND":
                    code = ErrorCode.NotFound;
                    break;
                default:
                    console.warn("Unknown code: ", node);
                    break;
                }
                break;

            case "description":
                desc = text;
                break;

            default:
                console.warn("Unknown element:", node);
                break;
            }
        }

        return new ErrorInfo(code, desc);
    }
}

export default GetThumbinfoParser;
