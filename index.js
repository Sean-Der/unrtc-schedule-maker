const express = require('express')

const HTTP_PORT = 5000

const app = express()

app.use(express.static('public'))

console.log(`Starting on port ${HTTP_PORT}`)
app.listen(5000)
