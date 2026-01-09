"use client";

import React, { useEffect, useState, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { psbtToUR, createUREncoder } from "@/lib/ur-utils";
import { UREncoder } from "@ngraveio/bc-ur";

interface AnimatedQRProps {
    psbtHex: string;
    className?: string;
    size?: number;
}

export const AnimatedQR: React.FC<AnimatedQRProps> = ({
    psbtHex,
    className = "",
    size = 300,
}) => {
    const [currentPart, setCurrentPart] = useState<string>("");
    const [progress, setProgress] = useState<string>("0/0");
    const encoderRef = useRef<UREncoder | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (!psbtHex) return;

        try {
            const ur = psbtToUR(psbtHex);
            const encoder = createUREncoder(ur);
            encoderRef.current = encoder;

            // Start loop
            const nextPart = () => {
                if (encoderRef.current) {
                    const part = encoderRef.current.nextPart();
                    setCurrentPart(part.toUpperCase());

                    // Calculate progress (approximate since it's a fountain code)
                    // For display purposes, we can show seqNum / seqLength if available in the part,
                    // but UREncoder handles the fountain logic.
                    // However, bc-ur encoder doesn't expose easy "current index in cycle" directly on the part string.
                    // Let's use internal state if we wanted "1/10", but fountain codes go on forever.
                    // Maybe just showing which part we are on relative to min parts is helpful?
                    // encoder.cborPayload is the data.
                    // encoder.fragmentsLength is the total number of fragments in a standard set.

                    const currentSeq = encoder.seqNum;
                    const total = encoder.fragmentsLength;
                    setProgress(`${currentSeq} / ${total}`); // Fountain codes keep going, so seq can exceed total.
                }
            };

            nextPart(); // Initial call
            timerRef.current = setInterval(nextPart, 200); // 200ms = 5fps

        } catch (e) {
            console.error("Error generating UR:", e);
        }

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [psbtHex]);

    if (!psbtHex) return null;

    return (
        <div className={`flex flex-col items-center gap-4 ${className}`}>
            <div className="bg-white p-4 rounded-lg shadow-sm">
                <QRCodeSVG value={currentPart} size={size} level="L" includeMargin={false} />
            </div>
            <div className="text-sm text-gray-500 font-mono">
                UR Part: {progress}
            </div>
            <div className="text-xs text-gray-400">
                Scan with Keystone, Passport, or Jade
            </div>
        </div>
    );
};
