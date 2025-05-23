import { useEffect, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { UserRole } from "@prisma/client";

interface UserInfo {
  id: string;
  username: string;
  email: string;
  role: UserRole;
}

export function UserSettings() {
  const { data: session, status } = useSession();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  
  // 密码修改状态
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    const fetchUserInfo = async () => {
      if (status === "authenticated" && session?.user?.id) {
        try {
          const response = await fetch(`/api/users/${session.user.id}`);
          if (response.ok) {
            const data = await response.json();
            setUserInfo(data);
          } else {
            console.error("获取用户信息失败");
          }
        } catch (error) {
          console.error("获取用户信息错误:", error);
        } finally {
          setLoading(false);
        }
      } else if (status !== "loading") {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, [session, status]);

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/auth/login" });
  };
  
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 重置状态
    setPasswordError(null);
    setPasswordSuccess(null);
    setPasswordLoading(true);
    
    // 验证新密码
    if (newPassword.length < 8) {
      setPasswordError("新密码至少需要8个字符");
      setPasswordLoading(false);
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordError("两次输入的密码不一致");
      setPasswordLoading(false);
      return;
    }
    
    try {
      // 发送密码更新请求
      const response = await fetch(`/api/users/${session?.user?.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword,
          password: newPassword,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "修改密码失败");
      }
      
      // 成功后清空表单并显示成功消息
      setPasswordSuccess("密码修改成功");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      
      // 3秒后隐藏密码修改表单
      setTimeout(() => {
        setShowPasswordChange(false);
        setPasswordSuccess(null);
      }, 3000);
      
    } catch (error) {
      if (error instanceof Error) {
        setPasswordError(error.message);
      } else {
        setPasswordError("修改密码时发生错误");
      }
    } finally {
      setPasswordLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="p-4 text-center">
        <p>加载中...</p>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="p-4 text-center">
        <p>未登录</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">用户设置</h2>
      
      {userInfo ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">用户名</label>
            <p className="mt-1 text-lg">{userInfo.username}</p>
          </div>
          
          {userInfo.email && (
            <div>
              <label className="block text-sm font-medium text-gray-700">电子邮箱</label>
              <p className="mt-1 text-lg">{userInfo.email}</p>
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700">用户角色</label>
            <div className="mt-1">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                userInfo.role === "ROOT" 
                  ? "bg-purple-100 text-purple-800" 
                  : "bg-blue-100 text-blue-800"
              }`}>
                {userInfo.role === "ROOT" ? "管理员" : "普通用户"}
              </span>
            </div>
          </div>
          
          {/* 密码修改区域 */}
          <div className="pt-4 border-t border-gray-200">
            {showPasswordChange ? (
              <form onSubmit={handlePasswordChange} className="space-y-4">
                {passwordError && (
                  <div className="p-3 bg-red-100 text-red-700 rounded-md">
                    {passwordError}
                  </div>
                )}
                
                {passwordSuccess && (
                  <div className="p-3 bg-green-100 text-green-700 rounded-md">
                    {passwordSuccess}
                  </div>
                )}
                
                <div>
                  <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                    当前密码
                  </label>
                  <input
                    id="currentPassword"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                    新密码
                  </label>
                  <input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                    确认新密码
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                
                <div className="flex space-x-2">
                  <button
                    type="submit"
                    disabled={passwordLoading}
                    className="px-4 py-2 text-white bg-indigo-600 rounded hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  >
                    {passwordLoading ? "提交中..." : "更新密码"}
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setShowPasswordChange(false)}
                    className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                  >
                    取消
                  </button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => setShowPasswordChange(true)}
                className="px-4 py-2 text-indigo-600 border border-indigo-600 rounded hover:bg-indigo-50"
              >
                修改密码
              </button>
            )}
          </div>
          
          <div className="pt-4">
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              退出登录
            </button>
          </div>
        </div>
      ) : (
        <p>无法获取用户信息</p>
      )}
    </div>
  );
} 