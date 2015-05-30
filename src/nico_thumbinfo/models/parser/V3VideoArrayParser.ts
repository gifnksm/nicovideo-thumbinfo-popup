/// <reference path="../../../../typings/bundle.d.ts" />
"use strict";

import DescriptionParser from "./DescriptionParser";

import {ThumbType} from "../constants";
import TagData from "../TagData";
import {User, Channel} from "../Uploader";
import VideoKey from "../VideoKey";
import RawVideoData from "../RawVideoData";
import ErrorInfo, {ErrorCode} from "../ErrorInfo";

import {Option, Some, None} from "option-t";

class ParserState {
    _key: VideoKey;
    main_category: Option<string> = new None<string>();

    constructor(key: VideoKey) {
        this._key = key;
    }

    get key() { return this._key; }
}

module V3VideoArrayParser {
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
            if (docElem.nodeName !== "nicovideo_video_response") {
                return new ErrorInfo(ErrorCode.Invalid,
                                     `XML Format Error: Root element name is "${docElem.nodeName}".`);
            }
            if (!docElem.hasAttribute("status")) {
                return new ErrorInfo(ErrorCode.Invalid,
                                     `XML Format Error: Root element does not have "status" attribute.`);
            }

            if (xml.documentElement.getAttribute("status") !== "ok") {
                return new ErrorInfo(ErrorCode.Invalid,
                                     `XML Format Error: Unknown status "${status}".`);
            }

            let videoInfos = docElem.getElementsByTagName("video_info");
            if (videoInfos.length === 0) {
                return new ErrorInfo(ErrorCode.NotFound);
            }
            if (videoInfos.length > 1) {
                return new ErrorInfo(ErrorCode.Invalid,
                                     `XML Format Error: Too many "video_info" elements.`)
            }

