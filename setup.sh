#!/bin/bash
# Predador - Script de Setup Automático
# Executar na pasta do projeto: ./setup.sh

echo "========================================="
echo "  Predador - Setup Automático"
echo "========================================="
echo ""

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar Node.js
echo -e "${YELLOW}[1/8]${NC} Verificando Node.js..."
if ! command -v node &> /dev/null; then
    echo -e "${RED}Node.js não encontrado!${NC}"
    echo "Baixe em: https://nodejs.org"
    exit 1
fi
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}Node.js precisa ser v18 ou superior!${NC}"
    exit 1
fi
echo -e "${GREEN}Node.js OK: $(node --version)${NC}"

# Verificar Git
echo -e "${YELLOW}[2/8]${NC} Verificando Git..."
if ! command -v git &> /dev/null; then
    echo -e "${RED}Git não encontrado!${NC}"
    echo "Baixe em: https://git-scm.com"
    exit 1
fi
echo -e "${GREEN}Git OK: $(git --version)${NC}"

# Instalar dependências
echo -e "${YELLOW}[3/8]${NC} Instalando dependências..."
npm install
if [ $? -ne 0 ]; then
    echo -e "${YELLOW}Tentando com --legacy-peer-deps...${NC}"
    npm install --legacy-peer-deps
fi

# Verificar se .env.local existe
if [ ! -f .env.local ]; then
    echo -e "${YELLOW}[4/8]${NC} Criando .env.local..."
    cp .env.example .env.local
    echo -e "${YELLOW}IMPORTANTE: Edite o arquivo .env.local com suas credenciais!${NC}"
else
    echo -e "${GREEN}[4/8] .env.local já existe${NC}"
fi

# Inicializar Git
echo -e "${YELLOW}[5/8]${NC} Inicializando Git..."
if [ ! -d .git ]; then
    git init
    git add .
    git commit -m "feat: initial commit - Predador v0.1.0"
    echo -e "${GREEN}Git inicializado e primeiro commit feito!${NC}"
else
    echo -e "${GREEN}[5/8] Git já inicializado${NC}"
fi

# Verificar Supabase CLI
echo -e "${YELLOW}[6/8]${NC} Verificando Supabase CLI..."
if ! command -v supabase &> /dev/null; then
    echo -e "${YELLOW}Instalando Supabase CLI...${NC}"
    npm install -g supabase
fi
echo -e "${GREEN}Supabase CLI OK${NC}"

# Verificar Vercel CLI
echo -e "${YELLOW}[7/8]${NC} Verificando Vercel CLI..."
if ! command -v vercel &> /dev/null; then
    echo -e "${YELLOW}Instalando Vercel CLI...${NC}"
    npm install -g vercel
fi
echo -e "${GREEN}Vercel CLI OK${NC}"

# Resumo
echo ""
echo "========================================="
echo -e "${GREEN}  Setup concluído!${NC}"
echo "========================================="
echo ""
echo "Próximos passos:"
echo ""
echo "1. Configure o .env.local com suas credenciais:"
echo "   - Supabase URL, Anon Key, Service Role Key"
echo "   - OpenAI API Key"
echo ""
echo "2. Configure o banco de dados no Supabase:"
echo "   - Cole o schema de packages/db/migrations/001_initial.sql"
echo "   - Crie o bucket 'audio-uploads' no Storage"
echo ""
echo "3. Suba no GitHub:"
echo "   git remote add origin https://github.com/SEU-USUARIO/predador.git"
echo "   git push -u origin main"
echo ""
echo "4. Deploy no Vercel:"
echo "   vercel --prod"
echo ""
echo "5. Deploy das Edge Functions:"
echo "   supabase login"
echo "   supabase link --project-ref SEU-REF"
echo "   supabase functions deploy transcribe analyze coach briefing"
echo ""
echo "6. Rode localmente:"
echo "   npm run dev"
echo ""
