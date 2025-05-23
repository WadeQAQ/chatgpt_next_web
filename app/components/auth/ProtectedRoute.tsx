"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/app/store/authStore";

interface ProtectedRouteProps {
  children: ReactNode;
  requireRoot?: boolean;
}

export default function ProtectedRoute({ children, requireRoot = false }: ProtectedRouteProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading, isRoot } = useAuthStore();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push("/auth/login");
      } else if (requireRoot && !isRoot()) {
        router.push("/"); // 没有权限，重定向到首页
      }
    }
  }, [isAuthenticated, isLoading, isRoot, requireRoot, router]);

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">加载中...</div>;
  }

  if (!isAuthenticated) {
    return null; // 未登录，等待重定向
  }

  if (requireRoot && !isRoot()) {
    return null; // 需要ROOT权限但没有，等待重定向
  }

  return <>{children}</>;
} 