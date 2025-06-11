import { Metadata } from "next";
import { useTranslations } from "next-intl";
import { Suspense } from "react";

import { ResetPasswordForm } from "components/auth/reset-password-form";

export const metadata: Metadata = {
	title: "Reset Password",
	description: "Reset your password"
};

export default function ResetPasswordPage() {
	const t = useTranslations("auth.resetPassword");

	return (
		<div className="container flex h-screen w-screen flex-col items-center justify-center">
			<div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
				<div className="flex flex-col space-y-2 text-center">
					<h1 className="text-2xl font-semibold tracking-tight">
						{t("title")}
					</h1>
					<p className="text-sm text-muted-foreground">{t("description")}</p>
				</div>
				<Suspense fallback={t("loading")}>
					<ResetPasswordForm />
				</Suspense>
			</div>
		</div>
	);
}
