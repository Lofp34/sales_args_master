"use client";

import React, { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface VotingSystemProps {
    initialRating: number;
    userVote?: number;
    onVote: (value: number) => void;
    disabled?: boolean;
}

const VotingSystem = ({
    initialRating,
    userVote,
    onVote,
    disabled = false,
}: VotingSystemProps) => {
    const [hover, setHover] = useState(0);

    return (
        <div className={cn("flex items-center gap-1", disabled && "opacity-60")}>
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    disabled={disabled}
                    aria-label={`Voter ${star} étoiles sur 5`}
                    className={cn(
                        "transition-all duration-200 transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-soft)] focus-visible:ring-offset-0 rounded-sm",
                        !disabled && "hover:scale-125",
                        disabled ? "cursor-default" : "cursor-pointer"
                    )}
                    onClick={() => onVote(star)}
                    onMouseEnter={() => !disabled && setHover(star)}
                    onMouseLeave={() => !disabled && setHover(0)}
                >
                    <Star
                        size={20}
                        className={cn(
                            "transition-colors duration-200",
                            (hover || userVote || initialRating) >= star
                                ? "fill-[var(--accent)] text-[var(--accent)]"
                                : "text-[var(--ink-muted)] opacity-40 fill-transparent"
                        )}
                    />
                </button>
            ))}
            <span className="ml-2 text-sm text-[var(--ink-muted)]">
                ({initialRating.toFixed(1)})
            </span>
        </div>
    );
};

export default VotingSystem;
