import * as bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';

export const MASTER_USER_DEFAULTS = {
  username: 'alan',
  name: 'Alan',
  password: 'Alan2908$',
};

export async function ensureMasterUser(prisma: PrismaClient) {
  const count = await prisma.user.count();
  if (count > 0) return false;

  await upsertMasterUser(prisma);
  return true;
}

export async function upsertMasterUser(prisma: PrismaClient) {
  const username = (process.env.MASTER_USER_USERNAME ?? MASTER_USER_DEFAULTS.username).toLowerCase().trim();
  const name = process.env.MASTER_USER_NAME ?? MASTER_USER_DEFAULTS.name;
  const password = process.env.MASTER_USER_PASSWORD ?? MASTER_USER_DEFAULTS.password;

  await prisma.user.upsert({
    where: { username },
    update: { name },
    create: {
      username,
      name,
      password: await bcrypt.hash(password, 10),
    },
  });

  console.log(`Usuario maestro listo: ${username}`);
}
