import axios from "axios"
import fs from "fs"
import path from "path"

const run = () =>
	new Promise(async (res, rej) => {
		const url = `http://localhost:3490/live/wss.flv`

		const { data } = await axios({
			method: "GET",
			url,
			responseType: "stream"
		})

		data.on("data", (chunk: any) => {
			fs.appendFileSync(path.resolve(__dirname, "video.flv"), chunk)
		})

		data.on("end", res)

		data.on("error", rej)
	})

run()
