"use client";

import { UserSettings } from "../components/user-settings";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { UserRole } from "@prisma/client";

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [pageLoaded, setPageLoaded] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    // 检查用户是否已登录
    if (status === "unauthenticated") {
      router.push("/auth/login");
    } else if (status === "authenticated" && session?.user?.id) {
      // 获取用户角色信息
      fetchUserInfo(session.user.id);
      setPageLoaded(true);
    }
  }, [status, router, session]);

  const fetchUserInfo = async (userId: string) => {
    try {
      const response = await fetch(`/api/users/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setUserRole(data.role);
      }
    } catch (error) {
      console.error("获取用户信息失败", error);
    }
  };

  if (!pageLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>加载中...</p>
      </div>
    );
  }

  const isRoot = userRole === UserRole.ROOT;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">账户设置</h1>
      <UserSettings />
      
      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-2">导航</h2>
        <div className="space-y-2">
          <div>
            <a href="/" className="text-blue-600 hover:text-blue-800">
              返回首页
            </a>
          </div>
          
          {/* ROOT用户可以看到用户管理链接 */}
          {isRoot && (
            <div>
              <a href="/users" className="text-blue-600 hover:text-blue-800">
                用户管理
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 