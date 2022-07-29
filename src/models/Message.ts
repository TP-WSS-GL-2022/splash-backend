import { DocumentReference, Timestamp } from "firebase-admin/firestore"

import { iStream } from "./Stream"
import { iUser } from "./User"

export interface iMessage {
	user: DocumentReference<iUser>
	content: string
	createdAt: Timestamp
	stream: DocumentReference<iStream>
}
