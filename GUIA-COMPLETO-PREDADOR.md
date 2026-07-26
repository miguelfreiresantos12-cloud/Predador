# Predador — Guia Completo de Setup

> Sistema de Prospecção e Coaching Comercial com IA
> Digital Concept (DC)

---

## Índice

1. [Pré-requisitos](#1-pré-requisitos)
2. [Criar conta no GitHub](#2-criar-conta-no-github)
3. [Baixar e extrair o projeto](#3-baixar-e-extrair-o-projeto)
4. [Instalar dependências](#4-instalar-dependências)
5. [Criar conta no Supabase](#5-criar-conta-no-supabase)
6. [Configurar banco de dados](#6-configurar-banco-de-dados)
7. [Configurar variáveis de ambiente](#7-configurar-variáveis-de-ambiente)
8. [Subir no GitHub](#8-subir-no-github)
9. [Deploy no Vercel](#9-deploy-no-vercel)
10. [Testar a aplicação](#10-testar-a-aplicação)
11. [Deploy das Edge Functions](#11-deploy-das-edge-functions)
12. [Configurar OpenAI](#12-configurar-openai)
13. [Primeiro uso](#13-primeiro-uso)

---

## 1. Pré-requisitos

Antes de começar, você precisa ter instalado:

| Ferramenta | Para que serve | Download |
|-----------|---------------|----------|
| **Node.js** | Rodar o projeto Next.js | [nodejs.org](https://nodejs.org) — baixe a versão LTS |
| **Git** | Versionar e enviar pro GitHub | [git-scm.com](https://git-scm.com) |
| **VS Code** | Editar o código (opcional, mas recomendado) | [code.visualstudio.com](https://code.visualstudio.com) |
| **Conta GitHub** | Hospedar o código | [github.com](https://github.com) |
| **Conta Supabase** | Banco de dados e backend | [supabase.com](https://supabase.com) |
| **Conta OpenAI** | IA (transcrição e análise) | [platform.openai.com](https://platform.openai.com) |

**Verifique se está tudo instalado:**
```bash
node --version      # Deve mostrar v20.x.x ou superior
npm --version       # Deve mostrar 10.x.x ou superior
git --version       # Deve mostrar 2.x.x ou superior
```

---

## 2. Criar conta no GitHub

1. Acesse [github.com](https://github.com)
2. Clique em **"Sign up"** (Cadastrar)
3. Preencha email, senha e nome de usuário
4. Confirme seu email
5. Pronto — anote seu **nome de usuário** (ex: `joaosilva`)

---

## 3. Baixar e extrair o projeto

### 3.1 Baixe o arquivo

Baixe o ZIP: **predador-repo.zip**

### 3.2 Extraia o ZIP

**Windows:**
1. Clique com o botão direito no arquivo `.zip`
2. Selecione **"Extrair tudo..."**
3. Escolha uma pasta (ex: `C:\Users\SeuNome\Projetos\`)
4. Clique em **"Extrair"**

**Mac:**
1. Clique duas vezes no arquivo `.zip`
2. Ele extrai automaticamente para a mesma pasta

**Linux:**
```bash
unzip predador-repo.zip -d ~/projetos/
```

### 3.3 Abra a pasta no terminal

**Windows (PowerShell):**
```powershell
cd C:\Users\SeuNome\Projetos\predador-repo
```

**Mac/Linux (Terminal):**
```bash
cd ~/projetos/predador-repo
```

---

## 4. Instalar dependências

Dentro da pasta do projeto, execute:

```bash
npm install
```

Isso vai baixar todas as bibliotecas necessárias. Pode demorar 2-5 minutos.

**Se der erro, tente:**
```bash
npm install --legacy-peer-deps
```

---

## 5. Criar conta no Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Clique em **"Start your project"**
3. Faça login com sua conta do GitHub (mais fácil)
4. Clique em **"New project"**
5. Preencha:
   - **Organization:** sua organização (ou pessoal)
   - **Project name:** `predador`
   - **Database password:** crie uma senha forte e **guarde ela**
   - **Region:** escolha a mais próxima (ex: `South America (Sao Paulo)`)
6. Clique em **"Create new project"**
7. Aguarde 1-2 minutos enquanto cria

### 5.1 Pegue as credenciais

Depois que o projeto criar:

1. No menu lateral, clique em **"Project Settings"** (engrenagem)
2. Clique em **"API"**
3. Anote esses 3 valores:
   - **Project URL** (ex: `https://abcdefgh12345678.supabase.co`)
   - **anon public** (ex: `eyJhbG...`)
   - **service_role secret** (ex: `eyJhbG...`) — **nunca compartilhe isso**

---

## 6. Configurar banco de dados

### 6.1 Abra o SQL Editor

1. No Supabase, clique em **"SQL Editor"** no menu lateral
2. Clique em **"New query"**
3. Dê um nome: `schema inicial`

### 6.2 Cole o schema SQL

Abra o arquivo `packages/db/migrations/001_initial.sql` no VS Code, copie TODO o conteúdo e cole no SQL Editor.

### 6.3 Execute

Clique no botão **"Run"** (ou pressione `Ctrl+Enter` / `Cmd+Enter`).

Se aparecer "Success" e não der erro, o banco está configurado.

### 6.4 Configure o Storage (bucket de áudio)

1. No menu lateral, clique em **"Storage"**
2. Clique em **"New bucket"**
3. Nome: `audio-uploads`
4. Marque **"Public bucket"** como **DESMARCADO** (privado)
5. Clique em **"Save"**

---

## 7. Configurar variáveis de ambiente

### 7.1 Copie o arquivo de exemplo

No terminal, dentro da pasta do projeto:

```bash
cp .env.example .env.local
```

**Windows:**
```powershell
copy .env.example .env.local
```

### 7.2 Edite o arquivo

Abra o arquivo `.env.local` no VS Code e preencha:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://SEU-PROJECT-URL.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key-aqui
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key-aqui

# OpenAI
OPENAI_API_KEY=sk-sua-openai-key-aqui
```

**Onde pegar cada um:**
- `NEXT_PUBLIC_SUPABASE_URL` -> Project URL do Supabase (passo 5.1)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` -> anon public do Supabase (passo 5.1)
- `SUPABASE_SERVICE_ROLE_KEY` -> service_role secret do Supabase (passo 5.1)
- `OPENAI_API_KEY` -> veja passo 12

---

## 8. Subir no GitHub

### 8.1 Inicialize o Git

No terminal, dentro da pasta do projeto:

```bash
git init
```

### 8.2 Adicione todos os arquivos

```bash
git add .
```

### 8.3 Faça o primeiro commit

```bash
git commit -m "feat: initial commit - Predador v0.1.0"
```

### 8.4 Crie o repositório no GitHub

**Opção A — Pelo site:**
1. Acesse [github.com](https://github.com) e faça login
2. Clique no **"+"** no canto superior direito -> **"New repository"**
3. **Repository name:** `predador`
4. **Description:** `Sistema de Prospecção e Coaching Comercial com IA`
5. Deixe **"Public"** ou **"Private"** (sua escolha)
6. **NÃO** marque "Add a README" (já temos um)
7. **NÃO** marque "Add .gitignore" (já temos)
8. Clique em **"Create repository"**

**Opção B — Pelo GitHub CLI (mais rápido):**
```bash
# Instale o gh primeiro: https://cli.github.com
gh auth login
gh repo create predador --public --source=. --push
```

### 8.5 Conecte e envie

Depois de criar o repo no site, copie a URL (ex: `https://github.com/joaosilva/predador.git`) e execute:

```bash
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/predador.git
git push -u origin main
```

**Pronto!** Seu código está no GitHub.

---

## 9. Deploy no Vercel

### 9.1 Crie conta na Vercel

1. Acesse [vercel.com](https://vercel.com)
2. Faça login com sua conta do **GitHub**
3. Permita o acesso aos repositórios

### 9.2 Importe o projeto

1. No dashboard da Vercel, clique em **"Add New..."** -> **"Project"**
2. Encontre **"predador"** na lista e clique **"Import"**
3. Em **"Framework Preset"** selecione **"Next.js"**
4. Em **"Environment Variables"** clique em **"Add"** e adicione:
   - `NEXT_PUBLIC_SUPABASE_URL` -> seu Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` -> sua anon key
   - `SUPABASE_SERVICE_ROLE_KEY` -> sua service role key
   - `OPENAI_API_KEY` -> sua OpenAI key
5. Clique em **"Deploy"**

Aguarde 2-3 minutos. A Vercel vai compilar e deployar automaticamente.

### 9.3 Acesse seu site

Quando terminar, clique em **"Visit"** ou copie a URL (ex: `https://predador.vercel.app`).

---

## 10. Testar a aplicação

### 10.1 Rode localmente (desenvolvimento)

```bash
npm run dev
```

Acesse no navegador: `http://localhost:3000`

### 10.2 Crie uma conta de teste

1. Na tela de login, clique em **"Criar conta"**
2. Use um email de teste (ex: `teste@dc.com`)
3. Crie uma senha
4. Faça login

### 10.3 Teste o upload de áudio

1. No dashboard, clique em **"Upload de áudio"**
2. Selecione um arquivo `.mp3` ou `.wav` de uma reunião
3. Aguarde o processamento (1-2 minutos)
4. Veja a transcrição e a análise

---

## 11. Deploy das Edge Functions

As Edge Functions rodam no Supabase, não na Vercel.

### 11.1 Instale a CLI do Supabase

```bash
npm install -g supabase
```

### 11.2 Faça login

```bash
supabase login
```

Vai abrir o navegador para autenticar.

### 11.3 Link o projeto

```bash
supabase link --project-ref SEU-PROJECT-REF
```

O **Project Ref** é a parte do URL: `https://**abcdefgh12345678**.supabase.co`

### 11.4 Deploy das funções

```bash
supabase functions deploy transcribe
supabase functions deploy analyze
supabase functions deploy coach
supabase functions deploy briefing
```

### 11.5 Configure as secrets das funções

```bash
supabase secrets set OPENAI_API_KEY=sk-sua-key-aqui
supabase secrets set SUPABASE_URL=https://seu-project.supabase.co
supabase secrets set SUPABASE_ANON_KEY=sua-anon-key
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key
```

---

## 12. Configurar OpenAI

1. Acesse [platform.openai.com](https://platform.openai.com)
2. Faça login (ou crie conta)
3. Clique em **"API keys"** no menu lateral
4. Clique em **"Create new secret key"**
5. Dê um nome: `Predador`
6. Copie a chave (começa com `sk-`)
7. Cole no `.env.local` e nas secrets do Supabase

**Importante:** A OpenAI cobra por uso. Coloque créditos na conta para evitar erros.

---

## 13. Primeiro uso

### Fluxo completo de uma reunião:

1. **Faça login** no Predador
2. **Upload de áudio** -> selecione o arquivo da reunião
3. **Aguarde** -> Whisper transcreve automaticamente
4. **Análise** -> GPT-4o gera a nota e feedback
5. **Veja o resultado** -> nota, radar, pontos fortes/fracos
6. **Consulte a memória** -> busque informações do cliente
7. **Leia o briefing** -> novidades do dia para sua abordagem

---

## Troubleshooting (Problemas comuns)

### Erro: "Cannot find module"
```bash
rm -rf node_modules
npm install
```

### Erro: "Failed to connect to Supabase"
- Verifique se as credenciais no `.env.local` estão corretas
- Verifique se o projeto Supabase está ativo

### Erro: "OpenAI API key invalid"
- Verifique se a chave começa com `sk-`
- Verifique se há créditos na conta da OpenAI

### Erro: "Edge Function not found"
- Verifique se fez o deploy das funções (passo 11)
- Verifique se as secrets estão configuradas

---

## Comandos úteis

```bash
# Desenvolvimento
npm run dev              # Roda localmente em http://localhost:3000
npm run build            # Compila para produção

# Git
git add .                # Adiciona todas as alterações
git commit -m "mensagem" # Commita
git push                 # Envia pro GitHub

# Supabase
supabase functions deploy nome   # Deploy uma função
supabase functions list           # Lista funções
supabase secrets list             # Lista secrets

# Vercel
vercel                   # Deploy preview
vercel --prod            # Deploy produção
```

---

## Próximos passos (evolução)

- [ ] Conectar com Google Calendar para agendamento automático
- [ ] Integrar com WhatsApp Business para follow-up
- [ ] Conectar com Pipedrive/HubSpot (CRM)
- [ ] Adicionar simulação de vendas (roleplay com IA)
- [ ] Criar app mobile (React Native)

---

**Suporte:** Se travar em algum passo, me manda o erro que eu te ajudo.
