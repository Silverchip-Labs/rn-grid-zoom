import * as React from 'react';
import {
  Animated,
  LayoutChangeEvent,
  PanResponder,
  PanResponderInstance,
  StyleSheet,
  View,
  GestureResponderEvent,
  PanResponderGestureState,
  PanResponderCallbacks
} from 'react-native';
import styles from './image-zoom.style';
import { ICenterOn, Props, State } from './image-zoom.type';

export default class ImageViewer extends React.Component<Props, State> {
  public static defaultProps = new Props();
  public state = new State();

  private delay = 10;
  private lastMoved = Date.now();

  private lastPositionX: number | null = null;
  private positionX = 0;
  private animatedPositionX = new Animated.Value(0);
  private lastValidPositionX = 0;

  private lastPositionY: number | null = null;
  private positionY = 0;
  private animatedPositionY = new Animated.Value(0);
  private lastValidPositionY = 0;

  private scale = this.props.minScale;
  private animatedScale = new Animated.Value(1);
  private zoomLastDistance: number | null = null;
  private zoomCurrentDistance = 0;

  // During the sliding process, the overall lateral transboundary offset
  private horizontalWholeOuterCounter = 0;

  // offset during sliding
  private swipeDownOffset = 0;

  // Total displacement of x y during sliding
  private horizontalWholeCounter = 0;
  private verticalWholeCounter = 0;

  private singleClickTimeout?: number;
  private isLongPress = false;
  private longPressTimeout?: number;

  private lastClickTime = 0;

  private isDoubleClick = false;
  private doubleClickX = 0;
  private doubleClickY = 0;

  private midpointX = 0;
  private midpointY = 0;

  // Keeps max number of contact point in 1 gesture
  private maxContactPoints = 0;

  private isInitialPinch = true;

