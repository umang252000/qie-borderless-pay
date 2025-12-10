QIE Borderless Pay
Global Micro-Loans + Automated Payroll + On-Chain Reputation — Powered by QIE Blockchain

QIE Borderless Pay is a decentralized financial system enabling:

Instant micro-loans with fair interest

On-chain reputation scoring

Automated payroll with savings split

Cross-border FX conversion (on-chain oracle / engine)

Risk scoring API (off-chain backend)

Secure wallet login (QIE Wallet, MetaMask, Mobile WalletConnect)

Built for the QIE Hackathon, combining real business impact, clean architecture, and deployability.

Live Deployments
Component	URL
Frontend (Render)	https://qie-borderless-pay-2.onrender.com

Backend Risk Engine (Render)	https://qie-bo.onrender.com/health

Explorer (QIE Testnet)	https://qie-bo.onrender.com/health

Smart Contracts (QIE Testnet)	See “Contract Addresses” below

Table of Contents

Overview

Key Features

Architecture

Smart Contracts

Backend Risk Engine

Frontend App

Testnet Deployment

Local Development

Environment Variables

Project Structure

Future Improvements

License

Overview

QIE Borderless Pay enables borderless payments and micro-lending using smart contracts deployed on QIE Blockchain.
Borrowers gain access to loans instantly, build reputation, and use payroll automation to grow savings automatically.

Key Features
1. On-Chain Reputation Score (600–1000)

Borrowers earn a reputation score based on loan performance.

2. Micro-Loan Pool

Create loan

Repay with interest

Late repayment reduces score

Good repayment increases score

3. Payroll Engine

Automated payroll with:

FX conversion

Savings percentage split

Employer funding + withdrawal

4. Risk Engine API (Backend)

Returns borrower risk score based on:

Wallet history

Reputation score

Off-chain heuristics

5. Modern Frontend

React + Vite

Reusable wallet modal

Borrow page

Contract interaction UI

6. Multi-Wallet Support

QIE Wallet

MetaMask

WalletConnect (mobile wallets)

Fallback mock wallet (Codespaces-safe)

Architecture
qie-borderless-pay/

├── hardhat/         # Solidity contracts + deployment

├── backend/         # Risk engine API (Node.js / Express)

└── frontend/        # React + Vite UI

Smart Contracts

Deployed on QIE Testnet (Chain ID: 1983)

RPC: https://rpc1testnet.qie.digital

Contract	Address

ReputationScore	0x02e04f6e008e06EC7a3E3a01Bb5491e016799260

FXEngine	0xde21200485b6D9dEE750297A5fE63458f1e81cD6

LoanPool	0x51A1060c276fd2A782BF640E7b8aCD5103cf41E6

PayrollEngine	0x693de56163daA399797617a1E16421Eba3ECBaF3

Contracts are located in:

hardhat/contracts/

Run tests:

cd hardhat
npx hardhat test

Architecture Explanation


                       ┌────────────────────────────┐
                       │        FRONTEND (UI)        │
                       │  React + Vite + ethers.js   │
                       │                              │
                       │ • Wallet Modal (QIE/MetaMask)│
                       │ • Borrow Loan UI             │
                       │ • Repay Loan UI              │
                       │ • Payroll UI                 │
                       │ • Risk Score Display         │
                       └──────────────┬───────────────┘
                                      │ 1. JSON-RPC Calls
                                      ▼
                     ┌──────────────────────────────────────┐
                     │      QIE BLOCKCHAIN (Testnet)        │
                     │                                               
                     │ Smart Contracts:                            │
                     │  • ReputationScore                          │
                     │  • LoanPool                                 │
                     │  • PayrollEngine                            │
                     │  • FXEngine                                 │
                     └──────────────┬──────────────────────────────┘
                                    │ 2. Query On-chain Reputation
                                    ▼
       ┌──────────────────────────────────────────────────────────┐
       │        BACKEND — Risk Engine API (Node + Express)        │
       │ https://qie-bo.onrender.com                              │
       │                                                          │
       │ • Computes risk score (700–900)                          │
       │ • Fetches on-chain reputation                            │
       │ • ML/Heuristic model (expandable)                        │
       │ • Rate limiting + logging                                │
       └──────────────┬──────────────────────────────────────────┘
                      │ 3. REST API (/risk/:wallet)
                      ▼
       ┌──────────────────────────────────────────────────────────┐
       │                   DATABASE (Future)                       │
       │ • Loan behavior logs                                      │
       │ • Off-chain analytics                                     │
       │ • Risk model training data                                │
       └──────────────────────────────────────────────────────────┘


