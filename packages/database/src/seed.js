const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding ShadowLedger Nexus database...');

  // 1. Create Organization
  const org = await prisma.organization.upsert({
    where: { id: 'default-org' },
    update: {},
    create: {
      id: 'default-org',
      name: 'Nexus Operations Group',
      description: 'Strategic invisible financial infrastructure unit.',
    },
  });

  // 2. Create Treasury
  const treasury = await prisma.treasury.upsert({
    where: { address: 'Stealth-Treasury-001' },
    update: {},
    create: {
      address: 'Stealth-Treasury-001',
      balance: 12402901.42,
      currency: 'SOL',
      isPrivate: true,
      exposureScore: 98,
      organizationId: org.id,
    },
  });

  // 3. Create Agents
  const agentTypes = [
    'TREASURY', 'PAYROLL', 'COMPLIANCE', 'RISK', 'STRATEGY', 'EXECUTION', 'MARKET'
  ];

  for (const type of agentTypes) {
    await prisma.agent.create({
      data: {
        name: `${type.charAt(0) + type.slice(1).toLowerCase()} AI`,
        type,
        status: 'IDLE',
        organizationId: org.id,
        lastAction: 'System initialized.',
        lastActionAt: new Date(),
      },
    });
  }

  // 4. Create Payroll
  const payroll = await prisma.payroll.create({
    data: {
      name: 'APAC Engineering Team',
      amount: 145000,
      frequency: 'Monthly',
      nextRun: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      status: 'ACTIVE',
      organizationId: org.id,
    },
  });

  // Individual creates for SQLite compatibility
  await prisma.recipient.create({
    data: { name: 'Lead Dev A', address: '0xStealth...1', payrollId: payroll.id }
  });
  await prisma.recipient.create({
    data: { name: 'Lead Dev B', address: '0xStealth...2', payrollId: payroll.id }
  });

  // 5. Create Transactions
  await prisma.transaction.create({
    data: {
      treasuryId: treasury.id,
      amount: -120.0,
      type: 'OUTBOUND',
      status: 'CONFIRMED',
      metadata: JSON.stringify({ detail: 'Shielded Payroll Settlement' }),
    }
  });
  await prisma.transaction.create({
    data: {
      treasuryId: treasury.id,
      amount: 2400.0,
      type: 'SWAP',
      status: 'CONFIRMED',
      metadata: JSON.stringify({ detail: 'Treasury Rebalancing' }),
    }
  });

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
