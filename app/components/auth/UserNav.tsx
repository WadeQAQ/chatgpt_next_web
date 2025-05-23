"use client";

import { useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { useAuthStore } from "@/app/store/authStore";
import { UserRole } from "@prisma/client";

export default function UserNav() {
  const { user, isAuthenticated, isLoading, isRoot } = useAuthStore();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = async () => {
    await signOut({ redirect: false });
    window.location.href = "/";
  };

  if (isLoading) {
    return <div className="h-9 w-9 rounded-full bg-gray-200 animate-pulse"></div>;
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="flex gap-2">
        <Link 
          href="/auth/login"
          className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
        >
          登录
        </Link>
        <Link 
          href="/auth/register"
          className="px-4 py-2 text-sm text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
        >
          注册
        </Link>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center gap-2 cursor-pointer"
      >
        <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-white">
          {user.username.charAt(0).toUpperCase()}
        </div>
        <span className="text-sm font-medium">{user.username}</span>
        <span className="text-xs text-gray-500">
          {user.role === UserRole.ROOT ? "(管理员)" : ""}
        </span>
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
          <div className="py-1">
            <div className="px-4 py-2 text-sm text-gray-700 border-b">
              {user.email && <p className="text-xs text-gray-500">{user.email}</p>}
            </div>
            
            {isRoot() && (
              <Link
                href="/admin"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => setShowDropdown(false)}
              >
                管理控制台
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
      )}
    </div>
  );
} 