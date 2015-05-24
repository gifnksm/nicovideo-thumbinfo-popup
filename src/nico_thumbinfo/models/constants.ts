/// <reference path="../../../typings/common.d.ts" />
"use strict";

export const enum DataSource {
    Merge,
    WatchPage,
    V3VideoArray,
    GetThumbinfo
}

export const enum ThumbType {
    Unknown,
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
