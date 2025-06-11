"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { sendPasswordResetEmail } from "firebase/auth";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import useSWRMutation from "swr/mutation";
import { z } from "zod";

import { Alert, AlertDescription } from "components/ui/alert";
import { Button } from "components/ui/button";
import { Input } from "components/ui/input";
import { Label } from "components/ui/label";
import { auth } from "config/firebase";
import { ROUTES } from "constants/routes";

const forgotPasswordSchema = z.object({
	email: z.string().email("Please enter a valid email address")
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

async function resetPasswordRequest(_key: string, { arg }: { arg: string }) {
	try {
		if (!auth) {
			throw new Error("Authentication not initialized");
		}

		await sendPasswordResetEmail(auth, arg);

		return { success: "success.passwordReset" };
	} catch (error) {
		console.error("Error sending password reset email:", error);
		throw new Error("errors.default");
	}
}

export function ForgotPasswordForm() {
	const t = useTranslations("auth.forgotPassword");

	const {
		register,
		handleSubmit,
		formState: { errors }
	} = useForm<ForgotPasswordFormValues>({
		resolver: zodResolver(forgotPasswordSchema)
	});

	const { trigger, data, error, isMutating } = useSWRMutation(
		"resetPassword",
		resetPasswordRequest
	);

	const onSubmit = async (data: ForgotPasswordFormValues) => {
		try {
			await trigger(data.email);
		} catch (error) {
			console.error("Error in form submission:", error);
		}
	};

	return (
		<div className="space-y-6">
			<div className="space-y-2 text-center">
				<h1 className="text-3xl font-bold">{t("title")}</h1>
				<p className="text-gray-500">{t("description")}</p>
			</div>

			{error && (
				<Alert variant="destructive">
					<AlertDescription>{t(`errors.${error.message}`)}</AlertDescription>
				</Alert>
			)}

			{data?.success && (
				<Alert variant="success">
					<AlertDescription>{t(`success.${data.success}`)}</AlertDescription>
				</Alert>
			)}

			<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
				<div className="space-y-2">
					<Label htmlFor="email">{t("fields.email.label")}</Label>
					<Input
						id="email"
						placeholder={t("fields.email.placeholder")}
						{...register("email")}
						disabled={isMutating || !!data?.success}
					/>
					{errors.email && (
						<p className="text-sm text-red-500">{errors.email.message}</p>
					)}
				</div>

				<Button
					type="submit"
					className="w-full"
					disabled={isMutating || !!data?.success}
				>
					{isMutating ? t("buttons.loading") : t("buttons.sendResetLink")}
				</Button>
			</form>

			<div className="text-center">
				<p className="text-sm text-gray-500">
					{t("signInPrompt")}{" "}
					<Link
						href={ROUTES.SIGNIN}
						className="text-blue-500 hover:text-blue-700"
					>
						{t("signInLink")}
					</Link>
				</p>
			</div>
		</div>
	);
}
