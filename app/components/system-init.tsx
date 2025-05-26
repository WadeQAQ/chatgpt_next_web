'use client';

import { useEffect, useState } from 'react';

export const SystemInitializer = () => {
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeSystem = async () => {
      try {
        const response = await fetch('/api/init');
        if (!response.ok) {
          throw new Error('初始化失败');
        }
        setInitialized(true);
      } catch (err) {
        console.error('初始化错误:', err);
        setError('系统初始化失败，请检查服务器日志');
      }
    };

    initializeSystem();
  }, []);

  // 只在开发环境显示初始化信息，生产环境下不显示任何内容
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="hidden">
      {error && <div>{error}</div>}
    </div>
  );
}; 