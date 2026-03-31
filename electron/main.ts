import { app, BrowserWindow, ipcMain, dialog, Menu, shell } from 'electron'
import { join } from 'path'
import { readFile, writeFile } from 'fs/promises'
import { existsSync } from 'fs'

let mainWindow: BrowserWindow | null = null

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    frame: false,
    titleBarStyle: 'hidden',
    backgroundColor: '#1e1e2e',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  })

  if (process.env.ELECTRON_RENDERER_URL) {
    mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL)
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

function buildMenuTemplate(): Electron.MenuItemConstructorOptions[] {
  const isMac = process.platform === 'darwin'

  return [
    ...(isMac ? [{
      label: app.name,
      submenu: [
        { role: 'about' as const },
        { type: 'separator' as const },
        { role: 'hide' as const },
        { role: 'hideOthers' as const },
        { role: 'unhide' as const },
        { type: 'separator' as const },
        { role: 'quit' as const }
      ]
    }] : []),
    {
      label: 'File',
      submenu: [
        {
          label: 'New',
          accelerator: 'CmdOrCtrl+N',
          click: () => mainWindow?.webContents.send('menu:new-file')
        },
        {
          label: 'Open...',
          accelerator: 'CmdOrCtrl+O',
          click: () => handleOpenFile()
        },
        { type: 'separator' },
        {
          label: 'Save',
          accelerator: 'CmdOrCtrl+S',
          click: () => mainWindow?.webContents.send('menu:save')
        },
        {
          label: 'Save As...',
          accelerator: 'CmdOrCtrl+Shift+S',
          click: () => mainWindow?.webContents.send('menu:save-as')
        },
        { type: 'separator' },
        {
          label: 'Export...',
          click: () => mainWindow?.webContents.send('menu:export')
        },
        {
          label: 'Convert Format...',
          click: () => mainWindow?.webContents.send('menu:convert')
        },
        { type: 'separator' },
        isMac ? { role: 'close' } : { role: 'quit' }
      ] as Electron.MenuItemConstructorOptions[]
    },
    {
      label: 'Edit',
      submenu: [
        {
          label: 'Undo',
          accelerator: 'CmdOrCtrl+Z',
          click: () => mainWindow?.webContents.send('menu:undo')
        },
        {
          label: 'Redo',
          accelerator: 'CmdOrCtrl+Shift+Z',
          click: () => mainWindow?.webContents.send('menu:redo')
        },
        { type: 'separator' },
        {
          label: 'Cut',
          accelerator: 'CmdOrCtrl+X',
          click: () => mainWindow?.webContents.send('menu:cut')
        },
        {
          label: 'Copy',
          accelerator: 'CmdOrCtrl+C',
          click: () => mainWindow?.webContents.send('menu:copy')
        },
        {
          label: 'Paste',
          accelerator: 'CmdOrCtrl+V',
          click: () => mainWindow?.webContents.send('menu:paste')
        },
        {
          label: 'Delete',
          accelerator: 'Backspace',
          click: () => mainWindow?.webContents.send('menu:delete')
        },
        { type: 'separator' },
        {
          label: 'Select All',
          accelerator: 'CmdOrCtrl+A',
          click: () => mainWindow?.webContents.send('menu:select-all')
        },
        {
          label: 'Group',
          accelerator: 'CmdOrCtrl+G',
          click: () => mainWindow?.webContents.send('menu:group')
        },
        {
          label: 'Ungroup',
          accelerator: 'CmdOrCtrl+Shift+G',
          click: () => mainWindow?.webContents.send('menu:ungroup')
        }
      ]
    },
    {
      label: 'View',
      submenu: [
        {
          label: 'Zoom In',
          accelerator: 'CmdOrCtrl+=',
          click: () => mainWindow?.webContents.send('menu:zoom-in')
        },
        {
          label: 'Zoom Out',
          accelerator: 'CmdOrCtrl+-',
          click: () => mainWindow?.webContents.send('menu:zoom-out')
        },
        {
          label: 'Fit to Screen',
          accelerator: 'CmdOrCtrl+0',
          click: () => mainWindow?.webContents.send('menu:zoom-fit')
        },
        { type: 'separator' },
        {
          label: 'Toggle Code Editor',
          accelerator: 'CmdOrCtrl+E',
          click: () => mainWindow?.webContents.send('menu:toggle-code')
        },
        { type: 'separator' },
        { role: 'toggleDevTools' }
      ]
    },
    {
      label: 'Insert',
      submenu: [
        {
          label: 'Rectangle',
          click: () => mainWindow?.webContents.send('menu:insert-shape', 'rect')
        },
        {
          label: 'Circle',
          click: () => mainWindow?.webContents.send('menu:insert-shape', 'circle')
        },
        {
          label: 'Line',
          click: () => mainWindow?.webContents.send('menu:insert-shape', 'line')
        },
        {
          label: 'Arrow',
          click: () => mainWindow?.webContents.send('menu:insert-shape', 'arrow')
        },
        {
          label: 'Triangle',
          click: () => mainWindow?.webContents.send('menu:insert-shape', 'triangle')
        },
        {
          label: 'Star',
          click: () => mainWindow?.webContents.send('menu:insert-shape', 'star')
        },
        { type: 'separator' },
        {
          label: 'Text',
          click: () => mainWindow?.webContents.send('menu:insert-shape', 'text')
        }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About SVG Editor',
          click: () => {
            dialog.showMessageBox({
              title: 'SVG Editor',
              message: 'SVG Editor v1.0.0',
              detail: 'A cross-platform SVG editor built with Electron.\nDesigned for developers and technical users.',
              buttons: ['OK']
            })
          }
        }
      ]
    }
  ]
}

