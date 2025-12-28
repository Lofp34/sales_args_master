export type ArgumentStatus = "PENDING" | "APPROVED" | "REJECTED";

export type Argument = {
    id: string;
    title: string;
    impact: string;
    maieutique: string;
    status: ArgumentStatus;
    averageRating: number;
    userVote?: number;
    userId: string;
    userName?: string;
};
