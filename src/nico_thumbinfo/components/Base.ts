/// <reference path="../../../typings/common.d.ts" />
"use strict";

import * as React from "react";

import {DataAttributeName} from "../../components/constants";

import VideoKey from "../stores/VideoKey";
import VideoData from "../stores/VideoData";
import VideoDataStore, {VideoDataStoreInterface} from "../stores/VideoDataStore";

import {DataAttributeValue} from "./constants";
import CounterList from "./CounterList";
import HeaderList from "./HeaderList";
import TagList from "./TagList";
import Description from "./Description";

module Base {
    export interface Props {
        videoKey: VideoKey
        store?: VideoDataStoreInterface
    }
    export interface State {
        videoData?: VideoData
    }
}

class Base extends React.Component<Base.Props, Base.State> {
    static defaultProps = <Base.Props> {
        videoKey: null,
        store: VideoDataStore
    };
    static propTypes = <React.ValidationMap<Base.Props>> {
        videoKey: React.PropTypes.instanceOf(VideoKey).isRequired,
        store: React.PropTypes.shape({
            addChangeListener: React.PropTypes.func.isRequired,
            removeChangeListener: React.PropTypes.func.isRequired,
            getVideoDataByKey: React.PropTypes.func.isRequired
        })
    };

    state = <Base.State> {
        videoData: this.props.store.getVideoDataByKey(this.props.videoKey)
    };

    private _onChange(key: VideoKey) {
        if (key.valueOf() !== this.props.videoKey.valueOf()) {
            return;
        }

        this.setState({videoData: this.props.store.getVideoDataByKey(this.props.videoKey)});
    }

    componentDidMount() {
        this.props.store.addChangeListener(this._onChange.bind(this));
    }
    componentWillUnmount() {
        this.props.store.removeChangeListener(this._onChange.bind(this));
    }

    render() {
        const RD = React.DOM;
        let data = this.state.videoData;

        if (data.isEmpty) {
            return RD.div(null);
        }

        return RD.div(
            {
                [DataAttributeName.PopupContent]: DataAttributeValue.PopupContent,
                className: "content"
            },
            RD.img({src: data.thumbnailUrl, className: "thumbnail"}),
            React.createElement(HeaderList, {videoData: data}),
            RD.h1({className: "title"}, RD.a({href: data.watchUrl}, data.title)),
            React.createElement(CounterList, {videoData: data}),
            React.createElement(TagList, {tags: data.tags}),
            React.createElement(Description, {description: data.description}),
            RD.div({className: "res"}, data.lastResBody)
        );
    }
}

function fillZero(n: number, width: number): string {
    let s = n.toString();
    for (let i = s.length; i < width; i++) {
        s = '0' + s;
    }
    return s;
}

function date2str(date: Date): string {
    let year = fillZero(date.getFullYear(), 4);
    let month = fillZero(date.getMonth() + 1, 2);
    let day = fillZero(date.getDate(), 2);
    let hour = fillZero(date.getHours(), 2);
    let min = fillZero(date.getMinutes(), 2);
    let sec = fillZero(date.getSeconds(), 2);
    return `${year}年${month}月${day}日 ${hour}:${min}:${sec}`
}

export default Base;
