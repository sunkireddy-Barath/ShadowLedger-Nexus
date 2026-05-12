import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class SimulationService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async runRunwaySimulation(orgId: string) {
    const treasury = await this.prisma.treasury.findFirst({
      where: { organizationId: orgId },
    });
    
    if (!treasury) return { error: 'No treasury found' };

    // Simple simulation logic for demonstration
    const currentBalance = treasury.balance;
    const monthlyBurn = 50000; // Mock burn rate
    const runway = currentBalance / monthlyBurn;

    return {
      runwayMonths: runway.toFixed(2),
      confidence: 0.95,
      recommendation: runway < 6 ? 'Redistribute assets to low-risk stablecoins.' : 'Treasury health is optimal.',
    };
  }

  async runDepegSimulation(orgId: string, stablecoin: string) {
    // Simulate a 20% depeg
    return {
      impact: 'HIGH',
      estimatedLoss: '$1,240,000',
      vulnerabilityScore: 84,
      mitigationPlan: `Execute shielded swap from ${stablecoin} to native SOL.`,
    };
  }
}
