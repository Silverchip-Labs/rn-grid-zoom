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

export class Props {
  // height and width of operating area (phone screen)
  public cropHeight: number = 100;
  public cropWidth: number = 100;

  // height and width of actual image contents
  public imageWidth: number = 100;
  public imageHeight: number = 100;

  // enables moving picture
  public panToMove: boolean = true;

  public pinchToZoom: boolean = true;

  public enableDoubleClickZoom: boolean = true;

  // maximum click displacement
  public clickDistance: number = 10;

  // max sliding threshold
  public maxOverflow: number = 100;

  // time to trigger a long press
  public longPressTime: number = 800;

  // Max interval to trigger a double click
  public doubleClickInterval: number = 175;

  /**
   * If provided this will cause the view to zoom and pan to the center point
   * Duration is optional and defaults to 300 ms.
   */
  public centerOn?: ICenterOn;

  public style: ViewStyle = {};

  // threshold for firing swipe down function
  public swipeDownThreshold: number = 230;

  // for enabling vertical movement if user wants it
  public enableSwipeDown: boolean = false;

  // for disabling focus on image center if user doesn't want it
  public enableCenterFocus: boolean = true;

  // scale meaning zoom
  public minScale: number = 0.6;
  public maxScale: number = 10;

  public onClick: (eventParams: IOnClick) => void = () => {};

  public onDoubleClick: () => void = () => {};

  public onLongPress: () => void = () => {};

  public horizontalOuterRangeOffset: (offsetX?: number) => void = () => {};

  public onDragLeft: () => void = () => {};

  public responderRelease: (vx?: number, scale?: number) => void = () => {};

  //  everytime the map is moved
  public onMove: (position?: IOnMove) => void = () => {};

  //  will be called when the onLayout event fires
  public layoutChange: (event?: object) => void = () => {};

  public onSwipeDown?: () => void = () => {};
}

export class State {
  centerX: number = 0.5;
  centerY: number = 0.5;
}
