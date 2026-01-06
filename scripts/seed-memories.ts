import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("🌱 Starting seed...");

    // 1. Get the main user
    // Assuming the user Joud or udujoel exists. We'll pick the first one.
    const user = await prisma.user.findFirst();
    if (!user) {
        console.error("❌ No user found. Please login or create a user first.");
        return;
    }
    console.log(`👤 Seeding for user: ${user.name || user.email} (${user.id})`);

    // 2. Clear existing memories (AGGRESIVE)
    // User requested "Delete all from the memory".
    // We will delete all memories for this user.
    console.log("🧹 Clearing old memories...");
    await prisma.memory.deleteMany({
        where: { userId: user.id }
    });

    // Also clear relationships if needed, but Cascade should handle it? 
    // Prisma schema has implicit many-to-many for people. 
    // We don't need to manually clear that if we delete memories.

    // 3. Get existing people to tag
    let people = await prisma.person.findMany({
        where: { userId: user.id }
    });

    if (people.length === 0) {
        console.warn("⚠️ No people found. Creating realistic people properly...");
        await prisma.person.createMany({
            data: [
                { name: "Sarah Chen", relationship: "Co-Founder", color: "bg-blue-500", userId: user.id, avatar: "https://i. Pravatar.cc/150?u=sarah" },
                { name: "David Kim", relationship: "Tech Lead", color: "bg-green-500", userId: user.id, avatar: "https://i.pravatar.cc/150?u=david" },
                { name: "Elena Rodriguez", relationship: "Investor", color: "bg-purple-500", userId: user.id, avatar: "https://i.pravatar.cc/150?u=elena" }
            ]
        });
        people = await prisma.person.findMany({ where: { userId: user.id } });
    }

    console.log(`👥 Found ${people.length} people.`);

    // 4. Generate Realistic Memories
    const weatherOptions = [
        { temp: 72, condition: "Sunny", icon: "☀️" },
        { temp: 55, condition: "Clear", icon: "🌙" },
        { temp: 60, condition: "Cloudy", icon: "☁️" },
        { temp: 68, condition: "Windy", icon: "💨" },
        { temp: 45, condition: "Rainy", icon: "🌧️" },
        { temp: 30, condition: "Snow", icon: "❄️" }
    ];

    const locations = ["San Francisco, CA", "Seattle, WA", "New York, NY", "Austin, TX"];

    // Helper to create date X days ago
    const getDate = (days: number) => {
        const d = new Date();
        d.setDate(d.getDate() - days);
        return d;
    };

    // Specific Memories ensuring at least 2 per person
    const memoryBlueprints = [
        // Sarah
        {
            pIndex: 0,
            content: "Sarah and I mapped out the Q3 user acquisition strategy. Her insights on organic growth were spot on.",
            days: 2
        },
        {
            pIndex: 0,
            content: "Celebrating our seed round closing with Sarah! We went to that rooftop bar downtown. Exciting times ahead.",
            days: 180
        },
        {
            pIndex: 0,
            content: "Tough conversation with Sarah about resource allocation. We disagreed but aligned on the priorities eventually.",
            days: 45
        },

        // David
        {
            pIndex: 1,
            content: "David fixed the critical database latency issue. It was a massive relief. We ordered sushi to celebrate.",
            days: 5
        },
        {
            pIndex: 1,
            content: "Hackathon weekend with David. We prototyped the new AI features. Sleep was optional.",
            days: 10
        },
        {
            pIndex: 1,
            content: "David is leaving for a month-long trip. Handover meeting was intense but thorough.",
            days: 360
        },

        // Elena
        {
            pIndex: 2,
            content: "Elena introduced me to key partners at the summit. Networking is exhausted but valuable.",
            days: 15
        },
        {
            pIndex: 2,
            content: "Coffee chat with Elena. She gave me some great advice on managing investor expectations.",
            days: 90
        },
        {
            pIndex: 2,
            content: "Dinner with Elena and the board. The atmosphere was surprisingly relaxed.",
            days: 400
        }
    ];

    console.log("📝 Writing guaranteed memories...");

    for (const bp of memoryBlueprints) {
        if (people[bp.pIndex]) {
            await prisma.memory.create({
                data: {
                    userId: user.id,
                    content: bp.content,
                    type: "text",
                    memoryDate: getDate(bp.days),
                    weather: weatherOptions[Math.floor(Math.random() * weatherOptions.length)],
                    locationName: locations[Math.floor(Math.random() * locations.length)],
                    title: bp.content.split(" ").slice(0, 5).join(" ") + "...",
                    people: {
                        connect: { id: people[bp.pIndex].id }
                    }
                }
            });
        }
    }

    console.log("✅ Seed completed successfully!");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
