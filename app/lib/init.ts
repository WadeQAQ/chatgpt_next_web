import { prisma } from "./prisma";
import { hashPassword } from "./password";
import { UserRole } from "@prisma/client";

/**
 * 初始化系统并创建root用户
 * 只有在没有任何用户存在的情况下才会创建root用户
 */
export async function initializeSystem() {
  try {
    // 检查是否已有用户
    const userCount = await prisma.user.count();
    
    if (userCount === 0) {
      // 从环境变量获取root用户信息，如果不存在则使用默认值
      const username = process.env.ROOT_USERNAME || "root";
      const password = process.env.ROOT_PASSWORD || "admin123456";
      const email = process.env.ROOT_EMAIL || "admin@example.com";
      
      // 检查用户名是否已存在（以防万一）
      const existingUser = await prisma.user.findUnique({
        where: { username },
      });
      
      if (!existingUser) {
        // 创建root用户
        const hashedPassword = await hashPassword(password);
        const rootUser = await prisma.user.create({
          data: {
            username,
            email,
            password: hashedPassword,
            role: UserRole.ROOT,
          },
        });
        
        console.log(`已创建root用户: ${username}`);
        return rootUser;
      }
    }
    
    return null;
  } catch (error) {
    console.error("初始化系统失败:", error);
    throw error;
  }
} 