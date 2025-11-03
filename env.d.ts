// 環境変数に追加したものをここに入れておくと、入力補完が効くようになる

declare module 'process' {
	global {
		namespace NodeJS {
			interface ProcessEnv {
				readonly NODE_ENV?: string;
				readonly TOKEN?: string;
				readonly BOT_NAME?: string;
				readonly ADMIN_USER?: string;
			}
		}
	}
}