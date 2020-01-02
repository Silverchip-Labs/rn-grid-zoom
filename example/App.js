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

export default class App extends React.Component {
  render() {
    return (
      <ImageZoom
        cropWidth={Dimensions.get('window').width}
        cropHeight={Dimensions.get('window').height}
        imageWidth={IMAGE_WIDTH + IMAGE_OVERFLOW}
        imageHeight={IMAGE_WIDTH + IMAGE_OVERFLOW}
        minScale={0.2}
        maxScale={5}
      >
        <View
          pointerEvents={'none'}
          style={{
            width: IMAGE_WIDTH + IMAGE_OVERFLOW,
            height: IMAGE_HEIGHT + IMAGE_OVERFLOW,
            paddingHorizontal: IMAGE_PADDING,
            paddingVertical: IMAGE_PADDING
          }}
        >
          <Image
            enableHorizontalBounce={true}
            style={{
              width: IMAGE_HEIGHT,
              height: IMAGE_HEIGHT
            }}
            source={chessboard}
            // source={{
            //   uri:
            //     'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1522606437962&di=f93f5c645225a5681155ebcde27b257f&imgtype=0&src=http%3A%2F%2Fimg.zcool.cn%2Fcommunity%2F0159fa5944bcd3a8012193a34b762d.jpg%402o.jpg'
            // }}
          />
        </View>
      </ImageZoom>
    );
  }
}
