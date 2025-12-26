/**
 * Enhanced obfuscation utility for RPG Life.
 * Uses a multi-step process: Shift -> Base64 -> Reverse -> Salt.
 */

const SHIFT = 5;
const PREFIX = 'RPG_';
const SUFFIX = '_LIFE';

/**
 * Encodes a string (use the provided CLI command to generate this)
 */
export const obfuscate = (str) => {
    if (!str) return '';

    // Step 1: Character shift
    const shifted = str.split('').map(char =>
        String.fromCharCode(char.charCodeAt(0) + SHIFT)
    ).join('');

    // Step 2: Base64
    const b64 = btoa(shifted);

    // Step 3: Reverse and add Salt
    const reversed = b64.split('').reverse().join('');
    return `${PREFIX}${reversed}${SUFFIX}`;
}

/**
 * Decodes the obfuscated string back to its original value
 */
export const deobfuscate = (obfuscatedStr) => {
    if (!obfuscatedStr) return '';

    try {
        // Step 1: Remove Salt
        let core = obfuscatedStr;
        if (core.startsWith(PREFIX)) core = core.slice(PREFIX.length);
        if (core.endsWith(SUFFIX)) core = core.slice(0, -SUFFIX.length);

        // Step 2: Un-reverse
        const b64 = core.split('').reverse().join('');

        // Step 3: Base64 decode
        const shifted = atob(b64);

        // Step 4: Reverse character shift
        return shifted.split('').map(char =>
            String.fromCharCode(char.charCodeAt(0) - SHIFT)
        ).join('');
    } catch (e) {
        console.error('🛡️ Security: Falha ao decodificar chave. Verifique o .env');
        return '';
    }
}
