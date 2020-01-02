import React from 'react';
import { Image, Dimensions, View } from 'react-native';
import ImageZoom from './built/index';

import chessboard from './assets/chessboard/chessboard.jpg';
import blackSquare from './assets/chessboard/black.jpg';
import whiteSquare from './assets/chessboard/white.jpg';

const IMAGE_HEIGHT = 1000;
const IMAGE_WIDTH = 1000;
const IMAGE_PADDING = 100;
const IMAGE_OVERFLOW = IMAGE_PADDING * 2;

const MIN_SCALE = 0.2;
const MAX_SCALE = 5;
const SCALE_BREAKPOINT = 1.5;

export default class App extends React.Component {
  state = {
    renderBig: true
  };

  render() {
    const { renderBig } = this.state;
    return (
      <ImageZoom
        cropWidth={Dimensions.get('window').width}
        cropHeight={Dimensions.get('window').height}
        imageWidth={IMAGE_WIDTH * 8 + IMAGE_OVERFLOW}
        imageHeight={IMAGE_WIDTH * 8 + IMAGE_OVERFLOW}
        minScale={MIN_SCALE}
        maxScale={MAX_SCALE}
        onMove={this.handleMove}
      >
        <View
          pointerEvents={'none'}
          style={{
            width: IMAGE_WIDTH * 8 + IMAGE_OVERFLOW,
            height: IMAGE_HEIGHT * 8 + IMAGE_OVERFLOW,
            paddingHorizontal: IMAGE_PADDING,
            paddingVertical: IMAGE_PADDING
          }}
        >
          {renderBig ? (
            <Image
              enableHorizontalBounce={true}
              style={{
                width: IMAGE_HEIGHT * 8,
                height: IMAGE_HEIGHT * 8
              }}
              source={chessboard}
            />
          ) : (
            this._renderRows()
          )}
        </View>
      </ImageZoom>
    );
  }

  handleMove = params => {
    const renderBig = params.scale < SCALE_BREAKPOINT;
    console.log({ renderBig, ...params });
    if (this.state.renderBig != renderBig) {
      this.setState({ renderBig });
    }
  };

  _renderRows = () => {
    return [1, 2, 3, 4, 5, 6, 7, 8].map(n => (
      <View style={{ flexDirection: 'row' }}>{n % 2 ? this._renderEvenRow() : this._renderOddRow()}</View>
    ));
  };

  _renderOddRow = () => {
    return [1, 2, 3, 4, 5, 6, 7, 8].map(n => this._renderBox(n % 2 ? blackSquare : whiteSquare));
  };

  _renderEvenRow = () => {
    return [1, 2, 3, 4, 5, 6, 7, 8].map(n => this._renderBox(n % 2 ? whiteSquare : blackSquare));
  };

  _renderBox = source => {
    return <Image style={{ height: IMAGE_HEIGHT, width: IMAGE_WIDTH }} source={source} />;
  };
}
