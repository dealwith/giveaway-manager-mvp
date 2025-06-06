export enum GiveawayStatus {
	DRAFT = "draft",
	SCHEDULED = "scheduled",
	ACTIVE = "active",
	COMPLETED = "completed",
	CANCELED = "canceled"
}

export interface Giveaway {
	id: string;
	userId: string;
	title: string;
	description: string;
	postUrl: string;
	documentUrl: string;
	keyword: string;
	startTime: Date;
	endTime: Date;
	status: GiveawayStatus;
	winnerCount?: number;
	winners?: GiveawayWinner[];

	createdAt: Date;
	updatedAt: Date;
}

export interface GiveawayWinner {
	id: string;
	giveawayId: string;
	username: string;
	commentId: string;
	messageStatus: "pending" | "sent" | "failed";
	likeStatus: "pending" | "sent" | "failed";

	createdAt: Date;
}
