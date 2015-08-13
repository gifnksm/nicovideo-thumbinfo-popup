/// <reference path="../../typings/bundle.d.ts" />
"use strict";

import {Option, Some, None} from "option-t";

const UAHeader = "User-Agent";

const enum Method {
    Get, Head, Post, Put, Delete
}

export type Headers = {[index: string]: string};

export class Request {
    private _method: Method;
    private _url: string;
    private _body: string;
    public headers: Headers = {};
    public timeout: number = undefined;

    constructor(method: Method, url: string, body?: string) {
        this._method = method;
        this._url = url;
        this._body = body;
    }

    get method() {
        switch (this._method) {
        case Method.Get:
            return "GET";
        case Method.Head:
            return "HEAD";
        case Method.Post:
            return "POST";
        case Method.Put:
            return "PUT";
        case Method.Delete:
            return "DELETE";
        }
        throw new Error("Unknown method: " + this._method);
    }

    get url() { return this._url; }
    get body() { return this._body; }

    static get(url: string): Request {
        return new Request(Method.Get, url);
    }
    static head(url: string): Request {
        return new Request(Method.Head, url);
    }
    static post(url: string, body: string): Request {
        return new Request(Method.Post, url, body);
    }
    static put(url: string, body: string): Request {
        return new Request(Method.Put, url, body);
    }
    static del(url: string): Request {
        return new Request(Method.Delete, url);
    }
}

export interface Response {
    responseHeaders: string;
    responseText: string;
    status: number;
    statusText: string;
}

// TODO: Support aborting fetch operation.
interface UrlFetcher {
    fetch(request: Request): Promise<Response>;
}

namespace UrlFetcher {
    var instance: Option<UrlFetcher> = new None<UrlFetcher>();

    export function getInstance(): UrlFetcher {
        if (instance.isSome) {
            return instance.unwrap();
        }

        if (GmUrlFetcher.isAvailable) {
            instance = new Some(new GmUrlFetcher());
            return instance.unwrap();
        }
        if (XhrUrlFetcher.isAvailable) {
            instance = new Some(new XhrUrlFetcher());
            return instance.unwrap();
        }

        throw new Error("No UrlFetcher available.");
    }
}

export default UrlFetcher;

function getUserAgent() {
    let ua = "";
    if (typeof GM_info !== "undefined") {
        ua += `Greasemonkey/${GM_info.version} ${GM_info.script.name}/${GM_info.version} `;
    }
    ua += window.navigator.userAgent;
    return ua;
}

class GmUrlFetcher implements UrlFetcher {
    static get isAvailable(): boolean {
        return typeof GM_xmlhttpRequest === "function";
    }

    fetch(request: Request): Promise<Response> {
        return new Promise((resolve, reject) => {
            if (request.headers[UAHeader] === undefined) {
                request.headers[UAHeader] = getUserAgent();
            }

            GM_xmlhttpRequest({
                url: request.url,
                method: request.method,
                headers: request.headers,
                data: request.body,
                timeout: request.timeout,
                onload: response => resolve(response),
                onerror: response => reject(response.statusText),
                ontimeout: response => reject(response.statusText),
                onabort: response => reject(response.statusText)
            });
        });
    }
}

class XhrUrlFetcher implements UrlFetcher {
    static get isAvailable(): boolean {
        return typeof XMLHttpRequest === "function";
    }

    fetch(request: Request): Promise<Response> {
        return new Promise((resolve, reject) => {
            let xhr = new XMLHttpRequest();
            xhr.open(request.method, request.url, true);

            xhr.onload = () => {
                resolve({
                    responseHeaders: xhr.getAllResponseHeaders(),
                    responseText: xhr.responseText,
                    status: xhr.status,
                    statusText: xhr.statusText
                });
            };
            xhr.onerror = () => reject(xhr.statusText);
            xhr.ontimeout = () => reject(xhr.statusText);
            xhr.onabort = () => reject(xhr.statusText);

            let uaDefined = false;
            for (let key in Object.keys(request.headers)) {
                if (key === UAHeader) {
                    uaDefined = true;
                }
                xhr.setRequestHeader(key, request.headers[key]);
            }
            if (!uaDefined) {
                xhr.setRequestHeader(UAHeader, getUserAgent());
            }

            if (request.timeout !== undefined) {
                xhr.timeout = request.timeout;
            }

            xhr.send(request.body);
        });
    }
}
