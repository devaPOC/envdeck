import { app, ipcMain } from 'electron'

export function registerAppHandlers(): void {
  ipcMain.handle('app:getVersion', (): string => app.getVersion())
  ipcMain.handle('app:showAbout', (): void => app.showAboutPanel())
}
