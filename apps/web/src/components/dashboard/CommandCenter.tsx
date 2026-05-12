"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Activity, 
  ShieldAlert, 
  Zap, 
  TrendingUp, 
  Lock,
  ArrowUpRight,
  ArrowDownLeft,
  Search,
  Cpu,
  Wallet
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { StealthRouteMap } from './StealthRouteMap';
import { trpc } from '@/lib/trpc';
import { useWallet } from '@solana/wallet-adapter-react';

export function CommandCenter() {
  const { publicKey } = useWallet();
  const { data, isLoading } = trpc.getOverview.useQuery({ orgId: 'default-org' });
  const { data: walletBalance } = trpc.getDevnetBalance.useQuery(
    { address: publicKey?.toBase58() || '' },
    { enabled: !!publicKey }
  );
  
  const treasury = data?.treasury;
  const agents = data?.agents || [];
  const transactions = treasury?.transactions || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="w-12 h-12 border-4 border-cyan-glow border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-12 gap-6">
      {/* Top Header */}
      <div className="col-span-12 flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-glow">Command Center</h1>
          <p className="text-muted-foreground mt-1">Autonomous invisible operations are stable.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 glass rounded-xl border-cyan-glow/20">
            <div className="w-2 h-2 rounded-full bg-cyan-glow animate-pulse" />
            <span className="text-xs font-mono text-cyan-glow">NETWORK: SOLANA MAINNET</span>
          </div>
          <button className="px-6 py-2 bg-cyan-glow text-black font-bold rounded-xl neo-glow-cyan hover:scale-105 transition-all">
            Connect Stealth Wallet
          </button>
        </div>
      </div>

      {/* Main Stats */}
      <div className="col-span-12 lg:col-span-8 space-y-6">
        <div className="grid grid-cols-3 gap-6">
          <StatCard 
            title="Total Shielded Treasury" 
            value={publicKey ? `$${((walletBalance || 0) * 200).toLocaleString()}` : treasury ? `$${treasury.balance.toLocaleString()}` : "$0"} 
            change="+12.4%" 
            icon={Lock} 
            color="cyan" 
          />
          <StatCard 
            title="Active AI Agents" 
            value={`${agents.length} / 7`} 
            change="Optimized" 
            icon={Activity} 
            color="purple" 
          />
          <StatCard 
            title="Operational Exposure" 
            value={`${treasury?.exposureScore || 0}%`} 
            change="Low Risk" 
            icon={ShieldAlert} 
            color="emerald" 
          />
        </div>

        {/* Live AI Operations Feed */}
        <div className="glass-dark rounded-3xl p-6 border-white/5 h-[600px] flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Zap size={20} className="text-cyan-glow" />
              Live AI Operations Feed
            </h2>
            <div className="flex items-center gap-2 bg-white/5 p-1 rounded-lg">
              <button className="px-3 py-1 text-xs font-medium bg-white/10 rounded-md">All</button>
              <button className="px-3 py-1 text-xs font-medium text-muted-foreground hover:text-white">Treasury</button>
              <button className="px-3 py-1 text-xs font-medium text-muted-foreground hover:text-white">Payroll</button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            {treasury?.onChainTxs && treasury.onChainTxs.length > 0 ? (
              treasury.onChainTxs.map((tx: any, idx: number) => (
                <OperationItem 
                  key={idx}
                  agent="Execution AI" 
                  action="ON-CHAIN OP" 
                  status={tx.success ? "CONFIRMED" : "FAILED"} 
                  time={tx.timestamp ? new Date(tx.timestamp).toLocaleTimeString() : 'RECENT'} 
                  detail={`Signature: ${tx.signature.slice(0, 8)}...${tx.signature.slice(-8)} | Amount: ${(tx.amount / 1e9).toFixed(4)} SOL`}
                />
              ))
            ) : (
              transactions.map((tx: any, i: number) => {
                const meta = JSON.parse(tx.metadata || '{}');
                return (
                  <OperationItem 
                    key={tx.id}
                    agent={i % 2 === 0 ? "Execution AI" : "Risk AI"} 
                    action={tx.type} 
                    status={tx.status} 
                    time="Recently" 
                    detail={meta.detail || tx.type}
                  />
                );
              })
            )}
            {transactions.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full opacity-30">
                <Activity size={48} className="mb-2" />
                <p className="text-sm">No recent operations detected.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Panel: Intelligence Layer */}
      <div className="col-span-12 lg:col-span-4 space-y-6">
        <div className="glass rounded-3xl p-6 border-white/10 neo-glow-cyan/5">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <TrendingUp size={20} className="text-cyan-glow" />
            AI Intelligence Layer
          </h2>
          
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Exposure Risk Score</span>
                <span className="text-emerald-glow font-mono">98/100 (Safe)</span>
              </div>
              <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-glow w-[98%] neo-glow-emerald" />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Treasury Runway</p>
                <p className="text-xl font-bold font-mono">{treasury?.runway || '0'} Mo</p>
              </div>
              <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Stealth Efficiency</p>
                <p className="text-xl font-bold font-mono">{treasury?.efficiency || '0'}%</p>
              </div>
            </div>

            <div className="bg-cyan-glow/5 border border-cyan-glow/20 p-4 rounded-2xl">
              <h3 className="text-xs font-bold text-cyan-glow uppercase tracking-widest mb-2 flex items-center gap-2">
                <Activity size={14} />
                Strategic Recommendation
              </h3>
              <p className="text-sm text-white/80 leading-relaxed">
                "Recommend fragmenting the upcoming payroll batch into 4 randomized time-windows to minimize transaction clustering patterns."
              </p>
              <button className="mt-4 w-full py-2 bg-cyan-glow/20 hover:bg-cyan-glow/30 text-cyan-glow text-xs font-bold rounded-lg transition-all border border-cyan-glow/30">
                Execute Stealth Optimization
              </button>
            </div>
          </div>
        </div>

        {/* AI Agent Nodes Visualization */}
        <div className="glass-dark rounded-3xl p-6 border-white/5 h-[350px] flex flex-col relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-glow/5 to-purple-glow/5" />
          <h2 className="text-sm font-bold mb-4 relative z-10">Neural Routing Network</h2>
          <div className="flex-1 relative z-10">
            <StealthRouteMap />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, change, icon: Icon, color }: any) {
  const colorMap: any = {
    cyan: "text-cyan-glow bg-cyan-glow/10 border-cyan-glow/20",
    purple: "text-purple-glow bg-purple-glow/10 border-purple-glow/20",
    emerald: "text-emerald-glow bg-emerald-glow/10 border-emerald-glow/20",
  };

  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="glass p-6 rounded-3xl border-white/10 flex flex-col gap-4"
    >
      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", colorMap[color])}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-sm text-muted-foreground font-medium">{title}</p>
        <div className="flex items-end gap-2 mt-1">
          <p className="text-2xl font-bold font-mono">{value}</p>
          <span className={cn("text-[10px] font-bold pb-1", color === 'emerald' ? 'text-emerald-glow' : 'text-cyan-glow')}>
            {change}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

function OperationItem({ agent, action, status, time, detail }: any) {
  return (
    <div className="group bg-white/5 hover:bg-white/10 p-4 rounded-2xl border border-transparent hover:border-white/10 transition-all cursor-pointer">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-cyan-glow/20 flex items-center justify-center">
            <Cpu size={12} className="text-cyan-glow" />
          </div>
          <span className="text-xs font-bold text-white/90">{agent}</span>
          <span className="text-[10px] text-muted-foreground uppercase tracking-widest">• {action}</span>
        </div>
        <span className="text-[10px] font-mono text-muted-foreground">{time}</span>
      </div>
      <p className="text-sm text-white/60 mb-2">{detail}</p>
      <div className="flex items-center gap-2">
        <div className="px-2 py-0.5 rounded bg-emerald-glow/10 text-emerald-glow text-[10px] font-bold">
          {status}
        </div>
        <div className="flex-1 h-[1px] bg-white/5" />
        <ArrowUpRight size={14} className="text-muted-foreground group-hover:text-cyan-glow transition-colors" />
      </div>
    </div>
  );
}
