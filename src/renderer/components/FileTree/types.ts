export interface SftpEntry {
  name: string
  type: 'file' | 'directory'
  size: number
  permissions: string
  isHidden: boolean
}
