import { app, BrowserWindow, shell } from 'electron'
import { join } from 'path'
import { registerSshHandlers, disconnectAllSsh } from './ipc/ssh'
import { registerSftpHandlers } from './ipc/sftp'
import { registerDockerHandlers } from './ipc/docker'
import { registerServerHandlers } from './ipc/servers'
import { registerTerminalHandlers, closeAllTerminals } from './ipc/terminal'
import { registerAppHandlers } from './ipc/app'

const isDev = !app.isPackaged

function createWindow(): void {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    show: false,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  })

  win.on('ready-to-show', () => win.show())

  win.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (isDev && process.env['ELECTRON_RENDERER_URL']) {
    win.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    win.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  app.setAboutPanelOptions({
    applicationName: 'EnvDeck',
    applicationVersion: app.getVersion(),
    version: app.getVersion(),
    website: 'https://github.com/devaPOC/envdeck',
    iconPath: join(__dirname, '../../resources/icon.png')
  })

  registerSshHandlers()
  registerSftpHandlers()
  registerDockerHandlers()
  registerServerHandlers()
  registerTerminalHandlers()
  registerAppHandlers()

  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('before-quit', () => {
  closeAllTerminals()
  disconnectAllSsh()
})
