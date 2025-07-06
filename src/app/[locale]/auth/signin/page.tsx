import { Metadata } from "next";
import { useTranslations } from "next-intl";

import { SignInForm } from "components/auth/sign-in-form";

export const metadata: Metadata = {
	title: "Sign In",
	description: "Sign in to your account"
};

export default function SignInPage() {
	const t = useTranslations("auth.signIn");

	return (
		<>
			<div className="flex flex-col space-y-2 text-center">
				<h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
				<p className="text-sm text-muted-foreground">{t("description")}</p>
			</div>
			<SignInForm />
		</>
	);
}
