// ここで生成したprismaClientを必ず使いまわすこと！！！！
import { PrismaClient } from "@prisma/client";

export const prismaInstance:PrismaClient = new PrismaClient({
  log:['error', 'warn'] // 警告をログに吐いておくようにする。
})