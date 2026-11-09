# Plano de Desenvolvimento — Conf-IA

> Checkup feito em 26/10/2026, a partir da leitura do código (branch `main`, commit `739e6d8` + alterações locais não commitadas).
> Defesa do TCC: dezembro/2026.
>
> Legenda de prioridade: 🔴 crítico · 🟡 médio · 🔵 estrutura/entrega · ⚪ pós-MVP

---

## Sumário

- [Fase 0 — Estabilizar (hoje)](#fase-0--estabilizar-hoje)
- [Fase 1 — Validação comunitária (27/10 a 01/11)](#fase-1--validação-comunitária-2710-a-0111)
- [Fase 2 — Mapa e clima (02/11 a 08/11)](#fase-2--mapa-e-clima-0211-a-0811)
- [Fase 3 — Segurança e qualidade (09/11 a 15/11)](#fase-3--segurança-e-qualidade-0911-a-1511)
- [Fase 4 — Organização e entrega (16/11 a 22/11)](#fase-4--organização-e-entrega-1611-a-2211)
- [Fase 5 — Preparação da defesa (23/11 em diante)](#fase-5--preparação-da-defesa-2311-em-diante)
- [Pós-MVP](#pós-mvp)
- [Anexo A — SQL corrigido](#anexo-a--sql-corrigido)
- [Anexo B — Testes manuais com duas contas](#anexo-b--testes-manuais-com-duas-contas)

---

## Fase 0 — Estabilizar (hoje)

Estimativa: ~1h. Sem isso, a primeira tela da demo pode não abrir.

### 0.1 🔴 Mapa quebra ao abrir (`haversineKm` não importado)

**Arquivo:** [src/features/Maps/index.tsx](../src/features/Maps/index.tsx)

**Problema:** a linha 113 chama `haversineKm`, que não está importada. Isso gera `ReferenceError` ao renderizar. Além disso, `filteredAlerts` e `filteredReports` são calculados e nunca usados: o JSX (linhas 271 e 315) e os contadores dos chips (linhas 200, 215 e 230) ainda usam `alerts`/`reports`.

**Fazer:**
- [x] Adicionar `import { haversineKm } from '@/src/shared/utils/haversine';`
- [x] Trocar `alerts.map` por `filteredAlerts.map` e `reports.map` por `filteredReports.map`
- [x] Trocar os contadores `alerts.length`/`reports.length` pelas versões filtradas
- [x] Envolver os filtros em `useMemo` (dependências: `alerts`, `reports`, `location`, `raioKm`). Os `useMemo` têm que ficar **antes** dos `return` antecipados de loading/permissão, por causa da regra dos hooks
- [ ] Testar com raio de 1 km e de 20 km no perfil e conferir se os marcadores somem e aparecem

### 0.2 🔴 Provável loop infinito de requisições no Mapa

**Arquivo:** [src/features/Maps/useMapData.ts](../src/features/Maps/useMapData.ts) (linhas 510–547 e 552–657)

**Problema:** `fetchAlertas` depende de `profile`. O `useFocusEffect` depende de `fetchAlertas` e chama `fetchProfile()`, que cria um objeto `profile` novo. O resultado é este ciclo: novo `profile` → novo `fetchAlertas` → `useFocusEffect` roda de novo → `fetchProfile()` → novo `profile` → … O canal Realtime também é recriado a cada volta, porque depende de `[profile, fetchAlertas]`.

**Como confirmar:** colocar um `console.log('fetchProfile')` temporário ou olhar o painel de requests no Supabase com o Mapa aberto.

**Fazer:**
- [x] Derivar uma chave estável das preferências: `const prefsKey = JSON.stringify(profile?.perfil_preferencias_alertas ?? {})`
- [x] `fetchAlertas` passa a depender de `[profile?.id, prefsKey]`, não do objeto inteiro
- [x] No `useFocusEffect`, deixar só `fetchProfile` e `fetchReports`. Mover a busca de alertas para um `useEffect` que rode quando `fetchAlertas` mudar
- [x] O `useEffect` do Realtime passa a depender de `[profile?.id, prefsKey]`
- [ ] Confirmar no log que cada fetch roda uma vez ao focar a tela

### 0.3 Fix do `notificacao_lida`

**Arquivo:** [src/features/History/index.tsx](../src/features/History/index.tsx) (linha 58)

O fix (`if (!notification.notificacao_lida)`) **já está no working tree**, mas ainda não foi commitado.

- [ ] Testar: abrir uma notificação não lida, sair, voltar e ver se ela aparece como lida (e se continua lida depois de reiniciar o app)
- [ ] Commitar junto com 0.1 e 0.2

### 0.4 Subir para o GitLab

O remote `gitlab` (`https://gitlab.com/conf-ia/Conf-IA.git`) já está configurado.

- [ ] `git push gitlab main` depois dos commits da Fase 0
- [ ] Conferir se o `.env` **não** subiu (ele está no `.gitignore`)

### 0.5 🔴 Valores do código diferentes dos enums do banco

> Descoberto ao comparar o código com os enums do Supabase em 26/10. Valores reais:
> `tipo_ocorrencia` = alagamento, deslizamento, bloqueio_via, outro, fogo_em_mata, queda_de_galho, falta_de_luz (confirmar o último)
> `nivel_risco` = baixo, moderado, alto, critico · `tipo_validacao` = confirma, contesta

**a) Reportes da categoria "Via bloqueada" provavelmente não salvam**
O app envia `via_bloqueada`, mas o enum do banco é `bloqueio_via`, então o INSERT deve falhar. Os alertas `bloqueio_via` também ficam sem ícone no Mapa.
- [x] [src/shared/constants/reportCategories.ts:15](../src/shared/constants/reportCategories.ts): `via_bloqueada` → `bloqueio_via`
- [x] [src/shared/types/report.ts:4](../src/shared/types/report.ts): `via_bloqueada` → `bloqueio_via`
- [x] Confirmar antes, criando um reporte dessa categoria (deve dar erro). Depois da correção, deve salvar

**b) A Home nunca mostra risco "crítico"**
[src/features/Home/index.tsx](../src/features/Home/index.tsx) compara com `'crítico'` e `'médio'`, mas o banco grava `critico` e `moderado`.
- [x] Comparar com os valores do enum (`baixo`, `moderado`, `alto`, `critico`); acento só no texto exibido
- [x] [src/shared/types/notification.ts:3](../src/shared/types/notification.ts): remover `'medio'` de `NivelRisco`
- [x] [src/features/Maps/index.tsx](../src/features/Maps/index.tsx): remover o `case 'médio'` dos estilos de badge (não existe no banco)
- [ ] A Home busca **todos** os alertas ativos, sem raio e sem as preferências do usuário. Aplicar o mesmo filtro do Mapa (pode ficar para a Fase 2)

---

## Fase 1 — Validação comunitária (27/10 a 01/11)

É o núcleo do TCC e o que a banca mais deve querer ver funcionando.

### 1.1 🔵 Versionar o banco

**Problema:** não existe pasta `supabase/` no repositório. Tabelas, RLS e triggers estão só no dashboard, então ninguém consegue reproduzir o banco a partir do código.

- [x] Criar `supabase/migrations/`
- [x] Exportar o schema atual (Dashboard → Database → ou `supabase db dump` com a CLI) para `supabase/migrations/0001_schema_inicial.sql`
- [x] Cada mudança nova vira um arquivo numerado (`0002_validacoes.sql`, `0003_protecao_colunas.sql`, …)

### 1.2 🔴 Completar a RLS de `reporte_validacoes`

**Estado atual (conferido em 26/10):** a tabela já existe, com `UNIQUE (reporte_id, perfil_id)`, e já tem as policies `validacoes_insert_own` (vota como si mesmo e não no próprio reporte) e `validacoes_select_all`.

**Problema:** não há policy de **UPDATE** nem de **DELETE**. O `upsert` usado para trocar o voto vai falhar por RLS, e o usuário não consegue retirar o voto.

- [x] Criar as policies de UPDATE e DELETE ([Anexo A.2](#a2-policies-que-faltam-em-reporte_validacoes))

### 1.3 🔴 Trigger de score (corrigido)

**Estado atual (conferido em 26/10):** o trigger **não existe**. Os únicos triggers no banco são os de `updated_at` (`trg_alertas_updated`, `trg_areas_risco_updated`, `trg_reportes_updated`). Ou seja, mesmo com votos, o score e o status nunca mudam.

**Problema no plano anterior:** o trigger fazia `UPDATE reportes` como o usuário que votou. Como o reporte é de outra pessoa, a RLS bloqueia o UPDATE **sem dar erro** e o score nunca muda. Ele também não tratava `DELETE` e usava os valores `confirmar`/`contestar`, mas o enum é `confirma`/`contesta`.

- [x] Criar a função com `SECURITY DEFINER` + `SET search_path = public` e trigger em `INSERT OR UPDATE OR DELETE` ([Anexo A.3](#a3-trigger-de-recálculo-de-score))
- [x] Deixar o mínimo de votos numa variável (`v_min_votos`). Para a demo, usar 3, para não depender de 5 contas

### 1.4 🔴 Proteger score e status contra edição pelo cliente

**Problema:**
- [src/shared/service/profileService.ts](../src/shared/service/profileService.ts) aceita `perfil_trust_score` no `updateProfile`. Qualquer usuário consegue mandar score 100 para si mesmo
- **Confirmado:** a policy `reportes_updates_own` deixa o dono editar a linha inteira. Ele consegue mudar `reporte_score_confianca` e `reporte_status` do próprio reporte, ou seja, se autovalidar. O mesmo vale para `perfil_trust_score` (policy de UPDATE do próprio perfil)

**Fazer:**
- [x] Remover `perfil_trust_score` do `Pick` em `updateProfile`
- [x] Criar triggers `BEFORE INSERT/UPDATE` que ignoram esses campos quando vêm do cliente ([Anexo A.4](#a4-proteção-de-colunas-sensíveis))
- [ ] Testar pelo app ou pelo SQL Editor com usuário autenticado ([Anexo B](#anexo-b--testes-manuais-com-duas-contas))

### 1.5 🟡 `ViewHistory` buscando dados pelo `id`

**Arquivos:** [src/features/History/ViewHistory/index.tsx](../src/features/History/ViewHistory/index.tsx), [src/shared/service/reportService.ts](../src/shared/service/reportService.ts), [src/features/Maps/index.tsx](../src/features/Maps/index.tsx)

**Problema:** a tela recebe o objeto inteiro como JSON nos params. Isso causa três coisas:
- pelo Mapa a foto não aparece, porque `getActiveReports` faz `select("*")` sem `reporte_midias`
- depois de votar, o score mostrado fica desatualizado
- os dados podem estar velhos

**Fazer:**
- [x] Criar `getReportById(id)` em `reportService.ts` com `select("*, reporte_midias(*)")`
- [x] Navegar passando só `{ type, id }` (Mapa e Histórico)
- [x] O `ViewHistory` busca o reporte ao montar e mostra um loading enquanto isso
- [x] Manter o `data` nos params só como fallback, durante a transição

### 1.6 🔴 Botões Confirmar / Contestar

**Arquivos:** `reportService.ts` + `ViewHistory/index.tsx` + `ViewHistory/styles.ts`

- [x] `voteReport(reportId, userId, voto: 'confirma' | 'contesta', comentario?)` com `upsert` e `onConflict: 'reporte_id,perfil_id'` (a constraint UNIQUE já existe)
- [x] Tipo `TipoValidacao = 'confirma' | 'contesta'` em `src/shared/types/report.ts`
- [x] `getMyVote(reportId, userId)`, para mostrar qual botão o usuário já escolheu
- [x] Os botões aparecem só quando `!isOwner`
- [x] Destacar o botão do voto atual; permitir trocar o voto
- [x] Desabilitar enquanto a requisição está em andamento (evita clique duplo)
- [x] Depois de votar, buscar o reporte de novo e atualizar score e status
- [x] Mostrar o score como barra de progresso (melhoria C do plano anterior, esforço baixo e bom visualmente)
- [x] Toast de sucesso ou erro

### 1.7 🟡 Comentários nos reportes (se sobrar tempo nesta semana)

`reporte_validacoes` já tem a coluna `validacao_comentario`. Para o MVP, o comentário vai **junto com o voto** ("Confirmo, a rua está alagada até o joelho"). Não precisa de tabela nova.

**Decisões (29/10):**
- O campo de texto fica **fixo acima dos botões** (não em modal), opcional, com `maxLength={500}` e o placeholder "Comentário opcional (ex.: água na altura do joelho)"
- Clicar no **mesmo voto com comentário novo** atualiza o comentário. Hoje o `handleVote` bloqueia: trocar `voto === myVote` por `voto === myVote && !comentario`
- Ao **trocar o tipo do voto**, mandar sempre `validacao_comentario` (mesmo `null`). O `upsert` só atualiza as colunas enviadas, e sem isso ficaria "contesta" + o comentário antigo de "confirma"
- **Autor:** mostrar só o **primeiro nome** (minimização de dados, LGPD) ou "Morador da região"
- **Busca em 2 consultas** (votos, depois `perfil_publico` com `.in('id', ids)`), não join, porque o Supabase nem sempre reconhece a relação tabela → view
- **Ordem com o A.5:** criar a view `perfil_publico` (parte 2 do A.5) **antes** da lista com nomes. Se a lista ler direto de `perfil`, ela quebra quando a policy pública for removida (parte 1, Fase 3)

**Fazer agora (~1h):**
- [x] `voteReport` recebe `comentario?: string | null` como 4º parâmetro
- [x] Campo de texto + regras de envio acima
- [x] Conferir se a constraint de 500 caracteres do [Anexo A.2](#a2-policies-que-faltam-em-reporte_validacoes) foi criada. Se não, o `maxLength` protege o app, mas não o banco
- [x] Lista simples dos comentários: ícone ✓/✗, texto e data, **sem nome** (não depende da view)
- [x] Contador "X de 3 votos necessários" perto do score: explica por que o status continua "pendente" com 100%

**Depois:**
- [x] Nome do autor via `perfil_publico` ([Anexo A.5](#a5-lgpd-perfil-visível-para-todos))
- [X] Pós-MVP: tabela `reporte_comentarios` separada, se quiserem comentários sem voto

### 1.8 🟡 Moderação de fotos e comentários (pergunta dos professores)

**A pergunta:** "qualquer um pode enviar qualquer coisa e estragar a experiência dos outros. Vale manter foto e comentário?"

**Decisão: manter.** Num app de defesa civil, a foto é a **evidência** que permite aos vizinhos confirmar um reporte, e o comentário traz o detalhe que a categoria não tem. Tirar os dois enfraquece justamente a validação comunitária, que é o núcleo do TCC. A resposta para a banca é **moderação em camadas**: nenhuma camada sozinha resolve, juntas reduzem bastante o abuso.

| Camada | Como funciona | Situação |
|---|---|---|
| 1. Identificação | Só usuário logado envia; aceite dos termos (`perfil_aceites`) | ✅ Já existe |
| 2. Regras de conduta | O texto dos termos diz o que é proibido (fotos de pessoas, conteúdo ofensivo, informação falsa) e que o conteúdo pode ser removido | ⬜ Ajustar o texto do `TermsModal` |
| 3. Limites | Foto **só pela câmera** em reporte novo (evidência do local, agora). Comentário de até 500 caracteres. **Máximo de 5 reportes por hora** por usuário | ⬜ Fazer agora |
| 4. Validação comunitária | Reporte com muitas contestações vira "rejeitado" e some do mapa | ✅ Feito (1.3 + 1.6) |
| 5. Denúncia + ocultação automática | Botão "Denunciar" no reporte e no comentário. Com **3 denúncias** de pessoas diferentes, o conteúdo some para os outros (o dono ainda vê no Histórico) | ⬜ Fazer agora |
| 6. Reputação | Quem tem reportes rejeitados ou ocultados perde `perfil_trust_score`; abaixo de um limite, não pode enviar foto | ⚪ Pós-MVP |
| 7. Moderação automática por IA | Edge Function analisa a imagem no upload com um serviço de moderação (ex.: Google Cloud Vision SafeSearch ou AWS Rekognition) e bloqueia conteúdo impróprio | ⚪ Pós-MVP: é um bom exemplo de "IA" para o nome Conf-IA |
| 8. Moderador humano | Papel de admin / Defesa Civil para revisar o que foi ocultado | ⚪ Pós-MVP |

**Fazer agora (~3h no total):**
- [x] Reporte novo: remover a opção de galeria em [src/features/Report/index.tsx](../src/features/Report/index.tsx) (`launchImageLibraryAsync`, linha ~193) e deixar só a câmera. Na edição ([useEditReport.ts](../src/features/History/EditReport/useEditReport.ts)), decidir se mantém a galeria (o dono pode querer trocar uma foto ruim)
- [x] Limite de 5 reportes por hora: trigger no banco ([Anexo A.9](#a9-moderação-limite-de-envio-denúncias-e-ocultação)). Mostrar um toast amigável quando o erro voltar
- [x] Tabela `denuncias` + trigger que oculta após 3 denúncias ([Anexo A.9](#a9-moderação-limite-de-envio-denúncias-e-ocultação))
- [x] Botão "Denunciar" no `ViewHistory` (reporte e cada comentário), com motivo: foto inadequada, comentário ofensivo, informação falsa, spam, outro
- [x] Filtrar reporte oculto: `getActiveReports` com `.eq('reporte_oculto', false)` e o Realtime do Mapa (`useMapData`, evento UPDATE) removendo o reporte quando `reporte_oculto` for true
- [x] Atualizar o texto dos termos (camada 2): versão 1.1.0, só com o que está implementado. Removidas as promessas de "suspensão de conta" e do trust score
- [ ] Pedir o aceite da nova versão no **login**: hoje só a tela de Perfil confere (`getTerms` está importado no Login, mas não é usado), então quem não abre o Perfil nunca vê os termos novos
- [ ] Incluir nos termos um **canal de contato** (e-mail da equipe) para pedidos de acesso ou exclusão de dados (LGPD)

**Para a defesa:** mostrar a tabela acima como "modelo de moderação em camadas", dizer o que está implementado (1 a 5) e apresentar 6 a 8 como trabalho futuro.

---

## Fase 2 — Mapa e clima (02/11 a 08/11)

### 2.1 🟡 Filtro por raio no servidor (bounding box)

**Arquivos:** `reportService.ts`, `useMapData.ts`

Hoje o app baixa **todos** os reportes e alertas do banco e só filtra no cliente.

- [x] `getActiveReports(bounds?)` com `.gte/.lte` em latitude e longitude
  - `deltaLat = raioKm / 111`
  - `deltaLng = raioKm / (111 * Math.cos(lat * Math.PI / 180))`
- [x] Mesma coisa na query de `alertas`
- [x] Manter o Haversine no cliente para refinar (o bounding box é um quadrado, o raio é um círculo)

### 2.2 🟡 Realtime e polling

- [ ] Remover o `setInterval` de 10s ([useMapData.ts:538](../src/features/Maps/useMapData.ts)): o Realtime com re-sync na reconexão já cobre. Se quiser manter algo, usar 60s
- [ ] O toast "Nova ocorrência próxima a você" só deve aparecer se o reporte estiver dentro do raio (usar `haversineKm`)
- [ ] No `INSERT`, evitar duplicata: só adicionar se o `id` ainda não estiver na lista
- [ ] Dar um nome único ao canal (`mapa-realtime-${profile.id}`) para evitar conflito em re-montagem

### 2.3 🔴 Clima: parar de exibir e gravar dado falso

**Arquivo:** [src/shared/service/weatherService.ts](../src/shared/service/weatherService.ts)

**Problema:** quando as APIs falham, o serviço devolve "24°C, ensolarado, Sua Região" como se fosse real, e o `saveWeatherReading` grava isso em `dados_climaticos`. Isso contamina os dados que o `sistema_ia` usaria. Além disso, cada abertura do mapa por cada usuário grava uma leitura nova.

- [ ] **Estado atual:** `dados_climaticos` só tem policy de SELECT, então o `saveWeatherReading` **sempre falha** (aviso `42501`). Decidir: (a) criar uma policy de INSERT para `authenticated` junto com as regras abaixo, ou (b) tirar a gravação do app e deixar para uma Edge Function (pós-MVP)
- [ ] Não gravar quando `clima_fonte === 'Estimado'`
- [ ] Na UI, mostrar "Clima indisponível" (ou um selo "estimado") em vez do dado fake
- [ ] Limitar a gravação: no máximo 1 leitura por região a cada 30–60 min (checar a última leitura antes de inserir). Pós-MVP: mover para uma Edge Function agendada
- [ ] Observação: o `.env` só tem `EXPO_PUBLIC_OPENWEATHER_API_KEY`. O ramo da WeatherAPI nunca roda, o que está ok, mas deve ser documentado no README

### 2.4 🟡 Ajustes visuais no Mapa

- [ ] Usar `weather.icone_ionicon` no lugar do ícone fixo `partly-sunny-outline` ([Maps/index.tsx:170](../src/features/Maps/index.tsx))
- [x] **Filtro de alertas pelo raio do alerta:** `alertas` tem `alerta_raio_km`, e o filtro atual só considera o centro do alerta. Um alerta de 10 km com centro a 7 km do usuário não aparece, mesmo cobrindo a posição dele. Trocar por `haversineKm(...) <= raioKm + Number(a.alerta_raio_km ?? 0)`
- [ ] `reporte_nivel_risco` é usado no Mapa, mas **não existe** no banco (confirmado no diagrama). Hoje todo reporte aparece igual. Decidir entre:
  - (a) derivar da categoria (ex.: deslizamento = alto, falta de luz = baixo), ou
  - (b) derivar do score de confiança, ou
  - (c) criar a coluna e o campo no formulário de reporte
- [ ] Confirmar se a **Home** já usa o clima real (o checkup anterior diz que sim, a lista de pendências diz que não)

### 2.5 🟡 Áreas de risco (`areas_risco` + `Polygon`)

Fecha a promessa do pitch ("Risk Mapping").

**Estado atual:** a tabela existe, está **vazia** e já tem a policy `areas_risco_select_all`. Colunas: `area_nome`, `area_tipo_risco` (enum `tipo_ocorrencia`), `area_nivel_risco` (enum `nivel_risco`), `area_poligono` (jsonb), `area_municipio`, `area_estado`, `area_fonte`. Ela se liga a `alertas.alerta_area_id`.

- [ ] Formato de `area_poligono`: `[{"latitude": .., "longitude": ..}, ...]`, que é o que o `Polygon` do react-native-maps recebe direto
- [ ] Seed de 3 a 5 zonas **reais da cidade do projeto** (consultar mapas da Defesa Civil ou do município), com `area_fonte` preenchida. Modelo no [Anexo A.7](#a7-seed-de-areas_risco)
- [ ] `fetchRiskAreas` no `useMapData`
- [ ] Renderizar com `Polygon` (cor por nível de risco) antes dos marcadores, para não cobri-los
- [ ] Opcional: legenda das cores no card do topo

### 2.6 ⭐🔴 Alerta colaborativo a partir da validação comunitária

**Por que é prioridade:** hoje **nada cria alertas**. O app só lê a tabela `alertas`, e um alerta só existe se alguém inserir manualmente no Supabase. Este item fecha o ciclo que o TCC promete:

```
cidadão reporta → comunidade confirma → vira alerta → vizinhos são notificados
```

**Como funciona:** quando o trigger de score muda um reporte para `validado`, um segundo trigger cria um alerta com `origem = 'colaborativo'`, na mesma posição e categoria do reporte. Se o reporte deixar de valer (voltar a pendente, ser rejeitado, ocultado ou resolvido), o alerta ligado a ele é cancelado ou expirado.

**Decisões de design:**
- **Trigger separado**, sem mexer no `recalculate_reporte_score`. Cada função faz uma coisa: uma calcula o score, outra reage à mudança de status
- **Um alerta por reporte:** coluna nova `alertas.alerta_reporte_id` com índice único. Se o status oscilar (validado → pendente → validado), o mesmo alerta é reativado, sem duplicar
- **Nível de risco derivado da categoria** (o reporte não tem nível próprio): deslizamento, alagamento e fogo em mata = `alto`; falta de luz = `baixo`; o resto = `moderado`
- **Raio de 1 km e validade de 6 horas.** Ajustáveis no SQL, documentar o motivo dos valores escolhidos
- **`alerta_emitido_por` fica nulo:** o alerta é da comunidade, não expõe quem fez o reporte (LGPD)
- `SECURITY DEFINER`: a tabela `alertas` não tem policy de INSERT para usuários, e é certo que não tenha

**Fazer:**
- [ ] Rodar o SQL do [Anexo A.10](#a10-alerta-colaborativo-a-partir-de-reporte-validado) no SQL Editor e depois `./scripts/supabase-remote.sh db pull`
- [ ] Testar sem celular, com o bloco de teste do A.10 (simula 3 confirmações e mostra o alerta criado)
- [ ] Mapa ([src/features/Maps/index.tsx](../src/features/Maps/index.tsx), linhas ~296 e ~375): hoje todo alerta aparece como **"Alerta Oficial"** com o escudo. Mostrar "Alerta da comunidade" quando `alerta_origem === 'colaborativo'`. O `AlertaDetails` do ViewHistory já traduz a origem para "Comunidade"
- [ ] Depois: o trigger de notificações ([Anexo A.8](#a8-gerar-notificações-quando-um-alerta-é-criado), item 3.3) dispara sozinho em cada alerta novo, inclusive nos colaborativos. Com os dois juntos, os vizinhos são avisados no Histórico
- [ ] Depois: job para expirar alertas vencidos (`pg_cron`, marcando `expirado` quando passa de `alerta_expira_em`). Hoje um alerta vencido continua aparecendo como ativo
- [ ] Atualizar os termos ([TermsModal](../src/components/ui/TermsModal/index.tsx), seção 4) e subir `VERSAO_TERMOS` em [termsService.ts](../src/shared/service/termsService.ts)
- [ ] Testes 23 a 27 do [Anexo B](#anexo-b--testes-manuais-com-duas-contas)

**Para a defesa:** este é o fluxo para demonstrar ao vivo. 3 contas confirmam um reporte e o alerta aparece no Mapa de todo mundo.

### 2.7 🔴 Validade dos reportes (expirar em vez de excluir)

**Problema:** hoje um reporte fica no Mapa **para sempre**. Um alagamento de 3 dias atrás aparece como se a rua ainda estivesse alagada. Num app de defesa civil, informação velha é tão ruim quanto informação falsa.

**Decisão: expirar, não excluir.** O reporte muda para o status `expirado`: some do Mapa e da Home, mas continua no Histórico do dono, com votos, comentários e denúncias preservados. Excluir de verdade apagaria o histórico do usuário, a auditoria (abuso, denúncias) e os dados que servem de base para análises e para a futura IA ("quantos alagamentos por mês nesta rua?").

**Como funciona:**
1. **Validade por categoria**, calculada na criação e guardada em `reporte_expira_em`:

   | Categoria | Validade | Por quê |
   |---|---|---|
   | Bloqueio de via | 4 h | Costuma ser liberado rápido |
   | Alagamento | 6 h | A água baixa em horas depois da chuva |
   | Falta de luz | 8 h | Prazo típico de restabelecimento |
   | Queda de galho / Fogo em mata | 12 h | Exigem remoção ou combate |
   | Deslizamento | 24 h | Risco que persiste |
   | Outro | 6 h | Padrão |

   Os valores ficam numa função SQL só (`validade_reporte`), fáceis de ajustar. Documentar a escolha no TCC.
2. **Um job agendado** (`pg_cron`, a cada 15 min) marca como `expirado` os reportes e os alertas que passaram da validade.
3. **O filtro também na consulta** (`reporte_expira_em > agora`), para o Mapa não depender do intervalo do job.
4. **O alerta colaborativo acompanha:** quando o reporte expira, o alerta ligado expira junto (A.10, já ajustado).

**Correções necessárias no que já existe** (descobertas ao desenhar este item):
- **O trigger de score "ressuscitaria" um reporte expirado:** um voto atrasado recalcularia o status para pendente ou validado. Ele precisa preservar `expirado`, como já preserva `resolvido`
- **A proteção de colunas (A.4) bloquearia o próprio job:** ela usa `pg_trigger_depth() = 1` para reconhecer "veio do cliente", mas o UPDATE do job também tem profundidade 1. A proteção passa a ser **pelo papel** (`authenticated`/`anon`, que é quem chama pela API), e não pela profundidade. Também passa a proteger `reporte_expira_em`, para o dono não "esticar" a validade

**Fazer (banco):**
- [ ] Rodar o [Anexo A.11](#a11-validade-dos-reportes), **bloco por bloco, na ordem**. O bloco 1 (novo valor do enum) precisa rodar **sozinho**
- [ ] ⚠️ Antes do bloco de preenchimento, decidir o que fazer com os reportes antigos: com a validade nova, **todos os reportes criados há mais de 24 h expiram na hora** e o Mapa fica vazio. Para a demo, recriar reportes de teste no dia da apresentação
- [ ] Refazer os testes de proteção (A.4/A.9): os testes com `DO $$` rodam como `postgres`, que agora **passa** pela proteção de propósito. Usar `SET LOCAL ROLE authenticated` para simular o app (bloco de teste no A.11)
- [ ] `./scripts/supabase-remote.sh db pull` no final

**Fazer (app):**
- [ ] `ReportStatus` com `'expirado'` ([types/report.ts](../src/shared/types/report.ts)) e `reporte_expira_em?: string` no tipo `Report`
- [ ] `getStatusStyle` ([historyStatus.ts](../src/shared/constants/historyStatus.ts)) com o selo "Expirado" (cinza)
- [ ] `getActiveReports`: trocar `.neq("reporte_status", "rejeitado")` por `.in("reporte_status", ["pendente", "validado"])` e acrescentar `.gt("reporte_expira_em", new Date().toISOString())`
- [ ] Realtime do Mapa ([useMapData.ts](../src/features/Maps/useMapData.ts)): remover também quando o status for `expirado`. A regra fica melhor como "manter só pendente/validado, não oculto", em vez de listar o que sai
- [ ] ViewHistory: aviso "Este reporte expirou" e votação desabilitada, como já é feito para o oculto
- [ ] Histórico do dono: mostrar há quanto tempo expira ("expira em 3 h") nos reportes ativos
- [ ] Atualizar os termos ([TermsModal](../src/components/ui/TermsModal/index.tsx), seção 4) e subir `VERSAO_TERMOS` em [termsService.ts](../src/shared/service/termsService.ts)
- [ ] Testes 28 a 32 do [Anexo B](#anexo-b--testes-manuais-com-duas-contas)

**Decisões em aberto:**
- 🤔 **Confirmação renova a validade?** Se alguém confirma um alagamento 5 horas depois, a ocorrência provavelmente continua. Renovar (por exemplo, `GREATEST(expira_em, agora + metade da validade)`) deixa o reporte vivo enquanto a comunidade o confirma, o que é coerente com a validação comunitária. O risco é estender um reporte para sempre com votos combinados
- 🤔 **Botão "Já foi resolvido" para o dono:** hoje o status `resolvido` existe, mas não há botão no app. Com ele, o dono encerra o reporte antes da validade
- ⚪ **Pós-MVP: retenção (LGPD).** Excluir fotos e anonimizar reportes com mais de N meses (princípio de término do tratamento). Definir N e documentar

---

## Fase 3 — Segurança e qualidade (09/11 a 15/11)

### 3.1 🔴 Testes de RLS com duas contas

Seguir o roteiro do [Anexo B](#anexo-b--testes-manuais-com-duas-contas):
- [ ] `perfil`: B não consegue alterar A
- [ ] `perfil`: ninguém altera o próprio `perfil_trust_score`
- [ ] `reportes`: B não edita nem exclui o reporte de A
- [ ] `reportes`: A não altera score ou status do próprio reporte
- [ ] `reporte_validacoes`: A não vota no próprio reporte; B não vota "como" A
- [ ] Storage (`fotos-ocorrencia`, `avatars`): B não sobrescreve arquivos na pasta de A
- [ ] Botão "Editar Reporte": aparece só para o dono, tanto pelo Mapa quanto pelo Histórico

### 3.2 🟡 Defesa em profundidade nos services

**Arquivo:** [src/shared/service/reportService.ts](../src/shared/service/reportService.ts)

- [ ] `updateReport` e `deleteReport`: adicionar `.eq('perfil_id', userId)` (hoje dependem só da RLS)
- [ ] `deleteReport`: apagar também a foto do Storage (hoje ficam arquivos órfãos)
- [ ] `updateReport` com foto nova: apagar a foto antiga do Storage

### 3.3 🟡 Notificações

**Arquivo:** [src/shared/service/alertaNotificationService.ts](../src/shared/service/alertaNotificationService.ts)

- [ ] O nome certo é `alerta_notificacoes` (confirmado no banco). Remover o fallback para `alertas_notificacoes`
- [ ] `markNotificationAsRead`: o `catch {}` vazio esconde erros. Pelo menos registrar com `console.warn` e retornar `{ error }`
- [ ] 🔴 **Nada gera notificações hoje.** Não existe trigger nem policy de INSERT em `alerta_notificacoes`. Quando um alerta é criado, nenhum usuário é notificado, e a aba de notificações só mostra o que foi inserido manualmente. Criar o trigger `gerar_notificacoes_alerta` ([Anexo A.8](#a8-gerar-notificações-quando-um-alerta-é-criado)): ele notifica quem está dentro do raio e tem a categoria ativa nas preferências
- [ ] Pré-requisito do trigger: `perfil_latitude`/`perfil_longitude` precisam estar preenchidos. Conferir se o app atualiza esses campos com a localização do usuário. Se não atualizar, salvar ao abrir o Mapa ou a Home

### 3.4 🔴 LGPD e limpeza das policies

**Estado atual (conferido em 26/10):**
- `perfil` tem a policy **"Qualquer um pode ver perfis"** (`SELECT ... true`). Qualquer pessoa consegue ler **telefone, cidade e latitude/longitude** de todos os usuários
- Todas as policies estão com `roles = {public}`, o que inclui o papel `anon`. Com a chave pública do app, alguém **sem login** consegue ler `reportes`, `reporte_midias`, `reporte_validacoes`, `alertas`, `areas_risco`, `dados_climaticos` e `perfil`
- `perfil` tem policies duplicadas (2 de SELECT próprio, 2 de UPDATE)

**Fazer:**
- [ ] Remover "Qualquer um pode ver perfis" e criar a view `perfil_publico` (só `id`, nome e avatar) para quando o app precisar mostrar outros usuários ([Anexo A.5](#a5-lgpd-perfil-visível-para-todos))
- [ ] Antes de remover: procurar no código se alguma tela lê o perfil de **outro** usuário (`.from('perfil')`)
- [ ] Remover as policies duplicadas de `perfil`
- [ ] Restringir as policies de leitura a `authenticated` ([Anexo A.6](#a6-restringir-leitura-a-usuários-logados))
- [ ] Documentar no README/TCC: que dados de localização são guardados, quem vê e por quê

### 3.5 🟡 Tipagem

- [ ] Adicionar `alerta_latitude`, `alerta_longitude`, `alerta_raio_km`, `alerta_area_id`, `alerta_origem` (`'sistema_ia' | 'defesa_civil' | 'colaborativo'`), `alerta_emitido_por`, `alerta_expira_em` e `updated_at` ao tipo `Alerta` ([src/shared/types/notification.ts](../src/shared/types/notification.ts))
- [ ] `useMapData`: `alerts: Alerta[]`, `profile: Profile | null`
- [ ] `Maps/index.tsx`: tipar `selectedItem` como união `(Alerta & { type: 'alerta' }) | (Report & { type: 'reporte' })`
- [ ] Componentes do `ViewHistory` (`AlertaContent`, `ReporteContent`): trocar `any` por props tipadas

### 3.6 🔵 Limpeza

- [x] Remover a URL e a chave do Supabase comentadas em [src/config/supabase.tsx](../src/config/supabase.tsx) (é uma chave pública, mas pega mal)
- [ ] Mostrar um erro claro se `EXPO_PUBLIC_SUPABASE_URL` estiver vazia, em vez de `|| ''` falhando em silêncio
- [ ] Remover a pasta `app-example/` e o script `reset-project` do `package.json`
- [ ] Revisar `src/shared/utils/examples.tsx` (remover se não for usado)
- [ ] Criar `.env.example` com os nomes das variáveis, sem valores

### 3.7 🔵 CI no GitLab

- [x] CI no GitHub Actions e no GitLab CI (`npm ci`, tipos, lint, gitleaks) + CD do APK Android por tag. Ver [CI_CD.md](CI_CD.md)
- [x] Corrigir os erros de lint (5 erros de hooks em `toastConfig.tsx`). Sobraram 47 avisos, sem erros
- [ ] Opcional: teste unitário de `haversineKm` (ex.: São Paulo → Rio ≈ 360 km)

### 3.8 🔵 Separar responsabilidades nas telas grandes

Padrão do projeto (já usado em `Maps/` e `EditReport/`): `index.tsx` só monta a tela, a lógica fica em hooks (`useXxx.ts`) e as partes visuais em `components/`.

- [x] `ViewHistory`: refatorada em 29/10 (`useHistoryItem`, `useReportVoting`, `components/`) + hook compartilhado `src/shared/hooks/useCurrentUser.ts`
- [ ] Aplicar o mesmo em `Home/index.tsx` (a maior tela hoje: clima, alertas, nível de risco e layout no mesmo arquivo)
- [ ] Avaliar `Report/index.tsx` (formulário + câmera + localização)
- [ ] Trocar as outras buscas de `supabaseConfig.auth.getUser()` espalhadas pelas telas por `useCurrentUser()`

---

## Fase 4 — Organização e entrega (16/11 a 22/11)

- [ ] **Nome oficial:** decidir entre Conf-IA e Conf-U e alinhar splash, `app.json`, pitch, README, banco e board
- [ ] **Board do GitLab:** reabrir as issues #2 e #3 (marcadas "Concluído" por engano). Criar uma issue por item deste plano
- [ ] **Pitch:** o bullet "Risk Mapping / vulnerability zones" só vale se a 2.5 estiver pronta. Se não, ajustar o texto
- [ ] **Atividade de rede (antes de reentregar):**
  - [ ] remover os números que ninguém mediu
  - [ ] remover o "raio LGPD de 3 casas decimais"
  - [ ] remover as reações que descrevem funcionalidade não implementada
- [ ] **README:**
  - [ ] o que o app faz (1 parágrafo + prints)
  - [ ] stack (Expo 54, React Native 0.81, Supabase, OpenWeather)
  - [ ] como rodar (`.env.example`, `npm install`, `npx expo start`)
  - [ ] como aplicar as migrations
  - [ ] diagrama simples da arquitetura e das tabelas
  - [ ] o que é MVP e o que é trabalho futuro

---

## Fase 5 — Preparação da defesa (23/11 em diante)

- [ ] **Congelar features**: daqui em diante, só correção de bug
- [ ] **Dados de demo:** 3 a 5 contas, reportes espalhados na região, votos suficientes para ter um reporte "validado" e um "rejeitado", áreas de risco visíveis
- [ ] **Roteiro da demo** (5–7 min): login → Home com clima → Mapa (raio, filtros, áreas de risco) → criar reporte → outra conta confirma → score e status mudam ao vivo → notificação
- [ ] **Gravar vídeo de backup** da demo (internet ou GPS podem falhar na hora)
- [ ] **Preparar a pergunta "onde está a IA?"**, já que o nome promete IA e o `sistema_ia` está no backlog. Opções:
  - (a) explicar o score de confiança comunitário como mecanismo de inteligência coletiva e apresentar a IA como trabalho futuro
  - (b) se der tempo: versão mínima de alerta automático por regra (precipitação acima de X mm cria um alerta `origem = 'sistema'`), apresentada honestamente como "regras, base para um modelo futuro"
- [ ] Ensaiar respostas sobre: segurança (RLS), LGPD (que dado de localização é guardado e por quanto tempo) e escalabilidade (bounding box, Realtime)

---

## Pós-MVP

- [ ] ⚪ Push notifications: `expo-notifications`, coluna `perfil.push_token`, Edge Function `send-push` e trigger no novo alerta
- [ ] ⚪ Alertas automáticos por clima (`sistema_ia`) via Edge Function agendada
- [ ] ⚪ Leitura climática centralizada no servidor (cron), em vez de cada cliente gravar
- [ ] ⚪ Peso do voto proporcional ao `perfil_trust_score` de quem vota
- [ ] ⚪ Filtro por tipo de ocorrência no Histórico
- [ ] ⚪ Compartilhar reporte (share nativo)
- [ ] ⚪ Mapa de calor dos reportes
- [ ] ⚪ Modo offline básico (cache dos últimos alertas)
- [ ] ⚪ Exportar histórico em PDF para a Defesa Civil

---

## Anexo A — SQL corrigido

> Ajustado ao banco real (enums, tabelas, policies e triggers conferidos em 26/10/2026).
> Rodar **um bloco por vez** no SQL Editor e salvar cada um como uma migration em `supabase/migrations/`.
> Nenhum bloco apaga dados.

### A.1 Estado atual do banco (referência)

| Item | Situação |
|---|---|
| `reporte_validacoes` | ✅ Existe · `UNIQUE (reporte_id, perfil_id)` ✅ · policies: INSERT próprio (sem votar no próprio reporte) e SELECT · ❌ falta UPDATE/DELETE |
| Trigger de score | ❌ Não existe |
| Proteção de score/status/trust | ❌ Não existe (`reportes_updates_own` libera a linha inteira) |
| `areas_risco` | ✅ Existe, vazia, com SELECT |
| `alerta_notificacoes` | ✅ Existe, com SELECT/UPDATE próprios · ❌ nada gera notificações |
| `dados_climaticos` | ✅ Existe · ❌ sem INSERT (o app não consegue gravar) |
| `perfil` | ⚠️ "Qualquer um pode ver perfis" (`true`) + policies duplicadas |
| Roles das policies | ⚠️ Todas `{public}` (inclui `anon`) |
| Triggers existentes | `trg_alertas_updated`, `trg_areas_risco_updated`, `trg_reportes_updated` (BEFORE UPDATE, `updated_at`) |

Enums: `tipo_validacao` = confirma, contesta · `nivel_risco` = baixo, moderado, alto, critico · `status_reporte` = pendente, validado, rejeitado, resolvido · `status_alerta` = ativo, expirado, cancelado · `origem_alerta` = sistema_ia, defesa_civil, colaborativo.

### A.2 Policies que faltam em `reporte_validacoes`

> Pode rodar mais de uma vez: cada comando apaga a versão anterior antes de criar (evita o erro `42710 ... already exists`).
> Lembrete: no SQL Editor, se um comando falha, **o bloco inteiro é cancelado**. Conferir depois com `SELECT policyname, cmd FROM pg_policies WHERE tablename = 'reporte_validacoes';`

```sql
-- Trocar o voto (necessária para o upsert)
DROP POLICY IF EXISTS "validacoes_update_own" ON public.reporte_validacoes;
CREATE POLICY "validacoes_update_own" ON public.reporte_validacoes
  FOR UPDATE TO authenticated
  USING (auth.uid() = perfil_id)
  WITH CHECK (auth.uid() = perfil_id);

-- Retirar o voto
DROP POLICY IF EXISTS "validacoes_delete_own" ON public.reporte_validacoes;
CREATE POLICY "validacoes_delete_own" ON public.reporte_validacoes
  FOR DELETE TO authenticated
  USING (auth.uid() = perfil_id);

-- Limite de tamanho do comentário do voto
ALTER TABLE public.reporte_validacoes
  DROP CONSTRAINT IF EXISTS validacao_comentario_tamanho;
ALTER TABLE public.reporte_validacoes
  ADD CONSTRAINT validacao_comentario_tamanho
  CHECK (validacao_comentario IS NULL OR char_length(validacao_comentario) <= 500);
```

### A.3 Trigger de recálculo de score

```sql
CREATE OR REPLACE FUNCTION public.recalculate_reporte_score()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER            -- roda com permissão do dono da função, não do votante
SET search_path = public
AS $$
DECLARE
  v_reporte_id UUID := COALESCE(NEW.reporte_id, OLD.reporte_id);
  v_min_votos  INT  := 3;   -- ajustar: 3 para a demo, 5 em produção
  v_total      INT;
  v_confirm    INT;
  v_taxa       NUMERIC;
BEGIN
  SELECT COUNT(*),
         COUNT(*) FILTER (WHERE validacao_tipo = 'confirma')
    INTO v_total, v_confirm
    FROM reporte_validacoes
   WHERE reporte_id = v_reporte_id;

  v_taxa := CASE WHEN v_total = 0 THEN 0 ELSE v_confirm::NUMERIC / v_total END;

  -- updated_at é preenchido pelo trg_reportes_updated que já existe
  UPDATE reportes SET
    -- coluna é numeric(4,2): guarda a fração 0.00–1.00 (100 estouraria o tipo)
    reporte_score_confianca = ROUND(v_taxa, 2),
    reporte_status = CASE
      WHEN reporte_status = 'resolvido'             THEN 'resolvido'::status_reporte
      WHEN v_total >= v_min_votos AND v_taxa >= 0.7 THEN 'validado'::status_reporte
      WHEN v_total >= v_min_votos AND v_taxa <  0.3 THEN 'rejeitado'::status_reporte
      ELSE 'pendente'::status_reporte
    END
  WHERE id = v_reporte_id;

  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_recalculate_score ON public.reporte_validacoes;
CREATE TRIGGER trg_recalculate_score
AFTER INSERT OR UPDATE OR DELETE ON public.reporte_validacoes
FOR EACH ROW EXECUTE FUNCTION public.recalculate_reporte_score();
```

> Um reporte "rejeitado" some do Mapa, porque `getActiveReports` filtra `neq('reporte_status','rejeitado')`. Ele continua aparecendo no Histórico do dono.

### A.4 Proteção de colunas sensíveis

Ideia: quando o UPDATE vem direto do cliente (`pg_trigger_depth() = 1`), os campos sensíveis voltam ao valor antigo. Quando vem do trigger de score (profundidade > 1), a alteração passa.

```sql
-- reportes: score e status só mudam pelo trigger de validação
CREATE OR REPLACE FUNCTION public.protect_reporte_columns()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    NEW.reporte_score_confianca := 0;
    NEW.reporte_status := 'pendente';
  ELSIF pg_trigger_depth() = 1 THEN
    NEW.reporte_score_confianca := OLD.reporte_score_confianca;
    -- dono pode marcar como resolvido; qualquer outra mudança de status é ignorada
    IF NEW.reporte_status IS DISTINCT FROM 'resolvido' THEN
      NEW.reporte_status := OLD.reporte_status;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_reporte ON public.reportes;
CREATE TRIGGER trg_protect_reporte
BEFORE INSERT OR UPDATE ON public.reportes
FOR EACH ROW EXECUTE FUNCTION public.protect_reporte_columns();

-- perfil: trust score não é editável pelo cliente
CREATE OR REPLACE FUNCTION public.protect_perfil_trust_score()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    NEW.perfil_trust_score := 0;  -- igual ao DEFAULT da coluna (conferido no dump)
  ELSIF pg_trigger_depth() = 1 THEN
    NEW.perfil_trust_score := OLD.perfil_trust_score;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_trust_score ON public.perfil;
CREATE TRIGGER trg_protect_trust_score
BEFORE INSERT OR UPDATE ON public.perfil
FOR EACH ROW EXECUTE FUNCTION public.protect_perfil_trust_score();
```

> O valor `0` é o `DEFAULT` da coluna `perfil_trust_score` (conferido em `supabase/migrations/20261028023004_remote_schema.sql`).
> Os triggers `BEFORE` rodam em ordem alfabética: `trg_protect_reporte` roda antes de `trg_reportes_updated`, o que é o comportamento desejado.

### A.5 LGPD: perfil visível para todos

Antes de rodar, conferir no código se alguma tela lê o perfil de **outro** usuário.

```sql
-- 1. Remover a leitura pública e as duplicadas
DROP POLICY IF EXISTS "Qualquer um pode ver perfis" ON public.perfil;
DROP POLICY IF EXISTS "usuario edita o proprio perfil" ON public.perfil;
-- Fica: "usuario ve o proprio perfil" (SELECT), "Usuarios podem editar seu próprio perfil" (UPDATE),
--       "Usuarios podem inserir seu próprio perfil" (INSERT)

-- 2. View só com dados não sensíveis, para mostrar autor de voto/comentário
--    Só o primeiro nome sai do banco (minimização de dados, LGPD)
CREATE OR REPLACE VIEW public.perfil_publico AS
  SELECT
    id,
    split_part(perfil_nome_completo, ' ', 1) AS primeiro_nome,
    perfil_avatar_url
  FROM public.perfil;

-- O Supabase dá ALL (inclusive UPDATE/DELETE) em tudo que é criado no schema public.
-- A view é "auto-atualizável" e roda como o dono (ignora a RLS de perfil): sem este
-- REVOKE, qualquer usuário logado conseguiria alterar o perfil de outro pela view.
REVOKE ALL ON public.perfil_publico FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.perfil_publico TO authenticated;
```

**Conferir as permissões** (deve aparecer só `SELECT` para `authenticated`, além de `postgres`/`service_role`):
```sql
SELECT grantee, privilege_type
FROM information_schema.role_table_grants
WHERE table_name = 'perfil_publico'
ORDER BY grantee;
```

**Teste de invasão** (roda como usuário logado e desfaz tudo no final):
```sql
BEGIN;
SET LOCAL ROLE authenticated;
UPDATE public.perfil_publico SET perfil_avatar_url = 'hack' WHERE true;
-- esperado: ERROR: permission denied for view perfil_publico
ROLLBACK;
```

> A view roda com permissão do dono (padrão do Postgres), então ignora a RLS de `perfil`. Isso é intencional para a **leitura** (só 3 colunas inofensivas), e é exatamente por isso que a **escrita** precisa ser bloqueada pelo `REVOKE`.

### A.6 Restringir leitura a usuários logados

Hoje as policies valem para `{public}`, o que inclui `anon`. Como o app exige login, restringir a `authenticated`:

```sql
ALTER POLICY "reportes_select_all"       ON public.reportes           TO authenticated;
ALTER POLICY "reporte_midias_select_all" ON public.reporte_midias     TO authenticated;
ALTER POLICY "validacoes_select_all"     ON public.reporte_validacoes TO authenticated;
ALTER POLICY "alertas_select_all"        ON public.alertas            TO authenticated;
ALTER POLICY "areas_risco_select_all"    ON public.areas_risco        TO authenticated;
ALTER POLICY "dados_climaticos_select_all" ON public.dados_climaticos TO authenticated;
```

> As policies de escrita já exigem `auth.uid()`, que é nulo para `anon`. Na prática já estão protegidas, mas é bom aplicar `TO authenticated` nelas também, por clareza.
> ⚠️ Se a tela de Intro/Login mostrar algum dado do banco **antes** do login, ela vai parar de mostrar. Testar depois.

### A.7 Seed de `areas_risco`

Coordenadas **de exemplo**. Trocar por zonas reais da cidade do projeto e citar a fonte.

```sql
INSERT INTO public.areas_risco
  (area_nome, area_tipo_risco, area_nivel_risco, area_poligono, area_municipio, area_estado, area_fonte)
VALUES
  ('Exemplo — Várzea do rio', 'alagamento', 'alto',
   '[{"latitude":-23.527,"longitude":-46.694},{"latitude":-23.525,"longitude":-46.688},
     {"latitude":-23.531,"longitude":-46.685},{"latitude":-23.533,"longitude":-46.691}]'::jsonb,
   'Cidade', 'UF', 'Defesa Civil municipal — mapa de risco 20XX'),
  ('Exemplo — Encosta', 'deslizamento', 'critico',
   '[{"latitude":-23.541,"longitude":-46.621},{"latitude":-23.539,"longitude":-46.617},
     {"latitude":-23.544,"longitude":-46.614}]'::jsonb,
   'Cidade', 'UF', 'Defesa Civil municipal — mapa de risco 20XX');
```

Para pegar coordenadas: no Google Maps, clique com o botão direito no ponto e copie a latitude/longitude. Use de 4 a 8 pontos por área.

### A.8 Gerar notificações quando um alerta é criado

Notifica cada perfil que está dentro do raio (raio do usuário + raio do alerta) e que tem a categoria ativa nas preferências.

```sql
CREATE OR REPLACE FUNCTION public.gerar_notificacoes_alerta()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.alerta_status <> 'ativo'
     OR NEW.alerta_latitude IS NULL
     OR NEW.alerta_longitude IS NULL THEN
    RETURN NEW;
  END IF;

  INSERT INTO alerta_notificacoes
    (alerta_id, perfil_id, notificacao_canal, notificacao_lida, notificacao_enviada_em)
  SELECT NEW.id, p.id, 'app', false, NOW()
  FROM perfil p
  WHERE p.perfil_latitude IS NOT NULL
    AND p.perfil_longitude IS NOT NULL
    -- preferência ausente = ativa (mesmo padrão do DEFAULT_ALERT_PREFERENCES do app)
    AND COALESCE((p.perfil_preferencias_alertas ->> NEW.alerta_tipo_ocorrencia::text)::boolean, true)
    -- Haversine em km
    AND 6371 * 2 * ASIN(LEAST(1, SQRT(
          POWER(SIN(RADIANS(NEW.alerta_latitude - p.perfil_latitude) / 2), 2) +
          COS(RADIANS(p.perfil_latitude)) * COS(RADIANS(NEW.alerta_latitude)) *
          POWER(SIN(RADIANS(NEW.alerta_longitude - p.perfil_longitude) / 2), 2)
        ))) <= COALESCE(p.perfil_raio_notificacao_km, 5) + COALESCE(NEW.alerta_raio_km, 0);

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_gerar_notificacoes ON public.alertas;
CREATE TRIGGER trg_gerar_notificacoes
AFTER INSERT ON public.alertas
FOR EACH ROW EXECUTE FUNCTION public.gerar_notificacoes_alerta();
```

> Pré-requisito: `perfil_latitude`/`perfil_longitude` preenchidos (ver item 3.3). Usuário sem localização salva não recebe notificação.
> Teste rápido: insira um alerta no SQL Editor com a lat/long perto da sua e veja se aparece na aba de notificações.

---

  ### A.9 Moderação: limite de envio, denúncias e ocultação

Rodar um bloco por vez, na ordem.

**1. Colunas de ocultação**
```sql
ALTER TABLE public.reportes
  ADD COLUMN IF NOT EXISTS reporte_oculto BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE public.reporte_validacoes
  ADD COLUMN IF NOT EXISTS validacao_oculta BOOLEAN NOT NULL DEFAULT false;
```

**2. Tabela de denúncias + RLS**
```sql
CREATE TABLE IF NOT EXISTS public.denuncias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  perfil_id UUID NOT NULL REFERENCES public.perfil(id) ON DELETE CASCADE,
  reporte_id UUID REFERENCES public.reportes(id) ON DELETE CASCADE,
  validacao_id UUID REFERENCES public.reporte_validacoes(id) ON DELETE CASCADE,
  denuncia_motivo TEXT NOT NULL CHECK (denuncia_motivo IN
    ('foto_inadequada', 'comentario_ofensivo', 'informacao_falsa', 'spam', 'outro')),   
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- denuncia OU um reporte OU um comentário
  CHECK ((reporte_id IS NOT NULL) <> (validacao_id IS NOT NULL)),
  -- cada pessoa denuncia o mesmo conteúdo uma vez só
  UNIQUE (perfil_id, reporte_id),
  UNIQUE (perfil_id, validacao_id)
);

ALTER TABLE public.denuncias ENABLE ROW LEVEL SECURITY;

-- Denuncia como si mesmo e nunca o próprio reporte ou comentário
DROP POLICY IF EXISTS "denuncias_insert_own" ON public.denuncias;
CREATE POLICY "denuncias_insert_own" ON public.denuncias
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = perfil_id
    AND NOT EXISTS (
      SELECT 1 FROM public.reportes r
      WHERE r.id = reporte_id AND r.perfil_id = auth.uid()
    )
    AND NOT EXISTS (
      SELECT 1 FROM public.reporte_validacoes v
      WHERE v.id = validacao_id AND v.perfil_id = auth.uid()
    )
  );

-- Cada um vê só as próprias denúncias (para o app saber se já denunciou)
DROP POLICY IF EXISTS "denuncias_select_own" ON public.denuncias;
CREATE POLICY "denuncias_select_own" ON public.denuncias
  FOR SELECT TO authenticated
  USING (auth.uid() = perfil_id);
```

**3. Ocultar automaticamente com 3 denúncias**
```sql
CREATE OR REPLACE FUNCTION public.ocultar_por_denuncias()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_limite INT := 3;
BEGIN
  IF NEW.reporte_id IS NOT NULL THEN
    IF (SELECT COUNT(*) FROM denuncias WHERE reporte_id = NEW.reporte_id) >= v_limite THEN
      UPDATE reportes SET reporte_oculto = true WHERE id = NEW.reporte_id;
    END IF;
  ELSE
    IF (SELECT COUNT(*) FROM denuncias WHERE validacao_id = NEW.validacao_id) >= v_limite THEN
      -- o voto continua contando no score; só o comentário deixa de aparecer
      UPDATE reporte_validacoes SET validacao_oculta = true WHERE id = NEW.validacao_id;
    END IF;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_ocultar_por_denuncias ON public.denuncias;
CREATE TRIGGER trg_ocultar_por_denuncias
AFTER INSERT ON public.denuncias
FOR EACH ROW EXECUTE FUNCTION public.ocultar_por_denuncias();
```

**4. Limite de 5 reportes por hora por usuário**
```sql
CREATE OR REPLACE FUNCTION public.limitar_reportes_por_hora()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF (SELECT COUNT(*) FROM reportes
      WHERE perfil_id = NEW.perfil_id
        AND created_at > NOW() - INTERVAL '1 hour') >= 5 THEN
    RAISE EXCEPTION 'Limite de reportes por hora atingido'
      USING ERRCODE = 'P0001', HINT = 'rate_limit';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_limitar_reportes ON public.reportes;
CREATE TRIGGER trg_limitar_reportes
BEFORE INSERT ON public.reportes
FOR EACH ROW EXECUTE FUNCTION public.limitar_reportes_por_hora();
```
No app, no `createReport`: se `error.code === 'P0001'`, mostrar "Você enviou muitos reportes na última hora. Tente novamente mais tarde."

**5. Proteger `reporte_oculto` (acrescentar à função do A.4)**

Dentro de `protect_reporte_columns()`, no ramo `INSERT` acrescentar `NEW.reporte_oculto := false;` e no ramo `pg_trigger_depth() = 1` acrescentar `NEW.reporte_oculto := OLD.reporte_oculto;`. Depois rodar o `CREATE OR REPLACE FUNCTION` de novo. Sem isso, o dono consegue "desocultar" o próprio reporte.

> A ocultação vale para o app. Pela API, `reporte_oculto = true` ainda é legível (a policy `reportes_select_all` é `true`). Restringir isso pela RLS fica para depois, junto com o papel de moderador (camada 8 do item 1.8).

---

### A.10 Alerta colaborativo a partir de reporte validado

Rodar um bloco por vez.

**1. Ligação alerta → reporte (um alerta por reporte)**
```sql
ALTER TABLE public.alertas
  ADD COLUMN IF NOT EXISTS alerta_reporte_id UUID
  REFERENCES public.reportes(id) ON DELETE SET NULL;

-- Único só quando preenchido: alertas manuais/Defesa Civil continuam com NULL
CREATE UNIQUE INDEX IF NOT EXISTS alertas_reporte_id_unico
  ON public.alertas (alerta_reporte_id)
  WHERE alerta_reporte_id IS NOT NULL;
```

**2. Função e trigger**
```sql
CREATE OR REPLACE FUNCTION public.sincronizar_alerta_colaborativo()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER            -- alertas não tem policy de INSERT para usuários
SET search_path = public
AS $$
DECLARE
  v_nivel nivel_risco;
BEGIN
  IF NEW.reporte_status = 'validado' AND NOT NEW.reporte_oculto THEN
    -- O reporte não tem nível de risco próprio: deriva da categoria
    v_nivel := CASE NEW.reporte_tipo_ocorrencia
      WHEN 'deslizamento' THEN 'alto'::nivel_risco
      WHEN 'alagamento'   THEN 'alto'::nivel_risco
      WHEN 'fogo_em_mata' THEN 'alto'::nivel_risco
      WHEN 'falta_de_luz' THEN 'baixo'::nivel_risco
      ELSE 'moderado'::nivel_risco
    END;

    -- Cria o alerta; se já existir (status oscilou), só reativa
    INSERT INTO alertas (
      alerta_tipo_ocorrencia, alerta_nivel_risco, alerta_titulo, alerta_descricao,
      alerta_latitude, alerta_longitude, alerta_raio_km,
      alerta_origem, alerta_status, alerta_expira_em, alerta_reporte_id
    ) VALUES (
      NEW.reporte_tipo_ocorrencia, v_nivel,
      'Ocorrência confirmada pela comunidade',
      COALESCE(NEW.reporte_descricao, 'Reporte confirmado por moradores da região.'),
      NEW.reporte_latitude, NEW.reporte_longitude, 1,
      'colaborativo'::origem_alerta, 'ativo'::status_alerta,
      NOW() + INTERVAL '6 hours', NEW.id
    )
    ON CONFLICT (alerta_reporte_id) WHERE alerta_reporte_id IS NOT NULL
    DO UPDATE SET
      alerta_status    = 'ativo'::status_alerta,
      alerta_expira_em = EXCLUDED.alerta_expira_em;
  ELSE
    -- Deixou de valer (pendente, rejeitado, oculto, resolvido ou expirado): encerra o alerta ligado
    UPDATE alertas
       SET alerta_status = CASE
             -- ::text: funciona antes e depois de o enum ganhar o valor 'expirado' (A.11)
             WHEN NEW.reporte_status::text IN ('resolvido', 'expirado') THEN 'expirado'::status_alerta
             ELSE 'cancelado'::status_alerta
           END
     WHERE alerta_reporte_id = NEW.id
       AND alerta_status = 'ativo';
  END IF;

  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_alerta_colaborativo ON public.reportes;
CREATE TRIGGER trg_alerta_colaborativo
AFTER UPDATE OF reporte_status, reporte_oculto ON public.reportes
FOR EACH ROW
WHEN (OLD.reporte_status IS DISTINCT FROM NEW.reporte_status
      OR OLD.reporte_oculto IS DISTINCT FROM NEW.reporte_oculto)
EXECUTE FUNCTION public.sincronizar_alerta_colaborativo();
```

> O `WHEN` faz o trigger rodar só quando o status ou a ocultação **mudam**. Um voto que não muda o status não mexe no alerta.

**3. Teste sem celular** (simula a validação e desfaz tudo no final)
```sql
DO $$
DECLARE
  v_id UUID := 'COLE_O_ID_DE_UM_REPORTE_PENDENTE';
  v_alerta RECORD;
BEGIN
  -- Simula o que o trigger de score faz quando o reporte atinge 3 votos e 70%
  UPDATE reportes SET reporte_status = 'validado' WHERE id = v_id;

  SELECT alerta_origem, alerta_status, alerta_nivel_risco, alerta_raio_km
    INTO v_alerta FROM alertas WHERE alerta_reporte_id = v_id;

  RAISE EXCEPTION 'Alerta criado: %', v_alerta;
END $$;
```
Esperado: um erro com `Alerta criado: (colaborativo,ativo,...)`. O `RAISE` desfaz tudo, então nada fica gravado.

> ⚠️ Esse UPDATE direto só funciona como `postgres` dentro de um DO block. Pelo app, a proteção de colunas (A.4) ignora mudança de status vinda do cliente. O caminho real é o trigger de score, a partir dos votos.

---

### A.11 Validade dos reportes

Rodar **um bloco por vez, na ordem**.

**1. Novo status `expirado`** (rodar **sozinho**: o Postgres não deixa usar um valor novo de enum na mesma transação em que ele foi criado)
```sql
ALTER TYPE public.status_reporte ADD VALUE IF NOT EXISTS 'expirado';
```

**2. Validade por categoria e coluna**
```sql
-- Um lugar só para ajustar as validades
CREATE OR REPLACE FUNCTION public.validade_reporte(p_tipo public.tipo_ocorrencia)
RETURNS INTERVAL
LANGUAGE sql IMMUTABLE
AS $$
  SELECT CASE p_tipo
    WHEN 'bloqueio_via'   THEN INTERVAL '4 hours'
    WHEN 'alagamento'     THEN INTERVAL '6 hours'
    WHEN 'falta_de_luz'   THEN INTERVAL '8 hours'
    WHEN 'queda_de_galho' THEN INTERVAL '12 hours'
    WHEN 'fogo_em_mata'   THEN INTERVAL '12 hours'
    WHEN 'deslizamento'   THEN INTERVAL '24 hours'
    ELSE INTERVAL '6 hours'
  END
$$;

ALTER TABLE public.reportes
  ADD COLUMN IF NOT EXISTS reporte_expira_em TIMESTAMPTZ;
```

**3. Preencher os reportes que já existem**
> ⚠️ Reportes com mais de 24 h expiram assim que o job rodar, e o Mapa pode ficar vazio. Veja o item 2.7.
```sql
UPDATE public.reportes
   SET reporte_expira_em = created_at + public.validade_reporte(reporte_tipo_ocorrencia)
 WHERE reporte_expira_em IS NULL;

ALTER TABLE public.reportes ALTER COLUMN reporte_expira_em SET NOT NULL;
```

**4. Proteção de colunas pelo papel (substitui a versão do A.4/A.9)**
```sql
CREATE OR REPLACE FUNCTION public.protect_reporte_columns()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    NEW.reporte_score_confianca := 0;
    NEW.reporte_status := 'pendente';
    NEW.reporte_oculto := false;
    NEW.reporte_expira_em := NOW() + public.validade_reporte(NEW.reporte_tipo_ocorrencia);

  -- Protege só o que vem do app (papéis da API do Supabase). Triggers SECURITY DEFINER
  -- e o job agendado rodam como postgres e podem alterar essas colunas.
  ELSIF current_user IN ('authenticated', 'anon') THEN
    NEW.reporte_score_confianca := OLD.reporte_score_confianca;
    NEW.reporte_oculto := OLD.reporte_oculto;
    NEW.reporte_expira_em := OLD.reporte_expira_em;
    -- o dono pode marcar como resolvido; qualquer outra mudança de status é ignorada
    IF NEW.reporte_status::text IS DISTINCT FROM 'resolvido' THEN
      NEW.reporte_status := OLD.reporte_status;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;
```

> Por que `current_user` funciona: numa chamada pela API, o Supabase roda a consulta com o papel `authenticated` (ou `anon`). Dentro de uma função `SECURITY DEFINER` (score, denúncias, alerta colaborativo) e no job do `pg_cron`, o papel é o dono, `postgres`. Fica mais explícito que contar a profundidade do trigger.

**5. Score preserva `resolvido` e `expirado` (substitui a versão do A.3)**
```sql
CREATE OR REPLACE FUNCTION public.recalculate_reporte_score()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_reporte_id UUID := COALESCE(NEW.reporte_id, OLD.reporte_id);
  v_min_votos  INT  := 3;   -- 3 para a demo, 5 em produção
  v_total      INT;
  v_confirm    INT;
  v_taxa       NUMERIC;
BEGIN
  SELECT COUNT(*),
         COUNT(*) FILTER (WHERE validacao_tipo = 'confirma')
    INTO v_total, v_confirm
    FROM reporte_validacoes
   WHERE reporte_id = v_reporte_id;

  v_taxa := CASE WHEN v_total = 0 THEN 0 ELSE v_confirm::NUMERIC / v_total END;

  UPDATE reportes SET
    -- coluna é numeric(4,2): guarda a fração 0.00–1.00
    reporte_score_confianca = ROUND(v_taxa, 2),
    reporte_status = CASE
      -- status finais: um voto atrasado não "ressuscita" o reporte
      WHEN reporte_status::text IN ('resolvido', 'expirado') THEN reporte_status
      WHEN v_total >= v_min_votos AND v_taxa >= 0.7 THEN 'validado'::status_reporte
      WHEN v_total >= v_min_votos AND v_taxa <  0.3 THEN 'rejeitado'::status_reporte
      ELSE 'pendente'::status_reporte
    END
  WHERE id = v_reporte_id;

  RETURN NULL;
END;
$$;
```

**6. Job agendado**
```sql
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- A cada 15 minutos
SELECT cron.schedule(
  'expirar-reportes',
  '*/15 * * * *',
  $$ UPDATE public.reportes
        SET reporte_status = 'expirado'
      WHERE reporte_status IN ('pendente', 'validado')
        AND reporte_expira_em < NOW() $$
);

SELECT cron.schedule(
  'expirar-alertas',
  '*/15 * * * *',
  $$ UPDATE public.alertas
        SET alerta_status = 'expirado'
      WHERE alerta_status = 'ativo'
        AND alerta_expira_em IS NOT NULL
        AND alerta_expira_em < NOW() $$
);

-- Conferir: SELECT jobname, schedule, active FROM cron.job;
-- Últimas execuções: SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 5;
```

> Rodar `cron.schedule` de novo com o mesmo nome atualiza o job (não duplica).

**7. Testes** (desfazem tudo no final)

a) O job expira um reporte vencido:
```sql
DO $$
DECLARE
  v_id UUID := 'COLE_O_ID_DE_UM_REPORTE';
  v_status TEXT;
BEGIN
  UPDATE reportes SET reporte_expira_em = NOW() - INTERVAL '1 minute' WHERE id = v_id;
  -- mesmo UPDATE do job
  UPDATE reportes SET reporte_status = 'expirado'
   WHERE id = v_id AND reporte_status IN ('pendente', 'validado') AND reporte_expira_em < NOW();
  SELECT reporte_status INTO v_status FROM reportes WHERE id = v_id;
  RAISE EXCEPTION 'Resultado: %', v_status;   -- esperado: expirado
END $$;
```

b) O **dono**, logado pelo app, **não** consegue alterar a validade nem o status:
```sql
BEGIN;
-- Simula o app: papel authenticated + login do DONO do reporte
-- (sem o "sub", auth.uid() fica nulo e a RLS bloqueia antes do trigger, e o teste não provaria nada)
SET LOCAL ROLE authenticated;
SELECT set_config(
  'request.jwt.claims',
  json_build_object('sub', (SELECT perfil_id FROM public.reportes WHERE id = 'COLE_O_ID_DE_UM_REPORTE'), 'role', 'authenticated')::text,
  true
);

UPDATE public.reportes
   SET reporte_expira_em = NOW() + INTERVAL '10 years', reporte_status = 'validado'
 WHERE id = 'COLE_O_ID_DE_UM_REPORTE';

SELECT reporte_expira_em, reporte_status FROM public.reportes WHERE id = 'COLE_O_ID_DE_UM_REPORTE';
ROLLBACK;
```
Esperado: o UPDATE afeta **1 linha** (a RLS deixou, porque é o dono), mas o SELECT mostra os valores **antigos**: quem barrou foi a proteção de colunas. Se aparecer "10 years" ou `validado`, o bloco 4 não foi aplicado.

---

## Anexo B — Testes manuais com duas contas

Criar a **Conta A** e a **Conta B**. Marcar cada teste quando passar.

| # | Ação | Resultado esperado | OK |
|---|------|--------------------|----|
| 1 | A cria um reporte | Aparece no Mapa de A e de B (se estiver dentro do raio) | [ ] |
| 2 | A abre o próprio reporte pelo **Mapa** | Vê "Editar Reporte" e **não** vê Confirmar/Contestar | [ ] |
| 3 | B abre o reporte de A pelo **Mapa** | **Não** vê "Editar Reporte" e vê Confirmar/Contestar | [ ] |
| 4 | B confirma o reporte de A | Score atualiza na tela de B | [ ] |
| 5 | B troca o voto para Contestar | Score recalcula e não duplica o voto | [ ] |
| 6 | Com `v_min_votos` votos de confirmação | Status vira "validado" | [ ] |
| 7 | A tenta mudar o próprio score (via `updateReport` adulterado ou SQL Editor como A) | Valor não muda | [ ] |
| 8 | B tenta editar ou excluir o reporte de A | Bloqueado (0 linhas afetadas) | [ ] |
| 9 | B tenta `UPDATE perfil SET perfil_nome_completo='Invasor' WHERE id = '<A>'` | 0 linhas afetadas | [ ] |
| 10 | A tenta `UPDATE perfil SET perfil_trust_score = 100 WHERE id = '<A>'` | Valor não muda | [ ] |
| 11 | A abre uma notificação não lida, sai e volta | Aparece como lida, inclusive depois de reiniciar o app | [ ] |
| 12 | A muda o raio para 1 km | Marcadores fora do raio somem e os contadores atualizam | [ ] |
| 13 | Desligar a internet e abrir o Mapa | Clima mostra "indisponível" e nada fake é gravado em `dados_climaticos` | [ ] |
| 14 | Mapa aberto por 1 min (com log de debug) | Sem loop de requisições | [ ] |
| 15 | Criar reporte da categoria "Via bloqueada" | Salva sem erro | [ ] |
| 16 | Inserir alerta `critico` perto de A | Home mostra risco CRÍTICO e A recebe notificação | [ ] |
| 17 | Deslogado, chamar a API REST de `perfil` com a anon key | Nenhuma linha retornada | [ ] |
| 18 | B confirma com comentário; depois contesta sem escrever nada | O comentário antigo some (não fica "contesta" + texto de confirmação) | [ ] |
| 19 | A envia o 6º reporte em menos de 1 hora | Bloqueado, com mensagem amigável | [ ] |
| 20 | 3 contas diferentes denunciam o reporte de A | Some do Mapa das outras contas; A ainda vê no Histórico | [ ] |
| 21 | A tenta denunciar o próprio reporte | Bloqueado | [ ] |
| 22 | Criar reporte novo | Só a câmera aparece como opção de foto | [ ] |
| 23 | B, C e D confirmam o reporte de A (3 votos, 100%) | Status vira "validado" e aparece um alerta **da comunidade** no Mapa de todos (toast "Novo alerta") | [ ] |
| 24 | Mais 2 contas contestam (3 de 5 = 60%, abaixo dos 70%) | O status volta a "pendente" e o alerta some do Mapa (`cancelado`) | [ ] |
| 25 | Uma das contas troca o voto para confirmar (4 de 5 = 80%) | O **mesmo** alerta volta (sem duplicar: 1 linha em `alertas` para esse reporte) | [ ] |
| 26 | O reporte validado é ocultado por 3 denúncias | O alerta ligado é cancelado | [ ] |
| 27 | O reporte é marcado como resolvido (pelo SQL Editor, se o app ainda não tiver essa opção) | O alerta ligado vira `expirado` | [ ] |
| 28 | Criar um reporte de "bloqueio de via" e conferir no Table Editor | `reporte_expira_em` = criação + 4 h | [ ] |
| 29 | Esperar o job (ou rodar o teste A.11.7a) com um reporte vencido | Status vira `expirado`; some do Mapa e da Home, mas continua no Histórico do dono com o selo "Expirado" | [ ] |
| 30 | Votar num reporte expirado (por outra tela aberta) | O status continua `expirado` (não volta para pendente) | [ ] |
| 31 | Reporte validado com alerta colaborativo expira | O alerta ligado vira `expirado` e some do Mapa | [ ] |
| 32 | Tentar alterar `reporte_expira_em` pela API (teste A.11.7b) | Valor não muda | [ ] |

> Para testar como um usuário específico no SQL Editor do Supabase, use a opção de "impersonate"/role do próprio editor, ou faça os testes pelo app com as duas contas.
