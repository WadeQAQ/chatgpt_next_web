// 用于Vercel部署的Prisma数据库初始化脚本
const { execSync } = require('child_process');

try {
  // 运行Prisma迁移
  console.log('正在生成Prisma客户端...');
  execSync('npx prisma generate');
  
  console.log('正在应用数据库迁移...');
  execSync('npx prisma migrate deploy');
  
  console.log('Prisma数据库初始化完成！');
} catch (error) {
  console.error('Prisma初始化失败:', error);
  process.exit(1);
} 