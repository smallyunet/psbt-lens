import { getAddress, signTransaction, AddressPurpose, BitcoinNetworkType } from 'sats-connect';

export type WalletType = 'unisat' | 'xverse' | 'leather';

export type NetworkType = 'livenet' | 'testnet' | 'signet';

export interface WalletProvider {
    connect: (network: NetworkType) => Promise<string>; // Returns address
    disconnect: () => Promise<void>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    signPsbt: (psbtBase64: string, options?: any) => Promise<string>; // Returns signed PSBT (hex or base64)
    getNetwork: () => Promise<NetworkType>;
}

declare global {
    interface Window {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        unisat: any;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        btc: any; // Leather (formerly Hiro)
    }
}

// Unisat Adapter
export const unisatProvider: WalletProvider = {
    connect: async (network: NetworkType) => {
        if (typeof window.unisat === 'undefined') {
            throw new Error('Unisat wallet not installed');
        }
        // Switch network first
        const unisatNetwork = network === 'livenet' ? 'livenet' : 'testnet';
        await window.unisat.switchNetwork(unisatNetwork);

        const accounts = await window.unisat.requestAccounts();
        return accounts[0];
    },
    disconnect: async () => {
        // Unisat doesn't have a specific disconnect API exposed commonly, mostly handled by UI state
        // but in some versions:
        if (window.unisat?.disconnect) {
            await window.unisat.disconnect();
        }
    },
    signPsbt: async (psbtHex: string) => {
        // Unisat usually expects hex
        return await window.unisat.signPsbt(psbtHex);
    },
    getNetwork: async () => {
        const net = await window.unisat.getNetwork();
        return net === 'livenet' ? 'livenet' : 'testnet';
    }
};

// Xverse Adapter (via sats-connect)
export const xverseProvider: WalletProvider = {
    connect: async (network: NetworkType) => {
        // Xverse connect is prompt-based
        return new Promise((resolve, reject) => {
            getAddress({
                payload: {
                    purposes: [AddressPurpose.Payment, AddressPurpose.Ordinals],
                    message: 'Connect to PSBT Lens',
                    network: {
                        type: network === 'livenet' ? BitcoinNetworkType.Mainnet : BitcoinNetworkType.Testnet
                    },
                },
                onFinish: (response) => {
                    // We usually prefer the payment address for general txs, or ordinals for inscriptions.
                    // Let's grab the payment address (P2WPKH or P2SH-P2WPKH) for simplicity or Ordinals (Taproot) depending on use case.
                    // For generic PSBT signing, Taproot is often preferred now. Let's return the first one for now.
                    const addressComp = response.addresses.find(a => a.purpose === AddressPurpose.Ordinals) || response.addresses[0];
                    resolve(addressComp.address);
                },
                onCancel: () => reject(new Error('User cancelled')),
            });
        });
    },
    disconnect: async () => {
        // Xverse doesn't maintain persistent session state in the same way, handled by app logic
    },
    signPsbt: async (psbtBase64: string) => {
        return new Promise((resolve, reject) => {
            signTransaction({
                payload: {
                    network: {
                        type: BitcoinNetworkType.Mainnet // NOTE: Ideally dynamic, but `signTransaction` payload might need checking
                    },
                    message: 'Sign Transaction with PSBT Lens',
                    psbtBase64: psbtBase64,
                    broadcast: false,
                    inputsToSign: [
                        {
                            address: "", // Optional: specific inputs. If omitted, Xverse tries to sign all.
                            signingIndexes: [] // If omitted, tries to sign all inputs for the address
                        }
                    ]
                },
                onFinish: (response) => {
                    resolve(response.psbtBase64);
                },
                onCancel: () => reject(new Error('User cancelled signing')),
            });
        });
    },
    getNetwork: async () => {
        // Sats-connect is stateless, we track network in app state usually.
        return 'livenet';
    }
};

// Leather Adapter
export const leatherProvider: WalletProvider = {
    connect: async (network: NetworkType) => {
        if (typeof window.btc === 'undefined') {
            throw new Error('Leather wallet not installed');
        }
        const response = await window.btc.request('getAddresses');
        // Leather returns a list.
        const result = response.result;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const paymentAddr = result.addresses.find((a: any) => a.type === 'p2wpkh') ||
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            result.addresses.find((a: any) => a.type === 'p2tr');

        return paymentAddr?.address || result.addresses[0].address;
    },
    disconnect: async () => {
        // No explicit disconnect
    },
    signPsbt: async (psbtHex: string) => {
        const response = await window.btc.request('signPsbt', {
            hex: psbtHex
        });
        return response.result.hex;
    },
    getNetwork: async () => {
        return 'livenet'; // Leather often defaults to mainnet, tricky to check via simple API without querying
    }
};

// Broadcast Helper
export const broadcastTransaction = async (txHex: string, network: NetworkType): Promise<string> => {
    const baseUrl = network === 'livenet'
        ? 'https://mempool.space/api'
        : network === 'testnet'
            ? 'https://mempool.space/testnet/api'
            : 'https://mempool.space/signet/api';

    const response = await fetch(`${baseUrl}/tx`, {
        method: 'POST',
        body: txHex
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(`Broadcast failed: ${text}`);
    }

    return await response.text(); // Returns TxID
};
