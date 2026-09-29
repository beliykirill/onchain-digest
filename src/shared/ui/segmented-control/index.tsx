import { type KeyboardEvent, useId, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';
import { Layout, SegmentButton, SegmentIndicator, SegmentText } from './styled';
import type { ISegmentOption } from './types';

interface SegmentedControlProps<T extends string> {
  options: ISegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
}

export const SegmentedControl = <T extends string>({
  options,
  value,
  onChange,
}: SegmentedControlProps<T>) => {
  const layoutId = useId();
  const shouldReduceMotion = useReducedMotion();
  const buttonsRef = useRef<(HTMLButtonElement | null)[]>([]);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;

    event.preventDefault();

    const index = options.findIndex((option) => option.value === value);
    const nextIndex =
      (index + (event.key === 'ArrowRight' ? 1 : -1) + options.length) % options.length;
    const next = options[nextIndex];

    if (!next) return;

    onChange(next.value);
    buttonsRef.current[nextIndex]?.focus();
  };

  return (
    <Layout onKeyDown={handleKeyDown}>
      {options.map((option, index) => {
        const isActive = option.value === value;

        return (
          <SegmentButton
            key={option.value}
            ref={(node) => {
              buttonsRef.current[index] = node;
            }}
            type="button"
            $isActive={isActive}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onChange(option.value)}
          >
            {isActive && (
              <SegmentIndicator
                layoutId={layoutId}
                transition={
                  shouldReduceMotion
                    ? { duration: 0 }
                    : { type: 'spring', stiffness: 520, damping: 38, mass: 0.8 }
                }
              />
            )}
            <SegmentText>{option.label}</SegmentText>
          </SegmentButton>
        );
      })}
    </Layout>
  );
};
