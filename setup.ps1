# Predador - Script de Setup Automático (Windows)
# Executar na pasta do projeto: .\setup.ps1

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "  Predador - Setup Automático" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar Node.js
Write-Host "[1/8] Verificando Node.js..." -ForegroundColor Yellow
$nodeVersion = node --version 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Node.js não encontrado!" -ForegroundColor Red
    Write-Host "Baixe em: https://nodejs.org" -ForegroundColor Red
    exit 1
}
Write-Host "Node.js OK: $nodeVersion" -ForegroundColor Green

# Verificar Git
Write-Host "[2/8] Verificando Git..." -ForegroundColor Yellow
$gitVersion = git --version 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Git não encontrado!" -ForegroundColor Red
    Write-Host "Baixe em: https://git-scm.com" -ForegroundColor Red
    exit 1
}
Write-Host "Git OK: $gitVersion" -ForegroundColor Green

# Instalar dependências
Write-Host "[3/8] Instalando dependências..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "Tentando com --legacy-peer-deps..." -ForegroundColor Yellow
    npm install --legacy-peer-deps
}

# Criar .env.local
Write-Host "[4/8] Configurando ambiente..." -ForegroundColor Yellow
if (-not (Test-Path .env.local)) {
    Copy-Item .env.example .env.local
    Write-Host "IMPORTANTE: Edite o arquivo .env.local com suas credenciais!" -ForegroundColor Yellow
} else {
    Write-Host ".env.local já existe" -ForegroundColor Green
}

# Inicializar Git
Write-Host "[5/8] Inicializando Git..." -ForegroundColor Yellow
if (-not (Test-Path .git)) {
    git init
    git add .
    git commit -m "feat: initial commit - Predador v0.1.0"
    Write-Host "Git inicializado!" -ForegroundColor Green
} else {
    Write-Host "Git já inicializado" -ForegroundColor Green
}

# Verificar Supabase CLI
Write-Host "[6/8] Verificando Supabase CLI..." -ForegroundColor Yellow
$supabaseVersion = supabase --version 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Instalando Supabase CLI..." -ForegroundColor Yellow
    npm install -g supabase
}
Write-Host "Supabase CLI OK" -ForegroundColor Green

# Verificar Vercel CLI
Write-Host "[7/8] Verificando Vercel CLI..." -ForegroundColor Yellow
$vercelVersion = vercel --version 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Instalando Vercel CLI..." -ForegroundColor Yellow
    npm install -g vercel
}
Write-Host "Vercel CLI OK" -ForegroundColor Green

# Resumo
Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "  Setup concluído!" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Próximos passos:" -ForegroundColor White
Write-Host ""
Write-Host "1. Configure o .env.local com suas credenciais:" -ForegroundColor White
Write-Host "   - Supabase URL, Anon Key, Service Role Key" -ForegroundColor Gray
Write-Host "   - OpenAI API Key" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Configure o banco de dados no Supabase:" -ForegroundColor White
Write-Host "   - Cole o schema de packages\db\migrations\001_initial.sql" -ForegroundColor Gray
Write-Host "   - Crie o bucket 'audio-uploads' no Storage" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Suba no GitHub:" -ForegroundColor White
Write-Host "   git remote add origin https://github.com/SEU-USUARIO/predador.git" -ForegroundColor Gray
Write-Host "   git push -u origin main" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Deploy no Vercel:" -ForegroundColor White
Write-Host "   vercel --prod" -ForegroundColor Gray
Write-Host ""
Write-Host "5. Deploy das Edge Functions:" -ForegroundColor White
Write-Host "   supabase login" -ForegroundColor Gray
Write-Host "   supabase link --project-ref SEU-REF" -ForegroundColor Gray
Write-Host "   supabase functions deploy transcribe analyze coach briefing" -ForegroundColor Gray
Write-Host ""
Write-Host "6. Rode localmente:" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor Gray
Write-Host ""
