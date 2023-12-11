// RENDER THE GAME ---------------------------------------------
const main = document.querySelector('#main')
const choosePetForm = document.querySelector('#choose-pet-form')
const dashboard = document.querySelector('#dashboard')
dashboard.remove()

let myPet

const renderGame = async (e) => {
    e.preventDefault()

    // Add the dashboard to the DOM
    main.appendChild(dashboard)

    // Create object that will be sent to the server
    let petData = {
        type: '',
        name: '',
        personality: ''
    }

    // Assign the selected pet type
    const petOptions = document.getElementsByName('pet-options')
    let selectedPet
    for (let i = 0; i < petOptions.length; i++) {
        if (petOptions[i].checked) selectedPet = petOptions[i].value
    }
    if (!selectedPet) {
        dashboard.remove()
        alert('please choose a pet')
        return
    }
    petData.type = selectedPet
    const petPic = document.querySelector('#pet-pic')
    petPic.src = `images/${selectedPet}.jpg`

    // Assign the inputed name
    const nameInput = document.querySelector('#name-input')
    if (!nameInput.value) {
        dashboard.remove()
        alert('please choose a name for your pet')
        return
    }
    petData.name = nameInput.value
    const petName = document.querySelector('#pet-name')
    petName.textContent = nameInput.value

    // Assign the pet's personality
    const personalityOptions = document.getElementsByName('personality-options')
    let selectedPersonality
    for (let i = 0; i < personalityOptions.length; i++) {
        if (personalityOptions[i].checked) selectedPersonality = personalityOptions[i].value
    }
    if (!selectedPersonality) {
        dashboard.remove()
        alert('please choose a personality for your pet')
        return
    }
    petData.personality = selectedPersonality
    const petPersonality = document.querySelector('#pet-personality')
    petPersonality.textContent = selectedPersonality

    // Send the petData to server to update myPet
    try {
        const res = await fetch('/api/mypet', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(petData)
        })

        myPet = await res.json()
    } catch (err) {
        console.error(err)
    }

    // Start decaying the pet's needs for each category
    decayPetNeed('happiness')
    decayPetNeed('health')
    decayPetNeed('hunger')
    decayPetNeed('sleep')

    // Render the pet's skills
    const skills = await getPetSkills()
    const skillBars = document.querySelectorAll('#skill-bars progress')
    const skillLabels = document.querySelectorAll('#skill-bars span')

    Object.keys(skills).forEach(skill => {
        skillBars.forEach(bar => {
            if (bar.id === `${skill}-bar`) {
                bar.value = skills[skill]
            }
        })

        skillLabels.forEach(label => {
            if (label.id === `${skill}-label`) {
                label.textContent = skills[skill]
            }
        })
    })

    // Render the achievements
    const achieveRes = await fetch('/api/achievements')
    const achievements = await achieveRes.json()
    achievements.forEach(achieve => {
        if (achieve.earned) awardAchievement(achieve.id)
    })

    // Render the inventory
    updateInvQtys()

    // Display the player's money
    updateAndRenderMoney()

    // Add a welcome history moment
    addToHistory(`Congrats! You adopted ${petData.name}`)

    // Add clicking on pet interaction
    let lastClickTime = 0
    petPic.addEventListener('click', () => {
        const currentTime = new Date().getTime();

        // Check if the cooldown period has elapsed
        if (currentTime - lastClickTime > 5000) {
            updatePetNeedBars('happiness', 'increase', 1)
            sendToastMsg(`${myPet.name} loves the attention!`)

            console.log('changing pet pic to hearts')

            // Update the last click time
            lastClickTime = currentTime;
        }
    })

    // Add event listener to Sleep button
    const sleepBtn = document.querySelector('#sleep-btn')
    sleepBtn.addEventListener('click', sendPetToSleep)

    // Render the Mini-Games Modal
    const minigameModal = document.querySelector('#minigames-modal')
    const minigameBtn = document.querySelector('#play-minigame-btn')
    minigameBtn.addEventListener('click', () => minigameModal.showModal())

    const triviaBtn = document.querySelector('#trivia-btn')
    triviaBtn.addEventListener('click', renderTriviaGame)

    const chanceBtn = document.querySelector('#chance-btn')
    chanceBtn.addEventListener('click', renderChanceGame)

    // Render Purchase Items modal
    const purchaseItemsModal = document.querySelector('#purchase-items-modal')
    const purchaseItemsBtn = document.querySelector('#purchase-items-btn')
    purchaseItemsBtn.addEventListener('click', () => purchaseItemsModal.showModal())

    const buyBtns = document.querySelectorAll('.buy-btns')
    buyBtns.forEach(btn => {
        btn.addEventListener('click', () => purchaseAnItem(btn.name, parseInt(btn.value)))
    })

    // Render Skill Training Modal
    const skillTrainingModal = document.querySelector('#skill-training-modal')
    const skillTrainingBtn = document.querySelector('#skill-training-btn')
    skillTrainingBtn.addEventListener('click', () => {
        skillTrainingModal.showModal()
        renderSkillLevelsInModal()
    })

    const lowBtns = document.querySelectorAll('.low-intensity-btn')
    lowBtns.forEach(btn => {
        btn.addEventListener('click', () => trainSkill(btn.name, btn.value))
    })

    const highBtns = document.querySelectorAll('.high-intensity-btn')
    highBtns.forEach(btn => {
        btn.addEventListener('click', () => trainSkill(btn.name, btn.value))
    })

    // Render Enter Contest Modal
    const enterContestModal = document.querySelector('#enter-contest-modal')
    const enterContestBtn = document.querySelector('#enter-contest-btn')
    enterContestBtn.addEventListener('click', () => enterContestModal.showModal())

    const enterBtns = document.querySelectorAll('.enter-contest-btns')
    enterBtns.forEach(btn => {
        btn.addEventListener('click', () => enterContest(btn.name, btn.dataset.mainSkill, btn.dataset.otherSkill))
    })

    // Render Go on Adventure Modal
    const adventureModal = document.querySelector('#adventure-modal')
    const startAdventureBtn = document.querySelector('#start-adventure-btn')
    startAdventureBtn.addEventListener('click', () => adventureModal.showModal())

    const startingPointBtns = document.querySelectorAll('#starting-point-btns div')
    startingPointBtns.forEach(btn => {
        btn.addEventListener('click', () => startAdventure(btn.dataset.name))
    })


    // Add event listeners to the inventory feed buttons
    const feedBtns = document.querySelectorAll('.feed-btns')
    feedBtns.forEach(btn => {
        btn.addEventListener('click', () => feedPet(btn.name))
    })

    // Remove the beginning Choose Pet Form
    choosePetForm.remove()
}

