/// <reference path="../../../typings/common.d.ts" />
"use strict";

import {DataAttributeName} from "../../components/constants";

import VideoKey from "../models/VideoKey";

import VideoData from "../stores/VideoData";
import VideoDataStore, {VideoDataStoreInterface} from "../stores/VideoDataStore";

import {DataAttributeValue} from "./constants";
import Thumbnail from "./Thumbnail";
import Title from "./Title";
import CounterList from "./CounterList";
import HeaderList from "./HeaderList";
import TagList from "./TagList";
import Description from "./Description";
import LastResBody from "./LastResBody";

import * as React from "react";

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
            React.createElement(Thumbnail, {url: data.thumbnailUrl, deleted: false}), // TODO: Set appropriate value to deleted
            React.createElement(HeaderList, {videoData: data}),
            React.createElement(Title, {title: data.title,
                                        watchUrl: data.watchUrl,
                                        id: data.key.id,
                                        nicopediaRegistered: data.nicopediaRegistered}),
            React.createElement(CounterList, {videoData: data}),
            React.createElement(TagList, {tags: data.tags}),
            React.createElement(Description, {description: data.description}),
            React.createElement(LastResBody, {value: data.lastResBody})
        );
    }
}

export default Base;
