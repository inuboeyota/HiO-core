import { ChatInputCommandInteraction, Message } from "discord.js";
import type { MessageCommand } from "../../types/messageTriggerCommandType.js";


/**
 * ピンを送る
 */
export default class ping implements MessageCommand {

  name:string = 'ping'
  prefix:string = '!ping'
  
  aliasPrefix:string = '！ピン'

  execute = pingCmd
}

async function pingCmd(ctx:Message):Promise<void> {
  ctx.reply("pong!");
}