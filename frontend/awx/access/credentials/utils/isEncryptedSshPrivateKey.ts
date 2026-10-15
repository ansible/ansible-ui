/**
 * Detects whether SSH private key material is passphrase-protected.
 * Mirrors AWX `Credential.has_encrypted_ssh_key_data` / `validate_pem` behavior.
 */
const PEM_OBJECT_RE = /^(-{4,}) *BEGIN ([A-Z ]+?) *\1\s*([\s\S]+?)\s*\1 *END \2 *\1\s*([\s\S]*)$/;

const PEM_HEADER_RE = /^(.+?):\s*?(.+?)(\\?)$/;

const OPENSSH_UNENCRYPTED_PREFIX = new Uint8Array([
  ...new TextEncoder().encode('openssh-key-v1'),
  0,
  0,
  0,
  0,
  4,
  ...new TextEncoder().encode('none'),
]);

function decodePemBase64(pemBody: string): Uint8Array | null {
  let base64Data = '';
  let lineContinues = false;
  for (const line of pemBody.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed) {
      continue;
    }
    if (lineContinues) {
      lineContinues = trimmed.endsWith('\\');
      continue;
    }
    if (PEM_HEADER_RE.test(trimmed)) {
      lineContinues = trimmed.endsWith('\\');
      continue;
    }
    base64Data += trimmed;
  }
  if (!base64Data) {
    return null;
  }
  try {
    const binary = atob(base64Data);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.length > 0 ? bytes : null;
  } catch {
    return null;
  }
}

function startsWithBytes(data: Uint8Array, prefix: Uint8Array): boolean {
  if (data.length < prefix.length) {
    return false;
  }
  for (let i = 0; i < prefix.length; i++) {
    if (data[i] !== prefix[i]) {
      return false;
    }
  }
  return true;
}

function privateKeyIsEncrypted(pemType: string, pemBody: string, keyType: string): boolean {
  if (keyType === 'ed25519') {
    const decoded = decodePemBase64(pemBody);
    if (!decoded) {
      return false;
    }
    return !startsWithBytes(decoded, OPENSSH_UNENCRYPTED_PREFIX);
  }
  if (pemType === 'ENCRYPTED PRIVATE KEY') {
    return true;
  }
  return pemBody.includes('ENCRYPTED');
}

export function isEncryptedSshPrivateKey(data: string): boolean {
  let remaining = data.trim();
  if (!remaining || remaining === '$encrypted$') {
    return false;
  }

  while (remaining) {
    const match = PEM_OBJECT_RE.exec(remaining);
    if (!match) {
      return false;
    }
    remaining = match[4].trimStart();
    const pemType = match[2];
    const pemBody = match[3];

    if (!pemType.endsWith('PRIVATE KEY')) {
      continue;
    }

    const keyTypeHeader = pemType
      .replace('ENCRYPTED PRIVATE KEY', '')
      .replace('PRIVATE KEY', '')
      .trim();
    const keyType = keyTypeHeader === 'OPENSSH' ? 'ed25519' : keyTypeHeader === 'RSA' ? 'rsa' : '';

    if (privateKeyIsEncrypted(pemType, pemBody, keyType)) {
      return true;
    }
  }

  return false;
}
