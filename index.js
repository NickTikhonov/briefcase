const { app, Tray, Menu, BrowserWindow, ipcMain } = require('electron')
const path = require('path')

let tray
let isRunning = false
let startTime
let timerInterval
let rate = 150 // $150 per hour
let rateWindow
let summaryWindow

function createTray() {
  const iconPath = path.join(app.getAppPath(), 'brief.png')
  tray = new Tray(iconPath)

  tray.setTitle(' $0.00')

  const contextMenu = Menu.buildFromTemplate([
    { label: 'Start/Pause', click: toggleTimer },
    { label: 'Reset', click: resetTimer },
    { label: 'Modify Rate', click: createRateWindow },
    { label: 'Show Summary', click: createSummaryWindow },
    { label: 'Quit', click: () => app.quit() }
  ])

  tray.setContextMenu(contextMenu)
}

app.on('ready', () => {
  createTray()
})

app.on('window-all-closed', (e) => {
  e.preventDefault()
})

function toggleTimer() {
  if (isRunning) {
    clearInterval(timerInterval)
    isRunning = false
  } else {
    startTime = startTime || Date.now()
    timerInterval = setInterval(updateDisplay, 150)
    isRunning = true
  }
}

function updateDisplay() {
  const elapsedTime = Date.now() - startTime
  const hours = elapsedTime / 3600000
  const amount = (hours * rate).toFixed(2)
  const render = isNaN(amount) ? ' $0.00' : ` $${amount}`
  tray.setTitle(render)
  
  if (summaryWindow) {
    summaryWindow.webContents.send('update-summary', { hours, amount, rate })
  }
}

function resetTimer() {
  clearInterval(timerInterval)
  isRunning = false
  startTime = null
  tray.setTitle(' $0.00')
}

function createRateWindow() {
  if (rateWindow) {
    rateWindow.focus()
    return
  }

  rateWindow = new BrowserWindow({
    width: 300,
    height: 270,
    show: false,
    frame: true,
    fullscreenable: false,
    resizable: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  })

  rateWindow.loadFile('rate.html')
  rateWindow.once('ready-to-show', () => {
    rateWindow.show()
  })

  rateWindow.on('closed', () => {
    rateWindow = null
  })
}

function createSummaryWindow() {
  if (summaryWindow) {
    summaryWindow.focus()
    return
  }

  summaryWindow = new BrowserWindow({
    width: 400,
    height: 400,
    show: false,
    frame: true,
    fullscreenable: false,
    resizable: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  })

  summaryWindow.loadFile('summary.html')
  summaryWindow.once('ready-to-show', () => {
    summaryWindow.show()
    updateDisplay() // Initial update of summary
  })

  summaryWindow.on('closed', () => {
    summaryWindow = null
  })
}

ipcMain.on('get-rate', (event) => {
  event.returnValue = rate
})

ipcMain.on('update-rate', (event, newRate) => {
  rate = parseFloat(newRate)
  if (rateWindow) {
    rateWindow.close()
  }
  updateDisplay() // Update display with new rate
})