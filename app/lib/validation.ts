import { z } from "zod";

// 用户注册验证规则
export const registerSchema = z.object({
  username: z
    .string()
    .min(3, { message: "用户名至少需要3个字符" })
    .max(20, { message: "用户名不能超过20个字符" })
    .regex(/^[a-zA-Z0-9_]+$/, { message: "用户名只能包含字母、数字和下划线" }),
  email: z
    .string()
    .email({ message: "请输入有效的电子邮件地址" })
    .optional(),
  password: z
    .string()
    .min(8, { message: "密码至少需要8个字符" })
    .max(100, { message: "密码太长" })
});

// 用户登录验证规则
export const loginSchema = z.object({
  username: z.string().min(1, { message: "请输入用户名" }),
  password: z.string().min(1, { message: "请输入密码" })
});

// API密钥验证规则
export const apiKeySchema = z.object({
  name: z
    .string()
    .min(1, { message: "密钥名称不能为空" })
    .max(50, { message: "密钥名称不能超过50个字符" }),
  expiration: z
    .string()
    .optional()
    .transform((val) => (val ? new Date(val) : undefined))
}); 