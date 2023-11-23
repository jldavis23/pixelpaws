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

const renderGame = (e) => {
    e.preventDefault()

    // Add the dashboard to the DOM
    main.appendChild(dashboard)

    // Start decaying the pet's needs for each category
    decayPetNeed('happiness')
    decayPetNeed('health')
    decayPetNeed('hunger')
    decayPetNeed('sleep')

    // Assign the selected pet type
    const petOptions = document.getElementsByName('pet-options')
    let selectedPet
    for (let i = 0; i < petOptions.length; i++) {
        if (petOptions[i].checked) selectedPet = petOptions[i].value
    }
    myPet.type = selectedPet
    const petPic = document.querySelector('#pet-pic')
    petPic.src = `images/${selectedPet}.jpg`

    // Assign the inputed name
    const nameInput = document.querySelector('#name-input')
    myPet.name = nameInput.value
    const petName = document.querySelector('#pet-name')
    petName.textContent = nameInput.value

    // Assign the pet's personality
    const personalityOptions = document.getElementsByName('personality-options')
    let selectedPersonality
    for (let i = 0; i < personalityOptions.length; i++) {
        if (personalityOptions[i].checked) selectedPersonality = personalityOptions[i].value
    }
    myPet.personality = selectedPersonality
    const petPersonality = document.querySelector('#pet-personality')
    petPersonality.textContent = selectedPersonality

    // Display the player's money
    const moneyDisplay = document.querySelector('#money')
    moneyDisplay.textContent = money

    // Remove the beginning Choose Pet Form
    choosePetForm.remove()


    // Render Purchase Items modal
    const purchaseItemsModal = document.querySelector('#purchase-items-modal')
    const purchaseItemsBtn = document.querySelector('#purchase-items-btn')
    purchaseItemsBtn.addEventListener('click', () => purchaseItemsModal.showModal())

    document.querySelector('#purchase-items-money').textContent = money

    const buyBtns = document.querySelectorAll('.buy-btns')
    buyBtns.forEach(btn => {
        btn.addEventListener('click', () => purchaseAnItem(btn.name, parseInt(btn.value)))
    })


    // Render the Mini-Games Modal
    const minigameModal = document.querySelector('#minigames-modal')
    const minigameBtn = document.querySelector('#play-minigame-btn')
    minigameBtn.addEventListener('click', () => minigameModal.showModal())

    const triviaBtn = document.querySelector('#trivia-btn')
    triviaBtn.addEventListener('click', startTrivaGame)


    // Add event listeners to the inventory feed buttons
    const feedBtns = document.querySelectorAll('.feed-btns')
    feedBtns.forEach(btn => {
        btn.addEventListener('click', () => feedPet(btn.name))
    })
}

const beginGameBtn = document.querySelector('#begin-game')
beginGameBtn.addEventListener('click', renderGame)


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


// TRIVIA MINIGAME ---------------------------------------------
let questions
let currentQuestionIndex = 0

const startTrivaGame = async () => {
    const minigameTitle = document.querySelector('#minigame-title')
    const gameContainer = document.querySelector('#game-container')
    const chooseMinigame = document.querySelector('#choose-minigame')

    // Remove the minigame selection
    minigameTitle.textContent = 'Animal Trivia'
    gameContainer.removeChild(chooseMinigame)

    // Fetch trivia questions
    const res = await fetch('https://opentdb.com/api.php?amount=3&category=27&type=multiple')
    const data = await res.json()
    questions = await data.results

    // Insert the trivia game in the DOM
    gameContainer.insertAdjacentHTML(
        'beforeend',
        `<div>

            <h4 class="my-4 text-primary"><span class="text-sm">(${currentQuestionIndex + 1}/3)</span> ${questions[currentQuestionIndex].question}</h4>

            <div id="trivia-choices" class="flex flex-col gap-5">
                <button class="btn btn-outline w-full">${questions[currentQuestionIndex].correct_answer}</button>
                <button class="btn btn-outline w-full">${questions[currentQuestionIndex].incorrect_answers[0]}</button>
                <button class="btn btn-outline w-full">${questions[currentQuestionIndex].incorrect_answers[1]}</button>
                <button class="btn btn-outline w-full">${questions[currentQuestionIndex].incorrect_answers[2]}</button>
            </div>

            <div id="trivia-feedback" class="opacity-0">
                <p class="my-4 text-center"></p>

                <div class="flex justify-center">
                    <button class="btn btn-sm">next</button>
                </div>
            </div>
        </div>`
    )

    const triviaChoices = document.querySelector('#trivia-choices')
    for (const btn of triviaChoices.children) {
        btn.addEventListener('click', () => checkAnswer(btn.textContent))
    }

    const triviaFeedback = document.querySelector('#trivia-feedback')
}

const checkAnswer = (answer) => {

}


// for (const child of choosePet.children) {
//     child.addEventListener('click', () => renderGame(child.id))
// }



