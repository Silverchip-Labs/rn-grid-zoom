"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Props = /** @class */ (function () {
    function Props() {
        /**
         * 操作区域宽度
         */
        this.cropWidth = 100;
        /**
         * 操作区域高度
         */
        this.cropHeight = 100;
        /**
         * 图片宽度
         */
        this.imageWidth = 100;
        /**
         * 图片高度
         */
        this.imageHeight = 100;
        /**
         * 单手是否能移动图片
         */
        this.panToMove = true;
        /**
         * 多手指是否能缩放
         */
        this.pinchToZoom = true;
        /**
         * 双击能否放大
         */
        this.enableDoubleClickZoom = true;
        /**
         * 单击最大位移
         */
        this.clickDistance = 10;
        /**
         * 最大滑动阈值
         */
        this.maxOverflow = 100;
        /**
         * 长按的阈值（毫秒）
         */
        this.longPressTime = 800;
        /**
         * 双击计时器最大间隔
         */
        this.doubleClickInterval = 175;
        this.style = {};
        /**
         * threshold for firing swipe down function
         */
        this.swipeDownThreshold = 230;
        /**
         * for enabling vertical movement if user doesn't want it
         */
        this.enableSwipeDown = false;
        /**
         * for disabling focus on image center if user doesn't want it
         */
        this.enableCenterFocus = true;
        this.minScale = 0.6;
        this.maxScale = 10;
        this.initialScale = this.minScale || 0;
        this.onClick = function () {
            //
        };
        this.onDoubleClick = function () {
            //
        };
        this.onLongPress = function () {
            //
        };
        this.horizontalOuterRangeOffset = function () {
            //
        };
        this.onDragLeft = function () {
            //
        };
        this.responderRelease = function () {
            //
        };
        /**
         * If provided, this will be called everytime the map is moved
         */
        this.onMove = function () {
            //
        };
        /**
         * If provided, this method will be called when the onLayout event fires
         */
        this.layoutChange = function () {
            //
        };
        /**
         * function that fires when user swipes down
         */
        this.onSwipeDown = function () {
            //
        };
    }
    return Props;
}());
exports.Props = Props;
var State = /** @class */ (function () {
    function State() {
        /**
         * 中心 x 坐标
         */
        this.centerX = 0.5;
        /**
         * 中心 y 坐标
         */
        this.centerY = 0.5;
    }
    return State;
}());
exports.State = State;
//# sourceMappingURL=image-zoom.type.js.map