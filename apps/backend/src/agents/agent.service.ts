import { Injectable, Logger } from '@nestjs/common';
import { OpenAI } from 'openai';
import { PrismaClient } from '@prisma/client';
import { SafetyService } from '../safety/safety.service';
import { NexusGateway } from '../trpc/nexus.gateway';

@Injectable()
export class AgentService {
  private openai: OpenAI;
  private prisma: PrismaClient;
  private readonly logger = new Logger(AgentService.name);

  constructor(
    private readonly safetyService: SafetyService,
    private readonly nexusGateway: NexusGateway,
  ) {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    this.prisma = new PrismaClient();
  }

  async orchestrate(orgId: string, instruction: string) {
    // 1. Analyze instruction to see which agents need to collaborate
    const plan = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { 
          role: 'system', 
          content: 'You are the Nexus Orchestrator. Decide which specialized agents (TREASURY, PAYROLL, COMPLIANCE, RISK, STRATEGY, EXECUTION, MARKET) are needed for the user request. Output JSON with "agents" and "plan".' 
        },
        { role: 'user', content: instruction }
      ],
      response_format: { type: 'json_object' }
    });

    const { agents, plan: planDesc } = JSON.parse(plan.choices[0].message.content || '{}');

    // 2. Mock execution of agent tasks with safety checks
    const results = [];
    for (const agent of agents) {
      const safetyResult = await this.safetyService.validateAction(agent, planDesc, {});
      
      const status = safetyResult.allowed ? 'SUCCESS' : 'BLOCKED';
      const detail = safetyResult.allowed 
        ? `Executing ${agent} sub-task for: ${planDesc}`
        : `Policy violation: ${safetyResult.reason}`;

      const log = {
        agent,
        action: detail,
        status,
        timestamp: new Date().toISOString()
      };

      this.nexusGateway.broadcastAgentLog(orgId, log);
      results.push(log);

      // Persist to DB
      await this.prisma.agent.updateMany({
        where: { organizationId: orgId, type: agent },
        data: {
          lastAction: detail,
          lastActionAt: new Date(),
          status: 'ACTIVE'
        }
      });
    }

    return {
      instruction,
      orchestrationPlan: planDesc,
      agentActions: results
    };
  }

  async processTask(agentType: string, task: string) {
    const prompt = this.getPromptForAgent(agentType);
    
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'system', content: prompt }, { role: 'user', content: task }],
      response_format: { type: 'json_object' },
    });

    return JSON.parse(response.choices[0].message.content || '{}');
  }

  private getPromptForAgent(type: string): string {
    const base = "You are an autonomous AI agent for ShadowLedger Nexus, a private financial OS on Solana.";
    
    switch (type) {
      case 'TREASURY':
        return `${base} Your role is TREASURY AI. Focus on liquidity, allocation, and private swaps.`;
      case 'PAYROLL':
        return `${base} Your role is PAYROLL AI. Focus on global salary disbursement and stealth routing.`;
      case 'COMPLIANCE':
        return `${base} Your role is COMPLIANCE AI. Focus on temporal viewing keys and selective disclosure.`;
      case 'RISK':
        return `${base} Your role is RISK AI. Focus on exposure scoring and treasury sustainability.`;
      case 'STRATEGY':
        return `${base} Your role is STRATEGY AI. Focus on long-term treasury growth and diversification.`;
      case 'EXECUTION':
        return `${base} Your role is EXECUTION AI. Focus on interaction with Cloak SDK and Solana on-chain actions.`;
      case 'MARKET':
        return `${base} Your role is MARKET AI. Focus on stablecoin risks and cross-chain liquidity analysis.`;
      default:
        return base;
    }
  }
}
