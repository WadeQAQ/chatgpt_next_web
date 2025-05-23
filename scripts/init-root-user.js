// 初始化root用户脚本，确保系统中存在一个root管理员账户
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function initRootUser() {
  try {
    console.log('开始检查root用户...');
    
    // 检查是否存在root用户
    const existingRoot = await prisma.user.findUnique({
      where: { username: 'root' }
    });
    
    if (existingRoot) {
      console.log('root用户已存在，无需创建');
      return;
    }
    
    // 创建root用户
    const hashedPassword = await bcrypt.hash('zU85bsu/cxI0293', 12);
    
    await prisma.user.create({
      data: {
        username: 'root',
        password: hashedPassword,
        role: 'ROOT',
        email: null, // 可选项
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
    
    console.log('root用户创建成功！');
  } catch (error) {
    console.error('创建root用户时发生错误:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// 执行初始化
initRootUser()
  .then(() => {
    console.log('初始化完成');
    process.exit(0);
  })
  .catch((error) => {
    console.error('初始化失败:', error);
    process.exit(1);
  }); 