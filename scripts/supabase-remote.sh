#!/usr/bin/env bash
# Roda comandos do Supabase CLI contra o banco remoto pelo Session Pooler (IPv4).
# O endereço direto do banco só tem IPv6, e os containers Docker do CLI não têm IPv6.
#
# Uso:
#   ./scripts/supabase-remote.sh migration list
#   ./scripts/supabase-remote.sh db pull
#   ./scripts/supabase-remote.sh db push --dry-run
#
# A senha é pedida na hora, não aparece na tela e não fica salva em lugar nenhum.
set -euo pipefail

SUPABASE_VERSION="2.122.0"
POOLER_HOST="aws-1-sa-east-1.pooler.supabase.com"

cd "$(dirname "$0")/.."

if [ $# -eq 0 ]; then
  echo "Uso: $0 <comando do supabase>   (ex.: migration list, db pull)"
  exit 1
fi

if [ ! -f supabase/.temp/project-ref ]; then
  echo "Projeto não vinculado. Rode antes: npx supabase@$SUPABASE_VERSION link --project-ref <ID_DO_PROJETO>"
  exit 1
fi
REF=$(cat supabase/.temp/project-ref)

read -r -s -p "Senha do banco (Supabase → Database → Settings): " PGPASS
echo

if [ -z "$PGPASS" ]; then
  echo "❌ Senha vazia. Copie a senha e rode o comando de novo."
  exit 1
fi
if [[ "$PGPASS" =~ [[:space:]] ]]; then
  echo "❌ A senha colada tem espaço ou quebra de linha (${#PGPASS} caracteres)."
  echo "   Provavelmente outro texto estava copiado. Copie só a senha e rode de novo."
  exit 1
fi

# Codifica para URL (caracteres como @ # / quebrariam o endereço).
# Passa por variável de ambiente para a senha não aparecer na lista de processos.
PGPASS_URL=$(PGPASS="$PGPASS" python3 -c 'import os, urllib.parse; print(urllib.parse.quote(os.environ["PGPASS"], safe=""))')
unset PGPASS

DB_URL="postgresql://postgres.$REF:$PGPASS_URL@$POOLER_HOST:5432/postgres"
unset PGPASS_URL

# Migrations que já existiam: depois de um db pull, só as novas são conferidas
ANTES=$(ls supabase/migrations/*.sql 2>/dev/null || true)

npx --yes "supabase@$SUPABASE_VERSION" "$@" --db-url "$DB_URL"

# O db pull compara o banco real com um banco temporário montado com a versão do CLI.
# As diferenças de versão do próprio Supabase (extensão pg_net e triggers internos de
# storage.buckets) aparecem como se fossem mudanças nossas. Elas não são, e quebram a
# recriação do banco a partir das migrations (erro 42883 no próximo pull).
RUIDO='pg_net|storage\.buckets'

if [ "${1:-}" = "db" ] && [ "${2:-}" = "pull" ]; then
  for arquivo in supabase/migrations/*.sql; do
    if grep -qxF "$arquivo" <<< "$ANTES"; then
      continue
    fi
    if grep -qE "$RUIDO" "$arquivo"; then
      echo
      echo "⚠️  $arquivo tem linhas de ruído de versão do Supabase:"
      grep -nE "$RUIDO" "$arquivo" | sed 's/^/     /'
      read -r -p "   Remover essas linhas agora? [S/n] " resposta < /dev/tty
      if [[ ! "$resposta" =~ ^[Nn] ]]; then
        sed -i -E "/$RUIDO/d" "$arquivo"
        cat -s "$arquivo" > "$arquivo.tmp" && mv "$arquivo.tmp" "$arquivo"   # tira linhas em branco repetidas
        echo "   ✅ Removidas. Confira o arquivo antes do commit."
      else
        echo "   Mantidas. Apague à mão antes do commit."
      fi
    fi
  done
fi
