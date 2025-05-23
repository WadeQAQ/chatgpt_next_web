import { randomBytes } from "crypto";
import { hash, compare } from "bcryptjs";

// 生成安全的API密钥
export function generateApiKey(): string {
  return `nwk_${randomBytes(24).toString("hex")}`;
}

// 哈希API密钥用于存储
export async function hashApiKey(apiKey: string): Promise<string> {
  return await hash(apiKey, 10);
}

// 验证API密钥
export async function verifyApiKey(providedKey: string, storedHashedKey: string): Promise<boolean> {
  return await compare(providedKey, storedHashedKey);
} 