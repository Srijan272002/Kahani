import React from 'react';
import { Toaster } from 'react-hot-toast';

interface ToastProviderProps {
  children: React.ReactNode;
}

const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  return (
    <>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'var(--toast-bg)',
            color: 'var(--toast-color)',
          },
          success: {
            iconTheme: {
              primary: 'var(--toast-success)',
              secondary: 'white',
            },
          },
          error: {
            iconTheme: {
              primary: 'var(--toast-error)',
              secondary: 'white',
            },
          },
        }}
      />
    </>
  );
};

export default ToastProvider; 