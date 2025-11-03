import path from "path";
import fs from "fs";
import type { MessageCommand } from "../../types/command.js";
import { pathToFileURL } from "url";


/**
 * prefixで実行するコマンドについて、botの起動時に一度だけ、クラスをインスタンス化して保持しておく
 * @returns クラス名とクラスの実体のペアを返却する
 */
export default async function messageCommandNameInstanceFactory():Promise<Record<string,MessageCommand>>  {
  // ディレクトリを指定
  const msgDir = path.resolve(import.meta.dirname, '../../msgTrigger/commands/')

  const decodedMsgDir = decodeURIComponent(msgDir.toString())
  // ファイルを取得
  const msgFiles = fs.readdirSync(decodedMsgDir).filter(file=> {
    const isJSfile:boolean = file.endsWith('js');
    const isTSfile:boolean = file.endsWith('ts');
    return isJSfile || isTSfile;
  })


  // returnするオブジェクト
  const returnMessageInstance : Record<string, MessageCommand> = {};

  for (const file of msgFiles) {

    const filePath = path.join(decodedMsgDir, file);
    const module = await import(pathToFileURL(filePath).href);

    // エクスポートされたクラスをインスタンス化する
    if (module.default) {
      const CommandClass = module.default;
      const instance = new CommandClass();

      returnMessageInstance[instance.name] = instance;
    }
  }

  return returnMessageInstance;
}