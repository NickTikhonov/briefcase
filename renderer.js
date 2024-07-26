let startTime
let timerInterval
let isRunning = false
const rate = 60 // $60 per hour

function toggleTimer() {
  if (isRunning) {
    clearInterval(timerInterval)
    isRunning = false
  } else {
    startTime = Date.now() - (startTime ? startTime : 0)
    timerInterval = setInterval(updateDisplay, 1000)
    isRunning = true
  }
}

function updateDisplay() {
  const elapsedTime = Date.now() - startTime
  const hours = elapsedTime / 3600000
  const amount = (hours * rate).toFixed(2)
  document.getElementById('timer').textContent = `$${amount}`
}

document.addEventListener('DOMContentLoaded', () => {
  document.body.addEventListener('click', toggleTimer)
})