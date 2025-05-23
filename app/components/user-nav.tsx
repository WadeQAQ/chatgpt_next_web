"use client";

import { useState, useEffect } from "react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { UserRole } from "@prisma/client";

interface UserInfo {
  id: string;
  username: string;
  email?: string;
  role: UserRole;
}

export default function UserNav() {
  const { data: session, status } = useSession();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  
  useEffect(() => {
    // 当会话加载完成并且有用户ID时获取用户信息
    if (status === "authenticated" && session?.user?.id) {
      fetchUserInfo(session.user.id);
    }
  }, [session, status]);

  const fetchUserInfo = async (userId: string) => {
    try {
      const response = await fetch(`/api/users/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setUserInfo(data);
      }
    } catch (error) {
      console.error("获取用户信息失败", error);
    }
  };

  const handleLogout = async () => {
    setShowDropdown(false);
    await signOut({ callbackUrl: "/auth/login" });
  };

  // 如果会话加载中，显示加载状态
  if (status === "loading") {
    return <div className="h-8 w-8 rounded-full bg-gray-300 animate-pulse"></div>;
  }

  // 如果没有登录，显示登录和注册链接
  if (status === "unauthenticated") {
    return (
      <div className="flex gap-2 items-center">
        <Link 
          href="/auth/login" 
          className="px-3 py-1 text-sm rounded-md hover:bg-gray-100"
        >
          登录
        </Link>
        <Link 
          href="/auth/register" 
          className="px-3 py-1 text-sm text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
        >
          注册
        </Link>
      </div>
    );
  }

  return (
    <div className="relative">
      <button 
        className="flex items-center gap-2 hover:opacity-80"
        onClick={() => setShowDropdown(!showDropdown)}
      >
        <div className="h-8 w-8 rounded-full bg-indigo-600 text-white flex items-center justify-center">
          {userInfo?.username?.charAt(0).toUpperCase() || 
           session?.user?.username?.charAt(0).toUpperCase() || 
           "U"}
        </div>
        <span className="text-sm font-medium hidden sm:inline">
          {userInfo?.username || session?.user?.username}
          {userInfo?.role === "ROOT" && (
            <span className="ml-1 text-xs text-purple-600 font-semibold">(管理员)</span>
          )}
        </span>
      </button>

      {showDropdown && (
        <>
          {/* 点击外部关闭下拉菜单 */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setShowDropdown(false)}
          />
          
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-20">
            <div className="py-1">
              <div className="px-4 py-2 border-b">
                <p className="text-sm font-medium">{userInfo?.username}</p>
                {userInfo?.email && (
                  <p className="text-xs text-gray-500">{userInfo.email}</p>
                )}
                <p className="text-xs mt-1 bg-gray-100 px-2 py-1 rounded inline-block">
                  {userInfo?.role === "ROOT" ? "管理员" : "普通用户"}
                </p>
              </div>
              
              <Link 
                href="/settings"
                className="block px-4 py-2 text-sm hover:bg-gray-100"
                onClick={() => setShowDropdown(false)}
              >
                账户设置
              </Link>
              
              {userInfo?.role === "ROOT" && (
                <Link 
                  href="/users"
                  className="block px-4 py-2 text-sm hover:bg-gray-100"
                  onClick={() => setShowDropdown(false)}
                >
                  用户管理
                </Link>
              )}
              
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
              >
                退出登录
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
} 