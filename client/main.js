// RENDER THE GAME ----------------------------
const main = document.querySelector('#main')
const choosePetForm = document.querySelector('#choose-pet-form')
const dashboard = document.querySelector('#dashboard')
dashboard.remove()


let myPet = {
    type: '',
    name: '',
    personality: '',
}

const renderGame = (e) => {
    e.preventDefault()

    main.appendChild(dashboard)

    decayPetNeeds('happiness')
    decayPetNeeds('health')
    decayPetNeeds('hunger')
    decayPetNeeds('sleep')

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
    
    choosePetForm.remove()
}

const beginGameBtn = document.querySelector('#begin-game')
beginGameBtn.addEventListener('click', renderGame)

// PET NEEDS DECAY ----------------------------
const decayPetNeeds = (need) => {
    const needBar = document.querySelector(`#${need}-bar`)
    const needLabel = document.querySelector(`#${need}-label`)

    if (needBar.value > 0) {
        setTimeout(() => {
            needBar.value = needBar.value - 1
            needLabel.textContent = `${needBar.value}%`
            decayPetNeeds(need)
        }, 5000)
    }   
}



// for (const child of choosePet.children) {
//     child.addEventListener('click', () => renderGame(child.id))
// }