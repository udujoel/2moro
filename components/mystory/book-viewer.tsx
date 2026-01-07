"use client";

import { useState } from "react";
import { BookCover } from "@/components/mystory/book-cover";
import { TableOfContents } from "@/components/mystory/table-of-contents";
import { ChapterPage } from "@/components/mystory/chapter-page";
import { PageTurn } from "@/components/mystory/page-turn";
import { BookSettings } from "@/components/mystory/book-settings";

export type BookTheme = "classic" | "modern" | "dark" | "vintage";
export type PageView = "cover" | "contents" | "chapter";

interface BookViewerProps {
    chapters: Array<{
        id: string;
        title: string;
        content: string;
        order: number;
    }>;
    coverImage?: string;
    userId: string;
}

export function BookViewer({ chapters, coverImage, userId }: BookViewerProps) {
    const [currentView, setCurrentView] = useState<PageView>("cover");
    const [currentChapter, setCurrentChapter] = useState(0);
    const [theme, setTheme] = useState<BookTheme>("classic");
    const [isFlipping, setIsFlipping] = useState(false);

    const handlePageTurn = (direction: "forward" | "backward") => {
        if (isFlipping) return;

        setIsFlipping(true);

        setTimeout(() => {
            if (direction === "forward") {
                if (currentView === "cover") {
                    setCurrentView("contents");
                } else if (currentView === "contents") {
                    setCurrentView("chapter");
                    setCurrentChapter(0);
                } else if (currentView === "chapter") {
                    if (currentChapter < chapters.length - 1) {
                        setCurrentChapter(currentChapter + 1);
                    }
                }
            } else {
                if (currentView === "chapter") {
                    if (currentChapter > 0) {
                        setCurrentChapter(currentChapter - 1);
                    } else {
                        setCurrentView("contents");
                    }
                } else if (currentView === "contents") {
                    setCurrentView("cover");
                }
            }
            setIsFlipping(false);
        }, 600);
    };

    const goToChapter = (chapterIndex: number) => {
        if (isFlipping) return;
        setIsFlipping(true);
        setTimeout(() => {
            setCurrentView("chapter");
            setCurrentChapter(chapterIndex);
            setIsFlipping(false);
        }, 600);
    };

    return (
        <div className={`min-h-screen flex items-center justify-center p-8 book-theme-${theme}`}>
            {/* Settings */}
            <div className="fixed top-6 right-6 z-50">
                <BookSettings theme={theme} onThemeChange={setTheme} />
            </div>

            {/* Book Container */}
            <div className="relative w-full max-w-6xl">
                <PageTurn
                    isFlipping={isFlipping}
                    onTurnForward={() => handlePageTurn("forward")}
                    onTurnBackward={() => handlePageTurn("backward")}
                    canTurnForward={
                        currentView === "cover" ||
                        currentView === "contents" ||
                        (currentView === "chapter" && currentChapter < chapters.length - 1)
                    }
                    canTurnBackward={
                        currentView === "contents" ||
                        (currentView === "chapter" && currentChapter >= 0)
                    }
                >
                    {currentView === "cover" && (
                        <BookCover coverImage={coverImage} userId={userId} />
                    )}
                    {currentView === "contents" && (
                        <TableOfContents
                            chapters={chapters}
                            onChapterClick={goToChapter}
                        />
                    )}
                    {currentView === "chapter" && chapters[currentChapter] && (
                        <ChapterPage
                            chapter={chapters[currentChapter]}
                            chapterNumber={currentChapter + 1}
                            totalChapters={chapters.length}
                        />
                    )}
                </PageTurn>
            </div>
        </div>
    );
}
