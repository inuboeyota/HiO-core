import { Message } from "discord.js";
import type { ClassNameToInstancePair, MessageCommand, TriggerClassPair } from "../../types/messageTriggerCommandType.js";

/**
 * メッセージクリエイトファクトリー（動的にクラスを生成し、名前に応じてMessageCommandの実行を行う）
 * 言い訳：状態を持たないのでfunctionで実装している←？？？　これどういう意味？
 * @param messageString メッセージのトリガになる文言を入れる
 * @param loadedTargetCommand フォルダから読み込んだ、クラス名とクラスのトリガのペア
 * @param crawledCommandInstance フォルダから読み込んだ、クラスの実体
 */
export function messageCommandFactory(message:Message, loadedTargetCommands:TriggerClassPair, crawledCommandInstance:ClassNameToInstancePair) {

  // prefix部分を抜粋する
  const prefix:string = message.content.replace("　", " ").split(' ')[0]!

  // メッセージのcrawledCommandInstanceを取得する（存在しない場合は何もしない）
  if (loadedTargetCommands[prefix]) {
    crawledCommandInstance[loadedTargetCommands[prefix]]!.execute(message)
  }

}