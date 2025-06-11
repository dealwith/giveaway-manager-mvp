import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
	locales: ["en", "ru", "uk", "pl", "es"],

	localePrefix: "as-needed",
	defaultLocale: "en"
});
