"use client";

import { UserSettings } from "../components/user-settings";
import { useSession, signOut } from "next-auth/react";
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

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/auth/login");
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
        <h2 className="text-lg font-semibold mb-4">系统设置</h2>
        
        <div className="space-y-4">
          {/* ROOT用户可以看到用户管理链接 */}
          {isRoot && (
            <div className="p-4 bg-white rounded-md shadow">
              <h3 className="text-md font-medium mb-2">用户管理</h3>
              <p className="text-sm text-gray-600 mb-3">
                管理系统用户账户、权限以及密码
              </p>
              <button
                onClick={() => router.push("/users")}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                用户管理
              </button>
            </div>
          )}
          
          {/* 退出登录按钮 */}
          <div className="p-4 bg-white rounded-md shadow">
            <h3 className="text-md font-medium mb-2">退出登录</h3>
            <p className="text-sm text-gray-600 mb-3">
              退出当前账号并返回登录页面
            </p>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              退出登录
            </button>
          </div>
          
          {/* 返回首页链接 */}
          <div className="mt-4">
            <a href="/" className="text-indigo-600 hover:text-indigo-800">
              返回首页
            </a>
          </div>
        </div>
      </div>
    </div>
  );
} 