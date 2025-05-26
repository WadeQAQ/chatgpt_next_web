// 初始化root用户脚本，确保系统中存在一个root管理员账户
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('正在检查root用户...');
  
  // 从环境变量获取root用户名和密码
  const rootUsername = process.env.ROOT_USERNAME;
  const rootPassword = process.env.ROOT_PASSWORD;
  
  // 检查root用户是否存在
  const rootUser = await prisma.user.findUnique({
    where: { username: rootUsername }
  });
  
  if (rootUser) {
    console.log(`${rootUsername}用户已存在`);
    return;
  }
  
  // 创建root用户
  const hashedPassword = await bcrypt.hash(rootPassword, 12);
  
  await prisma.user.create({
    data: {
      username: rootUsername,
      password: hashedPassword,
      email: `${rootUsername}@example.com`,
      role: 'ROOT'
    }
  });
  
  console.log(`${rootUsername}用户创建成功`);
}

// 执行初始化
main()
  .catch((e) => {
    console.error('创建root用户时出错:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 