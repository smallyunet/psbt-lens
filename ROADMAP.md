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

## Phase 2: Deep Inspection (Upcoming) 🚧
- [ ] **Script Decoding**: Display ASM (Assembly) for ScriptSig and ScriptPubKey.
- [ ] **Address Type Detection**: Better identification of address types (P2PKH, P2SH, P2WPKH, P2TR).
- [ ] **Sighash Inspection**: Visualize sighash types for inputs.
- [ ] **Locktime & Version**: Display transaction locktime and version fields.

## Phase 3: Modification & Interaction 🛠️
- [ ] **Edit Outputs**: Allow modifying output values and addresses.
- [ ] **Input Control**: Ability to remove specific inputs.
- [ ] **Combine PSBTs**: Merge multiple signed PSBTs into one.
- [ ] **Raw Transaction Extraction**: Extract the final hex if fully signed.

## Phase 4: Wallet Integration 🔐
- [ ] **Wallet Connect**: Support for connecting browser wallets:
  - Unisat
  - Xverse
  - Leather (Hiro)
- [ ] **Sign PSBT**: Request signature from connected wallet.
- [ ] **Broadcast**: Push signed transaction to the Bitcoin network (via mempool.space API).
