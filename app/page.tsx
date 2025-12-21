"use client";

import { useState } from "react";
import { parsePsbt, PsbtSummary } from "@/lib/psbt";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from "next/link";
import { AlertCircle, Copy, BookOpen, ChevronDown, ChevronUp, Clock, Hash, Beaker } from "lucide-react";

// Example PSBTs for demonstration
const EXAMPLE_PSBTS = [
  {
    name: "Simple P2WPKH",
    description: "A basic SegWit transaction with 1 input and 2 outputs",
    psbt: "cHNidP8BAHECAAAAAbiWoY6pOQepFsEGhUPXaulX7HACUbDAFzsZF7lGsn4sAAAAAAD/////AgDh9QUAAAAAFgAUY1CFMJ1ovqj8zQSkBQOu/BDJxdsAgIQeAAAAABYAFK7lhGP2yMsvU//bMwKVo1mz3l9MAAAAAAAAAAA=",
  },
  {
    name: "P2TR (Taproot)",
    description: "A Taproot transaction with 1 input and 1 output",
    psbt: "cHNidP8BAFMCAAAAAaRa2HWfLx/FZUL6rpSfIGhXSq7qmNy08FvpZi1vGz/PAAAAAAD/////AYCWmAAAAAAAIlEgEI9GSM3RQBWKDQwOH2E2mVdyHDVdhG9DXBYuZvRSizoAAAAAAAEBK6CGAQAAAAAAIlEgYH+nHJOp3MIWQjoPDnOvU1nDT0s/78TTl+LYT/QRGT0BCEICRzBEAiBV4fRoNTEtSdpzMFdqS3FXmCt57PzXiGKdh+H1UAfWWwIgT32bT7bRIRXyG3CeVdxNNR7KDQB87bMq+x6qJjwm7CABIQPuS6NnsyNfMlOBaFaLmtzyDwauREY2a7ql51R2RLkfpQAA",
  },
  {
    name: "Multi-Input TX",
    description: "A transaction consolidating 2 UTXOs into 1 output",
    psbt: "cHNidP8BAKgCAAAAAnjg0GaKXGKpfIpEAqpLjjBckCQ2TRDzEexq0Vy18GNbAAAAAAD/////VTxTy1O8CL9XDZmvYFfjXKKLjPhx5D8FEAjQE7vJsS0BAAAAAP////8CQEIPAAAAAAAWABSYSHG6/b7DSjegx0y+e3N6FVHO2FDDAAAAAAAAFgAUo7a3uqANRUYsYz0/01TPl3S4QoYAAAAAAAABAHECAAAAAYFtNDsTj1e6v0R7IwOw0NhqVZRB3CbjjNLPgfOc6QFZAAAAAAD/////AoCWmAAAAAAAFgAUmEhxuv2+w0o3oMdMvntzehVRzthQwwAAAAAAABYAFIlvv3n8RkSzGd83qVmOoNqygxFaAAAAAAEBH1DDAAAAAAAAFgAUiW+/efxGRLMZ3zepWY6g2rKDEVoAAA==",
  },
];

