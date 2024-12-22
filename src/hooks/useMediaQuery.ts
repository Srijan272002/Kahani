import { useState, useEffect, useMemo } from 'react';

type MediaQueryObject = {
  [key: string]: string | number | boolean;
};

type MediaQueryInput = string | MediaQueryObject;

function parseMediaQuery(query: MediaQueryInput): string {
  if (typeof query === 'string') {
    return query;
  }

  return Object.entries(query)
    .map(([feature, value]) => {
      // Convert camelCase to kebab-case
      const kebabFeature = feature.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();

      // Handle boolean values
      if (typeof value === 'boolean') {
        return value ? kebabFeature : `not ${kebabFeature}`;
      }

      // Handle number values (add px if it's a number)
      const unit = typeof value === 'number' ? 'px' : '';
      return `(${kebabFeature}: ${value}${unit})`;
    })
    .join(' and ');
}

export function useMediaQuery(query: MediaQueryInput): boolean {
  const mediaQuery = useMemo(() => parseMediaQuery(query), [query]);
  const [matches, setMatches] = useState<boolean>(() => {
    // Check for SSR
    if (typeof window === 'undefined') {
      return false;
    }
    return window.matchMedia(mediaQuery).matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const mediaQueryList = window.matchMedia(mediaQuery);
    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Set initial value
    setMatches(mediaQueryList.matches);

    // Modern browsers
    if (mediaQueryList.addEventListener) {
      mediaQueryList.addEventListener('change', listener);
      return () => mediaQueryList.removeEventListener('change', listener);
    }
    // Fallback for older browsers
    else {
      mediaQueryList.addListener(listener);
      return () => mediaQueryList.removeListener(listener);
    }
  }, [mediaQuery]);

  return matches;
}

// Predefined breakpoints
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// Helper hooks for common breakpoints
export function useBreakpoint(breakpoint: keyof typeof breakpoints) {
  return useMediaQuery(`(min-width: ${breakpoints[breakpoint]})`);
}

export function useBreakpointRange(min: keyof typeof breakpoints, max: keyof typeof breakpoints) {
  return useMediaQuery(`(min-width: ${breakpoints[min]}) and (max-width: ${breakpoints[max]})`);
}

// Example usage:
/*
// Using string query
function Component() {
  const isWideScreen = useMediaQuery('(min-width: 1200px)');
  const isDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const isPrint = useMediaQuery('print');

  return (
    <div>
      {isWideScreen && <WideScreenLayout />}
      {isDarkMode && <DarkModeStyles />}
      {isPrint && <PrintOptimizedContent />}
    </div>
  );
}

// Using object syntax
function ResponsiveComponent() {
  const isTablet = useMediaQuery({
    minWidth: 768,
    maxWidth: 1024,
    orientation: 'landscape',
  });

  return (
    <div>
      {isTablet && <TabletLayout />}
    </div>
  );
}

// Using predefined breakpoints
function BreakpointAwareComponent() {
  const isLarge = useBreakpoint('lg');
  const isTabletRange = useBreakpointRange('md', 'lg');

  return (
    <div>
      {isLarge && <LargeScreenContent />}
      {isTabletRange && <TabletContent />}
    </div>
  );
}
*/ 