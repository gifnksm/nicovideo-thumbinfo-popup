/// <reference path="../../../typings/bundle.d.ts" />
"use strict";

export const enum DataSource {
    // 優先度の高い順に並べること (RawVideoData のマージ時に使われる)
    Merge,
    V3VideoArray,
    GetThumbinfo,
    InitialDummy // Key のみから生成されたダミー情報
}

export const enum ThumbType {
    Video,
    MyMemory,
    Community,
    CommunityOnly,
    Deleted,
    DeletedByUploader,
    DeletedByAdmin,
    DeletedByContentHolder,
    DeletedAsPrivate
}
