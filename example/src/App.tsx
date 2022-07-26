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
        backgroundColor="#FFF"
        stepColor="#FFF"
        borderColor="#FFF"
        onChange={(pos) => setResult(pos)}
        inactive={false}
        defsChildren={
          <LinearGradient id="grad" x1="0" y1="0" x2="100%" y2="0">
            <Stop offset="0" stopColor={'#FF5A5F'} />
            <Stop offset="1" stopColor={'FFC371'} />
          </LinearGradient>
        }
      >
        <View>{result}</View>
      </CircularPicker>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'blue',
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
