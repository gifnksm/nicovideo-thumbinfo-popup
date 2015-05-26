/// <reference path="../../../../typings/common.d.ts" />
"use strict";

import DescriptionParser from "./DescriptionParser";

import {ThumbType} from "../constants";
import TagData from "../TagData";
import {User, Channel} from "../Uploader";
import VideoKey from "../VideoKey";
import RawVideoData from "../RawVideoData";
import ErrorInfo, {ErrorCode} from "../ErrorInfo";

interface ParserState {
    key: VideoKey;
    main_category?: string;
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
                return new ErrorInfo(ErrorCode.NotFound,
                                     `XML Format Error: There is no "video_info" elements.`)
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
        let state = <ParserState>{key: key};

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
                data.videoId = text;
                break;
            case "user_id":
                user.id = text;
                data.uploader = user;
                break;
            case "deleted":
                switch (text) {
                case "0":
                    // 視聴可能な動画。
                    // 後で上書きさせるため、thumbType は設定しない
                    break;
                case "1":
                    data.thumbType = ThumbType.DeletedByUploader;
                    break;
                case "2":
                    data.thumbType = ThumbType.DeletedByAdmin;
                    break;
                case "3":
                    data.thumbType = ThumbType.DeletedByContentHolder;
                    break;
                case "8":
                    data.thumbType = ThumbType.DeletedAsPrivate;
                    break;
                default:
                    console.warn("Unknown deleted value:", node);
                    break;
                }
                break;
            case "title":
                data.title = text;
                break;
            case "description":
                data.description = DescriptionParser.parse(text, false);
                break;
            case "length_in_seconds":
                data.lengthInSeconds = parseInt(text, 10);
                break;
            case "thumbnail_url":
                data.thumbnailUrl = text;
                break;
            case "first_retrieve":
                data.postedAt = new Date(text);
                break;
            case "default_thread":
                if (data.thumbType === undefined) {
                    if (state.key.type === VideoKey.Type.ThreadId &&
                        text !== state.key.id) {
                        data.thumbType = ThumbType.MyMemory;
                    } else {
                        data.thumbType = ThumbType.Video;
                    }
                }
                break;
            case "view_counter":
                data.viewCounter = parseInt(text, 10);
                break;
            case "mylist_counter":
                data.mylistCounter = parseInt(text, 10);
                break;
            case "option_flag_community":
                if (!!parseInt(text, 10)) {
                    data.thumbType = ThumbType.CommunityOnly;
                }
                break;
            case "main_category":
                state.main_category = text;
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
                data.commentCounter = parseInt(text, 10);
                break;
            case "community_id":
                if (data.thumbType === ThumbType.MyMemory) {
                    data.thumbType = ThumbType.Community;
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
                data.commentCounter = parseInt(text, 10);
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
                channel.id = text;
                data.uploader = channel;
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
                let name = tagElem[0].textContent;
                let tag = new TagData(name);
                tag.isLocked = undefined;
                tag.isCategory = (state.main_category !== undefined &&
                                  state.main_category === name);
                tag.nicopediaRegistered = undefined;
                data.tags.push(tag);
                break;

            default:
                console.warn("Unknown element:", node);
                break;
            }
        }
    }
}

export default V3VideoArrayParser;
