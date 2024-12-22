import { useRef, useEffect, useCallback } from 'react';

interface UseFocusOptions {
  trapFocus?: boolean;
  restoreFocus?: boolean;
  autoFocus?: boolean;
  focusFirst?: boolean;
}

const FOCUSABLE_ELEMENTS = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

export function useFocus<T extends HTMLElement>(options: UseFocusOptions = {}) {
  const {
    trapFocus = false,
    restoreFocus = true,
    autoFocus = true,
    focusFirst = false,
  } = options;

  const ref = useRef<T>(null);
  const previousActiveElement = useRef<Element | null>(null);

  // Get all focusable elements within the container
  const getFocusableElements = useCallback(() => {
    if (!ref.current) return [];
    return Array.from(ref.current.querySelectorAll<HTMLElement>(FOCUSABLE_ELEMENTS))
      .filter(el => window.getComputedStyle(el).display !== 'none');
  }, []);

  // Focus the first or last focusable element
  const focusElement = useCallback((first: boolean = true) => {
    const elements = getFocusableElements();
    if (elements.length === 0) return;
    
    const element = first ? elements[0] : elements[elements.length - 1];
    element.focus();
  }, [getFocusableElements]);

  // Handle tab key navigation
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!trapFocus || !ref.current) return;

      const focusableElements = getFocusableElements();
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      const { activeElement } = document;

      const handleTab = () => {
        if (event.shiftKey) {
          // If shift + tab and first element is focused, move to last element
          if (activeElement === firstElement) {
            event.preventDefault();
            lastElement.focus();
          }
        } else {
          // If tab and last element is focused, move to first element
          if (activeElement === lastElement) {
            event.preventDefault();
            firstElement.focus();
          }
        }
      };

      switch (event.key) {
        case 'Tab':
          handleTab();
          break;
        case 'Escape':
          if (restoreFocus && previousActiveElement.current instanceof HTMLElement) {
            previousActiveElement.current.focus();
          }
          break;
      }
    },
    [trapFocus, getFocusableElements, restoreFocus]
  );

  // Initial focus management
  useEffect(() => {
    if (!ref.current) return;

    // Store the currently focused element
    previousActiveElement.current = document.activeElement;

    if (autoFocus) {
      // Focus the container itself if it's focusable
      if (ref.current.tabIndex >= 0) {
        ref.current.focus();
      }
      // Otherwise focus the first focusable element if focusFirst is true
      else if (focusFirst) {
        focusElement(true);
      }
    }

    // Add keyboard event listeners if focus trapping is enabled
    if (trapFocus) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      // Remove keyboard event listeners
      if (trapFocus) {
        document.removeEventListener('keydown', handleKeyDown);
      }

      // Restore focus to the previously focused element
      if (restoreFocus && previousActiveElement.current instanceof HTMLElement) {
        previousActiveElement.current.focus();
      }
    };
  }, [trapFocus, autoFocus, focusFirst, handleKeyDown, focusElement, restoreFocus]);

  return {
    ref,
    focusFirst: () => focusElement(true),
    focusLast: () => focusElement(false),
    getFocusableElements,
  };
}

// Example usage:
/*
function Modal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { ref } = useFocus<HTMLDivElement>({
    trapFocus: true,
    restoreFocus: true,
    autoFocus: true,
  });

  if (!isOpen) return null;

  return (
    <div
      ref={ref}
      role="dialog"
      aria-modal="true"
      tabIndex={-1}
    >
      <button onClick={onClose}>Close</button>
      <input type="text" />
      <button>Submit</button>
    </div>
  );
}

function FocusableContainer() {
  const { ref, focusFirst, focusLast } = useFocus<HTMLDivElement>({
    trapFocus: false,
    autoFocus: false,
  });

  return (
    <>
      <button onClick={focusFirst}>Focus First</button>
      <button onClick={focusLast}>Focus Last</button>
      <div ref={ref}>
        <input type="text" />
        <button>Click me</button>
        <a href="#">Link</a>
      </div>
    </>
  );
}
*/ 