import React, { useEffect, useRef, useState } from 'react';

import { PanResponder, Platform, StyleProp, View, ViewStyle } from 'react-native';
import Svg, {
  Circle, Defs, G, LinearGradient, Path, Stop
} from 'react-native-svg';

const { PI, cos, sin, atan2 } = Math;

//  const pointerEvents = Platform.OS === 'android' ? { pointerEvents: 'box-none' } : null;

const calculateAngle = (pos: number, radius: number) => {
  const startAngle = ((2 * PI) - (PI * -0.5));
  const endAngle = (PI + (PI * pos));

  const x1 = -radius * cos(startAngle);
  const y1 = -radius * sin(startAngle);

  const x2 = -radius * cos(endAngle);
  const y2 = -radius * sin(endAngle);

  return { x1, y1, x2, y2 };
};

const calculateRealPos = (x: number, y: number, radius: number, strokeWidth: number) => ({
  endX: x + radius + strokeWidth / 2,
  endY: y + radius + strokeWidth / 2,
});

const calculateMovement = (x: number, y: number, radius: number, strokeWidth: number) => {
  const cx = ((x + strokeWidth) / radius) - PI / 2;
  const cy = -(((y + strokeWidth) / radius) - PI / 2);

  let pos = -atan2(cy, cx) / PI;
  if (pos < -0.5) {
    pos += 2;
  }

  return pos;
};

const percentToPos = (percent: number) => (2 / 100 * percent) - 0.5;
const posToPercent = (pos: number) => 100 * (pos + 0.5) / 2;

const selectGradient = (gradients: { [key: number]: string[] }, pos: number) => {
  const current = posToPercent(pos);
  let selected = 0;

  for (const [key] of Object.entries(gradients)) {
    let nKey = Number(key);
    if (nKey > selected && nKey < current) {
      selected = nKey;
    }
  }

  return gradients[selected];
};

export interface CircularPickerProps {
  size: number;
  strokeWidth?: number;
  defaultPos: number;
  steps: number[] | {x: number, y: number, p: number}[];
  gradients: { [key: number]: string[] };
  backgroundColor?: string;
  stepColor?: string;
  borderColor?: string;
  onChange: (pos: number) => void;
  children: any;
  breakResponder: boolean;
  isLoader?: boolean;
}

