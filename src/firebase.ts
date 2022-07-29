import "dotenv/config"

import { cert, initializeApp } from "firebase-admin/app"
import { FirestoreDataConverter, getFirestore } from "firebase-admin/firestore"

import { iKey } from "./models/Key"
import { iMessage } from "./models/Message"
import { iStream } from "./models/Stream"
import { iUser } from "./models/User"

export const firebase = initializeApp({
	credential: cert({
		projectId: process.env.FIREBASE__SERVICE_ACCOUNT__PROJECT_ID,
		privateKey: process.env.FIREBASE__SERVICE_ACCOUNT__PRIVATE_KEY,
		clientEmail: process.env.FIREBASE__SERVICE_ACCOUNT__CLIENT_EMAIL
	})
})

const converter = <iModel extends {}>(): FirestoreDataConverter<iModel & { id: string }> => ({
	toFirestore: model => {
		const { id, ...rest } = model
		return rest
	},
	fromFirestore: snap => {
		return {
			...(<iModel>snap.data()),
			id: snap.id
		}
	}
})

export const firestore = getFirestore(firebase)
export const usersColl = firestore.collection("users").withConverter(converter<iUser>())
export const keysColl = firestore.collection("keys").withConverter(converter<iKey>())
export const messagesColl = firestore.collection("messages").withConverter(converter<iMessage>())
export const streamsColl = firestore.collection("streams").withConverter(converter<iStream>())
