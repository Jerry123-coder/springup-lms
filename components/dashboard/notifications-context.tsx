"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type DashboardNotification = {
  id: string;
  title: string;
  body: string;
  read: boolean;
  href?: string;
  createdAt: string;
};

const Ctx = createContext<{
  items: DashboardNotification[];
  unreadCount: number;
  markRead: (id: string) => void;
  markAllRead: () => void;
  dismiss: (id: string) => void;
} | null>(null);

function defaultSeed(): DashboardNotification[] {
  const now = new Date().toISOString();
  return [
    {
      id: "welcome",
      title: "Welcome to Spring Up",
      body: "Your profile and assignments live in the dashboard. Use the person icon above to update your account.",
      read: false,
      href: undefined,
      createdAt: now,
    },
    {
      id: "tips",
      title: "Tip: track your progress",
      body: "Students can open the learning path and assignment center from the sidebar to stay on track.",
      read: false,
      createdAt: now,
    },
  ];
}

export function NotificationsProvider({
  userId,
  children,
}: {
  userId: string;
  children: React.ReactNode;
}) {
  const storageKey = useMemo(
    () => `springup_notifications_${userId}`,
    [userId]
  );

  const [items, setItems] = useState<DashboardNotification[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw) as DashboardNotification[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setItems(parsed);
          return;
        }
      }
      const seed = defaultSeed();
      setItems(seed);
      localStorage.setItem(storageKey, JSON.stringify(seed));
    } catch {
      setItems(defaultSeed());
    }
  }, [storageKey]);

  const writeStorage = useCallback(
    (next: DashboardNotification[]) => {
      try {
        localStorage.setItem(storageKey, JSON.stringify(next));
      } catch {
        /* ignore */
      }
    },
    [storageKey]
  );

  const markRead = useCallback(
    (id: string) => {
      setItems((prev) => {
        const next = prev.map((n) => (n.id === id ? { ...n, read: true } : n));
        writeStorage(next);
        return next;
      });
    },
    [writeStorage]
  );

  const markAllRead = useCallback(() => {
    setItems((prev) => {
      const next = prev.map((n) => ({ ...n, read: true }));
      writeStorage(next);
      return next;
    });
  }, [writeStorage]);

  const dismiss = useCallback(
    (id: string) => {
      setItems((prev) => {
        const next = prev.filter((n) => n.id !== id);
        writeStorage(next);
        return next;
      });
    },
    [writeStorage]
  );

  const unreadCount = items.filter((n) => !n.read).length;

  const value = useMemo(
    () => ({ items, unreadCount, markRead, markAllRead, dismiss }),
    [items, unreadCount, markRead, markAllRead, dismiss]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useDashboardNotifications() {
  const v = useContext(Ctx);
  if (!v) {
    return {
      items: [] as DashboardNotification[],
      unreadCount: 0,
      markRead: () => {},
      markAllRead: () => {},
      dismiss: () => {},
    };
  }
  return v;
}
