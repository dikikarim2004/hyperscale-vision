# Hyperscale Vision

Buat frontend webapp production-ready untuk aplikasi trading bot Telegram `Hyperscale auto LP` pelajari dengan detail di repositori https://github.com/dikikarim2004/hyperscale-auto-lp.

Webapp ini adalah versi visual dari seluruh fitur bot Telegram. Semua fungsi command Telegram harus tersedia melalui UI webapp berupa menu, tombol, tabs, forms, modal, dan action controls. Jangan hanya membuat dashboard read-only.

ATURAN WAJIB:

- Bot Telegram saat ini live di production.

- PostgreSQL + Prisma sedang digunakan.

- Jangan menghapus data existing apa pun.

- Jangan menjalankan DROP, TRUNCATE, DELETE massal, database reset, atau destructive migration.

- Jangan merusak bot Telegram, BullMQ, Redis, scheduler, wallet, positions, config, secrets, lessons, performance, atau trading workflow.

- Jangan membuat mock data sebagai pengganti data production, kecuali di file .env statusnya masih dev.

- Inspect repository, Prisma schema, API, service, queue, dan Telegram command flow sebelum coding.

- Jangan berasumsi atau mengarang endpoint.

- Jangan mengekspos private key, API key, encrypted secret, atau OAuth token ke browser.

AUTHENTICATION:

- Gunakan Google OAuth/OpenID Connect.

- Gunakan Google `sub` sebagai identity utama.

- Validasi issuer, audience, expiry, dan `email_verified`.

- Gunakan secure httpOnly session cookie.

- Sediakan login, logout, protected routes, session expiration, unauthorized state, dan account page.

- User existing yang saat ini terhubung melalui `telegramId` tidak boleh otomatis dicocokkan hanya berdasarkan email.

- Buat explicit secure account-linking flow antara Google account dan user Telegram existing, misalnya verification code dari Telegram.

- Jangan mengubah data trading existing ketika melakukan linking.

- Semua authorization harus dilakukan server-side berdasarkan session user.

WEBAPP CHAT:

Buat halaman chat seperti bot Telegram:

- message history

- user messages

- bot/agent responses

- timestamps

- loading/typing indicator

- streaming atau progressive response jika backend mendukung

- error dan retry state

- empty state

- input composer

- send button

- attachment/action support jika relevan

- auto-scroll

- responsive mobile chat layout

- notifications dari bot muncul di chat dan notification center

SEMUA COMMAND TELEGRAM MENJADI UI:

Jangan mengharuskan user mengetik command seperti `/status`, `/wallet`, atau `/pnl`.

Konversikan fitur berikut menjadi UI webapp:

- `/start` → onboarding/setup page

- `/help` → help center dan feature navigation

- `/status` → overview/status page

- `/wallet` → wallet page

- `/wallets` → wallet management page

- `/addwallet` → secure import-wallet form

- `/usewallet` → active-wallet selector

- `/positions` → open positions page

- `/pnl` → PnL dashboard dan calendar

- `/config` → configuration pages/forms

- `/exportkey` → protected wallet export flow dengan confirmation dan re-authentication

- `/pause` → pause agent button

- `/resume` → resume agent button

- `/dryrun` → dry-run toggle

- `/deploy` → deploy workflow form/modal

- `/close` → close position action dengan confirmation

- `/screen` → screening page

- `/briefing` → briefing page

- `/study` → study/analysis page

- performance history → performance page

- lessons → lessons page

- logs/activity → activity page

Setiap action wajib memiliki:

- confirmation untuk tindakan berisiko

- loading state

- success state

- error state

- retry action jika relevan

- authorization server-side

- audit/activity entry jika sistem existing mendukungnya

NOTIFICATIONS:

Buat notification system untuk:

- position opened

- position closed

- profit/loss result

- deploy success/failure

- close success/failure

- agent paused/resumed

- screening opportunity

- risk alert

- insufficient SOL

- API/RPC failure

- worker/job failure

- configuration update

- important system messages

Gunakan WebSocket, Server-Sent Events, polling, atau mekanisme existing repository yang paling sesuai. Jangan menambahkan arsitektur baru jika backend existing sudah memiliki event/queue yang dapat digunakan.

