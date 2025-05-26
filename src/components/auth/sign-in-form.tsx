"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import useSWRMutation from "swr/mutation";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import { Alert, AlertDescription } from "@components/ui/alert";
import { ROUTES } from "@constants/routes";
import { AUTH_ERRORS } from "@constants/auth";
import Link from "next/link";

const signInSchema = z.object({
	email: z.string().email("Please enter a valid email address"),
	password: z.string().min(1, "Password is required"),
});

type SignInFormValues = z.infer<typeof signInSchema>;

async function signInRequest(
	_key: string,
	{ arg }: { arg: SignInFormValues }
) {
	const result = await signIn("credentials", {
		email: arg.email,
		password: arg.password,
		redirect: false,
	});

	if (result?.error) {
		throw new Error(AUTH_ERRORS.DEFAULT);
	}

	return { success: true };
}

export function SignInForm() {
	const router = useRouter();
	const [showSuccess, setShowSuccess] = useState(false);

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<SignInFormValues>({
		resolver: zodResolver(signInSchema),
	});

	const { trigger, error, isMutating, reset } = useSWRMutation(
		"signIn",
		signInRequest,
		{
			onSuccess: () => {
				setShowSuccess(true);
				setTimeout(() => {
					router.push(ROUTES.DASHBOARD);
					router.refresh();
				}, 1000);
			},
		}
	);

	const onSubmit = async (data: SignInFormValues) => {
		reset();
		setShowSuccess(false);
		await trigger(data);
	};

	return (
		<div className="space-y-6">
			{error && (
				<Alert variant="destructive">
					<AlertDescription>{error.message}</AlertDescription>
				</Alert>
			)}

			{showSuccess && (
				<Alert variant="success">
					<AlertDescription>
						Sign in successful! Redirecting to dashboard...
					</AlertDescription>
				</Alert>
			)}

			<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
				<div className="space-y-2">
					<Label htmlFor="email">Email</Label>
					<Input
						id="email"
						type="email"
						placeholder="name@example.com"
						{...register("email")}
						disabled={isMutating || showSuccess}
					/>
					{errors.email && (
						<p className="text-sm text-red-500">{errors.email.message}</p>
					)}
				</div>

				<div className="space-y-2">
					<div className="flex items-center justify-between">
						<Label htmlFor="password">Password</Label>
						<Link
							href={ROUTES.FORGOT_PASSWORD}
							className="text-sm text-primary hover:underline"
						>
							Forgot password?
						</Link>
					</div>
					<Input
						id="password"
						type="password"
						{...register("password")}
						disabled={isMutating || showSuccess}
					/>
					{errors.password && (
						<p className="text-sm text-red-500">{errors.password.message}</p>
					)}
				</div>
				<Button
					type="submit"
					className="w-full"
					disabled={isMutating || showSuccess}
					variant='default'
				>
					{isMutating ? "Signing in..." : "Sign In"}
				</Button>
			</form>

			<div className="text-center">
				<p className="text-sm text-muted-foreground">
					Don&apos;t have an account?{" "}
					<Link
						href={ROUTES.SIGNUP}
						className="text-primary hover:underline"
					>
						Sign up
					</Link>
				</p>
			</div>
		</div>
	);
}