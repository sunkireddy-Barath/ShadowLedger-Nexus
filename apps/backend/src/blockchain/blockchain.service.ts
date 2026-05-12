import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Connection, PublicKey, clusterApiUrl, LAMPORTS_PER_SOL } from '@solana/web3.js';

@Injectable()
export class BlockchainService implements OnModuleInit {
  private connection: Connection;
  private readonly logger = new Logger(BlockchainService.name);

  onModuleInit() {
    // Connect to Solana Devnet
    this.connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
    this.logger.log('Connected to Solana Devnet');
  }

  async getBalance(address: string): Promise<number> {
    try {
      const pubkey = new PublicKey(address);
      const balance = await this.connection.getBalance(pubkey);
      return balance / LAMPORTS_PER_SOL;
    } catch (error) {
      this.logger.error(`Error fetching balance for ${address}: ${error.message}`);
      return 0;
    }
  }

  async getRecentTransactions(address: string) {
    try {
      const pubkey = new PublicKey(address);
      const signatures = await this.connection.getSignaturesForAddress(pubkey, { limit: 10 });
      
      const txs = await Promise.all(
        signatures.map(async (s) => {
          const tx = await this.connection.getParsedTransaction(s.signature, { 
            maxSupportedTransactionVersion: 0 
          });
          return {
            signature: s.signature,
            timestamp: s.blockTime ? new Date(s.blockTime * 1000).toISOString() : null,
            success: !tx?.meta?.err,
            amount: (tx?.meta?.postBalances[0] || 0) - (tx?.meta?.preBalances[0] || 0),
            detail: 'On-chain Op'
          };
        })
      );
      return txs;
    } catch (error) {
      this.logger.error(`Error fetching transactions for ${address}: ${error.message}`);
      return [];
    }
  }

  getConnection(): Connection {
    return this.connection;
  }
}
