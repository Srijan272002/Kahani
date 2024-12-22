interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorMessage({ message, onRetry, className = '' }: ErrorMessageProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center p-6 rounded-lg 
                 bg-red-50 dark:bg-red-900/20 ${className}`}
      role="alert"
    >
      <svg
        className="w-12 h-12 text-red-500 dark:text-red-400 mb-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      </svg>
      <p className="text-red-700 dark:text-red-200 text-center mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg 
                   transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 
                   focus:ring-offset-2 dark:focus:ring-offset-gray-900"
        >
          Try Again
        </button>
      )}
    </div>
  );
} 