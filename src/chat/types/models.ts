export interface User {
	id: string;
	name: string;
	username: string;
	email: string;
	avatarUrl: string;
}

export interface Message {
	id: string;
	author: User;
	content: string;
	createdAt: Date;
}