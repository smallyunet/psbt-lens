import * as bitcoin from 'bitcoinjs-lib';
import { initEccLib } from 'bitcoinjs-lib';
import * as ecc from 'tiny-secp256k1';
import { Buffer } from 'buffer';

// Initialize ECC library for taproot support (Required in v6)
initEccLib(ecc);

export interface PsbtInputDetail {
    index: number;
    txHash: string; // The transaction ID (reversed, hex)
    vout: number;
    sequence: number;
    value?: number; // Value of this input in satoshis
    address?: string; // Address of this input (if derivable)
    addressType?: string; // P2PKH, P2SH, P2WPKH, P2WSH, P2TR
    scriptSigAsm?: string; // ASM disassembly of scriptSig
    sighashType?: string; // SIGHASH_ALL, SIGHASH_NONE, etc.
}

export interface PsbtOutputDetail {
    index: number;
    address?: string;
    addressType?: string; // Address type
    value: number; // in satoshis
    scriptHex: string;
    scriptPubKeyAsm?: string; // ASM disassembly of scriptPubKey
}

export interface PsbtSummary {
    inputCount: number;
    outputCount: number;
    networkFee?: number; // in satoshis
    inputs: PsbtInputDetail[];
    outputs: PsbtOutputDetail[];
    base64: string;
    hex: string;
    version: number; // Transaction version
    locktime: number; // Locktime
}

// Helper: Detect address type from scriptPubKey
function detectAddressType(script: Uint8Array): string {
    const len = script.length;
    // P2PKH: OP_DUP OP_HASH160 <20 bytes> OP_EQUALVERIFY OP_CHECKSIG
    if (len === 25 && script[0] === 0x76 && script[1] === 0xa9 && script[2] === 0x14 && script[23] === 0x88 && script[24] === 0xac) {
        return 'P2PKH';
    }
    // P2SH: OP_HASH160 <20 bytes> OP_EQUAL
    if (len === 23 && script[0] === 0xa9 && script[1] === 0x14 && script[22] === 0x87) {
        return 'P2SH';
    }
    // P2WPKH: OP_0 <20 bytes>
    if (len === 22 && script[0] === 0x00 && script[1] === 0x14) {
        return 'P2WPKH';
    }
    // P2WSH: OP_0 <32 bytes>
    if (len === 34 && script[0] === 0x00 && script[1] === 0x20) {
        return 'P2WSH';
    }
    // P2TR: OP_1 <32 bytes>
    if (len === 34 && script[0] === 0x51 && script[1] === 0x20) {
        return 'P2TR';
    }
    return 'Unknown';
}

// Helper: Parse sighash type from signature byte
function parseSighashType(sighashByte: number): string {
    const baseType = sighashByte & 0x1f;
    const anyoneCanPay = (sighashByte & 0x80) !== 0;

    let typeName = '';
    switch (baseType) {
        case 0x01: typeName = 'SIGHASH_ALL'; break;
        case 0x02: typeName = 'SIGHASH_NONE'; break;
        case 0x03: typeName = 'SIGHASH_SINGLE'; break;
        default: typeName = `SIGHASH_UNKNOWN(${sighashByte.toString(16)})`; break;
    }

    if (anyoneCanPay && baseType <= 3) {
        typeName += '|ANYONECANPAY';
    }

    return typeName;
}

// Helper: Extract sighash from PSBT input
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractSighashType(psbtInput: any): string | undefined {
    // Check partialSig for sighash byte
    if (psbtInput.partialSig && psbtInput.partialSig.length > 0) {
        const sig = psbtInput.partialSig[0].signature;
        if (sig && sig.length > 0) {
            const sighashByte = sig[sig.length - 1];
            return parseSighashType(sighashByte);
        }
    }
    // Check tapKeySig (Taproot key path signature)
    if (psbtInput.tapKeySig && psbtInput.tapKeySig.length > 0) {
        // Taproot signatures can be 64 bytes (default SIGHASH_DEFAULT) or 65 bytes (with explicit sighash)
        if (psbtInput.tapKeySig.length === 65) {
            return parseSighashType(psbtInput.tapKeySig[64]);
        }
        return 'SIGHASH_DEFAULT';
    }
    // Check sighashType field directly
    if (psbtInput.sighashType !== undefined) {
        return parseSighashType(psbtInput.sighashType);
    }
    return undefined;
}

// Helper: Convert script to ASM string
function scriptToAsm(script: Uint8Array): string {
    try {
        return bitcoin.script.toASM(script);
    } catch {
        return Buffer.from(script).toString('hex');
    }
}

