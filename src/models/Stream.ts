import { DocumentReference, Timestamp } from "firebase-admin/firestore"
import { iUser } from "./User"

export interface iStream {
	streamer: DocumentReference<iUser>
	nmsId: string
	startedAt: Timestamp
	endedAt: Timestamp | null
	title: string
}