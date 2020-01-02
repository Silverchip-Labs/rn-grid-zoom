import * as React from 'react';
import {
  Animated,
  LayoutChangeEvent,
  PanResponder,
  PanResponderInstance,
  // Platform,
  // PlatformOSType,
  StyleSheet,
  View
} from 'react-native';
import styles from './image-zoom.style';
import { ICenterOn, Props, State } from './image-zoom.type';

export default class ImageViewer extends React.Component<Props, State> {
  public static defaultProps = new Props();
  public state = new State();

  private delay = 10;
  private lastMoved = Date.now();
  // 上次/当前/动画 x 位移
  private lastPositionX: number | null = null;
  private positionX = 0;
  private animatedPositionX = new Animated.Value(0);

  // 上次/当前/动画 y 位移
  private lastPositionY: number | null = null;
  private positionY = 0;
  private animatedPositionY = new Animated.Value(0);

  // 缩放大小
  private scale = 1;
  private animatedScale = new Animated.Value(1);
  private zoomLastDistance: number | null = null;
  private zoomCurrentDistance = 0;

  // 图片手势处理
  private imagePanResponder: PanResponderInstance | null = null;

  // 滑动过程中，整体横向过界偏移量
  private horizontalWholeOuterCounter = 0;

  // 滑动过程中，swipeDown 偏移量
  private swipeDownOffset = 0;

  // 滑动过程中，x y的总位移
  private horizontalWholeCounter = 0;
  private verticalWholeCounter = 0;

  // 触发单击的 timeout
  private singleClickTimeout: any;

  // 计算长按的 timeout
  private longPressTimeout: any;

  // 上一次点击的时间
  private lastClickTime = 0;

  // 双击时的位置
  private doubleClickX = 0;
  private doubleClickY = 0;

  // 是否双击了
  private isDoubleClick = false;

  // 是否是长按
  private isLongPress = false;

  private midpointX: number = 0;
  private midpointY: number = 0;

  private lastValidPositionX = 0;
  private lastValidPositionY = 0;

  // Keeps max number of contact point in 1 gesture
  private maxContactPoints = 0;

  private isInitialPinch = true;

