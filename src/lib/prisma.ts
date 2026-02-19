import { PrismaClient } from '@prisma/client'
import { PrismaLibSQL } from '@prisma/adapter-libsql'



declare global{
    var Prisma: PrismaClient | undefined;
}

const adapter = new PrismaLibSQL({
  url: `${process.env.TURSO_DATABASE_URL}`,
  authToken: `${process.env.TURSO_AUTH_TOKEN}`,
})

const db = globalThis.Prisma || new PrismaClient({ adapter })

if(process.env.NODE_ENV !== 'production'){
    globalThis.Prisma = db;
}

export default db;