# PSBT Lens 🔬

**PSBT Lens** is a modern, pure client-side visualization and debugging tool for **Bitcoin Partially Signed Bitcoin Transactions (PSBT - BIP 174)**.

It provides a clear, developer-friendly interface to inspect the contents of a PSBT, including inputs, outputs, scripts, and fees, without needing to run a local node.

![PSBT Lens](/psbt-lens-preview.png)
*(Note: Screenshot placeholder)*

## Features

- **🛡️ 100% Client-Side**: No data is sent to any server. All parsing happens locally in your browser.
- **⚡ Fast Parsing**: Built with `bitcoinjs-lib` v6 and WebAssembly (tiny-secp256k1).
- **👁️ Deep Visualization**: 
  - View Inputs (TxID, Vout, Sequence, Witness/Non-Witness Data).
  - View Outputs (Address, Value, ScriptPubKey).
  - Automatic Network Fee estimation.
- **🔄 Format Support**: Accepts both **Hex** and **Base64** PSBT strings.
- **🔐 Wallet Integration**: Connect **Unisat**, **Xverse**, or **Leather** to sign PSBTs and broadcast transactions directly to the network.

## Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + [Shadcn/ui](https://ui.shadcn.com/)
- **Bitcoin Lib**: `bitcoinjs-lib` v6 (with Buffer & WASM polyfills)

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/psbt-lens.git
   cd psbt-lens
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```
   *Note: This will verify the WASM setup for cryptographic operations.*

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open in Browser**
   Visit [http://localhost:3000](http://localhost:3000) to see the app.

## Development Notes

### Build & WebAssembly
This project uses `tiny-secp256k1` which relies on WebAssembly. The `next.config.ts` is strictly configured to handle:
- Async WebAssembly (`asyncWebAssembly: true`)
- Buffer Polyfills (required for `bitcoinjs-lib` in the browser)

If you encounter build errors, ensure you are running:
```bash
npx next build --webpack
```

## Roadmap

Check out [ROADMAP.md](./ROADMAP.md) for future plans.

## License

MIT
