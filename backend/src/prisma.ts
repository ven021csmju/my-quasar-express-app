// src/prisma.ts
import { PrismaClient } from './generated/prisma';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

// ✅ สร้าง adapter สำหรับ Prisma 7
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

// ✅ ป้องกันสร้างหลาย instance ตอน dev
const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter, // ใช้ adapter แทน DATABASE_URL
    log: ['query', 'info', 'warn', 'error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