  public componentWillMount() {
    this.imagePanResponder = PanResponder.create({
      // 要求成为响应者：
      onStartShouldSetPanResponder: () => true,
      onPanResponderTerminationRequest: () => false,

      onPanResponderGrant: evt => {
        // 开始手势操作
        this.lastPositionX = null;
        this.lastPositionY = null;
        this.zoomLastDistance = null;
        this.horizontalWholeCounter = 0;
        this.verticalWholeCounter = 0;
        this.isDoubleClick = false;
        this.isLongPress = false;

        // 任何手势开始，都清空单击计时器
        if (this.singleClickTimeout) {
          clearTimeout(this.singleClickTimeout);
        }

        // 计算长按
        if (this.longPressTimeout) {
          clearTimeout(this.longPressTimeout);
        }
        this.longPressTimeout = setTimeout(() => {
          this.isLongPress = true;
          if (this.props.onLongPress) {
            this.props.onLongPress();
          }
        }, this.props.longPressTime);

        if (evt.nativeEvent.changedTouches.length <= 1) {
          // 一个手指的情况
          if (new Date().getTime() - this.lastClickTime < (this.props.doubleClickInterval || 0)) {
            // 认为触发了双击
            this.lastClickTime = 0;
            if (this.props.onDoubleClick) {
              this.props.onDoubleClick();
            }

            // 取消长按
            clearTimeout(this.longPressTimeout);

            // 因为可能触发放大，因此记录双击时的坐标位置
            this.doubleClickX = evt.nativeEvent.changedTouches[0].pageX;
            this.doubleClickY = evt.nativeEvent.changedTouches[0].pageY;

            // 缩放
            this.isDoubleClick = true;

            if (this.props.enableDoubleClickZoom) {
              if (this.scale > 1 || this.scale < 1) {
                // 回归原位
                this.scale = 1;

                this.positionX = 0;
                this.positionY = 0;
              } else {
                // 开始在位移地点缩放
                // 记录之前缩放比例
                // 此时 this.scale 一定为 1
                const beforeScale = this.scale;

                // 开始缩放
                this.scale = 2;

                // 缩放 diff
                const diffScale = this.scale - beforeScale;
                // 找到两手中心点距离页面中心的位移
                // 移动位置
                this.positionX = ((this.props.cropWidth / 2 - this.doubleClickX) * diffScale) / this.scale;

                this.positionY = ((this.props.cropHeight / 2 - this.doubleClickY) * diffScale) / this.scale;
              }

              Animated.parallel([
                Animated.timing(this.animatedScale, {
                  toValue: this.scale,
                  duration: 100
                }),
                Animated.timing(this.animatedPositionX, {
                  toValue: this.positionX,
                  duration: 100
                }),
                Animated.timing(this.animatedPositionY, {
                  toValue: this.positionY,
                  duration: 100
                })
              ]).start(() => this.imageDidMove('centerOn'));
            }
          } else {
            this.lastClickTime = new Date().getTime();
          }
        }
      },
      onPanResponderMove: (evt, gestureState) => {
        // throttle the requests to every 10ms
        const time = Date.now();
        const delta = time - this.lastMoved;
        if (delta < this.delay) {
          return;
        }
        this.lastMoved = time;

        const contactPointsCount = evt.nativeEvent.touches.length;
        if (contactPointsCount > this.maxContactPoints) {
          this.maxContactPoints = contactPointsCount;
        }

        if (this.isDoubleClick) {
          // 有时双击会被当做位移，这里屏蔽掉
          return;
        }

        if (evt.nativeEvent.changedTouches.length <= 1) {
          // x 位移
          let diffX = gestureState.dx - (this.lastPositionX || 0);
          if (this.lastPositionX === null) {
            diffX = 0;
          }
          // y 位移
          let diffY = gestureState.dy - (this.lastPositionY || 0);
          if (this.lastPositionY === null) {
            diffY = 0;
          }

          // 保留这一次位移作为下次的上一次位移
          this.lastPositionX = gestureState.dx;
          this.lastPositionY = gestureState.dy;

          this.horizontalWholeCounter += diffX;
          this.verticalWholeCounter += diffY;

          if (Math.abs(this.horizontalWholeCounter) > 5 || Math.abs(this.verticalWholeCounter) > 5) {
            // 如果位移超出手指范围，取消长按监听
            clearTimeout(this.longPressTimeout);
          }

          if (this.props.panToMove) {
            // 处理左右滑，如果正在 swipeDown，左右滑失效
            if (this.swipeDownOffset === 0) {
              // diffX > 0 表示手往右滑，图往左移动，反之同理
              // horizontalWholeOuterCounter > 0 表示溢出在左侧，反之在右侧，绝对值越大溢出越多
              if (this.props.imageWidth * this.scale > this.props.cropWidth) {
                // 如果图片宽度大图盒子宽度， 可以横向拖拽
                // 没有溢出偏移量或者这次位移完全收回了偏移量才能拖拽
                if (this.horizontalWholeOuterCounter > 0) {
                  // 溢出在右侧
                  if (diffX < 0) {
                    // 从右侧收紧
                    if (this.horizontalWholeOuterCounter > Math.abs(diffX)) {
                      // 偏移量还没有用完
                      this.horizontalWholeOuterCounter += diffX;
                      diffX = 0;
                    } else {
                      // 溢出量置为0，偏移量减去剩余溢出量，并且可以被拖动
                      diffX += this.horizontalWholeOuterCounter;
                      this.horizontalWholeOuterCounter = 0;
                      if (this.props.horizontalOuterRangeOffset) {
                        this.props.horizontalOuterRangeOffset(0);
                      }
                    }
                  } else {
                    // 向右侧扩增
                    this.horizontalWholeOuterCounter += diffX;
                  }
                } else if (this.horizontalWholeOuterCounter < 0) {
                  // 溢出在左侧
                  if (diffX > 0) {
                    // 从左侧收紧
                    if (Math.abs(this.horizontalWholeOuterCounter) > diffX) {
                      // 偏移量还没有用完
                      this.horizontalWholeOuterCounter += diffX;
                      diffX = 0;
                    } else {
                      // 溢出量置为0，偏移量减去剩余溢出量，并且可以被拖动
                      diffX += this.horizontalWholeOuterCounter;
                      this.horizontalWholeOuterCounter = 0;
                      if (this.props.horizontalOuterRangeOffset) {
                        this.props.horizontalOuterRangeOffset(0);
                      }
                    }
                  } else {
                    // 向左侧扩增
                    this.horizontalWholeOuterCounter += diffX;
                  }
                } else {
                  // 溢出偏移量为0，正常移动
                }

                // 产生位移
                this.positionX += diffX / this.scale;

                this.animatedPositionX.setValue(this.positionX);
              } else {
                // 不能横向拖拽，全部算做溢出偏移量
                this.horizontalWholeOuterCounter += diffX;
              }

              // 溢出量不会超过设定界限
              if (this.horizontalWholeOuterCounter > (this.props.maxOverflow || 0)) {
                this.horizontalWholeOuterCounter = this.props.maxOverflow || 0;
              } else if (this.horizontalWholeOuterCounter < -(this.props.maxOverflow || 0)) {
                this.horizontalWholeOuterCounter = -(this.props.maxOverflow || 0);
              }

              if (this.horizontalWholeOuterCounter !== 0) {
                // 如果溢出偏移量不是0，执行溢出回调
                if (this.props.horizontalOuterRangeOffset) {
                  this.props.horizontalOuterRangeOffset(this.horizontalWholeOuterCounter);
                }
              }
            }

            // 如果图片高度大于盒子高度， 可以纵向弹性拖拽
            if (this.props.imageHeight * this.scale > this.props.cropHeight) {
              this.positionY += diffY / this.scale;
              this.animatedPositionY.setValue(this.positionY);
            }
          }
        } else {
          // 多个手指的情况
          // 取消长按状态
          if (this.longPressTimeout) {
            clearTimeout(this.longPressTimeout);
          }

          if (this.props.pinchToZoom) {
            const finger1Touch = evt.nativeEvent.changedTouches[0];
            const finger2Touch = evt.nativeEvent.changedTouches[1];
            // 找最小的 x 和最大的 x
            let minX: number;
            let maxX: number;
            if (finger1Touch.locationX > finger2Touch.locationX) {
              minX = finger2Touch.pageX;
              maxX = finger1Touch.pageX;
            } else {
              minX = finger1Touch.pageX;
              maxX = finger2Touch.pageX;
            }

            let minY: number;
            let maxY: number;
            if (finger1Touch.locationY > finger2Touch.locationY) {
              minY = finger2Touch.pageY;
              maxY = finger1Touch.pageY;
            } else {
              minY = finger1Touch.pageY;
              maxY = finger2Touch.pageY;
            }

            let widthDistance = maxX - minX;
            let heightDistance = maxY - minY;

            let mapCentreX = this.props.imageWidth / 2 - this.positionX; // This is image coords
            let mapCentreY = this.props.imageHeight / 2 - this.positionY; // This is image coords

            var diagonalDistance = Math.sqrt(widthDistance * widthDistance + heightDistance * heightDistance);

            this.zoomCurrentDistance = Number(diagonalDistance.toFixed(1));

            // if it is the initial pinch or zooming out
            if (this.isInitialPinch || this.zoomCurrentDistance < (this.zoomLastDistance || 0)) {
              this.midpointX = (finger1Touch.locationX + finger2Touch.locationX) / 2;
              this.midpointY = (finger1Touch.locationY + finger2Touch.locationY) / 2;
            }

            if (this.zoomLastDistance !== null) {
              var distanceScale = this.zoomCurrentDistance / this.zoomLastDistance;

              // -- Zooming
              var zoom = this.scale * distanceScale;

              // 记录之前缩放比例
              // var beforeScale = _this.scale;
              // 开始缩放
              this.scale = zoom;
              this.animatedScale.setValue(this.scale);

              // -- Panning
              var offsetX = this.midpointX - mapCentreX;
              var offsetY = this.midpointY - mapCentreY;

              var scaleOffsetX = offsetX * distanceScale;
              var scaleOffsetY = offsetY * distanceScale;

              var scaleOffsetXDifference = scaleOffsetX - offsetX;
              var scaleOffsetYDifference = scaleOffsetY - offsetY;

              // slow down the panning when the zoom scale gets large so it doesn't go crazy
              if (this.scale > 3.5) {
                scaleOffsetXDifference /= this.scale;
                scaleOffsetYDifference /= this.scale;
              }

              this.positionX -= scaleOffsetXDifference;
              this.positionY -= scaleOffsetYDifference;

              this.animatedPositionX.setValue(this.positionX);
              this.animatedPositionY.setValue(this.positionY);
            }

            if (this.scale >= (this.props.minScale || 0) && this.scale <= (this.props.maxScale || 0)) {
              this.lastValidPositionX = this.positionX;
              this.lastValidPositionY = this.positionY;
            }
            this.isInitialPinch = false;
            this.zoomLastDistance = this.zoomCurrentDistance;
          }
        }

        this.imageDidMove('onPanResponderMove');
      },
      onPanResponderRelease: (evt, gestureState) => {
        this.isInitialPinch = true;
        // 取消长按
        if (this.longPressTimeout) {
          clearTimeout(this.longPressTimeout);
        }

        // 双击结束，结束尾判断
        if (this.isDoubleClick) {
          return;
        }

        // 长按结束，结束尾判断
        if (this.isLongPress) {
          return;
        }

        // 如果是单个手指、距离上次按住大于预设秒、滑动距离小于预设值, 则可能是单击（如果后续双击间隔内没有开始手势）
        const moveDistance = Math.sqrt(gestureState.dx * gestureState.dx + gestureState.dy * gestureState.dy);
        const { locationX, locationY, pageX, pageY } = evt.nativeEvent;

        const isSingleFingerClick = this.maxContactPoints <= 1;
        if (isSingleFingerClick && moveDistance < (this.props.clickDistance || 0)) {
          this.singleClickTimeout = setTimeout(() => {
            if (this.props.onClick) {
              this.props.onClick({ locationX, locationY, pageX, pageY });
            }
          }, this.props.doubleClickInterval);
        } else {
          // 多手势结束，或者滑动结束
          if (this.props.responderRelease) {
            this.props.responderRelease(gestureState.vx, this.scale);
          }

          this.panResponderReleaseResolve();
        }
        this.maxContactPoints = 0;
      },
      onPanResponderTerminate: () => {
        //
      }
    });
  }

