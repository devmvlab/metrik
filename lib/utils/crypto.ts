import { createCipheriv, createDecipheriv, randomBytes } from 'crypto'

const ALGORITHM = 'aes-256-gcm'

function getKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY
  if (!key) throw new Error('ENCRYPTION_KEY não definida nas variáveis de ambiente')
  if (key.length !== 64) throw new Error('ENCRYPTION_KEY deve ter 64 caracteres hex (32 bytes)')
  return Buffer.from(key, 'hex')
}

/**
 * Encripta uma string usando AES-256-GCM.
 * O resultado é no formato "iv:authTag:encrypted" (tudo em hex).
 * Use sempre para armazenar tokens OAuth no banco.
 */
export function encrypt(text: string): string {
  const key = getKey()
  const iv = randomBytes(12) // 96-bit IV recomendado para GCM
  const cipher = createCipheriv(ALGORITHM, key, iv)

  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()])
  const authTag = cipher.getAuthTag()

  return [iv.toString('hex'), authTag.toString('hex'), encrypted.toString('hex')].join(':')
}

/**
 * Decripta uma string gerada por encrypt().
 * Lança erro se o formato for inválido ou se o authTag não bater (dados corrompidos).
 */
export function decrypt(encryptedText: string): string {
  const parts = encryptedText.split(':')
  if (parts.length !== 3) throw new Error('Formato de texto encriptado inválido')

  const [ivHex, authTagHex, encryptedHex] = parts
  const key = getKey()
  const iv = Buffer.from(ivHex, 'hex')
  const authTag = Buffer.from(authTagHex, 'hex')
  const encrypted = Buffer.from(encryptedHex, 'hex')

  const decipher = createDecipheriv(ALGORITHM, key, iv)
  decipher.setAuthTag(authTag)

  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()])
  return decrypted.toString('utf8')
}
