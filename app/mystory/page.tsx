import { getSessionUser } from "@/app/actions/auth";
import { getBiography } from "@/lib/mystory";
import { redirect } from "next/navigation";
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
            <main className="flex-1 flex flex-col overflow-hidden">
                <BookReader chapters={formattedChapters} userId={userId} />
            </main>
        </div>
    );
}
