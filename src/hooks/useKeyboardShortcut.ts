import { useEffect, useCallback, useRef } from 'react';

type Key = string;
type Modifier = 'ctrl' | 'alt' | 'shift' | 'meta';
type KeyCombo = {
  key: Key;
  modifiers?: Modifier[];
};

interface ShortcutOptions {
  preventDefault?: boolean;
  stopPropagation?: boolean;
  repeat?: boolean;
  enabled?: boolean;
}

const DEFAULT_OPTIONS: ShortcutOptions = {
  preventDefault: true,
  stopPropagation: true,
  repeat: false,
  enabled: true,
};

function normalizeKey(key: string): string {
  return key.toLowerCase();
}

function areModifiersPressed(event: KeyboardEvent, modifiers: Modifier[] = []): boolean {
  const pressedModifiers = {
    ctrl: event.ctrlKey,
    alt: event.altKey,
    shift: event.shiftKey,
    meta: event.metaKey,
  };

  return modifiers.every((modifier) => pressedModifiers[modifier]) &&
    Object.entries(pressedModifiers)
      .filter(([key]) => !modifiers.includes(key as Modifier))
      .every(([, pressed]) => !pressed);
}

export function useKeyboardShortcut(
  shortcut: KeyCombo | KeyCombo[],
  callback: (event: KeyboardEvent) => void,
  options: ShortcutOptions = {}
) {
  const { preventDefault, stopPropagation, repeat, enabled } = {
    ...DEFAULT_OPTIONS,
    ...options,
  };

  const savedCallback = useRef(callback);
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  const shortcuts = Array.isArray(shortcut) ? shortcut : [shortcut];

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;
      if (!repeat && event.repeat) return;

      const matchedShortcut = shortcuts.find(
        (sc) =>
          normalizeKey(event.key) === normalizeKey(sc.key) &&
          areModifiersPressed(event, sc.modifiers)
      );

      if (matchedShortcut) {
        if (preventDefault) event.preventDefault();
        if (stopPropagation) event.stopPropagation();
        savedCallback.current(event);
      }
    },
    [enabled, preventDefault, repeat, shortcuts, stopPropagation]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

// Example usage:
/*
// Single key shortcut
useKeyboardShortcut(
  { key: 'Escape' },
  () => console.log('Escape pressed')
);

// Key combination
useKeyboardShortcut(
  { key: 's', modifiers: ['ctrl'] },
  (e) => {
    console.log('Ctrl+S pressed');
  }
);

// Multiple shortcuts for same action
useKeyboardShortcut(
  [
    { key: '/', modifiers: ['ctrl'] },
    { key: 'f', modifiers: ['ctrl'] }
  ],
  () => {
    console.log('Search shortcut triggered');
  }
);

// With options
useKeyboardShortcut(
  { key: 'a', modifiers: ['ctrl'] },
  () => console.log('Select all'),
  {
    preventDefault: true,
    enabled: !isEditing
  }
);
*/ 