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

let myPet 

let history = []

let myInventory = {
    kibble: 0,
    treat: 0,
    medicine: 0
}

let petSkills = {
    agility: 9,
    strength: 10,
    intelligence: 10,
    stealth: 10,
    endurance: 10,
    hunting: 10
}

let myAchievements = []

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
        'Follow-a-path': {
            condition: {
                category: 'skill',
                type: 'agility',
                value: 3
            },
            positive: {
                description: 'Your pet masterfully avoids obstacles along the path and discovers a treasure chest with $15. Finders keepers!',
                reward: {
                    type: 'money',
                    arguments: {
                        direction: 'increase',
                        amount: 15
                    }
                }
            },
            negative: {
                description: 'Your pet discovers a treasure chest, but when it opens out flies stinging insects. Your pet cannot avoid them, and they get stung. Their health is decreased.',
                reward: {
                    type: 'need',
                    arguments: {
                        need: 'health',
                        direction: 'decrease',
                        amount: 15
                    }
                }
            }
        },
        'Set-up-a-camp': {
            condition: {
                category: 'personality',
                value: 'mellow'
            },
            positive: {
                description: 'Your pet has a restful night, raising their sleep.',
                reward: {
                    type: 'need',
                    arguments: {
                        need: 'sleep',
                        direction: 'increase',
                        amount: 50
                    }
                }
            },
            negative: {
                description: 'Your pet has trouble sleeping, lowering their happiness',
                reward: {
                    type: 'need',
                    arguments: {
                        need: 'happiness',
                        direction: 'decrease',
                        amount: 10
                    }
                }
            }
        }
    },
    mountains: {
        'Climb-higher': {
            condition: {
                category: 'personality',
                value: 'quirky'
            },
            positive: {
                description: 'Your pet meets a skilled mountain guide who imparts knowledge and helps them climb, increasing agility.',
                reward: {
                    type: 'skill',
                    arguments: {
                        skill: 'agility',
                        amount: 2
                    }
                }
            },
            negative: {
                description: 'Your pet meets a mountain guide who turns out to be a scam artist. They take $25 from you.',
                reward: {
                    type: 'money',
                    arguments: {
                        direction: 'decrease',
                        amount: 25
                    }
                }
            }
        },
        'Explore-a-cave': {
            condition: {
                category: 'skill',
                type: 'strength',
                value: 4
            },
            positive: {
                description: 'Your pet discovers a hot spring and decides to relax, raising their happiness.',
                reward: {
                    type: 'need',
                    arguments: {
                        need: 'happiness',
                        direction: 'increase',
                        amount: 10
                    }
                }
            },
            negative: {
                description: 'Your pet discovers a hot spring and decides to relax, but it turns out to be too hot. Your pet loses some health.',
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
        'Build-a-shelter': {
            condition: {
                category: 'skill',
                type: 'intelligence',
                value: 3
            },
            positive: {
                description: 'While building your shelter, a wandering merchant approaches you. He tries to con your pet, but your pet is too smart to fall for their tricks. The merchant is impressed and gives you $15',
                reward: {
                    type: 'money',
                    arguments: {
                        direction: 'increase',
                        amount: 15
                    }
                }
            },
            negative: {
                description: 'While building your shelter, a wandering merchant approaches you. The merchant turns out to be a con man, and he just stole $20 from you. Oops.',
                reward: {
                    type: 'money',
                    arguments: {
                        direction: 'decrease',
                        amount: 20
                    }
                }
            }
        }
    },
    beach: {
        'Explore-the-tide-pools': {
            condition: {
                category: 'skill',
                type: 'agility',
                value: 2
            },
            positive: {
                description: 'Your pet is careful to not step on any of the animals in the tide pool. They learn about marine life, gaining an intelligence point.',
                reward: {
                    type: 'skill',
                    arguments: {
                        skill: 'intelligence',
                        amount: 1
                    }
                }
            },
            negative: {
                description: 'Your pet loses their balance on the rocks and steps on a sea urchin, causing them to lose health.',
                reward: {
                    type: 'need',
                    arguments: {
                        need: 'health',
                        direction: 'decrease',
                        amount: 5
                    }
                }
            }
        },
        'Go-for-a-swim': {
            condition: {
                category: 'personality',
                value: 'playful'
            },
            positive: {
                description: 'Your pet meets other pets on the beach and has a great time playing games with them. Happiness increases.',
                reward: {
                    type: 'need',
                    arguments: {
                        need: 'happiness',
                        direction: 'increase',
                        amount: 15
                    }
                }
            },
            negative: {
                description: 'Your pet meets other pets on the beach. But the other pets are competitive, causing your pet to lose a game and feel a bit humiliated. Happiness decreases',
                reward: {
                    type: 'need',
                    arguments: {
                        need: 'happiness',
                        direction: 'decrease',
                        amount: 15
                    }
                }
            }
        },
        'Build-a-sandcastle': {
            condition: {
                category: 'personality',
                value: 'cautious'
            },
            positive: {
                description: 'While building a sandcastle, your pet encounters a friendly seagull. It brings your a small gift of $10',
                reward: {
                    type: 'money',
                    arguments: {
                        direction: 'increase',
                        amount: 10
                    }
                }
            },
            negative: {
                description: 'Your pet encounters a mischievous seagull who smashes your sandcastle and steals $15 from you. How rude.',
                reward: {
                    type: 'money',
                    arguments: {
                        direction: 'decrease',
                        amount: 15
                    }
                }
            }
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

    if (achievement[0]) {
        res.send(achievement[0])
    } else {
        res.send({msg: 'does not exist'})
    }
    
})

// POST ACHIEVEMENTS (create)
app.post('/api/achievements/', (req, res) => {
    myAchievements.push(req.body)

    res.send(myAchievements[myAchievements.length - 1])
})


// MY PET ---------------------------------------------

// GET MY PET
app.get('/api/mypet', (req, res) => {
    res.send(myPet)
})

// POST MY PET (create)
app.post('/api/mypet', (req, res) => {
    myPet = req.body

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

// HISTORY --------------------------------

// GET HISTORY
app.get('/api/history', (req, res) => {
    res.send(history)
})

// ADD TO HISTORY 
app.post('/api/history', (req, res) => {
    history.push(req.body.text)

    res.send(history)
})

// DELETE HISTORY MOMENT
app.delete('/api/history', (req, res) => {
    history.shift()

    res.send(history)
})


// APP LISTEN ---------------------------------------------
app.listen(port, () => {
    console.log(`pixelpaws app listening on ${port}`)
})