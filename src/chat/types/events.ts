import { Message, User } from "./models";


type Awaitable<T> = Promise<T> | T

/**
 *
 * Define all events here
 */


// prefer to stick to present tense for client-related events
export interface ClientEvents {
	createMessage: (message: Omit<Message, "id" | "createdAt">) => Awaitable<void>
	deleteMessage: (id: string) => Awaitable<void>
}

// and past tense for server-side events
export interface ServerEvents {
	createdMessage: (message: Message) => Awaitable<void>
	deletedMessage: () => Awaitable<void>
}

export interface Events {
	createMessage: (message: Omit<Message, "id" | "createdAt">) => Message
	deleteMessage: (id: string) => void
	getUser: (id: string) => User
}

export type EventDispatch<K extends keyof Events> = (
	...args: Parameters<Events[K]>
) => Awaitable<ReturnType<Events[K]>>
