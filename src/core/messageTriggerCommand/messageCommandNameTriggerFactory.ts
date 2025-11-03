import path from "path";
import fs from "fs";
import { fileURLToPath, pathToFileURL } from "url";
import type { TriggerClassPair } from "../../types/command.js";


/**
 * prefixで実行するコマンドについて、それらを動的に読み込み、そのクラス名とトリガのペアを返却する
 * @returns クラス名とトリガのペアを返却する「トリガ：クラス名」
 */
export default async function messageCommandNameTriggerFactory():Promise<TriggerClassPair> {
  // load対象のコードを取得する

  // ディレクトリを指定
  const msgDir = path.resolve(import.meta.dirname, '../../msgTrigger/commands/')
  
  const decodedMsgDir = decodeURIComponent(msgDir.toString())
  // ファイルを取得
  const msgFiles = await fs.readdirSync(decodedMsgDir).filter(file=> {
    const isJSfile:boolean = file.endsWith('js');
    const isTSfile:boolean = file.endsWith('ts');
    return isJSfile || isTSfile;
  })

  // 返却するオブジェクト
  const returnCmdPair : Record<string, string> = {};

  for (const file of msgFiles) {

    const filePath = path.join(decodedMsgDir, file);
    
    const module = await import(pathToFileURL(filePath).href);

    // 'default' エクスポートされたクラスをインスタンス化
    if (module.default) {
      const CommandClass = module.default;
      const instance = new CommandClass();

      // name と prefix プロパティを代入
      returnCmdPair[instance.prefix] = instance.name;

      // aliasPrefixが存在するかを判定
      if ("aliasPrefix" in instance){
        // aliasPrefix も代入
        returnCmdPair[instance.aliasPrefix] = instance.name;
      }
      
    }
  }

  return returnCmdPair;
}