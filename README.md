# Predador

**Predador** — Sistema de Prospecção e Coaching Comercial com IA para a DC (Digital Concept).

> *"Não vendemos resultados. Construímos o sistema que permite que resultados aconteçam."*
> *Dados guiam. Comunicação move.*

## O que é

Predador é uma plataforma de coaching comercial baseada em IA que:
- Transcreve reuniões de vendas automaticamente
- Avalia performance com nota de 0 a 10
- Gera feedback personalizado pós-call
- Armazena memórias de clientes para consulta futura
- Entrega briefing diário com inteligência de mercado

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Frontend | Next.js 14 + React + TypeScript + Tailwind CSS |
| Backend | Supabase (PostgreSQL + Edge Functions + Auth) |
| IA | OpenAI GPT-4o + Whisper + Embeddings |
| Vetorial | pgvector |

## Estrutura

```
predador/
├── apps/
│   ├── web/              # Next.js frontend
│   │   ├── app/          # Dashboard, login, meetings, detail
│   │   ├── components/   # UI components
│   │   ├── hooks/        # Custom hooks
│   │   └── lib/          # Clients (Supabase, OpenAI)
│   └── api/              # Supabase Edge Functions
│       ├── transcribe/   # Whisper → transcrição
│       ├── analyze/      # GPT-4o → nota + feedback
│       ├── coach/        # Chat com memória
│       └── briefing/     # Briefing diário automático
├── packages/
│   ├── db/migrations/    # Schema SQL
│   ├── shared/           # Types TypeScript
│   └── ai-prompts/       # System prompts
├── .env.example
├── package.json
├── turbo.json
└── README.md
```

## Setup

1. **Clone o repositório**
   ```bash
   git clone https://github.com/SEU-USUARIO/predador.git
   cd predador
   ```

2. **Instale as dependências**
   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente**
   ```bash
   cp .env.example .env.local
   # Edite .env.local com suas credenciais
   ```

4. **Configure o Supabase**
   - Crie um projeto em [supabase.com](https://supabase.com)
   - Execute as migrations em `packages/db/migrations/001_initial.sql`
   - Configure o bucket `audio-uploads` no Storage

5. **Deploy das Edge Functions**
   ```bash
   supabase functions deploy transcribe
   supabase functions deploy analyze
   supabase functions deploy coach
   supabase functions deploy briefing
   ```

6. **Rode o projeto**
   ```bash
   npm run dev
   ```

## Variáveis de Ambiente

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key

# OpenAI
OPENAI_API_KEY=sk-sua-openai-key
```

## Funcionalidades

- [x] Login/Registro (Supabase Auth)
- [x] Dashboard executivo com métricas
- [x] Upload de áudio de reuniões
- [x] Transcrição automática (Whisper)
- [x] Análise com nota 0-10 (GPT-4o)
- [x] Radar de 11 competências comerciais
- [x] Feedback personalizado pós-call
- [x] Histórico de reuniões
- [x] Busca semântica com pgvector
- [x] Memória de clientes
- [x] Briefing diário automático
- [x] Chat com o coach IA

## Deploy

### Vercel (Frontend)
```bash
npm i -g vercel
vercel --prod
```

### Supabase (Backend)
As Edge Functions já estão prontas para deploy no Supabase.

## Licença

Proprietário — Digital Concept (DC)
