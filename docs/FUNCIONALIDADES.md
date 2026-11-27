# Conf-U: funcionalidades, regras de negócio e banco de dados

> Documento de referência do que está **implementado** no projeto até 26/11/2026: o aplicativo, o banco de dados e as regras de negócio. O que ainda não existe está na seção 9 (limitações e trabalho futuro).
>
> Referências complementares: `docs/PLANO_DESENVOLVIMENTO.md` (plano, decisões e SQL de referência), `docs/AUDITORIA_2026-11-25.md` (auditoria e correções) e `docs/ROTEIRO_TESTES_CORRECOES.md` (roteiro de testes).

---

## Sumário

1. [Visão geral](#1-visão-geral)
2. [Arquitetura](#2-arquitetura)
3. [Funcionalidades por tela](#3-funcionalidades-por-tela)
4. [Regras de negócio](#4-regras-de-negócio)
5. [Banco de dados](#5-banco-de-dados)
6. [Segurança e LGPD](#6-segurança-e-lgpd)
7. [Integrações externas](#7-integrações-externas)
8. [Qualidade, processo e entrega](#8-qualidade-processo-e-entrega)
9. [Limitações conhecidas e trabalho futuro](#9-limitações-conhecidas-e-trabalho-futuro)

---

## 1. Visão geral

O **Conf-U** é um aplicativo móvel de **prevenção e resposta a desastres climáticos**, voltado à Defesa Civil e aos moradores. O ciclo central é:

```
cidadão reporta → comunidade valida → o reporte vira alerta → os vizinhos são notificados
```

- **Quem usa:** moradores (reportam, votam, recebem alertas). Os alertas oficiais da Defesa Civil já são suportados pelo banco, mas ainda não há tela de emissão (ver seção 9).
- **Plataforma:** Android (APK) e Expo Go. O código também é compatível com iOS.

---

## 2. Arquitetura

### 2.1 Tecnologias

| Camada | Tecnologia |
|---|---|
| Aplicativo | React Native 0.81 + Expo SDK 54 (Nova Arquitetura), TypeScript |
| Navegação | Expo Router (rotas por arquivos) |
| Formulários e validação | React Hook Form + Yup |
| Mapa | react-native-maps 1.20.1 (Google Maps) |
| Localização | expo-location (GPS, última posição conhecida, geocodificação reversa do próprio celular) |
| Fotos | expo-image-picker + expo-image-manipulator (redução para 1280 px) |
| Notificações | Supabase Realtime + expo-notifications (notificações locais) |
| Área de transferência | expo-clipboard (números de emergência) |
| Backend | Supabase: PostgreSQL, Auth, Storage, Realtime |
| Clima | WeatherAPI e OpenWeather |
| CI/CD | GitHub Actions (CI: tipos, lint, varredura de segredos; CD: APK por tag) |

### 2.2 Organização do código

```
src/
├── app/                  Rotas (Expo Router)
│   ├── index.tsx         Abertura: decide entre o app (sessão salva) e a Intro
│   ├── (auth)/           Intro, Login, Cadastro
│   ├── (tabs)/           Home, Mapa, Reportar, Histórico, Perfil (+ termos obrigatórios e notificações)
│   └── (screens)/        Detalhes (ViewHistory), Editar Reporte, Editar Perfil
├── features/             Telas, com estilos, hooks e componentes próprios
│                         (ex.: Maps/useMapData.ts, Home/components/NumerosEmergencia.tsx)
├── components/
│   ├── layout/           Barra de abas (com o contador de não lidas), toasts
│   └── ui/               Modais reutilizáveis: termos, ajuda, troca de senha, origem da foto,
│                         confirmação (ConfirmModal), carregamento, campo de texto, botão voltar
└── shared/
    ├── service/          Acesso ao banco (reportService, profileService, alertaNotificationService,
    │                     termsService, denunciaService, weatherService)
    ├── hooks/            useCurrentUser, useNotificacoesRealtime
    ├── utils/            haversine, proximidade, endereco, photoPicker, notificacoesLocais, erros
    ├── constants/        Regras em forma de dados: categorias, risco, validade, alertas, paginação,
    │                     emergência, tema
    └── types/            Tipos TypeScript (reporte, alerta, perfil, clima, foto)
supabase/migrations/      Esquema do banco versionado em SQL
scripts/                  supabase-remote.sh (CLI do Supabase contra o banco remoto)
docs/                     Plano, auditoria, roteiro de testes, CI/CD, comandos, este documento
```

### 2.3 Princípios de projeto

- **A lógica crítica fica no banco, não no aplicativo.** O score, o status do reporte, a criação do alerta, as notificações, a moderação e a proteção de colunas são **triggers e funções do PostgreSQL**, e o acesso é controlado por **RLS** (segurança por linha). As regras valem mesmo que alguém chame a API diretamente, sem o app.
- **Regras de negócio como dados:** categorias, nível de risco, validade, números de emergência e tamanho de página ficam em `shared/constants`, num lugar só.
- **Camada de serviço:** as telas não montam consultas; chamam funções de `shared/service`. Quando uma consulta falha, o serviço devolve `null` (e não uma lista vazia), para a tela poder avisar.

---

## 3. Funcionalidades por tela

### 3.1 Abertura, Intro, Login e Cadastro

- **Abertura (`app/index.tsx`):** lê a sessão salva no aparelho (`getSession`, sem rede). Com sessão, entra direto no app; sem sessão, vai para a Intro. Tempo mínimo de 0,8 s.
- **Intro:** 4 slides (segurança, mapa de ocorrências, reporte comunitário, validação pela comunidade). A logo troca para a versão branca no modo escuro.
- **Login:** e-mail e senha, com validação (e-mail válido, senha de 6+ caracteres). Erro de credenciais mostra "E-mail ou senha incorretos." A logo troca para a versão branca no modo escuro.
- **Cadastro:** e-mail, senha e confirmação (as senhas precisam coincidir). Exige ler e aceitar os **termos de uso** antes de concluir; o aceite é gravado com a versão atual. Se o Supabase exigir confirmação de e-mail, avisa "Confirme seu e-mail" e volta para o Login.
- **Proteção das abas:** ao entrar nas abas, o app confere a sessão (no aparelho, sem precisar de internet); sem sessão, volta para o Login.

### 3.2 Termos de uso (LGPD)

- **Versão atual: 1.2.0** (`termsService.ts`), com 7 seções: aceitação, propósito, regras de conduta, validação e moderação, responsabilidade, privacidade (LGPD) e alterações.
- **Aceite obrigatório ao entrar:** o layout das abas confere se o usuário aceitou a **versão atual**. Se não, abre o modal **sem como fechar**: só "Li e Concordo" ou "Recusar e sair".
- **No Perfil:** mostra se os termos foram aceitos e permite reler.

### 3.3 Home

- **Saudação** com o nome do usuário e as iniciais (do perfil ou do e-mail). Continua mostrando o nome mesmo sem internet.
- **Nível de risco da região:** o **pior** nível entre os alertas e os reportes **perto do usuário** (mesmo raio e mesmas categorias do Mapa). Um reporte **pendente** (ainda não confirmado pela comunidade) conta **no máximo como moderado**: só um reporte validado ou um alerta leva a região a alto ou crítico. Estados especiais:
  - "CARREGANDO" enquanto os dados chegam;
  - "INDISPONÍVEL" sem localização ("Ative a localização para ver o risco da sua região");
  - aviso de conexão quando a consulta falha (nunca "situação normal" sem dados).
- **Números de emergência:** Defesa Civil (199), Bombeiros (193) e SAMU (192). Tocar **copia** o número (não liga), para colar no discador.
- **Condições climáticas:** temperatura, descrição, umidade e vento (ou chuva). Sem dados: "Clima indisponível".
- **Alertas ativos perto do usuário.** Sem alertas, a seção vira "Ocorrências Próximas" com os reportes mais recentes. Tocar num card abre os detalhes; "Ver tudo" abre o Mapa.
- **Botão "Reportar Novo Evento".**

### 3.4 Mapa

- **Abertura rápida:** usa a última posição conhecida do celular e refina com o GPS em segundo plano; a câmera ajusta **uma vez** para a posição exata.
- **Acompanha o deslocamento:** com a tela aberta, atualiza a posição a cada 200 m (o GPS desliga ao sair da tela). A câmera não é puxada depois do primeiro ajuste; o botão de centralizar volta para o usuário.
- **Marcadores coloridos pelo nível de risco** (vermelho alto/crítico, laranja moderado, verde baixo), com o ícone da categoria.
- **Tamanho dos marcadores:** no Android, o `react-native-maps` 1.20.1 com a Nova Arquitetura desenha cada marcador num bitmap fixo de **100 × 100 pixels** (ele não recebe o tamanho real da View). Os marcadores foram dimensionados para caber exatamente nessa área, conforme a densidade da tela (`TAMANHO_MARCADOR = 100 ÷ PixelRatio`), para não aparecerem cortados.
- **Alertas com selo da origem:** 👥 "Alerta da comunidade" ou 🛡️ "Alerta Oficial".
- **Um reporte que virou alerta aparece só uma vez** (como alerta).
- **Filtros:** Todos, Alertas, Ocorrências (com contadores).
- **Card de prévia** ao tocar num marcador (tipo, título, descrição, risco, "Ver detalhes").
- **Raio do usuário** desenhado como círculo; o clima resumido no topo.
- **Atualização em tempo real** (Realtime) + sincronização de segurança a cada 60 s. As atualizações em tempo real seguem as mesmas regras da consulta (status, validade, distância e categorias).
- **Aviso "Sem conexão: o mapa pode estar desatualizado"** quando a busca falha, mantendo os marcadores que já estavam na tela.
- **Desempenho:** os marcadores só são redesenhados por 500 ms quando a lista muda; os estilos não são recriados a cada render.
- **Salva a localização do usuário no perfil** (arredondada), usada pelas notificações.

### 3.5 Reportar ocorrência

- **7 categorias:** alagamento, deslizamento, via bloqueada, fogo em mata, queda de galho, falta de luz e outro.
- **Localização por GPS**, com endereço pelo geocodificador do celular (ou coordenadas, se não houver endereço). Se o GPS falhar, tenta a última posição conhecida.
- **Descrição opcional** (até 500 caracteres).
- **Foto opcional, tirada pela câmera no momento** (não da galeria), reduzida para 1280 px em JPEG antes do envio (de 3–6 MB para cerca de 200–400 KB).
- **Avisos:** "Reporte enviado!", ou "Reporte enviado, mas sem a foto" se a foto falhar; limite de envio atingido ("Você já enviou 5 reportes na última hora").
- **Ajuda** ("Como funciona o reporte?").

### 3.6 Detalhes (reporte ou alerta) e votação

- **Reporte:** categoria, status (Pendente, Validado, Rejeitado, Resolvido), descrição, foto, endereço, **score de confiança** (barra), **contador de votos** ("2 de 3 necessários") e data.
- **Votação (Confirmar / Contestar)**, com comentário opcional. Pode trocar o voto ou atualizar o comentário. Não aparece para: o autor, reportes resolvidos, ocultados por denúncia ou **expirados** (com o aviso "Este reporte expirou").
- **Comentários da comunidade**, com o **primeiro nome** do autor (ou "Morador da região"); comentários ocultados por denúncia somem (o voto continua contando).
- **Denúncia** do reporte ou de um comentário, com motivo; o botão vira "Denunciado".
- **Aviso de conteúdo oculto** por denúncias.
- **Alerta:** título, descrição, categoria, origem (Comunidade, Defesa Civil, Sistema), status e validade.
- **Dono do reporte:** botão "Editar Reporte".

### 3.7 Editar reporte

- Alterar categoria, descrição, **localização** (atualiza para a posição atual) e **foto** (tirar, escolher da galeria ou remover).
- **Excluir** o reporte, com confirmação no **modal do app** (`ConfirmModal`). O alerta da comunidade ligado a ele é cancelado (trigger).

### 3.8 Histórico

- **Duas abas:** "Notificações" (alertas recebidos) e "Meus reportes".
- **Notificações:** risco, título, descrição, "Nova notificação" ou "Lida"; abrir marca como lida.
- **Meus reportes:** categoria, descrição, endereço e status.
- **Paginação:** 20 itens por vez, com o botão "Carregar mais".
- **Sem conexão:** com itens na tela, faixa "Sem conexão: mostrando os dados da última atualização"; com a lista vazia, "Não foi possível carregar. Verifique sua conexão".

### 3.9 Notificações

- **Em qualquer tela:** quando o banco cria uma notificação para o usuário, aparece o toast "⚠️ Novo alerta perto de você", que abre o alerta ao tocar.
- **App minimizado:** notificação **local** na barra do Android, com som; tocar abre o alerta (inclusive quando o toque abre o app). O toque é limpo depois de tratado, para não reabrir a cada abertura do app.
- **Contador de não lidas** sobre a aba Histórico (até "9+"), atualizado em tempo real ao receber e ao ler.

### 3.10 Perfil e Editar perfil

- **Perfil:** foto, nome, e-mail, telefone (formatado), cidade/estado (completados pela localização se faltarem), data de cadastro e reputação.
- **Tipos de alerta:** liga/desliga cada categoria (filtra os alertas do Mapa, da Home e as notificações).
- **Segurança e termos:** trocar senha (campos ocultos, mínimo de 6 caracteres, confirmação, modo escuro), termos de uso, sair da conta.
- **Excluir minha conta:** exclusão **real**, com confirmação no `ConfirmModal`. Apaga o perfil e todos os dados ligados (ver RN-18).
- **Editar perfil:** nome, telefone com **máscara e validação** (DDD, celular com 9, fixo), cidade e estado (preenchidos pela localização), "Usar minha localização atual", **raio de notificação** (1 a 50 km, padrão 5) e foto de perfil.

### 3.11 Componentes de interface, acessibilidade e tema

- **`ConfirmModal`:** modal de confirmação no visual do app, nas variantes `danger` (vermelho, ações destrutivas) e `primary` (azul). Segue o modo escuro, mostra carregamento durante ações demoradas e não fecha no meio delas. Substitui o `Alert.alert` nativo; o resultado da ação é avisado por **toast**.
- **Modo claro e escuro** em todas as telas (segue o sistema).
- **Leitor de tela:** descrições nos botões só com ícone e nas abas (incluindo o número de não lidas).
- **Rótulos das abas** com 11 px.
- **Identidade visual:** ícone e splash com o símbolo do Conf-U nas cores da marca (azul `#0047FF` / `#3B82F6`); splash com versão clara e escura; logos em versão preta (modo claro) e branca (modo escuro).

---

## 4. Regras de negócio

| # | Regra | Onde é garantida |
|---|---|---|
| **RN-01** | Só usuários logados usam o app e leem os dados | RLS (`TO authenticated`) + proteção das abas |
| **RN-02** | É preciso aceitar a **versão atual** dos termos para usar o app; a cada nova versão, o aceite é pedido de novo | `perfil_aceites` + layout das abas |
| **RN-03** | O reporte pertence a uma das 7 categorias do enum `tipo_ocorrencia` | Enum no banco + lista do app |
| **RN-04** | Cada usuário envia **no máximo 5 reportes por hora** | Trigger `limitar_reportes_por_hora` |
| **RN-05** | A foto de um reporte novo é **tirada pela câmera** no momento do envio | App (tela Reportar) |
| **RN-06** | O **nível de risco do reporte vem da categoria**: alagamento, deslizamento e fogo em mata = alto; falta de luz = baixo; os demais = moderado. A mesma regra vale no banco (alerta colaborativo) | `reportCategories.ts` + função `sincronizar_alerta_colaborativo` |
| **RN-07** | **Validação comunitária:** com **pelo menos 3 votos**, **≥ 70%** de confirmações → `validado`; **< 30%** → `rejeitado`; senão `pendente`. Um reporte `resolvido` não muda mais | Trigger `recalculate_reporte_score` |
| **RN-08** | O **autor não vota** no próprio reporte; cada usuário tem **um voto por reporte** (pode trocar) | RLS `validacoes_insert_own` + índice único (reporte, perfil) |
| **RN-09** | O comentário do voto tem **no máximo 500 caracteres** | Constraint `validacao_comentario_tamanho` + Yup |
| **RN-10** | O cliente **não altera** o score, o status (exceto para `resolvido`), a ocultação nem o trust score | Triggers `protect_reporte_columns` e `protect_perfil_trust_score` |
| **RN-11** | **Validade por categoria:** via bloqueada 4 h; outro 6 h; alagamento 8 h; falta de luz, queda de galho e fogo em mata 12 h; deslizamento 24 h. Vencido, o reporte **sai do Mapa e da Home**, mas **continua no Histórico** do autor e **não recebe mais votos** | `reportCategories.ts` + `validade.ts` (versão mínima, no app) |
| **RN-12** | **Alerta colaborativo:** quando um reporte vira `validado` (e não está oculto), o banco cria um alerta com origem `colaborativo`, no mesmo local e categoria, **raio de 1 km** e **validade de 6 h**. Um alerta por reporte (reativado se o reporte for revalidado, sem duplicar) | Trigger `sincronizar_alerta_colaborativo` + índice único `alerta_reporte_id` |
| **RN-13** | O alerta colaborativo é **encerrado** quando o reporte deixa de valer: `cancelado` (voltou a pendente, rejeitado ou oculto) ou `expirado` (resolvido) | Trigger `sincronizar_alerta_colaborativo` |
| **RN-14** | **Excluir um reporte cancela o alerta** ligado a ele | Trigger `cancelar_alerta_do_reporte_excluido` |
| **RN-15** | **Notificação:** todo alerta novo e ativo notifica os usuários **dentro do raio** (raio de notificação do usuário + raio do alerta, por Haversine) que têm **a categoria ativa** nas preferências e **localização salva** | Trigger `gerar_notificacoes_alerta` |
| **RN-16** | **Moderação:** com **3 denúncias de pessoas diferentes**, o conteúdo é ocultado para a comunidade. Reporte oculto sai do Mapa (o autor ainda vê); comentário oculto perde o texto, mas **o voto continua valendo**. Cada pessoa denuncia um conteúdo uma vez; a denúncia é **anônima** | Trigger `ocultar_por_denuncias` + índices únicos + RLS |
| **RN-17** | Motivos de denúncia: informação falsa, foto inadequada, comentário ofensivo, spam, outro | Constraint `denuncias_denuncia_motivo_check` |
| **RN-18** | **Exclusão de conta:** o próprio usuário apaga a conta; o perfil, os reportes, os votos, as denúncias, os aceites e as notificações são apagados em cascata, e os alertas dos seus reportes são cancelados | Função `excluir_minha_conta` + chaves `ON DELETE CASCADE` |
| **RN-19** | **Proximidade:** um reporte é "perto" se está dentro do raio do usuário; um alerta, se o raio dele alcança o raio do usuário (distância ≤ raio do usuário + raio do alerta). A busca no banco usa uma caixa geográfica (com margem de 20 km para alertas) e o app refina pela distância real (Haversine) | `utils/proximidade.ts`, `haversine.ts` |
| **RN-20** | **Raio de notificação** de 1 a 50 km por usuário (padrão 5 km) | Perfil (`perfil_raio_notificacao_km`) |
| **RN-21** | A **localização do usuário é guardada arredondada** para 3 casas decimais (~110 m) | `arredondarCoordenada` (Mapa e Editar Perfil) |
| **RN-22** | O nome completo **não é único** (homônimos podem se cadastrar); outros usuários veem **só o primeiro nome** | Sem constraint de unicidade + view `perfil_publico` |
| **RN-23** | O telefone é válido com DDD (11–99), com 10 dígitos (fixo, começando com 2–5) ou 11 (celular, começando com 9), sem sequências repetidas | `profileSchema` (Yup) |
| **RN-24** | O app **não grava** dados de clima e **não inventa** valores: sem resposta das APIs, mostra "indisponível" | `weatherService.ts` |
| **RN-25** | Falha de conexão **não é exibida como ausência de perigo**: as telas avisam quando a busca falha | Services devolvem `null` + avisos nas telas |
| **RN-26** | Ações destrutivas (excluir reporte, excluir conta) exigem **confirmação explícita** | `ConfirmModal` |

### 4.1 Como funciona "o que está perto" (cálculo)

1. **Caixa geográfica (no banco):** o raio em km é convertido em graus. 1° de latitude ≈ **111 km**; a longitude é corrigida pelo cosseno da latitude (os meridianos se aproximam nos polos): `Δlat = raio ÷ 111` e `Δlon = raio ÷ (111 × cos(latitude))`. O banco filtra com 4 comparações simples (latitude e longitude entre os limites).
2. **Círculo (no app):** para cada item que o banco trouxe, calcula a distância real pela **fórmula de Haversine** (considera a curvatura da Terra, raio de 6.371 km) e mantém só o que está dentro do raio.

**Exemplo (São Paulo, raio de 5 km):** Δlat = 0,045° e Δlon = 0,0491°. Um reporte a 4,53 km aparece; um a 5,28 km fica dentro da caixa, mas fora do círculo, e é descartado; um a 7,78 km nem sai do banco. A caixa (100 km²) tem cerca de 21% de área a mais que o círculo (78,5 km²): é essa sobra que o Haversine remove.

### 4.2 Dois caminhos até o morador

- **Reporte novo:** aparece no Mapa de quem está perto (Realtime + filtro de distância), com um toast para quem está com o Mapa aberto. **Não gera notificação**, porque ainda não foi confirmado.
- **Reporte confirmado:** vira alerta, e o banco cria as notificações para quem está no raio. O usuário é avisado em qualquer tela, na barra do Android (app minimizado) e no Histórico.

A validação comunitária funciona como um **filtro antes do alerta**: uma única pessoa não consegue notificar o bairro inteiro.

---

## 5. Banco de dados

### 5.1 Tipos (enums)

| Enum | Valores |
|---|---|
| `tipo_ocorrencia` | alagamento, deslizamento, bloqueio_via, outro, fogo_em_mata, queda_de_galho, falta_de_luz |
| `nivel_risco` | baixo, moderado, alto, critico |
| `tipo_validacao` | confirma, contesta |
| `status_reporte` | pendente, validado, rejeitado, resolvido |
| `status_alerta` | ativo, expirado, cancelado |
| `origem_alerta` | sistema_ia, defesa_civil, colaborativo |

### 5.2 Tabelas

| Tabela | Para que serve | Colunas principais |
|---|---|---|
| `perfil` | Dados do usuário (1:1 com `auth.users`) | nome, telefone, cidade, estado, avatar, latitude/longitude (arredondadas), raio de notificação, preferências de alerta (JSON por categoria), trust score |
| `perfil_aceites` | Histórico de aceite dos termos | perfil, versão do termo, data |
| `reportes` | Ocorrências reportadas | autor, categoria, descrição, latitude/longitude, endereço, **status**, **score de confiança** (0.00–1.00), **oculto** |
| `reporte_midias` | Fotos dos reportes | reporte, URL, tipo |
| `reporte_validacoes` | Votos e comentários | reporte, perfil, tipo (confirma/contesta), comentário, **oculta** |
| `denuncias` | Denúncias de reportes ou comentários | perfil, reporte **ou** validação (exatamente um), motivo |
| `alertas` | Alertas (colaborativos e oficiais) | categoria, nível de risco, título, descrição, latitude/longitude, raio, origem, emitido por, status, **expira em**, **reporte de origem** |
| `alerta_notificacoes` | Notificações por usuário | alerta, perfil, canal, lida, enviada em |
| `areas_risco` | Áreas de risco (polígonos) | nome, tipo, nível, polígono (JSON), município, fonte. **Existe, mas está vazia** (seção 9) |
| `dados_climaticos` | Leituras de clima | Existe, mas **o app não grava** (RN-24) |

**View `perfil_publico`:** expõe só `id`, **primeiro nome** e avatar, para mostrar o autor dos comentários. Só leitura, só para usuários logados.

**Integridade:** as chaves estrangeiras apagam em cascata a partir do usuário (`auth.users` → `perfil` → reportes, votos, denúncias, aceites, notificações). O alerta guarda o reporte de origem com `ON DELETE SET NULL` (o cancelamento é feito pelo trigger da RN-14).

### 5.3 Funções e triggers

| Função | Quando roda | O que faz |
|---|---|---|
| `handle_new_user` | Depois de criar um usuário no Auth | Cria o perfil com o nome |
| `set_updated_at` | Antes de atualizar | Atualiza o `updated_at` |
| `protect_perfil_trust_score` | Antes de inserir/atualizar o perfil | Impede o cliente de mudar o trust score |
| `protect_reporte_columns` | Antes de inserir/atualizar o reporte | Na criação: score 0, `pendente`, não oculto. Na atualização pelo cliente: preserva score, ocultação e status (só aceita `resolvido`) |
| `limitar_reportes_por_hora` | Antes de inserir um reporte | Bloqueia o 6º reporte na mesma hora (RN-04) |
| `recalculate_reporte_score` | Depois de inserir/atualizar/apagar um voto | Recalcula o score e o status (RN-07) |
| `sincronizar_alerta_colaborativo` | Depois de mudar o status ou a ocultação do reporte | Cria, reativa ou encerra o alerta colaborativo (RN-12, RN-13) |
| `gerar_notificacoes_alerta` | Depois de inserir um alerta | Cria as notificações para quem está no raio (RN-15) |
| `ocultar_por_denuncias` | Depois de inserir uma denúncia | Oculta o conteúdo na 3ª denúncia (RN-16) |
| `cancelar_alerta_do_reporte_excluido` | Antes de apagar um reporte | Cancela o alerta ligado (RN-14) |
| `excluir_minha_conta` | Chamada pelo app (RPC) | Apaga o usuário que está chamando (RN-18); só usuários logados podem executar |

As funções que precisam agir em nome do sistema são `SECURITY DEFINER` com `search_path` fixo.

**A corrente de triggers do ciclo central:**
```
voto → recalculate_reporte_score → (validado) → sincronizar_alerta_colaborativo
     → INSERT em alertas → gerar_notificacoes_alerta → INSERT em alerta_notificacoes
     → Realtime → aviso no app
```

### 5.4 Regras de acesso (RLS)

| Tabela | Leitura | Escrita |
|---|---|---|
| `perfil` | Só o próprio | Insere e atualiza só o próprio |
| `perfil_aceites` | Só os próprios | Insere só os próprios |
| `reportes` | Usuários logados | Insere, atualiza e apaga só os próprios |
| `reporte_midias` | Usuários logados | Só o dono do reporte |
| `reporte_validacoes` | Usuários logados | Insere o próprio voto (não no próprio reporte); atualiza e apaga só o próprio |
| `denuncias` | Só as próprias | Insere só as próprias |
| `alertas` | Usuários logados | **Ninguém pelo app** (só triggers do banco) |
| `alerta_notificacoes` | Só as próprias | Marca como lida só as próprias |
| `areas_risco`, `dados_climaticos` | Usuários logados | — |

### 5.5 Realtime e Storage

- **Realtime:** `reportes`, `alertas` e `alerta_notificacoes`. O Realtime respeita a RLS: cada usuário só recebe as próprias notificações. O `perfil` foi **retirado** da publicação (LGPD).
- **Storage:**
  - `fotos-ocorrencia`: fotos dos reportes (upload e leitura para usuários logados);
  - `avatars`: fotos de perfil (leitura pública; cada usuário grava só na própria pasta).

### 5.6 Migrations (`supabase/migrations/`)

| Migration | Conteúdo |
|---|---|
| `20261028023004_remote_schema_1_0` | Esquema inicial (tabelas, enums, policies) |
| `20261103233828_remote_schema` | Score, proteção de colunas, moderação, denúncias, limite de envio, view pública |
| `20261109024440_remote_schema` | Padrão das preferências de alerta |
| `20261112190234_remote_schema` | Alerta colaborativo |
| `20261112203528_remote_schema` | Notificações por proximidade |
| `20261113201132_remote_schema` | LGPD: perfil privado, leitura só para logados, nome não único |
| `20261117115957_notificacoes_realtime` | Notificações no Realtime |
| `20261125220000_exclusao_conta_e_alerta_orfao` | Exclusão de conta e cancelamento do alerta ao apagar o reporte |

---

## 6. Segurança e LGPD

- **Minimização:** a localização é guardada arredondada (~110 m); outros usuários veem só o primeiro nome; e-mail e telefone não aparecem para ninguém.
- **Consentimento:** termos versionados, com aceite obrigatório e registro da versão aceita.
- **Direito à exclusão:** exclusão da conta pelo próprio app (RN-18).
- **Controle de acesso:** RLS em todas as tabelas; leitura só para logados; colunas sensíveis protegidas por trigger.
- **Segredos:** o `.env` não é versionado; o CI roda uma varredura de segredos (gitleaks) a cada PR.
- **Moderação:** denúncias anônimas e ocultação automática.

---

## 7. Integrações externas

| Serviço | Uso | Custo |
|---|---|---|
| **Supabase** | Banco, autenticação, fotos, tempo real | Plano gratuito |
| **Google Maps (Maps SDK for Android)** | Mapa no APK (no Expo Go, usa a chave da Expo) | Gratuito no celular |
| **WeatherAPI / OpenWeather** | Clima atual (tenta a WeatherAPI e, se falhar, a OpenWeather) | Plano gratuito |
| **Geocodificador do celular** | Endereço do reporte; cidade e estado do perfil | Gratuito (no aparelho) |

---

## 8. Qualidade, processo e entrega

- **Fluxo de trabalho:** uma branch por tarefa, Pull Request, CI e merge na `main` (mais de 15 PRs integrados, com contribuições de mais de um integrante).
- **CI (GitHub Actions):** checagem de tipos (TypeScript), lint (ESLint) e varredura de segredos (gitleaks).
- **CD:** workflow que gera o **APK Android** (por tag `v*` cria uma Release; também pode ser disparado manualmente).
- **Banco versionado:** migrations em SQL, sincronizadas pelo script `scripts/supabase-remote.sh` (que remove o "ruído" de versão gerado pelo CLI).
- **Auditoria e testes:** auditoria completa do código (`AUDITORIA_2026-11-25.md`) com os problemas encontrados e corrigidos, e roteiro de testes manuais com 40 casos (`ROTEIRO_TESTES_CORRECOES.md`).
- **Documentação:** plano de desenvolvimento com decisões e SQL de referência, CI/CD, comandos e este documento.

---

## 9. Limitações conhecidas e trabalho futuro

| Item | Situação |
|---|---|
| **Inteligência artificial** (`sistema_ia`: alertas automáticos por clima) | Não implementada; a origem `sistema_ia` já existe no banco |
| **Painel / modo Defesa Civil** para emitir alertas oficiais | Não implementado; o banco já suporta a origem `defesa_civil` e as notificações já funcionam para qualquer alerta novo |
| **Áreas de risco** (GeoSampa) | Tabela pronta, mas vazia; importação planejada |
| **Push com o app fechado** (FCM) | Só notificações locais e em tempo real |
| **Validade dos reportes no banco** (status `expirado`, job `pg_cron`) | Só a versão mínima, no app; a versão completa está desenhada (Anexo A.11 do plano) |
| **Recuperação de senha** | Botão escondido até configurar a página de redefinição |
| **Tamanho dos marcadores do mapa** | Limitado a 100 px pelo `react-native-maps` 1.20.1 na Nova Arquitetura. Para marcadores maiores: imagens PNG na prop `image` ou atualizar a biblioteca (fora do Expo Go) |
| **Fotos públicas por link** | As fotos são acessíveis por URL; o ideal é bucket privado com links temporários |
| **Contas combinadas** (3 contas validam um reporte falso) | Mitigações planejadas: proximidade para votar, limite de votos, reputação |
| **Reputação (trust score)** | Exibida, mas sem regra de cálculo |
| **Testes automatizados** | Não há; testes manuais documentados e teste de usabilidade (SUS) planejado |
