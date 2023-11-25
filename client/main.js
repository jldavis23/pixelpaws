// RENDER THE GAME ---------------------------------------------
const main = document.querySelector('#main')
const choosePetForm = document.querySelector('#choose-pet-form')
const dashboard = document.querySelector('#dashboard')
dashboard.remove()


//DATA
let money = 80

let myPet = {
    type: '',
    name: '',
    personality: '',
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

const renderGame = (e) => {
    e.preventDefault()

    // Add the dashboard to the DOM
    main.appendChild(dashboard)

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
    myPet.type = selectedPet
    const petPic = document.querySelector('#pet-pic')
    petPic.src = `images/${selectedPet}.jpg`

    // Assign the inputed name
    const nameInput = document.querySelector('#name-input')
    if (!nameInput.value) {
        dashboard.remove()
        alert('please choose a name for your pet')
        return
    }
    myPet.name = nameInput.value
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
    myPet.personality = selectedPersonality
    const petPersonality = document.querySelector('#pet-personality')
    petPersonality.textContent = selectedPersonality

    // Start decaying the pet's needs for each category
    decayPetNeed('happiness')
    decayPetNeed('health')
    decayPetNeed('hunger')
    decayPetNeed('sleep')

    // Display the player's money
    const moneyDisplay = document.querySelector('#money')
    moneyDisplay.textContent = money

    // Add a welcome history moment
    addToHistory(`Congrats! You adopted ${myPet.name}`)

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

    document.querySelector('#purchase-items-money').textContent = money

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


    // Render Go on Adventure Modal


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

// ADD A HISTORY MOMENT ---------------------------------------------
const addToHistory = (text) => {
    const historyContainer = document.querySelector('#history-container')

    historyContainer.insertAdjacentHTML(
        'afterbegin',
        `<li class="border-b py-2 text-xs">${text}</li>`
    )
}

// PET NEEDS DECAY ---------------------------------------------
const decayPetNeed = (need) => {
    const needBar = document.querySelector(`#${need}-bar`)
    const needLabel = document.querySelector(`#${need}-label`)

    if (needBar.value > 0) {
        setTimeout(() => {
            needBar.value = needBar.value - 1
            needLabel.textContent = `${needBar.value}%`
            decayPetNeed(need)
        }, 5000)
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


// FEED PET ---------------------------------------------
const feedPet = (item) => {
    if (myInventory[item] > 0) {
        // decrease the item quanitity
        myInventory[item]--
        updateInvQtys()

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


    } else {
        console.log(`you have no ${item}`)
    }
}


// UPDATE INVENTORY QUANTITIES ---------------------------------------------
const updateInvQtys = () => {
    for (let item in myInventory) {
        const qtyDisplay = document.querySelector(`#${item}-qty`)
        qtyDisplay.textContent = myInventory[item]
    }
}


// PURCHASE ITEMS ---------------------------------------------
const purchaseAnItem = (item, price) => {
    if (money >= price) {
        // Subtract price from Money, display in the DOM
        money = money - price
        document.querySelector('#money').textContent = money //main money display
        document.querySelector('#purchase-items-money').textContent = money //money display inside modal

        // Add item to inventory object, display in DOM
        myInventory[item]++
        updateInvQtys()
    } else {
        console.log('not enough money')
    }
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

const renderTriviaGame = async () => {
    // reset the variables
    questions = null
    currentQuestionIndex = 0
    triviaPointsAwarded = 0

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
        finishTriviaBtn.addEventListener('click', () => {
            // close the modal
            minigameModal.close()

            // award the money and display it
            money = money + triviaPointsAwarded
            document.querySelector('#money').textContent = money

            // reset the trivia game
            resetMiniGame()
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
        money = money + chancePointsAwarded
        document.querySelector('#money').textContent = money

        // reset the trivia game
        resetMiniGame()
    })
}

// PET SKILLS TRAINING ---------------------------------------------

// Update pet skills and corresponding bars
const updatePetSkill = (skill, amount) => {
    petSkills[skill] = petSkills[skill] + amount

    // if a skill goes over 10, set it back to 10
    if (petSkills[skill] >= 10) {
        petSkills[skill] = 10
    }

    const skillBar = document.querySelector(`#${skill}-bar`)
    const skillLabel = document.querySelector(`#${skill}-label`)

    skillBar.value = petSkills[skill]
    skillLabel.textContent = petSkills[skill]
}

// Renders the current skill levels in the Skill Training Modal
const renderSkillLevelsInModal = () => {
    const skillModalLabels = document.querySelectorAll('.skill-modal-labels')
    skillModalLabels.forEach(label => {
        let skill = label.dataset.name
        label.textContent = petSkills[skill]
    })

    // Remove the intensity buttons if the skill is maxed out
    for (skill in petSkills) {
        if (petSkills[skill] === 10) {
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
const trainSkill = (skill, level) => {
    const skillTrainingContainer = document.querySelector('#skill-training-container')
    const chooseSkillTraining = document.querySelector('#choose-skill-training')
    const closeSkillTrainingBtn = document.querySelector('#close-skill-training-btn')

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
    setTimeout(() => {
        switch (skill) {
            case 'agility':
                updatePetNeedBars('health', 'decrease', level === 'low' ? 5 : 10)
                updatePetSkill('agility', level === 'low' ? 1 : 3)
                break
            case 'strength':
                updatePetNeedBars('health', 'decrease', level === 'low' ? 5 : 10)
                updatePetSkill('strength', level === 'low' ? 1 : 3)
                break
            case 'intelligence':
                updatePetNeedBars('hunger', 'decrease', level === 'low' ? 5 : 10)
                updatePetSkill('intelligence', level === 'low' ? 1 : 3)
                break
            case 'stealth':
                updatePetNeedBars('hunger', 'decrease', level === 'low' ? 5 : 10)
                updatePetSkill('stealth', level === 'low' ? 1 : 3)
                break
            case 'endurance':
                updatePetNeedBars('health', 'decrease', level === 'low' ? 5 : 10)
                updatePetSkill('endurance', level === 'low' ? 1 : 3)
                break
            case 'hunting':
                updatePetNeedBars('hunger', 'decrease', level === 'low' ? 5 : 10)
                updatePetSkill('hunting', level === 'low' ? 1 : 3)
                break
        }

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
        addToHistory(`${myPet.name} increased their ${skill} skill to ${petSkills[skill]}`)

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
            if (petSkills[skill] === 10) {
                console.log(`congratulations! You maxxed out the ${skill} skill!`)
            }

            // Check for achievements
            if (Object.values(petSkills).reduce((acc, curr) => acc + curr, 0) === 60) {
                console.log('congratulations! You maxxed out EVERY SKILL!')
            }
        })

    }, level === 'low' ? 3000 : 5000)
}





// for (const child of choosePet.children) {
//     child.addEventListener('click', () => renderGame(child.id))
// }



