import { Injectable, OnModuleInit } from '@nestjs/common';
import { TrpcService } from './trpc.service';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { AgentService } from '../agents/agent.service';

@Injectable()
export class TrpcRouter implements OnModuleInit {
  private prisma: PrismaClient;
  constructor(
    private readonly trpc: TrpcService,
    private readonly agentService: AgentService,
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
        const agents = await this.prisma.agent.findMany({
          where: { organizationId: input.orgId }
        });
        return { treasury, agents };
      }),
  });
}

export type AppRouter = TrpcRouter['appRouter'];
