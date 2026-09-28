import { type FC, type KeyboardEvent, type PointerEvent, useId, useMemo, useState } from 'react';
import { curveMonotoneX } from '@visx/curve';
import { scaleLinear } from '@visx/scale';
import { area, line } from '@visx/shape';
import { type Transition, useReducedMotion } from 'framer-motion';
import { formatUsd } from 'shared/lib';
import { color } from 'shared/lib/themes';
import type { IChartPoint, Nullable, Period } from 'shared/types';
import { findNearestPoint, formatChartTime, resamplePoints } from '../lib';
import {
  ChartArea,
  ChartLine,
  ChartImage,
  CursorDot,
  CursorLine,
  TooltipContainer,
  TooltipTimeText,
  TooltipValueText,
} from './styled';

interface IChartPlotProps {
  points: IChartPoint[];
  period: Period;
  width: number;
  height: number;
  trend: 'up' | 'down' | 'flat';
}

export const ChartPlot: FC<IChartPlotProps> = ({ points, period, width, height, trend }) => {
  const gradientId = `chart-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const shouldReduceMotion = useReducedMotion();
  const [hovered, setHovered] = useState<Nullable<IChartPoint>>(null);
  const stroke =
    trend === 'up' ? color('positive') : trend === 'down' ? color('negative') : color('textMuted');

  const { linePath, areaPath, xScale, yScale } = useMemo(() => {
    const sampled = resamplePoints(points, 120);
    const values = sampled.map((point) => point.valueUsd);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const padding = (max - min) * 0.12 || Math.max(max * 0.01, 1);
    const x = scaleLinear<number>({
      domain: [sampled[0]?.timestamp ?? 0, sampled.at(-1)?.timestamp ?? 1],
      range: [4, width - 4],
    });
    const y = scaleLinear<number>({
      domain: [min - padding, max + padding],
      range: [height - 4, 8],
    });
    const getX = (point: IChartPoint) => x(point.timestamp);
    const getY = (point: IChartPoint) => y(point.valueUsd);

    return {
      xScale: x,
      yScale: y,
      linePath: line<IChartPoint>({ x: getX, y: getY, curve: curveMonotoneX })(sampled) ?? '',
      areaPath:
        area<IChartPoint>({ x: getX, y0: height, y1: getY, curve: curveMonotoneX })(sampled) ?? '',
    };
  }, [points, width, height]);

  const handlePointer = (event: PointerEvent<SVGSVGElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const timestamp = xScale.invert(event.clientX - bounds.left);

    setHovered(findNearestPoint(points, timestamp));
  };

  const handleKeyDown = (event: KeyboardEvent<SVGSVGElement>) => {
    const step = Math.max(1, Math.round(points.length / 48));
    const index = hovered ? points.indexOf(hovered) : points.length - 1;
    const nextIndex = {
      ArrowLeft: index - step,
      ArrowRight: index + step,
      Home: 0,
      End: points.length - 1,
    }[event.key];

    if (nextIndex == null) return;

    event.preventDefault();
    setHovered(points[Math.min(Math.max(nextIndex, 0), points.length - 1)] ?? null);
  };

  const cursorX = hovered ? xScale(hovered.timestamp) : 0;
  const cursorY = hovered ? yScale(hovered.valueUsd) : 0;
  const morph: Transition = shouldReduceMotion
    ? { duration: 0 }
    : { duration: 0.4, ease: [0.4, 0, 0.2, 1] };

  return (
    <>
      <ChartImage
        width={width}
        height={height}
        onPointerDown={handlePointer}
        onPointerMove={handlePointer}
        onPointerLeave={() => setHovered(null)}
        onPointerCancel={() => setHovered(null)}
        tabIndex={0}
        onFocus={() => setHovered((current) => current ?? points.at(-1) ?? null)}
        onBlur={() => setHovered(null)}
        onKeyDown={handleKeyDown}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
            <stop
              offset="0%"
              style={{ stopColor: stroke, stopOpacity: trend === 'flat' ? 0.08 : 0.22 }}
            />
            <stop offset="100%" style={{ stopColor: stroke, stopOpacity: 0 }} />
          </linearGradient>
        </defs>
        <ChartArea
          d={areaPath}
          fill={`url(#${gradientId})`}
          initial={shouldReduceMotion ? false : { opacity: 0, d: areaPath }}
          animate={{ d: areaPath, opacity: 1 }}
          transition={{
            d: morph,
            opacity: { duration: shouldReduceMotion ? 0 : 0.5, delay: 0.15 },
          }}
        />
        <ChartLine
          d={linePath}
          style={{ stroke }}
          initial={shouldReduceMotion ? false : { pathLength: 0, d: linePath }}
          animate={{ d: linePath, pathLength: 1 }}
          transition={{
            d: morph,
            pathLength: { duration: shouldReduceMotion ? 0 : 0.6, ease: [0.4, 0, 0.2, 1] },
          }}
        />
        {hovered && (
          <>
            <CursorLine x1={cursorX} x2={cursorX} y1={0} y2={height} />
            <CursorDot cx={cursorX} cy={cursorY} r={5} style={{ fill: stroke }} />
          </>
        )}
      </ChartImage>
      {hovered && (
        <TooltipContainer
          style={{
            transform: `translate(${Math.min(Math.max(cursorX - 70, 0), Math.max(width - 150, 0))}px, ${
              cursorY > 70 ? cursorY - 64 : cursorY + 14
            }px)`,
          }}
        >
          <TooltipValueText $textTheme="semi">{formatUsd(hovered.valueUsd)}</TooltipValueText>
          <TooltipTimeText>{formatChartTime(hovered.timestamp, period)}</TooltipTimeText>
        </TooltipContainer>
      )}
    </>
  );
};