export function parsePsbt(input: string): PsbtSummary {
    const cleanInput = input.trim();
    if (!cleanInput) {
        throw new Error("Input is empty");
    }

    let psbt: bitcoin.Psbt;

    try {
        // Heuristic: Hex usually only contains 0-9, a-f.
        const isHex = /^[0-9a-fA-F]+$/.test(cleanInput);
        if (isHex) {
            psbt = bitcoin.Psbt.fromHex(cleanInput);
        } else {
            psbt = bitcoin.Psbt.fromBase64(cleanInput);
        }
    } catch (e: any) {
        throw new Error(`Failed to parse PSBT: ${e.message}`);
    }

    // Get transaction metadata
    const tx = psbt.data.globalMap.unsignedTx;
    const version = tx ? (tx as any).tx?.version ?? 2 : 2;
    const locktime = tx ? (tx as any).tx?.locktime ?? 0 : 0;

    // Calculate Fee
    let totalInputValue = 0;
    let allInputsHaveValue = true;

    const inputs: PsbtInputDetail[] = psbt.txInputs.map((txInput, idx) => {
        // txInput.hash is the Buffer of the prev tx hash. Convert to standardized TxID (reversed hex).
        const txId = Buffer.from(txInput.hash).reverse().toString('hex');
        const vout = txInput.index;

        // Retrieve PSBT-specific data for this input to find value/script
        const psbtInput = psbt.data.inputs[idx];

        let value: number | undefined = undefined;
        let address: string | undefined = undefined;
        let addressType: string | undefined = undefined;
        let scriptSigAsm: string | undefined = undefined;

        if (psbtInput.witnessUtxo) {
            value = Number(psbtInput.witnessUtxo.value);
            addressType = detectAddressType(psbtInput.witnessUtxo.script);
            scriptSigAsm = scriptToAsm(psbtInput.witnessUtxo.script);
            try {
                address = bitcoin.address.fromOutputScript(psbtInput.witnessUtxo.script, bitcoin.networks.bitcoin);
            } catch (e) {
                try { address = bitcoin.address.fromOutputScript(psbtInput.witnessUtxo.script, bitcoin.networks.testnet); } catch (ex) { }
            }
        } else if (psbtInput.nonWitnessUtxo) {
            try {
                const prevTx = bitcoin.Transaction.fromBuffer(psbtInput.nonWitnessUtxo);
                const output = prevTx.outs[vout];
                if (output) {
                    value = Number(output.value);
                    addressType = detectAddressType(output.script);
                    scriptSigAsm = scriptToAsm(output.script);
                    try {
                        address = bitcoin.address.fromOutputScript(output.script, bitcoin.networks.bitcoin);
                    } catch (e) {
                        try { address = bitcoin.address.fromOutputScript(output.script, bitcoin.networks.testnet); } catch (ex) { }
                    }
                }
            } catch (e) {
                console.error("Failed to parse nonWitnessUtxo", e);
            }
        }

        // Extract sighash type
        const sighashType = extractSighashType(psbtInput);

        if (value !== undefined) {
            totalInputValue += value;
        } else {
            allInputsHaveValue = false;
        }

        return {
            index: idx,
            txHash: txId,
            vout: vout,
            sequence: txInput.sequence || 0,
            value,
            address,
            addressType,
            scriptSigAsm,
            sighashType,
        };
    });

    const outputs: PsbtOutputDetail[] = psbt.txOutputs.map((output, idx) => {
        let address = "Unknown Type";
        try {
            address = bitcoin.address.fromOutputScript(output.script, bitcoin.networks.bitcoin);
        } catch (e) {
            try {
                address = bitcoin.address.fromOutputScript(output.script, bitcoin.networks.testnet);
            } catch (e2) {
                // leave as Unknown or maybe decode script type
            }
        }

        const addressType = detectAddressType(output.script);
        const scriptPubKeyAsm = scriptToAsm(output.script);

        return {
            index: idx,
            address,
            addressType,
            value: Number(output.value),
            scriptHex: Buffer.from(output.script).toString('hex'),
            scriptPubKeyAsm,
        };
    });

    const totalOutputValue = psbt.txOutputs.reduce((sum, out) => sum + Number(out.value), 0);
    const networkFee = allInputsHaveValue ? (totalInputValue - totalOutputValue) : undefined;

    return {
        inputCount: psbt.inputCount,
        outputCount: psbt.txOutputs.length,
        networkFee,
        inputs,
        outputs,
        base64: psbt.toBase64(),
        hex: psbt.toHex(),
        version,
        locktime,
    };
}

