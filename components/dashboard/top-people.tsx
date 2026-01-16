"use client";

import { MoreVertical, User } from "lucide-react";
import Link from "next/link";

interface TopPeopleProps {
    people: {
        id: string;
        name: string;
        count: number;
        avatar?: string;
        lastInteraction?: Date;
    }[];
}

export function TopPeople({ people }: TopPeopleProps) {
    return (
        <div className="bg-card border border-border rounded-2xl p-6 h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-lg">Top Connections</h3>
                <button className="text-muted-foreground hover:text-primary transition-colors">
                    <MoreVertical className="w-5 h-5" />
                </button>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto pr-2 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                {people.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8 text-sm">
                        No connections yet.
                    </div>
                ) : (
                    people.map((person) => (
                        <Link
                            key={person.id}
                            href={`/archive?view=people&person=${person.id}`}
                            className="flex items-center gap-4 p-3 rounded-xl hover:bg-secondary/50 transition-colors group cursor-pointer"
                        >
                            <div className="w-10 h-10 rounded-full bg-secondary border border-border flex items-center justify-center overflow-hidden shrink-0">
                                {person.avatar ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={person.avatar} alt={person.name} className="w-full h-full object-cover" />
                                ) : (
                                    <User className="w-5 h-5 text-muted-foreground" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-sm truncate">{person.name}</h4>
                                <p className="text-xs text-muted-foreground truncate">
                                    {person.lastInteraction ? new Date(person.lastInteraction).toLocaleDateString() : "Recently"}
                                </p>
                            </div>
                            <div className="flex items-center gap-1">
                                <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-full">
                                    {person.count}
                                </span>
                            </div>
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
}
