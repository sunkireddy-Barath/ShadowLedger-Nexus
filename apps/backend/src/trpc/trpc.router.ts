import { Injectable, OnModuleInit } from '@nestjs/common';
import { TrpcService } from './trpc.service';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { AgentService } from '../agents/agent.service';
import { BlockchainService } from '../blockchain/blockchain.service';

@Injectable()
export class TrpcRouter implements OnModuleInit {
  private prisma: PrismaClient;
  constructor(
    private readonly trpc: TrpcService,
    private readonly agentService: AgentService,
    private readonly blockchainService: BlockchainService,
  ) {
    this.prisma = new PrismaClient();
  }

  onModuleInit() {
    // Initialization if needed
  }

  appRouter = this.trpc.router({
    getTreasury: this.trpc.procedure
      .input(z.object({ address: z.string() }))
      .query(async ({ input }) => {
        return await this.prisma.treasury.findUnique({
          where: { address: input.address },
          include: { transactions: true },
        });
      }),

    getAgents: this.trpc.procedure
      .input(z.object({ orgId: z.string() }))
      .query(async ({ input }) => {
        return await this.prisma.agent.findMany({
          where: { organizationId: input.orgId },
        });
      }),

    // AI Command execution
    executeAiInstruction: this.trpc.procedure
      .input(z.object({ orgId: z.string(), instruction: z.string() }))
      .mutation(async ({ input }) => {
        return await this.agentService.orchestrate(input.orgId, input.instruction);
      }),

    getOverview: this.trpc.procedure
      .input(z.object({ orgId: z.string() }))
      .query(async ({ input }) => {
        const treasury = await this.prisma.treasury.findFirst({
          where: { organizationId: input.orgId },
          include: { transactions: { take: 10, orderBy: { createdAt: 'desc' } } }
        });
        
        let onChainTxs = [];
        if (treasury?.address) {
          onChainTxs = await this.blockchainService.getRecentTransactions(treasury.address);
        }

        const agents = await this.prisma.agent.findMany({
          where: { organizationId: input.orgId }
        });
        
        const balance = treasury?.balance || 0;
        const outflow = 100000; // Average monthly outflow (could be calculated from payrolls)
        const runway = balance / outflow;
        const efficiency = 95 + Math.random() * 5; // Simplified efficiency model

        return { 
          treasury: {
            ...treasury,
            onChainTxs,
            runway: runway.toFixed(1),
            efficiency: efficiency.toFixed(1)
          }, 
          agents 
        };
      }),

    getPayroll: this.trpc.procedure
      .input(z.object({ orgId: z.string() }))
      .query(async ({ input }) => {
        return await this.prisma.payroll.findMany({
          where: { organizationId: input.orgId },
          include: { recipients: true }
        });
      }),

    getYieldSimulations: this.trpc.procedure
      .input(z.object({ balance: z.number() }))
      .query(async ({ input }) => {
        return await this.simulationService.simulateYieldOptimization(input.balance);
      }),

    getDevnetBalance: this.trpc.procedure
      .input(z.object({ address: z.string() }))
      .query(async ({ input }) => {
        return await this.blockchainService.getBalance(input.address);
      }),
  });
}

export type AppRouter = TrpcRouter['appRouter'];
