import * as React from 'react';

import { StyleSheet, View } from 'react-native';
import CircularPicker from 'react-native-circular-picker';
import { LinearGradient, Stop } from 'react-native-svg';

export default function App() {
  const [result, setResult] = React.useState<number>(10);
  const defaultValue = result;
  return (
    <View style={styles.container}>
      <CircularPicker
        size={300}
        strokeWidth={20}
        defaultPos={defaultValue}
        steps={[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]}
        onChange={(pos) => setResult(pos)}
        inactive={false}
        defsChildren={
          <LinearGradient id="grad" x1="0" y1="0" x2="100%" y2="0">
            <Stop offset="0" stopColor={'#fff7b0 '} />
            <Stop offset="1" stopColor={'#b7b0ff'} />
          </LinearGradient>
        }
        svgProps={{
          outerCirle: {
            stroke:"url(#grad)",
          },
          knob: {
            fill: "white",
            stroke: "#998fff",
          },
          progress: {
            stroke: '#998fff'
          }
        }}
      >
        <View>{result}</View>
      </CircularPicker>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    width: 60,
    height: 60,
    marginVertical: 20,
  },
});
