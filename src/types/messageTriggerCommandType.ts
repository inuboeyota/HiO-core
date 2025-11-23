// prefix またはslashコマンド
import { ChatInputCommandInteraction, Message, SlashCommandBuilder } from 'discord.js';

/**
 * @class メッセージ（有意思）のコマンドを定義するための型
 * @property {name} 必ず、クラス名と同じにすること！！！！！！！
 */
export interface MessageCommand {

  name: string;
  description?: string;

  prefix?: string;
  aliasPrefix?: string;
  slash?: SlashCommandBuilder;

  execute: (ctx: Message, params?:Object) => Promise<void>;

}

/**
 * キーがトリガ、バリューがクラス名
 */
export type TriggerClassPair = Record<string, string>

/**
 * キーがクラス名、バリューがクラスのインスタンス（実体）
 */
export type ClassNameToInstancePair = Record<string, MessageCommand>