const beginGameBtn = document.querySelector('#begin-game')
beginGameBtn.addEventListener('click', renderGame)

// UPDATE AND RENDER MONEY ---------------------------------------------
let moneyEarned = 0

const updateAndRenderMoney = async (direction, amount) => {

    // fetch money from api
    const res = await fetch('/api/money')
    const moneyObj = await res.json()
    let money = moneyObj.money

    if (direction) {
        // add the moneyEarned
        if (direction === 'increase') {
            moneyEarned = moneyEarned + amount
        }

        // send PUT request to update money
        const response = await fetch('/api/money', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                money: direction === 'increase' ? money + amount : money - amount
            })
        })
        const data = await response.json()

        money = data.money
    }

    // Rerender money in the DOM
    document.querySelector('#money-display').textContent = money //main money display
    document.querySelector('#purchase-items-money').textContent = money //money display inside modal

    // Check for achievement
    if (moneyEarned >= 100) {
        const res = await fetch('/api/achievement/cash-cow')
        const achievement = await res.json()

        if (!achievement.earned) {
            awardAchievement('cash-cow')
            sendToastMsg('Congrats! You won the Cash Cow Achievement!')
            addToHistory(`${myPet.name} won the Cash Cow achievement!`)
        }
    }
}


// ADD A HISTORY MOMENT ---------------------------------------------
const addToHistory = (text) => {
    const historyContainer = document.querySelector('#history-container')

    historyContainer.insertAdjacentHTML(
        'afterbegin',
        `<li class="border-b py-2 text-xs">${text}</li>`
    )
}

