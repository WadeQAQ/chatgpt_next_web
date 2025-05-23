"use client";

import { ReactNode, useEffect } from "react";
import { SessionProvider, useSession } from "next-auth/react";
import { useAuthStore } from "@/app/store/authStore";

// NextAuth会话状态同步器
function AuthStateSync() {
  const { data: session, status } = useSession();
  const { setUser, setLoading } = useAuthStore();

  useEffect(() => {
    setLoading(status === "loading");

    if (status === "authenticated" && session?.user) {
      setUser(session.user);
    } else if (status === "unauthenticated") {
      setUser(null);
    }
  }, [session, status, setUser, setLoading]);

  return null;
}

// 认证状态提供者
export default function AuthProvider({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <AuthStateSync />
      {children}
    </SessionProvider>
  );
} 