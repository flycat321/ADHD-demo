import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@shared/schema';

// 使用标准的postgres连接
const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString, { 
  max: 10, // 连接池最大连接数
<<<<<<< HEAD
  ssl: false, // 本地开发不需要 SSL
=======
  ssl: true, // Neon需要SSL
>>>>>>> 3d586f123f22a64ae44fec3b576872dd35b24b66
  idle_timeout: 20,
  connect_timeout: 10,
  prepare: false, // 禁用预处理语句以支持某些特殊查询
});

export const db = drizzle(client, { schema });