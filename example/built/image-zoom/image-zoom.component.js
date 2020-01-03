"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var react_native_1 = require("react-native");
var image_zoom_style_1 = require("./image-zoom.style");
var image_zoom_type_1 = require("./image-zoom.type");
var ImageViewer = /** @class */ (function (_super) {
    __extends(ImageViewer, _super);
    function ImageViewer() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.state = new image_zoom_type_1.State();
        _this.delay = 10;
        _this.lastMoved = Date.now();
        _this.lastPositionX = null;
        _this.positionX = 0;
        _this.animatedPositionX = new react_native_1.Animated.Value(0);
        _this.lastValidPositionX = 0;
        _this.lastPositionY = null;
        _this.positionY = 0;
        _this.animatedPositionY = new react_native_1.Animated.Value(0);
        _this.lastValidPositionY = 0;
        _this.scale = _this.props.minScale;
        _this.animatedScale = new react_native_1.Animated.Value(1);
        _this.zoomLastDistance = null;
        _this.zoomCurrentDistance = 0;
        // During the sliding process, the overall lateral transboundary offset
        _this.horizontalWholeOuterCounter = 0;
        // offset during sliding
        _this.swipeDownOffset = 0;
        // Total displacement of x y during sliding
        _this.horizontalWholeCounter = 0;
        _this.verticalWholeCounter = 0;
        _this.isLongPress = false;
        _this.lastClickTime = 0;
        _this.isDoubleClick = false;
        _this.doubleClickX = 0;
        _this.doubleClickY = 0;
        _this.midpointX = 0;
        _this.midpointY = 0;
        // Keeps max number of contact point in 1 gesture
        _this.maxContactPoints = 0;
        _this.isInitialPinch = true;
        _this._handlePanResponderGrant = function (evt) {
            var _a = _this.props, onLongPress = _a.onLongPress, longPressTime = _a.longPressTime, doubleClickInterval = _a.doubleClickInterval, onDoubleClick = _a.onDoubleClick;
            _this.lastPositionX = null;
            _this.lastPositionY = null;
            _this.zoomLastDistance = null;
            _this.horizontalWholeCounter = 0;
            _this.verticalWholeCounter = 0;
            _this.isDoubleClick = false;
            _this.isLongPress = false;
            // Clear any click timer when any gesture starts
            if (_this.singleClickTimeout) {
                clearTimeout(_this.singleClickTimeout);
            }
            if (_this.longPressTimeout) {
                clearTimeout(_this.longPressTimeout);
            }
            _this.longPressTimeout = setTimeout(function () {
                _this.isLongPress = true;
                if (onLongPress) {
                    onLongPress();
                }
            }, longPressTime);
            var isSingleFingerPress = evt.nativeEvent.changedTouches.length <= 1;
            if (isSingleFingerPress) {
                var isDoubleTap = new Date().getTime() - _this.lastClickTime < (doubleClickInterval || 0);
                if (isDoubleTap) {
                    _this.lastClickTime = 0;
                    if (onDoubleClick) {
                        onDoubleClick();
                    }
                    // cancel long press
                    clearTimeout(_this.longPressTimeout);
                    // Because zoom may be triggered, the coordinate position when double-clicking is recorded
                    _this.doubleClickX = evt.nativeEvent.changedTouches[0].pageX;
                    _this.doubleClickY = evt.nativeEvent.changedTouches[0].pageY;
                    // zoom
                    _this.isDoubleClick = true;
                    if (_this.props.enableDoubleClickZoom) {
                        if (_this.scale !== 1) {
                            // Return to place
                            _this.scale = 1;
                            _this.positionX = 0;
                            _this.positionY = 0;
                        }
                        else {
                            // Start zooming at displacement
                            // Scale before recording
                            var beforeScale = _this.scale;
                            // Start zooming
                            _this.scale = 2;
                            // zoom diff
                            var diffScale = _this.scale - beforeScale;
                            // Find the displacement of the center point of the two hands from the center of the page
                            // moving position
                            _this.positionX = ((_this.props.cropWidth / 2 - _this.doubleClickX) * diffScale) / _this.scale;
                            _this.positionY = ((_this.props.cropHeight / 2 - _this.doubleClickY) * diffScale) / _this.scale;
                        }
                        react_native_1.Animated.parallel([
                            react_native_1.Animated.timing(_this.animatedScale, {
                                toValue: _this.scale,
                                duration: 100
                            }),
                            react_native_1.Animated.timing(_this.animatedPositionX, {
                                toValue: _this.positionX,
                                duration: 100
                            }),
                            react_native_1.Animated.timing(_this.animatedPositionY, {
                                toValue: _this.positionY,
                                duration: 100
                            })
                        ]).start(function () { return _this._handleMove('centerOn'); });
                    }
                }
                else {
                    _this.lastClickTime = new Date().getTime();
                }
            }
        };
        _this._handlePanResponderMove = function (evt, gestureState) {
            // throttle the requests to every 10ms
            var time = Date.now();
            var delta = time - _this.lastMoved;
            if (delta < _this.delay) {
                return;
            }
            _this.lastMoved = time;
            var contactPointsCount = evt.nativeEvent.touches.length;
            if (contactPointsCount > _this.maxContactPoints) {
                _this.maxContactPoints = contactPointsCount;
            }
            if (_this.isDoubleClick) {
                // Sometimes double-clicking is treated as a displacement, which is blocked here
                return;
            }
            if (evt.nativeEvent.changedTouches.length <= 1) {
                // x displacement
                var diffX = gestureState.dx - (_this.lastPositionX || 0);
                if (_this.lastPositionX === null) {
                    diffX = 0;
                }
                // y displacement
                var diffY = gestureState.dy - (_this.lastPositionY || 0);
                if (_this.lastPositionY === null) {
                    diffY = 0;
                }
                _this.lastPositionX = gestureState.dx;
                _this.lastPositionY = gestureState.dy;
                _this.horizontalWholeCounter += diffX;
                _this.verticalWholeCounter += diffY;
                if (Math.abs(_this.horizontalWholeCounter) > 5 || Math.abs(_this.verticalWholeCounter) > 5) {
                    // If the displacement is beyond the range of your finger, cancel the long press monitor
                    clearTimeout(_this.longPressTimeout);
                }
                if (_this.props.panToMove) {
                    // Handle swipes left and right if swipeDown is in progress
                    if (_this.swipeDownOffset === 0) {
                        // diffX > 0 means the hand slides to the right, the picture moves to the left, and vice versa
                        // horizontalWholeOuterCounter > 0 The overflow is on the left, and vice versa on the right. The larger the absolute value, the more overflow
                        if (_this.props.imageWidth * _this.scale > _this.props.cropWidth) {
                            // If the image width is larger than the box width, you can drag horizontally
                            // There is no overflow offset or this offset completely retracts the offset before dragging
                            if (_this.horizontalWholeOuterCounter > 0) {
                                // overflow on the right
                                if (diffX < 0) {
                                    // tighten from right
                                    if (_this.horizontalWholeOuterCounter > Math.abs(diffX)) {
                                        // Offset has not been used up
                                        _this.horizontalWholeOuterCounter += diffX;
                                        diffX = 0;
                                    }
                                    else {
                                        // The overflow is set to 0, the offset is subtracted from the remaining overflow, and it can be dragged
                                        diffX += _this.horizontalWholeOuterCounter;
                                        _this.horizontalWholeOuterCounter = 0;
                                        if (_this.props.horizontalOuterRangeOffset) {
                                            _this.props.horizontalOuterRangeOffset(0);
                                        }
                                    }
                                }
                                else {
                                    // amplify to right
                                    _this.horizontalWholeOuterCounter += diffX;
                                }
                            }
                            else if (_this.horizontalWholeOuterCounter < 0) {
                                // overflow on the left
                                if (diffX > 0) {
                                    // Tighten from the left
                                    if (Math.abs(_this.horizontalWholeOuterCounter) > diffX) {
                                        // Offset has not been used up
                                        _this.horizontalWholeOuterCounter += diffX;
                                        diffX = 0;
                                    }
                                    else {
                                        // The overflow is set to 0, the offset is subtracted from the remaining overflow, and it can be dragged
                                        diffX += _this.horizontalWholeOuterCounter;
                                        _this.horizontalWholeOuterCounter = 0;
                                        if (_this.props.horizontalOuterRangeOffset) {
                                            _this.props.horizontalOuterRangeOffset(0);
                                        }
                                    }
                                }
                                else {
                                    // Amplify to the left
                                    _this.horizontalWholeOuterCounter += diffX;
                                }
                            }
                            else {
                                // Overflow offset is 0, move normally
                            }
                            // Produce displacement
                            _this.positionX += diffX / _this.scale;
                            _this.animatedPositionX.setValue(_this.positionX);
                        }
                        else {
                            // Can't drag horizontally, all count as overflow offset
                            _this.horizontalWholeOuterCounter += diffX;
                        }
                        // The overflow will not exceed the set limit
                        if (_this.horizontalWholeOuterCounter > (_this.props.maxOverflow || 0)) {
                            _this.horizontalWholeOuterCounter = _this.props.maxOverflow || 0;
                        }
                        else if (_this.horizontalWholeOuterCounter < -(_this.props.maxOverflow || 0)) {
                            _this.horizontalWholeOuterCounter = -(_this.props.maxOverflow || 0);
                        }
                        if (_this.horizontalWholeOuterCounter !== 0) {
                            if (_this.props.horizontalOuterRangeOffset) {
                                _this.props.horizontalOuterRangeOffset(_this.horizontalWholeOuterCounter);
                            }
                        }
                    }
                    var canDragVertically = _this.props.imageHeight * _this.scale > _this.props.cropHeight;
                    if (canDragVertically) {
                        _this.positionY += diffY / _this.scale;
                        _this.animatedPositionY.setValue(_this.positionY);
                    }
                }
            }
            else {
                // multiple fingers
                if (_this.longPressTimeout) {
                    // cancel long press
                    clearTimeout(_this.longPressTimeout);
                }
                if (_this.props.pinchToZoom) {
                    var finger1Touch = evt.nativeEvent.changedTouches[0];
                    var finger2Touch = evt.nativeEvent.changedTouches[1];
                    var minX = void 0;
                    var maxX = void 0;
                    if (finger1Touch.locationX > finger2Touch.locationX) {
                        minX = finger2Touch.pageX;
                        maxX = finger1Touch.pageX;
                    }
                    else {
                        minX = finger1Touch.pageX;
                        maxX = finger2Touch.pageX;
                    }
                    var minY = void 0;
                    var maxY = void 0;
                    if (finger1Touch.locationY > finger2Touch.locationY) {
                        minY = finger2Touch.pageY;
                        maxY = finger1Touch.pageY;
                    }
                    else {
                        minY = finger1Touch.pageY;
                        maxY = finger2Touch.pageY;
                    }
                    var widthDistance = maxX - minX;
                    var heightDistance = maxY - minY;
                    var mapCentreX = _this.props.imageWidth / 2 - _this.positionX; // This is image coords
                    var mapCentreY = _this.props.imageHeight / 2 - _this.positionY; // This is image coords
                    var diagonalDistance = Math.sqrt(widthDistance * widthDistance + heightDistance * heightDistance);
                    _this.zoomCurrentDistance = Number(diagonalDistance.toFixed(1));
                    // if it is the initial pinch or zooming out
                    if (_this.isInitialPinch || _this.zoomCurrentDistance < (_this.zoomLastDistance || 0)) {
                        _this.midpointX = (finger1Touch.locationX + finger2Touch.locationX) / 2;
                        _this.midpointY = (finger1Touch.locationY + finger2Touch.locationY) / 2;
                    }
                    if (_this.zoomLastDistance !== null) {
                        var distanceScale = _this.zoomCurrentDistance / _this.zoomLastDistance;
                        // -- Zooming
                        var zoom = _this.scale * distanceScale;
                        // begin zoom
                        _this.scale = zoom;
                        _this.animatedScale.setValue(_this.scale);
                        // -- Panning
                        var offsetX = _this.midpointX - mapCentreX;
                        var offsetY = _this.midpointY - mapCentreY;
                        var scaleOffsetX = offsetX * distanceScale;
                        var scaleOffsetY = offsetY * distanceScale;
                        var scaleOffsetXDifference = scaleOffsetX - offsetX;
                        var scaleOffsetYDifference = scaleOffsetY - offsetY;
                        // slow down the panning when the zoom scale gets large so it doesn't go crazy
                        if (_this.scale > 3.5) {
                            scaleOffsetXDifference /= _this.scale;
                            scaleOffsetYDifference /= _this.scale;
                        }
                        _this.positionX -= scaleOffsetXDifference;
                        _this.positionY -= scaleOffsetYDifference;
                        _this.animatedPositionX.setValue(_this.positionX);
                        _this.animatedPositionY.setValue(_this.positionY);
                    }
                    if (_this.scale >= _this.props.minScale && _this.scale <= _this.props.maxScale) {
                        _this.lastValidPositionX = _this.positionX;
                        _this.lastValidPositionY = _this.positionY;
                    }
                    _this.isInitialPinch = false;
                    _this.zoomLastDistance = _this.zoomCurrentDistance;
                }
            }
            _this._handleMove('onPanResponderMove');
        };
        _this._handlePanResponderRelease = function (evt, gestureState) {
            _this.isInitialPinch = true;
            if (_this.longPressTimeout) {
                // cancel longpress
                clearTimeout(_this.longPressTimeout);
            }
            if (_this.isDoubleClick || _this.isLongPress) {
                return;
            }
            // If it is a single finger, the distance from the last press is greater than the preset second,
            // and the sliding distance is less than the preset value, it may be a single click (if there is no start gesture in the subsequent double-click interval)
            var moveDistance = Math.sqrt(gestureState.dx * gestureState.dx + gestureState.dy * gestureState.dy);
            var _a = evt.nativeEvent, locationX = _a.locationX, locationY = _a.locationY, pageX = _a.pageX, pageY = _a.pageY;
            var isSingleFingerClick = _this.maxContactPoints <= 1;
            if (isSingleFingerClick && moveDistance < (_this.props.clickDistance || 0)) {
                _this.singleClickTimeout = setTimeout(function () {
                    if (_this.props.onClick) {
                        _this.props.onClick({ locationX: locationX, locationY: locationY, pageX: pageX, pageY: pageY });
                    }
                }, _this.props.doubleClickInterval);
            }
            else {
                // End with multiple gestures, or end with swipe
                if (_this.props.responderRelease) {
                    _this.props.responderRelease(gestureState.vx, _this.scale);
                }
                _this._resolvePanResponderRelease();
            }
            _this.maxContactPoints = 0;
        };
        _this._resolvePanResponderRelease = function () {
            if (_this.scale < _this.props.minScale) {
                // If the current scale is zoomed out too much, bounce back to the minScale
                _this.scale = _this.props.minScale;
                _this.animatedScale.setValue(_this.scale);
                _this.positionX = _this.lastValidPositionX;
                _this.animatedPositionX.setValue(_this.positionX);
                _this.positionY = _this.lastValidPositionY;
                _this.animatedPositionY.setValue(_this.positionY);
            }
            else if (_this.scale > _this.props.maxScale) {
                // If the current scale is zoomed in too much, bounce back to the maxScale
                _this.scale = _this.props.maxScale;
                _this.animatedScale.setValue(_this.scale);
                _this.positionX = _this.lastValidPositionX;
                _this.animatedPositionX.setValue(_this.positionX);
                _this.positionY = _this.lastValidPositionY;
                _this.animatedPositionY.setValue(_this.positionY);
            }
            if (_this.props.imageWidth * _this.scale <= _this.props.cropWidth) {
                // If the picture width is smaller than the box width, the horizontal position is reset
                _this.positionX = 0;
                _this.animatedPositionX.setValue(_this.positionX);
            }
            if (_this.props.imageHeight * _this.scale <= _this.props.cropHeight) {
                // If the picture height is less than the box height, the portrait position is reset
                _this.positionY = 0;
                _this.animatedPositionY.setValue(_this.positionY);
            }
            // The horizontal direction will definitely not be out of range, controlled by dragging
            // If the height of the picture is greater than the height of the box, no black borders can appear in the vertical direction
            if (_this.props.imageHeight * _this.scale > _this.props.cropHeight) {
                // Absolute value of vertical tolerance
                var verticalMax = (_this.props.imageHeight * _this.scale - _this.props.cropHeight) / 2 / _this.scale;
                if (_this.positionY < -verticalMax) {
                    _this.positionY = -verticalMax;
                }
                else if (_this.positionY > verticalMax) {
                    _this.positionY = verticalMax;
                }
                _this.animatedPositionY.setValue(_this.positionY);
            }
            if (_this.props.imageWidth * _this.scale > _this.props.cropWidth) {
                // Absolute value of vertical tolerance
                var horizontalMax = (_this.props.imageWidth * _this.scale - _this.props.cropWidth) / 2 / _this.scale;
                if (_this.positionX < -horizontalMax) {
                    _this.positionX = -horizontalMax;
                }
                else if (_this.positionX > horizontalMax) {
                    _this.positionX = horizontalMax;
                }
                _this.animatedPositionX.setValue(_this.positionX);
            }
            _this.horizontalWholeOuterCounter = 0;
            _this.swipeDownOffset = 0;
            _this._handleMove('onPanResponderRelease');
        };
        // initialising panresponder in constructor to prevent usage of componentwillmount
        _this.imagePanResponder = react_native_1.PanResponder.create({
            onStartShouldSetPanResponder: function () { return true; },
            onPanResponderTerminationRequest: function () { return false; },
            onPanResponderGrant: _this._handlePanResponderGrant,
            onPanResponderMove: _this._handlePanResponderMove,
            onPanResponderRelease: _this._handlePanResponderRelease,
            onPanResponderTerminate: function () { }
        });
        return _this;
    }
    ImageViewer.prototype.render = function () {
        var animateConf = {
            transform: [
                {
                    scale: this.animatedScale
                },
                {
                    translateX: this.animatedPositionX
                },
                {
                    translateY: this.animatedPositionY
                }
            ]
        };
        var parentStyles = react_native_1.StyleSheet.flatten(this.props.style);
        return (<react_native_1.View style={__assign({}, image_zoom_style_1.default.container, parentStyles, { width: this.props.cropWidth, height: this.props.cropHeight })} {...this.imagePanResponder.panHandlers}>
        <react_native_1.Animated.View style={animateConf} renderToHardwareTextureAndroid>
          <react_native_1.View onLayout={this.handleLayout.bind(this)} style={{
            width: this.props.imageWidth,
            height: this.props.imageHeight
        }}>
            {this.props.children}
          </react_native_1.View>
        </react_native_1.Animated.View>
      </react_native_1.View>);
    };
    ImageViewer.prototype.componentDidMount = function () {
        this.centerOn({
            x: 0,
            y: 0,
            scale: this.scale,
            duration: 1
        });
    };
    ImageViewer.prototype.handleLayout = function (event) {
        var layoutChange = this.props.layoutChange;
        if (layoutChange) {
            layoutChange(event);
        }
    };
    ImageViewer.prototype.centerOn = function (params) {
        var _this = this;
        this.positionX = params.x;
        this.positionY = params.y;
        this.scale = params.scale;
        var duration = params.duration || 100;
        react_native_1.Animated.parallel([
            react_native_1.Animated.timing(this.animatedScale, {
                toValue: this.scale,
                duration: duration
            }),
            react_native_1.Animated.timing(this.animatedPositionX, {
                toValue: this.positionX,
                duration: duration
            }),
            react_native_1.Animated.timing(this.animatedPositionY, {
                toValue: this.positionY,
                duration: duration
            })
        ]).start(function () {
            _this._handleMove('centerOn');
        });
    };
    ImageViewer.prototype._handleMove = function (type) {
        if (this.props.onMove) {
            this.props.onMove({
                type: type,
                positionX: this.positionX,
                positionY: this.positionY,
                scale: this.scale,
                zoomCurrentDistance: this.zoomCurrentDistance
            });
        }
    };
    ImageViewer.defaultProps = new image_zoom_type_1.Props();
    return ImageViewer;
}(React.Component));
exports.default = ImageViewer;
//# sourceMappingURL=image-zoom.component.js.map