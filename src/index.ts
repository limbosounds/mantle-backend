import { json } from "body-parser"
import Logger from "@theadmasters/logger"
import * as express from "express"
import { v2 } from "@google-cloud/translate"

const logger = new Logger("Express")
const port = Number(process.env.PORT || "1488")
const app = express()

app.use(json())
app.use((request, _, next) => {
	logger.debug(`Incoming *${request.path}*`, request.body)
	next()
})

app.get("*", (_, response) => {
	response.status(200).send("Hello, kappa")
})

app.post("/translate", async (request, response) => {

	const translate = new v2.Translate()
	const [result, , error] = await translate.translate(request.body.text, {
		from: "ru",
		to: "en",
		format: "text"
	}).catch(error => ([,, `${error}`]))

	if (error) {
		logger.error(`*POST /translate - 400: ${error}*`)
		response.status(400).send({ error })
	} else {
		logger.success(`*POST /translate - 200*`)
		response.status(200).send({ result })
	}
})

logger.info(`Starting server on port *${port}*`)
app.listen(port)
	.on("listening", () => {
		logger.success(`*Server successfully started!*`)
	})
	.on("error", error => {
		logger.error(`Failed to start server: *${error}*`)
	})