"use client";

import { AlertCircle, CheckCircle, Instagram, Unlink } from "lucide-react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { Alert, AlertDescription } from "components/ui/alert";
import { Button } from "components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle
} from "components/ui/card";

interface ConnectInstagramProps {
	className?: string;
}

export function ConnectInstagram({ className }: ConnectInstagramProps) {
	const t = useTranslations("instagram.connect");
	const { data: session, update } = useSession();
	const [isConnecting, setIsConnecting] = useState(false);
	const [isDisconnecting, setIsDisconnecting] = useState(false);

	const instagramAccount = session?.user?.instagram;
	const isConnected = Boolean(instagramAccount?.accessToken);

	const handleConnect = () => {
		setIsConnecting(true);

		const baseUrl =
			process.env.NODE_ENV === "production"
				? window.location.origin
				: "http://localhost:3000";

		const facebookAppId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID;

		if (!facebookAppId) {
			console.error("Facebook App ID not configured");
			setIsConnecting(false);

			return;
		}

		const redirectUri = `${baseUrl}/api/auth/instagram`;
		const scope =
			"instagram_basic,instagram_manage_comments,pages_show_list,pages_read_engagement,business_management";

		const authUrl =
			"https://www.facebook.com/v23.0/dialog/oauth" +
			`?client_id=${facebookAppId}` +
			`&redirect_uri=${encodeURIComponent(redirectUri)}` +
			`&scope=${scope}` +
			"&response_type=code" +
			"&state=instagram_connect";

		window.location.href = authUrl;
	};

	const handleDisconnect = async () => {
		setIsDisconnecting(true);

		try {
			const response = await fetch("/api/auth/instagram/disconnect", {
				method: "POST"
			});

			if (response.ok) {
				await update();
			} else {
				console.error("Failed to disconnect Instagram account");
			}
		} catch (error) {
			console.error("Error disconnecting Instagram:", error);
		} finally {
			setIsDisconnecting(false);
		}
	};

	const formatDate = (date: Date | string) => {
		return new Date(date).toLocaleDateString("en-US", {
			year: "numeric",
			month: "long",
			day: "numeric"
		});
	};

	return (
		<Card className={className}>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Instagram className="h-5 w-5" />
					{t("title")}
				</CardTitle>
				<CardDescription>{t("description")}</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				{isConnected ? (
					<div className="space-y-4">
						<Alert>
							<CheckCircle className="h-4 w-4" />
							<AlertDescription>
								{t("connected.status", {
									username: instagramAccount?.username || "Business Account"
								})}
								<br />
								{instagramAccount?.connectedAt &&
									t("connected.connectedOn", {
										date: formatDate(instagramAccount.connectedAt)
									})}
								{instagramAccount?.expiresAt && (
									<>
										<br />
										{t("connected.tokenExpires", {
											date: formatDate(instagramAccount.expiresAt)
										})}
									</>
								)}
							</AlertDescription>
						</Alert>

						<Button
							onClick={handleDisconnect}
							disabled={isDisconnecting}
							variant="destructive"
							className="w-full"
						>
							<Unlink className="mr-2 h-4 w-4" />
							{isDisconnecting
								? t("connected.disconnecting")
								: t("connected.disconnectButton")}
						</Button>
					</div>
				) : (
					<div className="space-y-4">
						<Alert>
							<AlertCircle className="h-4 w-4" />
							<AlertDescription>{t("notConnected.alert")}</AlertDescription>
						</Alert>

						<div className="space-y-2 text-sm text-muted-foreground">
							<p>
								<strong>{t("notConnected.requirements.title")}</strong>
							</p>
							<ul className="list-disc list-inside space-y-1">
								<li>{t("notConnected.requirements.businessAccount")}</li>
								<li>{t("notConnected.requirements.facebookPage")}</li>
								<li>{t("notConnected.requirements.ownPosts")}</li>
							</ul>
						</div>

						<Button
							onClick={handleConnect}
							disabled={isConnecting}
							className="w-full"
						>
							<Instagram className="mr-2 h-4 w-4" />
							{isConnecting
								? t("notConnected.connecting")
								: t("notConnected.connectButton")}
						</Button>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
