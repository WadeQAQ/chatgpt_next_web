import { NextRequest, NextResponse } from "next/server";
import { initializeSystem } from "@/app/lib/init";

// 确保路由动态渲染
export const dynamic = 'force-dynamic';

// 系统初始化状态
let isInitialized = false;

export async function GET(request: NextRequest) {
  try {
    // 防止重复初始化
    if (isInitialized) {
      return NextResponse.json({ message: "系统已初始化" }, { status: 200 });
    }

    // 执行初始化操作
    const rootUser = await initializeSystem();
    isInitialized = true;

    if (rootUser) {
      const { password, ...userWithoutPassword } = rootUser;
      return NextResponse.json({ 
        message: "系统初始化成功，已创建root用户", 
        user: userWithoutPassword 
      }, { status: 200 });
    } else {
      return NextResponse.json({ message: "系统已初始化过，无需重复操作" }, { status: 200 });
    }
  } catch (error) {
    console.error("系统初始化失败:", error);
    return NextResponse.json({ error: "系统初始化失败" }, { status: 500 });
  }
} 