# Vercel + Supabase + 阿里云域名 部署指南

本指南将协助你将项目部署到 Vercel，使用 Supabase 作为数据库，并配置阿里云域名以实现**国内用户无需翻墙即可访问**。

## 第一步：创建 Supabase 数据库 (Postgres)

1.  访问 [Supabase 官网](https://supabase.com/) 并注册账号。
2.  点击 **"New Project"** 创建一个新项目。
    *   **Org**: 选择默认组织。
    *   **Name**: 填写项目名称 (如 `hotel-forecast`)。
    *   **Database Password**: **务必生成并保存好密码**。
    *   **Region**: 选择 **Singapore (新加坡)** 或 **Tokyo (东京)**，这对国内连接速度最快。
3.  等待项目创建完成（约 1-2 分钟）。
4.  进入 **Project Settings (设置)** -> **Database**。
5.  在 **Connection parameters** 部分，找到连接字符串。我们主要需要 URI 格式的。
    *   复制 **Transaction Pooler** 链接（端口通常是 6543）。这将作为 `DATABASE_URL`。
    *   复制 **Session Pooler** 链接（端口通常是 5432）。这将作为 `DIRECT_URL`。
    
    > **注意**：连接字符串里会有 `[YOUR-PASSWORD]`，记得替换成你刚才设置的密码。

## 第二步：配置 Vercel 环境变量

1.  如果你还没有 Vercel 账号，请去 [vercel.com](https://vercel.com/) 注册（使用 GitHub 登录方便）。
2.  如果不使用 GitHub 自动导入，你需要安装 Vercel CLI：`npm i -g vercel`，然后在项目根目录运行 `vercel` 进行登录和部署。
3.  **推荐方式**：将你的代码推送到 GitHub。
4.  在 Vercel控制台点击 **"Add New..."** -> **"Project"** -> Import 你的 GitHub 仓库。
5.  在 **Configure Project** 页面：
    *   展开 **Environment Variables** (环境变量)。
    *   添加以下变量：
        *   **键**: `DATABASE_URL`
        *   **值**: 刚才 Supabase 的 **Transaction Pooler (6543)** 链接（记得填密码）。
        *   **键**: `DIRECT_URL`
        *   **值**: 刚才 Supabase 的 **Session Pooler (5432)** 链接。
        *   **键**: `NEXTAUTH_SECRET`
        *   **值**: 生成一个随机字符串 (可以在终端运行 `openssl rand -base64 32` 生成，或者随便敲一长串乱码)。
        *   **键**: `NEXTAUTH_URL`
        *   **值**: `https://你的域名` (如果你还没配好域名，暂时填 `http://localhost:3000` 也可以，但上线后建议改过来)。
6.  点击 **Deploy**。

## 第三步：配置阿里云域名 (关键步骤)

这一步是为了让国内用户能访问 Vercel。

1.  登录阿里云域名控制台。
2.  找到你的域名，点击 **解析**。
3.  添加两条记录：

    **第一条：主域名记录 (@)**
    *   **记录类型**: `A`
    *   **主机记录**: `@`
    *   **记录值**: `76.76.21.21` (这是 Vercel 的官方 Anycast IP，对国内访问优化较好)。
    *   **TTL**: 默认。

    **第二条：WWW 记录 (www)**
    *   **记录类型**: `CNAME`
    *   **主机记录**: `www`
    *   **记录值**: `cname.vercel-dns.com`

4.  回到 **Vercel 控制台** -> 你的项目 -> **Settings** -> **Domains**。
5.  在输入框输入你的域名 (如 `example.com`) 并点击 Add。
6.  Vercel 会自动检测你的 DNS 设置。如果阿里云那边配置正确，几分钟后 Vercel 就会显示两个勾选 (Valid Configuration)，并且自动为你申请 SSL 证书 (HTTPS)。

## 第四步：同步数据库结构

部署成功后，你还需要让 Supabase 的数据库拥有正确的表结构。

1.  在你的本地电脑终端，确保 `.env` 文件里也有 `DATABASE_URL` 和 `DIRECT_URL` (用 Supabase 的)。
2.  运行迁移命令：
    ```bash
    npx prisma migrate dev --name init
    ```
    这会在远程 Supabase 数据库中创建表。

完成！现在你的网站应该可以通过 `https://你的域名` 访问，且数据库托管在 Supabase 新加坡节点，速度和稳定性都很有保障。
