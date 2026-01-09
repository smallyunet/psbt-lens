"use client";

import React, { useState, useRef, useEffect } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import { createURDecoder } from "@/lib/ur-utils";
import { URDecoder } from "@ngraveio/bc-ur";
import { CryptoPSBT } from "@keystonehq/bc-ur-registry";

interface QRScannerProps {
    onScan: (psbtHex: string) => void;
    onError?: (error: string) => void;
}

export const QRScanner: React.FC<QRScannerProps> = ({ onScan, onError }) => {
    const decoderRef = useRef<URDecoder | null>(null);
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState("Scanning...");

    useEffect(() => {
        // Initialize decoder on mount
        decoderRef.current = createURDecoder();
    }, []);

    const handleScan = (detectedCodes: any[]) => {
        if (!detectedCodes || detectedCodes.length === 0) return;

        // We only process the first detected code for simplicity
        const data = detectedCodes[0].rawValue;
        if (!data) return;

        // Check if it's a UR part
        if (data.toLowerCase().startsWith("ur:")) {
            if (decoderRef.current) {
                try {
                    decoderRef.current.receivePart(data);

                    const percentage = Math.floor(decoderRef.current.estimatedPercentComplete() * 100);
                    setProgress(percentage);
                    setStatus(`Receiving parts: ${percentage}%`);

                    if (decoderRef.current.isComplete()) {
                        if (decoderRef.current.isSuccess()) {
                            const ur = decoderRef.current.resultUR();
                            // We expect a CryptoPSBT
                            if (ur.type === 'crypto-psbt') {
                                const cryptoPsbt = CryptoPSBT.fromUR(ur);
                                const psbtBuffer = cryptoPsbt.getPSBT();
                                onScan(psbtBuffer.toString('hex'));
                            } else {
                                // Fallback: try to just treat it as bytes if it's generic bytes, or error
                                // But usually it should be crypto-psbt.
                                // Let's assume generic bytes if unknown, but better to check type.
                                console.log("UR Type:", ur.type);
                                // Try to decode as generic bytes if specific type fails, but for now strict.
                                if (onError) onError(`Unexpected UR type: ${ur.type}`);
                            }
                        } else {
                            if (onError) onError("UR decoding failed checksum or other error.");
                        }
                        // Reset decoder for next scan? Or strictly one-shot? 
                        // Usually one-shot for this modal.
                    }
                } catch (e: any) {
                    console.error("UR Decode error", e);
                    // Don't error immediately on partial scan errors unless critical
                }
            }
        } else {
            // Regular static QR code?
            // Assume it is a PSBT in Base64 or Hex
            // Basic validation:
            const trimmed = data.trim();
            // Heuristic: check if base64 or hex
            if (/^[0-9a-fA-F]+$/.test(trimmed) || /^[a-zA-Z0-9+/=]+$/.test(trimmed)) {
                onScan(trimmed);
            }
        }
    };

    return (
        <div className="w-full max-w-sm mx-auto flex flex-col gap-4">
            <div className="relative aspect-square bg-black rounded-lg overflow-hidden">
                <Scanner
                    onScan={handleScan}
                    components={{
                        audio: false,
                        onOff: true,
                    }}
                    styles={{
                        container: { width: '100%', height: '100%' }
                    }}
                />
                <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/60 text-white text-xs text-center">
                    {status}
                </div>
            </div>
            {progress > 0 && progress < 100 && (
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 transition-all duration-300" style={{ width: `${progress}%` }}></div>
                </div>
            )}
        </div>
    );
};
