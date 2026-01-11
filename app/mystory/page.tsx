import { getSessionUser } from "@/app/actions/auth";
import { getBiography } from "@/lib/mystory";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Sidebar } from "@/components/dashboard/sidebar";
import { BookReader } from "@/components/mystory/book-reader";

export default async function MyStoryPage() {
    const userId = await getSessionUser();
    if (!userId) {
        redirect("/login");
    }

    const chapters = await getBiography(userId);

    const formattedChapters = chapters.map(ch => ({
        id: ch.id,
        title: ch.title,
        content: ch.content,
        order: ch.order
    }));

    return (
        <div className="flex h-screen overflow-hidden bg-background">
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden relative">
                <header className="h-14 flex items-center px-8 border-b border-gray-100 bg-white/90 backdrop-blur-md z-40 text-sm shrink-0">
                    <Link href="/dashboard" className="text-gray-500 hover:text-gray-900 transition-colors">Dashboard</Link>
                    <span className="mx-2 text-gray-400">›</span>
                    <span className="text-gray-900 font-medium">MyStory</span>
                </header>
                <BookReader chapters={formattedChapters} userId={userId} />
            </main>
        </div>
    );
}
