# Comandos do projeto — Conf-IA

Guia rápido para quem precisa rodar, testar ou dar manutenção no app.
Todos os comandos rodam na **raiz do projeto** (a pasta que tem o `package.json`).

---

## 1. Pré-requisitos

| Ferramenta | Versão | Como conferir |
|---|---|---|
| Node.js | 20 ou superior | `node -v` |
| npm | vem com o Node | `npm -v` |
| Git | qualquer recente | `git --version` |
| App **Expo Go** no celular | última da loja | Play Store / App Store |
| Docker | qualquer recente (só para comandos de banco) | `docker --version` |

> O Supabase CLI **não precisa ser instalado**: os comandos abaixo usam `npx supabase`, que baixa na hora.

---

## 2. Primeira vez: baixar e instalar

```bash
# Clonar (escolha um dos repositórios)
git clone https://gitlab.com/conf-ia/Conf-IA.git
git clone https://github.com/DaniloSsoares/Conf-IA-.git

cd Conf-IA          # ou Conf-IA-, conforme o repositório clonado

# Instalar as dependências
npm install
```

### Criar o arquivo `.env`

O `.env` **não vai para o git** (tem as chaves). Peça os valores a alguém da equipe e crie o arquivo na raiz:

```env
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
EXPO_PUBLIC_OPENWEATHER_API_KEY=
```

| Variável | Onde encontrar |
|---|---|
| `EXPO_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API → Project URL |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API → chave `anon` / publishable |
| `EXPO_PUBLIC_OPENWEATHER_API_KEY` | [openweathermap.org](https://openweathermap.org) → My API keys |

> Opcional: `EXPO_PUBLIC_WEATHERAPI_KEY` (weatherapi.com). Se existir, o app usa a WeatherAPI primeiro e a OpenWeather como reserva.
> Nunca coloque a chave `service_role` do Supabase no `.env` do app.

---

## 3. Rodar o app

```bash
npx expo start
```

Vai aparecer um QR code no terminal:
- **Android:** abra o Expo Go e escaneie o QR code
- **iPhone:** escaneie com a câmera, que abre o Expo Go

O celular e o computador precisam estar **na mesma rede Wi-Fi**.

### Variações úteis

```bash
npx expo start -c          # limpa o cache (use depois de mudar o .env ou quando algo "não atualiza")
npx expo start --tunnel    # quando o celular não conecta pela rede local (Wi-Fi da faculdade, etc.)
npm run android            # abre direto no emulador Android, se tiver um instalado
```

Atalhos com o servidor rodando: `r` recarrega o app, `j` abre o debugger, `Ctrl + C` para o servidor.

---

## 4. Verificar o código antes de subir

```bash
npx tsc --noEmit     # checagem de tipos do TypeScript (não gera arquivos)
npm run lint         # ESLint
```

Os dois devem terminar **sem erros** antes de um commit.

---

## 5. Banco de dados (Supabase)

As alterações do banco ficam versionadas em `supabase/migrations/`.

### Conectar o CLI ao projeto (uma vez por máquina)

```bash
npx supabase login
npx supabase link --project-ref <ID_DO_PROJETO>
```

O `<ID_DO_PROJETO>` é o trecho da URL do Supabase: `https://<ID_DO_PROJETO>.supabase.co`.
O `link` pede a **senha do banco** (Project Settings → Database). Ela não deve ser salva em nenhum arquivo do projeto.

> O `link` cria a pasta `supabase/.temp/`, que está no `.gitignore` e não deve ser enviada.

### Conexão pelo pooler (necessário em `db pull`, `db push` e `migration list`)

Parte desses comandos roda **dentro de um container Docker**, que não tem IPv6. O endereço direto do banco (`db.<ID>.supabase.co`) só tem IPv6, então eles falham com `ECONNREFUSED ... :5432`. A solução é passar o endereço do **Session Pooler**, que aceita IPv4.

Rode este bloco **uma vez por terminal**, antes dos comandos abaixo:

```bash
# Senha do banco: Project Settings → Database (não é a senha da conta do Supabase)
read -s -p "Senha do banco: " PGPASS && echo

# Codifica a senha para URL (caracteres como @ # / quebrariam o endereço)
PGPASS_URL=$(python3 -c 'import urllib.parse,sys; print(urllib.parse.quote(sys.argv[1], safe=""))' "$PGPASS")

REF=$(cat supabase/.temp/project-ref)
DB_URL="postgresql://postgres.$REF:$PGPASS_URL@aws-1-sa-east-1.pooler.supabase.com:5432/postgres"
```

