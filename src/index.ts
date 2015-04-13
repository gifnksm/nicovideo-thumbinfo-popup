/// <reference path="../typings/common.d.ts" />

import * as React from "react";
import NicoThumbinfo from "./component/NicoThumbinfo";
import NicoThumbinfoKey from "./model/NicoThumbinfoKey";

console.log(NicoThumbinfoKey.fromUrl("http://www.nicovideo.jp/watch/sm9"));
React.render(React.createElement(NicoThumbinfo,{}), document.body);
