# MailCatch — Email API for Testers

## Суть продукта

**MailCatch** — облачный сервіс, що створює тимчасові email-адреси з API для автоматизованого тестування. Тестувальники використовують його для перевірки signup/OTP/password-reset флоу без ручного створення поштових скриньок.

**Домен:** mailcatch.dev (основний) + mailcatch.io (резерв)

**Мови інтерфейсу:** English + Українська

---

## Проблема

QA/AQA-інженерам потрібно тестувати email-флоу (реєстрація, OTP, скидання паролю). Існуючі рішення:
- **MailSlurp** — дорого ($19.99+/міс)
- **Mailtrap** — жадний free tier (50 листів/міс)
- **Mailpit/Inbucket** — треба self-host, немає хмарного API
- **Guerrilla Mail / Temp-Mail** — ненадійні, без API для автоматизації

---

## Рішення

API-first сервіс:
1. `POST /api/inbox` → створює email (напр. `abc123@mailcatch.dev`)
2. Використовуєш цей email в тестованому додатку
3. `GET /api/inbox/{id}/messages` → отримуєш лист
4. Автопарсинг OTP-коду з листа

**За 30 секунд** від реєстрації до першого API-запиту.

---

## Цільова аудиторія

- QA/AQA-інженери (основна)
- Frontend/Backend розробники (тестують email-інтеграції)
- CI/CD пайплайни (автоматичні E2E тести)

---

## Функціонал

### Публічна частина (лендінг)

| Елемент | Опис |
|---------|------|
| Landing page | Hero + features + pricing + docs link |
| SEO | Meta tags, OG, sitemap.xml, структуровані дані |
| Docs | Інтерактивна API-документація з прикладами (Playwright, Cypress, Selenium) |
| Pricing | Free / Pro / Team |
| i18n | EN (default) + UA |

### Dashboard (особистий кабінет)

| Фіча | Опис |
|-------|------|
| API Keys | Створити / відкликати / копіювати |
| Inboxes | Список створених, статус, кількість листів |
| Messages | Перегляд вмісту кожного листа, автопарсинг OTP |
| Usage | Лічильник використання (23/100 inboxes цього місяця) |
| Settings | Профіль, зміна паролю, webhook URL |
| Webhooks | Налаштування URL для push-нотифікацій |

### Admin panel (для власника)

| Фіча | Опис |
|-------|------|
| Users | Список юзерів, дата реєстрації, план |
| Stats | Inboxes/emails per day/week, графіки |
| Plans | Перемикання юзера між планами |
| Logs | Помилки, підозріла активність |

---

## Тарифні плани

| План | Ціна | Ліміти |
|------|------|--------|
| **Free** | $0 | 100 inboxes/міс, 1 API key, 24h зберігання листів |
| **Pro** | $9/міс | 5000 inboxes/міс, 5 API keys, 7 днів зберігання, webhooks |
| **Team** | $29/міс | 50000 inboxes/міс, unlimited keys, 30 днів, priority support |

---

## Технічний стек

| Шар | Технологія | Чому |
|-----|-----------|------|
| Frontend | Next.js 14 (App Router) | SSR/SEO, React, i18n |
| UI | Tailwind CSS + shadcn/ui | Професійний вигляд без дизайнера |
| Backend API | Node.js + Express | JS (знайомий стек) |
| БД | PostgreSQL | Надійно, безкоштовно, SQL |
| Email приймання | smtp-server (npm) | Приймає вхідні листи на SMTP |
| Auth | JWT + bcrypt | Стандарт |
| i18n | next-intl | EN + UA |
| Хостинг | Railway (бек + БД) + Vercel (фронт) | $0-5/міс на старті |

---

## API Endpoints

### Auth
```
POST   /api/auth/register     — реєстрація
POST   /api/auth/login        — логін → JWT token
POST   /api/auth/refresh      — оновити токен
```

### Inboxes
```
POST   /api/inboxes           — створити inbox (повертає email-адресу)
GET    /api/inboxes           — список моїх inboxes
GET    /api/inboxes/:id       — деталі inbox
DELETE /api/inboxes/:id       — видалити inbox
```

### Messages
```
GET    /api/inboxes/:id/messages       — список листів в inbox
GET    /api/inboxes/:id/messages/:mid  — конкретний лист (body, headers, OTP)
GET    /api/inboxes/:id/wait           — long polling: чекати на новий лист (timeout 30s)
```

### API Keys
```
POST   /api/keys              — створити ключ
GET    /api/keys              — список ключів
DELETE /api/keys/:id          — відкликати ключ
```

### Webhooks
```
POST   /api/webhooks          — створити webhook
GET    /api/webhooks          — список
DELETE /api/webhooks/:id      — видалити
```

### Admin (потребує admin role)
```
GET    /api/admin/users       — список юзерів
GET    /api/admin/stats       — статистика
PATCH  /api/admin/users/:id   — змінити план юзера
```

---

## Архітектура

```
┌─────────────────────────────────────────────────────┐
│                    Vercel (Frontend)                  │
│  Next.js: Landing + Dashboard + Admin + Docs         │
└─────────────────────┬───────────────────────────────┘
                      │ HTTPS
┌─────────────────────▼───────────────────────────────┐
│                Railway (Backend)                      │
│                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────┐ │
│  │ Express API  │  │ SMTP Server  │  │ OTP Parser│ │
│  │ (REST)       │  │ (port 25)    │  │           │ │
│  └──────┬───────┘  └──────┬───────┘  └─────┬─────┘ │
│         │                  │                │       │
│         └──────────┬───────┘────────────────┘       │
│                    │                                 │
│         ┌──────────▼──────────┐                     │
│         │    PostgreSQL       │                     │
│         │ (users, inboxes,    │                     │
│         │  messages, keys)    │                     │
│         └─────────────────────┘                     │
└─────────────────────────────────────────────────────┘
```

