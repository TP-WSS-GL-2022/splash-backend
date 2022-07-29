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

server.on("preConnect", preConnect)
server.on("postConnect", postConnect)
server.on("doneConnect", doneConnect)
server.on("prePublish", prePublish)
server.on("postPublish", postPublish)
server.on("donePublish", donePublish)
server.on("prePlay", prePlay)
server.on("postPlay", postPlay)
server.on("donePlay", donePlay)

server.run()
