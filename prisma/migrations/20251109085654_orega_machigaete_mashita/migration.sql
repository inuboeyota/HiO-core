/*
  Warnings:

  - You are about to drop the column `CommandPrefixName` on the `MsgCommandPermission` table. All the data in the column will be lost.
  - Added the required column `CommandClassName` to the `MsgCommandPermission` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_MsgCommandPermission" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "CommandClassName" TEXT NOT NULL,
    "GuildDiscId" TEXT NOT NULL,
    "ChannelDiscId" TEXT,
    "UserDiscId" TEXT,
    "RoleDiscId" TEXT
);
INSERT INTO "new_MsgCommandPermission" ("ChannelDiscId", "GuildDiscId", "RoleDiscId", "UserDiscId", "id") SELECT "ChannelDiscId", "GuildDiscId", "RoleDiscId", "UserDiscId", "id" FROM "MsgCommandPermission";
DROP TABLE "MsgCommandPermission";
ALTER TABLE "new_MsgCommandPermission" RENAME TO "MsgCommandPermission";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
