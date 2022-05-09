import "dotenv/config";

import express from "express";
import { Server } from "socket.io";

import { createMessage, deleteMessage } from "./events/message";
import { ClientEvents, ServerEvents } from "./types/events";


const app = express()
const PORT = 4000
const server = app.listen(PORT, "localhost", () =>
	console.log(`Listening on http://localhost:${PORT}`)
)
const io = new Server<ClientEvents, ServerEvents>(server, {
	cors: {
		// url of client
		origin: "http://localhost:3000",
		methods: ["GET", "POST", "PUT"],

		// TODO: don't forget to send credentials on client
		credentials: true
	}
})

io.on("connection", socket => {
	console.log(`${socket.id} connected`)

	socket.on("createMessage", async data => {
		const message = await createMessage(data)
		socket.emit("createdMessage", message)
	})

	socket.on("deleteMessage", async data => {
		await deleteMessage(data);
		socket.emit("deletedMessage");
	})

	socket.on("disconnect", () => {
		console.log(`${socket.id} disconnected.`)
	})
})
