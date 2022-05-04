import NodeMediaServer from "node-media-server"

const server = new NodeMediaServer({
	rtmp: {
		port: 1935,
		chunk_size: 60000,
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

server.run()

server.on("preConnect", (id, args) => {
	console.log("[NodeEvent on preConnect]", `id=${id} args=${JSON.stringify(args)}`)
	// let session = server.getSession(id);
	// session.reject();
})

server.on("postConnect", (id, args) => {
	console.log("[NodeEvent on postConnect]", `id=${id} args=${JSON.stringify(args)}`)
})

server.on("doneConnect", (id, args) => {
	console.log("[NodeEvent on doneConnect]", `id=${id} args=${JSON.stringify(args)}`)
})

server.on("prePublish", (id, StreamPath, args) => {
	console.log(
		"[NodeEvent on prePublish]",
		`id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`
	)
	// let session = server.getSession(id);
	// session.reject();
})

server.on("postPublish", (id, StreamPath, args) => {
	console.log(
		"[NodeEvent on postPublish]",
		`id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`
	)
})

server.on("donePublish", (id, StreamPath, args) => {
	console.log(
		"[NodeEvent on donePublish]",
		`id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`
	)
})

server.on("prePlay", (id, StreamPath, args) => {
	console.log(
		"[NodeEvent on prePlay]",
		`id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`
	)
	// let session = server.getSession(id);
	// session.reject();
})

server.on("postPlay", (id, StreamPath, args) => {
	console.log(
		"[NodeEvent on postPlay]",
		`id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`
	)
})

server.on("donePlay", (id, StreamPath, args) => {
	console.log(
		"[NodeEvent on donePlay]",
		`id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`
	)
})