**Потік даних:**
1. Юзер створює inbox через API → БД зберігає запис
2. Зовнішній сервіс відправляє лист на `xxx@mailcatch.dev`
3. SMTP-сервер приймає → парсить → зберігає в БД → тригерить webhook
4. Юзер отримує лист через API (polling або webhook)

---

## DevSecOps Pipeline (що будеш налаштовувати)

```
Push/PR → GitHub Actions:

  ┌─────────────┐
  │ Pre-commit  │  Gitleaks (secrets)
  └──────┬──────┘
         │
  ┌──────▼──────┐
  │   Build     │  npm install + build
  └──────┬──────┘
         │
  ┌──────▼──────┐
  │   SAST      │  Semgrep (code vulnerabilities)
  └──────┬──────┘
         │
  ┌──────▼──────┐
  │   SCA       │  Trivy (dependency vulnerabilities)
  └──────┬──────┘
         │
  ┌──────▼──────┐
  │   Container │  Trivy (Docker image scan)
  └──────┬──────┘
         │
  ┌──────▼──────┐
  │   DAST      │  OWASP ZAP (runtime scan)
  └──────┬──────┘
         │
  ┌──────▼──────┐
  │   Deploy    │  Railway / Vercel (якщо все зелене)
  └─────────────┘
```

**Gate:** PR не мержиться якщо severity ≥ HIGH.

---

## Порядок роботи

| # | Що | Хто |
|---|-----|-----|
| 1 | Код додатку (API, фронт, auth, SMTP) | Claude (я) |
| 2 | Dockerfile + docker-compose | Ти (з підказками) |
| 3 | Запуск локально | Ти |
| 4 | Git repo на GitHub | Ти |
| 5 | GitHub Actions CI/CD | Ти (з підказками) |
| 6 | Security сканери (Gitleaks → Semgrep → Trivy → ZAP) | Ти (з підказками) |
| 7 | Деплой в прод (Railway + Vercel) | Ти (з підказками) |
| 8 | Купівля домену + DNS | Ти |
| 9 | Моніторинг | Ти (з підказками) |
| 10 | Міграція на AWS (ECS + RDS + ECR) | Ти (з підказками) |
| 11 | Terraform (IaC) | Ти (з підказками) |
| 12 | IaC scanning (Checkov/tfsec) в пайплайн | Ти (з підказками) |

---

## Етап 2: Міграція на AWS

Після того як продукт працює на Railway і є перші юзери — переїзд на AWS (Free Tier, 12 міс безкоштовно).

### AWS сервіси

| Сервіс | Для чого | DevSecOps аспект |
|--------|----------|------------------|
| **ECS Fargate** | Запуск Docker-контейнерів (замість Railway) | Container security, task roles |
| **RDS PostgreSQL** | БД в хмарі (замість Railway Postgres) | Encryption at rest, security groups |
| **ECR** | Приватний Docker registry | Вбудований image scanning |
| **IAM** | Права доступу для сервісів | Least privilege principle |
| **KMS** | Шифрування секретів | Secrets management |
| **CloudWatch** | Логи + моніторинг + алерти | Security monitoring |
| **Route53** | DNS для mailcatch.dev | — |
| **S3** | Terraform state, бекапи | Bucket policies, encryption |
| **WAF** | Web Application Firewall | Захист API від атак |

### Terraform (IaC)

Вся інфраструктура описується кодом:

```
infrastructure/
├── main.tf
├── variables.tf
├── outputs.tf
├── modules/
│   ├── ecs/          — контейнери
│   ├── rds/          — база даних
│   ├── ecr/          — registry
│   ├── iam/          — ролі та політики
│   ├── networking/   — VPC, subnets, security groups
│   └── monitoring/   — CloudWatch, алерти
└── environments/
    ├── dev.tfvars
    └── prod.tfvars
```

### Додаткові сканери для AWS-етапу

| Інструмент | Що сканує |
|-----------|-----------|
| **Checkov** | Terraform-код на misconfigurations |
| **tfsec** | Terraform security issues |
| **AWS Config** | Compliance правил в реальному часі |
| **GuardDuty** | Threat detection (вбудований в AWS) |

### Оновлений пайплайн з AWS

```
Push/PR → GitHub Actions:

  Gitleaks → Semgrep → Trivy (code) → Checkov (IaC)
       │
       ▼
  Docker build → Push to ECR → Trivy (image)
       │
       ▼
  Terraform plan → deploy to ECS
       │
       ▼
  OWASP ZAP (DAST against staging)
       │
       ▼
  Promote to prod (manual approval)
```

### Бюджет AWS

| Сервіс | Free Tier (12 міс) | Після Free Tier |
|--------|--------------------|-----------------| 
| ECS Fargate | — (не входить) | ~$10/міс (мінімальний task) |
| RDS | 750 год/міс db.t3.micro | ~$15/міс |
| ECR | 500 MB storage | ~$1/міс |
| Route53 | — | $0.50/зона + $0.40/1M запитів |
| **Разом** | **~$0-5/міс (перший рік)** | **~$25-30/міс** |

*Примітка: EC2 (750 год/міс t2.micro) — альтернатива ECS якщо хочете дешевше.*

---

## Для резюме (фінальна версія)

> "Розробив та задеплоїв SaaS-сервіс MailCatch (email API для автоматизованого тестування). Налаштував повний CI/CD pipeline з security gates (SAST, SCA, container scanning, IaC scanning, DAST) в GitHub Actions. Інфраструктура на AWS (ECS, RDS, ECR) описана через Terraform. Продукт в production, обслуговує N користувачів."

---

## Наступний крок

Як тільки документ затверджено — я починаю писати код додатку.
