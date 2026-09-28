import { type RefObject, useEffect, useState } from 'react';

export const useElementSize = <T extends HTMLElement>(ref: RefObject<T | null>) => {
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const element = ref.current;

    if (!element) return;

    const observer = new ResizeObserver(([entry]) => {
      if (!entry) return;

      const { width, height } = entry.contentRect;

      setSize((current) =>
        current.width === width && current.height === height ? current : { width, height },
      );
    });

    observer.observe(element);

    return () => observer.disconnect();
  }, [ref]);

  return size;
};
