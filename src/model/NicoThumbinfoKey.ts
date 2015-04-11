/// <reference path="../../typings/common.d.ts" />

import {Option, Some, None} from "option-t";

/**
 * URLよりサムネイル情報取得用キーを抽出するための関数群。
 *
 * サムネイル情報取得用キーには以下の2種類が存在する。
 *
 * * 動画ID
 * * スレッドID
 *
 * 以下の内容は独自研究であり、誤りが含まれる可能性が高い。
 *
 * *動画ID* は、動画投稿ごとに一意に生成されるIDである。
 * 動画の投稿先を表すアルファベット2文字 (プレフィックス) と、全投稿動画でユニークな連番からなる。
 * *スレッドID* は、動画に付与されるコメントのグループ？ごとに一意なIDである。
 * チェンネル・コミュニティ動画やマイメモリーにの視聴用URLとして利用される。
 * 10桁以上の数値からなる (スレッド生成時点のエポック秒？)。
 *
 * 1つの動画IDに対し、複数のスレッドIDが存在することはあるが、
 * 複数のスレッドIDに対し、複数の動画IDが存在することはないと考えられる。
 *
 * 参考: http://d.hatena.ne.jp/kotas/20070926/watchurl
 */
module NicoThumbinfoKey {

    /**
     * 動画IDのプレフィックス (先頭2文字) 部分の定義。
     *
     * IDのプレフィックスは以下を参考に抽出。
     *
     * 参考: http://dic.nicovideo.jp/a/id
     */
    module Prefix {
        const User = "sm|nm";
        const OldUser = "am|fz|ut";
        const Official = "ax|ca|cd|cw|fx|ig|na|om|sd|sk|yk|yo|za|zb|zc|zd|ze|so|nl";

        // Not consider deprecated links.
        export const AutoLink = [User, Official].join("|");
    }

    module RegExpStr {
        const NicovideoDomain = "(?:ext|www|tw|es|de|de|nine)\\.nicovideo\\.jp";
        const NicoMsDomain = "nico\\.ms";
        module VideoId {
            export const Strict = `(?:${Prefix.AutoLink})\\d+`;
            export const Loose = `[a-z]{2}\\d+`;
        }
        module ThreadId {
            export const Strict = `\\d{10,}`;
            export const Loose = `\\d+`;
        }

        /**
         * URLから動画IDを抽出するための正規表現。
         *
         * 動画IDしか出現しないような箇所とのマッチングについては、
         * 未知のIDが追加された場合にもそれらしく動作するよう、
         * プレフィックスは任意のアルファベット2文字を許容する。
         * 動画ID以外の文字列が出現する可能性がある箇所内でのマッチングについては、
         * 誤爆を防ぐため既知のプレフィックスと完全一致する場合のみを許容する。
         *
         * スレッドIDについては数字のみからなるものなので、頑張りようがない。
         */
        export const Url = [
            // 動画再生ページ中の 動画ID (m[1]) / スレッドID (m[2])
            `${NicovideoDomain}/watch/(?:(${VideoId.Loose})|(${ThreadId.Loose}))`,

            // タグ検索URL中の 動画ID (m[3]) / スレッドID (m[4])
            `^http://${NicovideoDomain}/tag/.*?(?:(${VideoId.Strict})|watch%d[fF](${ThreadId.Strict}))`,

            // 外部サイト埋め込み用iframe URL中の 動画ID (m[5]) / スレッドID (m[6])
            `^http://${NicovideoDomain}/thumb/(?:(${VideoId.Loose})|(${ThreadId.Loose}))`,

            // 公式短縮URL中の 動画ID (m[7])
            `^http://${NicoMsDomain}/(${VideoId.Strict})`
        ].join('|');
    }

    /**
     * URLから動画IDを抽出するための正規表現。
     */
    const UrlRegExp = new RegExp(RegExpStr.Url);

    /**
     * URLからサムネイル情報取得用キーをを抽出する。
     *
     * @param   url 変換元のURL
     * @returns サムネイル情報取得用キー
     */
    export function fromUrl(url: string): Option<string> {
        let m = UrlRegExp.exec(url);
        console.log(UrlRegExp, url, m);
        if (m !== null) {
            let id: string;
            // 動画ID
            if (id = (m[1] || m[3] || m[5] || m[7])) {
                return new Some(`video:${id}`);
            }
            // スレッドID
            if (id = (m[2] || m[4] || m[6])) {
                return new Some(`thread:${id}`);
            }
            console.error("Unkown match result.", m, url, UrlRegExp);
        }
        return new None<string>();
    }
}

export default NicoThumbinfoKey;