export default function Home() {
  const [input, setInput] = useState("");
  const [data, setData] = useState<PsbtSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedInputs, setExpandedInputs] = useState<Set<number>>(new Set());
  const [expandedOutputs, setExpandedOutputs] = useState<Set<number>>(new Set());

  const loadExample = (psbt: string) => {
    setInput(psbt);
    setError(null);
    setData(null);
  };

  const handleParse = () => {
    setError(null);
    setExpandedInputs(new Set());
    setExpandedOutputs(new Set());
    if (!input.trim()) return;

    try {
      const result = parsePsbt(input);
      setData(result);
    } catch (e: any) {
      setError(e.message);
      setData(null);
    }
  };

  const toggleInputExpansion = (index: number) => {
    setExpandedInputs(prev => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const toggleOutputExpansion = (index: number) => {
    setExpandedOutputs(prev => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };



  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <main className="min-h-screen bg-slate-50 p-6 md:p-12 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-2">
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">PSBT Lens</h1>
            <p className="text-slate-500 text-lg">Partially Signed Bitcoin Transaction Visualization & Debugger</p>
          </div>
          <Link href="/docs">
            <Button variant="outline" className="gap-2">
              <BookOpen className="w-4 h-4" /> Documentation
            </Button>
          </Link>
        </header>

        {/* Input Section */}
        <section>
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Raw PSBT Input</CardTitle>
              <CardDescription>Paste your PSBT in Hex (0022...) or Base64 (cHNk...) format, or try an example.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Example Buttons */}
              <div className="flex flex-wrap gap-2">
                <span className="text-xs font-medium text-slate-500 flex items-center gap-1 mr-2">
                  <Beaker className="w-3 h-3" /> Examples:
                </span>
                {EXAMPLE_PSBTS.map((example) => (
                  <Button
                    key={example.name}
                    variant="outline"
                    size="sm"
                    className="text-xs h-7"
                    onClick={() => loadExample(example.psbt)}
                    title={example.description}
                  >
                    {example.name}
                  </Button>
                ))}
              </div>

              <Textarea
                placeholder="Paste PSBT string here..."
                className="font-mono text-xs min-h-[160px] resize-y"
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <div className="flex justify-between items-center">
                <Button onClick={handleParse} className="w-full md:w-auto min-w-[120px]">
                  Analyze PSBT
                </Button>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-4 text-sm text-red-600 bg-red-50 rounded-md border border-red-200">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span className="font-medium">{error}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        {/* Visualization Section */}
        {data && (
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Summary & Metadata */}
            <div className="space-y-6 lg:col-span-1">
              <Card className="shadow-sm">
                <CardHeader className="bg-slate-100/50 pb-4 border-b">
                  <CardTitle className="text-lg">Summary</CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-5">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-slate-600">Inputs</span>
                    <span className="font-mono font-bold text-slate-900">{data.inputCount}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-slate-600">Outputs</span>
                    <span className="font-mono font-bold text-slate-900">{data.outputCount}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-slate-600">Network Fee</span>
                    <span className={`font-mono font-bold ${data.networkFee !== undefined ? 'text-green-600' : 'text-slate-400'}`}>
                      {data.networkFee !== undefined ? `${data.networkFee.toLocaleString()} sats` : "N/A"}
                    </span>
                  </div>

                  <div className="pt-4 border-t space-y-3">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                      <Hash className="w-3 h-3" /> Transaction Metadata
                    </span>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-slate-600">Version</span>
                      <span className="font-mono text-slate-900">{data.version}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-slate-600 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Locktime
                      </span>
                      <span className="font-mono text-slate-900">
                        {data.locktime === 0 ? "0 (No lock)" : data.locktime < 500000000 ? `Block ${data.locktime.toLocaleString()}` : new Date(data.locktime * 1000).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 border-t space-y-3">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Export Formats</span>
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="outline" size="sm" className="text-xs h-8" onClick={() => copyToClipboard(data.base64)}>
                        <Copy className="w-3 h-3 mr-2" /> Base64
                      </Button>
                      <Button variant="outline" size="sm" className="text-xs h-8" onClick={() => copyToClipboard(data.hex)}>
                        <Copy className="w-3 h-3 mr-2" /> Hex
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column: Details */}
            <div className="space-y-8 lg:col-span-2">

              {/* Inputs List */}
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  Inputs <span className="text-sm font-normal text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{data.inputs.length}</span>
                </h2>
                <div className="space-y-4">
                  {data.inputs.map((inp) => (
                    <Card key={inp.index} className="overflow-hidden border-slate-200">
                      <div className="bg-slate-50 px-4 py-2 border-b flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-600 uppercase">Input #{inp.index}</span>
                          {inp.addressType && inp.addressType !== 'Unknown' && (
                            <span className="text-[10px] font-semibold px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded">{inp.addressType}</span>
                          )}
                          {inp.sighashType && (
                            <span className="text-[10px] font-semibold px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded">{inp.sighashType}</span>
                          )}
                        </div>
                        <span className="text-xs font-mono text-slate-400">Seq: {inp.sequence.toString(16)}</span>
                      </div>
                      <CardContent className="p-4 grid gap-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] uppercase tracking-wider font-semibold text-slate-500">TXID (Previous Hash)</label>
                            <code className="text-xs font-mono bg-slate-100 p-1 rounded break-all">{inp.txHash}</code>
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] uppercase tracking-wider font-semibold text-slate-500">Vout (Index)</label>
                            <code className="text-xs font-mono">{inp.vout}</code>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] uppercase tracking-wider font-semibold text-slate-500">Value (Sats)</label>
                            <span className="text-sm font-semibold font-mono">
                              {inp.value !== undefined ? inp.value.toLocaleString() : <span className="text-slate-400 italic">Unknown (Missing UTXO)</span>}
                            </span>
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] uppercase tracking-wider font-semibold text-slate-500">Address</label>
                            <span className="text-xs font-mono break-all text-slate-700">
                              {inp.address || <span className="text-slate-400 italic">Unknown</span>}
                            </span>
                          </div>
                        </div>
                        {/* Expandable Script ASM */}
                        {inp.scriptSigAsm && (
                          <div className="border-t pt-3">
                            <button
                              onClick={() => toggleInputExpansion(inp.index)}
                              className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 transition-colors"
                            >
                              {expandedInputs.has(inp.index) ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                              <span className="font-semibold uppercase tracking-wider">Script ASM</span>
                            </button>
                            {expandedInputs.has(inp.index) && (
                              <code className="block mt-2 text-[10px] font-mono bg-slate-100 p-2 rounded break-all text-slate-600 max-h-32 overflow-auto">
                                {inp.scriptSigAsm}
                              </code>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Outputs List */}
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  Outputs <span className="text-sm font-normal text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{data.outputs.length}</span>
                </h2>
                <div className="space-y-4">
                  {data.outputs.map((out) => (
                    <Card key={out.index} className="overflow-hidden border-slate-200">
                      <div className="bg-white px-4 py-3 border-l-4 border-l-green-500 flex justify-between items-center shadow-sm">
                        <div className="flex flex-col gap-1 w-full mr-4">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] uppercase tracking-wider font-bold text-green-600">To Address</span>
                            {out.addressType && out.addressType !== 'Unknown' && (
                              <span className="text-[10px] font-semibold px-1.5 py-0.5 bg-green-100 text-green-700 rounded">{out.addressType}</span>
                            )}
                          </div>
                          <span className="font-mono text-sm break-all">{out.address || "Unknown"}</span>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <span className="text-lg font-bold font-mono text-slate-900">{out.value.toLocaleString()}</span>
                          <span className="text-xs text-slate-500 block">sats</span>
                        </div>
                      </div>
                      <CardContent className="p-4 bg-slate-50/30 border-t space-y-3">
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">ScriptPubKey (Hex)</label>
                          <code className="text-[10px] text-slate-400 break-all font-mono">{out.scriptHex}</code>
                        </div>
                        {/* Expandable Script ASM */}
                        {out.scriptPubKeyAsm && (
                          <div className="border-t pt-3">
                            <button
                              onClick={() => toggleOutputExpansion(out.index)}
                              className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 transition-colors"
                            >
                              {expandedOutputs.has(out.index) ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                              <span className="font-semibold uppercase tracking-wider">ScriptPubKey ASM</span>
                            </button>
                            {expandedOutputs.has(out.index) && (
                              <code className="block mt-2 text-[10px] font-mono bg-slate-100 p-2 rounded break-all text-slate-600 max-h-32 overflow-auto">
                                {out.scriptPubKeyAsm}
                              </code>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

            </div>
          </section>
        )}
      </div>
    </main>
  );
}
