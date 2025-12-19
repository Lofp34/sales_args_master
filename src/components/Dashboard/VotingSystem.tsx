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
        <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    disabled={disabled}
                    aria-label={`Voter ${star} étoiles sur 5`}
                    className={cn(
                        "transition-all duration-200 transform",
                        !disabled && "hover:scale-125 focus:outline-none",
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
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-white/20 fill-transparent"
                        )}
                    />
                </button>
            ))}
            <span className="ml-2 text-sm text-white/60">
                ({initialRating.toFixed(1)})
            </span>
        </div>
    );
};

export default VotingSystem;
