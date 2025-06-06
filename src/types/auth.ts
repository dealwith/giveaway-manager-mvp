export interface SignInCredentials {
	email: string;
	password: string;
}

export interface SignUpCredentials extends SignInCredentials {
	name?: string;
}

export interface ResetPasswordCredentials {
	email: string;
}

export interface NewPasswordCredentials {
	password: string;
	token: string;
}

export enum AuthProvider {
	GOOGLE = "google",
	CREDENTIALS = "credentials"
}