DASHBOARD:

Sediakan:

- account overview

- agent status

- dry-run status

- active wallet

- SOL balance

- open positions

- current PnL

- fees

- PnL calendar

- daily PnL breakdown

- performance history

- recent notifications

- recent activity

- quick actions

WALLET SECURITY:

- Jangan mengirim private key ke frontend.

- Jangan menyimpan private key di localStorage/sessionStorage.

- Wallet import harus memakai HTTPS dan protected server endpoint.

- Export private key harus memerlukan explicit confirmation dan re-authentication.

- Mask semua API key dan secret.

- Jangan mencetak secret ke log.

CONFIGURATION:

Semua config yang sebelumnya tersedia melalui `/config` harus tersedia melalui webapp:

- grouped sections

- forms dengan validation

- current values

- defaults

- save/update state

- reset hanya jika aman dan explicit

- secret fields masked

- API key fields tidak pernah dikembalikan dalam plaintext

- scheduler harus refresh setelah config berubah

- jangan mengubah config user lain

DESIGN:

lihat template UI pada lampiran file.

Template adalah sumber kebenaran visual. Ikuti sedekat mungkin secara pixel-perfect:

- layout

- spacing

- typography

- colors

- borders

- radius

- shadows

- sidebar

- navbar

- buttons

- forms

- tables

- cards

- chat bubbles

- calendar

- modals

- notifications

- loading states

- mobile navigation

Jangan mengganti template dengan dashboard generik.

Jangan membuat landing page marketing jika template menunjukkan aplikasi.

Pastikan responsive untuk desktop, tablet, dan mobile.

Pastikan tidak ada text overflow, overlap, atau button yang terpotong.

Pada mobile, gunakan navigation ergonomis seperti bottom navigation, drawer, atau tabs sesuai template.

BACKEND INTEGRATION:

- Gunakan service/API existing jika tersedia.

- Jika endpoint belum tersedia, buat API contract/type/interface yang jelas.

- Setiap endpoint harus memvalidasi session dan ownership.

- Jangan percaya `telegramId`, `userId`, `walletId`, atau `positionId` yang dikirim client tanpa validasi server-side.

- Jangan mengubah Telegram bot behavior.

- Webapp dan Telegram harus memakai business logic yang sama agar hasil PnL, config, positions, wallet, dan agent status konsisten.

- Reuse existing queue/worker/service layer bila memungkinkan.

IMPLEMENTATION PROCESS:

1. Inspect repository dan identifikasi stack.

2. Inspect Prisma schema dan seluruh Telegram command flow.

3. Buat rencana perubahan additive.

4. Implement Google login dan account linking aman.

5. Implement protected webapp shell.

6. Implement chat interface.

7. Convert semua command menjadi menu/button/form.

8. Implement notifications.

9. Implement dashboard, wallet, positions, PnL, config, dan agent controls.

10. Ikuti template UI secara pixel-perfect.

11. Tambahkan hanya migration database yang additive dan backward-compatible jika benar-benar diperlukan.

12. Jalankan lint, typecheck, test, build, dan migration validation.

13. Pastikan tidak ada DROP, TRUNCATE, DELETE massal, reset database, atau penghapusan data.

14. Test login, logout, authorization, linking, chat, notifications, mobile layout, wallet security, PnL, positions, config, pause/resume, dry-run, dan error states.

OUTPUT:

- Source code webapp production-ready

- Google OAuth

- Secure session

- Safe Google-to-existing-user linking

- Chat interface seperti bot Telegram

- Semua command Telegram menjadi fitur UI

- Notification system

- Responsive mobile UI

- API contracts

- Additive database migration jika diperlukan

- Environment variable documentation

- Test/build report

- Daftar file yang berubah

- Daftar asumsi yang benar-benar diperlukan

Jangan menghapus atau mereset data production. Jangan membuat endpoint atau schema berdasarkan asumsi. Inspect codebase terlebih dahulu pada repositori https://github.com/dikikarim2004/hyperscale-auto-lp

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/40ef2bb1-1231-47f3-bc7b-44dc3881deaa).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
