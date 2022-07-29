import axios from "axios"
import express from "express"
import NodeMediaServer from "node-media-server"

import doneConnect from "./events/doneConnect"
import donePlay from "./events/donePlay"
import donePublish from "./events/donePublish"
import postConnect from "./events/postConnect"
import postPlay from "./events/postPlay"
import postPublish from "./events/postPublish"
import preConnect from "./events/preConnect"
import prePlay from "./events/prePlay"
import prePublish from "./events/prePublish"
import { keysColl } from "./firebase"

const app = express()
const server = new NodeMediaServer({
	rtmp: {
		port: 1935,
		chunk_size: 300_000,
		gop_cache: true,
		ping: 30,
		ping_timeout: 60
	},
	http: {
		mediaroot: "/",
		port: 3490,
		allow_origin: "*"
	}
})

app.get("/api/:userId/live", async (req, res) => {
	const snaps = await keysColl.where("key", "==", req.params.userId).get()
	const snap = snaps.docs[0]
	if (!snap || !snap.exists) {
		return res.status(404).send("Invalid userId")
	}

	const user = snap.data()

	const { data } = await axios({
		method: "GET",
		url: `http://localhost:3490/live/${user.key}.flv`,
		responseType: "stream"
	})

	return data.pipe(res)
})

app.use("/api", express.static("../videos"))

server.on("preConnect", (id, args) => {
	preConnect(server.getSession(id), args as any)
})

server.on("postConnect", (id, args) => {
	postConnect(server.getSession(id), args as any)
})

server.on("doneConnect", (id, args) => {
	doneConnect(server.getSession(id), args as any)
})

server.on("prePublish", (id, path, args) => {
	prePublish(server.getSession(id), path.slice(6), args)
})

server.on("postPublish", (id, path, args) => {
	postPublish(server.getSession(id), path.slice(6), args)
})

server.on("donePublish", (id, path, args) => {
	donePublish(server.getSession(id), path.slice(6), args)
})

server.on("prePlay", (id, path, args) => {
	prePlay(server.getSession(id), path.slice(6), args)
})

server.on("postPlay", (id, path, args) => {
	postPlay(server.getSession(id), path.slice(6), args)
})

server.on("donePlay", (id, path, args) => {
	donePlay(server.getSession(id), path.slice(6), args)
})

app.listen(80, () => console.log("Server running on port 80"))
server.run()
