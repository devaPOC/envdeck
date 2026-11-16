import { app, BrowserWindow, Menu, shell, type MenuItemConstructorOptions } from 'electron'

const isMac = process.platform === 'darwin'

export function buildApplicationMenu(): Menu {
  const template: MenuItemConstructorOptions[] = [
    ...(isMac
      ? ([
          {
            label: app.name,
            submenu: [
              { role: 'about' },
              { type: 'separator' },
              { role: 'services' },
              { type: 'separator' },
              { role: 'hide' },
              { role: 'hideOthers' },
              { role: 'unhide' },
              { type: 'separator' },
              { role: 'quit' }
            ]
          }
        ] as MenuItemConstructorOptions[])
      : []),
    {
      label: 'File',
      submenu: [
        {
          // No accelerator on purpose: Electron's "close" role defaults to
          // Cmd+W, which is a native menu accelerator — a completely
          // separate input path from DOM keydown events, so the renderer's
          // own Cmd+W handler (close the active tab) could never intercept
          // or preventDefault() it. Leaving this unbound lets Cmd+W reach
          // the renderer instead; closing the actual window is still
          // available via the red traffic-light button.
          label: 'Close Window',
          click: (): void => BrowserWindow.getFocusedWindow()?.close()
        }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'zoom' },
        ...(isMac
          ? ([{ type: 'separator' }, { role: 'front' }] as MenuItemConstructorOptions[])
          : [])
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'EnvDeck on GitHub',
          click: (): void => {
            void shell.openExternal('https://github.com/devaPOC/envdeck')
          }
        }
      ]
    }
  ]

  return Menu.buildFromTemplate(template)
}
