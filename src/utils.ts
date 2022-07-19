const { PI, cos, sin, atan2 } = Math;

export function calculateAngle(
  pos: number,
  radius: number,
): {x1: number, y1: number, x2: number, y2: number} {
  const startAngle = ((2 * PI) - (PI * -0.5));
  const endAngle = (PI + (PI * pos));

  const x1 = -radius * cos(startAngle);
  const y1 = -radius * sin(startAngle);

  const x2 = -radius * cos(endAngle);
  const y2 = -radius * sin(endAngle);

  return { x1, y1, x2, y2 };
}

export function calculateRealPos(
  x: number,
  y: number,
  radius: number,
  strokeWidth: number,
): { x: number; y: number } {
  return {
    x: x + radius + strokeWidth / 2,
    y: y + radius + strokeWidth / 2,
  };
}

export function calculateMovement(
  x: number,
  y: number,
  radius: number,
  strokeWidth: number,
): number {
  const cx = ((x + strokeWidth) / radius) - PI / 2;
  const cy = -(((y + strokeWidth) / radius) - PI / 2);

  let pos = -atan2(cy, cx) / PI;
  if (pos < -0.5) {
    pos += 2;
  }

  return pos;
}

export function percentToPos(percent: number): number {
  return (2 / 100 * percent) - 0.5
}

export function posToPercent(pos: number): number {
  return 100 * (pos + 0.5) / 2;
}
