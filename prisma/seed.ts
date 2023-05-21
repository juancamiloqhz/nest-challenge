import { PostStatus, PrismaClient } from '@prisma/client'
import * as argon from 'argon2';

const prisma = new PrismaClient()

export async function main() {

  const hash = await argon.hash("password");

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      password: hash,
      posts: {
        create: {
          title: 'First Admin Post',
          content: 'This is the first post created by the admin user',
          slug: 'first-admin-post',
          status: PostStatus.PUBLISHED,
          publishedAt: new Date(),
        },
      },
    },
  })
  const regularUserOne = await prisma.user.upsert({
    where: { email: 'juancamiloqhz@gmail.com' },
    update: {},
    create: {
      email: 'juancamiloqhz@gmail.com',
      firstName: 'Juan',
      lastName: 'Quintero',
      role: 'USER',
      password: hash,
      posts: {
        create: [
          {
            title: 'First Post by Juan',
            content: 'This is the first post created by Juan',
            slug: 'first-post-by-juan',
            status: PostStatus.PUBLISHED,
            publishedAt: new Date(),
          },
          {
            title: 'Second Post by Juan',
            content: 'This is the second post created by Juan',
            slug: 'second-post-by-juan',
            status: PostStatus.PUBLISHED,
            publishedAt: new Date(),
          },
        ],
      },
    },
  })
  const regularUserTwo = await prisma.user.upsert({
    where: { email: 'bob@example.com' },
    update: {},
    create: {
      email: 'bob@example.com',
      firstName: 'Bob',
      lastName: 'Smith',
      role: 'USER',
      password: hash,
      posts: {
        create: [
          {
            title: 'First Post by Bob',
            content: 'This is the first post created by Bob',
            slug: 'first-post-by-bob',
            status: PostStatus.PUBLISHED,
            publishedAt: new Date(),
          },
          {
            title: 'Second Post by Bob',
            content: 'This is the second post created by Bob',
            slug: 'second-post-by-bob',
            status: PostStatus.PUBLISHED,
            publishedAt: new Date(),
          },

        ],
      },
    },
  })
  // console.log({ adminUser, regularUserOne, regularUserTwo })
  console.log("🌱 Database seeded. ✅")
}
main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })