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
    /**
     * 操作区域宽度
     */
    cropWidth: number;
    /**
     * 操作区域高度
     */
    cropHeight: number;
    /**
     * 图片宽度
     */
    imageWidth: number;
    /**
     * 图片高度
     */
    imageHeight: number;
    /**
     * 单手是否能移动图片
     */
    panToMove?: boolean;
    /**
     * 多手指是否能缩放
     */
    pinchToZoom?: boolean;
    /**
     * 双击能否放大
     */
    enableDoubleClickZoom?: boolean;
    /**
     * 单击最大位移
     */
    clickDistance?: number;
    /**
     * 最大滑动阈值
     */
    maxOverflow?: number;
    /**
     * 长按的阈值（毫秒）
     */
    longPressTime?: number;
    /**
     * 双击计时器最大间隔
     */
    doubleClickInterval?: number;
    /**
     * If provided this will cause the view to zoom and pan to the center point
     * Duration is optional and defaults to 300 ms.
     */
    centerOn?: ICenterOn;
    style?: ViewStyle;
    /**
     * threshold for firing swipe down function
     */
    swipeDownThreshold?: number;
    /**
     * for enabling vertical movement if user doesn't want it
     */
    enableSwipeDown?: boolean;
    /**
     * for disabling focus on image center if user doesn't want it
     */
    enableCenterFocus?: boolean;
    minScale?: number;
    maxScale?: number;
    initialScale: number;
    onClick?: (eventParams: IOnClick) => void;
    onDoubleClick?: () => void;
    onLongPress?: () => void;
    horizontalOuterRangeOffset?: (offsetX?: number) => void;
    onDragLeft?: () => void;
    responderRelease?: (vx?: number, scale?: number) => void;
    /**
     * If provided, this will be called everytime the map is moved
     */
    onMove?: (position?: IOnMove) => void;
    /**
     * If provided, this method will be called when the onLayout event fires
     */
    layoutChange?: (event?: object) => void;
    /**
     * function that fires when user swipes down
     */
    onSwipeDown?: () => void;
}
export declare class State {
    /**
     * 中心 x 坐标
     */
    centerX?: number;
    /**
     * 中心 y 坐标
     */
    centerY?: number;
}
export {};
