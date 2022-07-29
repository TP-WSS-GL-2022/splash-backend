import "dotenv/config"

import { cert, initializeApp } from "firebase-admin/app"
import { getFirestore } from "firebase-admin/firestore"

export const firebase = initializeApp({
	credential: cert({
		projectId: process.env.FIREBASE__SERVICE_ACCOUNT__PROJECT_ID,
		privateKey: process.env.FIREBASE__SERVICE_ACCOUNT__PRIVATE_KEY,
		clientEmail: process.env.FIREBASE__SERVICE_ACCOUNT__CLIENT_EMAIL
	})
})

export const firestore = getFirestore(firebase)
export const usersColl = firestore.collection("users")
export const keysColl = firestore.collection("keys")
export const messagesColl = firestore.collection("messages")
export const vodsColl = firestore.collection("vods")
