const dashboard = document.querySelector('#dashboard')
const choosePet = document.querySelector('#choose-pet')
const petPic = document.querySelector('#pet-pic')

for (const child of choosePet.children) {
    child.addEventListener('click', () => renderGame(child.id))
}

const renderGame = (pet) => {
    petPic.src = `images/${pet}.jpg`
    dashboard.classList.remove('hidden')

    const beginScreen = document.querySelector('#begin-screen')
    beginScreen.classList.add('hidden')
}