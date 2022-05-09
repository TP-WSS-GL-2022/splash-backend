import { addDoc, deleteDoc, doc, getDoc } from "firebase/firestore";

import { messages, users } from "../firebase";
import { EventDispatch } from "../types/events";
import { Message } from "../types/models";


export const createMessage: EventDispatch<"createMessage"> = async message => {
	const userRef = doc(users, message.author.id)
	const ref = await addDoc(messages, {
		user: userRef,
		content: message.content
	})
	const snap = await getDoc(ref)
	return snap.data() as Message
}

export const deleteMessage: EventDispatch<"deleteMessage"> = async id => {
	await deleteDoc(doc(users, id))
}
