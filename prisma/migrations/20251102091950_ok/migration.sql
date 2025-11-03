-- CreateTable
CREATE TABLE "poc_table" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "poc_name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OFFLINE'
);

-- CreateTable
CREATE TABLE "Guilds" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "GuildDiscId" TEXT NOT NULL,
    "GuildName" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Users" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "UserDiscId" TEXT NOT NULL,
    "UserName" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Roles" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "RoleDiscId" TEXT NOT NULL,
    "RoleName" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Channels" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "ChannelDiscId" TEXT NOT NULL,
    "ChannelName" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "MsgCommandPermission" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "GuildDiscId" TEXT NOT NULL,
    "ChannelDiscId" TEXT,
    "UserDiscId" TEXT,
    "RoleDiscId" TEXT,
    "CommandId" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "MsgCommand" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "CommandName" TEXT NOT NULL,
    "ClassName" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "poc_table_poc_name_key" ON "poc_table"("poc_name");

-- CreateIndex
CREATE UNIQUE INDEX "Guilds_GuildDiscId_key" ON "Guilds"("GuildDiscId");

-- CreateIndex
CREATE UNIQUE INDEX "Users_UserDiscId_key" ON "Users"("UserDiscId");

-- CreateIndex
CREATE UNIQUE INDEX "Roles_RoleDiscId_key" ON "Roles"("RoleDiscId");

-- CreateIndex
CREATE UNIQUE INDEX "Channels_ChannelDiscId_key" ON "Channels"("ChannelDiscId");
