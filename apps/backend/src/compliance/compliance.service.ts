import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ComplianceService {
  private activeKeys: Map<string, { expiresAt: Date, scope: string }> = new Map();

  generateViewingKey(durationHours: number, scope: string = 'TOTALS_ONLY') {
    const key = `nexus_view_${uuidv4()}`;
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + durationHours);

    this.activeKeys.set(key, { expiresAt, scope });

    return {
      key,
      expiresAt,
      shareLink: `https://nexus.ledger/audit/${key}`,
    };
  }

  validateKey(key: string) {
    const data = this.activeKeys.get(key);
    if (!data) return false;
    
    if (new Date() > data.expiresAt) {
      this.activeKeys.delete(key);
      return false;
    }

    return true;
  }
}
