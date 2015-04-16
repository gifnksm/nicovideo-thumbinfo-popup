/// <reference path="../../../../typings/common.d.ts" />

import Key from "../VideoKey";
import {RawData, User, Channel, Tag} from "../VideoData";

enum ErrorCode {
    Deleted, Community, NotFound
}

class GetThumbinfoError {
    code: ErrorCode;
    description: string;
    constructor(code: ErrorCode, description: string) {
        this.code = code;
        this.description = description;
    }
}

export class Parser {
    private static parser: DOMParser = new DOMParser();

    parse(key: Key, input: string): Promise<RawData|GetThumbinfoError> {
        return new Promise((resolve, reject) => {
            let xml = Parser.parser.parseFromString(input, "application/xml");
            if (xml.documentElement.nodeName === "parseerror") {
                reject(new Error(xml.documentElement.firstChild.textContent));
                return;
            }

            let status = xml.documentElement.getAttribute("status");
            if (status !== "ok") {
                resolve(this._parseError(key, xml));
            } else {
                resolve(this._parseOk(key, xml));
            }
        });
    }

    private _parseOk(key: Key, xml: XMLDocument): RawData {
        let data = RawData.createGetThumbinfo(key);
        data.tags = {};

        if (key.type === Key.Type.ThreadId) {
            data.threadId = key.id;
        }

        let user: User = new User();
        let channel: Channel = new Channel();

        // for (let node of xml.getElementsByTagName("thumb")[0].childNodes) {
        for (let node of Array.prototype.slice.call(xml.getElementsByTagName("thumb")[0].childNodes)) {
            if (node.nodeType !== Node.ELEMENT_NODE) {
                continue;
            }

            let text = node.textContent;
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
            case "first_retrieve": data.postedAt = text; break;
            case "length": data.length = text; break;

            case "view_counter": data.viewCounter = text; break;
            case "comment_num": data.commentCounter = text; break;
            case "mylist_countenr": data.mylistCounter = text; break;
            case "last_res_body": data.lastResBody = text; break;

            case "tags":
                data.tags[node.getAttribute("domain")] = Array.prototype.map.call(
                    node.getElementsByTagName("tag"),
                    (elem: Element) => {
                        let tag = new Tag();
                        tag.name = elem.textContent;
                        tag.isLocked = elem.hasAttribute("lock");
                        tag.isCategory = elem.hasAttribute("category");
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
            }
        }
        return data;
    }

    private _parseError(key: Key, xml: XMLDocument): GetThumbinfoError {
        let code: ErrorCode;

        switch (xml.getElementsByTagName("code")[0].textContent) {
        case "DELETED":
            code = ErrorCode.Deleted;
            break;
        case "COMMUNITY":
            code = ErrorCode.Community;
            break;
        case "NOT_FOUND":
            code = ErrorCode.NotFound;
            break;
        }

        let desc = xml.getElementsByTagName("description")[0].textContent;
        return new GetThumbinfoError(code, desc);
    }
}
