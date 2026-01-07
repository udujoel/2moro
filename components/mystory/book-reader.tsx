"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Maximize2, Minimize2, Settings, Sparkles, BookOpen } from "lucide-react";
import { regenerateStory } from "@/app/actions/mystory";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface Chapter {
    id: string;
    title: string;
    content: string;
    order: number;
}

interface BookReaderProps {
    chapters: Chapter[];
    userId: string;
}

type BookState = "closed" | "opening" | "open";
type ThemeType = "classic" | "modern" | "dark" | "vintage";

const LOREM_CHAPTERS = [
    {
        id: "1",
        title: "The Weight of Time",
        order: 1,
        content: `When I look back now over that seemingly endless vista of years, I can see myself as I was then, a foolish and sentimental girl who believed she had all the time in the world, with no appreciation for the delicate and fleeting nature of youth.\n\nThose early years were marked by a naivety that both shielded and limited me. I moved through life with the confidence of someone who has never truly been tested, whose greatest challenges were whether to attend this party or that gathering. My world was small then, bounded by the familiar streets of my neighborhood and the faces I'd known since childhood.\n\nYet even in that simplicity, there were moments of profound beauty—summer evenings that seemed to stretch on forever, conversations that felt like they might never end, dreams that seemed within easy reach. I didn't know then how precious those moments were, how they would become the foundation of everything that followed.\n\nIf I could speak to that younger self now, I'm not sure what I would say. Perhaps nothing. Perhaps those years needed to unfold exactly as they did, in all their innocent uncertainty, for me to become who I am today.\n\nThe city was different then, before the great transformation. We walked everywhere, and the shops were small and personal. I remember the smell of fresh bread from the bakery on the corner and the sound of the evening bells from the old church. Life moved at a slower pace, and we were content to let it. There was no rush to grow up, no pressure to succeed. We were simply being, living in the moment without even realizing we were doing so.\n\nOne day, everything changed. I remember the air felt heavy that morning, as if the world itself were holding its breath. By noon, the first signs were visible. A shift in the light, a change in the wind. By evening, nothing was as it had been. It was the beginning of the end of my innocence, the first step on a journey I hadn't chosen but couldn't avoid. Looking back, I can see how that one day defined everything that came after, how every choice I made was influenced by what happened in those few short hours.\n\nIn the years since, I have often wondered what might have been had I stayed. If I had chosen the safe path, the life that was expected of me. Would I be happier? More fulfilled? Or would I have withered away in a life that was too small for me? There is no way to know, of course. We can only live the life we have, not the one we might have had. And in the end, I am grateful for the journey, for the challenges and the beauty and the lessons I've learned along the way.`
    },
    {
        id: "2",
        title: "The Turning Tide",
        order: 2,
        content: `Life, as I would soon discover, has a way of disrupting even the most carefully laid plans. The comfortable trajectory I had imagined for myself was about to veer dramatically off course.\n\nIt started with small things—a chance encounter, an opportunity that appeared from nowhere, a decision made in a moment of impulse. These seemingly insignificant events would cascade into something far larger than I could have anticipated.\n\nI remember the day everything changed with perfect clarity. The morning had been ordinary in every way, yet by evening, my entire perspective had shifted. Sometimes I wonder if I made the right choice that day, if things would have been different had I taken the safer path.\n\nBut that's the nature of life, isn't it? We make our choices based on incomplete information, on hunches and hopes and the person we happen to be in that particular moment. Looking back, I can see how each decision led inevitably to the next, creating a chain of cause and effect that brought me to this very moment.`
    },
    {
        id: "3",
        title: "A Glimpse of Home",
        order: 3,
        content: `Somewhere in the midst of all the chaos and change, I began to find my footing. The uncertainty that had plagued me started to clarify into something resembling direction.\n\nThis wasn't a sudden revelation but a gradual awakening, like watching the sun rise slowly over the horizon. Each day brought new understanding, new purpose. I started to recognize patterns in my experiences, to see connections I'd missed before.\n\nThe work I was doing—work that had initially seemed like just a way to pay bills—began to take on deeper meaning. I discovered that I had something to contribute, that my unique perspective and experiences had value. This realization was both empowering and humbling.\n\nI met people during this time who would become central to my story. Not all of them stayed, but each left their mark, teaching me lessons I needed to learn, challenging me to grow in ways I hadn't anticipated. Through them, I began to understand who I was and who I wanted to become.`
    }
];

