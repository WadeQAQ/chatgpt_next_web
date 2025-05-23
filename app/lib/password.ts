import { hash } from "bcryptjs";

// 加密密码
export const hashPassword = async (password: string): Promise<string> => {
  const hashedPassword = await hash(password, 12);
  return hashedPassword;
}; 