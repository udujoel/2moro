"use client";

interface TableOfContentsProps {
    chapters: Array<{
        id: string;
        title: string;
        order: number;
    }>;
    onChapterClick: (index: number) => void;
}

export function TableOfContents({ chapters, onChapterClick }: TableOfContentsProps) {
    return (
        <div className="w-full h-full flex items-center justify-center p-12">
            <div className="w-full max-w-2xl space-y-8">
                {/* Title */}
                <div className="text-center space-y-4 pb-8 border-b-2 border-current/20">
                    <h2 className="text-4xl font-serif font-bold">Contents</h2>
                    <p className="text-sm opacity-60 font-serif italic">
                        Chapters of My Journey
                    </p>
                </div>

                {/* Chapter List */}
                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-4">
                    {chapters.map((chapter, index) => (
                        <button
                            key={chapter.id}
                            onClick={() => onChapterClick(index)}
                            className="w-full flex items-baseline justify-between p-4 rounded-lg hover:bg-current/5 transition-colors text-left group border border-transparent hover:border-current/10"
                        >
                            <div className="flex items-baseline gap-4 flex-1">
                                <span className="text-sm font-serif opacity-50 shrink-0">
                                    {String(index + 1).padStart(2, '0')}
                                </span>
                                <span className="font-serif text-lg group-hover:translate-x-1 transition-transform">
                                    {chapter.title}
                                </span>
                            </div>
                            <span className="text-sm font-serif opacity-40 ml-4">
                                {index + 1}
                            </span>
                        </button>
                    ))}
                </div>

                {chapters.length === 0 && (
                    <div className="text-center py-12 opacity-50">
                        <p className="font-serif italic">No chapters yet.</p>
                        <p className="text-sm mt-2">Create memories to generate your story.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
