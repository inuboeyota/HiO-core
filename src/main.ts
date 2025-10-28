import { botClient } from './bot.js'
import dotenv from 'dotenv'
import path from 'path'
import { messageCommandLoader } from './core/messageTriggerCommand/messageCommandLoader.js';
import messageCommandCrawler from './core/messageTriggerCommand/messageCommandCrawler.js';
import { Message } from 'discord.js';
import { messageCommandFactory } from './core/messageTriggerCommand/messageCommandFactory.js';
import { messageCommandPermission } from './core/messageTriggerCommand/messageCommandPermissions.js';

// NODE_ENVを取得（デフォルトは'production'）
const env = process.env.NODE_ENV || 'production';
// 対応する.envファイルを読み込む
dotenv.config({ path: path.resolve('./', `.env.${env}`) });
console.log(`現在使用している環境は： .env.${env} です。`);


//=変数を用意================================================================================================//
const msgLoadedCommands = messageCommandLoader()
const msgCrawledCommands = messageCommandCrawler()
//===========================================================================================================//


//=起動後====================================================================================================//

botClient.once('ready', () => { //ここにボットが起動した際のコードを書く(一度のみ実行)
	console.log(`READY:[${process.env.BOT_NAME}]`); 

	if (botClient.user) {
		// 送信先のユーザーID
		const adminUserId = process.env.ADMIN_USER!
		// 起動確認用メッセージ送信（admin（俺）宛て）
		botClient.users.fetch(adminUserId).then(async user=> {
			user.send('起動したよ')
		})
	}
});

//===========================================================================================================//

//===メッセージ受信時========================================================================================//
botClient.on('messageCreate', async (message: Message) => {
	if (message.author.bot) return;

	// permissionの判定を行い、実行可能性を判定する
	const canExecute = messageCommandPermission(message, await msgLoadedCommands)

	// TODO: canExecuteで分岐する
	// messageCommandの実行
	messageCommandFactory(message, await msgLoadedCommands, await msgCrawledCommands)

})
//===========================================================================================================//

botClient.login(process.env.TOKEN); //ログインする