  public _getOffsetAdjustedPosition(x: number, y: number) {
    const { imageHeight = 0, imageWidth = 0 } = this.props;

    const currentElementWidth = imageWidth;
    const currentElementHeight = imageHeight;

    const returnObj = {
      x: -x + currentElementWidth / 2,
      y: -y + currentElementHeight / 2
    };

    return returnObj;
  }

  public resetScale = () => {
    this.positionX = 0;
    this.positionY = 0;
    this.scale = 1;
    this.animatedScale.setValue(1);
  };

  public panResponderReleaseResolve = () => {
    // 判断是否是 swipeDown
    if (this.props.enableSwipeDown && this.props.swipeDownThreshold) {
      if (this.swipeDownOffset > this.props.swipeDownThreshold) {
        if (this.props.onSwipeDown) {
          this.props.onSwipeDown();
        }
        // Stop reset.
        return;
      }
    }

    if (this.props.enableCenterFocus && this.scale < 1) {
      // 如果缩放小于1，强制重置为 1
      this.scale = 1;
      this.animatedScale.setValue(this.scale);
    } else if (this.scale < (this.props.minScale || 0)) {
      // If the current scale is zoomed out too much, bounce back to the minScale
      this.scale = this.props.minScale || 0;
      this.animatedScale.setValue(this.scale);

      this.positionX = this.lastValidPositionX;
      this.animatedPositionX.setValue(this.positionX);

      this.positionY = this.lastValidPositionY;
      this.animatedPositionY.setValue(this.positionY);
    } else if (this.scale > (this.props.maxScale || 0)) {
      // If the current scale is zoomed in too much, bounce back to the maxScale
      this.scale = this.props.maxScale || 0;
      this.animatedScale.setValue(this.scale);

      this.positionX = this.lastValidPositionX;
      this.animatedPositionX.setValue(this.positionX);

      this.positionY = this.lastValidPositionY;
      this.animatedPositionY.setValue(this.positionY);
    }

    if (this.props.imageWidth * this.scale <= this.props.cropWidth) {
      // 如果图片宽度小于盒子宽度，横向位置重置
      this.positionX = 0;
      this.animatedPositionX.setValue(this.positionX);
    }

    if (this.props.imageHeight * this.scale <= this.props.cropHeight) {
      // 如果图片高度小于盒子高度，纵向位置重置
      this.positionY = 0;
      this.animatedPositionY.setValue(this.positionY);
    }

    // 横向肯定不会超出范围，由拖拽时控制
    // 如果图片高度大于盒子高度，纵向不能出现黑边
    if (this.props.imageHeight * this.scale > this.props.cropHeight) {
      // 纵向能容忍的绝对值
      const verticalMax = (this.props.imageHeight * this.scale - this.props.cropHeight) / 2 / this.scale;
      if (this.positionY < -verticalMax) {
        this.positionY = -verticalMax;
      } else if (this.positionY > verticalMax) {
        this.positionY = verticalMax;
      }
      this.animatedPositionY.setValue(this.positionY);
    }

    if (this.props.imageWidth * this.scale > this.props.cropWidth) {
      // 纵向能容忍的绝对值
      const horizontalMax = (this.props.imageWidth * this.scale - this.props.cropWidth) / 2 / this.scale;
      if (this.positionX < -horizontalMax) {
        this.positionX = -horizontalMax;
      } else if (this.positionX > horizontalMax) {
        this.positionX = horizontalMax;
      }
      this.animatedPositionX.setValue(this.positionX);
    }

    // 拖拽正常结束后,如果没有缩放,直接回到0,0点
    if (this.props.enableCenterFocus && this.scale === 1) {
      this.positionX = 0;
      this.positionY = 0;

      this.animatedPositionX.setValue(this.positionX);
      this.animatedPositionY.setValue(this.positionY);
    }

    // 水平溢出量置空
    this.horizontalWholeOuterCounter = 0;

    // swipeDown 溢出量置空
    this.swipeDownOffset = 0;

    this.imageDidMove('onPanResponderRelease');
  };

