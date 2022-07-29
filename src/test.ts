import ffmpeg from "fluent-ffmpeg"
import path from "path"

import { path as ffmpegPath } from "@ffmpeg-installer/ffmpeg"

ffmpeg.setFfmpegPath(ffmpegPath)

const run = () => {
	const { obsStart, streamStart, streamEnd } = {
		obsStart: 1659106382000,
		streamStart: 1659106389048,
		streamEnd: 1659106396716
	}

	ffmpeg(path.join(__dirname, "./input.mp4"))
		.setStartTime((streamStart - obsStart) / 1000)
		.outputFormat("mp4")
		.output("output.mp4")
		.run()
}

run()
