import React, { useEffect, useRef, useState } from 'react';

import { PanResponder, Platform, StyleProp, View, ViewStyle } from 'react-native';
import Svg, {
  Circle, CircleProps, Defs, G, Path, PathProps
} from 'react-native-svg';
import { calculateAngle, calculateMovement, calculateRealPos, percentToPos, posToPercent } from './utils';

export interface CircularPickerProps {
  size: number;
  strokeWidth?: number;
  defaultPos: number;
  steps: number[] | {x: number, y: number, p: number}[];
  stepColor?: string;
  borderColor?: string;
  onChange: (pos: number) => void;
  onStart?: () => void;
  onStep?: () => void;
  onStop?: () => void;
  children: any;
  inactive: boolean;
  isLoader?: boolean;
  defsChildren?: React.ComponentElement<any, any>;
  svgProps?: {
    outerCirle?: CircleProps;
    knob?: CircleProps;
    progress?: PathProps;
  }
}

const CircularPicker: React.FC<CircularPickerProps> = ({
  size,
  strokeWidth = 45,
  defaultPos,
  steps,
  children,
  onChange,
  onStart,
  onStep,
  onStop,
  inactive,
  isLoader = false,
  defsChildren,
  svgProps = {
    outerCirle: {
      stroke:"blue",
    },
    knob: {
      fill: "white",
      stroke: "red",
    },
    progress: {
      stroke: 'yellow'
    } 
  }
}) => {

  const isNative = Platform.OS === "ios" || Platform.OS === "android"

  const [pos, setPos] = useState(defaultPos);
  
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

  useEffect(() => {
    setPos(percentToPos(defaultPos));
  }, [defaultPos]);

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
        const { x, y } = calculateRealPos(x2, y2, radius, strokeWidth);
        return { x, y, p };
      }

      return p;
    });
  }

  const { x1, y1, x2, y2 } = calculateAngle(pos, radius);
  const { x: endX, y: endY } = calculateRealPos(x2, y2, radius, strokeWidth);

  const _handleStartShouldSetPanResponder = (): boolean => {
    onStart && onStart();
    return false;
  };

  const pan = useRef(PanResponder.create({
    onMoveShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponderCapture: () => true,
    onPanResponderMove: (_, { moveX, moveY }) => {      
      circle.current?.measure((
        _x: number,
        _y: number,
        _width: number,
        _height: number,
        px: number,
        py: number
      )=> {
        const newPos = calculateMovement(moveX - px, moveY - py, radius, strokeWidth);

        if ((newPos < -0.3 && pos > 1.3)
          || (newPos > 1.3 && pos < -0.3)) {
          return;
        }

        if (!inactive) {
          setPos(newPos);
          onChange(posToPercent(newPos));
          const stepPassed = Math.floor(posToPercent(newPos)) % 10 === 0;
          if (stepPassed) {
            onStep && onStep();
          }
        }
      });
    },
    
    onPanResponderEnd: () => {
      // setEnabledScroll()
      onStop && onStop();
      setPos((prev: number) => {
        const current = posToPercent(prev);
        if (!inactive) {
          if (current % 10 !== 0) {
            let releasepercent = Math.round(current / 10.0) * 10;
  
            onChange(releasepercent);
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
        {defsChildren}
      </Defs>
      <G transform={`translate(${strokeWidth / 2 + radius + padding}, ${strokeWidth / 2 + radius + padding})`}>
        <Circle
          r={radius}
          strokeWidth={strokeWidth}
          fill='transparent'
          {...svgProps.outerCirle}
        />

        <Path
          d={d}
          strokeWidth={strokeWidth}
          fill="transparent"
          {...svgProps.progress}
        />

      </G>
      <G transform={`translate(${center + padding}, ${strokeWidth / 2 + padding})`}>
        <Circle r={(strokeWidth) / 2}
          fill={svgProps.outerCirle?.stroke ? svgProps.outerCirle.stroke :  'transparent'}
        />
      </G>
      {steps && steps.map((step, index) => (
        <G transform={{ translate: `${step.x + padding}, ${step.y + padding}` }} key={index}>
          <Circle
            r={strokeWidth}
            fill="transparent"
            strokeWidth="12"
          />
          <Circle
            r={(strokeWidth / 2.5) / 2}
            fill={"transparent"}
            strokeWidth="25"
          />
        </G>
      ))}

      <G transform={`translate(${endX + padding}, ${endY + padding})`}>
        {!inactive &&
          <Circle
            r={(strokeWidth) / 1.9 + (padding)}
            strokeWidth={padding}

            {...svgProps.knob}
          />
        }
        <Circle r={(strokeWidth) / 2} {...svgProps.knob} stroke='transparent' />
      </G>
      {isNative && children && renderChild()}
    </Svg>
      {!isNative && children && renderChild({position: 'absolute', top: -10, left: 58})}
    </View>
  );
}

export default CircularPicker;