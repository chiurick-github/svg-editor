import { contextBridge, ipcRenderer } from 'electron'

export type ElectronAPI = {
  window: {
    minimize: () => Promise<void>
    maximize: () => Promise<void>
    close: () => Promise<void>
    isMaximized: () => Promise<boolean>
  }
  file: {
    open: () => Promise<void>
    save: (data: { content: string; filePath?: string }) => Promise<{ success: boolean; filePath?: string }>
    saveAs: (data: { content: string }) => Promise<{ success: boolean; filePath?: string }>
  }
  on: (channel: string, callback: (...args: unknown[]) => void) => () => void
}

const api: ElectronAPI = {
  window: {
    minimize: () => ipcRenderer.invoke('window:minimize'),
    maximize: () => ipcRenderer.invoke('window:maximize'),
    close: () => ipcRenderer.invoke('window:close'),
    isMaximized: () => ipcRenderer.invoke('window:is-maximized')
  },
  file: {
    open: () => ipcRenderer.invoke('dialog:open-file'),
    save: (data) => ipcRenderer.invoke('dialog:save-file', data),
    saveAs: (data) => ipcRenderer.invoke('dialog:save-as', data)
  },
  on: (channel: string, callback: (...args: unknown[]) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, ...args: unknown[]) => callback(...args)
    ipcRenderer.on(channel, handler)
    return () => ipcRenderer.removeListener(channel, handler)
  }
}

contextBridge.exposeInMainWorld('electronAPI', api)
