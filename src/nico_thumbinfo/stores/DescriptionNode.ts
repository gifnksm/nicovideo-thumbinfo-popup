/// <reference path="../../../typings/common.d.ts" />
"use strict";

import * as React from "react";

export interface DescriptionNode {
    render(): React.ReactNode;
    mapElementCond(cond: (elem: DescriptionElement) => boolean,
                   f: (elem: DescriptionElement) => DescriptionNode[]): DescriptionNode[];
    mapTextCond(cond: (elem: DescriptionElement) => boolean,
                f: (text: DescriptionText) => DescriptionNode[]): DescriptionNode[];
    mapElement(f: (elem: DescriptionElement) => DescriptionNode[]): DescriptionNode[];
    mapText(f: (text: DescriptionText) => DescriptionNode[]): DescriptionNode[];
}

export class DescriptionElement implements DescriptionNode {
    constructor(
        public name: string,
        public attributes: {[index: string]: string} = {},
        public children: DescriptionNode[] = []) {}

    render() {
        return React.createElement(this.name,
                                   this.attributes,
                                   this.children.map((node: DescriptionNode) => node.render()))
    }

    mapElementCond(cond: (elem: DescriptionElement) => boolean,
                   f: (elem: DescriptionElement) => DescriptionNode[]): DescriptionNode[] {
        if (!cond(this)) {
            return [this];
        }
        return this.mapElement(f);
    }

    mapTextCond(cond: (elem: DescriptionElement) => boolean,
                f: (text: DescriptionText) => DescriptionNode[]): DescriptionNode[] {
        if (!cond(this)) {
            return [this];
        }
        return this.mapText(f);
    }

    mapElement(f: (elem: DescriptionElement) => DescriptionNode[]): DescriptionNode[] {
        return f(this).map(node => {
            if (node instanceof DescriptionElement) {
                let children: DescriptionNode[] = [];
                for (let node of this.children) {
                    children.push(...node.mapElement(f));
                }
                node.children = children;
            }
            return node;
        });
    }

    mapText(f: (text: DescriptionText) => DescriptionNode[]): DescriptionNode[] {
        let children: DescriptionNode[] = [];
        for (let node of this.children) {
            children.push(...node.mapText(f));
        }
        this.children = children;
        return [this];
    }
}

export class DescriptionText implements DescriptionNode {
    constructor(public text: string) {}

    render() {
        return this.text;
    }

    mapElementCond(cond: (elem: DescriptionElement) => boolean,
                   f: (text: DescriptionElement) => DescriptionNode[]): DescriptionNode[] {
        return this.mapElement(f);
    }

    mapTextCond(cond: (elem: DescriptionElement) => boolean,
                f: (text: DescriptionText) => DescriptionNode[]): DescriptionNode[] {
        return this.mapText(f);
    }

    mapElement(f: (elem: DescriptionElement) => DescriptionNode[]): DescriptionNode[] {
        return [this];
    }

    mapText(f: (text: DescriptionText) => DescriptionNode[]): DescriptionNode[] {
        return f(this);
    }
}
