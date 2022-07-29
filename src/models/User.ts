import { DocumentReference } from "firebase-admin/firestore"

export interface iUser {
	username: string
	following: DocumentReference<iUser>
	followerCount: number
	bio: string
	photo: string
	social: Record<string, string>
}
