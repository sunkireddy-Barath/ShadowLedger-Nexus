'use client';

import React, { useEffect, useState } from 'react';
import { Loader } from 'lucide-react';
import { trpc } from '@/lib/trpc';

interface Agent {
  id: string;
  name: string;
  type: string;
  status: string;
  lastAction?: string;
  lastActionAt?: string;
}

export default function AgentsPage() {
  const [orgId] = useState('demo-org-1'); // Should come from auth context
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getAgents = trpc.getAgents.useQuery(
    { orgId },
    {
      enabled: !!orgId,
      onSuccess: (data) => {
        setAgents(data || []);
        setIsLoading(false);
      },
      onError: (err: any) => {
        setError(err.message || 'Failed to fetch agents');
        setIsLoading(false);
      },
    }
  );

  const agentTypeColors: { [key: string]: string } = {
    TREASURY: 'bg-cyan-glow/20 border-cyan-glow',
    PAYROLL: 'bg-emerald-glow/20 border-emerald-glow',
    COMPLIANCE: 'bg-blue-500/20 border-blue-500',
    RISK: 'bg-red-500/20 border-red-500',
    STRATEGY: 'bg-purple-glow/20 border-purple-glow',
    EXECUTION: 'bg-yellow-500/20 border-yellow-500',
    MARKET: 'bg-green-500/20 border-green-500',
  };

  const getStatusBadge = (status: string) => {
    const statusColors: { [key: string]: string } = {
      ACTIVE: 'bg-emerald-glow/30 text-emerald-glow',
      IDLE: 'bg-gray-500/30 text-gray-300',
      THINKING: 'bg-cyan-glow/30 text-cyan-glow',
      ERROR: 'bg-red-500/30 text-red-500',
    };
    return statusColors[status] || 'bg-gray-500/30 text-gray-300';
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-2">AI Agents</h1>
        <p className="text-muted-foreground">
          Monitor and coordinate autonomous financial agents
        </p>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader className="animate-spin mr-2" />
          <span>Loading agents...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 mb-6">
          <p className="text-red-500">Error: {error}</p>
        </div>
      )}

      {/* Agents Grid */}
      {!isLoading && !error && agents.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.map((agent) => (
            <div
              key={agent.id}
              className={`border rounded-xl p-6 glass neo-glow-cyan ${
                agentTypeColors[agent.type] || 'bg-gray-500/10 border-gray-500/50'
              }`}
            >
              {/* Agent Type Badge */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold">{agent.type}</h3>
                  <p className="text-sm text-muted-foreground">{agent.name}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusBadge(agent.status)}`}>
                  {agent.status}
                </span>
              </div>

              {/* Agent Details */}
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Last Action</p>
                  <p className="font-mono text-cyan-glow truncate">
                    {agent.lastAction || 'No recent actions'}
                  </p>
                </div>

                {agent.lastActionAt && (
                  <div>
                    <p className="text-muted-foreground">Last Activity</p>
                    <p className="text-sm">
                      {new Date(agent.lastActionAt).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>

              {/* Agent Controls */}
              <button className="mt-4 w-full px-4 py-2 bg-cyan-glow/20 hover:bg-cyan-glow/30 text-cyan-glow rounded-lg transition-all">
                View Details
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && agents.length === 0 && (
        <div className="text-center py-20">
          <p className="text-muted-foreground text-lg">No agents found</p>
          <p className="text-sm text-muted-foreground mt-2">
            Initialize agents from the Command Center
          </p>
        </div>
      )}

      {/* Agent Statistics */}
      {!isLoading && agents.length > 0 && (
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-cyan-glow/10 border border-cyan-glow/30 rounded-lg p-4">
            <p className="text-muted-foreground text-sm">Total Agents</p>
            <p className="text-3xl font-bold text-cyan-glow">{agents.length}</p>
          </div>
          <div className="bg-emerald-glow/10 border border-emerald-glow/30 rounded-lg p-4">
            <p className="text-muted-foreground text-sm">Active</p>
            <p className="text-3xl font-bold text-emerald-glow">
              {agents.filter((a) => a.status === 'ACTIVE').length}
            </p>
          </div>
          <div className="bg-purple-glow/10 border border-purple-glow/30 rounded-lg p-4">
            <p className="text-muted-foreground text-sm">Thinking</p>
            <p className="text-3xl font-bold text-purple-glow">
              {agents.filter((a) => a.status === 'THINKING').length}
            </p>
          </div>
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
            <p className="text-muted-foreground text-sm">Errors</p>
            <p className="text-3xl font-bold text-red-500">
              {agents.filter((a) => a.status === 'ERROR').length}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
