'use client';

import React, { useState } from 'react';
import { ArrowRightLeft, Zap, TrendingUp } from 'lucide-react';

export default function SwapsPage() {
  const [fromToken, setFromToken] = useState('SOL');
  const [toToken, setToToken] = useState('USDC');
  const [amount, setAmount] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);

  const handleSwap = async () => {
    if (!amount) return;
    setIsExecuting(true);
    // Simulate swap execution
    setTimeout(() => {
      setIsExecuting(false);
      setAmount('');
    }, 2000);
  };

  const availableTokens = [
    { symbol: 'SOL', balance: 45.23, price: 210.5 },
    { symbol: 'USDC', balance: 150000, price: 1.0 },
    { symbol: 'USDT', balance: 50000, price: 1.0 },
    { symbol: 'BONK', balance: 5000000, price: 0.00004 },
  ];

  const swapRoutes = [
    {
      protocol: 'Orca',
      route: `${fromToken} → ${toToken}`,
      priceImpact: 0.12,
      fee: 0.25,
      expectedOutput: amount ? (parseFloat(amount) * 0.9975).toFixed(2) : '0',
    },
    {
      protocol: 'Marinade',
      route: `${fromToken} → ${toToken}`,
      priceImpact: 0.08,
      fee: 0.2,
      expectedOutput: amount ? (parseFloat(amount) * 0.998).toFixed(2) : '0',
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-2">
          <ArrowRightLeft className="text-cyan-glow" />
          Private Token Swaps
        </h1>
        <p className="text-muted-foreground">
          Stealth swaps through Cloak SDK with optimal routing
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Swap Panel */}
        <div className="lg:col-span-2">
          <div className="glass border border-cyan-glow/20 rounded-2xl p-8 neo-glow-cyan">
            {/* From Section */}
            <div className="mb-6">
              <label className="block text-sm text-muted-foreground mb-3">From</label>
              <div className="flex gap-3">
                <select
                  value={fromToken}
                  onChange={(e) => setFromToken(e.target.value)}
                  className="flex-1 bg-graphite border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-glow"
                >
                  {availableTokens.map((t) => (
                    <option key={t.symbol} value={t.symbol}>
                      {t.symbol}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="flex-1 bg-graphite border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-glow text-right"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Balance: {availableTokens.find((t) => t.symbol === fromToken)?.balance} {fromToken}
              </p>
            </div>

            {/* Swap Direction */}
            <div className="flex justify-center mb-6 -my-2">
              <button
                onClick={() => {
                  setFromToken(toToken);
                  setToToken(fromToken);
                }}
                className="bg-cyan-glow/20 hover:bg-cyan-glow/30 p-3 rounded-full transition-all"
              >
                <ArrowRightLeft size={20} className="text-cyan-glow" />
              </button>
            </div>

            {/* To Section */}
            <div className="mb-8">
              <label className="block text-sm text-muted-foreground mb-3">To</label>
              <div className="flex gap-3">
                <select
                  value={toToken}
                  onChange={(e) => setToToken(e.target.value)}
                  className="flex-1 bg-graphite border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-glow"
                >
                  {availableTokens.map((t) => (
                    <option key={t.symbol} value={t.symbol}>
                      {t.symbol}
                    </option>
                  ))}
                </select>
                <div className="flex-1 bg-graphite/50 border border-white/5 rounded-lg px-4 py-3 text-white/50 text-right">
                  {amount ? (parseFloat(amount) * 0.9975).toFixed(2) : '0.00'}
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Balance: {availableTokens.find((t) => t.symbol === toToken)?.balance} {toToken}
              </p>
            </div>

            {/* Execute Button */}
            <button
              onClick={handleSwap}
              disabled={!amount || isExecuting}
              className="w-full px-6 py-4 bg-cyan-glow text-black font-bold rounded-xl hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all neo-glow-cyan"
            >
              {isExecuting ? 'Executing Stealth Swap...' : 'Execute Stealth Swap'}
            </button>
          </div>
        </div>

        {/* Routes Panel */}
        <div className="lg:col-span-1">
          <div className="glass border border-purple-glow/20 rounded-2xl p-6 neo-glow-purple">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <TrendingUp size={20} className="text-purple-glow" />
              Optimal Routes
            </h3>

            <div className="space-y-4">
              {swapRoutes.map((route, idx) => (
                <div
                  key={idx}
                  className="bg-purple-glow/10 border border-purple-glow/30 rounded-lg p-4 cursor-pointer hover:border-purple-glow/50 transition-all"
                >
                  <div className="flex justify-between items-start mb-3">
                    <span className="font-semibold text-purple-glow">{route.protocol}</span>
                    <span className="text-xs bg-emerald-glow/20 text-emerald-glow px-2 py-1 rounded">
                      Best
                    </span>
                  </div>

                  <div className="text-sm space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Route</span>
                      <span className="font-mono">{route.route}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Fee</span>
                      <span className="font-mono">{route.fee}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Impact</span>
                      <span className="font-mono">{route.priceImpact}%</span>
                    </div>
                    <div className="pt-2 border-t border-white/10 flex justify-between">
                      <span className="text-muted-foreground">Output</span>
                      <span className="font-bold text-emerald-glow">{route.expectedOutput}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Privacy Features */}
            <div className="mt-8 pt-6 border-t border-white/10">
              <h4 className="text-sm font-semibold text-cyan-glow mb-3 flex items-center gap-2">
                <Zap size={16} />
                Privacy Shield
              </h4>
              <div className="text-xs text-muted-foreground space-y-2">
                <div className="flex items-start gap-2">
                  <span className="text-cyan-glow mt-0.5">✓</span>
                  <span>Shielded addresses</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-cyan-glow mt-0.5">✓</span>
                  <span>Routed through Cloak</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-cyan-glow mt-0.5">✓</span>
                  <span>No public traces</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
