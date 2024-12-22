import { useState, useEffect, useCallback } from 'react';

interface WindowSize {
  width: number;
  height: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

interface UseWindowSizeOptions {
  debounceDelay?: number;
  mobileBreakpoint?: number;
  tabletBreakpoint?: number;
}

const DEFAULT_OPTIONS: UseWindowSizeOptions = {
  debounceDelay: 250,
  mobileBreakpoint: 640,
  tabletBreakpoint: 1024,
};

function getWindowSize(mobileBreakpoint: number, tabletBreakpoint: number): WindowSize {
  const width = window.innerWidth;
  const height = window.innerHeight;

  return {
    width,
    height,
    isMobile: width < mobileBreakpoint,
    isTablet: width >= mobileBreakpoint && width < tabletBreakpoint,
    isDesktop: width >= tabletBreakpoint,
  };
}

export function useWindowSize(options: UseWindowSizeOptions = {}) {
  const { debounceDelay, mobileBreakpoint, tabletBreakpoint } = {
    ...DEFAULT_OPTIONS,
    ...options,
  };

  const [windowSize, setWindowSize] = useState<WindowSize>(() =>
    getWindowSize(mobileBreakpoint!, tabletBreakpoint!)
  );

  const handleResize = useCallback(() => {
    setWindowSize(getWindowSize(mobileBreakpoint!, tabletBreakpoint!));
  }, [mobileBreakpoint, tabletBreakpoint]);

  useEffect(() => {
    let timeoutId: number;

    const debouncedHandleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = window.setTimeout(handleResize, debounceDelay);
    };

    window.addEventListener('resize', debouncedHandleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', debouncedHandleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, [debounceDelay, handleResize]);

  return windowSize;
}

// Example usage:
/*
function ResponsiveComponent() {
  const { width, height, isMobile, isTablet, isDesktop } = useWindowSize({
    debounceDelay: 500,
    mobileBreakpoint: 768,
    tabletBreakpoint: 1280,
  });

  return (
    <div>
      <p>Window width: {width}px</p>
      <p>Window height: {height}px</p>
      {isMobile && <p>Mobile view</p>}
      {isTablet && <p>Tablet view</p>}
      {isDesktop && <p>Desktop view</p>}
    </div>
  );
}

// With custom breakpoints
function CustomBreakpoints() {
  const { isMobile } = useWindowSize({
    mobileBreakpoint: 960, // Custom mobile breakpoint
  });

  return (
    <div>
      {isMobile ? (
        <MobileNavigation />
      ) : (
        <DesktopNavigation />
      )}
    </div>
  );
}
*/ 