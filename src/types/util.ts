// Util内で使用する型定義をここに集約

// SentInfo
// Messageが送られた場所での各種IDを取得するオブジェクト
export type SentIdInfo = {
  guildId: string[];
  channelId: string[];
  roleId: string[];
  userId: string[];
}