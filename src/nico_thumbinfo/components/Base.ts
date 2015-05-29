/// <reference path="../../../typings/bundle.d.ts" />
"use strict";

import {DataAttributeName} from "../../components/constants";

import {ThumbType} from "../models/constants";
import ErrorInfo from "../models/ErrorInfo";
import VideoKey from "../models/VideoKey";

import VideoData from "../stores/VideoData";
import VideoDataStore,
    {VideoDataStoreInterface, VideoDataOrganizerInterface}
    from "../stores/VideoDataStore";

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
        organizer?: VideoDataOrganizerInterface
    }
}

class Base extends React.Component<Base.Props, Base.State> {
    static defaultProps = <Base.Props> {
        videoKey: null,
        store: VideoDataStore
    };
    static propTypes = <React.ValidationMap<Base.Props>> {
        videoKey: React.PropTypes.instanceOf(VideoKey).isRequired,
        store: React.PropTypes.object.isRequired
    };

    state = <Base.State> {
        organizer: this.props.store.getVideoDataOrganizerByKey(this.props.videoKey)
    };

    private _onChange(key: VideoKey) {
        if (key.valueOf() !== this.props.videoKey.valueOf()) {
            return;
        }
        this.setState({organizer: this.props.store.getVideoDataOrganizerByKey(this.props.videoKey)});
    }

    componentDidMount() {
        this.props.store.addChangeListener(this._onChange.bind(this));
    }
    componentWillUnmount() {
        this.props.store.removeChangeListener(this._onChange.bind(this));
    }

    private _renderLoadingMessage(): React.ReactNode {
        const RD = React.DOM;
        return RD.div(null, "loading...");
    }

    private _renderVideoData(videoData: VideoData): React.ReactNode {
        const RD = React.DOM;

        let deleted = videoData.thumbType.map(type => {
            switch (type) {
            case ThumbType.Deleted:
            case ThumbType.DeletedByAdmin:
            case ThumbType.DeletedAsPrivate:
            case ThumbType.DeletedByUploader:
            case ThumbType.DeletedByContentHolder:
                return true;
            }
            return false;
        }).unwrapOr(false);

        return RD.div(
            {className: "video-data"},
            React.createElement(Thumbnail,
                                {url: videoData.thumbnailUrl,
                                 deleted: deleted}),
            React.createElement(HeaderList, {videoData: videoData}),
            React.createElement(Title, {title: videoData.title,
                                        watchUrl: videoData.watchUrl,
                                        id: videoData.key.id,
                                        nicopediaRegistered: videoData.nicopediaRegistered}),
            React.createElement(CounterList, {videoData: videoData}),
            React.createElement(TagList, {tags: videoData.tags}),
            React.createElement(Description, {description: videoData.description}),
            React.createElement(LastResBody, {value: videoData.lastResBody}));
    }

    private _renderErrorMessage(errors: ErrorInfo[]): React.ReactNode {
        const RD = React.DOM;
        return RD.div(null, "error",
                      errors.map(e => `${e.errorCode}: ${e.errorDetail}`));
    }

    render() {
        const RD = React.DOM;
        let organizer = this.state.organizer;
        let errors = organizer.getErrors();

        let videoData: React.ReactNode = null;
        let progressMessage: React.ReactNode = null;
        let errorMessage: React.ReactNode = null;

        let loading = false;
        if (errors.length === 0 && organizer.videoData.isEmpty) {
            loading = true;
        }

        if (loading) {
            progressMessage = this._renderLoadingMessage();
        } else {
            if (organizer.videoData.isEmpty) {
                errorMessage = this._renderErrorMessage(errors);
            } else {
                videoData = this._renderVideoData(organizer.videoData);
            }
        }

        return RD.div(
            {
                [DataAttributeName.PopupContent]: DataAttributeValue.PopupContent,
                className: "content"
            },
            videoData,
            progressMessage,
            errorMessage
        );
    }
}

export default Base;
