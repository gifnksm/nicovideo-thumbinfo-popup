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

const ParseResult: {[index: string]: (source: DataSource) => RawVideoData} = {
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
    }
};

export default ParseResult;
