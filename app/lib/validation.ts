import { z } from "zod";

// 登录表单验证
export const loginSchema = z.object({
  username: z.string().min(1, "用户名不能为空"),
  password: z.string().min(1, "密码不能为空"),
});

// 注册表单验证
export const registerSchema = z.object({
  username: z
    .string()
    .min(3, "用户名至少需要3个字符")
    .max(20, "用户名不能超过20个字符")
    .regex(/^[a-zA-Z0-9_-]+$/, "用户名只能包含字母、数字、下划线和连字符"),
  email: z
    .string()
    .email("请输入有效的电子邮箱地址")
    .optional()
    .nullable(),
  password: z
    .string()
    .min(8, "密码至少需要8个字符")
    .max(100, "密码不能超过100个字符"),
});

// 更新用户验证
export const updateUserSchema = z.object({
  username: z
    .string()
    .min(3, "用户名至少需要3个字符")
    .max(20, "用户名不能超过20个字符")
    .regex(/^[a-zA-Z0-9_-]+$/, "用户名只能包含字母、数字、下划线和连字符")
    .optional(),
  email: z
    .string()
    .email("请输入有效的电子邮箱地址")
    .optional()
    .nullable(),
  password: z
    .string()
    .min(8, "密码至少需要8个字符")
    .max(100, "密码不能超过100个字符")
    .optional(),
  currentPassword: z
    .string()
    .min(1, "当前密码不能为空")
    .optional(),
});

// 更新用户设置验证
export const updateSettingsSchema = z.object({
  theme: z.enum(["light", "dark", "auto"]).optional(),
  language: z.string().optional(),
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