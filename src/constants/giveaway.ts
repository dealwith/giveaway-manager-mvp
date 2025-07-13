import { GiveawayStatus } from "app-types/giveaway";

export const GIVEAWAY_STATUS_LABELS = {
	[GiveawayStatus.DRAFT]: "status.draft",
	[GiveawayStatus.SCHEDULED]: "status.scheduled",
	[GiveawayStatus.ACTIVE]: "status.active",
	[GiveawayStatus.COMPLETED]: "status.completed",
	[GiveawayStatus.CANCELED]: "status.canceled"
};

export enum StatusColors {
	gray = "gray",
	blue = "blue",
	green = "green",
	purple = "purple",
	red = "red"
}

export const GIVEAWAY_STATUS_COLORS = {
	[GiveawayStatus.DRAFT]: StatusColors.gray,
	[GiveawayStatus.SCHEDULED]: StatusColors.blue,
	[GiveawayStatus.ACTIVE]: StatusColors.green,
	[GiveawayStatus.COMPLETED]: StatusColors.purple,
	[GiveawayStatus.CANCELED]: StatusColors.red
};

export const GIVEAWAY_VALIDATION = {
	TITLE_MIN: 3,
	TITLE_MAX: 100,
	KEYWORD_MIN: 1,
	KEYWORD_MAX: 50,
	DESCRIPTION_MAX: 500
};
