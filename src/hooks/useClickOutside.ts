import { useEffect, useRef, useCallback } from 'react';

interface UseClickOutsideOptions {
  enabled?: boolean;
  excludeRefs?: React.RefObject<HTMLElement>[];
}

export function useClickOutside<T extends HTMLElement = HTMLElement>(
  callback: (event: MouseEvent | TouchEvent) => void,
  options: UseClickOutsideOptions = {}
) {
  const { enabled = true, excludeRefs = [] } = options;
  const ref = useRef<T>(null);
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  const handleClick = useCallback(
    (event: MouseEvent | TouchEvent) => {
      if (!enabled) return;

      const target = event.target as Node;
      const element = ref.current;

      // Check if the click was outside the main element
      const isOutside = element && !element.contains(target);

      // Check if the click was inside any excluded elements
      const isInsideExcluded = excludeRefs.some(
        (excludeRef) => excludeRef.current?.contains(target)
      );

      if (isOutside && !isInsideExcluded) {
        savedCallback.current(event);
      }
    },
    [enabled, excludeRefs]
  );

  useEffect(() => {
    if (!enabled) return;

    document.addEventListener('mousedown', handleClick);
    document.addEventListener('touchstart', handleClick);

    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('touchstart', handleClick);
    };
  }, [enabled, handleClick]);

  return ref;
}

// Example usage:
/*
function Dropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  
  const dropdownRef = useClickOutside<HTMLDivElement>(
    () => setIsOpen(false),
    {
      enabled: isOpen,
      excludeRefs: [buttonRef] // Clicks on the button won't close the dropdown
    }
  );

  return (
    <>
      <button ref={buttonRef} onClick={() => setIsOpen(true)}>
        Open Dropdown
      </button>
      {isOpen && (
        <div ref={dropdownRef} className="dropdown">
          Dropdown content
        </div>
      )}
    </>
  );
}

// With TypeScript strict mode
function Modal({ onClose }: { onClose: () => void }) {
  const modalRef = useClickOutside<HTMLDivElement>(onClose);

  return (
    <div className="modal-overlay">
      <div ref={modalRef} className="modal">
        Modal content
      </div>
    </div>
  );
}
*/ 