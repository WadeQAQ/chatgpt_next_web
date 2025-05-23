import React from "react";
import { Analytics } from "@vercel/analytics/react";
import { Home } from "./components/home";
import { getServerSideConfig } from "./config/server";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./lib/auth";

const serverConfig = getServerSideConfig();

export default async function App() {
  // 获取用户会话
  const session = await getServerSession(authOptions);

  // 如果用户未登录，重定向到登录页面
  if (!session) {
    redirect("/auth/login");
  }

  return (
    <>
      <Home />
      {serverConfig?.isVercel && (
        <>
          <Analytics />
        </>
      )}
    </>
  );
}
