import { FirebaseApp, getApp, getApps, initializeApp } from "firebase/app";
import { Auth, getAuth } from "firebase/auth";
import { Firestore, getFirestore } from "firebase/firestore";

const firebaseConfig = {
	apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
	authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
	projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
	storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
	messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
	appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || ""
};

const isFirebaseConfigured =
	firebaseConfig.apiKey &&
	firebaseConfig.authDomain &&
	firebaseConfig.projectId;

let app: FirebaseApp | undefined;
let db: Firestore | undefined;
let auth: Auth | undefined;
let analytics = null;

if (isFirebaseConfigured) {
	try {
		app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
		db = getFirestore(app);
		auth = getAuth(app);

		// Initialize analytics on client-side only
		if (typeof window !== "undefined") {
			import("firebase/analytics").then(({ getAnalytics }) => {
				analytics = getAnalytics(app!);
			});
		}
	} catch (error) {
		console.error("Firebase initialization error:", error);
		throw new Error(
			"Failed to initialize Firebase. Please check your environment variables."
		);
	}
} else {
	const missingVars = [];

	if (!firebaseConfig.apiKey) missingVars.push("NEXT_PUBLIC_FIREBASE_API_KEY");

	if (!firebaseConfig.authDomain)
		missingVars.push("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN");

	if (!firebaseConfig.projectId)
		missingVars.push("NEXT_PUBLIC_FIREBASE_PROJECT_ID");

	console.error(
		"Firebase not initialized. Missing environment variables:",
		missingVars.join(", ")
	);
}

export { app, db, auth, analytics, firebaseConfig };
