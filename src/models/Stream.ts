import { DocumentReference, Timestamp } from "firebase-admin/firestore"
import { iUser } from "./User"

export interface iStream {
	streamer: DocumentReference<iUser>
	nmsId: string | null
	startedAt: Timestamp | null
	endedAt: Timestamp | null
	title: string
}