- O `read -s` não mostra a senha na tela nem a grava no histórico do terminal.
- Use a porta **5432** (Session mode). A 6543 (Transaction mode) não funciona para esses comandos.
- Ao terminar: `unset PGPASS PGPASS_URL DB_URL`.

### Fluxo para alterar o banco (o arquivo vem primeiro)

O repositório é a **fonte da verdade** do banco. Toda mudança começa por um arquivo de migration e só depois vai para o Supabase.

```bash
# 1. Cria o arquivo vazio (nome em snake_case descrevendo a mudança, sem espaço nem ponto)
npx supabase migration new perfil_publico_view
#    → supabase/migrations/<data_hora>_perfil_publico_view.sql

# 2. Escreve o SQL dentro do arquivo

# 3. Confere o que vai ser aplicado, sem aplicar
npx supabase db push --db-url "$DB_URL" --dry-run

# 4. Aplica no banco
npx supabase db push --db-url "$DB_URL"

# 5. Commita o arquivo
git add supabase/migrations/
git commit -m "feat(db): view perfil_publico"
```

> A **versão** da migration é o número de data e hora gerado automaticamente. O nome só descreve a mudança. Não use "2.0", "v2" etc.

> Escreva o SQL de forma que possa rodar mais de uma vez: `CREATE OR REPLACE FUNCTION`, `DROP POLICY IF EXISTS` antes de `CREATE POLICY`, `ADD COLUMN IF NOT EXISTS`.

### Se a mudança foi feita direto pelo SQL Editor

Às vezes é mais rápido testar no painel. Nesse caso, **traga a mudança para o repositório** depois, para ele não ficar desatualizado:

```bash
npx supabase db pull --db-url "$DB_URL"
```

Gera um arquivo novo em `supabase/migrations/` com tudo que mudou no banco desde a última migration. Se perguntar `Update remote migration history table?`, responda **Y**.

Se, em vez disso, você criou o arquivo com `migration new` e colou à mão um SQL que **já tinha rodado** no painel, marque-o como aplicado. Senão o próximo `db push` tenta rodar de novo e dá erro de "already exists":

```bash
npx supabase migration repair --status applied <data_hora_do_arquivo> --db-url "$DB_URL"
```

### Conferir o que está aplicado

```bash
npx supabase migration list --db-url "$DB_URL"
```

Mostra lado a lado as migrations do repositório (`Local`) e as do banco (`Remote`). As duas colunas devem bater.

> ⚠️ O banco é **compartilhado** e é o mesmo usado na demo. Antes de rodar qualquer SQL, avise a equipe. Não rode `supabase db reset` contra o projeto remoto: ele apaga os dados.

---

## 6. Git

O projeto tem dois remotes: `origin` (GitHub) e `gitlab` (GitLab).

```bash
git status                       # o que mudou
git diff                         # ver as mudanças linha a linha

git add <arquivos>               # escolher o que vai no commit
git commit -m "fix: descrição curta do que mudou"

git push origin main             # enviar para o GitHub
git push gitlab main             # enviar para o GitLab
git pull origin main             # trazer as mudanças da equipe
```

Antes de dar `git add`, confira no `git status` que **não aparecem** `.env` nem `supabase/.temp/`.
Prefira `git add <arquivo>` a `git add .`, para não enviar algo sem querer.

Prefixos usados nos commits: `feat:` (funcionalidade nova), `fix:` (correção), `docs:` (documentação), `style:` (só formatação), `refactor:` (reorganização sem mudar comportamento).

---

## 7. Problemas comuns

| Sintoma | O que fazer |
|---|---|
| Mudei o `.env` e o app continua com o valor antigo | Parar o servidor e rodar `npx expo start -c` |
| O celular não conecta no QR code | Conferir se está na mesma rede, ou usar `npx expo start --tunnel` |
| `Port 8081 is being used` | Fechar outro terminal com o Expo aberto, ou aceitar a porta alternativa que ele sugere |
| Erro de módulo não encontrado depois de um `git pull` | Rodar `npm install` de novo |
| Mapa abre sem marcadores | Conferir a permissão de localização do Expo Go no celular e o raio configurado no Perfil |
| Clima aparece como "Sua Região" / 24°C | A chave da OpenWeather está faltando ou inválida no `.env` |
| `ECONNREFUSED ...:5432` no `db pull`/`db push` | O container do Docker não tem IPv6. Usar `--db-url "$DB_URL"` (ver seção 5) |
| Erro de RLS (`42501`) no log | A operação foi bloqueada pelas regras de segurança do banco. Ver as policies no Supabase |

---

## Outros documentos

- [PLANO_DESENVOLVIMENTO.md](PLANO_DESENVOLVIMENTO.md): o que falta fazer, por fase, e os testes manuais
- [../README.md](../README.md): visão geral do projeto
