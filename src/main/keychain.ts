import keytar from 'keytar'

const SERVICE_NAME = 'EnvDeck'

export async function savePemKey(serverId: string, pemContent: string): Promise<void> {
  await keytar.setPassword(SERVICE_NAME, serverId, pemContent)
}

export async function getPemKey(serverId: string): Promise<string | null> {
  return keytar.getPassword(SERVICE_NAME, serverId)
}

export async function deletePemKey(serverId: string): Promise<boolean> {
  return keytar.deletePassword(SERVICE_NAME, serverId)
}
