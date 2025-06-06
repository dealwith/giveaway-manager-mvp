export const ROUTES = {
	HOME: "/",
	SIGNIN: "/auth/signin",
	SIGNUP: "/auth/signup",
	FORGOT_PASSWORD: "/auth/forgot-password",
	RESET_PASSWORD: "/auth/reset-password",
	DASHBOARD: "/dashboard",
	GIVEAWAYS: "/dashboard/giveaways",
	CREATE_GIVEAWAY: "/dashboard/giveaways/create",
	EDIT_GIVEAWAY: (id: string) => `/dashboard/giveaways/${id}/edit`,
	VIEW_GIVEAWAY: (id: string) => `/dashboard/giveaways/${id}`,
	SETTINGS: "/dashboard/settings",
	PRICING: "/pricing"
};