  render() {
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
        {...this.imagePanResponder.panHandlers}
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

  componentDidMount() {
    this.centerOn({
      x: 0,
      y: 0,
      scale: this.scale,
      duration: 1
    });
  }

  public handleLayout(event: LayoutChangeEvent) {
    const { layoutChange } = this.props;
    if (layoutChange) {
      layoutChange(event);
    }
  }

  public centerOn(params: ICenterOn) {
    this.positionX = params.x;
    this.positionY = params.y;
    this.scale = params.scale;
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
      this._handleMove('centerOn');
    });
  }

  private _handleMove(type: string) {
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

  private _handlePanResponderGrant = (evt: GestureResponderEvent) => {
    const { onLongPress, longPressTime, doubleClickInterval, onDoubleClick } = this.props;

    this.lastPositionX = null;
    this.lastPositionY = null;
    this.zoomLastDistance = null;
    this.horizontalWholeCounter = 0;
    this.verticalWholeCounter = 0;
    this.isDoubleClick = false;
    this.isLongPress = false;

    // Clear any click timer when any gesture starts
    if (this.singleClickTimeout) {
      clearTimeout(this.singleClickTimeout);
    }

    if (this.longPressTimeout) {
      clearTimeout(this.longPressTimeout);
    }

    this.longPressTimeout = setTimeout(() => {
      this.isLongPress = true;
      if (onLongPress) {
        onLongPress();
      }
    }, longPressTime);

    const isSingleFingerPress = evt.nativeEvent.changedTouches.length <= 1;
    if (isSingleFingerPress) {
      const isDoubleTap = new Date().getTime() - this.lastClickTime < (doubleClickInterval || 0);
      if (isDoubleTap) {
        this.lastClickTime = 0;
        if (onDoubleClick) {
          onDoubleClick();
        }

        // cancel long press
        clearTimeout(this.longPressTimeout);

        // Because zoom may be triggered, the coordinate position when double-clicking is recorded
        this.doubleClickX = evt.nativeEvent.changedTouches[0].pageX;
        this.doubleClickY = evt.nativeEvent.changedTouches[0].pageY;

        // zoom
        this.isDoubleClick = true;

        if (this.props.enableDoubleClickZoom) {
          if (this.scale !== 1) {
            // Return to place
            this.scale = 1;

            this.positionX = 0;
            this.positionY = 0;
          } else {
            // Start zooming at displacement
            // Scale before recording
            const beforeScale = this.scale;

            // Start zooming
            this.scale = 2;

            // zoom diff
            const diffScale = this.scale - beforeScale;
            // Find the displacement of the center point of the two hands from the center of the page
            // moving position
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
          ]).start(() => this._handleMove('centerOn'));
        }
      } else {
        this.lastClickTime = new Date().getTime();
      }
    }
  };

  private _handlePanResponderMove = (evt: GestureResponderEvent, gestureState: PanResponderGestureState) => {
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
      // Sometimes double-clicking is treated as a displacement, which is blocked here
      return;
    }

    if (evt.nativeEvent.changedTouches.length <= 1) {
      // x displacement
      let diffX = gestureState.dx - (this.lastPositionX || 0);
      if (this.lastPositionX === null) {
        diffX = 0;
      }
      // y displacement
      let diffY = gestureState.dy - (this.lastPositionY || 0);
      if (this.lastPositionY === null) {
        diffY = 0;
      }

      this.lastPositionX = gestureState.dx;
      this.lastPositionY = gestureState.dy;

      this.horizontalWholeCounter += diffX;
      this.verticalWholeCounter += diffY;

      if (Math.abs(this.horizontalWholeCounter) > 5 || Math.abs(this.verticalWholeCounter) > 5) {
        // If the displacement is beyond the range of your finger, cancel the long press monitor
        clearTimeout(this.longPressTimeout);
      }

      if (this.props.panToMove) {
        // Handle swipes left and right if swipeDown is in progress
        if (this.swipeDownOffset === 0) {
          // diffX > 0 means the hand slides to the right, the picture moves to the left, and vice versa
          // horizontalWholeOuterCounter > 0 The overflow is on the left, and vice versa on the right. The larger the absolute value, the more overflow
          if (this.props.imageWidth * this.scale > this.props.cropWidth) {
            // If the image width is larger than the box width, you can drag horizontally
            // There is no overflow offset or this offset completely retracts the offset before dragging
            if (this.horizontalWholeOuterCounter > 0) {
              // overflow on the right
              if (diffX < 0) {
                // tighten from right
                if (this.horizontalWholeOuterCounter > Math.abs(diffX)) {
                  // Offset has not been used up
                  this.horizontalWholeOuterCounter += diffX;
                  diffX = 0;
                } else {
                  // The overflow is set to 0, the offset is subtracted from the remaining overflow, and it can be dragged
                  diffX += this.horizontalWholeOuterCounter;
                  this.horizontalWholeOuterCounter = 0;
                  if (this.props.horizontalOuterRangeOffset) {
                    this.props.horizontalOuterRangeOffset(0);
                  }
                }
              } else {
                // amplify to right
                this.horizontalWholeOuterCounter += diffX;
              }
            } else if (this.horizontalWholeOuterCounter < 0) {
              // overflow on the left
              if (diffX > 0) {
                // Tighten from the left
                if (Math.abs(this.horizontalWholeOuterCounter) > diffX) {
                  // Offset has not been used up
                  this.horizontalWholeOuterCounter += diffX;
                  diffX = 0;
                } else {
                  // The overflow is set to 0, the offset is subtracted from the remaining overflow, and it can be dragged
                  diffX += this.horizontalWholeOuterCounter;
                  this.horizontalWholeOuterCounter = 0;
                  if (this.props.horizontalOuterRangeOffset) {
                    this.props.horizontalOuterRangeOffset(0);
                  }
                }
              } else {
                // Amplify to the left
                this.horizontalWholeOuterCounter += diffX;
              }
            } else {
              // Overflow offset is 0, move normally
            }

            // Produce displacement
            this.positionX += diffX / this.scale;

            this.animatedPositionX.setValue(this.positionX);
          } else {
            // Can't drag horizontally, all count as overflow offset
            this.horizontalWholeOuterCounter += diffX;
          }

          // The overflow will not exceed the set limit
          if (this.horizontalWholeOuterCounter > (this.props.maxOverflow || 0)) {
            this.horizontalWholeOuterCounter = this.props.maxOverflow || 0;
          } else if (this.horizontalWholeOuterCounter < -(this.props.maxOverflow || 0)) {
            this.horizontalWholeOuterCounter = -(this.props.maxOverflow || 0);
          }

          if (this.horizontalWholeOuterCounter !== 0) {
            if (this.props.horizontalOuterRangeOffset) {
              this.props.horizontalOuterRangeOffset(this.horizontalWholeOuterCounter);
            }
          }
        }

        const canDragVertically = this.props.imageHeight * this.scale > this.props.cropHeight;
        if (canDragVertically) {
          this.positionY += diffY / this.scale;
          this.animatedPositionY.setValue(this.positionY);
        }
      }
    } else {
      // multiple fingers
      if (this.longPressTimeout) {
        // cancel long press
        clearTimeout(this.longPressTimeout);
      }

      if (this.props.pinchToZoom) {
        const finger1Touch = evt.nativeEvent.changedTouches[0];
        const finger2Touch = evt.nativeEvent.changedTouches[1];
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
          const distanceScale = this.zoomCurrentDistance / this.zoomLastDistance;

          // -- Zooming
          const zoom = this.scale * distanceScale;

          // begin zoom
          this.scale = zoom;
          this.animatedScale.setValue(this.scale);

          // -- Panning
          const offsetX = this.midpointX - mapCentreX;
          const offsetY = this.midpointY - mapCentreY;

          const scaleOffsetX = offsetX * distanceScale;
          const scaleOffsetY = offsetY * distanceScale;

          let scaleOffsetXDifference = scaleOffsetX - offsetX;
          let scaleOffsetYDifference = scaleOffsetY - offsetY;

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

        if (this.scale >= this.props.minScale && this.scale <= this.props.maxScale) {
          this.lastValidPositionX = this.positionX;
          this.lastValidPositionY = this.positionY;
        }
        this.isInitialPinch = false;
        this.zoomLastDistance = this.zoomCurrentDistance;
      }
    }

    this._handleMove('onPanResponderMove');
  };

  private _handlePanResponderRelease = (evt: GestureResponderEvent, gestureState: PanResponderGestureState) => {
    this.isInitialPinch = true;
    if (this.longPressTimeout) {
      // cancel longpress
      clearTimeout(this.longPressTimeout);
    }

    if (this.isDoubleClick || this.isLongPress) {
      return;
    }

    // If it is a single finger, the distance from the last press is greater than the preset second,
    // and the sliding distance is less than the preset value, it may be a single click (if there is no start gesture in the subsequent double-click interval)
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
      // End with multiple gestures, or end with swipe
      if (this.props.responderRelease) {
        this.props.responderRelease(gestureState.vx, this.scale);
      }

      this._resolvePanResponderRelease();
    }
    this.maxContactPoints = 0;
  };

  private _resolvePanResponderRelease = () => {
    if (this.scale < this.props.minScale) {
      // If the current scale is zoomed out too much, bounce back to the minScale
      this.scale = this.props.minScale;
      this.animatedScale.setValue(this.scale);

      this.positionX = this.lastValidPositionX;
      this.animatedPositionX.setValue(this.positionX);

      this.positionY = this.lastValidPositionY;
      this.animatedPositionY.setValue(this.positionY);
    } else if (this.scale > this.props.maxScale) {
      // If the current scale is zoomed in too much, bounce back to the maxScale
      this.scale = this.props.maxScale;
      this.animatedScale.setValue(this.scale);

      this.positionX = this.lastValidPositionX;
      this.animatedPositionX.setValue(this.positionX);

      this.positionY = this.lastValidPositionY;
      this.animatedPositionY.setValue(this.positionY);
    }

    if (this.props.imageWidth * this.scale <= this.props.cropWidth) {
      // If the picture width is smaller than the box width, the horizontal position is reset
      this.positionX = 0;
      this.animatedPositionX.setValue(this.positionX);
    }

    if (this.props.imageHeight * this.scale <= this.props.cropHeight) {
      // If the picture height is less than the box height, the portrait position is reset
      this.positionY = 0;
      this.animatedPositionY.setValue(this.positionY);
    }

    // The horizontal direction will definitely not be out of range, controlled by dragging
    // If the height of the picture is greater than the height of the box, no black borders can appear in the vertical direction
    if (this.props.imageHeight * this.scale > this.props.cropHeight) {
      // Absolute value of vertical tolerance
      const verticalMax = (this.props.imageHeight * this.scale - this.props.cropHeight) / 2 / this.scale;
      if (this.positionY < -verticalMax) {
        this.positionY = -verticalMax;
      } else if (this.positionY > verticalMax) {
        this.positionY = verticalMax;
      }
      this.animatedPositionY.setValue(this.positionY);
    }

    if (this.props.imageWidth * this.scale > this.props.cropWidth) {
      // Absolute value of vertical tolerance
      const horizontalMax = (this.props.imageWidth * this.scale - this.props.cropWidth) / 2 / this.scale;
      if (this.positionX < -horizontalMax) {
        this.positionX = -horizontalMax;
      } else if (this.positionX > horizontalMax) {
        this.positionX = horizontalMax;
      }
      this.animatedPositionX.setValue(this.positionX);
    }

    this.horizontalWholeOuterCounter = 0;
    this.swipeDownOffset = 0;

    this._handleMove('onPanResponderRelease');
  };

  // initialising panresponder in constructor to prevent usage of componentwillmount
  private imagePanResponder: PanResponderInstance = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderTerminationRequest: () => false,
    onPanResponderGrant: this._handlePanResponderGrant,
    onPanResponderMove: this._handlePanResponderMove,
    onPanResponderRelease: this._handlePanResponderRelease,
    onPanResponderTerminate: () => {}
  });
}
