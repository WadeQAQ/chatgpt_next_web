import { PrismaClient, UserRole } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('正在检查root用户...');
  
  // 检查root用户是否存在
  const rootUser = await prisma.user.findUnique({
    where: { username: 'root' }
  });
  
  if (rootUser) {
    console.log('root用户已存在');
    return;
  }
  
  // 创建root用户
  const hashedPassword = await hash('778425Ni', 10);
  
  await prisma.user.create({
    data: {
      username: 'root',
      password: hashedPassword,
      email: 'root@example.com',
      role: UserRole.ROOT
    }
  });
  
  console.log('root用户创建成功');
}

main()
  .catch((e) => {
    console.error('创建root用户时出错:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 