// ADD AN ACHIEVEMENT ---------------------------------------------
const awardAchievement = async (id) => {
    let achievement

    try {
        const res = await fetch(`/api/achievements/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        achievement = await res.json()
    } catch (err) {
        console.error(err)
    }

    const achievementContainer = document.querySelector('#achievement-container')
    achievementContainer.insertAdjacentHTML(
        'afterbegin',
        `<li class="border-b py-1 flex gap-1 items-center">
            <img src="images/ribbon.png" class="w-7">
            <div>
                <p class="font-bold">${achievement.name}</p>
                <p class="text-xs">${achievement.description}</p>
            </div>
        </li>`
    )
    achievementContainer.removeChild(document.querySelector(`#${id}-placeholder`))
}

// SEND TOAST MESSAGE ---------------------------------------------
const sendToastMsg = (text) => {
    const toast = document.querySelector('#toast')
    const toastText = document.querySelector('#toast-text')

    // set toast message text
    toastText.textContent = text

    // remove the hidden class from toast
    toast.classList.remove('hidden')

    // after 5 seconds, hide toast again
    setTimeout(() => {
        toast.classList.add('hidden')
    }, 5000)
}

// PET NEEDS DECAY ---------------------------------------------
const decayPetNeed = (need) => {
    const needBar = document.querySelector(`#${need}-bar`)
    const needLabel = document.querySelector(`#${need}-label`)

    if (document.body.contains(dashboard)) {
        if (needBar.value > 0) {
            setTimeout(() => {
                needBar.value = needBar.value - 1
                needLabel.textContent = `${needBar.value}%`
                decayPetNeed(need)
            }, 5000)
        } else if (need === 'health') {
            gameOver()
            return
        }
    } else {
        return
    }

}


// UPDATE THE PET NEED BARS ---------------------------------------------
const updatePetNeedBars = (need, direction, amount) => {
    const needBar = document.querySelector(`#${need}-bar`)
    const needLabel = document.querySelector(`#${need}-label`)

    direction === 'increase' ? (
        needBar.value = needBar.value + amount
    ) : (
        needBar.value = needBar.value - amount
    )
    needLabel.textContent = `${needBar.value}%`
}

// GAME OVER ---------------------------------------------
const gameOver = () => {
    dashboard.remove()

    main.insertAdjacentHTML(
        'beforeend',
        `<div class="hero min-h-screen">
            <div class="hero-content text-center">
            <div class="max-w-md">
                <h1 class="text-5xl font-bold">GAME OVER</h1>
                <p class="py-6">${myPet.name} died</p>
            </div>
            </div>
        </div>`
    )
}


// FEED PET ---------------------------------------------
let timesFed = 0
const feedPet = async (item) => {
    let inventory

    // Fetch the inventory data from server
    try {
        const res = await fetch('/api/inventory')
        inventory = await res.json()
    } catch (err) {
        console.error(err)
    }

    if (inventory[item] > 0) {
        // decrease the item quanitity
        updateInvQtys(item, 'decrease', 1)

        // effects on need bars
        switch (item) {
            case 'kibble':
                updatePetNeedBars('hunger', 'increase', 5)
                break
            case 'treat':
                updatePetNeedBars('hunger', 'increase', 3)
                updatePetNeedBars('happiness', 'increase', 5)
                updatePetNeedBars('health', 'decrease', 5)
                break
            case 'medicine':
                updatePetNeedBars('health', 'increase', 10)
                updatePetNeedBars('sleep', 'decrease', 5)
                break
            default:
                console.log('error')
        }

        // Check for achievements
        timesFed++
        if (timesFed > 4) {
            const res = await fetch('/api/achievement/five-star-feeder')
            const achievement = await res.json()

            if (!achievement.earned) {
                awardAchievement('five-star-feeder')
                sendToastMsg('Congrats! You earned the Five Star Feeder Achievement!')
                addToHistory(`${myPet.name} earned the Five Star Feeder achievement!`)
            }
        }
    } else {
        console.log(`you have no ${item}`)
    }
}


// UPDATE INVENTORY QUANTITIES ---------------------------------------------
const updateInvQtys = async (item, direction, amount) => {
    const response = await fetch('/api/inventory')
    let inventory = await response.json()

    // Send PUT (update) request to server
    if (item && direction && amount) {
        try {
            const res = await fetch(`/api/inventory/${item}`, {
                method: 'PUT',
                headers: {
                    "Content-Type": 'application/json'
                },
                body: JSON.stringify({
                    direction: direction,
                    amount: amount
                })
            })

            inventory = await res.json()
        } catch (err) {
            console.error(err)
        }
    }

    // Render the inventory qtys in DOM
    for (let i in inventory) {
        const qtyDisplay = document.querySelector(`#${i}-qty`)
        qtyDisplay.textContent = inventory[i]
    }
}


// PURCHASE ITEMS ---------------------------------------------
const purchaseAnItem = async (item, price) => {
    let money

    // fetch money from api
    try {
        const res = await fetch('/api/money')
        const data = await res.json()
        money = data.money
    } catch (err) {
        console.error(err)
    }

    if (money >= price) {
        // Subtract price from Money, display in the DOM
        updateAndRenderMoney('decrease', price)

        // Add item to inventory object, display in DOM
        updateInvQtys(item, 'increase', 1)
    } else {
        console.log('not enough money')
    }
}

const sendPetToSleep = () => {
    const allBtns = document.querySelectorAll('button')
    allBtns.forEach(btn => btn.classList.add('btn-disabled'))

    console.log('update pet pic to sleeping pet')

    setTimeout(() => {
        allBtns.forEach(btn => btn.classList.remove('btn-disabled'))
        updatePetNeedBars('sleep', 'increase', 20)
    }, 5000)
}


// MINI-GAMES ---------------------------------------------
const resetMiniGame = () => {
    while (gameContainer.firstChild) {
        gameContainer.removeChild(gameContainer.firstChild)
    }
    gameContainer.appendChild(chooseMinigame)
    minigameTitle.textContent = 'Choose a Mini-Game'
}

const closeMinigameBtn = document.querySelector('#close-minigame-btn')
closeMinigameBtn.addEventListener('click', resetMiniGame)

const minigameModal = document.querySelector('#minigames-modal')
const minigameTitle = document.querySelector('#minigame-title')
const gameContainer = document.querySelector('#game-container')
const chooseMinigame = document.querySelector('#choose-minigame')


// TRIVIA MINIGAME ---------------------------------------------
let questions
let currentQuestionIndex = 0
let triviaPointsAwarded = 0
let answersCorrect = 0

const renderTriviaGame = async () => {
    // reset the variables
    questions = null
    currentQuestionIndex = 0
    triviaPointsAwarded = 0
    answersCorrect = 0

    // Remove the minigame selection
    minigameTitle.textContent = 'Animal Trivia'
    gameContainer.removeChild(chooseMinigame)

    //Add a loading animation while trivia questions are fetched
    gameContainer.insertAdjacentHTML(
        'beforeend',
        '<div class="loading"></div>'
    )

    // Fetch trivia questions
    const res = await fetch('https://opentdb.com/api.php?amount=3&category=27&type=multiple')
    const data = await res.json()
    questions = await data.results

    // Remove loading circle and insert the trivia game in the DOM
    while (gameContainer.firstChild) {
        gameContainer.removeChild(gameContainer.firstChild)
    }
    gameContainer.insertAdjacentHTML(
        'beforeend',
        `<div id="trivia-game">
            <p class="text-xs text-center mt-4">(<span id="trivia-num">1</span> of 3)</p>
            <h4 id="trivia-question" class="my-4 text-neutral text-center"></h4>

            <div id="trivia-choices" class="flex flex-col gap-5">
            </div>

            <div id="trivia-feedback-section" class="flex flex-col gap-4 my-3 hidden">
                <p class="text-center">Your Answer: <span id="your-answer"></span></p>

                <p id="trivia-feedback-text" class="text-center text-lg">Correct!</p>

                <div class="flex justify-center mt-3">
                    <button id="next-trivia-btn" class="btn btn-sm">next</button>
                </div>
            </div>
        </div>`
    )

    // add event listener to the next button
    const nextTriviaBtn = document.querySelector('#next-trivia-btn')
    nextTriviaBtn.addEventListener('click', nextTriviaQuestion)

    // populate the first question
    populateTriviaQuestion()
}

const populateTriviaQuestion = () => {
    // display the question number
    const triviaNum = document.querySelector('#trivia-num')
    triviaNum.textContent = currentQuestionIndex + 1

    // display trivia question
    const triviaQuestion = document.querySelector('#trivia-question')
    triviaQuestion.textContent = htmlReplace(questions[currentQuestionIndex].question)

    // randomize answer choice order
    let choices = questions[currentQuestionIndex].incorrect_answers.map(choice => {
        return { text: choice, isCorrect: false }
    })

    const randomIndex = Math.floor(Math.random() * (choices.length + 1))

    choices.splice(randomIndex, 0, {
        text: questions[currentQuestionIndex].correct_answer,
        isCorrect: true,
    })

    // display trivia choices
    const triviaChoices = document.querySelector('#trivia-choices')
    while (triviaChoices.firstChild) {
        triviaChoices.removeChild(triviaChoices.firstChild)
    }

    choices.forEach(choice => {
        const choiceBtn = document.createElement('button')
        choiceBtn.className = 'btn btn-outline w-full'
        choiceBtn.value = choice.isCorrect
        choiceBtn.textContent = htmlReplace(choice.text)
        choiceBtn.addEventListener('click', () => checkAnswer(choice))
        triviaChoices.appendChild(choiceBtn)
    })

    // hide feedback section
    const triviaFeedbackSection = document.querySelector('#trivia-feedback-section')
    if (!triviaFeedbackSection.classList.contains('hidden')) {
        triviaFeedbackSection.classList.add('hidden')
    }
}

const checkAnswer = (choice) => {
    const triviaChoices = document.querySelector('#trivia-choices')
    const triviaFeedbackSection = document.querySelector('#trivia-feedback-section')
    const triviaFeedbackText = document.querySelector('#trivia-feedback-text')
    const yourAnswer = document.querySelector('#your-answer')

    // Inform the user if they got the answer correct
    yourAnswer.textContent = htmlReplace(choice.text)
    if (choice.isCorrect) {
        answersCorrect++
        triviaFeedbackText.textContent = 'correct!'
        triviaFeedbackText.classList.remove('text-error')
        triviaFeedbackText.classList.add('text-success')

        // award points based on difficulty
        switch (questions[currentQuestionIndex].difficulty) {
            case 'easy':
                triviaPointsAwarded = triviaPointsAwarded + 4
                break
            case 'medium':
                triviaPointsAwarded = triviaPointsAwarded + 10
                break
            case 'hard':
                triviaPointsAwarded = triviaPointsAwarded + 16
                break
            default:
                triviaPointsAwarded = triviaPointsAwarded + 3
        }
    } else {
        triviaFeedbackText.textContent = 'incorrect...'
        triviaFeedbackText.classList.remove('text-success')
        triviaFeedbackText.classList.add('text-error')
    }

    // Remove the choice buttons
    while (triviaChoices.firstChild) {
        triviaChoices.removeChild(triviaChoices.firstChild)
    }

    // Display the feedback
    triviaFeedbackSection.classList.toggle('hidden')
}

const nextTriviaQuestion = () => {
    if (currentQuestionIndex < 2) {
        currentQuestionIndex++
        populateTriviaQuestion()
    } else {
        const triviaGame = document.querySelector('#trivia-game')
        gameContainer.removeChild(triviaGame)

        gameContainer.insertAdjacentHTML(
            'beforeend',
            `<h4 class="text-neutral text-center my-4 text-lg">Thanks for playing!</h4>
            <p class="text-center font-bold">You were awarded $<span id="trivia-money">${triviaPointsAwarded}</span></p>
            <div class="flex justify-center mt-3">
                <button id="finish-trivia-btn" class="btn btn-sm">finish</button>
            </div>`
        )

        const finishTriviaBtn = document.querySelector('#finish-trivia-btn')
        finishTriviaBtn.addEventListener('click', async () => {
            // close the modal
            minigameModal.close()

            // award the money and display it
            updateAndRenderMoney('increase', triviaPointsAwarded)

            // reset the trivia game
            resetMiniGame()

            // Check if user earned achievement
            if (answersCorrect === 3) {
                const res = await fetch('/api/achievement/smarty-pants')
                const achievement = await res.json()
                if (!achievement.earned) {
                    awardAchievement('smarty-pants')
                    sendToastMsg('Congrats! You won the Smarty Pants achievement!')
                    addToHistory(`${myPet.name} earned the Smarty Pants achievement!`)
                }
            }

        })
    }
}

const htmlReplace = (str) => {
    return str
        .replaceAll("&quot;", '"')
        .replaceAll("&#039;", "'")
        .replaceAll("&rsquo;", "'")
        .replaceAll("&amp;", "'")
        .replaceAll("&oacute;", "ó")
        .replaceAll("&Oacute;", "Ó")
        .replaceAll("&hellip;", "…")
        .replaceAll("&ldquo;", '"')
        .replaceAll("&rdquo;", '"')
        .replaceAll("&Eacute;", "É")
        .replaceAll("&eacute;", "é")
        .replaceAll("&aacute;", "á")
        .replaceAll("&Aaute;", "Á")
        .replaceAll("&shy;", "")
        .replaceAll("&iacute;", "í")
        .replaceAll("&Iacute;", "Í")
        .replaceAll("&luml;", "Ï")
}


// CHANCE MINIGAME ---------------------------------------------
let chancePointsAwarded = 0
let chanceTries = 3
let randomChanceNum

const renderChanceGame = () => {
    // reset variables
    chancePointsAwarded = 0
    chanceTries = 5

    // Remove the minigame selection
    minigameTitle.textContent = 'Game of Chance'
    gameContainer.removeChild(chooseMinigame)

    // Pick a random number between 1 and 10
    randomChanceNum = Math.floor(Math.random() * 10) + 1

    // Add the chance game to the DOM
    gameContainer.insertAdjacentHTML(
        'beforeend',
        `<div id="chance-game">
            <p class="my-4">You have three tries to guess the correct number between 1 and 10</p>

            <div id="chance-num-btns" class="join grid grid-cols-5 sm:grid-cols-10 w-full">
                
            </div>

            <p class="text-center mt-4 text-neutral">tries left: <span id="chance-tries-left">${chanceTries}</span></p>
        </div>`
    )

    // Add the number buttons
    const chanceNumBtns = document.querySelector('#chance-num-btns')
    for (let i = 1; i <= 10; i++) {
        const numBtn = document.createElement('button')
        numBtn.className = 'btn btn-outline sm:join-item'
        numBtn.textContent = i
        numBtn.value = i
        numBtn.addEventListener('click', () => checkChanceNum(numBtn))
        chanceNumBtns.appendChild(numBtn)
    }
}

const checkChanceNum = (numBtn) => {
    if (parseInt(numBtn.value) === randomChanceNum) {
        //if the player won, run the complete game function
        completeChanceGame(true)
    } else {
        numBtn.classList.add('btn-disabled')
        chanceTries--

        const triesLeft = document.querySelector('#chance-tries-left')
        triesLeft.textContent = chanceTries

        // Player loses if they run out of tries
        if (chanceTries < 1) {
            completeChanceGame(false)
        }
    }
}

const completeChanceGame = (playerWon) => {
    const chanceGame = document.querySelector('#chance-game')
    chanceGame.remove()

    // Calculate points awarded based on remaining tries
    chancePointsAwarded = chanceTries * 10

    gameContainer.insertAdjacentHTML(
        'beforeend',
        `<h4 class="text-neutral text-center my-4 text-lg">${playerWon ? 'You won!' : 'You lost...'}</h4>
        <p class="text-center font-bold">You were awarded $<span id="chance-money">${chancePointsAwarded}</span></p>
        <div class="flex justify-center mt-3">
            <button id="finish-chance-btn" class="btn btn-sm">finish</button>
        </div>`
    )

    const finishChanceBtn = document.querySelector('#finish-chance-btn')
    finishChanceBtn.addEventListener('click', () => {
        // close the modal
        minigameModal.close()

        // award the money and display it
        updateAndRenderMoney('increase', chancePointsAwarded)

        // reset the trivia game
        resetMiniGame()
    })
}

// PET SKILLS TRAINING ---------------------------------------------

// Fetch petSkills from server
const getPetSkills = async () => {
    try {
        const res = await fetch('/api/petskills')
        return await res.json()
    } catch (err) {
        console.error(err)
    }
}

// Update pet skills and corresponding bar and label
const updateAndRenderPetSkill = async (skill, amount) => {
    let skillData

    // Send PUT (update) request to the server for specified skill
    try {
        const res = await fetch(`/api/petskills/${skill}`, {
            method: 'PUT',
            headers: {
                "Content-Type": 'application/json'
            },
            body: JSON.stringify({
                amount: amount
            })
        })

        skillData = await res.json()
    } catch (err) {
        console.error(err)
    }

    // Render the update skill in the DOM (bar and label)
    const skillBar = document.querySelector(`#${skill}-bar`)
    const skillLabel = document.querySelector(`#${skill}-label`)

    skillBar.value = skillData[skill]
    skillLabel.textContent = skillData[skill]
}

// Renders the current skill levels in the Skill Training Modal
const renderSkillLevelsInModal = async () => {
    let petSkillLevels = await getPetSkills()

    const skillModalLabels = document.querySelectorAll('.skill-modal-labels')
    skillModalLabels.forEach(label => {
        let skill = label.dataset.name
        label.textContent = petSkillLevels[skill]
    })

    // Remove the intensity buttons if the skill is maxed out
    for (skill in petSkillLevels) {
        if (petSkillLevels[skill] === 10) {
            const intensityBtns = document.querySelector(`#${skill}-intensity-btns`)
            while (intensityBtns.firstChild) {
                intensityBtns.removeChild(intensityBtns.firstChild)
            }
            intensityBtns.insertAdjacentHTML(
                'beforeend',
                `skill maxed out`
            )
        }
    }
}

// Train a pet skill
const trainSkill = async (skill, level) => {
    const skillTrainingContainer = document.querySelector('#skill-training-container')
    const chooseSkillTraining = document.querySelector('#choose-skill-training')
    const closeSkillTrainingBtn = document.querySelector('#close-skill-training-btn')

    // Get the current pet skill levels
    let petSkillLevels = await getPetSkills()

    // remove the choose skill training section
    chooseSkillTraining.remove()

    // insert the loading bar into the DOM
    skillTrainingContainer.insertAdjacentHTML(
        'beforeend',
        `<p class="my-4 text-neutral text-center">Training ${skill} skill, ${level} intensity</p>
        <progress class="progress"></progress>`
    )
    closeSkillTrainingBtn.classList.add('hidden')

    // After a few seconds, increase the pet's skills
    setTimeout(async () => {
        switch (skill) {
            case 'agility':
                updatePetNeedBars('health', 'decrease', level === 'low' ? 5 : 10)
                updateAndRenderPetSkill('agility', level === 'low' ? 1 : 3)
                break
            case 'strength':
                updatePetNeedBars('health', 'decrease', level === 'low' ? 5 : 10)
                updateAndRenderPetSkill('strength', level === 'low' ? 1 : 3)
                break
            case 'intelligence':
                updatePetNeedBars('hunger', 'decrease', level === 'low' ? 5 : 10)
                updateAndRenderPetSkill('intelligence', level === 'low' ? 1 : 3)
                break
            case 'stealth':
                updatePetNeedBars('hunger', 'decrease', level === 'low' ? 5 : 10)
                updateAndRenderPetSkill('stealth', level === 'low' ? 1 : 3)
                break
            case 'endurance':
                updatePetNeedBars('health', 'decrease', level === 'low' ? 5 : 10)
                updateAndRenderPetSkill('endurance', level === 'low' ? 1 : 3)
                break
            case 'hunting':
                updatePetNeedBars('hunger', 'decrease', level === 'low' ? 5 : 10)
                updateAndRenderPetSkill('hunting', level === 'low' ? 1 : 3)
                break
        }

        // update the petSkillLevels variable with the new levels
        petSkillLevels = await getPetSkills()

        // Remove loading bar from DOM
        while (skillTrainingContainer.firstChild) {
            skillTrainingContainer.removeChild(skillTrainingContainer.firstChild)
        }

        // Insert the training results into the DOM
        skillTrainingContainer.insertAdjacentHTML(
            'beforeend',
            `<p class="my-4 text-neutral text-center">${skill} skill increased by ${level === 'low' ? 1 : 3}!</p>
            <div class="flex justify-center">
                <button id="finish-skill-training-btn" class="btn btn-sm">finish</button>
            </div>`
        )
        closeSkillTrainingBtn.classList.remove('hidden')

        // Add the training results to the History
        addToHistory(`${myPet.name} increased their ${skill} skill to ${petSkillLevels[skill]}`)

        // When a user clicks "finish", the skill modal closes and resets
        const finishSkillTrainingBtn = document.querySelector('#finish-skill-training-btn')
        finishSkillTrainingBtn.addEventListener('click', () => {
            // close modal
            const skillTrainingModal = document.querySelector('#skill-training-modal')
            skillTrainingModal.close()

            // reset the modal
            while (skillTrainingContainer.firstChild) {
                skillTrainingContainer.removeChild(skillTrainingContainer.firstChild)
            }
            skillTrainingContainer.appendChild(chooseSkillTraining)

            // Check for maxed skills
            if (petSkillLevels[skill] === 10) {
                sendToastMsg(`Congratulations! You maxxed out the ${skill} skill!`)
            }

            // Check for achievements
            if (Object.values(petSkillLevels).reduce((acc, curr) => acc + curr, 0) === 60) {
                awardAchievement('skill-master')
                sendToastMsg('Congratulations! You maxxed out every skill and earned the Skill Master Achievement!')
                addToHistory(`${myPet.name} earned the Skill Master achievement!`)
            }
        })

    }, level === 'low' ? 3000 : 5000)
}


// PET CONTESTS ---------------------------------------------
let contestsWon = {
    'agility-challenge': false,
    'strength-showdown': false,
    'mind-maze': false,
    'stealthy-infiltration': false,
    'endurance-marathon': false,
    'hunting-expedition': false
}

const enterContest = async (contest, mainSkill, otherSkill) => {
    const contestContainer = document.querySelector('#contest-container')
    const chooseContest = document.querySelector('#choose-a-contest')
    const closeContestBtn = document.querySelector('#close-contest-btn')

    // remove choose contest
    chooseContest.remove()

    // insert the loading bar into the DOM
    contestContainer.insertAdjacentHTML(
        'beforeend',
        `<p class="my-4 text-neutral text-center">Entering the ${contest.replace('-', ' ')} contest</p>
        <progress class="progress"></progress>`
    )
    closeContestBtn.classList.add('hidden')

    // Get the current pet skill levels
    let petSkillLevels = await getPetSkills()

    // After a few seconds, show the contest's results
    setTimeout(() => {
        // Calculate the percent chance of winning based on pet's skills
        const main = petSkillLevels[mainSkill] * 7
        const other = petSkillLevels[otherSkill] * 2
        let percentChance = (main + other) / 100

        let randomValue = Math.random()
        let playerWon

        if (randomValue < percentChance) {
            playerWon = true
            contestsWon[contest] = true
            updateAndRenderMoney('increase', 30)
        } else {
            playerWon = false
        }

        // Remove loading bar from DOM
        while (contestContainer.firstChild) {
            contestContainer.removeChild(contestContainer.firstChild)
        }

        // Insert the training results into the DOM
        contestContainer.insertAdjacentHTML(
            'beforeend',
            `<p class="my-4 text-neutral text-center">${playerWon ? 'Congratulations, you won! You recieved $30' : 'Sorry, you lost. Try again later'}</p>
            <div class="flex justify-center">
                <button id="finish-contest-btn" class="btn btn-sm">finish</button>
            </div>`
        )

        // Add the contest results to the History
        addToHistory(`${myPet.name} ${playerWon ? 'won' : 'lost'} the ${contest.replace('-', ' ')} contest`)

        // When a user clicks "finish", the skill modal closes and resets
        const finishContestBtn = document.querySelector('#finish-contest-btn')
        finishContestBtn.addEventListener('click', async () => {
            // close modal
            const enterContestModal = document.querySelector('#enter-contest-modal')
            enterContestModal.close()

            // reset the modal
            while (contestContainer.firstChild) {
                contestContainer.removeChild(contestContainer.firstChild)
            }
            contestContainer.appendChild(chooseContest)

            closeContestBtn.classList.remove('hidden')

            // Check for achievements
            if (Object.values(contestsWon).every(contest => contest === true)) {
                const res = await fetch('/api/achievement/contest-conqueror')
                const achievement = await res.json()

                if (!achievement.earned) {
                    awardAchievement('contest-conqueror')
                    sendToastMsg('Congrats! You earned the Contest Conqueror achievement!')
                    addToHistory(`${myPet.name} earned the Contest Conqueror achievement!`)
                }
            }
        })

    }, 3000)
}


// GO ON ADVENTURES ---------------------------------------------
const adventureContainer = document.querySelector('#adventure-container')
const chooseStartPoint = document.querySelector('#choose-starting-point')
const closeAdventureBtn = document.querySelector('#close-adventure-btn')

const resetAdventureModal = () => {
    while (adventureContainer.firstChild) {
        adventureContainer.removeChild(adventureContainer.firstChild)
    }
    adventureContainer.appendChild(chooseStartPoint)
}
closeAdventureBtn.addEventListener('click', resetAdventureModal)

// START ADVENTURE (Render the set of options based on starting point)
const startAdventure = async (startingPoint) => {
    chooseStartPoint.remove()

    const res = await fetch(`/api/adventure/${startingPoint}`)
    const location = await res.json()

    adventureContainer.insertAdjacentHTML(
        'beforeend',
        `<p class="my-4 text-xs">Location: ${startingPoint}</p>
        <p class="text-neutral text-sm my-4">What would you like to do?</p>

        <div id="first-option" class="grid grid-cols-3 gap-5 h-36 mt-5">
            <div id=""
                class="bg-primary text-primary-content text-center flex items-center justify-center transition-all hover:cursor-pointer hover:shadow hover:-translate-y-1" data-name=${Object.keys(location)[0]}>
                ${Object.keys(location)[0].replaceAll('-', ' ')}
            </div>
            <div id=""
                class="bg-secondary text-secondary-content text-center flex items-center justify-center transition-all hover:cursor-pointer hover:shadow hover:-translate-y-1" data-name=${Object.keys(location)[1]}>
                ${Object.keys(location)[1].replaceAll('-', ' ')}
            </div>
            <div id=""
                class="bg-accent text-accent-content text-center flex items-center justify-center transition-all hover:cursor-pointer hover:shadow hover:-translate-y-1" data-name=${Object.keys(location)[2]}>
                ${Object.keys(location)[2].replaceAll('-', ' ')}
            </div>
        </div>`
    )

    const firstOptionBtns = document.querySelectorAll('#first-option div')
    firstOptionBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            while (adventureContainer.firstChild) {
                adventureContainer.removeChild(adventureContainer.firstChild)
            }

            adventureResults(startingPoint, btn.dataset.name, location[btn.dataset.name])
        })
    })
}

