import * as React from 'react';

import { StyleSheet, View } from 'react-native';
import CircularPicker from 'react-native-circular-picker';

export default function App() {
  const [result, setResult] = React.useState<number | undefined>();

  return (
    <View style={styles.container}>
      <CircularPicker
        size={80}
        strokeWidth={20}
        defaultPos={0}
        steps={[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]}
        gradients={[
          ['#FF5A5F', '#FF5A5F'],
          ['#FFC371', '#FFC371'],
        ]}
        backgroundColor="#FFF"
        stepColor="#FFF"
        borderColor="#FFF"
        onChange={(pos) => setResult(pos)}
        breakResponder={true}
      >
        <View>{result}</View>
      </CircularPicker>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
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
