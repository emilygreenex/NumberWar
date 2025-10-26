# NumberWar

<div align="center">

**A fully homomorphic encryption-powered blockchain game where privacy meets strategy**

[![License](https://img.shields.io/badge/License-BSD--3--Clause--Clear-blue.svg)](LICENSE)
[![Built with FHEVM](https://img.shields.io/badge/Built%20with-FHEVM-purple.svg)](https://docs.zama.ai/fhevm)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.24-363636?logo=solidity)](https://soliditylang.org/)
[![React](https://img.shields.io/badge/React-19.1-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript)](https://www.typescriptlang.org/)

[Live Demo](#) | [Documentation](https://docs.zama.ai/fhevm) | [Report Bug](https://github.com/zama-ai/fhevm/issues)

</div>

---

## 📖 Overview

**NumberWar** is an innovative blockchain-based game that leverages **Fully Homomorphic Encryption (FHE)** to create a truly private and fair gaming experience. Unlike traditional blockchain games where all data is visible on-chain, NumberWar uses Zama's FHEVM protocol to keep game logic and player choices encrypted throughout the entire gameplay process.

### The Game

Players engage in encrypted number duels where:
1. The system generates a **secret encrypted number** (1-10) for you
2. You submit your own **encrypted number** (1-10)
3. If the **sum is even**, you win the round!

The twist? All calculations happen on encrypted data. The blockchain processes your numbers without ever knowing their values, ensuring complete privacy and preventing any form of cheating or front-running.

---

## ✨ Key Features

### 🔐 True On-Chain Privacy
- **Encrypted Gameplay**: All game state, numbers, and outcomes remain encrypted on-chain
- **No Information Leakage**: Neither other players nor validators can see your choices
- **Verifiable Fairness**: Smart contract logic is transparent while data remains private

### 🎮 Innovative Game Mechanics
- **Pseudo-Random Number Generation**: Provably fair encrypted random numbers for each player
- **Client-Side Decryption**: Only you can decrypt your game state using cryptographic keys
- **Instant Results**: On-chain computation of encrypted outcomes without revealing intermediate values

### 🛡️ Security & Privacy
- **Front-Running Protection**: Encrypted inputs prevent MEV attacks
- **Zero-Knowledge Computation**: Blockchain validates results without seeing player data
- **Cryptographic Guarantees**: Powered by Zama's battle-tested FHE library

### 🌐 Modern Web3 Stack
- **RainbowKit Integration**: Seamless wallet connection experience
- **Multi-Wallet Support**: Compatible with MetaMask, WalletConnect, and more
- **Real-Time State Sync**: Automatic synchronization of encrypted game state
- **Responsive UI**: Clean, modern interface built with React 19

---

## 🏗️ Architecture

### Smart Contract Layer
```
NumberWar.sol (Sepolia Testnet)
├── Encrypted State Management
│   ├── System Numbers (euint8)
│   ├── Player Submissions (euint8)
│   └── Round Outcomes (ebool)
├── FHE Operations
│   ├── Addition (encrypted)
│   ├── Modulo (encrypted)
│   └── Equality Check (encrypted)
└── Access Control
    └── Per-player encrypted data permissions
```

### Frontend Architecture
```
React Application (TypeScript + Vite)
├── Web3 Integration
│   ├── Wagmi v2 (Ethereum interactions)
│   ├── Viem (Contract communication)
│   └── RainbowKit (Wallet UI)
├── FHE Client
│   ├── Zama Relayer SDK
│   ├── Encryption/Decryption
│   └── Zero-Knowledge Proofs
└── State Management
    ├── React Query (Server state)
    └── React Hooks (Local state)
```

---

## 🚀 Technology Stack

### Blockchain & Smart Contracts
| Technology | Version | Purpose |
|-----------|---------|---------|
| **Solidity** | 0.8.24+ | Smart contract language |
| **FHEVM** | 0.8.0 | Fully homomorphic encryption for EVM |
| **Hardhat** | 2.26.0 | Development environment |
| **OpenZeppelin** | Latest | Secure contract standards |
| **Ethers.js** | 6.15.0 | Ethereum library |

### Frontend Technologies
| Technology | Version | Purpose |
|-----------|---------|---------|
| **React** | 19.1.1 | UI framework |
| **TypeScript** | 5.8.3 | Type-safe JavaScript |
| **Vite** | 7.1.6 | Build tool & dev server |
| **Wagmi** | 2.17.0 | React hooks for Ethereum |
| **Viem** | 2.37.6 | TypeScript Ethereum library |
| **RainbowKit** | 2.2.8 | Wallet connection UI |
| **TanStack Query** | 5.89.0 | Async state management |

### Cryptography
| Technology | Version | Purpose |
|-----------|---------|---------|
| **Zama FHEVM** | Latest | Fully homomorphic encryption |
| **Zama Relayer SDK** | 0.2.0 | Client-side encryption |
| **Noble Cryptography** | Latest | Cryptographic primitives |

---

## 🎯 Problems Solved

### 1. **Blockchain Transparency Paradox**
**Problem**: Public blockchains expose all transaction data, making traditional games vulnerable to cheating.

**Solution**: NumberWar uses FHE to compute game logic on encrypted data, maintaining blockchain's trustless properties while ensuring privacy.

### 2. **Front-Running & MEV Attacks**
**Problem**: Miners and bots can observe pending transactions and manipulate outcomes.

**Solution**: Encrypted player inputs prevent anyone from seeing or acting on player choices before they're committed.

### 3. **Centralized Game Servers**
**Problem**: Traditional online games require trusted servers that can be manipulated or shut down.

**Solution**: Fully decentralized smart contract with verifiable logic ensures no single party controls the game.

### 4. **Fair Random Number Generation**
**Problem**: Generating truly random numbers on-chain is challenging and often exploitable.

**Solution**: Pseudo-random generation combined with FHE ensures fairness while keeping values secret until decryption.

### 5. **Complex FHE Integration**
**Problem**: Implementing FHE in dApps requires deep cryptographic knowledge.

**Solution**: NumberWar demonstrates a production-ready pattern for integrating Zama's FHEVM with modern Web3 frontends.

---

## 📦 Installation & Setup

### Prerequisites

Ensure you have the following installed:
- **Node.js**: v20 or higher
- **npm** or **yarn/pnpm**: Latest version
- **MetaMask** or compatible Web3 wallet
- **Sepolia testnet ETH**: [Get from faucet](https://sepoliafaucet.com/)

### Backend Setup (Smart Contracts)

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/NumberWar.git
   cd NumberWar
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   # Set your private key for deployment
   npx hardhat vars set PRIVATE_KEY

   # Set your Infura API key for network access
   npx hardhat vars set INFURA_API_KEY

   # Optional: Set Etherscan API key for contract verification
   npx hardhat vars set ETHERSCAN_API_KEY
   ```

   Or create a `.env` file:
   ```env
   PRIVATE_KEY=your_private_key_here
   INFURA_API_KEY=your_infura_key_here
   ETHERSCAN_API_KEY=your_etherscan_key_here
   ```

4. **Compile contracts**
   ```bash
   npm run compile
   ```

5. **Run tests**
   ```bash
   # Local tests
   npm run test

   # Sepolia testnet tests
   npm run test:sepolia
   ```

6. **Deploy to Sepolia**
   ```bash
   npm run deploy:sepolia
   ```

7. **Verify contract on Etherscan**
   ```bash
   npm run verify:sepolia
   ```

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Configure contract address**

   Edit `frontend/src/config/contracts.ts`:
   ```typescript
   export const CONTRACT_ADDRESS = '0xYourDeployedContractAddress';
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Access the application**

   Open [http://localhost:5173](http://localhost:5173) in your browser.

6. **Build for production**
   ```bash
   npm run build
   npm run preview  # Preview production build
   ```

---

## 🎮 How to Play

### Step 1: Connect Your Wallet
Click "Connect Wallet" in the header and select your preferred wallet (MetaMask recommended).

### Step 2: Join a Game Round
1. Click **"Join Game"** to start a new round
2. The contract generates an encrypted system number (1-10)
3. Wait for the transaction to confirm
4. The encrypted system number will appear (looks like `0x...`)

### Step 3: Submit Your Encrypted Number
1. Enter a number between 1-10 in the input field
2. Click **"Submit Encrypted Number"**
3. Your number gets encrypted on the client side
4. The smart contract computes the outcome on encrypted data
5. Wait for transaction confirmation

### Step 4: Decrypt Results
1. Click **"Decrypt"** next to "System Number" to reveal the computer's choice
2. Click **"Decrypt"** next to "Round Outcome" to see if you won
3. You win if the sum of both numbers is even!

### Step 5: Play Again
Start a new round anytime by clicking "Join Game" again.

---

## 🔧 Development Guide

### Project Structure

```
NumberWar/
├── contracts/              # Solidity smart contracts
│   └── NumberWar.sol      # Main game contract
├── deploy/                # Hardhat deployment scripts
│   └── deploy.ts          # Deployment configuration
├── tasks/                 # Custom Hardhat tasks
│   ├── NumberWar.ts       # Game-specific tasks
│   └── accounts.ts        # Account management tasks
├── test/                  # Contract tests
│   ├── NumberWar.ts       # Local tests
│   └── NumberWarSepolia.ts # Sepolia integration tests
├── frontend/              # React frontend application
│   ├── src/
│   │   ├── components/    # React components
│   │   │   ├── Header.tsx
│   │   │   └── NumberWarGame.tsx
│   │   ├── config/        # Configuration files
│   │   │   ├── contracts.ts  # Contract ABI & address
│   │   │   └── wagmi.ts      # Web3 configuration
│   │   ├── hooks/         # Custom React hooks
│   │   │   ├── useEthersSigner.ts
│   │   │   └── useZamaInstance.ts
│   │   ├── styles/        # CSS files
│   │   ├── App.tsx        # Main app component
│   │   └── main.tsx       # Entry point
│   ├── public/            # Static assets
│   └── package.json
├── hardhat.config.ts      # Hardhat configuration
├── package.json           # Root dependencies
└── README.md
```

### Available Scripts

#### Backend Scripts
```bash
npm run compile        # Compile Solidity contracts
npm run test          # Run contract tests locally
npm run test:sepolia  # Run tests on Sepolia
npm run coverage      # Generate test coverage report
npm run lint          # Lint Solidity and TypeScript
npm run lint:sol      # Lint only Solidity files
npm run lint:ts       # Lint only TypeScript files
npm run clean         # Clean build artifacts
npm run typechain     # Generate TypeScript bindings
npm run deploy:localhost  # Deploy to local network
npm run deploy:sepolia    # Deploy to Sepolia testnet
npm run verify:sepolia    # Verify contract on Etherscan
```

#### Frontend Scripts
```bash
cd frontend
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Lint frontend code
```

### Smart Contract API

#### Core Functions

##### `joinGame()`
Starts a new game round and generates an encrypted system number.
```solidity
function joinGame() external returns (euint8)
```
- **Returns**: Encrypted system number (euint8)
- **Emits**: `RoundPrepared(address player)`

##### `submitNumber(externalEuint8 playerNumber, bytes calldata inputProof)`
Submits player's encrypted number and computes the outcome.
```solidity
function submitNumber(
    externalEuint8 playerNumber,
    bytes calldata inputProof
) external returns (ebool)
```
- **Parameters**:
  - `playerNumber`: Encrypted player number
  - `inputProof`: Zero-knowledge proof validating the encrypted input
- **Returns**: Encrypted boolean indicating win/loss
- **Emits**: `RoundCompleted(address player, bool hasActiveRound)`

##### `getSystemNumber(address player)`
Retrieves the encrypted system number for a player.
```solidity
function getSystemNumber(address player) external view returns (euint8)
```
- **Returns**: Encrypted system number
- **Requires**: Active round for the player

##### `getLastOutcome(address player)`
Retrieves the encrypted outcome of the last round.
```solidity
function getLastOutcome(address player) external view returns (ebool)
```
- **Returns**: Encrypted boolean representing win/loss

##### `hasActiveRound(address player)`
Checks if a player has an active game round.
```solidity
function hasActiveRound(address player) external view returns (bool)
```
- **Returns**: True if the player has an active round

### Frontend Integration Patterns

#### Using Zama FHEVM Client

```typescript
import { useZamaInstance } from './hooks/useZamaInstance';

const { instance, isLoading, error } = useZamaInstance();

// Encrypt a number
const encryptNumber = async (value: number) => {
  const buffer = instance.createEncryptedInput(CONTRACT_ADDRESS, userAddress);
  buffer.add8(BigInt(value));
  const encryptedInput = await buffer.encrypt();
  return encryptedInput;
};

// Decrypt a ciphertext
const decryptValue = async (handle: string) => {
  const keypair = instance.generateKeypair();
  const result = await instance.userDecrypt(
    [{ handle, contractAddress: CONTRACT_ADDRESS }],
    keypair.privateKey,
    keypair.publicKey,
    signature,
    [CONTRACT_ADDRESS],
    userAddress,
    timestamp,
    duration
  );
  return result[handle];
};
```

#### Contract Interaction with Ethers

```typescript
import { Contract } from 'ethers';
import { useEthersSigner } from './hooks/useEthersSigner';

const signer = await useEthersSigner();
const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

// Join game
const tx = await contract.joinGame();
await tx.wait();

// Submit number
const encryptedInput = await encryptNumber(playerChoice);
const tx = await contract.submitNumber(
  encryptedInput.handles[0],
  encryptedInput.inputProof
);
await tx.wait();
```

### Testing

#### Running Local Tests
```bash
npm run test
```

Tests use Hardhat's local network with FHEVM plugin for encryption operations.

#### Running Sepolia Tests
```bash
npm run test:sepolia
```

Integration tests on Sepolia testnet using real FHE operations and Zama oracles.

#### Test Coverage
```bash
npm run coverage
```

Generates detailed coverage report in `coverage/` directory.

---

## 🗺️ Roadmap & Future Plans

### Phase 1: Core Improvements (Q2 2025)
- [ ] **Multi-Player Tournaments**: Enable multiple players to compete in brackets
- [ ] **Leaderboard System**: Track wins/losses with encrypted player stats
- [ ] **Custom Game Modes**: Different winning conditions (odd sum, specific ranges, etc.)
- [ ] **Mobile Optimization**: Enhanced mobile responsive design

### Phase 2: Enhanced Features (Q3 2025)
- [ ] **Token Rewards**: ERC-20 token distribution for winners
- [ ] **NFT Achievements**: Mint achievement badges as NFTs
- [ ] **Betting System**: Stake tokens on game outcomes
- [ ] **Social Features**: Friend challenges and private rooms

### Phase 3: Advanced Mechanics (Q4 2025)
- [ ] **Multi-Round Games**: Best of 3/5 match formats
- [ ] **Power-Ups**: Special encrypted abilities (reroll, peek, etc.)
- [ ] **Dynamic Difficulty**: Adaptive number ranges based on player skill
- [ ] **Cross-Chain Support**: Deploy to other FHEVM-compatible chains

### Phase 4: Ecosystem Growth (2026)
- [ ] **SDK Release**: Developer toolkit for building FHE games
- [ ] **Game Builder**: No-code tool for creating custom FHE games
- [ ] **DAO Governance**: Community-driven feature proposals
- [ ] **Educational Content**: Tutorials and workshops on FHE gaming

### Research & Innovation
- [ ] Explore advanced FHE operations (comparison, multiplication)
- [ ] Investigate Layer 2 solutions for gas optimization
- [ ] Study zero-knowledge proof integration for scalability
- [ ] Develop reference architecture for FHE dApp developers

---

## 🤝 Contributing

We welcome contributions from the community! Whether you're fixing bugs, adding features, or improving documentation, your help is appreciated.

### How to Contribute

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
   - Follow the existing code style
   - Add tests for new features
   - Update documentation as needed
4. **Commit your changes**
   ```bash
   git commit -m "Add amazing feature"
   ```
5. **Push to your fork**
   ```bash
   git push origin feature/amazing-feature
   ```
6. **Open a Pull Request**

### Development Guidelines

- **Code Style**: Follow TypeScript and Solidity best practices
- **Testing**: Maintain >80% test coverage for smart contracts
- **Documentation**: Update README and code comments
- **Gas Optimization**: Consider gas costs in smart contract changes
- **Security**: Never commit private keys or sensitive data

### Areas We Need Help

- 🐛 Bug fixes and testing
- 📱 Mobile UI/UX improvements
- 🌍 Internationalization (i18n)
- 📝 Documentation and tutorials
- 🎨 Design and branding
- 🔬 Research on advanced FHE use cases

---

## 🔐 Security

### Audit Status
This project is currently **unaudited**. Do not use in production with real funds without proper security review.

### Reporting Vulnerabilities
If you discover a security vulnerability, please email security@example.com instead of using the issue tracker.

### Best Practices
- Never share your private keys
- Always verify contract addresses before interacting
- Test on testnets before mainnet deployment
- Keep dependencies updated
- Use hardware wallets for significant funds

---

## 📄 License

This project is licensed under the **BSD-3-Clause-Clear License**.

```
Copyright (c) 2025 NumberWar Contributors

Redistribution and use in source and binary forms, with or without
modification, are permitted (subject to the limitations in the disclaimer
below) provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice,
   this list of conditions and the following disclaimer.
2. Redistributions in binary form must reproduce the above copyright notice,
   this list of conditions and the following disclaimer in the documentation
   and/or other materials provided with the distribution.
3. Neither the name of the copyright holder nor the names of its contributors
   may be used to endorse or promote products derived from this software
   without specific prior written permission.

NO EXPRESS OR IMPLIED LICENSES TO ANY PARTY'S PATENT RIGHTS ARE GRANTED BY
THIS LICENSE.
```

See [LICENSE](LICENSE) file for full details.

---

## 🙏 Acknowledgments

### Core Technologies
- **[Zama](https://zama.ai/)** - For pioneering FHE technology and FHEVM
- **[Hardhat](https://hardhat.org/)** - Ethereum development environment
- **[OpenZeppelin](https://openzeppelin.com/)** - Secure smart contract library
- **[RainbowKit](https://rainbowkit.com/)** - Beautiful wallet connection UI
- **[Wagmi](https://wagmi.sh/)** - React hooks for Ethereum

### Inspiration
This project was inspired by the vision of bringing true privacy to blockchain gaming while maintaining the trustless properties that make blockchain technology revolutionary.

### Community
Special thanks to all contributors, testers, and community members who have provided feedback and support.

---

## 📞 Support & Community

### Get Help
- **Documentation**: [Zama FHEVM Docs](https://docs.zama.ai/fhevm)
- **GitHub Issues**: [Report bugs or request features](https://github.com/yourusername/NumberWar/issues)
- **Discord**: [Join Zama Community](https://discord.gg/zama)

### Stay Connected
- 🌐 **Website**: [Coming Soon]
- 🐦 **Twitter**: [@NumberWarGame](https://twitter.com/NumberWarGame) (Coming Soon)
- 💬 **Discord**: [Join our server](https://discord.gg/numberwar) (Coming Soon)
- 📧 **Email**: contact@numberwar.game (Coming Soon)

### Learning Resources
- [FHEVM Tutorial Series](https://docs.zama.ai/protocol/solidity-guides)
- [Understanding Homomorphic Encryption](https://zama.ai/introduction-to-homomorphic-encryption)
- [Building Privacy-Preserving dApps](https://docs.zama.ai/fhevm)

---

<div align="center">

**Built with ❤️ using Zama's FHEVM**

⭐ Star us on GitHub if you find this project interesting!

[Report Bug](https://github.com/yourusername/NumberWar/issues) · [Request Feature](https://github.com/yourusername/NumberWar/issues) · [Documentation](https://docs.zama.ai/fhevm)

</div>
