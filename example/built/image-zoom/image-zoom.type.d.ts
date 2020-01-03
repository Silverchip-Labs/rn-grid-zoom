import { ViewStyle } from 'react-native';
export interface ICenterOn {
    x: number;
    y: number;
    scale: number;
    duration: number;
}
interface IOnMove {
    type: string;
    positionX: number;
    positionY: number;
    scale: number;
    zoomCurrentDistance: number;
}
export interface IOnClick {
    locationX: number;
    locationY: number;
    pageX: number;
    pageY: number;
}
export declare class Props {
    cropHeight: number;
    cropWidth: number;
    imageWidth: number;
    imageHeight: number;
    panToMove: boolean;
    pinchToZoom: boolean;
    enableDoubleClickZoom: boolean;
    clickDistance: number;
    maxOverflow: number;
    longPressTime: number;
    doubleClickInterval: number;
    /**
     * If provided this will cause the view to zoom and pan to the center point
     * Duration is optional and defaults to 300 ms.
     */
    centerOn?: ICenterOn;
    style: ViewStyle;
    swipeDownThreshold: number;
    enableSwipeDown: boolean;
    enableCenterFocus: boolean;
    minScale: number;
    maxScale: number;
    onClick: (eventParams: IOnClick) => void;
    onDoubleClick: () => void;
    onLongPress: () => void;
    horizontalOuterRangeOffset: (offsetX?: number) => void;
    onDragLeft: () => void;
    responderRelease: (vx?: number, scale?: number) => void;
    onMove: (position?: IOnMove) => void;
    layoutChange: (event?: object) => void;
    onSwipeDown?: () => void;
}
export declare class State {
    centerX: number;
    centerY: number;
}
export {};