            return _parseVideoInfo(key, <Element>videoInfos[0]);
        } catch (e) {
            // XMLツリーの走査時にエラーが起きるかもしれないので、念の為catchしておく
            return new ErrorInfo(ErrorCode.Invalid, "" + e);
        }
    }

    function _parseVideoInfo(key: VideoKey, videoInfo: Element): RawVideoData|ErrorInfo {
        let data = RawVideoData.createV3VideoArray(key);
        let state = new ParserState(key);

        // TODO: Stop using Array.prototype.slice
        // for (let node of videoInfo.childNodes) {
        for (let node of Array.prototype.slice.call(videoInfo.childNodes)) {
            if (node.nodeType !== Node.ELEMENT_NODE) {
                continue;
            }

            switch (node.nodeName) {
            case "video":
                _parseVideo(state, data, node);
                break;
            case "thread":
                _parseThread(data, node);
                break;
            case "channel_thread":
                _parseChannelThread(data, node);
                break;
            case "video_options":
                _parseVideoOptions(data, node);
                break;
            case "tags":
                _parseTags(state, data, node);
                break;

            default:
                console.warn("Unknown element:", node);
                break;
            }
        }

        return data;
    }

    function _parseVideo(state: ParserState, data: RawVideoData, video: Element) {
        let user: User = new User();

        // TODO: Stop using Array.prototype.slice
        // for (let node of video.childNodes) {
        for (let node of Array.prototype.slice.call(video.childNodes)) {
            if (node.nodeType !== Node.ELEMENT_NODE) {
                continue;
            }
            let text: string = node.textContent;
            if (text === "") {
                continue;
            }

            switch (node.nodeName) {
            case "id":
                data.videoId = new Some(text);
                break;
            case "user_id":
                user.id = new Some(text);
                data.uploader = new Some(user);
                break;
            case "deleted":
                switch (text) {
                case "0":
                    // 視聴可能な動画。
                    // 後で上書きさせるため、thumbType は設定しない
                    break;
                case "1":
                    data.thumbType = new Some(ThumbType.DeletedByUploader);
                    break;
                case "2":
                    data.thumbType = new Some(ThumbType.DeletedByAdmin);
                    break;
                case "3":
                    data.thumbType = new Some(ThumbType.DeletedByContentHolder);
                    break;
                case "8":
                    data.thumbType = new Some(ThumbType.DeletedAsPrivate);
                    break;
                default:
                    console.warn("Unknown deleted value:", node);
                    break;
                }
                break;
            case "title":
                data.title = new Some(text);
                break;
            case "description":
                data.description = new Some(DescriptionParser.parse(text, false));
                break;
            case "length_in_seconds":
                data.lengthInSeconds = new Some(parseInt(text, 10));
                break;
            case "thumbnail_url":
                data.thumbnailUrl = new Some(text);
                break;
            case "first_retrieve":
                data.postedAt = new Some(new Date(text));
                break;
            case "default_thread":
                if (data.thumbType.isNone) {
                    if (state.key.type === VideoKey.Type.ThreadId &&
                        text !== state.key.id) {
                        data.thumbType = new Some(ThumbType.MyMemory);
                    } else {
                        data.thumbType = new Some(ThumbType.Video);
                    }
                }
                break;
            case "view_counter":
                data.viewCounter = new Some(parseInt(text, 10));
                break;
            case "mylist_counter":
                data.mylistCounter = new Some(parseInt(text, 10));
                break;
            case "option_flag_community":
                if (!!parseInt(text, 10)) {
                    data.thumbType = new Some(ThumbType.CommunityOnly);
                }
                break;
            case "main_category":
                state.main_category = new Some(text);
                break;

            case "size_low":
            case "movie_type":
            case "option_flag_ichiba":
            case "option_flag_domestic":
            case "option_flag_comment_type":
            case "option_flag_adult":
            case "option_flag_mobile":
            case "option_flag_economy_mp4":
            case "option_flag_middle_video":
            case "option_flag_mobile_ng_apple":
            case "option_flag_old_message_server":
            case "option_flag_ng_nicobox":
            case "option_flag_vast_enabled":
            case "main_category_key":
                break;

            default:
                console.warn("Unknown element:", node);
                break;
            }

        }
    }
    function _parseThread(data: RawVideoData, thread: Element) {
        // TODO: Stop using Array.prototype.slice
        // for (let node of thread.childNodes) {
        for (let node of Array.prototype.slice.call(thread.childNodes)) {
            if (node.nodeType !== Node.ELEMENT_NODE) {
                continue;
            }

            let text: string = node.textContent;
            if (text === "") {
                continue;
            }

            switch (node.nodeName) {
            case "num_res":
                data.commentCounter = new Some(parseInt(text, 10));
                break;
            case "community_id":
                if (data.thumbType.mapOr(false, type => type === ThumbType.MyMemory)) {
                    data.thumbType = new Some(ThumbType.Community);
                }
                break;

            case "id":
            case "public":
                break;
            default:
                console.warn("Unknown element:", node);
                break;
            }
        }
    }
    function _parseChannelThread(data: RawVideoData, channelThread: Element) {
        // TODO: Stop using Array.prototype.slice
        // for (let node of channelThread.childNodes) {
        for (let node of Array.prototype.slice.call(channelThread.childNodes)) {
            if (node.nodeType !== Node.ELEMENT_NODE) {
                continue;
            }

            let text: string = node.textContent;
            if (text === "") {
                continue;
            }

            switch (node.nodeName) {
            case "num_res":
                data.commentCounter = new Some(parseInt(text, 10));
                break;

            case "id":
                break;
            default:
                console.warn("Unknown element:", node);
                break;
            }
        }
    }
    function _parseVideoOptions(data: RawVideoData, videoOptions: Element) {
        let channel = new Channel();
        // TODO: Stop using Array.prototype.slice
        // for (let node of videoOptions.childNodes) {
        for (let node of Array.prototype.slice.call(videoOptions.childNodes)) {
            if (node.nodeType !== Node.ELEMENT_NODE) {
                continue;
            }

            let text: string = node.textContent;
            if (text === "") {
                continue;
            }

            switch (node.nodeName) {
            case "channel_id":
                channel.id = new Some(text);
                data.uploader = new Some(channel);
                break;

            case "title_url":
            case "permission":
            case "title_url":
            case "ppv_type":
                break;
            default:
                console.warn("Unknown element:", node);
                break;
            }
        }
    }
    function _parseTags(state: ParserState, data: RawVideoData, tags: Element) {
        // TODO: Stop using Array.prototype.slice
        // for (let node of tags.childNodes) {
        for (let node of Array.prototype.slice.call(tags.childNodes)) {
            if (node.nodeType !== Node.ELEMENT_NODE) {
                continue;
            }

            let text: string = node.textContent;
            if (text === "") {
                continue;
            }

            switch (node.nodeName) {
            case "tag_info":
                let tagElem = node.getElementsByTagName("tag");
                if (tagElem.length === 0) {
                    break;
                }
                data.tags.push(_parseTagInfo(state, tagElem[0]));
                break;

            default:
                console.warn("Unknown element:", node);
                break;
            }
        }
    }

    function _parseTagInfo(state: ParserState, tagElem: Node) {
        let name = tagElem.textContent;
        let tag = new TagData(name);
        let isCategory = state
            .main_category
            .mapOr(false, main_category => main_category === name);

        tag.isCategory = new Some(isCategory);
        if (isCategory) {
            tag.isLocked = new Some(true); // カテゴリタグは必ずロックされている
        }

        return tag;
    }
}

export default V3VideoArrayParser;
