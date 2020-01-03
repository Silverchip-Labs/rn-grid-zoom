import * as React from 'react';
import { LayoutChangeEvent } from 'react-native';
import { ICenterOn, Props, State } from './image-zoom.type';
export default class ImageViewer extends React.Component<Props, State> {
    static defaultProps: Props;
    state: State;
    private delay;
    private lastMoved;
    private lastPositionX;
    private positionX;
    private animatedPositionX;
    private lastPositionY;
    private positionY;
    private animatedPositionY;
    private scale;
    private animatedScale;
    private zoomLastDistance;
    private zoomCurrentDistance;
    private horizontalWholeOuterCounter;
    private swipeDownOffset;
    private horizontalWholeCounter;
    private verticalWholeCounter;
    private singleClickTimeout;
    private longPressTimeout;
    private lastClickTime;
    private doubleClickX;
    private doubleClickY;
    private isDoubleClick;
    private isLongPress;
    private midpointX;
    private midpointY;
    private lastValidPositionX;
    private lastValidPositionY;
    private maxContactPoints;
    private isInitialPinch;
    render(): JSX.Element;
    componentDidMount(): void;
    handleLayout(event: LayoutChangeEvent): void;
    centerOn(params: ICenterOn): void;
    private _handleMove;
    private _handlePanResponderGrant;
    private _handlePanResponderMove;
    private _handlePanResponderRelease;
    private _resolvePanResponderRelease;
    private imagePanResponder;
}
