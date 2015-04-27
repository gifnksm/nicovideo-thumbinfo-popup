/// <reference path="../../../../typings/common.d.ts" />

import Key from "../VideoKey";
import {RawData, User, Channel, Tag} from "../VideoData";

export enum ErrorCode {
    Deleted, Community, NotFound
}

export class GetThumbinfoError {
    code: ErrorCode;
    description: string;
    constructor(code: ErrorCode, description: string) {
        this.code = code;
        this.description = description;
    }
}

export default class Parser {
    private static parser: DOMParser = new DOMParser();

    static parse(key: Key, input: string): Promise<RawData|GetThumbinfoError> {
        return new Promise((resolve, reject) => {
            let xml = Parser.parser.parseFromString(input, "application/xml");

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
                throw new Error("XML Parse Error: " + error[0].textContent);
            }

            // レスポンスを簡単にバリデーションする
            let docElem = xml.documentElement;
            if (docElem.nodeName !== "nicovideo_thumb_response") {
                throw new Error(`XML Format Error: Root element name is "${docElem.nodeName}".`);
            }
            if (!docElem.hasAttribute("status")) {
                throw new Error(`XML Format Error: Root element does not have "status" attribute.`);
            }

            let status = xml.documentElement.getAttribute("status");
            switch (status) {
            case "ok":
                resolve(this._parseOk(key, xml));
                break;

            case "fail":
                resolve(this._parseFail(key, xml));
                break;

            default:
                throw new Error(`XML Format Error: Unknown status "${status}".`);
            }
        });
    }

    private static _parseOk(key: Key, xml: XMLDocument): RawData {
        let data = RawData.createGetThumbinfo(key);
        data.tags = {};

        let user: User = new User();
        let channel: Channel = new Channel();

        let thums = xml.getElementsByTagName("thumb");
        if (thums.length === 0) {
            throw new Error(`XML Format Error: There is no "thumb" element.`);
        }

        // for (let node of thums[0].childNodes) {
        for (let node of Array.prototype.slice.call(thums[0].childNodes)) {
            if (node.nodeType !== Node.ELEMENT_NODE) {
                continue;
            }

            let text: string = node.textContent;
            switch (node.nodeName) {
            case "thumb_type":
                if (key.type === Key.Type.OptionalThreadId) {
                    data.thumbType = "community";
                } else {
                    data.thumbType = text;
                }
                break;

            case "video_id": data.videoId = text; break;

            case "title": data.title = text; break;
            case "description": data.description = text; break;
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
                data.tags[node.getAttribute("domain")] = Array.prototype.map.call(
                    node.getElementsByTagName("tag"),
                    (elem: Element) => {
                        let tag = new Tag();
                        tag.name = elem.textContent;
                        tag.isLocked = elem.hasAttribute("lock");
                        tag.isCategory = elem.hasAttribute("category");
                        tag.nicopediaRegistered = undefined;
                        return tag;
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
            case "watch_url":
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

    private static _parseFail(key: Key, xml: XMLDocument): GetThumbinfoError {
        let code: ErrorCode;
        let desc: string;

        let errors = xml.getElementsByTagName("error");
        if (errors.length === 0) {
            throw new Error(`XML Format Error: There is no "error" element.`);
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

        return new GetThumbinfoError(code, desc);
    }
}
