import { Message } from "discord.js";
import type { TriggerClassPair } from "../../types/command.js";
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
    // Utilを使用して、発言元の全てのID情報を取得する
    const sentIdInfo:SentIdInfo = await utilGetSentIdInfo(message)
    
    //==prismaの実行========================================================//

    // 1:prefixで検索して、制限がなければ実行
    const isExistPrefix = await prismaInstance.msgCommandPermission.findMany({
      where:{
        CommandClassName: prefix
      }
    })
    // 制限がなければ実行
    if (isExistPrefix.length === 0){
      return true;
    }


    // 2:チャンネルでrestrictが入っている場合、prefix名と発言元のchannel名で検索をかけて取得する
    // 「チャンネルのリストリクトが存在しない」か「存在する場合にチャンネルIDが一致している」かの判定
    // 2-1:ChannelRestrictionが存在しない場合、そのまま処理を通過できる。
    const isAllowedChannel = await prismaInstance.msgCommandPermission.findMany({
      where: {
        AND:[
          {CommandClassName: prefix},
          {ChannelDiscId:null}
        ]
      }
    })
    // Channelのリストリクトが存在しない行に該当する場合
    if (isAllowedChannel.length > 0) {
      // 2-2:ChannelRestrictionが存在する場合、発言したChannelが一致しているかどうかを判定
      const isExistChannelRestriction = await prismaInstance.msgCommandPermission.findMany({
        where: {
          AND:[
            {CommandClassName: prefix},
            {ChannelDiscId:{not:null, in: sentIdInfo.channelId}}
          ]
        }
      })
      // Channelのリストリクトが存在し、発言者が当該チャンネルにいない場合は実行不可
      if (isExistChannelRestriction.length === 0) {
        message.reply("そのコマンドは実行権限がありません；；")
        return false;
      }
    }


    // 3:prefixが存在し、かつChannelのリストリクトにひっかからない場合、prefixの行に送信者のRoleIDかUserIDが含まれているかを判断し、あれば実行（restrictが許可されているとみなす）
    const isAllowed = await prismaInstance.msgCommandPermission.findMany({
      where: {
        AND: [
          {CommandClassName: prefix},
          {OR:[
            {AND: [
              {ChannelDiscId:{in:sentIdInfo.channelId}},
              {OR:[
                  {UserDiscId:{in:sentIdInfo.userId}},
                  {RoleDiscId:{in:sentIdInfo.userId}}
                ]
              }
            ]},
            {AND: [
              {UserDiscId:{in:sentIdInfo.userId}},
              {RoleDiscId:{in:sentIdInfo.userId}}
            ]}
          ]}
        ]
      }
    })
    
    // 最終判定-存在しなければ
    if (isAllowed.length === 0) {
      // 実行しない
      message.reply("そのコマンドは実行権限がありません。；；")
      return false;
    } else {
      return true;
    }

    //=====================================================================//

  } else {
    // prefixとして有効でない場合
    return false;
  }
}