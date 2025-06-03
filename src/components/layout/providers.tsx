'use client';

import { ReactNode, useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { SessionProvider } from 'next-auth/react';
import { store } from '@/redux/store';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Toaster } from 'sonner';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch by only rendering after component is mounted
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <SessionProvider>
      <Provider store={store}>
        {children}
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
        <Toaster position="top-right" />
      </Provider>
    </SessionProvider>
  );
} 