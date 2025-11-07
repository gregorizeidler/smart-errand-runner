# Guia de Setup - Smart Errand Runner

## 🔧 Configuração Passo a Passo

### 1. Clonar/Baixar o Projeto

```bash
cd /caminho/para/seus/projetos
# Se você ainda não tem o projeto, clone ou baixe
```

### 2. Configurar Backend

#### 2.1. Criar Ambiente Virtual Python

```bash
cd smart-errand-runner/backend
python -m venv venv
```

#### 2.2. Ativar Ambiente Virtual

**No macOS/Linux:**
```bash
source venv/bin/activate
```

**No Windows:**
```cmd
venv\Scripts\activate
```

#### 2.3. Instalar Dependências

```bash
pip install -r requirements.txt
```

#### 2.4. Configurar Variáveis de Ambiente

```bash
# Copiar o arquivo de exemplo
cp env.example .env

# Editar o arquivo .env e adicionar suas chaves
nano .env  # ou use seu editor favorito
```

Seu arquivo `.env` deve ficar assim:

```
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxx
GOOGLE_MAPS_API_KEY=AIzaSyxxxxxxxxxxxxxxxxxxxxxx
```

### 3. Configurar Frontend

#### 3.1. Instalar Dependências do Node

```bash
cd ../frontend
npm install
```

#### 3.2. Configurar Variáveis de Ambiente

```bash
# Copiar o arquivo de exemplo
cp env.example .env

# Editar o arquivo .env
nano .env  # ou use seu editor favorito
```

Seu arquivo `.env` deve ficar assim:

```
VITE_GOOGLE_MAPS_API_KEY=AIzaSyxxxxxxxxxxxxxxxxxxxxxx
```

**⚠️ IMPORTANTE:** Use a MESMA chave do Google Maps em ambos os arquivos .env

### 4. Obter as Chaves de API

#### 4.1. OpenAI API Key

1. Acesse: https://platform.openai.com/
2. Faça login ou crie uma conta
3. Clique em "API Keys" no menu lateral
4. Clique em "Create new secret key"
5. Dê um nome (ex: "smart-errand-runner")
6. Copie a chave (começa com `sk-proj-...`)
7. Cole no arquivo `backend/.env`

**💰 Custo:** ~$0.01-0.05 por consulta (usando GPT-4-mini)

#### 4.2. Google Maps API Key

1. Acesse: https://console.cloud.google.com/
2. Crie um novo projeto ou selecione um existente
3. Vá em "APIs e Serviços" > "Biblioteca"
4. Ative as seguintes APIs:
   - ✅ Maps JavaScript API
   - ✅ Places API
   - ✅ Directions API
   - ✅ Geocoding API
   - ✅ Distance Matrix API

5. Vá em "APIs e Serviços" > "Credenciais"
6. Clique em "Criar credenciais" > "Chave de API"
7. Copie a chave gerada
8. Cole em AMBOS os arquivos .env:
   - `backend/.env`
   - `frontend/.env`

**⚠️ Segurança:** Em produção, restrinja a chave por:
- Endereços IP (backend)
- URLs do site (frontend)

**💰 Custo:** Google oferece $200 de crédito mensal grátis

### 5. Testar a Instalação

#### 5.1. Testar Backend

```bash
cd backend
source venv/bin/activate  # No Windows: venv\Scripts\activate
python main.py
```

Você deve ver:
```
INFO:     Started server process
INFO:     Uvicorn running on http://0.0.0.0:8000
```

Abra http://localhost:8000 no navegador. Deve mostrar:
```json
{"message": "Smart Errand Runner API is running"}
```

#### 5.2. Testar Frontend

Em outro terminal:

```bash
cd frontend
npm run dev
```

Você deve ver:
```
VITE v5.x.x  ready in xxx ms
➜  Local:   http://localhost:5173/
```

Abra http://localhost:5173 no navegador. A interface deve carregar!

#### 5.3. Teste Completo

Com ambos rodando, use a interface web ou rode:

```bash
cd backend
python test_api.py
```

### 6. Solução de Problemas Comuns

#### ❌ "ModuleNotFoundError: No module named 'fastapi'"

**Solução:** 
```bash
cd backend
source venv/bin/activate
pip install -r requirements.txt
```

#### ❌ "Error: OPENAI_API_KEY not set"

**Solução:** 
- Verifique se o arquivo `backend/.env` existe
- Verifique se a chave está correta (começa com `sk-proj-`)
- Reinicie o servidor backend

#### ❌ "Google Maps API error"

**Solução:**
- Verifique se todas as APIs estão ativadas no Google Cloud Console
- Verifique se a chave está em ambos os .env
- Aguarde 1-2 minutos após criar a chave (propagação)
- Verifique se você tem créditos disponíveis

#### ❌ Mapa não carrega no frontend

**Solução:**
- Abra o DevTools (F12) e verifique o console
- Verifique se `VITE_GOOGLE_MAPS_API_KEY` está no `frontend/.env`
- O nome da variável DEVE começar com `VITE_`
- Reinicie o servidor frontend (npm run dev)

#### ❌ CORS error

**Solução:**
O backend já está configurado para aceitar requisições do frontend.
Se ainda assim tiver erro:
- Verifique se o frontend está em http://localhost:5173
- Adicione a URL correta em `main.py` no array `allow_origins`

### 7. Scripts Úteis

#### Iniciar tudo de uma vez (macOS/Linux)

```bash
chmod +x start.sh
./start.sh
```

#### Parar tudo

Pressione `Ctrl+C` em cada terminal

### 8. Checklist de Verificação

Antes de começar a usar, confirme:

- [ ] Python 3.9+ instalado
- [ ] Node.js 16+ instalado
- [ ] Ambiente virtual criado e ativado
- [ ] Dependências Python instaladas
- [ ] Dependências Node instaladas
- [ ] Arquivo `backend/.env` criado com chaves válidas
- [ ] Arquivo `frontend/.env` criado com chave válida
- [ ] OpenAI API com créditos disponíveis
- [ ] Google Cloud Project com APIs ativadas
- [ ] Backend rodando em http://localhost:8000
- [ ] Frontend rodando em http://localhost:5173

### 9. Próximos Passos

Agora você pode:

1. ✅ Abrir http://localhost:5173
2. ✅ Clicar em "Ver Exemplo" para dados de teste
3. ✅ Clicar em "Otimizar Rota"
4. ✅ Ver sua rota otimizada no mapa!

## 🎉 Pronto!

Se tudo estiver funcionando, você verá:
- Uma interface bonita
- Seus recados interpretados pela IA
- Uma rota otimizada no mapa
- Avisos se algo pode fechar antes de você chegar

---

**Problemas?** Abra uma issue no GitHub com:
- Mensagem de erro completa
- Sistema operacional
- Versões do Python e Node
- Logs do terminal

