"use client";

import React from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { motion } from 'framer-motion';
import { 
  Lock, 
  ArrowUpRight, 
  ArrowDownLeft, 
  RefreshCcw, 
  Eye, 
  ShieldCheck,
  MoreVertical,
  Key
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { trpc } from '@/lib/trpc';

export default function TreasuryPage() {
  const { data, isLoading } = trpc.getOverview.useQuery({ orgId: 'default-org' });
  
  const treasury = data?.treasury;
  const transactions = treasury?.transactions || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="w-12 h-12 border-4 border-cyan-glow border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-glow">Invisible Treasury</h1>
            <p className="text-muted-foreground mt-1">Manage shielded assets and private settlements.</p>
          </div>
          <div className="flex gap-4">
            <button className="px-6 py-2 glass rounded-xl text-white text-sm font-bold border-white/10 hover:bg-white/5 transition-all flex items-center gap-2">
              <Key size={16} />
              Manage Viewing Keys
            </button>
            <button className="px-6 py-2 bg-cyan-glow text-black rounded-xl text-sm font-bold neo-glow-cyan hover:scale-105 transition-all">
              Shield Assets
            </button>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Main Balance Card */}
          <div className="col-span-12 lg:col-span-4 glass p-8 rounded-3xl border-white/10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <ShieldCheck size={120} />
            </div>
            
            <p className="text-sm text-muted-foreground uppercase tracking-widest font-bold mb-2">Total Shielded Value</p>
            <h2 className="text-4xl font-bold font-mono mb-8">
              {treasury ? `$${treasury.balance.toLocaleString()}` : "$0"}
            </h2>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">{treasury?.currency || 'SOL'} Balance</span>
                <span className="font-mono">{treasury ? (treasury.balance / 200).toFixed(2) : "0"} {treasury?.currency}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">USDC (Shielded)</span>
                <span className="font-mono">$8,102,400.00</span>
              </div>
              <div className="w-full h-px bg-white/5 my-4" />
              <div className="flex justify-between items-center text-xs">
                <span className="text-cyan-glow font-bold">Privacy Health</span>
                <span className="text-emerald-glow font-bold">{treasury?.exposureScore || 0}% (EXCELLENT)</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="col-span-12 lg:col-span-8 grid grid-cols-3 gap-6">
            <ActionCard icon={ArrowUpRight} label="Private Transfer" desc="Send assets invisibly via Cloak SDK." />
            <ActionCard icon={RefreshCcw} label="Stealth Swap" desc="Swap assets privately using Orca liquidity." />
            <ActionCard icon={Eye} label="Audit Access" desc="Generate temporary viewing keys." />
          </div>

          {/* Recent Activity */}
          <div className="col-span-12 glass-dark rounded-3xl border-white/5 overflow-hidden">
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <h3 className="font-bold">Recent Shielded Operations</h3>
              <button className="text-xs text-cyan-glow font-bold hover:underline">View All</button>
            </div>
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] uppercase tracking-widest text-muted-foreground border-b border-white/5">
                  <th className="px-6 py-4 font-bold">Operation</th>
                  <th className="px-6 py-4 font-bold">Asset</th>
                  <th className="px-6 py-4 font-bold">Amount</th>
                  <th className="px-6 py-4 font-bold">Status</th>
                  <th className="px-6 py-4 font-bold">Time</th>
                  <th className="px-6 py-4 font-bold"></th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {treasury?.onChainTxs && treasury.onChainTxs.length > 0 ? (
                  treasury.onChainTxs.map((tx: any, idx: number) => (
                    <TransactionRow 
                      key={idx}
                      type="ON-CHAIN" 
                      asset={treasury?.currency || 'SOL'} 
                      amount={(tx.amount / 1e9).toFixed(4)} 
                      status={tx.success ? "CONFIRMED" : "FAILED"} 
                      time={tx.timestamp ? new Date(tx.timestamp).toLocaleTimeString() : 'RECENT'} 
                      detail={`Sig: ${tx.signature.slice(0, 8)}...`}
                    />
                  ))
                ) : (
                  transactions.map((tx: any) => {
                    const meta = JSON.parse(tx.metadata || '{}');
                    return (
                      <TransactionRow 
                        key={tx.id}
                        type={tx.type} 
                        asset={treasury?.currency || 'SOL'} 
                        amount={tx.amount > 0 ? `+${tx.amount}` : tx.amount.toString()} 
                        status={tx.status} 
                        time="Recently" 
                        detail={meta.detail || tx.type}
                      />
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function ActionCard({ icon: Icon, label, desc }: any) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="glass p-6 rounded-3xl border-white/10 hover:border-cyan-glow/30 transition-all cursor-pointer group"
    >
      <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-4 group-hover:bg-cyan-glow/10 transition-colors">
        <Icon size={24} className="text-white group-hover:text-cyan-glow transition-colors" />
      </div>
      <h3 className="font-bold mb-2">{label}</h3>
      <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
    </motion.div>
  );
}

function TransactionRow({ type, asset, amount, status, time, detail }: any) {
  return (
    <tr className="border-b border-white/5 hover:bg-white/5 transition-colors group">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center",
            type === 'INBOUND' ? 'bg-emerald-glow/10 text-emerald-glow' : 
            type === 'OUTBOUND' ? 'bg-red-500/10 text-red-500' : 'bg-purple-glow/10 text-purple-glow'
          )}>
            {type === 'INBOUND' ? <ArrowDownLeft size={16} /> : 
             type === 'OUTBOUND' ? <ArrowUpRight size={16} /> : <RefreshCcw size={16} />}
          </div>
          <div>
            <p className="font-bold text-xs">{type}</p>
            <p className="text-[10px] text-muted-foreground">{detail}</p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 font-mono text-xs">{asset}</td>
      <td className={cn(
        "px-6 py-4 font-mono text-xs font-bold",
        amount.startsWith('+') ? 'text-emerald-glow' : amount.startsWith('-') ? 'text-red-400' : 'text-white'
      )}>
        {amount}
      </td>
      <td className="px-6 py-4">
        <div className={cn(
          "px-2 py-0.5 rounded text-[10px] font-bold inline-block",
          status === 'CONFIRMED' ? 'bg-emerald-glow/10 text-emerald-glow' : 'bg-yellow-500/10 text-yellow-500'
        )}>
          {status}
        </div>
      </td>
      <td className="px-6 py-4 text-xs text-muted-foreground">{time}</td>
      <td className="px-6 py-4 text-right">
        <button className="text-muted-foreground hover:text-white transition-colors">
          <MoreVertical size={16} />
        </button>
      </td>
    </tr>
  );
}
