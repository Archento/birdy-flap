/* global Audio, Image */

const gameOverScreen = document.querySelector('#game-over-screen')
gameOverScreen.hidden = true

const pointsField = document.querySelector('#points')
let points = 0
const highscoreField = document.querySelector('#highscore')
let highscore = 0

const soundCheck = document.querySelector('#soundon')

const pipeCollector = []

document.addEventListener('keydown', logKey)

const canvas = document.querySelector('#canvas')
canvas.width = 1920
canvas.height = 1080

const ctx = canvas.getContext('2d')

const flapSound = new Audio('audio/spawn.mp3')
flapSound.volume = 0.1
const deathSound = new Audio('audio/death.mp3')
deathSound.volume = 0.1

const getRandomInt = (max) => Math.floor(Math.random() * max)

class Bird {
  constructor () {
    this.x = 100
    this.y = 50
    this.width = 200
    this.height = 145
    this.image = new Image(this.width, this.height)
    this.image.src = 'img/bird200.png'
  }

  draw () {
    ctx.drawImage(this.image, this.x, this.y)
  }

  movement () {
    if (this.y < canvas.height - this.height) {
      this.y += 8
    }
    this.draw()
    this.collision()
  }

  jump () {
    if (this.y > 97) this.y -= 125
  }

  collision () {
    if (this.y + this.height > canvas.height) stopGame()
    const currentPipes = pipeCollector[0]?.x ? pipeCollector[0] : undefined
    if (currentPipes) {
      if (
        (this.x < currentPipes.x + currentPipes.width &&
        this.x + this.width > currentPipes.x &&
        this.y < currentPipes.upper.y + currentPipes.upper.height) ||
        (this.x < currentPipes.x + currentPipes.width &&
        this.x + this.width > currentPipes.x &&
        this.y + this.height > currentPipes.lower.y)
      ) {
        stopGame()
      }
    }
  }
}

class PipePair {
  constructor () {
    this.x = canvas.width
    this.width = 260
    this.upper = {
      y: 0,
      pic: 'img/pipe-upper.png',
      height: 600
    }
    this.lower = {
      y: 800,
      pic: 'img/pipe-lower.png',
      height: 600
    }
  }

  init () {
    this.upper.y = getRandomInt(450) - 450
    this.upper.image = new Image()
    this.upper.image.src = this.upper.pic
    this.lower.y = this.upper.y + 330 + this.upper.height
    this.lower.image = new Image()
    this.lower.image.src = this.lower.pic
    pipeCollector.push(this)
  }

  draw () {
    ctx.drawImage(this.upper.image, this.x, this.upper.y)
    ctx.drawImage(this.lower.image, this.x, this.lower.y)
  }

  countPoints () { // mitte vom vogel - mitte vom rohr
    points++
    pointsField.innerHTML = points
    if (points > highscore) {
      highscore = points
      highscoreField.innerHTML = `Highscore: ${highscore}`
    }
  }

  movement () {
    if (this.x === 70) this.countPoints()
    if ((this.x + this.width) > 0) {
      this.x -= 10
      this.draw()
    } else {
      delete this
    }
  }
}

class Back {
  constructor (source, speed = 0) {
    this.x = 0
    this.y = 0
    this.width = 1920
    this.height = 1080
    this.speed = speed
    this.image = new Image(this.width, this.height)
    this.image.src = source
  }

  draw () {
    ctx.drawImage(this.image, this.x, this.y)
    if (this.speed !== 0) ctx.drawImage(this.image, this.x + this.width, this.y)
  }

  movement () {
    this.x -= this.speed
    if (this.x === -this.width) this.x = 0
    this.draw()
  }
}

// parallax background effect
const bg1 = new Back('img/bg/3.png')
const bg2 = new Back('img/bg/2.png', 1)
const bg3 = new Back('img/bg/1.png', 2)
const backgrounds = [bg1, bg2, bg3]

let birdy = null

let pipeInterval
const initGame = () => {
  if (animationLoop) window.cancelAnimationFrame(animationLoop)
  if (pipeInterval) clearInterval(pipeInterval)
  points = 0
  pointsField.innerHTML = points
  birdy = new Bird()
  pipeCollector.length = 0
  pipeInterval = 0
}

let animationLoop
const render = () => {
  animationLoop = window.requestAnimationFrame(render)
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  backgrounds.forEach(bg => bg.movement())
  birdy.movement()
  pipeCollector.forEach(pipe => pipe.movement())
  if (pipeCollector[0]?.x === -260) pipeCollector.shift()
}

const startGame = () => {
  gameOverScreen.hidden = true
  pipeInterval = setInterval(() => {
    const pipeset = new PipePair()
    pipeset.init()
  }, 1500) // new pipe every 1,5 seconds
  render()
}

const stopGame = () => {
  if (soundCheck.checked === true) deathSound.play()
  window.cancelAnimationFrame(animationLoop)
  clearInterval(pipeInterval)
  gameOverScreen.hidden = false
}

function logKey (e) {
  if (e.code === 'ArrowUp') {
    birdy.jump()
    if (soundCheck.checked === true) {
      flapSound.load()
      flapSound.play()
    }
  }
}

document.querySelector('#start-button').addEventListener('click', function () {
  initGame()
  startGame()
})
