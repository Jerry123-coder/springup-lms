"use client";

import { createContext, useContext } from "react";

interface DashboardUser {
  userName: string;
  role: string;
}

const DashboardUserContext = createContext<DashboardUser>({
  userName: "User",
  role: "student",
});

export function DashboardUserProvider({
  children,
  userName,
  role,
}: {
  children: React.ReactNode;
  userName: string;
  role: string;
}) {
  return (
    <DashboardUserContext.Provider value={{ userName, role }}>
      {children}
    </DashboardUserContext.Provider>
  );
}

export function useDashboardUser() {
  return useContext(DashboardUserContext);
}
