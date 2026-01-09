import { UR, UREncoder, URDecoder } from '@ngraveio/bc-ur';
import { CryptoPSBT } from '@keystonehq/bc-ur-registry';

/**
 * Converts a PSBT hex string to a UR object (CryptoPSBT).
 * @param psbtHex The PSBT in hex format.
 * @returns The UR object.
 */
export function psbtToUR(psbtHex: string): UR {
    const psbtBuffer = Buffer.from(psbtHex, 'hex');
    const cryptoPSBT = new CryptoPSBT(psbtBuffer);
    return cryptoPSBT.toUR();
}

/**
 * Creates a UREncoder for a given UR.
 * @param ur The UR object to encode.
 * @param maxFragmentLength The maximum length of each fragment (default: 400).
 * @param firstSeqNum The starting sequence number (default: 0).
 * @returns The UREncoder instance.
 */
export function createUREncoder(ur: UR, maxFragmentLength: number = 400, firstSeqNum: number = 0): UREncoder {
    return new UREncoder(ur, maxFragmentLength, firstSeqNum);
}

/**
 * Creates a new URDecoder.
 * @returns The URDecoder instance.
 */
export function createURDecoder(): URDecoder {
    return new URDecoder();
}
