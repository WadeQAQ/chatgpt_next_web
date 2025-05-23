import NextAuth from "next-auth";
import { authOptions } from "@/app/lib/auth";

// 确保路由动态渲染
export const dynamic = 'force-dynamic';

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST }; 