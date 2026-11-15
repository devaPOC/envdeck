const EXTENSION_LANGUAGE_MAP: Record<string, string> = {
  env: 'ini',
  js: 'javascript',
  jsx: 'javascript',
  mjs: 'javascript',
  ts: 'typescript',
  tsx: 'typescript',
  json: 'json',
  sh: 'shell',
  bash: 'shell',
  yml: 'yaml',
  yaml: 'yaml',
  md: 'markdown',
  py: 'python',
  css: 'css',
  scss: 'scss',
  html: 'html',
  xml: 'xml',
  sql: 'sql',
  toml: 'ini',
  conf: 'ini',
  ini: 'ini',
  rb: 'ruby',
  go: 'go',
  rs: 'rust',
  java: 'java',
  php: 'php'
}

export function detectLanguage(path: string): string {
  const basename = path.split('/').pop() ?? path
  if (basename === '.env' || basename.startsWith('.env.')) return 'ini'

  const ext = basename.includes('.') ? basename.split('.').pop()!.toLowerCase() : ''
  return EXTENSION_LANGUAGE_MAP[ext] ?? 'plaintext'
}
