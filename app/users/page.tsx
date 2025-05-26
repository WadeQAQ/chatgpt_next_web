"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { UserRole } from "@prisma/client";
import { generatePassword } from "@/app/lib/password";

interface User {
  id: string;
  username: string;
  email: string | null;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export default function UsersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // 新用户表单状态
  const [newUsername, setNewUsername] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState(generatePassword(12));
  const [isAdding, setIsAdding] = useState(false);
  const [addFormVisible, setAddFormVisible] = useState(false);
  
  // 编辑用户状态
  const [editUserId, setEditUserId] = useState<string | null>(null);
  const [editUsername, setEditUsername] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editRole, setEditRole] = useState<UserRole>(UserRole.USER);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
      return;
    }

    if (status === "authenticated") {
      // 检查用户是否是ROOT
      if (session?.user?.role !== UserRole.ROOT) {
        router.push("/");
        return;
      }
      
      fetchUsers();
    }
  }, [status, session, router]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/users");
      
      if (!response.ok) {
        throw new Error("获取用户列表失败");
      }
      
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "获取用户列表失败");
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAdding(true);
    
    try {
      const response = await fetch("/api/users/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: newUsername,
          email: newEmail || undefined,
          password: newPassword,
          role: UserRole.USER,
        }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "创建用户失败");
      }
      
      // 重新获取用户列表
      await fetchUsers();
      
      // 重置表单
      setNewUsername("");
      setNewEmail("");
      setNewPassword(generatePassword(12));
      setAddFormVisible(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "创建用户失败");
    } finally {
      setIsAdding(false);
    }
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editUserId) return;
    
    setIsEditing(true);
    
    try {
      const response = await fetch(`/api/users/${editUserId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: editUsername,
          email: editEmail || undefined,
          role: editRole,
        }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "更新用户失败");
      }
      
      // 重新获取用户列表
      await fetchUsers();
      
      // 重置编辑状态
      setEditUserId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "更新用户失败");
    } finally {
      setIsEditing(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("确定要删除此用户吗？此操作不可逆。")) {
      return;
    }
    
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "删除用户失败");
      }
      
      // 重新获取用户列表
      await fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "删除用户失败");
    }
  };

  const startEditUser = (user: User) => {
    setEditUserId(user.id);
    setEditUsername(user.username);
    setEditEmail(user.email || "");
    setEditRole(user.role);
  };

  const resetPassword = async (userId: string) => {
    const newPassword = generatePassword(12);
    
    if (!confirm(`确定要重置该用户的密码吗？新密码将是: ${newPassword}`)) {
      return;
    }
    
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password: newPassword,
        }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "重置密码失败");
      }
      
      alert(`密码已成功重置为: ${newPassword}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "重置密码失败");
    }
  };

  if (loading && users.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">用户管理</h1>
        <p>加载中...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">用户管理</h1>
      
      {error && (
        <div className="p-4 mb-4 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      <div className="mb-6">
        <button
          onClick={() => setAddFormVisible(!addFormVisible)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          {addFormVisible ? "取消添加" : "添加用户"}
        </button>
        
        <a href="/settings" className="ml-4 text-indigo-600 hover:text-indigo-800">
          返回设置
        </a>
      </div>
      
      {/* 添加用户表单 */}
      {addFormVisible && (
        <div className="mb-8 p-4 border rounded-md bg-gray-50">
          <h2 className="text-xl font-semibold mb-4">添加新用户</h2>
          
          <form onSubmit={handleAddUser} className="space-y-4">
            <div>
              <label htmlFor="newUsername" className="block text-sm font-medium text-gray-700">
                用户名 *
              </label>
              <input
                id="newUsername"
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                required
                className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md"
              />
            </div>
            
            <div>
              <label htmlFor="newEmail" className="block text-sm font-medium text-gray-700">
                电子邮箱 (可选)
              </label>
              <input
                id="newEmail"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md"
              />
            </div>
            
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                密码 *
              </label>
              <div className="flex">
                <input
                  id="newPassword"
                  type="text"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="flex-1 px-3 py-2 mt-1 border border-gray-300 rounded-md"
                />
                <button
                  type="button"
                  onClick={() => setNewPassword(generatePassword(12))}
                  className="ml-2 px-3 py-2 mt-1 bg-gray-200 rounded-md"
                >
                  生成
                </button>
              </div>
            </div>
            
            <button
              type="submit"
              disabled={isAdding}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              {isAdding ? "添加中..." : "添加用户"}
            </button>
          </form>
        </div>
      )}
      
      {/* 用户列表 */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border rounded-md">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-2 px-4 text-left border-b">用户名</th>
              <th className="py-2 px-4 text-left border-b">邮箱</th>
              <th className="py-2 px-4 text-left border-b">角色</th>
              <th className="py-2 px-4 text-left border-b">创建时间</th>
              <th className="py-2 px-4 text-left border-b">操作</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                {editUserId === user.id ? (
                  // 编辑状态
                  <td colSpan={5} className="py-2 px-4 border-b">
                    <form onSubmit={handleEditUser} className="space-y-4">
                      <div className="flex space-x-4">
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-700">用户名</label>
                          <input
                            type="text"
                            value={editUsername}
                            onChange={(e) => setEditUsername(e.target.value)}
                            required
                            className="w-full px-3 py-1 border border-gray-300 rounded-md"
                          />
                        </div>
                        
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-700">邮箱</label>
                          <input
                            type="email"
                            value={editEmail}
                            onChange={(e) => setEditEmail(e.target.value)}
                            className="w-full px-3 py-1 border border-gray-300 rounded-md"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700">角色</label>
                          <select
                            value={editRole}
                            onChange={(e) => setEditRole(e.target.value as UserRole)}
                            className="w-full px-3 py-1 border border-gray-300 rounded-md"
                          >
                            <option value={UserRole.USER}>普通用户</option>
                            <option value={UserRole.ROOT}>ROOT</option>
                          </select>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <button
                          type="submit"
                          disabled={isEditing}
                          className="px-3 py-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                        >
                          {isEditing ? "保存中..." : "保存"}
                        </button>
                        
                        <button
                          type="button"
                          onClick={() => setEditUserId(null)}
                          className="px-3 py-1 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                        >
                          取消
                        </button>
                      </div>
                    </form>
                  </td>
                ) : (
                  // 查看状态
                  <>
                    <td className="py-2 px-4 border-b">{user.username}</td>
                    <td className="py-2 px-4 border-b">{user.email || "-"}</td>
                    <td className="py-2 px-4 border-b">
                      {user.role === UserRole.ROOT ? "ROOT" : "普通用户"}
                    </td>
                    <td className="py-2 px-4 border-b">
                      {new Date(user.createdAt).toLocaleString()}
                    </td>
                    <td className="py-2 px-4 border-b">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => startEditUser(user)}
                          className="px-2 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                        >
                          编辑
                        </button>
                        
                        <button
                          onClick={() => resetPassword(user.id)}
                          className="px-2 py-1 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700"
                        >
                          重置密码
                        </button>
                        
                        {session?.user?.id !== user.id && (
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="px-2 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                          >
                            删除
                          </button>
                        )}
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 