import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Starting seed...')

    // Upsert Tim Watson
    const user = await prisma.user.upsert({
        where: { email: 'tim@2moro.app' },
        update: {},
        create: {
            email: 'tim@2moro.app',
            name: 'Tim Watson',
            title: 'Architect of Tomorrow',
            bio: 'Building systems to bridge the gap between who I am and who I want to be.',
            onboardingCompleted: true,
        },
    })

    console.log(`👤 Seeded User: ${user.name}`)

    // Seed People
    const peopleData = [
        { name: "Sarah Chen", relationship: "Co-Founder", color: "bg-purple-500", avatar: "https://i.pravatar.cc/150?u=sarah" },
        { name: "David Miller", relationship: "Mentor", color: "bg-blue-600", avatar: "https://i.pravatar.cc/150?u=david" },
        { name: "Elena Rodriguez", relationship: "Partner", color: "bg-pink-500", avatar: "https://i.pravatar.cc/150?u=elena" },
        { name: "Marcus Johnson", relationship: "High School Friend", color: "bg-green-500", avatar: "https://i.pravatar.cc/150?u=marcus" },
        { name: "Dr. Aris Thorne", relationship: "Therapist", color: "bg-teal-600", avatar: "https://i.pravatar.cc/150?u=aris" },
        { name: "Team Alpha", relationship: "Work Group", color: "bg-orange-500", avatar: null }, // Group
        { name: "Nana", relationship: "Grandmother", color: "bg-indigo-400", avatar: "https://i.pravatar.cc/150?u=nana" },
        { name: "Coach K", relationship: "Fitness Coach", color: "bg-red-500", avatar: "https://i.pravatar.cc/150?u=k" },
    ]

    const peopleMap = new Map();

    for (const person of peopleData) {
        const p = await prisma.person.create({
            data: {
                userId: user.id,
                ...person
            }
        })
        peopleMap.set(person.name, p.id)
        console.log(`busts_in_silhouette Created Person: ${person.name}`)
    }

    // Seed Memories
    const memoriesData = [
        { type: "text", content: "Had a breakthrough session with David today. 'Focus on inputs, not outputs.' Such a simple mantra but it changes everything about how I approach this project.", date: new Date("2023-10-15T14:00:00Z"), people: ["David Miller"] },
        { type: "image", content: "Sunrise over the marina. The calm before the storm of launch week.", date: new Date("2023-10-18T06:30:00Z"), people: [] },
        { type: "text", content: "Sarah and I argued about the roadmap. I wanted to push features, she wanted to stabilize. She was right. We need a solid foundation.", date: new Date("2023-10-20T11:00:00Z"), people: ["Sarah Chen"] },
        { type: "text", content: "Late night coding sprint with the team. Pizza, Red Bull, and a whole lot of bugs fixed. This is what it's all about.", date: new Date("2023-10-22T23:45:00Z"), people: ["Team Alpha"] },
        { type: "text", content: "Dinner with Elena at our favorite spot. We talked about where we want to be in 5 years. Scary but exciting.", date: new Date("2023-10-25T19:30:00Z"), people: ["Elena Rodriguez"] },
        { type: "text", content: "Nana called. She sounded weak but happy. I need to visit her more often.", date: new Date("2023-10-28T10:15:00Z"), people: ["Nana"] },
        { type: "text", content: "First gym session with Coach K in months. My legs are going to hate me tomorrow.", date: new Date("2023-11-01T07:00:00Z"), people: ["Coach K"] },
        { type: "text", content: "Reading 'Atomic Habits' again. The idea of 1% improvements really resonates right now.", date: new Date("2023-11-05T20:00:00Z"), people: [] },
        { type: "text", content: "Caught up with Marcus. He's moving to Berlin! End of an era.", date: new Date("2023-11-10T18:00:00Z"), people: ["Marcus Johnson"] },
        { type: "text", content: "Dr. Thorne suggested I start journaling my anxiety triggers. Here goes nothing.", date: new Date("2023-11-12T09:00:00Z"), people: ["Dr. Aris Thorne"] },
        { type: "image", content: "The prototype works! First full successful build.", date: new Date("2023-11-15T16:20:00Z"), people: ["Team Alpha", "Sarah Chen"] },
        { type: "text", content: "Feeling overwhelmed. Too many moving parts. Need to decompose the problem.", date: new Date("2023-11-18T15:00:00Z"), people: [] },
        { type: "text", content: "Elena surprised me with tickets to the symphony. I didn't think I'd like it, but the focus required was meditative.", date: new Date("2023-11-20T20:00:00Z"), people: ["Elena Rodriguez"] },
        { type: "text", content: "David introduced me to the concept of 'Anti-Goals'. What do I want to avoid? Burnout.", date: new Date("2023-11-25T13:00:00Z"), people: ["David Miller"] },
        { type: "text", content: "Thanksgiving with the family. Loud, chaotic, perfect.", date: new Date("2023-11-28T14:00:00Z"), people: ["Nana", "Elena Rodriguez"] },
        { type: "text", content: "December planning. The year went by so fast. Did I achieve what I set out to do?", date: new Date("2023-12-01T10:00:00Z"), people: [] },
        { type: "text", content: "Sarah pitching to investors. She's a natural. I'm glad I can just write code.", date: new Date("2023-12-05T11:00:00Z"), people: ["Sarah Chen"] },
        { type: "text", content: "Snow day! First of the season. Everything is quiet.", date: new Date("2023-12-10T08:00:00Z"), people: [] },
        { type: "text", content: "Reflecting on the year with Dr. Thorne. Progress is non-linear.", date: new Date("2023-12-15T16:00:00Z"), people: ["Dr. Aris Thorne"] },
        { type: "text", content: "Christmas shopping with Marcus before he leaves. We bought matching ugly sweaters.", date: new Date("2023-12-20T15:00:00Z"), people: ["Marcus Johnson"] },
        { type: "text", content: "Project Beta launched to early access users. Feedback is... mixed. Back to work.", date: new Date("2024-01-05T09:00:00Z"), people: ["Team Alpha"] },
    ];

    for (const memory of memoriesData) {
        // Create the memory
        const m = await prisma.memory.create({
            data: {
                userId: user.id,
                type: memory.type,
                content: memory.content,
                memoryDate: memory.date,
                people: {
                    connect: memory.people.map(name => ({ id: peopleMap.get(name) })).filter(id => !!id)
                }
            }
        })
        console.log(`📝 Created Memory: ${memory.content.substring(0, 30)}...`)
    }

    console.log('✅ Seeding complete.')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
