import axios from "axios"
import express from "express"
import { Timestamp } from "firebase-admin/firestore"
import ffmpeg from "fluent-ffmpeg"
import fs from "fs"
import NodeMediaServer from "node-media-server"
import path from "path"

import { path as ffmpegPath } from "@ffmpeg-installer/ffmpeg"

import { keysColl, streamsColl } from "./firebase"

ffmpeg.setFfmpegPath(ffmpegPath)

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
		mediaroot: "./",
		port: 3490,
		allow_origin: "*"
	},
	trans: {
		ffmpeg: ffmpegPath,
		tasks: [
			{
				app: "live",
				mp4: true,
				mp4Flags: "[movflags=frag_keyframe+empty_moov]"
			}
		]
	}
})

app.get("/api/:userId/live", async (req, res) => {
	const snap = await keysColl.doc(req.params.userId).get()
	if (!snap.exists) {
		return res.status(404).send("Invalid userId")
	}

	const key = snap.data()!

	const { data } = await axios({
		method: "GET",
		url: `http://localhost:3490/live/${key.secret}.flv`,
		responseType: "stream"
	})

	return data.pipe(res)
})

server.on("prePublish", async (id, streamPath) => {
	const session = <any>server.getSession(id)
	const secret = streamPath.slice(6)
	const nmsId = <string>session.id

	const userSnaps = await keysColl.where("secret", "==", secret).get()
	const userSnap = userSnaps.docs[0]
	if (!userSnap || !userSnap.exists) {
		return session.reject()
	}

	await streamsColl.add({
		streamer: userSnap.ref,
		nmsId,
		startedAt: null,
		endedAt: null,
		title: ""
	})
})

server.on("donePublish", async (id, streamPath) => {
	const secret = streamPath.slice(6)
	const filename = fs.readdirSync(path.join(__dirname, "..", streamPath))[0]
	if (!filename) return

	const [year, month, day, hour, minute, second] = <
		[number, number, number, number, number, number]
	>filename
		.slice(0, -4)
		.split("-")
		.map(i => +i)
	const obsStart = new Date(year, month - 1, day, hour, minute, second)

	const nmsId = <string>(<any>server.getSession(id)).id
	const streamSnaps = await streamsColl.where("nmsId", "==", nmsId).get()
	const streamSnap = streamSnaps.docs[0]
	if (!streamSnap || !streamSnap.exists) return

	const userSnaps = await keysColl.where("secret", "==", secret).get()
	const userSnap = userSnaps.docs[0]
	if (!userSnap || !userSnap.exists) return

	const stream = streamSnap.data()
	const user = userSnap.data()

	// If OBS was stopped before UI clicked start, delete stream object
	const filePath = path.join(__dirname, "..", streamPath, filename)
	if (stream.startedAt === null) {
		await streamSnap.ref.delete()
		fs.unlinkSync(filePath)
		return
	}

	const streamStart = stream.startedAt.toDate()
	const streamEnd = stream.endedAt?.toDate() ?? new Date()
	await streamSnap.ref.update({
		nmsId: null,
		endedAt: stream.endedAt ?? Timestamp.now()
	})
})

app.use("/api", express.static("../videos"))

app.listen(80, () => console.log("Server running on port 80"))
server.run()
