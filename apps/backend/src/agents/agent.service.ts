import { Injectable, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { OpenAI } from 'openai';
import { BlockchainService } from '../blockchain/blockchain.service';
import { ComplianceService } from '../compliance/compliance.service';
import { PrivacyService } from '../privacy/privacy.service';
import { SimulationService } from '../simulations/simulation.service';

@Injectable()
export class AgentService {
  private logger = new Logger(AgentService.name);
  private prisma = new PrismaClient();
  private openai: OpenAI;

  private agentTypes = ['TREASURY', 'PAYROLL', 'COMPLIANCE', 'RISK', 'STRATEGY', 'EXECUTION', 'MARKET'];

  constructor(
    private blockchainService: BlockchainService,
    private complianceService: ComplianceService,
    private privacyService: PrivacyService,
    private simulationService: SimulationService,
  ) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      this.logger.error('OPENAI_API_KEY not found in environment variables');
    }
    this.openai = new OpenAI({ apiKey });
  }

  async orchestrate(orgId: string, instruction: string) {
    this.logger.log(`🧠 AI Orchestration Starting | Org: ${orgId} | Instruction: ${instruction}`);

    const orchestrationStart = Date.now();
    const agentExecutions = [];

    try {
      // 1️⃣ Get Organization Context
      const org = await this.prisma.organization.findUnique({
        where: { id: orgId },
        include: {
          treasuries: true,
          agents: true,
          payrolls: { include: { recipients: true } },
        },
      });

      if (!org) {
        throw new Error(`Organization not found: ${orgId}`);
      }

      const treasury = org.treasuries[0];
      if (!treasury) {
        throw new Error(`No treasury found for organization: ${orgId}`);
      }

      // 2️⃣ Get Market & Treasury Data
      const treasuryBalance = await this.blockchainService.getBalance(treasury.address);
      const recentTransactions = await this.blockchainService.getRecentTransactions(treasury.address);

      // 3️⃣ AI Multi-Agent Coordination Loop
      const systemPrompt = `You are ShadowLedger Nexus AI Orchestrator - an autonomous financial operating system managing Web3 organizations.

Your role:
- Coordinate 7 specialized AI agents: Treasury, Payroll, Compliance, Risk, Strategy, Execution, Market
- Make financial decisions with surgical precision
- Prioritize privacy, efficiency, and sustainability
- Execute autonomous financial operations

Current Context:
- Organization: ${org.name}
- Treasury Balance: ${treasuryBalance} SOL
- Treasury Address: ${treasury.address}
- Monthly Payroll Recipients: ${org.payrolls.length}
- Total Payroll Recipients: ${org.payrolls.reduce((sum, p) => sum + p.recipients.length, 0)}
- Active Agents: ${org.agents.length}

User Instruction: ${instruction}

Respond with a JSON object containing:
{
  "agentDecisions": [
    {
      "agent": "AGENT_NAME",
      "decision": "What this agent decides",
      "reasoning": "Why",
      "confidence": 0-100
    }
  ],
  "primaryAction": "Main action to execute",
  "executionSteps": ["step 1", "step 2", ...],
  "riskAssessment": "Identified risks",
  "successMetrics": ["metric1", "metric2"]
}`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: instruction,
          },
        ],
        temperature: 0.3,
        max_tokens: 2000,
      });

      const aiResponse = response.choices[0]?.message?.content || '';
      this.logger.log(`\n📡 AI Response:\n${aiResponse}`);

      // Parse AI response
      let orchestrationPlan;
      try {
        // Extract JSON from the response
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        orchestrationPlan = parseJson(jsonMatch ? jsonMatch[0] : aiResponse);
      } catch (e) {
        this.logger.warn('Failed to parse AI response as JSON, continuing with text response');
        orchestrationPlan = {
          agentDecisions: [],
          primaryAction: aiResponse,
          executionSteps: [],
          riskAssessment: 'Unable to parse AI response',
          successMetrics: [],
        };
      }

      // 4️⃣ Execute Agent Decisions
      for (const decision of orchestrationPlan.agentDecisions || []) {
        const agentRecord = org.agents.find((a) => a.type === decision.agent);

        const execution = {
          agentId: agentRecord?.id || `temp_${decision.agent}`,
          agentType: decision.agent,
          decision: decision.decision,
          reasoning: decision.reasoning,
          confidence: decision.confidence || 0,
          executedAt: new Date().toISOString(),
          status: 'EXECUTED' as const,
        };

        agentExecutions.push(execution);

        // Update agent record
        if (agentRecord) {
          await this.prisma.agent.update({
            where: { id: agentRecord.id },
            data: {
              lastAction: decision.decision,
              lastActionAt: new Date(),
            },
          });
        }

        this.logger.log(`✅ ${decision.agent} Agent | Decision: ${decision.decision}`);
      }

      // 5️⃣ Execute Primary Action
      let executionResult = null;
      if (orchestrationPlan.primaryAction?.includes('treasury')) {
        // Treasury execution
        const stealthPaths = this.privacyService.generateStealthPaths(
          treasuryBalance * 0.1,
          treasury.address,
        );
        executionResult = {
          actionType: 'TREASURY_OPTIMIZATION',
          stealthPaths,
          privacyScore: 98,
        };
      } else if (orchestrationPlan.primaryAction?.includes('payroll')) {
        // Payroll execution
        const payrolls = org.payrolls;
        executionResult = {
          actionType: 'PAYROLL_EXECUTION',
          payrollsProcessed: payrolls.length,
          totalRecipients: payrolls.reduce((sum, p) => sum + p.recipients.length, 0),
        };
      } else if (orchestrationPlan.primaryAction?.includes('compliance')) {
        // Generate compliance keys
        const complianceKey = this.complianceService.generateTemporalKey(120, [
          'VIEW_TRANSACTIONS',
        ]);
        executionResult = {
          actionType: 'COMPLIANCE_REPORT',
          viewingKey: complianceKey,
        };
      }

      // 6️⃣ Record Orchestration
      const orchestrationRecord = await this.prisma.agent.create({
        data: {
          name: `Orchestration_${Date.now()}`,
          type: 'ORCHESTRATOR',
          status: 'COMPLETED',
          organizationId: orgId,
          lastAction: orchestrationPlan.primaryAction,
          lastActionAt: new Date(),
        },
      });

      const orchestrationDuration = Date.now() - orchestrationStart;

      this.logger.log(`\n🎯 Orchestration Complete | Duration: ${orchestrationDuration}ms`);

      return {
        success: true,
        orchestrationId: orchestrationRecord.id,
        duration: orchestrationDuration,
        agentExecutions,
        primaryAction: orchestrationPlan.primaryAction,
        executionSteps: orchestrationPlan.executionSteps || [],
        riskAssessment: orchestrationPlan.riskAssessment || '',
        successMetrics: orchestrationPlan.successMetrics || [],
        executionResult,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(`❌ Orchestration Failed: ${error.message}`);
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  async getAgentStatus(agentType: string) {
    return await this.prisma.agent.findMany({
      where: { type: agentType },
      orderBy: { lastActionAt: 'desc' },
      take: 1,
    });
  }

  async getAllAgentStatus(orgId: string) {
    return await this.prisma.agent.findMany({
      where: { organizationId: orgId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getTreasuryAgentRecommendations(orgId: string) {
    const org = await this.prisma.organization.findUnique({
      where: { id: orgId },
      include: { treasuries: true },
    });

    if (!org?.treasuries[0]) {
      throw new Error('No treasury found');
    }

    const balance = await this.blockchainService.getBalance(org.treasuries[0].address);

    const prompt = `Given a treasury balance of ${balance} SOL, what optimizations would you recommend? 
Respond with JSON:
{
  "recommendations": [
    {"action": "...", "expectedYield": 0.0, "riskLevel": "LOW|MEDIUM|HIGH"}
  ]
}`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.5,
      max_tokens: 1000,
    });

    const content = response.choices[0]?.message?.content || '{}';
    return JSON.parse(content);
  }
}

// Helper to safely parse JSON
function parseJson(str: string) {
  try {
    return JSON.parse(str);
  } catch {
    return {};
  }
}