Backend Risk Engine

Located at:

backend/src/


Main endpoints:

GET /risk/:wallet

Returns:

{
  "wallet": "0x123...",
  "risk": 742
}


Local run:

cd backend
npm install
npm start


Production URL (Render):

https://qie-bo.onrender.com

Frontend App (Vite + React)

Located at:

frontend/


Includes:

Custom wallet modal

Borrow page (create, view, repay loan)

Reputation + risk score viewer

Contract interaction through ethers v6

Mobile wallet QR support

Build locally:

cd frontend
npm install
npm run dev

Full Testnet Deployment
Deploy Smart Contracts

Update .env:

QIE_RPC_URL=https://rpc1testnet.qie.digital
DEPLOYER_PRIVATE_KEY=YOUR_PRIVATE_KEY


Run deploy:

npx hardhat run scripts/deploy.js --network qie_testnet

Deploy Backend on Render

Render settings:

Type: Web Service
Root Directory: backend
Build Command: npm install
Start Command: npm start

Deploy Frontend on Render (Static Site)

Render settings:

Type: Static Site
Root Directory: frontend
Build Command: npm install && npm run build
Publish Directory: dist


Add environment variable:

VITE_BACKEND_URL=https://qie-bo.onrender.com

Environment Variables
Hardhat (hardhat/.env)
QIE_RPC_URL=https://rpc1testnet.qie.digital
DEPLOYER_PRIVATE_KEY=0x...

Backend (backend/.env)
PORT=4000

Frontend (frontend/.env)
VITE_BACKEND_URL=https://qie-bo.onrender.com

UML Class Diagram (Text Version)



┌────────────────────────┐
│  
    ReputationScore     │
    
├────────────────────────┤

│ - scores: mapping       │

│ - authorized: mapping   │

├────────────────────────┤

│ + increaseScore(addr)   │

│ + decreaseScore(addr)   │

│ + getScore(addr)        │


│ + authorize(contract)   │

└────────────────────────┘

             ▲
             │ (used by)
             
┌────────────────────────┐

│        LoanPool         │

├────────────────────────┤

│ - loanCount             │

│ - loans: mapping        │

│ - reputation: address   │

├────────────────────────┤

│ + createLoan()          │

│ + repay()               │

│ + getLoan()             │

└────────────────────────┘


┌────────────────────────┐

│        FXEngine         │

├────────────────────────┤

│ + convert(tokenIn,      │

│           tokenOut,     │

│           amount)       │

└────────────────────────┘



                ┌────────────────────────┐
                │     PayrollEngine      │
                ├────────────────────────┤
                │ - instructionCount     │
                │ - instructions: mapping│
                │ - fxEngine: address    │
                │ - owner                │
                ├────────────────────────┤
                │ + createInstruction()  │
                │ + executeInstruction() │
                │ + fundEmployer()       │
                │ + withdraw()           │
                └────────────────────────┘





Project Structure
qie-borderless-pay/

│
├── backend/

│   ├── src/

│   │   ├── index.ts

│   │   └── riskEngine/

│   └── Dockerfile
│
├── frontend/

│   ├── src/

│   │   ├── App.tsx

│   │   ├── pages/Borrow.tsx

│   │   ├── components/wallet/

│   │   └── services/contracts.ts

│   └── public/
│

└── hardhat/

    ├── contracts/
    
    ├── scripts/deploy.js
    
    ├── test/
    
    └── hardhat.config.ts

Future Enhancements

Multi-token lending

Collateralized lending

ZK reputation proofs

Cross-chain loan portability

Predictive ML-based risk engine

Dashboard for employers & lenders

Real-time FX via QIE oracle integration

Final Note

This project have:

✔ Scalable

✔ Cleanly architected

✔ Fully deployable on QIE Testnet

✔ Real-world meaningful
