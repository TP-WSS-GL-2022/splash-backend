import { doc, getDoc } from "firebase/firestore";

import { users } from "../firebase";
import { EventDispatch } from "../types/events";
import { User } from "../types/models";


export const getUser: EventDispatch<"getUser"> = async id => {
	const snap = await getDoc(doc(users, id))
	return snap.data() as User
}
