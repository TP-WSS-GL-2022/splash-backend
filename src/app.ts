import axios from "axios"
import express from "express"
import NodeMediaServer from "node-media-server"

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
	},
	trans: {
		ffmpeg: "C:/Programmes/ffmpeg/bin/ffmpeg.exe",
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

app.use("/api", express.static("../videos"))

app.listen(80, () => console.log("Server running on port 80"))
server.run()