  public componentDidMount() {
    if (this.props.centerOn) {
      this.centerOn(this.props.centerOn);
    }
  }

  public componentWillReceiveProps(nextProps: Props) {
    // Either centerOn has never been called, or it is a repeat and we should ignore it
    if (
      (nextProps.centerOn && !this.props.centerOn) ||
      (nextProps.centerOn && this.props.centerOn && this.didCenterOnChange(this.props.centerOn, nextProps.centerOn))
    ) {
      this.centerOn(nextProps.centerOn);
    }
  }

  public imageDidMove(type: string) {
    if (this.props.onMove) {
      this.props.onMove({
        type,
        positionX: this.positionX,
        positionY: this.positionY,
        scale: this.scale,
        zoomCurrentDistance: this.zoomCurrentDistance
      });
    }
  }

  public didCenterOnChange(
    params: { x: number; y: number; scale: number; duration: number },
    paramsNext: { x: number; y: number; scale: number; duration: number }
  ) {
    return params.x !== paramsNext.x || params.y !== paramsNext.y || params.scale !== paramsNext.scale;
  }

  public centerOn(params: ICenterOn) {
    this.positionX = params!.x;
    this.positionY = params!.y;
    this.scale = params!.scale;
    const duration = params!.duration || 100;
    Animated.parallel([
      Animated.timing(this.animatedScale, {
        toValue: this.scale,
        duration
      }),
      Animated.timing(this.animatedPositionX, {
        toValue: this.positionX,
        duration
      }),
      Animated.timing(this.animatedPositionY, {
        toValue: this.positionY,
        duration
      })
    ]).start(() => {
      this.imageDidMove('centerOn');
    });
  }

  /**
   * 图片区域视图渲染完毕
   */
  public handleLayout(event: LayoutChangeEvent) {
    if (this.props.layoutChange) {
      this.props.layoutChange(event);
    }
  }

  /**
   * 重置大小和位置
   */
  public reset() {
    this.scale = 1;
    this.animatedScale.setValue(this.scale);
    this.positionX = 0;
    this.animatedPositionX.setValue(this.positionX);
    this.positionY = 0;
    this.animatedPositionY.setValue(this.positionY);
  }

  public render() {
    const animateConf = {
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

    const parentStyles = StyleSheet.flatten(this.props.style);

    return (
      <View
        style={{
          ...styles.container,
          ...parentStyles,
          width: this.props.cropWidth,
          height: this.props.cropHeight
        }}
        {...this.imagePanResponder!.panHandlers}
      >
        <Animated.View style={animateConf} renderToHardwareTextureAndroid>
          <View
            onLayout={this.handleLayout.bind(this)}
            style={{
              width: this.props.imageWidth,
              height: this.props.imageHeight
            }}
          >
            {this.props.children}
          </View>
        </Animated.View>
      </View>
    );
  }
}
