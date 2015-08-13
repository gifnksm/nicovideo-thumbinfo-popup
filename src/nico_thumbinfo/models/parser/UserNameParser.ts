/// <reference path="../../../../typings/bundle.d.ts" />
"use strict";

import ErrorInfo, {ErrorCode} from "../ErrorInfo";

import {Option, Some, None} from "option-t";

namespace UserNameParser {
    const Parser = new DOMParser();

    export function parse(input: string): string|ErrorInfo {
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
            if (docElem.nodeName !== "response") {
                return new ErrorInfo(ErrorCode.Invalid,
                                     `XML Format Error: Root element name is "${docElem.nodeName}".`);
            }
            let errors = docElem.getElementsByTagName("error");
            if (errors.length > 0) {
                return new ErrorInfo(ErrorCode.Invalid, error[0].textContent);
            }

            let nicks = docElem.getElementsByTagName("nickname");
            if (nicks.length === 0) {
                return new ErrorInfo(ErrorCode.Invalid);
            }
            if (nicks.length > 1) {
                return new ErrorInfo(ErrorCode.Invalid,
                                    `XML Format Error: No "nickname" element found.`);
            }
            let value = nicks[0].textContent;
            if (value === "-") {
                return new ErrorInfo(ErrorCode.NotFound);
            }
            return value;
        } catch (e) {
            // XMLツリーの走査時にエラーが起きるかもしれないので、念の為catchしておく
            return new ErrorInfo(ErrorCode.Invalid, "" + e);
        }
    }
}

export default UserNameParser;
