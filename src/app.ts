import axios from "axios"
import express from "express"
import { Timestamp } from "firebase-admin/firestore"
import ffmpeg from "fluent-ffmpeg"
import fs from "fs"
import NodeMediaServer from "node-media-server"
import path from "path"

import { path as ffmpegPath } from "@ffmpeg-installer/ffmpeg"

import { keysColl, streamsColl, usersColl } from "./firebase"

ffmpeg.setFfmpegPath(ffmpegPath)

const PORT = 6969
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

app.get("/api/:userId/live.flv", async (req, res) => {
	const keySnap = await keysColl.doc(req.params.userId).get()
	if (!keySnap.exists) {
		return res.status(404).send("Invalid userId")
	}

	const streamSnaps = await streamsColl
		.where("streamer", "==", usersColl.doc(req.params.userId))
		.where("startedAt", "!=", null)
		.where("endedAt", "==", null)
		.get()
	const streamSnap = streamSnaps.docs[0]
	if (!streamSnap?.exists) return res.status(400).send("User is not live streaming")

	const { secret } = keySnap.data()!
	const { data } = await axios({
		method: "GET",
		url: `http://${
			process.env.NODE_ENV === "production" ? "18.143.74.14" : "localhost"
		}:3490/live/${secret}.flv`,
		responseType: "stream"
	})

	return data.pipe(res)
})

server.on("prePublish", async (id, streamPath) => {
	const session = <any>server.getSession(id)
	const secret = streamPath.slice(6)
	const nmsId = <string>session.id

	const keySnaps = await keysColl.where("secret", "==", secret).get()
	const keySnap = keySnaps.docs[0]
	if (!keySnap?.exists) return session.reject()

	await streamsColl.add({
		streamer: usersColl.doc(keySnap.id),
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
	if (!streamSnap?.exists) return
	const stream = streamSnap.data()

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

	const oldFile = path.join(__dirname, "../live", secret, filename)
	let startTime = (streamStart.getTime() - obsStart.getTime()) / 1000
	startTime = startTime > 1 ? startTime - 1 : 0

	ffmpeg(oldFile)
		.setStartTime(startTime)
		.setDuration((streamEnd.getTime() - streamStart.getTime()) / 1000)
		.outputFormat("mp4")
		.output(path.join(__dirname, "../public/videos", `${(<any>stream).id}.mp4`))
		.once("end", () => fs.unlinkSync(oldFile))
		.run()
})

app.use("/api", express.static(path.join(__dirname, "../public")))

app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
server.run()