export function BookReader({ chapters: initialChapters, userId }: BookReaderProps) {
    const [bookState, setBookState] = useState<BookState>("closed");
    const [currentSpread, setCurrentSpread] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [theme, setTheme] = useState<ThemeType>("classic");
    const [showSettings, setShowSettings] = useState(false);
    const [isTurning, setIsTurning] = useState(false);
    const [turnDirection, setTurnDirection] = useState<"forward" | "backward">("forward");
    const router = useRouter();

    // Force demo content for now as requested by the user
    const chapters = LOREM_CHAPTERS;

    // Proportional Dimensions based on 95% viewport
    const SPREAD_WIDTH = "95vw";
    const SPREAD_HEIGHT = "85vh";
    const PAGE_MAX_WIDTH = 800;

    interface PageData {
        type: "chapter-start" | "chapter-continue" | "contents";
        chapterId?: string;
        chapterTitle?: string;
        order?: number;
        content: string;
        isIllustration?: boolean;
    }

    const [pages, setPages] = useState<PageData[]>([]);

    useEffect(() => {
        const newPages: PageData[] = [{ type: "contents", content: "" }];

        chapters.forEach((ch) => {
            // Chapter Start: Title + Illustration + First bit of text
            // Roughly 1200 chars on the right page for the start if we have a big illustration on the left
            const startChars = 1200;

            newPages.push({
                type: "chapter-start",
                chapterId: ch.id,
                chapterTitle: ch.title,
                order: ch.order,
                content: ch.content.slice(0, startChars),
                isIllustration: true
            });

            if (ch.content.length > startChars) {
                // Each continuation spread can hold more text (~2500 chars for 2 columns)
                const charsPerPage = 2500;
                let offset = startChars;
                while (offset < ch.content.length) {
                    newPages.push({
                        type: "chapter-continue",
                        chapterId: ch.id,
                        chapterTitle: ch.title,
                        order: ch.order,
                        content: ch.content.slice(offset, offset + charsPerPage)
                    });
                    offset += charsPerPage;
                }
            }
        });

        setPages(newPages);
    }, [chapters]);

    const handleOpenBook = () => {
        if (bookState === "closed") {
            setBookState("opening");
            setTimeout(() => {
                setBookState("open");
                setCurrentSpread(0);
            }, 800);
        }
    };

    const handlePageClick = (side: "left" | "right") => {
        if (bookState !== "open" || isTurning) return;

        if (side === "right") {
            if (currentSpread < pages.length - 1) {
                setIsTurning(true);
                setTurnDirection("forward");
                setTimeout(() => {
                    setCurrentSpread(currentSpread + 1);
                    setIsTurning(false);
                }, 600);
            }
        } else {
            if (currentSpread > 0) {
                setIsTurning(true);
                setTurnDirection("backward");
                setTimeout(() => {
                    setCurrentSpread(currentSpread - 1);
                    setIsTurning(false);
                }, 600);
            } else {
                setBookState("opening");
                setTimeout(() => setBookState("closed"), 500);
            }
        }
    };

    const goToChapter = (chapterId: string) => {
        if (isTurning) return;
        const pageIdx = pages.findIndex(p => p.chapterId === chapterId);
        if (pageIdx !== -1) setCurrentSpread(pageIdx);
    };

    const handleUpdateStory = async () => {
        setIsUpdating(true);
        try {
            const result = await regenerateStory(userId);
            if (result.success) {
                router.refresh();
            }
        } catch (error) {
            console.error(error);
        }
        setIsUpdating(false);
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    const themeStyles = {
        classic: { bg: "#fdfaf7", text: "#000000", font: "Lora, Georgia, serif" },
        modern: { bg: "#ffffff", text: "#000000", font: "Inter, sans-serif" },
        dark: { bg: "#111827", text: "#ffffff", font: "Inter, sans-serif" },
        vintage: { bg: "#f4edda", text: "#3d2b1f", font: "EB Garamond, serif" }
    };

    const currentTheme = themeStyles[theme];
    const currentPage = pages[currentSpread];

    return (
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-white">
            <header className="flex items-center justify-between px-10 py-4 bg-white shrink-0 z-50 border-b border-gray-100">
                <div className="flex items-center gap-6">
                    <div className="p-2 bg-gray-50 rounded-xl">
                        <BookOpen className="w-5 h-5 text-gray-400" />
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-gray-900 tracking-tighter">My Life Story</h1>
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.4em]">Personal Biography</p>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <button
                        onClick={handleUpdateStory}
                        disabled={isUpdating}
                        className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-full hover:bg-black transition-all text-[10px] font-black shadow-lg active:scale-95 disabled:opacity-50 tracking-wider"
                    >
                        <Sparkles className="w-3.5 h-3.5" />
                        {isUpdating ? "GENERATING..." : "REGENERATE STORY"}
                    </button>

                    <div className="flex items-center gap-3 border-l border-gray-100 pl-6">
                        <button
                            onClick={() => setShowSettings(!showSettings)}
                            className="p-2.5 text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-full transition-all"
                        >
                            <Settings className="w-5 h-5" />
                        </button>

                        <button
                            onClick={toggleFullscreen}
                            className="p-2.5 text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-full transition-all"
                        >
                            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                        </button>
                    </div>
                </div>

                {showSettings && (
                    <>
                        <div className="fixed inset-0 z-40" onClick={() => setShowSettings(false)} />
                        <div className="absolute right-10 top-16 w-48 bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-gray-50 z-50 py-3 animate-in fade-in zoom-in-95 duration-200">
                            <div className="px-5 py-1.5 text-[9px] font-black text-gray-300 uppercase tracking-[0.3em] mb-1">Appearance</div>
                            {(["classic", "modern", "dark", "vintage"] as ThemeType[]).map((t) => (
                                <button
                                    key={t}
                                    onClick={() => { setTheme(t); setShowSettings(false); }}
                                    className={`w-full px-5 py-2 text-left text-xs hover:bg-gray-50 transition-colors capitalize ${theme === t ? "text-gray-900 font-black" : "text-gray-500 font-medium"}`}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    </>
                )}
            </header>

            <div className="flex-1 relative flex items-center justify-center p-6 bg-[#fcfcfc] overflow-hidden">
                <div
                    className="relative flex items-center justify-center"
                    style={{
                        width: SPREAD_WIDTH,
                        height: SPREAD_HEIGHT,
                        perspective: "3000px"
                    }}
                >
                    <AnimatePresence mode="wait">
                        {bookState === "closed" && (
                            <motion.div
                                key="closed"
                                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ rotateY: -130, x: "-30%", opacity: 0, scale: 1.1 }}
                                transition={{ duration: 0.9, ease: [0.65, 0, 0.35, 1] }}
                                onClick={handleOpenBook}
                                className="cursor-pointer group relative z-10 mx-auto"
                                style={{ transformStyle: "preserve-3d", width: "47.5vw", height: SPREAD_HEIGHT }}
                            >
                                <div
                                    className="relative rounded-r-[2.5rem] shadow-[0_50px_120px_rgba(0,0,0,0.35)] group-hover:shadow-[0_70px_150px_rgba(0,0,0,0.45)] transition-all duration-700 h-full w-full"
                                    style={{
                                        background: "linear-gradient(135deg, #121212 0%, #000000 100%)",
                                        transformStyle: "preserve-3d"
                                    }}
                                >
                                    <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-black/80 via-transparent to-transparent z-20" />

                                    <div className="absolute inset-x-16 inset-y-20 flex flex-col items-center justify-between text-center border-4 border-white/5 p-16 bg-white/[0.01]">
                                        <div className="space-y-10">
                                            <div className="text-xs font-black text-white/30 uppercase tracking-[0.6em]">A Personal Anthology</div>
                                            <h1 className="text-7xl font-serif text-white font-black leading-tight tracking-tighter italic">My story.</h1>
                                        </div>
                                        <div className="space-y-12">
                                            <div className="w-20 h-px bg-white/10 mx-auto" />
                                            <p className="text-white/40 text-lg italic font-serif leading-relaxed px-8">An attempt to capture the ephemeral nature of a life lived across moments.</p>
                                            <div className="text-xs text-white/20 font-black uppercase tracking-[0.4em] animate-pulse">Touch to open</div>
                                        </div>
                                    </div>
                                    <div className="absolute right-0 top-6 bottom-6 w-5 bg-white/5 rounded-r-3xl shadow-inner z-10" />
                                </div>
                            </motion.div>
                        )}

                        {(bookState === "opening" || bookState === "open") && currentPage && (
                            <motion.div
                                key="open"
                                initial={{ rotateY: 90, x: "30%", opacity: 0, scale: 1.1 }}
                                animate={{ rotateY: 0, x: 0, opacity: 1, scale: 1 }}
                                transition={{ duration: 1.3, ease: [0.22, 1, 0.36, 1] }}
                                className="relative flex items-center justify-center w-full h-full"
                                style={{ transformStyle: "preserve-3d" }}
                            >
                                <div
                                    className="relative flex w-full h-full bg-white rounded-[3rem] shadow-[0_80px_200px_-50px_rgba(0,0,0,0.25)] overflow-hidden border border-gray-100"
                                    style={{
                                        backgroundColor: currentTheme.bg,
                                        color: currentTheme.text,
                                        fontFamily: currentTheme.font
                                    }}
                                >
                                    <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-black/5 z-20" />
                                    <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-20 bg-gradient-to-r from-transparent via-black/[0.03] to-transparent z-10 pointer-events-none" />

                                    <div
                                        onClick={() => handlePageClick("left")}
                                        className="flex-1 relative p-20 flex flex-col cursor-pointer transition-colors duration-500 hover:bg-black/[0.005] overflow-hidden"
                                    >
                                        <div className="mx-auto w-full h-full" style={{ maxWidth: PAGE_MAX_WIDTH }}>
                                            {currentPage.type === "contents" ? (
                                                <div className="animate-in fade-in slide-in-from-left-12 duration-1000 py-10">
                                                    <h2 className="text-5xl font-black mb-20 tracking-tighter italic">Contents.</h2>
                                                    <div className="space-y-8">
                                                        {chapters.map((ch, idx) => (
                                                            <button
                                                                key={ch.id}
                                                                onClick={(e) => { e.stopPropagation(); goToChapter(ch.id); }}
                                                                className="flex items-baseline w-full group text-left"
                                                            >
                                                                <span className="text-[10px] font-black opacity-20 w-12 tabular-nums">0{idx + 1}</span>
                                                                <span className="text-xl font-bold group-hover:translate-x-3 transition-transform border-b-2 border-transparent group-hover:border-current/10 pb-1">{ch.title}</span>
                                                                <div className="flex-1 border-b-2 border-dashed border-current/5 mx-8 mb-2" />
                                                                <span className="text-[10px] font-bold opacity-30 italic tabular-nums">P.{idx * 2 + 3}</span>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            ) : currentPage.type === "chapter-start" ? (
                                                <div className="flex-1 flex flex-col animate-in fade-in duration-800 py-10 h-full">
                                                    <div className="text-center mb-12 shrink-0">
                                                        <div className="text-[14px] font-bold uppercase tracking-[1px] opacity-40 mb-2 font-sans">Chapter {currentPage.order}</div>
                                                        <h2 className="text-[24px] font-black tracking-normal leading-tight italic opacity-90">{currentPage.chapterTitle}</h2>
                                                    </div>

                                                    <div className="flex-1 w-full relative rounded-[2rem] overflow-hidden shadow-2xl border border-black/5 grayscale hover:grayscale-0 transition-all duration-1000 min-h-[400px]">
                                                        <Image
                                                            src="/images/mystory/demo-illustration.png"
                                                            alt="Illustration"
                                                            fill
                                                            className="object-cover scale-105 group-hover:scale-100 transition-transform duration-[2s]"
                                                            priority
                                                        />
                                                    </div>
                                                    <div className="mt-[40px] text-center text-[12px] font-medium opacity-30 tabular-nums text-gray-600 shrink-0">P. {currentSpread * 2 + 1}</div>
                                                </div>
                                            ) : (
                                                <div className="flex-1 flex flex-col animate-in fade-in duration-800 py-10">
                                                    <div className="flex-1 text-[16px] leading-[1.6] text-justify hyphens-auto font-medium opacity-100 font-serif overflow-hidden">
                                                        <div
                                                            style={{
                                                                columnCount: 2,
                                                                columnGap: "40px",
                                                                columnFill: "auto",
                                                                height: "100%",
                                                                width: "200%"
                                                            }}
                                                        >
                                                            {currentPage.content.split('\n\n').map((p, i) => (
                                                                <p key={i} className="mb-[15px] indent-[20px]">{p}</p>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <div className="mt-[40px] text-center text-[12px] font-medium opacity-30 tabular-nums text-gray-600">P. {currentSpread * 2 + 1}</div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div
                                        onClick={() => handlePageClick("right")}
                                        className="flex-1 relative p-20 flex flex-col cursor-pointer transition-colors duration-500 hover:bg-black/[0.005] overflow-hidden"
                                    >
                                        <div className="mx-auto w-full h-full" style={{ maxWidth: PAGE_MAX_WIDTH }}>
                                            {currentPage.type === "contents" ? (
                                                <div className="h-full flex flex-col items-center justify-center text-center space-y-12 opacity-30 group animate-in fade-in slide-in-from-right-12 duration-1000 py-10">
                                                    <div className="w-36 h-48 border-4 border-current/10 rounded-[2.5rem] flex items-center justify-center group-hover:border-current/30 group-hover:scale-105 transition-all duration-700">
                                                        <BookOpen className="w-14 h-14" />
                                                    </div>
                                                    <div className="space-y-5">
                                                        <p className="text-xs font-black tracking-[0.4em] uppercase">Enter the narrative</p>
                                                        <div className="w-16 h-1 bg-current/10 mx-auto rounded-full" />
                                                    </div>
                                                </div>
                                            ) : currentPage.type === "chapter-start" ? (
                                                <div className="flex-1 flex flex-col animate-in fade-in duration-800 py-10">
                                                    <div className="flex-1 text-[16px] leading-[1.6] text-justify hyphens-auto font-medium opacity-100 font-serif overflow-hidden pt-10">
                                                        {currentPage.content.split('\n\n').map((p, i) => (
                                                            <p key={i} className="mb-[15px] indent-[20px]">{p}</p>
                                                        ))}
                                                    </div>
                                                    <div className="mt-[40px] text-center text-[12px] font-medium opacity-30 tabular-nums text-gray-600">P. {currentSpread * 2 + 2}</div>
                                                </div>
                                            ) : (
                                                <div className="flex-1 flex flex-col animate-in fade-in duration-800 py-10">
                                                    <div className="flex-1 text-[16px] leading-[1.6] text-justify hyphens-auto font-medium opacity-100 font-serif overflow-hidden">
                                                        {/* Offset content for continuation spreads - showing the second half of the spread's text */}
                                                        {/* This simplified logic assumes we only split spreads, but for demo it works perfectly */}
                                                        {/* A true implementation would use two different PageData entries, one for left and one for right */}
                                                        {/* But here we'll just show the same text flowing across the spread via CSS columns if possible */}
                                                        <div
                                                            style={{
                                                                columnCount: 2,
                                                                columnGap: "40px",
                                                                columnFill: "auto",
                                                                height: "100%",
                                                                // We need to shift the right page view to show the second column
                                                                marginLeft: "-100%",
                                                                width: "200%"
                                                            }}
                                                        >
                                                            {currentPage.content.split('\n\n').map((p, i) => (
                                                                <p key={i} className="mb-[15px] indent-[20px]">{p}</p>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <div className="mt-[40px] text-center text-[12px] font-medium opacity-30 tabular-nums text-gray-600">P. {currentSpread * 2 + 2}</div>
                                                </div>
                                            )}
                                        </div>

                                        <AnimatePresence>
                                            {isTurning && (
                                                <motion.div
                                                    key="turn-layer"
                                                    initial={turnDirection === "forward" ? { rotateY: 0, x: 0 } : { rotateY: -180, x: "-100%" }}
                                                    animate={turnDirection === "forward" ? { rotateY: -180, x: "-100%" } : { rotateY: 0, x: 0 }}
                                                    exit={{ opacity: 0 }}
                                                    transition={{ duration: 0.8, ease: [0.65, 0, 0.35, 1] }}
                                                    className="absolute inset-0 origin-left z-30"
                                                    style={{
                                                        transformStyle: "preserve-3d",
                                                        backfaceVisibility: "hidden",
                                                        backgroundColor: currentTheme.bg,
                                                        boxShadow: turnDirection === "forward" ? "-40px 0 100px rgba(0,0,0,0.2)" : "40px 0 100px rgba(0,0,0,0.2)"
                                                    }}
                                                >
                                                    <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-transparent pointer-events-none" />
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
