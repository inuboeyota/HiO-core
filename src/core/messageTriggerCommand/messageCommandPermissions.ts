import { Message } from "discord.js";
import type { TriggerClassPair } from "../../types/messageTriggerCommandType.js";
import { utilGetSentIdInfo } from "../../util/utilGetSentIdInfo.js";
import type { SentIdInfo } from "../../types/util.js";
import { prismaInstance } from "../prisma/prismaClient.js";

/**
 * messageTrigger系のコマンドが実行できるか否かを判定する。
 * @returns 実行可能かどうかのTFを返却する
 */
export async function messageCommandPermission(message:Message, msgLoadedCommands:TriggerClassPair):Promise<boolean> {

  // prefix部分を抜粋する
  const prefix:string = message.content.replace("　", " ").split(' ')[0]!

  // prefixが存在するか
  if (msgLoadedCommands[prefix]) {

    // 存在する場合、コマンド名を取得
    const commandName:string = msgLoadedCommands[prefix]

    // Utilを使用して、発言元の全てのID情報を取得する
    const sentIdInfo:SentIdInfo = await utilGetSentIdInfo(message)
    
    //==prismaの実行========================================================//

    //------------------------------------------
    // 1:prefixで検索して、制限がなければ実行
    //------------------------------------------
    const isExistPrefix = await prismaInstance.msgCommandPermission.findMany({
      where:{
        CommandClassName: commandName
      }
    })
    // 制限がなければ実行
    if (isExistPrefix.length === 0){
      return true;
    }

    //--------------------------------
    // 2:ChannelRestrictionが存在するか
    //--------------------------------
    const isExistChannelRestriction = await prismaInstance.msgCommandPermission.findMany({
      where: {
        CommandClassName: commandName,
        ChannelDiscId: {not:null}
      }
    })

    if (isExistChannelRestriction.length === 0) {
      //---------------------------------------------------------------------------
      // 2-A:ChannelRestrictionが存在しない場合、UserかRoleが一致すれば実行可能
      //---------------------------------------------------------------------------
      const isAllowedCommand = await prismaInstance.msgCommandPermission.findMany({
        where: {
          CommandClassName: commandName,
          OR:[
            {RoleDiscId: {in:sentIdInfo.roleId}},
            {UserDiscId: {in:sentIdInfo.userId}}
          ]
        }
      })

      if (isAllowedCommand.length === 0) {
        // Restrictionの許可が存在しない場合
        message.reply("実行権限が存在しません。")
        return false;
      } else {
        // 1件以上許可が存在する場合
        return true;
      }

    }
    else {
      //-----------------------------------------------------------------------------------
      // 2-B:ChannelRestrictionが存在する場合、UserかRoleが一致/もしくは両方NULLなら実行可能
      //-----------------------------------------------------------------------------------
      // そもそもこのチャンネルで実行権限が許可されているか
      const isExistAllowedChannel =  await prismaInstance.msgCommandPermission.findMany({
        where: {
          CommandClassName: commandName,
          ChannelDiscId: {in:sentIdInfo.channelId}
        }
      })

      if (isExistAllowedChannel.length === 0) {
        message.reply("このチャンネルではそのコマンドは実行できません")
        return false;
      }

      // RoleもUser両方NULLの場合（=そのチャンネルであればだれでも実行可能）
      const isAllowedThisChannel =  await prismaInstance.msgCommandPermission.findMany({
        where: {
          CommandClassName: commandName,
          ChannelDiscId: {in:sentIdInfo.channelId},
          UserDiscId: null,
          RoleDiscId: null
        }
      })
      // 両方ともNULLなのが1件以上存在すれば実行可能
      if (isAllowedThisChannel.length > 0) {
        return true;
      }

      // ChannelRestrictionが存在する場合であり、UserかRoleのIDが一致すれば実行可能
      const isAllowedThisChannelAndMember = await prismaInstance.msgCommandPermission.findMany({
        where:{
          CommandClassName: commandName,
          ChannelDiscId: {in:sentIdInfo.channelId},
          OR: [
            {UserDiscId:{in:sentIdInfo.userId}},
            {RoleDiscId:{in:sentIdInfo.roleId}}
          ]
        }
      })
      // 存在すれば実行可能
      if (isAllowedThisChannelAndMember.length > 0) {
        return true;
      } else {
        message.reply("このチャンネルでは、あなたに実行権限がありません。");
        return false;
      }
    }

    

    //=====================================================================//

  } else {
    // prefixとして有効でない場合
    return false;
  }
}