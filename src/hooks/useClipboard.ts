import { useState, useCallback, useEffect } from 'react';

interface UseClipboardOptions {
  timeout?: number;
}

interface ClipboardData {
  value: string;
  format: string;
}

export function useClipboard(options: UseClipboardOptions = {}) {
  const { timeout = 2000 } = options;

  const [hasCopied, setHasCopied] = useState(false);
  const [copiedValue, setCopiedValue] = useState<string>('');
  const [error, setError] = useState<Error | null>(null);

  // Reset the copied state after timeout
  useEffect(() => {
    if (!hasCopied) return;

    const timeoutId = window.setTimeout(() => {
      setHasCopied(false);
    }, timeout);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [hasCopied, timeout]);

  // Copy text to clipboard
  const copy = useCallback(
    async (text: string) => {
      try {
        if (navigator.clipboard && window.isSecureContext) {
          // Use modern Clipboard API if available
          await navigator.clipboard.writeText(text);
        } else {
          // Fallback for older browsers
          const textArea = document.createElement('textarea');
          textArea.value = text;
          textArea.style.position = 'fixed';
          textArea.style.left = '-999999px';
          textArea.style.top = '-999999px';
          document.body.appendChild(textArea);
          textArea.focus();
          textArea.select();
          document.execCommand('copy');
          textArea.remove();
        }

        setCopiedValue(text);
        setHasCopied(true);
        setError(null);
        return true;
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to copy text'));
        return false;
      }
    },
    []
  );

  // Read text from clipboard
  const paste = useCallback(async () => {
    try {
      let text: string;

      if (navigator.clipboard && window.isSecureContext) {
        // Use modern Clipboard API if available
        text = await navigator.clipboard.readText();
      } else {
        // Fallback for older browsers
        const result = document.execCommand('paste');
        if (!result) {
          throw new Error('Paste command not supported');
        }
        text = '';
      }

      setError(null);
      return text;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to paste text'));
      return '';
    }
  }, []);

  // Write data with specific format to clipboard
  const copyWithFormat = useCallback(
    async (data: ClipboardData | ClipboardData[]) => {
      try {
        if (!navigator.clipboard?.write) {
          throw new Error('Clipboard API not supported');
        }

        const items = Array.isArray(data) ? data : [data];
        const clipboardItems = items.map(
          ({ value, format }) =>
            new ClipboardItem({
              [format]: new Blob([value], { type: format }),
            })
        );

        await navigator.clipboard.write(clipboardItems);
        setHasCopied(true);
        setError(null);
        return true;
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to copy data'));
        return false;
      }
    },
    []
  );

  // Read data with specific format from clipboard
  const readWithFormat = useCallback(async (format: string) => {
    try {
      if (!navigator.clipboard?.read) {
        throw new Error('Clipboard API not supported');
      }

      const clipboardItems = await navigator.clipboard.read();
      for (const item of clipboardItems) {
        if (item.types.includes(format)) {
          const blob = await item.getType(format);
          const text = await blob.text();
          setError(null);
          return text;
        }
      }

      throw new Error(`No data found with format: ${format}`);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to read data'));
      return '';
    }
  }, []);

  return {
    copy,
    paste,
    copyWithFormat,
    readWithFormat,
    hasCopied,
    copiedValue,
    error,
  };
}

// Example usage:
/*
function CopyButton({ text }: { text: string }) {
  const { copy, hasCopied, error } = useClipboard({ timeout: 3000 });

  return (
    <>
      <button onClick={() => copy(text)}>
        {hasCopied ? 'Copied!' : 'Copy'}
      </button>
      {error && <div className="text-red-500">{error.message}</div>}
    </>
  );
}

function RichContentCopy() {
  const { copyWithFormat, hasCopied } = useClipboard();

  const handleCopy = () => {
    copyWithFormat([
      { value: 'Hello, World!', format: 'text/plain' },
      { value: '<b>Hello, World!</b>', format: 'text/html' }
    ]);
  };

  return (
    <button onClick={handleCopy}>
      {hasCopied ? 'Copied!' : 'Copy Rich Content'}
    </button>
  );
}

function PasteInput() {
  const [value, setValue] = useState('');
  const { paste, error } = useClipboard();

  const handlePaste = async () => {
    const text = await paste();
    setValue(text);
  };

  return (
    <>
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Click button to paste"
      />
      <button onClick={handlePaste}>Paste</button>
      {error && <div className="text-red-500">{error.message}</div>}
    </>
  );
}
*/ 