// Vercel构建脚本
const { execSync } = require('child_process');

// 首先运行Prisma初始化
try {
  console.log('执行Prisma数据库初始化...');
  require('./prisma-deploy');
  
  // 然后执行正常的构建过程
  console.log('执行项目构建...');
  execSync('yarn mask && next build', { stdio: 'inherit' });
  
  console.log('构建完成！');
} catch (error) {
  console.error('构建失败:', error);
  process.exit(1);
} 