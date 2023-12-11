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

// DATA ---------------------------------------------
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
    agility: 0,
    strength: 0,
    intelligence: 0,
    stealth: 0,
    endurance: 0,
    hunting: 0
}

let myAchievements = [
    {
        id: 'skill-master',
        name: 'Skill Master',
        description: 'Max out every skill',
        earned: false
    },
    {
        id: 'contest-conqueror',
        name: 'Contest Conqueror',
        description: 'Win every contest',
        earned: false
    },
    {
        id: 'smarty-pants',
        name: 'Smarty Pants',
        description: 'Get a perfect score on the animal quiz',
        earned: false
    },
    {
        id: 'cash-cow',
        name: 'Cash Cow',
        description: 'Earn $100',
        earned: false
    },
    {
        id: 'five-star-feeder',
        name: 'Five-Star Feeder',
        description: 'Feed your pet 5 times',
        earned: false
    }
]

let adventure = {
    woods: {
        'Explore-the-deep-woods': {
            condition: {
                category: 'personality',
                value: 'lively'
            },
            positive: {
                description: 'Your pet discovers a bountiful foraging spot, satisfying their hunger.',
                reward: {
                    type: 'need',
                    arguments: {
                        need: 'hunger',
                        direction: 'increase',
                        amount: 100
                    }
                }
            },
            negative: {
                description: 'Your pet accidentally disturbs a hive of insects while foraging, losing a bit of health.',
                reward: {
                    type: 'need',
                    arguments: {
                        need: 'health',
                        direction: 'decrease',
                        amount: 10
                    }
                }
            }
        },
        'Follow a path': {

        },
        'Set up a camp': {

        }
    }
}

// ADVENTURE ---------------------------------------------

// GET ADVENTURE STARING POINT
app.get('/api/adventure/:startingPoint', (req, res) => {
    res.send(adventure[req.params.startingPoint])
})

// ACHIEVEMENTS ---------------------------------------------

// GET ALL ACHIEVEMENTS
app.get('/api/achievements', (req, res) => {
    res.send(myAchievements)
})

// GET ACHIEVEMENT BY ID
app.get('/api/achievement/:id', (req, res) => {
    const achievement = myAchievements.filter(item => item.id === req.params.id)

    res.send(achievement[0])
})

// PUT ACHIEVEMENTS (update)
app.put('/api/achievements/:id', (req, res) => {
    const achievement = myAchievements.filter(item => item.id === req.params.id)

    achievement[0].earned = true

    res.send(achievement[0])
})


// MY PET ---------------------------------------------

// GET MY PET
app.get('/api/mypet', (req, res) => {
    res.send(myPet)
})

// PUT MY PET (update)
app.put('/api/mypet', (req, res) => {
    myPet.type = req.body.type
    myPet.name = req.body.name
    myPet.personality = req.body.personality

    res.send(myPet)
})

// MONEY ---------------------------------------------

// GET MONEY
app.get('/api/money', (req, res) => {
    res.send({ money: money })
})

// PUT MONEY (update)
app.put('/api/money', (req, res) => {
    money = req.body.money

    res.send({ money: money })
})

// INVENTORY ---------------------------------------------

// GET INVENTORY
app.get('/api/inventory', (req, res) => {
    res.send(myInventory)
})

// PUT INVENTORY (update)
app.put('/api/inventory/:item', (req, res) => {
    let item = req.params.item
    let direction = req.body.direction
    let amount = parseInt(req.body.amount)

    if (direction === 'increase') {
        myInventory[item] = myInventory[item] + amount
    } else {
        myInventory[item] = myInventory[item] - amount
    }

    res.send(myInventory)
})

// PET SKILLS ---------------------------------------------

// GET PET SKILLS
app.get('/api/petskills', (req, res) => {
    res.send(petSkills)
})

// PUT PET SKILL (update)
app.put('/api/petskills/:skill', (req, res) => {
    let skill = req.params.skill
    let amount = parseInt(req.body.amount)

    petSkills[skill] = petSkills[skill] + amount

    // if a skill goes over 10, set it back to 10
    if (petSkills[skill] >= 10) {
        petSkills[skill] = 10
    }

    res.send({ [skill]: petSkills[skill] })
})


// APP LISTEN ---------------------------------------------
app.listen(port, () => {
    console.log(`pixelpaws app listening on ${port}`)
})