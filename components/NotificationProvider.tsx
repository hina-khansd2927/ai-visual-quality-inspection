'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

interface Notification {
  type: 'success' | 'error';
  message: string;
}

interface NotificationContextValue {
  notification: Notification | null;
  showNotification: (type: 'success' | 'error', message: string) => void;
  dismissNotification: () => void;
}

const NotificationContext = createContext<NotificationContextValue | null>(
  null
);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notification, setNotification] = useState<Notification | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dismissNotification = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setNotification(null);
  }, []);

  const showNotification = useCallback(
    (type: 'success' | 'error', message: string) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      setNotification({ type, message });
      timerRef.current = setTimeout(() => {
        setNotification((curr) =>
          curr?.message === message ? null : curr
        );
      }, 5000);
    },
    []
  );

  const value = useMemo(
    () => ({ notification, showNotification, dismissNotification }),
    [notification, showNotification, dismissNotification]
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification(): NotificationContextValue {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error(
      'useNotification must be used within a NotificationProvider'
    );
  }
  return ctx;
}
