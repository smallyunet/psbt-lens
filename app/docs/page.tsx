import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen, ShieldCheck, Zap, Eye } from "lucide-react";

export default function DocsPage() {
    return (
        <main className="min-h-screen bg-slate-50 font-sans">
            <div className="max-w-4xl mx-auto px-6 py-12 md:py-20">

                {/* Header */}
                <div className="mb-12">
                    <Link href="/">
                        <Button variant="ghost" className="pl-0 hover:bg-transparent hover:text-slate-600 text-slate-400 mb-6">
                            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Analyzer
                        </Button>
                    </Link>
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 mb-4">
                        Documentation
                    </h1>
                    <p className="text-xl text-slate-500 leading-relaxed">
                        Everything you need to know about PSBT Lens and how to inspect Bitcoin transactions safely.
                    </p>
                </div>

                {/* Content */}
                <div className="space-y-16">

                    {/* Section 1: What is PSBT? */}
                    <section className="space-y-4">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                                <BookOpen className="w-6 h-6" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900">What is a PSBT?</h2>
                        </div>
                        <div className="prose prose-slate max-w-none text-slate-600">
                            <p>
                                <strong>PSBT (Partially Signed Bitcoin Transaction)</strong>, defined in <a href="https://github.com/bitcoin/bips/blob/master/bip-0174.mediawiki" target="_blank" className="text-blue-600 underline hover:text-blue-800">BIP 174</a>,
                                is a standard format for Bitcoin transactions that are not yet fully signed. It allows multiple parties to sign the same transaction
                                without revealing their private keys to each other or to the device creating the transaction.
                            </p>
                            <p className="mt-2">
                                It is commonly used in hardware wallet workflows (cold storage), CoinJoin implementations, and multi-signature setups.
                            </p>
                        </div>
                    </section>

                    {/* Section 2: How to Use */}
                    <section className="space-y-4">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                                <Eye className="w-6 h-6" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900">How to use PSBT Lens</h2>
                        </div>
                        <div className="prose prose-slate max-w-none text-slate-600">
                            <ol className="list-decimal pl-5 space-y-2">
                                <li>
                                    <strong>Paste your PSBT:</strong> Copy your PSBT string (usually Base64 or Hex format) from your wallet software.
                                </li>
                                <li>
                                    <strong>Analyze:</strong> Click the "Analyze PSBT" button.
                                </li>
                                <li>
                                    <strong>Inspect:</strong> View the breakdown of Inputs, Outputs, and Fees.
                                    <ul className="list-disc pl-5 mt-1 space-y-1 text-slate-500">
                                        <li><strong>Inputs:</strong> Shows the source of funds (TXID, Index) and signing status.</li>
                                        <li><strong>Outputs:</strong> Shows where the funds are going (Address, Value).</li>
                                        <li><strong>Fee:</strong> Calculates the network fee based on input/output differences.</li>
                                    </ul>
                                </li>
                            </ol>
                        </div>
                    </section>

                    {/* Section 3: Privacy */}
                    <section className="space-y-4">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-green-100 rounded-lg text-green-600">
                                <ShieldCheck className="w-6 h-6" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900">Privacy & Security</h2>
                        </div>
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                            <p className="font-medium text-slate-800 mb-2">Is it safe to paste my transaction here?</p>
                            <p className="text-slate-600 text-sm leading-relaxed">
                                <strong>Yes.</strong> PSBT Lens operates 100% client-side.
                            </p>
                            <ul className="mt-4 space-y-2 text-sm text-slate-600">
                                <li className="flex items-start gap-2">
                                    <span className="text-green-500 font-bold">✓</span>
                                    No data is sent to our servers.
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-green-500 font-bold">✓</span>
                                    No analytics trackers are used on transaction data.
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-green-500 font-bold">✓</span>
                                    Parsing logic runs entirely in your browser using WebAssembly.
                                </li>
                            </ul>
                        </div>
                    </section>

                    {/* Section 4: Features */}
                    <section className="space-y-4">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-orange-100 rounded-lg text-orange-600">
                                <Zap className="w-6 h-6" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900">Advanced Features</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 bg-white border border-slate-200 rounded-lg">
                                <h3 className="font-semibold text-slate-900 mb-1">Format Auto-Detection</h3>
                                <p className="text-sm text-slate-500">Automatically detects and processes both Hex and Base64 PSBT formats.</p>
                            </div>
                            <div className="p-4 bg-white border border-slate-200 rounded-lg">
                                <h3 className="font-semibold text-slate-900 mb-1">Fee Calculation</h3>
                                <p className="text-sm text-slate-500">Computes the transaction fee if all input values are available (requires witness data or UTXO info).</p>
                            </div>
                            <div className="p-4 bg-white border border-slate-200 rounded-lg">
                                <h3 className="font-semibold text-slate-900 mb-1">Address Type Detection</h3>
                                <p className="text-sm text-slate-500">Identifies P2PKH, P2SH, P2WPKH, P2WSH, and P2TR (Taproot) address types.</p>
                            </div>
                            <div className="p-4 bg-white border border-slate-200 rounded-lg">
                                <h3 className="font-semibold text-slate-900 mb-1">Script ASM Decoding</h3>
                                <p className="text-sm text-slate-500">View ScriptSig and ScriptPubKey in human-readable ASM format.</p>
                            </div>
                        </div>
                    </section>

                    {/* Section 5: Example PSBTs */}
                    <section className="space-y-4">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-cyan-100 rounded-lg text-cyan-600">
                                <BookOpen className="w-6 h-6" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900">Example PSBTs</h2>
                        </div>
                        <p className="text-slate-600 text-sm mb-4">Copy any of these example PSBTs to try with the analyzer:</p>
                        <div className="space-y-4">
                            <div className="bg-white p-4 rounded-lg border border-slate-200">
                                <h3 className="font-semibold text-slate-900 mb-1">Simple P2WPKH Transaction</h3>
                                <p className="text-sm text-slate-500 mb-2">A basic SegWit transaction with 1 input and 2 outputs.</p>
                                <code className="block text-[10px] font-mono bg-slate-100 p-2 rounded break-all text-slate-600 select-all">
                                    cHNidP8BAHECAAAAAbiWoY6pOQepFsEGhUPXaulX7HACUbDAFzsZF7lGsn4sAAAAAAD/////AgDh9QUAAAAAFgAUY1CFMJ1ovqj8zQSkBQOu/BDJxdsAgIQeAAAAABYAFK7lhGP2yMsvU//bMwKVo1mz3l9MAAAAAAAAAAA=
                                </code>
                            </div>
                            <div className="bg-white p-4 rounded-lg border border-slate-200">
                                <h3 className="font-semibold text-slate-900 mb-1">P2TR (Taproot) Transaction</h3>
                                <p className="text-sm text-slate-500 mb-2">A Taproot transaction with 1 input and 1 output.</p>
                                <code className="block text-[10px] font-mono bg-slate-100 p-2 rounded break-all text-slate-600 select-all">
                                    cHNidP8BAFMCAAAAAaRa2HWfLx/FZUL6rpSfIGhXSq7qmNy08FvpZi1vGz/PAAAAAAD/////AYCWmAAAAAAAIlEgEI9GSM3RQBWKDQwOH2E2mVdyHDVdhG9DXBYuZvRSizoAAAAAAAEBK6CGAQAAAAAAIlEgYH+nHJOp3MIWQjoPDnOvU1nDT0s/78TTl+LYT/QRGT0BCEICRzBEAiBV4fRoNTEtSdpzMFdqS3FXmCt57PzXiGKdh+H1UAfWWwIgT32bT7bRIRXyG3CeVdxNNR7KDQB87bMq+x6qJjwm7CABIQPuS6NnsyNfMlOBaFaLmtzyDwauREY2a7ql51R2RLkfpQAA
                                </code>
                            </div>
                            <div className="bg-white p-4 rounded-lg border border-slate-200">
                                <h3 className="font-semibold text-slate-900 mb-1">Multi-Input Transaction</h3>
                                <p className="text-sm text-slate-500 mb-2">A transaction consolidating 2 UTXOs into 1 output.</p>
                                <code className="block text-[10px] font-mono bg-slate-100 p-2 rounded break-all text-slate-600 select-all">
                                    cHNidP8BAKgCAAAAAnjg0GaKXGKpfIpEAqpLjjBckCQ2TRDzEexq0Vy18GNbAAAAAAD/////VTxTy1O8CL9XDZmvYFfjXKKLjPhx5D8FEAjQE7vJsS0BAAAAAP////8CQEIPAAAAAAAWABSYSHG6/b7DSjegx0y+e3N6FVHO2FDDAAAAAAAAFgAUo7a3uqANRUYsYz0/01TPl3S4QoYAAAAAAAABAHECAAAAAYFtNDsTj1e6v0R7IwOw0NhqVZRB3CbjjNLPgfOc6QFZAAAAAAD/////AoCWmAAAAAAAFgAUmEhxuv2+w0o3oMdMvntzehVRzthQwwAAAAAAABYAFIlvv3n8RkSzGd83qVmOoNqygxFaAAAAAAEBH1DDAAAAAAAAFgAUiW+/efxGRLMZ3zepWY6g2rKDEVoAAA==
                                </code>
                            </div>
                        </div>
                    </section>

                </div>

                {/* Footer */}
                <div className="mt-20 pt-10 border-t border-slate-200 text-center text-slate-400 text-sm">
                    <p>PSBT Lens is an open-source project.</p>
                </div>

            </div>
        </main>
    );
}
