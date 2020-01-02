import React from 'react';
import { Image, Dimensions } from 'react-native';
import ImageZoom from './built/index';

import chessboard from './assets/chessboard/chessboard.jpg';
import blackSquare from './assets/chessboard/black.jpg';
import whiteSquare from './assets/chessboard/white.jpg';

export const IMAGE_HEIGHT = 8192;
export const IMAGE_WIDTH = 8192;

export default class App extends React.Component {
  render() {
    return (
      <ImageZoom
        cropWidth={Dimensions.get('window').width}
        cropHeight={Dimensions.get('window').height}
        imageWidth={IMAGE_WIDTH}
        imageHeight={IMAGE_HEIGHT}
        enableSwipeDown={true}
        enableCenterFocus={true}
        maxScale={1000}
        minScale={10}
        scale={50}
      >
        <Image
          enableHorizontalBounce={true}
          style={{
            width: IMAGE_WIDTH,
            height: IMAGE_HEIGHT
          }}
          source={chessboard}
        />
      </ImageZoom>
    );
  }
}
