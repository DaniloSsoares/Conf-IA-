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

- [ ] Criar `supabase/migrations/`
- [ ] Exportar o schema atual (Dashboard → Database → ou `supabase db dump` com a CLI) para `supabase/migrations/0001_schema_inicial.sql`
- [ ] Cada mudança nova vira um arquivo numerado (`0002_validacoes.sql`, `0003_protecao_colunas.sql`, …)

### 1.2 🔴 Completar a RLS de `reporte_validacoes`

**Estado atual (conferido em 26/10):** a tabela já existe, com `UNIQUE (reporte_id, perfil_id)`, e já tem as policies `validacoes_insert_own` (vota como si mesmo e não no próprio reporte) e `validacoes_select_all`.

**Problema:** não há policy de **UPDATE** nem de **DELETE**. O `upsert` usado para trocar o voto vai falhar por RLS, e o usuário não consegue retirar o voto.

- [ ] Criar as policies de UPDATE e DELETE ([Anexo A.2](#a2-policies-que-faltam-em-reporte_validacoes))

### 1.3 🔴 Trigger de score (corrigido)

**Estado atual (conferido em 26/10):** o trigger **não existe**. Os únicos triggers no banco são os de `updated_at` (`trg_alertas_updated`, `trg_areas_risco_updated`, `trg_reportes_updated`). Ou seja, mesmo com votos, o score e o status nunca mudam.

**Problema no plano anterior:** o trigger fazia `UPDATE reportes` como o usuário que votou. Como o reporte é de outra pessoa, a RLS bloqueia o UPDATE **sem dar erro** e o score nunca muda. Ele também não tratava `DELETE` e usava os valores `confirmar`/`contestar`, mas o enum é `confirma`/`contesta`.

- [ ] Criar a função com `SECURITY DEFINER` + `SET search_path = public` e trigger em `INSERT OR UPDATE OR DELETE` ([Anexo A.3](#a3-trigger-de-recálculo-de-score))
- [ ] Deixar o mínimo de votos numa variável (`v_min_votos`). Para a demo, usar 3, para não depender de 5 contas

### 1.4 🔴 Proteger score e status contra edição pelo cliente

**Problema:**
- [src/shared/service/profileService.ts](../src/shared/service/profileService.ts) aceita `perfil_trust_score` no `updateProfile`. Qualquer usuário consegue mandar score 100 para si mesmo
- **Confirmado:** a policy `reportes_updates_own` deixa o dono editar a linha inteira. Ele consegue mudar `reporte_score_confianca` e `reporte_status` do próprio reporte, ou seja, se autovalidar. O mesmo vale para `perfil_trust_score` (policy de UPDATE do próprio perfil)

**Fazer:**
- [ ] Remover `perfil_trust_score` do `Pick` em `updateProfile`
- [ ] Criar triggers `BEFORE INSERT/UPDATE` que ignoram esses campos quando vêm do cliente ([Anexo A.4](#a4-proteção-de-colunas-sensíveis))
- [ ] Testar pelo app ou pelo SQL Editor com usuário autenticado ([Anexo B](#anexo-b--testes-manuais-com-duas-contas))

### 1.5 🟡 `ViewHistory` buscando dados pelo `id`

**Arquivos:** [src/features/History/ViewHistory/index.tsx](../src/features/History/ViewHistory/index.tsx), [src/shared/service/reportService.ts](../src/shared/service/reportService.ts), [src/features/Maps/index.tsx](../src/features/Maps/index.tsx)

**Problema:** a tela recebe o objeto inteiro como JSON nos params. Isso causa três coisas:
- pelo Mapa a foto não aparece, porque `getActiveReports` faz `select("*")` sem `reporte_midias`
- depois de votar, o score mostrado fica desatualizado
- os dados podem estar velhos

**Fazer:**
- [ ] Criar `getReportById(id)` em `reportService.ts` com `select("*, reporte_midias(*)")`
- [ ] Navegar passando só `{ type, id }` (Mapa e Histórico)
- [ ] O `ViewHistory` busca o reporte ao montar e mostra um loading enquanto isso
- [ ] Manter o `data` nos params só como fallback, durante a transição

### 1.6 🔴 Botões Confirmar / Contestar

**Arquivos:** `reportService.ts` + `ViewHistory/index.tsx` + `ViewHistory/styles.ts`

- [ ] `voteReport(reportId, userId, voto: 'confirma' | 'contesta', comentario?)` com `upsert` e `onConflict: 'reporte_id,perfil_id'` (a constraint UNIQUE já existe)
- [ ] Tipo `TipoValidacao = 'confirma' | 'contesta'` em `src/shared/types/report.ts`
- [ ] `getMyVote(reportId, userId)`, para mostrar qual botão o usuário já escolheu
- [ ] Os botões aparecem só quando `!isOwner`
- [ ] Destacar o botão do voto atual; permitir trocar o voto
- [ ] Desabilitar enquanto a requisição está em andamento (evita clique duplo)
- [ ] Depois de votar, buscar o reporte de novo e atualizar score e status
- [ ] Mostrar o score como barra de progresso (melhoria C do plano anterior, esforço baixo e bom visualmente)
- [ ] Toast de sucesso ou erro

### 1.7 🟡 Comentários nos reportes (se sobrar tempo nesta semana)

`reporte_validacoes` já tem a coluna `validacao_comentario`. Para o MVP, o comentário vai **junto com o voto** ("Confirmo, a rua está alagada até o joelho"). Não precisa de tabela nova.

- [ ] Campo de texto opcional ao confirmar ou contestar
- [ ] Limite de tamanho (`CHECK (char_length(validacao_comentario) <= 500)`, no [Anexo A.2](#a2-policies-que-faltam-em-reporte_validacoes))
- [ ] Lista dos votos com comentário no `ViewHistory` (ícone ✓/✗, texto, data). Para mostrar o nome de quem comentou, usar a view `perfil_publico` ([Anexo A.5](#a5-lgpd-perfil-visível-para-todos))
- [ ] Pós-MVP: tabela `reporte_comentarios` separada, se quiserem comentários sem voto

---

## Fase 2 — Mapa e clima (02/11 a 08/11)

### 2.1 🟡 Filtro por raio no servidor (bounding box)

**Arquivos:** `reportService.ts`, `useMapData.ts`

Hoje o app baixa **todos** os reportes e alertas do banco e só filtra no cliente.

- [ ] `getActiveReports(bounds?)` com `.gte/.lte` em latitude e longitude
  - `deltaLat = raioKm / 111`
  - `deltaLng = raioKm / (111 * Math.cos(lat * Math.PI / 180))`
- [ ] Mesma coisa na query de `alertas`
- [ ] Manter o Haversine no cliente para refinar (o bounding box é um quadrado, o raio é um círculo)

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
- [ ] **Filtro de alertas pelo raio do alerta:** `alertas` tem `alerta_raio_km`, e o filtro atual só considera o centro do alerta. Um alerta de 10 km com centro a 7 km do usuário não aparece, mesmo cobrindo a posição dele. Trocar por `haversineKm(...) <= raioKm + Number(a.alerta_raio_km ?? 0)`
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

- [ ] Remover a URL e a chave do Supabase comentadas em [src/config/supabase.tsx](../src/config/supabase.tsx) (é uma chave pública, mas pega mal)
- [ ] Mostrar um erro claro se `EXPO_PUBLIC_SUPABASE_URL` estiver vazia, em vez de `|| ''` falhando em silêncio
- [ ] Remover a pasta `app-example/` e o script `reset-project` do `package.json`
- [ ] Revisar `src/shared/utils/examples.tsx` (remover se não for usado)
- [ ] Criar `.env.example` com os nomes das variáveis, sem valores

### 3.7 🔵 CI no GitLab

- [ ] `.gitlab-ci.yml` com `npm ci`, `npx tsc --noEmit` e `npx expo lint`
- [ ] Corrigir os erros de tipo e lint que aparecerem
- [ ] Opcional: teste unitário de `haversineKm` (ex.: São Paulo → Rio ≈ 360 km)

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

```sql
-- Trocar o voto (necessária para o upsert)
CREATE POLICY "validacoes_update_own" ON public.reporte_validacoes
  FOR UPDATE TO authenticated
  USING (auth.uid() = perfil_id)
  WITH CHECK (auth.uid() = perfil_id);

-- Retirar o voto
CREATE POLICY "validacoes_delete_own" ON public.reporte_validacoes
  FOR DELETE TO authenticated
  USING (auth.uid() = perfil_id);

-- Limite de tamanho do comentário do voto
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
    reporte_score_confianca = ROUND(v_taxa * 100),
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
    NEW.perfil_trust_score := 50;  -- ajustar para o valor inicial definido no projeto
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

> ⚠️ O valor `50` precisa ser igual ao `DEFAULT` da coluna `perfil_trust_score`. Confira no Table Editor antes de rodar.
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
CREATE OR REPLACE VIEW public.perfil_publico AS
  SELECT id, perfil_nome_completo, perfil_avatar_url
  FROM public.perfil;

REVOKE ALL ON public.perfil_publico FROM anon;
GRANT SELECT ON public.perfil_publico TO authenticated;
```

> A view roda com permissão do dono (padrão do Postgres), então ignora a RLS de `perfil`, mas só expõe as 3 colunas acima.

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

> Para testar como um usuário específico no SQL Editor do Supabase, use a opção de "impersonate"/role do próprio editor, ou faça os testes pelo app com as duas contas.
