import { PrismaClient } from '@prisma/client';
import path from 'path';
import dotenv from 'dotenv';
import fs from 'fs';

// Simulate Next.js env loading order (simplified)
const envLocal = path.resolve(__dirname, '../.env.local');
const envDevLocal = path.resolve(__dirname, '../.env.development.local');
const env = path.resolve(__dirname, '../.env');

if (fs.existsSync(env)) dotenv.config({ path: env });
if (fs.existsSync(envLocal)) dotenv.config({ path: envLocal, override: true });
if (fs.existsSync(envDevLocal)) dotenv.config({ path: envDevLocal, override: true });

const prisma = new PrismaClient();

async function main() {
    console.log("🔍 Checking Database Content...");
    console.log(`Using DATABASE_URL: ${process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 15) + '...' : 'UNDEFINED'}`);

    const count = await prisma.memory.count();
    console.log(`\n📊 Total Memories: ${count}`);

    const memories = await prisma.memory.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { id: true, content: true, memoryDate: true, people: { select: { name: true } } }
    });

    console.log("\n📝 Latests 5 Memories:");
    memories.forEach(m => {
        console.log(`- [${m.memoryDate.toISOString().split('T')[0]}] ${m.content.substring(0, 50)}... (Tags: ${m.people.map(p => p.name).join(', ')})`);
    });
}
main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
