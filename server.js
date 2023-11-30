const express = require('express')
const app = express()
const port = 5300

const bodyParser = require('body-parser')

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// Serve static files from 'client' directory
app.use(express.static('client'));

// Serve static files from 'dist' directory
app.use('/dist', express.static('dist'))

// Middleware to set Content-Type for CSS files
app.use((req, res, next) => {
    if (req.url.endsWith('.css')) {
        res.header('Content-Type', 'text/css');
    }
    next();
});

// DATA
let money = 80

let myPet = {
    type: '',
    name: '',
    personality: ''
}

let myInventory = {
    kibble: 0,
    treat: 0,
    medicine: 0
}

let petSkills = {
    agility: 2,
    strength: 10,
    intelligence: 5,
    stealth: 1,
    endurance: 10,
    hunting: 4
}

// GET MY PET
app.get('/api/mypet', (req, res) => {
    res.send(myPet)
})

// POST MY PET
app.post('/api/mypet', (req, res) => {
    myPet.type = req.body.type
    myPet.name = req.body.name
    myPet.personality = req.body.personality

    res.send(myPet)
})

// GET MONEY
app.get('/api/money', (req, res) => {
    res.send({money: money})
})

// POST MONEY
app.post('/api/money', (req, res) => {
    money = req.body.money

    res.send({money: money})
})


// APP LISTEN
app.listen(port, () => {
    console.log(`pixelpaws app listening on ${port}`)
})