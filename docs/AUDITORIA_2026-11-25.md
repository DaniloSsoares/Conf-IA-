# Auditoria do Conf-IA — 25/11/2026

> Revisão completa do código da `main` (commit `d26ffe5`, depois do PR #14) e do banco (migrations em `supabase/migrations/`), procurando erros de lógica, bugs, problemas de desempenho, de segurança e funcionalidades que faltam.

## Como foi feita

- **Leitura do código inteiro** das telas, hooks, services, utilitários e de todas as funções, triggers e policies do banco.
- **Checagens automáticas:** `npm run typecheck` (passa, 0 erros) e `npx eslint src` (0 erros, **43 avisos**).
- **Simulação dos fluxos** no papel: o que acontece em cada caminho (voto, edição, exclusão, expiração, notificação, login).
- **Limite:** esta auditoria é **estática**, sem rodar o app no celular. Os itens marcados com "conferir no app" precisam ser confirmados na prática.

**Legenda de gravidade:**
- 🔴 **Alta:** quebra uma funcionalidade, mostra informação errada ou fere uma promessa (termos, LGPD, pitch)
- 🟠 **Média:** comportamento errado em casos específicos, ou impacto perceptível no desempenho
- 🟡 **Baixa:** acabamento, código, casos raros

**Esforço:** ⏱️ até 30 min · ⏱️⏱️ até 2 h · ⏱️⏱️⏱️ mais de 2 h

---

## Resumo

| Área | 🔴 Alta | 🟠 Média | 🟡 Baixa |
|---|---|---|---|
| 1. Bugs de lógica e funcionalidade | 6 | 6 | 4 |
| 2. Banco, segurança e LGPD | 2 | 4 | 2 |
| 3. Desempenho | 1 | 5 | 2 |
| 4. UX e acessibilidade | 1 | 3 | 3 |
| 5. Qualidade de código | 0 | 1 | 4 |

### ⭐ Os 8 para corrigir antes da banca (sábado)

São os que aparecem na demo ou que a banca pode perceber, e todos são rápidos:

| # | Item | Esforço |
|---|---|---|
| 1 | [B1](#b1) Tocar num alerta da Home abre a tela de **Reportar** | ⏱️ |
| 2 | [B2](#b2) O app pede login **toda vez** que abre (a sessão salva não é usada) | ⏱️⏱️ |
| 3 | [B3](#b3) A Home calcula o "nível de risco" com alertas e reportes **do país inteiro** | ⏱️⏱️ |
| 4 | [B4](#b4) Excluir um reporte validado deixa o **alerta da comunidade ativo** no mapa | ⏱️ |
| 5 | [B5](#b5) Dá para votar num reporte **vencido** e ele vira um alerta "novo" | ⏱️ |
| 6 | [B6](#b6) Erro de rede no Mapa aparece como "nenhuma ocorrência" | ⏱️ |
| 7 | [U1](#u1) A Intro promete **"IA integrada"** e **áreas de risco**, que não existem | ⏱️ |
| 8 | [B9](#b9) "Esqueceu a senha?" e [B10](#b10) "Excluir Minha Conta" não fazem nada | ⏱️ (esconder) |

---

## 1. Bugs de lógica e funcionalidade

### <a id="b1"></a>B1 🔴 Tocar num alerta da Home abre a tela de Reportar ⏱️ · ✅ **corrigido** (`fix/home-alertas-sessao`)
- **Onde:** [Home/index.tsx:724](../src/features/Home/index.tsx#L724) e [:750](../src/features/Home/index.tsx#L750) chamam `navigation.navigate('Alerts')`. O "tradutor" de rotas em [(tabs)/index.tsx:10](../src/app/(tabs)/index.tsx#L10) manda `'Alerts'` para **`/Report`**.
- **Cenário:** na Home, tocar em "Ver tudo" ou num card de alerta abre o formulário **"Reportar ocorrência"**, não o alerta.
- **Correção:** o card abre o alerta (`router.push({ pathname: '/(screens)/ViewHistory', params: { type: 'alerta', id: alert.id } })`); o "Ver tudo" abre o Mapa com o filtro de alertas, ou o Histórico. Atenção: na Home, quando não há alertas oficiais, os cards são **reportes** convertidos (ver B3), então o `type` precisa ser `'reporte'` nesse caso.

### <a id="b2"></a>B2 🔴 O app pede login toda vez que abre ⏱️⏱️ · ✅ **corrigido** (`fix/home-alertas-sessao`)
- **Onde:** [app/index.tsx:14](../src/app/index.tsx#L14) sempre manda para a Intro depois de 2,5 s, que manda para o Login. O Supabase **guarda a sessão** (`persistSession: true` em `config/supabase.tsx`), mas ninguém consulta.
- **Cenário:** o usuário faz login, fecha o app e abre de novo: precisa digitar e-mail e senha outra vez. Num app de alerta, isso faz a pessoa desistir de abrir.
- **Correção:** no `index.tsx`, chamar `supabaseConfig.auth.getSession()`; com sessão, ir direto para `/(tabs)`; sem sessão, para a Intro (ou direto para o Login, se a Intro já foi vista). De bônus, tira a espera fixa de 2,5 s.
- **Relacionado:** as abas `(tabs)` não verificam se há usuário logado. Um link direto abriria as telas sem sessão.

### <a id="b3"></a>B3 🔴 O "nível de risco" da Home usa o país inteiro ⏱️⏱️ · ✅ **corrigido** (`fix/home-alertas-sessao`)
- **Onde:** [Home/index.tsx:140-190](../src/features/Home/index.tsx#L140) busca **todos** os alertas ativos e chama `getActiveReports()` **sem caixa geográfica**.
- **Cenário:** um alerta "crítico" em outra cidade deixa a Home de todos os usuários em **"Risco crítico: alerta crítico na sua região!"**. O texto diz "na sua região", mas a conta não olha a região.
- **Correção:** usar a mesma lógica do Mapa: localização do usuário, `boundingBox` com o raio dele, filtro pelas categorias ativas e refinamento com `haversineKm`. O ideal é extrair isso para um hook compartilhado (`useAlertasProximos`) e usar nas duas telas.
- **Também:** quando não há alertas, a Home mostra **reportes** como se fossem alertas (título "Alagamento", descrição do morador). Isso mistura os dois conceitos que a banca vai ver separados no Mapa.

### <a id="b4"></a>B4 🔴 Excluir um reporte validado deixa o alerta ativo ⏱️
- **Onde:** a ligação `alertas.alerta_reporte_id` tem `ON DELETE SET NULL`, e o trigger `sincronizar_alerta_colaborativo` só roda em UPDATE. [`deleteReport`](../src/shared/service/reportService.ts#L181) apaga o reporte e o alerta fica **órfão e ativo** até vencer (6 h).
- **Cenário:** o dono exclui um reporte que já virou alerta; o alerta continua no mapa e nas notificações dos vizinhos, apontando para algo que não existe mais. (Foi exatamente o que apareceu na limpeza do banco em 14/11.)
- **Correção (banco):** um trigger `BEFORE DELETE ON reportes` que cancela o alerta ligado (`UPDATE alertas SET alerta_status = 'cancelado' WHERE alerta_reporte_id = OLD.id`).

### <a id="b5"></a>B5 🔴 Votar num reporte vencido cria um alerta "novo" ⏱️
- **Onde:** a validade (2.7 mínimo) só existe **no app** (filtro do Mapa). A votação ([ReporteDetails.tsx:122](../src/features/History/ViewHistory/components/ReporteDetails.tsx#L122)) só é bloqueada para `resolvido` e oculto.
- **Cenário:** um alagamento de 3 dias atrás, aberto pelo Histórico ou por uma notificação antiga, recebe o 3º voto → vira `validado` → o trigger cria um alerta **com validade de 6 h a partir de agora** → os vizinhos são notificados de uma ocorrência velha.
- **Correção rápida (app):** esconder a `VoteSection` quando `!reporteAindaValido(...)`, com o aviso "Este reporte expirou".
- **Correção completa (banco):** a versão completa da 2.7 (Anexo A.11), com o status `expirado` preservado pelo trigger de score.

### <a id="b6"></a>B6 🔴 Falha de rede aparece como "nenhuma ocorrência" ⏱️
- **Onde:** [`getActiveReports`](../src/shared/service/reportService.ts#L253), `fetchAlertas` e `getUserNotifications` devolvem lista vazia quando dá erro, sem avisar a tela.
- **Cenário:** sem internet (ou com o Supabase fora), o Mapa mostra "Todos (0)" e a Home mostra "Situação normal". **Num app de defesa civil, "sem dados" não pode parecer "sem perigo".**
- **Correção:** o service devolve `{ data, error }` (como já fazem `createReport` e `updateReport`), e a tela mostra um aviso "Não foi possível atualizar. Verifique sua conexão" em vez da lista vazia.

### B7 🟠 O realtime do Mapa traz de volta reportes vencidos, longe ou resolvidos ⏱️
- **Onde:** [useMapData.ts:275-292](../src/features/Maps/useMapData.ts#L275), o handler de UPDATE de `reportes`.
- **Cenário:** qualquer voto em qualquer reporte do país dispara um UPDATE; se ele não está na lista, o handler **adiciona** (`[...current, atualizado]`), sem conferir distância, validade nem status `resolvido`. Um reporte vencido que recebe um voto **reaparece** no mapa. (A distância é filtrada depois na tela, mas a validade e o `resolvido` não.)
- **Correção:** aplicar a mesma regra do `getActiveReports`: só mantém se `pendente`/`validado`, não oculto, `estaPerto(...)` e `reporteAindaValido(...)`. O mesmo vale para o UPDATE de `alertas` (conferir `alerta_expira_em`).

### B8 🟠 Editar um reporte validado não atualiza o alerta, e permite "mover" o reporte ⏱️⏱️
- **Onde:** o trigger do alerta só reage a `reporte_status` e `reporte_oculto`; a tela de edição deixa trocar categoria e localização de qualquer reporte do dono, mesmo depois dos votos.
- **Cenário:** um reporte validado de "alagamento na rua A" é editado para "fogo em mata na rua B". Os votos (que confirmaram a rua A) continuam valendo, e o alerta continua na rua A como alagamento.
- **Correção:** bloquear a edição de categoria e localização quando o reporte já tem votos (só a descrição e a foto), ou zerar os votos ao editar.

### <a id="b9"></a>B9 🟠 "Esqueceu a senha?" não faz nada ⏱️⏱️
- **Onde:** [Login/index.tsx:180](../src/features/Auth/Login/index.tsx#L180), `TouchableOpacity` sem `onPress`.
- **Correção:** `supabaseConfig.auth.resetPasswordForEmail(email)` + toast "Enviamos um link para o seu e-mail". Para a banca, se não der tempo: **esconder o botão**.

### <a id="b10"></a>B10 🟠 "Excluir Minha Conta" só mostra um toast ⏱️⏱️⏱️
- **Onde:** [Profile/index.tsx:178](../src/features/Profile/index.tsx#L178).
- **Problema:** o botão diz "Excluir", mostra "Tem certeza? Esta ação não pode ser desfeita." e não exclui nada. A LGPD garante o direito à exclusão, e os termos (seção 6) prometem atender o pedido.
- **Correção completa:** Edge Function com a chave de serviço que apaga o usuário do `auth.users` (o perfil e os dados vão junto em cascata) + confirmação com `Alert.alert`. **Para a banca:** esconder o botão, ou trocar o texto para "Solicitar exclusão dos dados" com o e-mail da equipe (que também falta nos termos, item 1.8 do plano).

### B11 🟠 O cadastro pode cair nas abas sem usuário logado ⏱️ (conferir no app)
- **Onde:** [Register/index.tsx](../src/features/Auth/Register/index.tsx), `executeCadastro` chama `router.replace("/(tabs)")` logo depois do `signUp`.
- **Cenário:** se a **confirmação de e-mail** estiver ligada no Supabase, o `signUp` não cria sessão. O app entra nas abas sem usuário: Home sem nome, Mapa sem perfil, e o aceite dos termos não é gravado.
- **Correção:** depois do `signUp`, conferir `data.session`; sem sessão, mostrar "Confirme seu e-mail para entrar" e ir para o Login.

### B12 🟠 Um erro nos termos depois do cadastro mostra "Erro inesperado" ⏱️
- **Onde:** mesmo `executeCadastro`: se o `createTerms()` falhar, o `catch` mostra "Erro inesperado", embora a conta **tenha sido criada**. A pessoa tenta de novo e recebe "usuário já existe".
- **Correção:** tratar o erro do `createTerms` separado (o aceite obrigatório no layout das abas já cobre o caso).

### B13 🟡 Tocar numa notificação com o app fechado pelo sistema não abre o alerta ⏱️
- **Onde:** `aoTocarNaNotificacao` usa só o listener; se o Android encerrou o app, o toque abre o app do zero e o listener não recebe esse toque.
- **Correção:** chamar também `Notifications.getLastNotificationResponseAsync()` ao montar.

### B14 🟡 O autor é notificado do próprio alerta ⏱️
- **Onde:** `gerar_notificacoes_alerta` notifica todos no raio, inclusive quem criou o reporte que virou alerta.
- **Correção:** excluir o `perfil_id` do reporte ligado (`alerta_reporte_id`) no `INSERT ... SELECT`.

### B15 🟡 O alerta da comunidade dura 6 h para qualquer categoria ⏱️
- **Onde:** `sincronizar_alerta_colaborativo` usa `NOW() + INTERVAL '6 hours'`, mas o reporte tem validade por categoria (4 h a 24 h).
- **Cenário:** uma via bloqueada validada na 3ª hora gera um alerta até a 9ª hora, mas o reporte some do mapa na 4ª. Um deslizamento validado perde o alerta antes do reporte.
- **Correção:** usar a mesma validade da categoria (a função `validade_reporte` do Anexo A.11).

### B16 🟡 A Home, o Perfil e o Mapa têm regras de localização diferentes ⏱️⏱️
- A Home pede permissão e GPS **a cada foco**; o Perfil busca GPS + geocodificação a cada foco se faltar cidade/estado; o Mapa usa a última posição conhecida. O usuário vê pedidos de permissão em momentos diferentes. Ver também D2.

---

## 2. Banco, segurança e LGPD

### S1 🔴 As fotos dos reportes são públicas por link ⏱️⏱️
- **Onde:** [`uploadReportPhoto`](../src/shared/service/reportService.ts#L38) usa `getPublicUrl`; o bucket `fotos-ocorrencia` funciona como **público**.
- **Problema:** qualquer pessoa com o link vê a foto, **sem login**, inclusive de reportes **ocultados por denúncia** (foto inadequada continua acessível). Contradiz a leitura "só para logados" do A.6.
- **Correção:** bucket privado + `createSignedUrl` (link que expira) na hora de exibir.

### S2 🔴 Três contas combinadas criam alertas e notificam um bairro inteiro ⏱️⏱️⏱️
- **Onde:** a validação aceita voto de **qualquer** usuário, de **qualquer lugar**, com conta criada **agora**.
- **Cenário:** uma pessoa cria 4 contas (o cadastro só pede e-mail), reporta um "deslizamento" falso e confirma com as outras 3. O alerta é criado e todos os moradores do raio são notificados.
- **Mitigações possíveis:** exigir que o votante esteja a até X km do reporte; limite de votos por hora; contas novas (menos de 24 h) não contam; mínimo de 5 votos em produção (já previsto). **Para a banca:** citar como limite conhecido e trabalho futuro. É uma pergunta provável.

### S3 🟠 Chave do OpenWeather exposta no app ⏱️⏱️
- `EXPO_PUBLIC_*` vai dentro do APK; qualquer um extrai a chave e gasta a cota. Correção: chamar o clima por uma Edge Function do Supabase (a chave fica no servidor).

### S4 🟠 O realtime e a consulta de reportes expõem o `perfil_id` do autor ⏱️⏱️
- `select("*")` e os eventos do realtime trazem o `perfil_id` de cada reporte. É um id (não o nome), mas permite ligar todos os reportes de uma mesma pessoa. Correção: selecionar só as colunas necessárias, ou uma view sem o `perfil_id`.

### S5 🟠 Fotos órfãs no Storage ⏱️⏱️
- Excluir um reporte, remover ou trocar a foto apagam só a linha de `reporte_midias`; o **arquivo** fica no Storage para sempre (não há policy de DELETE no bucket). Item 3.2 do plano.

### S6 🟠 Upload em pasta de outro usuário ⏱️
- A policy de INSERT do bucket `fotos-ocorrencia` só confere o bucket, não a pasta. Um usuário consegue gravar arquivos em `<id-de-outro-usuario>/`. Correção: a mesma checagem do bucket de avatares (`auth.uid() = foldername(name)[1]`).

### S7 🟡 Proteção de colunas pela profundidade do trigger ⏱️⏱️
- `protect_reporte_columns` e `protect_perfil_trust_score` usam `pg_trigger_depth() = 1`. Funciona hoje, mas bloquearia um job agendado (versão completa da 2.7). O Anexo A.11 já tem a versão pelo papel (`current_user IN ('authenticated','anon')`).

### S8 🟡 `perfil_trust_score` é exibido, mas nunca muda ⏱️⏱️⏱️
- A Home mostra "Score: 100 pts" (valor padrão do código) e o Perfil mostra "Reputação: 0 pontos" (valor do banco). Nenhuma regra atualiza a pontuação. Ou esconder, ou implementar (ver F8).

---

## 3. Desempenho

### D1 🔴 A Home busca todos os alertas e reportes do país a cada foco ⏱️⏱️ · ✅ **corrigido** (`fix/home-alertas-sessao`)
- Mesmo problema do B3, do lado do desempenho: com muitos usuários, cada abertura da Home baixa a tabela inteira. Resolvido junto com o B3.

### D2 🟠 GPS e clima repetidos a cada troca de aba ⏱️⏱️
- A Home chama `getCurrentPositionAsync` (lento: 1 a 10 s) e a API de clima **a cada foco**; o Mapa busca o clima de novo, separado. Correção: guardar a localização e o clima num contexto compartilhado e só atualizar se tiver passado alguns minutos.

### D3 🟠 `auth.getUser()` faz uma chamada de rede em quase toda tela ⏱️⏱️
- `getUser()` consulta o servidor de autenticação a cada uso (Home, Mapa, Perfil, Histórico, Reportar, Editar...). `getSession()` lê da memória. Correção: um `AuthContext` com o usuário da sessão, usado por todas as telas (o `useCurrentUser` já é um começo).

### D4 🟠 Fotos enviadas em tamanho original ⏱️⏱️
- [photoPicker.ts:56](../src/shared/utils/photoPicker.ts#L56) usa `quality: 0.7`, mas não reduz a resolução: uma foto de câmera moderna vai com 3 a 6 MB, em base64 (mais 33%). No 4G, o envio demora e pode falhar. Correção: `expo-image-manipulator` para 1280 px de largura antes do upload.

### D5 🟠 Histórico sem paginação ⏱️⏱️
- [History/index.tsx:31](../src/features/History/index.tsx#L31) carrega **todas** as notificações (com o alerta junto) e **todos** os reportes do usuário a cada foco. Com o tempo, a tela fica lenta. Correção: `.range(0, 19)` + carregar mais ao rolar.

### D6 🟠 O realtime do Mapa escuta a tabela inteira ⏱️⏱️⏱️
- Todo INSERT/UPDATE de `reportes` e `alertas` do país chega em todos os celulares com o Mapa aberto (o filtro por distância é feito depois, no app). Funciona no MVP; não escala. Futuro: canais por região (ex.: por cidade) ou broadcast via Edge Function.

### D7 🟡 Espera fixa de 2,5 s na abertura ⏱️ · ✅ **corrigido** (`fix/home-alertas-sessao`)
- [app/index.tsx:14](../src/app/index.tsx#L14): o app sempre espera 2,5 s antes de seguir. Resolvido junto com o B2.

### D8 🟡 O mapa não acompanha o movimento do usuário ⏱️⏱️
- A localização do Mapa é buscada uma vez. Quem está se deslocando (de carro, de ônibus) vê os reportes do ponto onde abriu o app. Correção: `watchPositionAsync` com distância mínima de 200 m.

---

## 4. UX e acessibilidade

### <a id="u1"></a>U1 🔴 A Intro promete o que o app não faz ⏱️
- **Onde:** [Intro/index.tsx](../src/features/Auth/Intro/index.tsx), slides "Mapa de Riscos" ("visualize em tempo real as áreas de risco com classificação por nível de gravidade") e **"Análise Inteligente" ("IA integrada analisa dados climáticos para prever riscos com antecedência")**.
- **Problema:** as áreas de risco (2.5) foram cortadas e não há IA. É a primeira tela que a banca vê, e a pergunta "onde está a IA?" já estava prevista no plano.
- **Correção:** trocar os textos pelo que existe: "Mapa de ocorrências por nível de risco" e "Validação pela comunidade: reportes confirmados viram alertas para os vizinhos".

### U2 🟠 Marcadores sobrepostos no mesmo ponto ⏱️⏱️
- Um reporte validado e o alerta que nasce dele ficam **exatamente** no mesmo lugar (e o "você está aqui", se o reporte foi feito ali). Só um aparece; o filtro mostra "Todos (3)". Correção: não mostrar o reporte quando já existe um alerta ligado a ele (`alerta_reporte_id`), ou deslocar levemente.

### U3 🟠 Texto da aba com 8 px ⏱️
- [CustomTabBar/styles.ts:68](../src/components/layout/CustomTabBar/styles.ts#L68): `fontSize: 8` é ilegível para muita gente (o mínimo recomendado é por volta de 11–12). Público de defesa civil inclui idosos.

### U4 🟠 Botões só com ícone, sem descrição para leitor de tela ⏱️⏱️
- Recentralizar o mapa, fechar o card de prévia, filtros, voltar: sem `accessibilityLabel`. O TalkBack lê só "botão".

### U5 🟡 Nomes diferentes para a mesma categoria ⏱️
- "Via bloqueada" (reportar, mapa) e "Bloqueio de via" (preferências do Perfil).

### U6 🟡 Sem aviso de "sem conexão" ⏱️⏱️
- Ver B6. Uma faixa "Sem internet" (via `@react-native-community/netinfo`) explicaria por que nada carrega.

### U7 🟡 Erros silenciosos ⏱️
- Vários fluxos só fazem `console.error` (ex.: foto que falha depois do reporte criado: o usuário vê "Reporte enviado!" e o reporte fica sem foto).

---

## 5. Qualidade de código

- 🟠 **43 avisos de lint**, entre eles imports sem uso (`Alert`, `Modal`, `ImagePicker`, `StyleSheet`...), variáveis sem uso e um `useCallback` sem a dependência `router` (Perfil). Rodar `npx eslint src --fix` e limpar à mão o resto. ⏱️
- 🟡 **Rotas inexistentes no layout raiz:** [app/_layout.tsx:12-18](../src/app/_layout.tsx#L12) declara `features/SplashScreen/index`, `features/Home/index` etc., que não são rotas. O expo-router gera avisos no console. ⏱️
- 🟡 **Código morto:** `src/shared/utils/examples.tsx` (394 linhas, não usado), pasta `app-example/`, o fallback para a tabela `alertas_notificacoes` (que não existe), o `navigationShim` da Home (usar `router` direto). ⏱️
- 🟡 **Tipos `any`:** `alerts: any[]`, `profile: any`, `selectedItem: any` (item 3.5 do plano). ⏱️⏱️
- 🟡 **Sem testes automatizados** e sem `ErrorBoundary`: um erro de renderização derruba o app inteiro em tela branca. ⏱️⏱️

---

## 6. O que falta (prometido vs. implementado)

| Promessa | Onde é prometida | Situação |
|---|---|---|
| Áreas de risco no mapa | Intro, pitch, plano 2.5 | ❌ Tabela vazia, cortado em 15/11 |
| IA que prevê riscos (`sistema_ia`) | Intro, nome do app | ❌ Não existe |
| Excluir a conta / pedir exclusão dos dados | Termos (seção 6), botão no Perfil | ❌ Botão sem ação; sem e-mail de contato nos termos |
| Recuperar senha | Botão no Login | ❌ Sem ação |
| Reputação / trust score | Home, Perfil | ❌ Valor fixo |
| Notificação com o app fechado (push) | — | ❌ Só local, com o app aberto ou recém-minimizado |
| Marcar o próprio reporte como "resolvido" | Status existe no banco | ❌ Sem botão no app |
| Expiração automática no banco | Plano 2.7 completo | ⚠️ Só o filtro do app (versão mínima) |

---

## 7. Funcionalidades interessantes (sugestões)

Ordenadas por **valor para o usuário ÷ esforço**:

| # | Funcionalidade | Por quê | Esforço |
|---|---|---|---|
| F1 | **Botão de emergência** (ligar 199 Defesa Civil / 193 Bombeiros) na Home | Os termos já citam os números; é o tipo de coisa que a banca valoriza num app de defesa civil | ⏱️ |
| F2 | **"Já foi resolvido"** para o dono do reporte | Tira do mapa o que acabou antes da validade; o status já existe e o trigger já encerra o alerta | ⏱️⏱️ |
| F3 | **"Ainda está acontecendo?"**: uma confirmação renova a validade | Reportes reais continuam visíveis enquanto a comunidade confirma (decisão em aberto no plano 2.7) | ⏱️⏱️ |
| F4 | **Filtro por categoria no Mapa** | Hoje só há Todos/Alertas/Ocorrências | ⏱️⏱️ |
| F5 | **Link do alerta da comunidade para o reporte de origem** | Na tela do alerta, "Ver o reporte e os comentários" | ⏱️ |
| F6 | **Foto em tela cheia** (toque para ampliar) | Evidência é o ponto forte do reporte | ⏱️ |
| F7 | **Compartilhar** um alerta (WhatsApp) | Alcança quem não tem o app; `Share` nativo | ⏱️ |
| F8 | **Reputação real**: +pontos quando o seu reporte é validado, −pontos quando é rejeitado; votos de quem tem mais reputação pesam mais | Fecha o S2 e dá sentido ao trust score já exibido | ⏱️⏱️⏱️ |
| F9 | **Painel web da Defesa Civil** para emitir alertas oficiais | Hoje alerta oficial só existe se alguém inserir no banco | ⏱️⏱️⏱️ |
| F10 | **Alertas automáticos por clima** (INMET/CEMADEN, ou chuva acima de X mm/h) | É o `sistema_ia` / a "IA" do nome | ⏱️⏱️⏱️ |
| F11 | **Push com o app fechado** (FCM + Edge Function) | Completa as notificações | ⏱️⏱️⏱️ |
| F12 | **Modo offline**: últimos alertas e reportes em cache | Em enchente, a internet costuma cair | ⏱️⏱️⏱️ |
| F13 | **Mapa de calor** dos reportes por região e período | Análise para a Defesa Civil | ⏱️⏱️ |
| F14 | **Rota segura**: avisar se o trajeto passa por uma ocorrência ativa | Diferencial forte, mas grande | ⏱️⏱️⏱️ |
| F15 | **Agrupar marcadores** próximos (clustering) | Resolve o U2 e o desempenho com muitos reportes | ⏱️⏱️ |

---

## 8. Sugestão de ordem

**Até sábado (banca), só o que é rápido e visível:** B1, U1, B5 (versão app), B6, B4 (trigger), e esconder os botões de B9 e B10. Depois, se sobrar tempo: B2 e B3.

**Depois da banca (até a defesa final):** S1, S2 (pelo menos a distância para votar), B7, B8, D2–D5, F1, F2, F5, F6, e a versão completa da 2.7.

**Trabalho futuro (citar na apresentação):** F8–F14, D6, S3.
