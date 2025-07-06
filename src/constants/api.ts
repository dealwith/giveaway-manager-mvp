const baseAPIUrl = "/api";

export const API = {
	EMAIL: `${baseAPIUrl}/email`,
	GIVEAWAYS: `${baseAPIUrl}/giveaways`,
	PROCESS_GIVEAWAY: (id: string) => `${baseAPIUrl}/giveaways/${id}/process`,
	SIGN_UP: `${baseAPIUrl}/auth/sign-up`
};
