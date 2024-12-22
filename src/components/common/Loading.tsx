import { Loader } from 'lucide-react';

interface LoadingProps {
  variant?: 'fullscreen' | 'inline';
  text?: string;
}

export default function Loading({ variant = 'inline', text }: LoadingProps) {
  if (variant === 'fullscreen') {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin text-primary-600 mx-auto" />
          {text && (
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">{text}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-4">
      <Loader className="w-6 h-6 animate-spin text-primary-600" />
      {text && (
        <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
          {text}
        </span>
      )}
    </div>
  );
} 