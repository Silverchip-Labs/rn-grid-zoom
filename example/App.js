import React from 'react';
import { Image, Dimensions, View } from 'react-native';
import ImageZoom from './built/index';

import chessboard from './assets/chessboard/chessboard.jpg';
import blackSquare from './assets/chessboard/black.jpg';
import whiteSquare from './assets/chessboard/white.jpg';
import bee from './assets/bee.png';

const IMAGE_HEIGHT = 1000;
const IMAGE_WIDTH = 1000;
const IMAGE_PADDING = 1000;
const IMAGE_OVERFLOW = IMAGE_PADDING * 2;

const MIN_SCALE = 0.04;
const MAX_SCALE = 5;
const SCALE_BREAKPOINT = 0.1;

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      renderBig: true,
      beeX: 0,
      beeY: 0
    };

    this.imgZoomRef = React.createRef();
    this.dimensionHeight = Dimensions.get('window').height;
    this.dimensionWidth = Dimensions.get('window').width;
  }

  render() {
    const { renderBig } = this.state;
    return (
      <ImageZoom
        ref={this.imgZoomRef}
        cropWidth={this.dimensionWidth}
        cropHeight={this.dimensionHeight}
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
          <Image
            source={bee}
            style={{
              width: 300,
              height: 300,
              left: this.state.beeX,
              top: this.state.beeY,
              position: 'absolute'
            }}
          />
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
    if (params.type === 'onPanResponderRelease') {
      console.log(params);
    }

    if (this.state.renderBig !== renderBig) {
      this.setState({ renderBig });
    }

    this.setState({
      beeX: params.positionX,
      beeY: params.positionY
    });
  };

  _renderRows = () => {
    return [1, 2, 3, 4, 5, 6, 7, 8].map(row => (
      <View style={{ flexDirection: 'row' }}>{row % 2 ? this._renderEvenRow(row) : this._renderOddRow(row)}</View>
    ));
  };

  _renderOddRow = rowNum => {
    return [1, 2, 3, 4, 5, 6, 7, 8].map(col => this._renderBox(col % 2 ? blackSquare : whiteSquare, rowNum, col));
  };

  _renderEvenRow = rowNum => {
    return [1, 2, 3, 4, 5, 6, 7, 8].map(col => this._renderBox(col % 2 ? whiteSquare : blackSquare, rowNum, col));
  };

  // 2, 3
  _renderBox = (source, rowNum, colNum) => {
    // 2000, 3000
    const { current } = this.imgZoomRef;
    const { positionX, positionY, scale } = current;
    const { dimensionHeight: height, dimensionWidth: width } = this;

    // todo get scale offset for x and y, height width and scale
    // todo check if box

    const shouldRender = colNum % 2;
    if (shouldRender) return <Image style={{ height: IMAGE_HEIGHT, width: IMAGE_WIDTH }} source={source} />;

    return <View style={{ height: IMAGE_HEIGHT, width: IMAGE_WIDTH, backgroundColor: 'red' }} />;
  };
}
