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
}

export interface PsbtOutputDetail {
    index: number;
    address?: string;
    value: number; // in satoshis
    scriptHex: string;
}

export interface PsbtSummary {
    inputCount: number;
    outputCount: number;
    networkFee?: number; // in satoshis
    inputs: PsbtInputDetail[];
    outputs: PsbtOutputDetail[];
    base64: string;
    hex: string;
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

        if (psbtInput.witnessUtxo) {
            value = Number(psbtInput.witnessUtxo.value);
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

        return {
            index: idx,
            address,
            value: Number(output.value),
            scriptHex: Buffer.from(output.script).toString('hex'),
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
    };
}
