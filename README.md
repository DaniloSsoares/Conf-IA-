# Conf-IA — Plataforma de Prevenção e Resposta a Desastres Climáticos

Bem-vindo ao projeto **Conf-IA**.

A **Conf-IA** é uma plataforma digital de monitoramento, prevenção e resposta a desastres climáticos, desenvolvida com o objetivo de integrar informações meteorológicas, dados geográficos e participação colaborativa da população em um ambiente tecnológico acessível e orientado à redução de riscos socioambientais.

A plataforma foi concebida como uma solução complementar aos mecanismos tradicionais de monitoramento climático e defesa civil existentes no Brasil, buscando ampliar a capacidade de comunicação de risco com a população, especialmente em regiões urbanas vulneráveis a enchentes, alagamentos e deslizamentos.

O projeto foi desenvolvido no contexto acadêmico como proposta aplicada à mitigação dos impactos causados por eventos climáticos extremos, alinhando-se às diretrizes internacionais relacionadas à adaptação climática e à construção de cidades resilientes.

#

## Modelo

A plataforma opera a partir da integração de diferentes fontes de dados climáticos, geográficos e colaborativos.

Informações meteorológicas são obtidas por meio de APIs públicas nacionais e internacionais, enquanto dados geoespaciais permitem contextualizar áreas historicamente suscetíveis a eventos extremos.

Além das fontes automatizadas, a plataforma incorpora mecanismos de participação colaborativa, permitindo que usuários reportem ocorrências em tempo real, incluindo registros de:

- Alagamentos
- Deslizamentos
- Bloqueios de vias
- Ocorrências climáticas diversas

Esses dados contribuem para atualização dinâmica das informações apresentadas aos demais usuários e aos órgãos públicos envolvidos.

O modelo da plataforma busca combinar monitoramento automatizado, análise de risco e comunicação acessível em um ambiente unificado.

#

## Funcionalidades

A plataforma disponibiliza funcionalidades voltadas ao acompanhamento de riscos climáticos e apoio à tomada de decisão em situações emergenciais.

### Alertas Personalizados
Recebimento de notificações conforme localização e nível de risco identificado.

### Mapas de Risco
Visualização de áreas monitoradas e regiões vulneráveis em tempo real.

### Reporte Colaborativo
Envio de ocorrências pela população com descrição, localização e imagens.

### Histórico de Eventos
Consulta de ocorrências anteriores para análise e acompanhamento.

### Apoio à Defesa Civil
Suporte operacional para órgãos públicos e agentes responsáveis pela gestão de emergências.

#

## Tecnologias

A aplicação mobile da plataforma é desenvolvida utilizando tecnologias modernas voltadas à escalabilidade e integração de serviços.

| Tecnologia | Finalidade |
|---|---|
| React Native | Desenvolvimento mobile |
| APIs REST | Comunicação entre serviços |
| Supabase | Banco de dados e backend |
| OpenWeatherMap | Dados meteorológicos |
| NOAA | Informações climáticas |
| INMET | Dados meteorológicos nacionais |

#

## Estrutura da Plataforma

```text
┌─────────────────────────────────────────┐
│      APLICAÇÃO MOBILE (React Native)    │
│  • Alertas em Tempo Real                │
│  • Mapas de Risco Interativos          │
│  • Reporte Colaborativo                 │
│  • Push Notifications                   │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│    BACKEND / APIs REST (Node.js)        │
│  • Processamento de Dados               │
│  • Autenticação & Autorização           │
│  • Orquestração de APIs Externas        │
│  • Websockets (atualizações em tempo real)
└────────────────┬────────────────────────┘
                 │
        ┌────────┴────────┐
        ▼                 ▼
┌──────────────────┐  ┌────────────────────────────┐
│  Supabase DB     │  │  APIs Climáticas Externas  │
│  • Usuários      │  │  • OpenWeatherMap          │
│  • Ocorrências   │  │  • NOAA                    │
│  • Histórico     │  │  • INMET                   │
│  • Configurações │  │  • Satélites/Radar         │
└──────────────────┘  └────────────────────────────┘
```
#

## 📂 Projeto

O desenvolvimento da Conf-IA encontra-se organizado em etapas progressivas que abrangem:

- levantamento de requisitos;
- modelagem da solução;
- desenvolvimento incremental;
- integração com APIs externas;
- validação da plataforma.

Atualmente, o projeto encontra-se na fase de desenvolvimento da arquitetura backend e definição das interfaces principais da aplicação.

#

## Objetivos de Desenvolvimento Sustentável

A proposta da Conf-IA está alinhada aos Objetivos de Desenvolvimento Sustentável da Organização das Nações Unidas, especialmente:

### ODS 11 — Cidades e Comunidades Sustentáveis

Redução de impactos causados por desastres naturais em áreas urbanas.

### ODS 13 — Ação Contra a Mudança Global do Clima

Fortalecimento da resiliência e adaptação climática.

#

## 👨‍💻 Equipe

Projeto desenvolvido por:

- Alex Expedito Silva Santos
- Danilo Santos Soares
- João Pedro Silva de Oliveira
- Matheus Curci Romano

#

## 📄 Licença

Projeto desenvolvido para fins acadêmicos e educacionais.
