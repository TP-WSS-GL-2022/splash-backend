import { DocumentReference, Timestamp } from "firebase-admin/firestore"
import { iUser } from "./User"

export interface iStream {
	streamer: DocumentReference<iUser>
	startedAt: Timestamp
	endedAt: Timestamp | null
	title: string
}