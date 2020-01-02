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
        // 上次/当前/动画 x 位移
        _this.lastPositionX = null;
        _this.positionX = 0;
        _this.animatedPositionX = new react_native_1.Animated.Value(0);
        // 上次/当前/动画 y 位移
        _this.lastPositionY = null;
        _this.positionY = 0;
        _this.animatedPositionY = new react_native_1.Animated.Value(0);
        // 缩放大小
        _this.scale = 1;
        _this.animatedScale = new react_native_1.Animated.Value(1);
        _this.zoomLastDistance = null;
        _this.zoomCurrentDistance = 0;
        // 图片手势处理
        _this.imagePanResponder = null;
        // 滑动过程中，整体横向过界偏移量
        _this.horizontalWholeOuterCounter = 0;
        // 滑动过程中，swipeDown 偏移量
        _this.swipeDownOffset = 0;
        // 滑动过程中，x y的总位移
        _this.horizontalWholeCounter = 0;
        _this.verticalWholeCounter = 0;
        // 上一次点击的时间
        _this.lastClickTime = 0;
        // 双击时的位置
        _this.doubleClickX = 0;
        _this.doubleClickY = 0;
        // 是否双击了
        _this.isDoubleClick = false;
        // 是否是长按
        _this.isLongPress = false;
        _this.midpointX = 0;
        _this.midpointY = 0;
        _this.lastValidPositionX = 0;
        _this.lastValidPositionY = 0;
        // Keeps max number of contact point in 1 gesture
        _this.maxContactPoints = 0;
        _this.isInitialPinch = true;
        _this.resetScale = function () {
            _this.positionX = 0;
            _this.positionY = 0;
            _this.scale = 1;
            _this.animatedScale.setValue(1);
        };
        _this.panResponderReleaseResolve = function () {
            // 判断是否是 swipeDown
            if (_this.props.enableSwipeDown && _this.props.swipeDownThreshold) {
                if (_this.swipeDownOffset > _this.props.swipeDownThreshold) {
                    if (_this.props.onSwipeDown) {
                        _this.props.onSwipeDown();
                    }
                    // Stop reset.
                    return;
                }
            }
            if (_this.scale < (_this.props.minScale || 0)) {
                // If the current scale is zoomed out too much, bounce back to the minScale
                _this.scale = _this.props.minScale || 0;
                _this.animatedScale.setValue(_this.scale);
                _this.positionX = _this.lastValidPositionX;
                _this.animatedPositionX.setValue(_this.positionX);
                _this.positionY = _this.lastValidPositionY;
                _this.animatedPositionY.setValue(_this.positionY);
            }
            else if (_this.scale > (_this.props.maxScale || 0)) {
                // If the current scale is zoomed in too much, bounce back to the maxScale
                _this.scale = _this.props.maxScale || 0;
                _this.animatedScale.setValue(_this.scale);
                _this.positionX = _this.lastValidPositionX;
                _this.animatedPositionX.setValue(_this.positionX);
                _this.positionY = _this.lastValidPositionY;
                _this.animatedPositionY.setValue(_this.positionY);
            }
            if (_this.props.imageWidth * _this.scale <= _this.props.cropWidth) {
                // 如果图片宽度小于盒子宽度，横向位置重置
                _this.positionX = 0;
                _this.animatedPositionX.setValue(_this.positionX);
            }
            if (_this.props.imageHeight * _this.scale <= _this.props.cropHeight) {
                // 如果图片高度小于盒子高度，纵向位置重置
                _this.positionY = 0;
                _this.animatedPositionY.setValue(_this.positionY);
            }
            // 横向肯定不会超出范围，由拖拽时控制
            // 如果图片高度大于盒子高度，纵向不能出现黑边
            if (_this.props.imageHeight * _this.scale > _this.props.cropHeight) {
                // 纵向能容忍的绝对值
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
                // 纵向能容忍的绝对值
                var horizontalMax = (_this.props.imageWidth * _this.scale - _this.props.cropWidth) / 2 / _this.scale;
                if (_this.positionX < -horizontalMax) {
                    _this.positionX = -horizontalMax;
                }
                else if (_this.positionX > horizontalMax) {
                    _this.positionX = horizontalMax;
                }
                _this.animatedPositionX.setValue(_this.positionX);
            }
            // 水平溢出量置空
            _this.horizontalWholeOuterCounter = 0;
            // swipeDown 溢出量置空
            _this.swipeDownOffset = 0;
            _this.imageDidMove('onPanResponderRelease');
        };
        return _this;
    }
    ImageViewer.prototype.componentWillMount = function () {
        var _this = this;
        this.imagePanResponder = react_native_1.PanResponder.create({
            // 要求成为响应者：
            onStartShouldSetPanResponder: function () { return true; },
            onPanResponderTerminationRequest: function () { return false; },
            onPanResponderGrant: function (evt) {
                // 开始手势操作
                _this.lastPositionX = null;
                _this.lastPositionY = null;
                _this.zoomLastDistance = null;
                _this.horizontalWholeCounter = 0;
                _this.verticalWholeCounter = 0;
                _this.isDoubleClick = false;
                _this.isLongPress = false;
                // 任何手势开始，都清空单击计时器
                if (_this.singleClickTimeout) {
                    clearTimeout(_this.singleClickTimeout);
                }
                // 计算长按
                if (_this.longPressTimeout) {
                    clearTimeout(_this.longPressTimeout);
                }
                _this.longPressTimeout = setTimeout(function () {
                    _this.isLongPress = true;
                    if (_this.props.onLongPress) {
                        _this.props.onLongPress();
                    }
                }, _this.props.longPressTime);
                if (evt.nativeEvent.changedTouches.length <= 1) {
                    // 一个手指的情况
                    if (new Date().getTime() - _this.lastClickTime < (_this.props.doubleClickInterval || 0)) {
                        // 认为触发了双击
                        _this.lastClickTime = 0;
                        if (_this.props.onDoubleClick) {
                            _this.props.onDoubleClick();
                        }
                        // 取消长按
                        clearTimeout(_this.longPressTimeout);
                        // 因为可能触发放大，因此记录双击时的坐标位置
                        _this.doubleClickX = evt.nativeEvent.changedTouches[0].pageX;
                        _this.doubleClickY = evt.nativeEvent.changedTouches[0].pageY;
                        // 缩放
                        _this.isDoubleClick = true;
                        if (_this.props.enableDoubleClickZoom) {
                            if (_this.scale > 1 || _this.scale < 1) {
                                // 回归原位
                                _this.scale = 1;
                                _this.positionX = 0;
                                _this.positionY = 0;
                            }
                            else {
                                // 开始在位移地点缩放
                                // 记录之前缩放比例
                                // 此时 this.scale 一定为 1
                                var beforeScale = _this.scale;
                                // 开始缩放
                                _this.scale = 2;
                                // 缩放 diff
                                var diffScale = _this.scale - beforeScale;
                                // 找到两手中心点距离页面中心的位移
                                // 移动位置
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
                            ]).start(function () { return _this.imageDidMove('centerOn'); });
                        }
                    }
                    else {
                        _this.lastClickTime = new Date().getTime();
                    }
                }
            },
            onPanResponderMove: function (evt, gestureState) {
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
                    // 有时双击会被当做位移，这里屏蔽掉
                    return;
                }
                if (evt.nativeEvent.changedTouches.length <= 1) {
                    // x 位移
                    var diffX = gestureState.dx - (_this.lastPositionX || 0);
                    if (_this.lastPositionX === null) {
                        diffX = 0;
                    }
                    // y 位移
                    var diffY = gestureState.dy - (_this.lastPositionY || 0);
                    if (_this.lastPositionY === null) {
                        diffY = 0;
                    }
                    // 保留这一次位移作为下次的上一次位移
                    _this.lastPositionX = gestureState.dx;
                    _this.lastPositionY = gestureState.dy;
                    _this.horizontalWholeCounter += diffX;
                    _this.verticalWholeCounter += diffY;
                    if (Math.abs(_this.horizontalWholeCounter) > 5 || Math.abs(_this.verticalWholeCounter) > 5) {
                        // 如果位移超出手指范围，取消长按监听
                        clearTimeout(_this.longPressTimeout);
                    }
                    if (_this.props.panToMove) {
                        // 处理左右滑，如果正在 swipeDown，左右滑失效
                        if (_this.swipeDownOffset === 0) {
                            // diffX > 0 表示手往右滑，图往左移动，反之同理
                            // horizontalWholeOuterCounter > 0 表示溢出在左侧，反之在右侧，绝对值越大溢出越多
                            if (_this.props.imageWidth * _this.scale > _this.props.cropWidth) {
                                // 如果图片宽度大图盒子宽度， 可以横向拖拽
                                // 没有溢出偏移量或者这次位移完全收回了偏移量才能拖拽
                                if (_this.horizontalWholeOuterCounter > 0) {
                                    // 溢出在右侧
                                    if (diffX < 0) {
                                        // 从右侧收紧
                                        if (_this.horizontalWholeOuterCounter > Math.abs(diffX)) {
                                            // 偏移量还没有用完
                                            _this.horizontalWholeOuterCounter += diffX;
                                            diffX = 0;
                                        }
                                        else {
                                            // 溢出量置为0，偏移量减去剩余溢出量，并且可以被拖动
                                            diffX += _this.horizontalWholeOuterCounter;
                                            _this.horizontalWholeOuterCounter = 0;
                                            if (_this.props.horizontalOuterRangeOffset) {
                                                _this.props.horizontalOuterRangeOffset(0);
                                            }
                                        }
                                    }
                                    else {
                                        // 向右侧扩增
                                        _this.horizontalWholeOuterCounter += diffX;
                                    }
                                }
                                else if (_this.horizontalWholeOuterCounter < 0) {
                                    // 溢出在左侧
                                    if (diffX > 0) {
                                        // 从左侧收紧
                                        if (Math.abs(_this.horizontalWholeOuterCounter) > diffX) {
                                            // 偏移量还没有用完
                                            _this.horizontalWholeOuterCounter += diffX;
                                            diffX = 0;
                                        }
                                        else {
                                            // 溢出量置为0，偏移量减去剩余溢出量，并且可以被拖动
                                            diffX += _this.horizontalWholeOuterCounter;
                                            _this.horizontalWholeOuterCounter = 0;
                                            if (_this.props.horizontalOuterRangeOffset) {
                                                _this.props.horizontalOuterRangeOffset(0);
                                            }
                                        }
                                    }
                                    else {
                                        // 向左侧扩增
                                        _this.horizontalWholeOuterCounter += diffX;
                                    }
                                }
                                else {
                                    // 溢出偏移量为0，正常移动
                                }
                                // 产生位移
                                _this.positionX += diffX / _this.scale;
                                _this.animatedPositionX.setValue(_this.positionX);
                            }
                            else {
                                // 不能横向拖拽，全部算做溢出偏移量
                                _this.horizontalWholeOuterCounter += diffX;
                            }
                            // 溢出量不会超过设定界限
                            if (_this.horizontalWholeOuterCounter > (_this.props.maxOverflow || 0)) {
                                _this.horizontalWholeOuterCounter = _this.props.maxOverflow || 0;
                            }
                            else if (_this.horizontalWholeOuterCounter < -(_this.props.maxOverflow || 0)) {
                                _this.horizontalWholeOuterCounter = -(_this.props.maxOverflow || 0);
                            }
                            if (_this.horizontalWholeOuterCounter !== 0) {
                                // 如果溢出偏移量不是0，执行溢出回调
                                if (_this.props.horizontalOuterRangeOffset) {
                                    _this.props.horizontalOuterRangeOffset(_this.horizontalWholeOuterCounter);
                                }
                            }
                        }
                        // 如果图片高度大于盒子高度， 可以纵向弹性拖拽
                        if (_this.props.imageHeight * _this.scale > _this.props.cropHeight) {
                            _this.positionY += diffY / _this.scale;
                            _this.animatedPositionY.setValue(_this.positionY);
                        }
                    }
                }
                else {
                    // 多个手指的情况
                    // 取消长按状态
                    if (_this.longPressTimeout) {
                        clearTimeout(_this.longPressTimeout);
                    }
                    if (_this.props.pinchToZoom) {
                        var finger1Touch = evt.nativeEvent.changedTouches[0];
                        var finger2Touch = evt.nativeEvent.changedTouches[1];
                        // 找最小的 x 和最大的 x
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
                            // 记录之前缩放比例
                            // var beforeScale = _this.scale;
                            // 开始缩放
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
                        if (_this.scale >= (_this.props.minScale || 0) && _this.scale <= (_this.props.maxScale || 0)) {
                            _this.lastValidPositionX = _this.positionX;
                            _this.lastValidPositionY = _this.positionY;
                        }
                        _this.isInitialPinch = false;
                        _this.zoomLastDistance = _this.zoomCurrentDistance;
                    }
                }
                _this.imageDidMove('onPanResponderMove');
            },
            onPanResponderRelease: function (evt, gestureState) {
                _this.isInitialPinch = true;
                // 取消长按
                if (_this.longPressTimeout) {
                    clearTimeout(_this.longPressTimeout);
                }
                // 双击结束，结束尾判断
                if (_this.isDoubleClick) {
                    return;
                }
                // 长按结束，结束尾判断
                if (_this.isLongPress) {
                    return;
                }
                // 如果是单个手指、距离上次按住大于预设秒、滑动距离小于预设值, 则可能是单击（如果后续双击间隔内没有开始手势）
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
                    // 多手势结束，或者滑动结束
                    if (_this.props.responderRelease) {
                        _this.props.responderRelease(gestureState.vx, _this.scale);
                    }
                    _this.panResponderReleaseResolve();
                }
                _this.maxContactPoints = 0;
            },
            onPanResponderTerminate: function () {
                //
            }
        });
    };
    ImageViewer.prototype._getOffsetAdjustedPosition = function (x, y) {
        var _a = this.props, _b = _a.imageHeight, imageHeight = _b === void 0 ? 0 : _b, _c = _a.imageWidth, imageWidth = _c === void 0 ? 0 : _c;
        var currentElementWidth = imageWidth;
        var currentElementHeight = imageHeight;
        var returnObj = {
            x: -x + currentElementWidth / 2,
            y: -y + currentElementHeight / 2
        };
        return returnObj;
    };
    ImageViewer.prototype.componentDidMount = function () {
        if (this.props.centerOn) {
            this.centerOn(this.props.centerOn);
        }
    };
    ImageViewer.prototype.componentWillReceiveProps = function (nextProps) {
        // Either centerOn has never been called, or it is a repeat and we should ignore it
        if ((nextProps.centerOn && !this.props.centerOn) ||
            (nextProps.centerOn && this.props.centerOn && this.didCenterOnChange(this.props.centerOn, nextProps.centerOn))) {
            this.centerOn(nextProps.centerOn);
        }
    };
    ImageViewer.prototype.imageDidMove = function (type) {
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
    ImageViewer.prototype.didCenterOnChange = function (params, paramsNext) {
        return params.x !== paramsNext.x || params.y !== paramsNext.y || params.scale !== paramsNext.scale;
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
            _this.imageDidMove('centerOn');
        });
    };
    /**
     * 图片区域视图渲染完毕
     */
    ImageViewer.prototype.handleLayout = function (event) {
        if (this.props.layoutChange) {
            this.props.layoutChange(event);
        }
    };
    /**
     * 重置大小和位置
     */
    ImageViewer.prototype.reset = function () {
        this.scale = 1;
        this.animatedScale.setValue(this.scale);
        this.positionX = 0;
        this.animatedPositionX.setValue(this.positionX);
        this.positionY = 0;
        this.animatedPositionY.setValue(this.positionY);
    };
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
    ImageViewer.defaultProps = new image_zoom_type_1.Props();
    return ImageViewer;
}(React.Component));
exports.default = ImageViewer;
//# sourceMappingURL=image-zoom.component.js.map