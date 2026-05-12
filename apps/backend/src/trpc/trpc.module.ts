import { Module, forwardRef } from '@nestjs/common';
import { TrpcService } from './trpc.service';
import { TrpcRouter } from './trpc.router';
import { AgentService } from '../agents/agent.service';
import { NexusGateway } from './nexus.gateway';

@Module({
  providers: [TrpcService, TrpcRouter, AgentService, NexusGateway],
  exports: [TrpcService, NexusGateway],
})
export class TrpcModule {}
