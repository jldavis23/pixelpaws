const express = require('express')
const app = express()
const port = 5300

const bodyParser = require('body-parser')

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.use(express.static('client'))

// API code goes here -----

// APP LISTEN
app.listen(port, () => {
    console.log(`Example app listening on ${port}`)
})