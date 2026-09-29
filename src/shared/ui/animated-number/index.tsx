import { type FC, useEffect, useRef } from 'react';
import { animate, useReducedMotion } from 'framer-motion';
import { NumberText } from './styled';

interface AnimatedNumberProps {
  value: number;
  format: (value: number) => string;
}

export const AnimatedNumber: FC<AnimatedNumberProps> = ({ value, format }) => {
  const nodeRef = useRef<HTMLSpanElement>(null);
  const currentRef = useRef(0);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const node = nodeRef.current;

    if (!node) return;

    if (shouldReduceMotion) {
      currentRef.current = value;
      node.textContent = format(value);

      return;
    }

    const controls = animate(currentRef.current, value, {
      duration: 0.4,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) => {
        currentRef.current = latest;
        node.textContent = format(latest);
      },
    });

    return () => controls.stop();
  }, [value, format, shouldReduceMotion]);

  return <NumberText ref={nodeRef}>{format(0)}</NumberText>;
};
