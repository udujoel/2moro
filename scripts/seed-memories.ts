import { PrismaClient } from '@prisma/client';
import path from 'path';
import dotenv from 'dotenv';

// Load .env.development.local specifically to match Next.js dev environment
dotenv.config({ path: path.resolve(__dirname, '../.env.development.local') });

const prisma = new PrismaClient();

async function main() {
    console.log("🌱 Starting seed...");

    // 1. Get the main user
    const user = await prisma.user.findFirst();
    if (!user) {
        console.error("❌ No user found. Please login or create a user first.");
        return;
    }
    console.log(`👤 Seeding for user: ${user.name || user.email} (${user.id})`);

    // 2. Clear existing memories (AGGRESIVE)
    console.log("🧹 Clearing old memories...");
    await prisma.memory.deleteMany({
        where: { userId: user.id }
    });

    // 3. Get or Create People
    console.log("👥 setting up people...");

    // Check for existing specific people to avoid duplicates if run multiple times without full wipe
    const peopleData = [
        { name: "Sarah Chen", relationship: "Co-Founder", color: "bg-blue-500", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80" },
        { name: "David Kim", relationship: "Tech Lead", color: "bg-green-500", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80" },
        { name: "Elena Rodriguez", relationship: "Investor", color: "bg-purple-500", avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80" }
    ];

    const people = [];

    for (const p of peopleData) {
        let person = await prisma.person.findFirst({
            where: {
                userId: user.id,
                name: p.name
            }
        });

        if (!person) {
            person = await prisma.person.create({
                data: {
                    ...p,
                    userId: user.id
                }
            });
        }
        people.push(person);
    }

    console.log(`✅ People ready: ${people.map(p => p.name).join(", ")}`);

    // 4. Generate Realistic Memories
    const weatherOptions = [
        { temp: 72, condition: "Sunny", icon: "☀️" },
        { temp: 55, condition: "Clear", icon: "🌙" },
        { temp: 60, condition: "Cloudy", icon: "☁️" },
        { temp: 68, condition: "Windy", icon: "💨" },
        { temp: 45, condition: "Rainy", icon: "🌧️" },
        { temp: 30, condition: "Snow", icon: "❄️" }
    ];

    const locations = ["San Francisco, CA", "Seattle, WA", "New York, NY", "Austin, TX", "London, UK", "Tokyo, JP"];

    // Helper to create date X days ago
    const getDate = (days: number) => {
        const d = new Date();
        d.setDate(d.getDate() - days);
        // Add random time
        d.setHours(9 + Math.floor(Math.random() * 12));
        d.setMinutes(Math.floor(Math.random() * 60));
        return d;
    };

    const memoryBlueprints = [
        // SARAH (Co-Founder) - 3 Memories
        {
            personIndex: 0,
            content: "Sarah and I finalized the Q3 roadmap today. We decided to pivot the core feature set based on beta feedback. It's a risk, but it feels right.",
            days: 2,
            type: "text"
        },
        {
            personIndex: 0,
            content: "Late night whiteboarding session with Sarah. We cracked the user retention problem! Pizza was cold, but the energy was high.",
            days: 14,
            type: "image",
            mediaUrl: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=800&q=80"
        },
        {
            personIndex: 0,
            content: "Celebrating our first 1000 users with Sarah at the rooftop bar. A small milestone, but a meaningful one.",
            days: 45,
            type: "text"
        },
        {
            personIndex: 0,
            content: "Heated debate with Sarah about the marketing budget. We agreed to disagree but committed to the plan.",
            days: 120,
            type: "voice"
        },

        // DAVID (Tech Lead) - 3 Memories
        {
            personIndex: 1,
            content: "David optimized the database queries, reducing load times by 40%. The app feels instantly faster. Huge win.",
            days: 5,
            type: "text"
        },
        {
            personIndex: 1,
            content: "Pair programming with David on the new authentication flow. His attention to edge cases is annoying but invaluable.",
            days: 20,
            type: "text"
        },
        {
            personIndex: 1,
            content: "David is presenting at the tech meetup tonight. stopped by to support him. He's talking about our serverless architecture.",
            days: 60,
            type: "image",
            mediaUrl: "https://images.unsplash.com/photo-1544531586-fde5298cdd40?auto=format&fit=crop&w=800&q=80"
        },

        // ELENA (Investor) - 3 Memories
        {
            personIndex: 2,
            content: "Coffee with Elena. She introduced me to a potential strategic partner. Her network is incredible.",
            days: 10,
            type: "text"
        },
        {
            personIndex: 2,
            content: "Board meeting went better than expected. Elena was tough on the financials but supportive of the long-term vision.",
            days: 90,
            type: "text"
        },
        {
            personIndex: 2,
            content: "Dinner with Elena and the other portfolio founders. Great to share war stories and realize we're all facing similar challenges.",
            days: 200,
            type: "image",
            mediaUrl: "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=800&q=80"
        },

        // OLDER MEMORIES (No specific person or mix)
        {
            content: "The day we incorporated the company. Just a piece of paper, but it feels like the start of everything.",
            days: 500,
            type: "text",
            location: "Wilmington, DE"
        },
        {
            content: "First time pitching to VCs. I froze on the third slide but recovered. Learned a lot today.",
            days: 450,
            type: "text"
        },
        {
            content: "Moved into the new office! It's small and smells like paint, but it's ours.",
            days: 300,
            type: "image",
            mediaUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80"
        }
    ];

    console.log("📝 Writing memories...");

    for (const bp of memoryBlueprints) {
        const data: any = {
            userId: user.id,
            content: bp.content,
            type: bp.type,
            memoryDate: getDate(bp.days),
            weather: weatherOptions[Math.floor(Math.random() * weatherOptions.length)],
            locationName: bp.location || locations[Math.floor(Math.random() * locations.length)],
            title: bp.content.split(" ").slice(0, 5).join(" ") + "...",
        };

        if (bp.mediaUrl) {
            data.mediaUrl = bp.mediaUrl;
            data.media = {
                create: {
                    url: bp.mediaUrl,
                    type: "image"
                }
            };
        }

        if (bp.personIndex !== undefined && people[bp.personIndex]) {
            data.people = {
                connect: { id: people[bp.personIndex].id }
            };
        }

        await prisma.memory.create({ data });
    }

    console.log("✅ Seed completed successfully!");
    const fs = require('fs');
    fs.writeFileSync('seed_success.txt', 'Seed completed at ' + new Date().toISOString());
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
