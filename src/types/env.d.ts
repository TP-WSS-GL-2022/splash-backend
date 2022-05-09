declare module NodeJS {
	interface ProcessEnv {
		NODE_ENV: "development" | "production" | "test"
		FIREBASE_API_KEY: string;
		FIREBASE_AUTH_DOMAIN: string;
		FIREBASE_PROJECT_ID: string;
		FIREBASE_STORAGE_BUCKET: string;
		FIREBASE_MESSAGE_SENDER_ID: string;
		FIREBASE_APP_ID: string;
		FIREBASE_MEASUREMENT_ID: string;
	}
}

