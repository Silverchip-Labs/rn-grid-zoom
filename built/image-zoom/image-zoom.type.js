"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Props = /** @class */ (function () {
    function Props() {
        // height and width of operating area (phone screen)
        this.cropHeight = 100;
        this.cropWidth = 100;
        // height and width of actual image contents
        this.imageWidth = 100;
        this.imageHeight = 100;
        // enables moving picture
        this.panToMove = true;
        this.pinchToZoom = true;
        this.enableDoubleClickZoom = true;
        // maximum click displacement
        this.clickDistance = 10;
        // max sliding threshold
        this.maxOverflow = 100;
        // time to trigger a long press
        this.longPressTime = 800;
        // Max interval to trigger a double click
        this.doubleClickInterval = 175;
        this.style = {};
        // threshold for firing swipe down function
        this.swipeDownThreshold = 230;
        // for enabling vertical movement if user wants it
        this.enableSwipeDown = false;
        // for disabling focus on image center if user doesn't want it
        this.enableCenterFocus = true;
        // scale meaning zoom
        this.minScale = 0.6;
        this.maxScale = 10;
        this.onClick = function () { };
        this.onDoubleClick = function () { };
        this.onLongPress = function () { };
        this.horizontalOuterRangeOffset = function () { };
        this.onDragLeft = function () { };
        this.responderRelease = function () { };
        //  everytime the map is moved
        this.onMove = function () { };
        //  will be called when the onLayout event fires
        this.layoutChange = function () { };
        this.onSwipeDown = function () { };
    }
    return Props;
}());
exports.Props = Props;
var State = /** @class */ (function () {
    function State() {
        this.centerX = 0.5;
        this.centerY = 0.5;
    }
    return State;
}());
exports.State = State;
//# sourceMappingURL=image-zoom.type.js.map