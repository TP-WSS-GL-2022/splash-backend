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

app.listen(80, () => console.log("Server running on port 80"))
server.run()
