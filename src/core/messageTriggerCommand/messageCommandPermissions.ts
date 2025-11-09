import { Message } from "discord.js";
import type { TriggerClassPair } from "../../types/command.js";
import { utilGetSentIdInfo } from "../../util/utilGetSentIdInfo.js";

/**
 * messageTrigger系のコマンドが実行できるか否かを判定する。
 * @returns 実行可能かどうかのTFを返却する
 */
export async function messageCommandPermission(message:Message, msgLoadedCommands:TriggerClassPair):Promise<boolean> {

  // prefix部分を抜粋する
  const prefix:string = message.content.replace("　", " ").split(' ')[0]!

  // prefixが存在するか
  if (msgLoadedCommands[prefix]) {
    // Utilを使用して、発言元の全てのID情報を取得する
    const sentIdInfo = await utilGetSentIdInfo(message)
    
    
  }

  // 発言者の情報を取得する
  return true;
}