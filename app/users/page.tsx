"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { UserRole } from "@prisma/client";

export default function UsersRedirectPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    // 检查用户是否已登录并有ROOT权限
    if (status === "authenticated") {
      if (session?.user?.role === UserRole.ROOT) {
        // 重定向到设置页面，并跳转到用户管理部分
        router.push("/settings#user-management");
      } else {
        // 非ROOT用户无权访问，重定向到首页
        router.push("/");
      }
    } else if (status === "unauthenticated") {
      // 未登录用户重定向到登录页面
      router.push("/auth/login");
    }
  }, [status, session, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>正在重定向...</p>
    </div>
  );
} 