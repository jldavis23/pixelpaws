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
        renderInvQtys()

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


// RENDER INVENTORY QUANTITIES ---------------------------------------------
const renderInvQtys = () => {
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
        renderInvQtys()
    } else {
        console.log('not enough money')
    }
}


// for (const child of choosePet.children) {
//     child.addEventListener('click', () => renderGame(child.id))
// }