const CircularPicker: React.FC<CircularPickerProps> = ({
  size,
  strokeWidth = 45,
  defaultPos,
  steps,
  gradients,
  backgroundColor = 'rgb(231, 231, 231)',
  stepColor = 'rgba(0, 0, 0, 0.2)',
  // borderColor = 'rgb(255, 255, 255)',
  children,
  onChange,
  breakResponder,
  isLoader = false
}) => {

  const isNative = Platform.OS === "ios" || Platform.OS === "android"

  const [pos, setPos] = useState(0);
  
  const circle = useRef<View>(null);

  // const setDisabledScroll = useStoreActions(
  //   actions => actions.appBehavior.setDisabledScroll
  // );

  // const setEnabledScroll = useStoreActions(
  //   actions => actions.appBehavior.setEnableScroll
  // );
  
  const padding = 8;
  const radius = (size - strokeWidth) / 2 - padding;
  const center = (radius + strokeWidth / 2);

  const gradient = selectGradient(gradients, pos);

  useEffect(() => {
    setPos(percentToPos(defaultPos));
  }, [defaultPos]);

  useEffect(() => {
    console.log(pos)
  }, [pos])

  useEffect(() => {
    if (isLoader) {
      let base = 1

      setInterval(() => {
        if (base > 99) {
          base = 1
        }
        base = base + 0.1
        setPos(percentToPos(base))
      }, 1);
    }
  }, []);

  if (steps) {
    steps = steps.map((p) => {
      if (typeof p === 'number') {
        const pos = percentToPos(p);
        const { x2, y2 } = calculateAngle(pos, radius);
        const { endX: x, endY: y } = calculateRealPos(x2, y2, radius, strokeWidth);
        return { x, y, p };
      }

      return p;
    });
  }

  const { x1, y1, x2, y2 } = calculateAngle(pos, radius);
  const { endX, endY } = calculateRealPos(x2, y2, radius, strokeWidth);

  const _handleStartShouldSetPanResponder = (): boolean => {
    console.log('start responder')
    // return setDisabledScroll();
    return false;
  };


  const pan = useRef(PanResponder.create({
    onMoveShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponderCapture: () => true,
    onPanResponderMove: (_, { moveX, moveY }) => {
      console.log(moveX, moveY);
      
      circle.current?.measure((
        _x: number,
        _y: number,
        _width: number,
        _height: number,
        px: number,
        py: number
      )=> {
        const newPos = calculateMovement(moveX - px, moveY - py, radius, strokeWidth);
        /**
         * @TODO
         */

        if ((newPos < -0.3 && pos > 1.3)
          || (newPos > 1.3 && pos < -0.3)) {
          return;
        }

        if (!breakResponder) {
          setPos((prev) => {
            console.log(prev, newPos)
            return newPos;
          });
          onChange(posToPercent(newPos));
          if (Math.floor(posToPercent(newPos)) % 10 === 0) {
            //  if (Platform.OS === 'ios') { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium) }
          }
        }
      });
    },
    
    onPanResponderEnd: () => {
      // setEnabledScroll()
      
      setPos((prev: number) => {

        const current = posToPercent(prev);
        console.log('does it break at the end :'+breakResponder)
        
        if (!breakResponder) {
          if (current % 10 !== 0) {
            let releasepercent = Math.round(current / 10.0) * 10;
  
            onChange(releasepercent);
            console.log(percentToPos(releasepercent))
            return percentToPos(releasepercent)
          }
        }

        return prev
      })
    },
    onStartShouldSetPanResponder: _handleStartShouldSetPanResponder,
    onShouldBlockNativeResponder: () => {
      // Returns whether this component should block native components from becoming the JS
      // responder. Returns true by default. Is currently only supported on android.
      return true;
    }
  })).current;
  
  const renderChild:(
    styles?: StyleProp<ViewStyle>
  ) => JSX.Element = (styles?: StyleProp<ViewStyle>) => {
    return (
      <View style={[{ height: size, display:'flex', alignItems: 'center', justifyContent: 'center', /** userSelect: 'none' */},  styles]}>
        <View>{children}</View>
      </View>
    )
  }

  const d = `
    M ${x2.toFixed(3)} ${y2.toFixed(3)}
    A ${radius} ${radius}
    ${(pos < 0.5) ? '1' : '0'} ${(pos > 0.5) ? '1' : '0'} 0
    ${x1.toFixed(3)} ${y1.toFixed(3)}
  `;

  const location = useRef({ x: 0, y: 0 });

  return (
    <View
    ref={circle}
    onLayout={() => {
      if (!circle.current) return;
      circle.current.measure((_x, _y, w, h, px, py) => {
        location.current = {
          x: px + w / 2,
          y: py + h / 2,
        };
      });
    }}
    {...pan.panHandlers}
  >
    <Svg height={size} width={size} style={{overflow: 'visible'}} >
      <Defs>
        <LinearGradient id="grad" x1="0" y1="0" x2="100%" y2="0">
          <Stop offset="0" stopColor={gradient && gradient[0]} />
          <Stop offset="1" stopColor={gradient && gradient[1]} />
        </LinearGradient>
      </Defs>
      <G transform={`translate(${strokeWidth / 2 + radius + padding}, ${strokeWidth / 2 + radius + padding})`}>
        <Circle
          r={radius}
          strokeWidth={strokeWidth}
          fill="transparent"
          stroke={backgroundColor}
        />

        <Path
          d={d}
          strokeWidth={strokeWidth}
          stroke={`url(#grad)`}
          fill="none"
        />

      </G>
      <G transform={`translate(${center + padding}, ${strokeWidth / 2 + padding})`}>
        <Circle r={(strokeWidth) / 2} fill={backgroundColor} />
      </G>
      {steps && steps.map((step, index) => (
        <G transform={{ translate: `${step.x + padding}, ${step.y + padding}` }} key={index}>
          <Circle
            r={strokeWidth}
            fill="#000"
            strokeWidth="12"
          />
          <Circle
            r={(strokeWidth / 2.5) / 2}
            fill={stepColor}
            strokeWidth="25"
          />
        </G>
      ))}

      <G transform={`translate(${endX + padding}, ${endY + padding})`}>
        {!breakResponder &&
          <Circle
            r={(strokeWidth) / 1.9 + (padding)}
            fill={'#1f1f1f'}
            stroke={'#000'}
            strokeWidth={padding + 55}
          />
        }
        <Circle r={(strokeWidth) / 2} fill={'#000'} />
      </G>
      {isNative && children && renderChild()}
    </Svg>
      {!isNative && children && renderChild({position: 'absolute', top: -10, left: 58})}
</View>
  );
}

export default CircularPicker;