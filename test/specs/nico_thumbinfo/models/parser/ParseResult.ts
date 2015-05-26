/// <reference path="../../../../../typings/common.d.ts" />
"use strict";

import RawVideoData from "../../../../../src/nico_thumbinfo/models/RawVideoData";

import {DataSource, ThumbType} from "../../../../../src/nico_thumbinfo/models/constants";
import {DescriptionElement as DElement, DescriptionText as DText} from "../../../../../src/nico_thumbinfo/models/DescriptionNode";
import TagData from "../../../../../src/nico_thumbinfo/models/TagData";
import {User, Channel} from "../../../../../src/nico_thumbinfo/models/Uploader";
import VideoKey from "../../../../../src/nico_thumbinfo/models/VideoKey";

function tag(name: string, isCategory?: boolean, isLocked?: boolean): TagData {
    let tag = new TagData(name);
    tag.isCategory = isCategory;
    tag.isLocked = isLocked;
    tag.nicopediaRegistered = undefined;
    return tag;
}

const ParseResult: {[index: string]: (source: DataSource, key?: VideoKey) => RawVideoData} = {
    "sm9": (source: DataSource) => {
        let data: RawVideoData;
        let locked = source === DataSource.GetThumbinfo ? true : undefined;
        let notLocked = source === DataSource.GetThumbinfo ? false : undefined;

        switch (source) {
        case DataSource.GetThumbinfo:
            data = RawVideoData.createGetThumbinfo(VideoKey.fromVideoId("sm9"));
            break;
        case DataSource.V3VideoArray:
            data = RawVideoData.createV3VideoArray(VideoKey.fromVideoId("sm9"));
            break;
        }
        data.thumbType = ThumbType.Video;
        data.videoId = "sm9";
        data.title = "新・豪血寺一族 -煩悩解放 - レッツゴー！陰陽師";
        data.description = [new DText("レッツゴー！陰陽師（フルコーラスバージョン）")];
        data.thumbnailUrl = "http://tn-skr2.smilevideo.jp/smile?i=9";
        data.postedAt = new Date("2007-03-05T15:33:00.000Z");
        data.lengthInSeconds = 319;
        data.viewCounter = 14852534;
        data.commentCounter = 4280976;
        data.mylistCounter = 156820;
        if (source === DataSource.GetThumbinfo) {
            data.lastResBody = "うううううううううう ";
        }
        data.tags.push(tag("陰陽師", false, locked));
        data.tags.push(tag("レッツゴー！陰陽師", false, locked));
        data.tags.push(tag("公式", false, locked));
        data.tags.push(tag("音楽", false, locked));
        data.tags.push(tag("ゲーム", false, locked));
        data.tags.push(tag("β時代の英雄", false, notLocked));
        data.tags.push(tag("最古の動画", false, notLocked));
        data.tags.push(tag("豪血寺一族", false, notLocked));
        data.tags.push(tag("sm9", false, notLocked));
        data.tags.push(tag("sm13→", false, notLocked));

        data.uploader = new User();
        data.uploader.id = "4";
        if (source === DataSource.GetThumbinfo) {
            data.uploader.name = "運営長の中の人";
            data.uploader.iconUrl = "http://usericon.nimg.jp/usericon/s/0/4.jpg?1429365260";
        }
        return data;
    },
    "sm22532786": (source: DataSource) => {
        let data = RawVideoData.createV3VideoArray(VideoKey.fromVideoId("sm22532786"));
        data.thumbType = ThumbType.DeletedByUploader;
        data.videoId = "sm22532786";
        data.title = "Aim For The M@STER!";
        data.description = [
            new DText("アイマス×ロボット×特撮みたいなノリの手描き動画です。　(追記)超ギリギリでクリスマス投稿間に合ったよ！別にクリスマス動画じゃないけど！　という訳で皆様、良いお年を～！　他の製作物→"),
            new DElement("a", {"href": "http://www.nicovideo.jp/mylist/40184221"}, [
                new DText("mylist/40184221")
            ])
        ];
        data.thumbnailUrl = "http://tn-skr3.smilevideo.jp/smile?i=22532786";
        data.postedAt = new Date("2013-12-25T14:48:35.000Z");
        data.lengthInSeconds = 364;
        data.viewCounter = 11400;
        data.commentCounter = 491;
        data.mylistCounter = 370;
        data.tags.push(tag("アイドルマスター", true));
        data.tags.push(tag("アイマス紙芝居", false));
        data.tags.push(tag("空母そそそそ", false));
        data.tags.push(tag("アイドルマスター_シンデレラガールズ", false));
        data.tags.push(tag("Novelsm@ster", false));
        data.tags.push(tag("ニコマスおっほい", false));
        data.tags.push(tag("働いちゃダメだ", false));
        data.tags.push(tag("アイドルマスターDS", false));
        data.tags.push(tag("im@sオールスター", false));
        data.uploader = new User();
        data.uploader.id = "36514237";
        return data;
    },
    "1340979099": (source: DataSource) => {
        let data = RawVideoData.createV3VideoArray(VideoKey.fromThreadId("1340979099"));
        data.thumbType = ThumbType.CommunityOnly;
        data.videoId = "sm18222993";
        data.title = "イケニエノフジ";
        data.description = [
            new DText("初夏の候、いかがお過ごしでしょうか。"),
            new DElement("br"),
            new DText("僕らは、相も変わらず元気です...。　　　　　　　　　フジ"),
            new DElement("br"),
            new DElement("br"),
            new DText("初夏の候、あじさいの花が色を深めております。"),
            new DElement("br"),
            new DText("そろそろ海や山が恋しい季節です。...。　　　　　　　キヨ"),
            new DElement("br"),
            new DElement("br"),
            new DElement("br"),
            new DText("【ツイッター】　キヨ→"),
            new DElement("a", {"href": "http://twitter.com/kiyo_saiore"}, [
                new DText("http://twitter.com/kiyo_saiore")
            ]),
            new DText("　　フジ→"),
            new DElement("a", {"href": "http://twitter.com/fuji_saiore"}, [
                new DText("http://twitter.com/fuji_saiore")
            ])
        ];
        data.thumbnailUrl = "http://tn-skr2.smilevideo.jp/smile?i=18222993";
        data.postedAt = new Date("2012-06-29T14:11:38.000Z");
        data.lengthInSeconds = 1051;
        data.viewCounter = 78564;
        data.commentCounter = 12339;
        data.mylistCounter = 1571;
        data.tags.push(tag("ゲーム", true));
        data.tags.push(tag("フジ、あほ", false));
        data.tags.push(tag("キヨ、丁寧解説", false));
        data.tags.push(tag("イケニエノヨル", false));
        data.tags.push(tag("最終兵器俺達", false));
        data.tags.push(tag("電池泥棒", false));
        data.tags.push(tag("最俺裏事情", false));
        data.tags.push(tag("イケニエノフジ", false));
        data.tags.push(tag("死にかけの相棒", false));
        data.tags.push(tag("先生、タグロックそこじゃないです", false));
        data.tags.push(tag("頭を押さえる会", false));
        data.uploader = new User();
        data.uploader.id = "14047911";
        return data;
    },
    "so19903664": (source: DataSource) => {
        let data = RawVideoData.createV3VideoArray(VideoKey.fromVideoId("so19903664"));
        data.thumbType = ThumbType.CommunityOnly;
        data.videoId = "so19903664";
        data.title = "ラブライブ！ ＃2「アイドルを始めよう！」";
        data.description = [
            new DText("毎週日曜23:30より 1週間限定で最新話を無料配信！"),
            new DElement("br"),
            new DText("※第1話は当面の間無料配信いたします"),
            new DElement("br"),
            new DElement("br"),
            new DText("入学希望者を増やすためにスクールアイドルグループを結成することにした穂乃果たちは、生徒会長の絢瀬絵里の反対を受けるも、初ライブのために講堂の使用許可を得ることに成功。"),
            new DElement("br"),
            new DText("グループ名は募集することにして、衣装デザインはことり、作詞は海朱が担当することに。そして始まるトレーニング。"),
            new DElement("br"),
            new DText("そんな中、穂乃果は歌とピアノが得意な1年生の西木野真姫に作曲を依頼するが断られてしまう。"),
            new DElement("br"),
            new DText("さらには絵里から逆効果を指摘され、穂乃果は意気消沈してしまうが……。"),
            new DElement("br"),
            new DElement("br"),
            new DText("動画一覧は"),
            new DElement("a", {"href": "http://ch.nicovideo.jp/channel/ch2526034"}, [
                new DText("こちら")
            ]),
            new DElement("br"),
            new DText("第1話 "),
            new DElement("a", {href: "http://www.nicovideo.jp/watch/1358476816"}, [
                new DText("watch/1358476816")
            ]),
            new DElement("br")
        ];
        data.thumbnailUrl = "http://tn-skr1.smilevideo.jp/smile?i=19903664";
        data.postedAt = new Date("2013-01-27T23:30:00+09:00");
        data.lengthInSeconds = 1420;
        data.viewCounter = 76341;
        data.commentCounter = 0;
        data.mylistCounter = 285;
        data.tags.push(tag("アニメ", true));
        data.tags.push(tag("ラブライブ！", false));
        data.tags.push(tag("新田恵海", false));
        data.tags.push(tag("南條愛乃", false));
        data.tags.push(tag("内田彩", false));
        data.tags.push(tag("μ's", false));
        data.tags.push(tag("＞＜", false));
        data.tags.push(tag("三森すずこ", false));
        data.tags.push(tag("丸投げは基本", false));
        data.uploader = new Channel();
        data.uploader.id = "2526034";
        return data;
    },
    "sm1": (source: DataSource) => {
        let data = RawVideoData.createV3VideoArray(VideoKey.fromVideoId("sm1"));
        data.thumbType = ThumbType.DeletedAsPrivate;
        data.videoId = "sm1";
        data.title = undefined;
        data.description = [
            new DElement("br"),
            new DElement("br"),
            new DElement("span", {style: "background:#FFCCCC; color:#FF0000;"}, [
                new DElement("span", {id: "deleted_message_default"}, [
                    new DText("この動画は削除されました。")
                ]),
                new DElement("span", {id: "deleted_message_ext",
                                      value: "This video has been deleted" })
            ])
        ];
        data.postedAt = new Date("2007-04-16T02:59:43+09:00");
        data.lengthInSeconds = 0;
        data.viewCounter = 2956;
        data.commentCounter = 2308;
        data.mylistCounter = 4098;
        data.lastResBody = undefined;
        data.tags.push(tag("sm1", false));
        data.tags.push(tag("次：sm2", false));
        data.tags.push(tag("201304290248", false));

        data.uploader = new User();
        data.uploader.id = "6";
        return data;
    },
    "sm24": (source: DataSource) => {
        let data = RawVideoData.createV3VideoArray(VideoKey.fromVideoId("sm24"));
        data.thumbType = ThumbType.DeletedByContentHolder;
        data.videoId = "sm24";
        data.title = "おかもんたの朝メチャ！　";
        data.description = [
            new DText("ガツンてやってやりゃいいんだよガツンとさ！"),
            new DElement("br"),
            new DElement("br"),
            new DElement("span", {style: "background:#FFCCCC; color:#FF0000;"}, [
                new DElement("span", {id: "deleted_message_default"}, [
                    new DText("この動画は株式会社フジテレビジョンの権利を侵害していたため、または申し立てがあったため削除されました。")
                ]),
                new DElement("span", {id: "deleted_message_ext",
                                      value: "This video has been deleted due to Fuji Television Network, Inc. 's rights infringement or notice of motion." })
            ])
        ];
        data.postedAt = new Date("2007-03-06T04:35:11+09:00");
        data.thumbnailUrl = "http://tn-skr1.smilevideo.jp/smile?i=24";
        data.lengthInSeconds = 85;
        data.viewCounter = 75170;
        data.commentCounter = 1695;
        data.mylistCounter = 74;
        data.lastResBody = undefined;
        data.tags.push(tag("おかもんた", false));
        data.tags.push(tag("朝メチャ！", false));
        data.tags.push(tag("朝ズバッ！のパロ", false));
        data.tags.push(tag("ゆゆ式", false));
        data.tags.push(tag("ご注文はうさぎですか?", false));
        data.tags.push(tag("涼宮ハルヒの憂鬱", false));
        data.tags.push(tag("ストライクウィッチーズ", false));
        data.tags.push(tag("けいおん！", false));
        data.tags.push(tag("ひだまりスケッチ", false));
        data.tags.push(tag("魔法少女まどか☆マギカ", false));

        data.uploader = new User();
        data.uploader.id = "13987";
        return data;
    },
    "1182590816": (source: DataSource, key: VideoKey = VideoKey.fromThreadId("1182590816")) => {
        let data = RawVideoData.createV3VideoArray(key);
        data.thumbType = ThumbType.Video;
        data.videoId = "sm500873";
        data.title = "組曲『ニコニコ動画』 ";
        data.description = [
            new DElement("font", {size: "+2"}, [
                new DText("700万再生、ありがとうございました。"),
                new DElement("br"),
                new DText("記念動画公開中です ⇒ ("),
                new DElement("a", {href: "http://www.nicovideo.jp/watch/sm14242201"}, [
                    new DText("sm14242201")
                ]),
                new DText(")"),
                new DElement("br")
            ]),
            new DElement("br"),
            new DText("ニコニコ動画(β・γ)で人気のあった曲などを繋いでひとつの曲にしてみました(2度目)。全33曲。"),
            new DElement("br"),
            new DElement("font", {size: "-2"}, [
                new DText("※多くの方を誤解させてしまっているようですが(申し訳ないです)、厳密には「組曲」ではなく「メドレー」です。"),
                new DElement("br"),
                new DText("「組曲という名前のメドレー」だと思ってください。")
            ]),
            new DElement("br"),
            new DElement("br"),
            new DElement("a", {href: "http://www.nicovideo.jp/mylist/1535765"}, [
                new DText("mylist/1535765")
            ]),
            new DElement("br"),
            new DElement("a", {href: "http://www.nicovideo.jp/user/145217"}, [
                new DText("user/145217")
            ])
        ];
        data.postedAt = new Date("2007-06-23T18:27:06+09:00");
        data.thumbnailUrl = "http://tn-skr2.smilevideo.jp/smile?i=500873";
        data.lengthInSeconds = 648;
        data.viewCounter = 8747261;
        data.commentCounter = 4406924;
        data.mylistCounter = 139935;
        data.lastResBody = undefined;
        data.tags.push(tag("音楽", true));
        data.tags.push(tag("アレンジ", false));
        data.tags.push(tag("組曲『ニコニコ動画』", false));
        data.tags.push(tag("空気の読めるWMP", false));
        data.tags.push(tag("ニコニコオールスター", false));
        data.tags.push(tag("しも", false));
        data.tags.push(tag("ニコニコメドレー殿堂入り", false));
        data.tags.push(tag("ニコニコメドレーシリーズ", false));
        data.tags.push(tag("RC時代の豪傑", false));
        data.tags.push(tag("職人の遊び場", false));

        data.uploader = new User();
        data.uploader.id = "145217";
        return data;
    },
    "1199124049": (source: DataSource) => {
        let data = ParseResult["1182590816"](source, VideoKey.fromThreadId("1199124049"));
        data.thumbType = ThumbType.MyMemory;
        data.viewCounter = 8747273;
        data.mylistCounter = 139935;
        data.commentCounter = 1100;
        return data;
    },
    "1406548974": (source: DataSource) => {
        let data = RawVideoData.createV3VideoArray(VideoKey.fromThreadId("1406548974"));
        data.thumbType = ThumbType.Community;
        data.videoId = "sm24109050";
        data.title = "【実況】純情無垢な僕がドリームクラブGogo.　その27(最終回)";
        data.description = [
            new DText("ゲームは終わっても僕らのドリクラは終わらない！"),
            new DElement("br"),
            new DText("なんだかんだで美月ちゃん可愛かったので良し。"),
            new DElement("br"),
            new DText("またいつかね！"),
            new DElement("br"),
            new DElement("br"),
            new DText("最初 【"),
            new DElement("a", {href: "http://www.nicovideo.jp/watch/sm23421770"}, [
                new DText("sm23421770")
            ]),
            new DText("】　 ←　その26 【"),
            new DElement("a", {href: "http://www.nicovideo.jp/watch/sm24085907"}, [
                new DText("sm24085907")
            ]),
            new DText("】　次の実況 【まだ】→"),
            new DElement("br"),
            new DText("動画にコメント打てない人用 【"),
            new DElement("a", {href: "http://www.nicovideo.jp/watch/sm24109050"}, [
                new DText("sm24109050")
            ]),
            new DText("】"),
            new DElement("br"),
            new DText("この実況のマイリスト 【"),
            new DElement("a", {href: "http://www.nicovideo.jp/mylist/43820926"}, [
                new DText("mylist/43820926")
            ]),
            new DText("】　その他の実況とか 【"),
            new DElement("a", {href: "http://www.nicovideo.jp/mylist/14920168"}, [
                new DText("mylist/14920168")
            ]),
            new DText("】"),
            new DElement("br")
        ];
        data.postedAt = new Date("2014-07-28T20:52:48+09:00");
        data.thumbnailUrl = "http://tn-skr3.smilevideo.jp/smile?i=24109050";
        data.lengthInSeconds = 1357;
        data.viewCounter = 3848;
        data.commentCounter = 0;
        data.mylistCounter = 28;
        data.lastResBody = undefined;
        data.tags.push(tag("ゲーム", true));
        data.tags.push(tag("実況プレイ動画", false));
        data.tags.push(tag("ドリームクラブGogo.", false));
        data.tags.push(tag("オンナスキーP", false));
        data.tags.push(tag("美月", false));
        data.tags.push(tag("続いていくだ", false));

        data.uploader = new User();
        data.uploader.id = "14906592";
        return data;
    }
};

export default ParseResult;
