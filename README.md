# 💰 BudgetBuddy

### *Your Intelligent AI-Powered Financial Companion*

[![React](https://img.shields.io/badge/React-19-blue?logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6-purple?logo=vite)](https://vitejs.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Google Gemini](https://img.shields.io/badge/AI-Google_Gemini-orange?logo=googlegemini)](https://ai.google.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)

</div>

---

## 🌟 Overview

**BudgetBuddy** is a modern, premium financial management application designed to help you take control of your wealth. Combining sleek design with powerful AI insights, BudgetBuddy goes beyond simple expense tracking to provide actionable advice and real-time monitoring of your financial health.

## ✨ Key Features

- 📊 **Dynamic Dashboard**: A comprehensive view of your balance, income, and expenses with elegant data visualizations.
- 🤖 **AI Financial Analysis**: Get personalized, actionable insights from Google's Gemini AI based on your spending patterns.
- 💬 **Intelligent ChatBot**: Chat with your personal financial assistant to ask questions about budgeting and saving strategies.
- 🎯 **Category Budgets**: Set specific spending limits for different categories and receive real-time alerts when you're nearing or exceeding them.
- 🏦 **Multi-Account Management**: Track assets across multiple bank accounts, wallets, and investments.
- 📈 **Trend Visualization**: Interactive charts (Breakdown & Trends) to visualize your financial progress over time.
- 🎨 **Premium UI/UX**: A state-of-the-art dark mode interface with smooth animations and micro-interactions.

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript
- **Styling**: Tailwind CSS (Custom Theme)
- **Icons**: Lucide React
- **Charts**: Recharts
- **AI Engine**: Google Gemini AI (`gemini-3-flash-preview`)
- **Build Tool**: Vite

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/)
- A Google Gemini API Key

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd budgetbuddy
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env.local` file in the root directory and add your Gemini API key:
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```

5. **Open your browser**:
   Navigate to `http://localhost:5173` to see the app in action.

## 📁 Project Structure

```
budgetbuddy/
├── components/     # UI Components (Dashboard, ChatBot, etc.)
├── services/       # AI & External integrations
├── App.tsx         # Main application entry
├── types.ts        # TypeScript interfaces
├── index.html      # HTML template
├── index.tsx       # Entry point
├── vite.config.ts  # Vite configuration
└── package.json    # Project dependencies
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

---

<p align="center">Made with ❤️ for better financial futures.</p>
