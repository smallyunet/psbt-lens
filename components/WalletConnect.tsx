import { Button } from "@/components/ui/button";
import { WalletType, NetworkType } from "@/lib/wallet";
import { Wallet, LogOut, ChevronDown } from "lucide-react";
import { useState } from "react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";

interface WalletConnectProps {
    address: string | null;
    walletType: WalletType | null;
    currentNetwork: NetworkType;
    onConnect: (type: WalletType) => void;
    onDisconnect: () => void;
    onNetworkChange: (net: NetworkType) => void;
}

export function WalletConnect({
    address,
    walletType,
    currentNetwork,
    onConnect,
    onDisconnect,
    onNetworkChange
}: WalletConnectProps) {

    if (address) {
        return (
            <div className="flex items-center gap-2">
                <span className="text-xs font-mono bg-slate-100 px-2 py-1 rounded text-slate-600 border border-slate-200 hidden sm:inline-block">
                    {address.slice(0, 6)}...{address.slice(-6)}
                </span>
                <Button variant="outline" size="sm" onClick={onDisconnect} className="gap-2 text-xs">
                    <LogOut className="w-3 h-3" /> <span className="hidden sm:inline">Disconnect</span>
                </Button>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2">
            {/* Network Selector */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="gap-1 text-xs text-slate-500">
                        {currentNetwork === 'livenet' ? 'Mainnet' : currentNetwork === 'testnet' ? 'Testnet' : 'Signet'}
                        <ChevronDown className="w-3 h-3" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuLabel>Network</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuRadioGroup value={currentNetwork} onValueChange={(v) => onNetworkChange(v as NetworkType)}>
                        <DropdownMenuRadioItem value="livenet">Mainnet (Livenet)</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="testnet">Testnet</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="signet">Signet</DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Connect Button */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="default" size="sm" className="gap-2">
                        <Wallet className="w-4 h-4" /> Connect Wallet
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Select Wallet</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onConnect('unisat')}>
                        <span className="font-medium">Unisat</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onConnect('xverse')}>
                        <span className="font-medium">Xverse</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onConnect('leather')}>
                        <span className="font-medium">Leather</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
