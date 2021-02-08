const express = require("express")

const app = express()

app.get("/kappa", (_, response) => {
	response.status(200).send("Kappa")
})

app.listen(1488)