async function handleOpenFile(): Promise<void> {
  if (!mainWindow) return

  const result = await dialog.showOpenDialog(mainWindow, {
    filters: [
      { name: 'SVG Files', extensions: ['svg'] },
      { name: 'All Files', extensions: ['*'] }
    ],
    properties: ['openFile']
  })

  if (!result.canceled && result.filePaths.length > 0) {
    const filePath = result.filePaths[0]
    try {
      const content = await readFile(filePath, 'utf-8')
      mainWindow.webContents.send('file:opened', { filePath, content })
    } catch (err) {
      dialog.showErrorBox('Error', `Failed to open file: ${err}`)
    }
  }
}

function registerIpcHandlers(): void {
  ipcMain.handle('dialog:open-file', async () => {
    await handleOpenFile()
  })

  ipcMain.handle('dialog:save-file', async (_event, { content, filePath }) => {
    if (!mainWindow) return { success: false }

    let savePath = filePath
    if (!savePath) {
      const result = await dialog.showSaveDialog(mainWindow, {
        filters: [{ name: 'SVG Files', extensions: ['svg'] }],
        defaultPath: 'untitled.svg'
      })
      if (result.canceled || !result.filePath) return { success: false }
      savePath = result.filePath
    }

    try {
      await writeFile(savePath, content, 'utf-8')
      return { success: true, filePath: savePath }
    } catch (err) {
      dialog.showErrorBox('Error', `Failed to save file: ${err}`)
      return { success: false }
    }
  })

  ipcMain.handle('dialog:save-as', async (_event, { content }) => {
    if (!mainWindow) return { success: false }

    const result = await dialog.showSaveDialog(mainWindow, {
      filters: [{ name: 'SVG Files', extensions: ['svg'] }],
      defaultPath: 'untitled.svg'
    })
    if (result.canceled || !result.filePath) return { success: false }

    try {
      await writeFile(result.filePath, content, 'utf-8')
      return { success: true, filePath: result.filePath }
    } catch (err) {
      dialog.showErrorBox('Error', `Failed to save file: ${err}`)
      return { success: false }
    }
  })

  ipcMain.handle('window:minimize', () => mainWindow?.minimize())
  ipcMain.handle('window:maximize', () => {
    if (mainWindow?.isMaximized()) {
      mainWindow.unmaximize()
    } else {
      mainWindow?.maximize()
    }
  })
  ipcMain.handle('window:close', () => mainWindow?.close())
  ipcMain.handle('window:is-maximized', () => mainWindow?.isMaximized())
}

app.whenReady().then(() => {
  registerIpcHandlers()
  
  const menu = Menu.buildFromTemplate(buildMenuTemplate())
  Menu.setApplicationMenu(menu)
  
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
