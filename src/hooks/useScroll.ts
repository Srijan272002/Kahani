import { useState, useEffect, useCallback, useRef } from 'react';

interface ScrollPosition {
  x: number;
  y: number;
  direction: 'up' | 'down' | 'none';
  progress: number;
}

interface UseScrollOptions {
  element?: React.RefObject<HTMLElement>;
  debounceDelay?: number;
  threshold?: number;
  onScroll?: (position: ScrollPosition) => void;
}

const DEFAULT_OPTIONS: UseScrollOptions = {
  debounceDelay: 50,
  threshold: 50,
};

function getScrollPosition(element?: HTMLElement | null): ScrollPosition {
  if (element) {
    const { scrollLeft, scrollTop, scrollHeight, clientHeight } = element;
    return {
      x: scrollLeft,
      y: scrollTop,
      direction: 'none' as const,
      progress: scrollTop / (scrollHeight - clientHeight) || 0,
    };
  }

  const { pageXOffset, pageYOffset, innerHeight } = window;
  const { scrollHeight } = document.documentElement;

  return {
    x: pageXOffset,
    y: pageYOffset,
    direction: 'none' as const,
    progress: pageYOffset / (scrollHeight - innerHeight) || 0,
  };
}

export function useScroll(options: UseScrollOptions = {}) {
  const { element, debounceDelay, threshold, onScroll } = {
    ...DEFAULT_OPTIONS,
    ...options,
  };

  const [scrollPosition, setScrollPosition] = useState<ScrollPosition>(() =>
    getScrollPosition(element?.current)
  );

  const lastScrollPosition = useRef(scrollPosition.y);
  const timeoutId = useRef<number>();

  const handleScroll = useCallback(() => {
    const currentPosition = getScrollPosition(element?.current);
    const lastPosition = lastScrollPosition.current;

    // Determine scroll direction
    const difference = currentPosition.y - lastPosition;
    const direction = Math.abs(difference) < (threshold || 0)
      ? ('none' as const)
      : difference > 0
      ? ('down' as const)
      : ('up' as const);

    const newPosition: ScrollPosition = { ...currentPosition, direction };

    setScrollPosition(newPosition);
    onScroll?.(newPosition);
    lastScrollPosition.current = currentPosition.y;
  }, [element, threshold, onScroll]);

  const debouncedHandleScroll = useCallback(() => {
    if (timeoutId.current) {
      window.clearTimeout(timeoutId.current);
    }

    timeoutId.current = window.setTimeout(handleScroll, debounceDelay);
  }, [handleScroll, debounceDelay]);

  useEffect(() => {
    const target = element?.current || window;
    target.addEventListener('scroll', debouncedHandleScroll);

    return () => {
      if (timeoutId.current) {
        window.clearTimeout(timeoutId.current);
      }
      target.removeEventListener('scroll', debouncedHandleScroll);
    };
  }, [element, debouncedHandleScroll]);

  const scrollTo = useCallback(
    (options: ScrollToOptions) => {
      const target = element?.current || window;
      target.scrollTo({
        behavior: 'smooth',
        ...options,
      });
    },
    [element]
  );

  const scrollToTop = useCallback(() => {
    scrollTo({ top: 0 });
  }, [scrollTo]);

  const scrollToBottom = useCallback(() => {
    const target = element?.current;
    if (target) {
      scrollTo({ top: target.scrollHeight - target.clientHeight });
    } else {
      scrollTo({
        top: document.documentElement.scrollHeight - window.innerHeight,
      });
    }
  }, [element, scrollTo]);

  return {
    ...scrollPosition,
    scrollTo,
    scrollToTop,
    scrollToBottom,
  };
}

// Example usage:
/*
// Window scroll
function ScrollProgress() {
  const { y, direction, progress } = useScroll({
    threshold: 100,
    onScroll: (pos) => console.log(`Scrolled ${pos.direction}`),
  });

  return (
    <div>
      <p>Scroll position: {y}px</p>
      <p>Scroll direction: {direction}</p>
      <p>Scroll progress: {(progress * 100).toFixed(0)}%</p>
    </div>
  );
}

// Element scroll
function ScrollableContent() {
  const contentRef = useRef<HTMLDivElement>(null);
  const { progress, scrollToTop } = useScroll({
    element: contentRef,
    debounceDelay: 100,
  });

  return (
    <>
      <div
        ref={contentRef}
        style={{ height: '400px', overflow: 'auto' }}
      >
        {/* Scrollable content *//*}
      </div>
      {progress > 0.5 && (
        <button onClick={scrollToTop}>
          Back to top
        </button>
      )}
    </>
  );
}
*/ 