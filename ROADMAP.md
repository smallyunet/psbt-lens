# Roadmap

This document outlines the development plan for **PSBT Lens**.

## Phase 1: MVP (Completed) ✅
- [x] **Project Initialization**: Next.js 14, TypeScript, Tailwind CSS, Shadcn/ui.
- [x] **PSBT Parsing Core**: 
  - Integrate `bitcoinjs-lib` v6.
  - Implement parsing logic for Inputs and Outputs.
  - Support Hex output and Base64 output.
- [x] **Visualization UI**:
  - Summary dashboard (Input/Output count, Fees).
  - Detailed Input view (TxHash, Vout, Sequence, Value).
  - Detailed Output view (Address, Value, ScriptPubKey).
- [x] **Basic Fee Calculation**: Estimate network fees based on input values (if available).

## Phase 2: Deep Inspection (v0.0.2) ✅
- [x] **Script Decoding**: Display ASM (Assembly) for ScriptSig and ScriptPubKey.
- [x] **Address Type Detection**: Better identification of address types (P2PKH, P2SH, P2WPKH, P2TR).
- [x] **Sighash Inspection**: Visualize sighash types for inputs.
- [x] **Locktime & Version**: Display transaction locktime and version fields.

## Phase 3: Modification & Interaction (v0.0.4) ✅
- [x] **Edit Outputs**: Allow modifying output values.
- [x] **Raw Transaction Extraction**: Extract the final hex if fully signed.
- [x] **Input Control**: Ability to remove specific inputs.
- [x] **Combine PSBTs**: Merge multiple signed PSBTs into one.

## Phase 4: Wallet Integration 🔐 (v0.0.5) ✅
- [x] **Wallet Connect**: Support for connecting browser wallets:
  - Unisat
  - Xverse
  - Leather (Hiro)
- [x] **Sign PSBT**: Request signature from connected wallet.
- [x] **Broadcast**: Push signed transaction to the Bitcoin network (via mempool.space API).

## Phase 5: Air-gapped & Hardware Support 📷
- [x] **Animated QR Codes**: Generate BC-UR (Blockchain Commons Uniform Resources) animated QR codes for air-gapped wallets (Keystone, Passport, Jade).
- [x] **QR Scanning**: Use device camera to scan signed PSBT QR codes back into the app.

## Phase 6: Security & Analysis 🛡️
- [ ] **Risk Engine**: Automated checks for common pitfalls:
  - High Fees (Review-worthy absolute or relative fee).
  - Dangerous Sighashes (`SIGHASH_NONE`, `SIGHASH_SINGLE`).
  - Dust Outputs.
- [ ] **Deep Taproot**: Visualize Taproot script trees if KeySpend is not used.
- [ ] **Fee Rate Context**: Show sats/vbyte estimation.