// SHOW THE RESULTS OF THE ADVENTURE
const adventureResults = async (startingPoint, optionName, chosenOption) => {
    // Hide the close button
    closeAdventureBtn.classList.add('hidden')

    // Get the pet's skills
    let skills = await getPetSkills()

    // Determine whether the outcome will be positive or negative based on pet's personality/skills
    let outcome
    switch (chosenOption.condition.category) {
        case 'skill':
            skills[chosenOption.condition.type] > chosenOption.condition.value ? outcome = 'positive' : outcome = 'negative'
            break
        case 'personality':
            myPet.personality === chosenOption.condition.value ? outcome = 'positive' : outcome = 'negative'
            break
    }

    // Add results the DOM
    adventureContainer.insertAdjacentHTML(
        'beforeend',
        `<p class="my-4 text-xs">Location: ${startingPoint}</p>
        <p class="my-4 text-xs">Choice: ${optionName.replaceAll('-', ' ')}</p>
        <p class="text-neutral text-sm my-4">${chosenOption[outcome].description}</p>
        <div class="flex justify-center">
            <button id="finish-adventure-btn" class="btn btn-sm">finish</button>
        </div>`
    )
    closeAdventureBtn.classList.add('hidden')


    // When a user clicks "finish", the skill modal closes and resets
    const finishAdventureBtn = document.querySelector('#finish-adventure-btn')
    finishAdventureBtn.addEventListener('click', async () => {
        // close modal
        const adventureModal = document.querySelector('#adventure-modal')
        adventureModal.close()

        // reset the modal
        resetAdventureModal()

        // Earn reward 
        let reward = chosenOption[outcome].reward

        switch (reward.type) {
            case 'need':
                updatePetNeedBars(reward.arguments.need, reward.arguments.direction, reward.arguments.amount)
                break
            case 'money':
                updateAndRenderMoney(reward.arguments.direction, reward.arguments.amount)
                break
            case 'skill': 
                updateAndRenderPetSkill(reward.arguments.skill, reward.arguments.amount)
        }

        // Add a history moment
        addToHistory(`${myPet.name} had a ${outcome} outcome on an adventure`)
    })
}








// for (const child of choosePet.children) {
//     child.addEventListener('click', () => renderGame(child.id))
// }



