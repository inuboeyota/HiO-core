import type { Message } from "discord.js";
import type { MessageCommand } from "../../types/command.js";
import { PrismaClient } from "@prisma/client";

/**
 * Prismaのテスト用
 */
export default class prismaTest implements MessageCommand {

  name:string = 'prismaTest'
  prefix:string = '!prismaTest'

  aliasPrefix:string = '！プリズマ'

  execute = prismaTestCmd
}

async function prismaTestCmd(ctx: Message):Promise<void> {

  const prismaInstance = new PrismaClient()

  const test = await prismaInstance.poc_table.findUnique({where: { id: 1}})

  if (test) {
    ctx.reply(test!.poc_name)
  }
  else {
    ctx.reply("結果が見つかりませんでした。")
  }
}