"use client";

import { useState } from "react";
import { parsePsbt, PsbtSummary } from "@/lib/psbt";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from "next/link";
import { AlertCircle, Copy, BookOpen } from "lucide-react";

export default function Home() {
  const [input, setInput] = useState("");
  const [data, setData] = useState<PsbtSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleParse = () => {
    setError(null);
    if (!input.trim()) return;

    try {
      const result = parsePsbt(input);
      setData(result);
    } catch (e: any) {
      setError(e.message);
      setData(null);
    }
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
              <CardDescription>Paste your PSBT in Hex (0022...) or Base64 (cHNk...) format.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
                        <span className="text-xs font-bold text-slate-600 uppercase">Input #{inp.index}</span>
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
                          <span className="text-[10px] uppercase tracking-wider font-bold text-green-600">To Address</span>
                          <span className="font-mono text-sm break-all">{out.address || "Unknown"}</span>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <span className="text-lg font-bold font-mono text-slate-900">{out.value.toLocaleString()}</span>
                          <span className="text-xs text-slate-500 block">sats</span>
                        </div>
                      </div>
                      <CardContent className="p-4 bg-slate-50/30 border-t">
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">ScriptPubKey (Hex)</label>
                          <code className="text-[10px] text-slate-400 break-all font-mono">{out.scriptHex}</code>
                        </div>
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
