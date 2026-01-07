"use client";

interface ChapterPageProps {
    chapter: {
        id: string;
        title: string;
        content: string;
    };
    chapterNumber: number;
    totalChapters: number;
    illustration?: string;
}

export function ChapterPage({ chapter, chapterNumber, totalChapters, illustration }: ChapterPageProps) {
    return (
        <div className="w-full h-full flex items-center justify-center p-12">
            <div className="w-full max-w-4xl grid grid-cols-2 gap-12 h-full">
                {/* Left Page - Illustration or Decorative */}
                <div className="flex flex-col justify-center">
                    {illustration ? (
                        <div className="w-full aspect-square rounded-lg overflow-hidden shadow-lg">
                            <img
                                src={illustration}
                                alt={`Illustration for ${chapter.title}`}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    ) : (
                        <div className="w-full aspect-square rounded-lg bg-gradient-to-br from-current/5 to-current/10 flex items-center justify-center border border-current/10">
                            <div className="text-center space-y-4 p-8">
                                <div className="text-6xl font-serif opacity-20">
                                    {chapterNumber}
                                </div>
                                <p className="text-sm font-serif italic opacity-40">
                                    Chapter {chapterNumber} of {totalChapters}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Page - Content */}
                <div className="flex flex-col justify-start max-h-full overflow-hidden">
                    {/* Chapter Title */}
                    <div className="mb-6 pb-4 border-b border-current/20">
                        <div className="text-xs font-serif opacity-40 uppercase tracking-wider mb-2">
                            Chapter {chapterNumber}
                        </div>
                        <h2 className="text-3xl font-serif font-bold leading-tight">
                            {chapter.title}
                        </h2>
                    </div>

                    {/* Chapter Content */}
                    <div className="flex-1 overflow-y-auto pr-4 space-y-4">
                        <div className="prose prose-serif max-w-none">
                            {chapter.content.split('\n\n').map((paragraph, index) => (
                                <p key={index} className="text-base leading-relaxed font-serif">
                                    {paragraph}
                                </p>
                            ))}
                        </div>
                    </div>

                    {/* Page Number */}
                    <div className="mt-6 pt-4 border-t border-current/10 text-center">
                        <span className="text-xs font-serif opacity-40">
                            {chapterNumber}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
