"use client";

import { createContext, useContext, useMemo, useState } from "react";

type NavShellContextValue = {
  navOpen: boolean;
  setNavOpen: (value: boolean) => void;
  toggleNav: () => void;
};

const NavShellContext = createContext<NavShellContextValue | null>(null);

export function NavShellProvider({ children }: { children: React.ReactNode }) {
  const [navOpen, setNavOpen] = useState(true);

  const value = useMemo(
    () => ({
      navOpen,
      setNavOpen,
      toggleNav: () => setNavOpen((prev) => !prev),
    }),
    [navOpen],
  );

  return <NavShellContext.Provider value={value}>{children}</NavShellContext.Provider>;
}

export function useNavShell() {
  const ctx = useContext(NavShellContext);
  if (!ctx) {
    throw new Error("useNavShell must be used inside NavShellProvider");
  }
  return ctx;
}
