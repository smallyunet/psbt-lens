import { useState, useCallback, useEffect } from 'react';
import {
    WalletType,
    NetworkType,
    WalletProvider,
    unisatProvider,
    xverseProvider,
    leatherProvider,
    broadcastTransaction
} from '@/lib/wallet';

export function useWallet() {
    const [address, setAddress] = useState<string | null>(null);
    const [walletType, setWalletType] = useState<WalletType | null>(null);
    const [network, setNetwork] = useState<NetworkType>('livenet');
    const [error, setError] = useState<string | null>(null);
    const [isSigning, setIsSigning] = useState(false);

    // Initialize provider based on type
    const getProvider = useCallback((type: WalletType): WalletProvider => {
        switch (type) {
            case 'unisat': return unisatProvider;
            case 'xverse': return xverseProvider;
            case 'leather': return leatherProvider;
        }
    }, []);

    const connect = useCallback(async (type: WalletType, targetNetwork: NetworkType = 'livenet') => {
        setError(null);
        try {
            const provider = getProvider(type);
            const addr = await provider.connect(targetNetwork);

            setAddress(addr);
            setWalletType(type);
            setNetwork(targetNetwork);
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : 'Connection failed');
            setAddress(null);
            setWalletType(null);
        }
    }, [getProvider]);

    const disconnect = useCallback(async () => {
        if (walletType) {
            const provider = getProvider(walletType);
            await provider.disconnect();
        }
        setAddress(null);
        setWalletType(null);
    }, [walletType, getProvider]);

    const sign = useCallback(async (psbtString: string) => { // Can be hex or base64
        if (!walletType) {
            throw new Error("No wallet connected");
        }

        setIsSigning(true);
        setError(null);
        try {
            const provider = getProvider(walletType);

            // Some simple normalization: 
            // Xverse expects base64 usually, Unisat expects Hex.
            // We will let the user pass the string, but adapters might need handling.
            // For now, our adapters in lib/wallet.ts are simple. 
            // Ideally we convert to the format the specific wallet expects.

            const signed = await provider.signPsbt(psbtString);
            setIsSigning(false);
            return signed;
        } catch (e: unknown) {
            setIsSigning(false);
            setError(e instanceof Error ? e.message : 'Signing failed');
            throw e;
        }
    }, [walletType, getProvider]);

    const broadcast = useCallback(async (txHex: string) => {
        setError(null);
        try {
            const txid = await broadcastTransaction(txHex, network);
            return txid;
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : 'Broadcast failed');
            throw e;
        }
    }, [network]);

    return {
        address,
        walletType,
        network,
        setNetwork, // Allow changing network before connect?
        connect,
        disconnect,
        sign,
        broadcast,
        error,
        isSigning
    };
}
