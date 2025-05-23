"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { UserRole } from "@prisma/client";

interface User {
  id: string;
  username: string;
  email: string | null;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
  _count: {
    apiKeys: number;
  };
}

export default function UsersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);

  useEffect(() => {
    // 如果未登录，重定向到登录页面
    if (status === "unauthenticated") {
      router.push("/auth/login");
      return;
    }

    // 只有认证状态明确后才加载数据
    if (status === "authenticated") {
      fetchUsers();
    }
  }, [status, router]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/users");
      
      if (response.status === 403) {
        // 如果是权限问题，重定向到首页
        router.push("/");
        return;
      }
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "获取用户列表失败");
      }
      
      const data = await response.json();
      setUsers(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "获取用户列表时出错");
      console.error("获取用户列表错误:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "更新用户角色失败");
      }

      // 更新本地用户列表
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId ? { ...user, role: newRole } : user
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "更新用户角色时出错");
      console.error("更新用户角色错误:", err);
    }
  };

  const confirmDelete = (userId: string) => {
    setDeleteUserId(userId);
  };

  const cancelDelete = () => {
    setDeleteUserId(null);
  };

  const handleDelete = async (userId: string) => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "删除用户失败");
      }

      // 从本地用户列表中移除
      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
      setDeleteUserId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "删除用户时出错");
      console.error("删除用户错误:", err);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">用户管理</h1>
        <div className="text-center py-8">加载中...</div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">用户管理</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="overflow-x-auto bg-white shadow-md rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                用户名
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                邮箱
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                角色
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                创建时间
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {user.username}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.email || "-"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    user.role === "ROOT" ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"
                  }`}>
                    {user.role === "ROOT" ? "管理员" : "普通用户"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  {/* 只有当前用户不是ROOT时，才显示切换角色按钮 */}
                  {session?.user?.id !== user.id && (
                    <button
                      onClick={() => handleRoleChange(user.id, user.role === "ROOT" ? "USER" : "ROOT")}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      {user.role === "ROOT" ? "降为普通用户" : "设为管理员"}
                    </button>
                  )}
                  
                  {/* 只能删除非自己的用户 */}
                  {session?.user?.id !== user.id && (
                    <>
                      {deleteUserId === user.id ? (
                        <div className="inline-flex space-x-2">
                          <button
                            onClick={() => handleDelete(user.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            确认删除
                          </button>
                          <button
                            onClick={cancelDelete}
                            className="text-gray-600 hover:text-gray-900"
                          >
                            取消
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => confirmDelete(user.id)}
                          className="text-red-600 hover:text-red-900 ml-4"
                        >
                          删除
                        </button>
                      )}
                    </>
                  )}
                </td>
              </tr>
            ))}

            {users.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                  没有找到用户
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
} 