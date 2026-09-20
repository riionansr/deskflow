# DeskFlow — Documentação Técnica

## 1. Arquitetura

O DeskFlow é uma aplicação web desenvolvida para apoiar profissionais de suporte técnico na organização e recuperação rápida de fraseologias, scripts e procedimentos operacionais.

A aplicação adota uma abordagem **Client-Side First**, na qual o processamento principal ocorre no navegador e não depende de um backend próprio para as operações básicas do catálogo.

A arquitetura pode ser representada de forma simplificada:

```text
                         ┌──────────────────────┐
                         │        Usuário       │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │      React / UI      │
                         └──────────┬───────────┘
                                    │
                   ┌────────────────┼────────────────┐
                   ▼                ▼                ▼
             ┌───────────┐   ┌────────────┐   ┌─────────────┐
             │  Search   │   │   Parser   │   │ Application │
             │  Engine   │   │ / Import   │   │    Logic    │
             └─────┬─────┘   └─────┬──────┘   └──────┬──────┘
                   │               │                 │
                   └───────────────┼─────────────────┘
                                   ▼
                         ┌──────────────────────┐
                         │     LocalStorage     │
                         └──────────┬───────────┘
                                    │
                           ┌────────┴────────┐
                           ▼                 ▼
                    ┌────────────┐    ┌─────────────┐
                    │ Import /   │    │  Optional   │
                    │  Export    │    │    Sync     │
                    └────────────┘    └──────┬──────┘
                                             │
                                             ▼
                                          Firestore
```

O núcleo da aplicação foi projetado para funcionar utilizando os dados locais. Funcionalidades que dependem de serviços externos requerem conectividade e estão sujeitas à disponibilidade e às políticas desses serviços.

---

## 2. Persistência e modelo BYOD

O DeskFlow utiliza uma abordagem **BYOD (Bring Your Own Data)**, na qual o catálogo operacional pertence ao usuário e pode ser mantido localmente no navegador.

O armazenamento local utiliza `localStorage` para persistir as informações necessárias ao funcionamento da aplicação.

Entre os dados armazenados estão estruturas relacionadas a:

- fraseologias;
- categorias;
- tags;
- configurações da aplicação;
- assinatura do usuário;
- configurações relacionadas às integrações disponíveis.

O DeskFlow não depende de um banco de dados central obrigatório para executar as operações básicas do catálogo.

### Portabilidade

Para reduzir a dependência de um único navegador ou dispositivo, o DeskFlow disponibiliza mecanismos de importação e exportação dos dados.

O usuário pode utilizar esses mecanismos para:

- realizar backups;
- transportar seu catálogo;
- restaurar dados;
- manter cópias externas;
- compartilhar estruturas compatíveis com outros ambientes.

### Sincronização opcional

Quando habilitada, a sincronização com serviços externos permite utilizar uma infraestrutura remota para compartilhar ou manter uma cópia do catálogo.

Essa funcionalidade é complementar ao armazenamento local e não substitui o modelo Client-Side First da aplicação.

> A utilização de serviços externos significa que os dados enviados passam a estar sujeitos às configurações, disponibilidade e políticas do respectivo provedor.

---

## 3. Parser e formatos de dados

O DeskFlow utiliza processamento determinístico local para interpretar os formatos de conteúdo suportados.

O parser é responsável por transformar conteúdos estruturados em objetos que podem ser utilizados pelo catálogo da aplicação.

Entre os elementos reconhecidos estão:

- título;
- corpo;
- categoria;
- hashtags;
- delimitadores de blocos;
- campos estruturais definidos pelo formato utilizado pelo DeskFlow.

O processamento ocorre localmente no navegador e não depende de um modelo generativo para interpretar a estrutura do conteúdo.

### Processamento determinístico

O parser utiliza regras previamente definidas para identificar e converter os elementos do conteúdo.

Isso proporciona comportamento previsível para entradas que seguem o formato suportado e evita a necessidade de enviar documentos para um serviço de IA apenas para realizar sua interpretação estrutural.

### Importação

A aplicação possui mecanismos para importar conteúdos a partir dos formatos suportados pelo projeto.

Durante a importação, o conteúdo é convertido para a estrutura interna utilizada pelo DeskFlow.

### Exportação

Os dados podem ser exportados para formatos destinados a backup, restauração ou utilização externa.

O formato estruturado preserva as informações necessárias para reconstrução do catálogo, enquanto formatos textuais fornecem uma representação mais simples e legível do conteúdo.

---

## 4. Motor de busca e pesquisa contextual

O mecanismo de busca é uma das principais características funcionais do DeskFlow.

A pesquisa foi projetada para permitir que o operador combine **contexto e termos específicos** em uma única consulta.

### Busca multi-termo

Os termos informados podem ser combinados utilizando lógica **AND**.

Por exemplo:

```text
reset senha
```

restringe os resultados para conteúdos que correspondam aos critérios definidos pela busca.

### Hashtags como contexto

Hashtags podem ser utilizadas para representar o contexto operacional de uma fraseologia.

Exemplos (fictícios, para fins de documentação):

```text
#chat
#energia
#mfa
```

Uma hashtag pode ser combinada com termos adicionais:

```text
#chat saudacao
#energia acesso
#mfa reset
```

Nesse modelo, a hashtag funciona como um filtro contextual enquanto os demais termos refinam o resultado.

### Categorias e tags

O sistema também permite consultas direcionadas utilizando categorias e tags.

Exemplos:

```text
categoria:energia
cat:energia
c:energia
```

e:

```text
tag:chat
t:chat
```

Esses mecanismos permitem que o operador escolha entre uma pesquisa mais livre ou uma pesquisa explicitamente direcionada a determinado contexto.

### Tags interativas

As tags apresentadas pela interface podem ser utilizadas como atalhos para construção da pesquisa.

Ao selecionar uma tag, o DeskFlow adiciona o contexto correspondente à consulta, permitindo que o usuário continue refinando a busca com outros termos.

Exemplo:

```text
#chat
```

pode ser complementado com:

```text
#chat saudacao
```

### Priorização de conteúdos

Frases marcadas como fixadas (`pinned`) recebem prioridade na apresentação dos resultados.

Isso permite manter scripts de utilização frequente acessíveis mesmo quando outros filtros são aplicados.

### Pesquisa contextual no fluxo de trabalho

A pesquisa contextual foi concebida para reduzir a necessidade de navegar manualmente por grandes catálogos.

Em um fluxo de atendimento, o operador pode identificar primeiro o contexto e depois especificar o que procura:

```text
Contexto → termo → resultado → cópia
```

Exemplo:

```text
#energia
```

seguido de:

```text
#energia acesso
```

ou:

```text
#chat saudacao
```

O objetivo é aproximar a busca do modo como o operador pensa durante um atendimento: primeiro o cenário, depois a necessidade específica.

---

## 5. Integrações externas

O núcleo do DeskFlow foi desenvolvido para operar sem depender obrigatoriamente de serviços externos.

Quando habilitadas, integrações externas podem ampliar a capacidade da aplicação, especialmente em cenários de sincronização e compartilhamento.

### Firestore

O projeto disponibiliza sincronização opcional utilizando Firestore.

Essa integração permite utilizar armazenamento remoto para cenários em que o usuário precisa manter o catálogo disponível em diferentes ambientes ou compartilhá-lo conforme a implementação e configuração adotadas.

A sincronização não é necessária para utilizar as operações básicas realizadas sobre os dados locais.

### Considerações sobre serviços externos

A utilização de qualquer serviço externo introduz dependências que não estão sob controle direto do DeskFlow.

Isso inclui:

- disponibilidade do serviço;
- conectividade;
- autenticação;
- limites de utilização;
- políticas de privacidade;
- políticas de retenção;
- configurações de acesso.

Por esse motivo, a arquitetura trata essas integrações como componentes opcionais, mantendo o núcleo operacional independente delas sempre que possível.

---

## 6. Segurança e limitações

O modelo Client-Side First reduz a necessidade de um backend central para as operações básicas, mas não deve ser interpretado como uma garantia absoluta de segurança ou confidencialidade.

### Dados locais

Informações armazenadas no `localStorage` permanecem associadas ao ambiente do navegador.

A remoção dos dados do site, limpeza do armazenamento ou determinadas operações de manutenção do navegador podem resultar na perda dessas informações.

Por isso, recomenda-se utilizar os mecanismos de exportação ou sincronização disponíveis quando os dados forem importantes.

### Informações sensíveis

O DeskFlow não deve ser tratado como:

- cofre de senhas;
- sistema de gerenciamento de segredos;
- banco de dados corporativo para informações sensíveis;
- substituto de sistemas corporativos de IAM;
- mecanismo dedicado de proteção de credenciais.

Credenciais, senhas ou informações altamente sensíveis não devem ser armazenadas no catálogo sem que os riscos e as políticas do ambiente sejam devidamente avaliados.

### Integrações externas

Quando dados são enviados para serviços externos, a proteção dessas informações também depende das configurações e políticas do respectivo provedor.

Portanto, o modelo BYOD significa que o usuário possui maior controle sobre onde seus dados são armazenados, mas não representa uma garantia de segurança independente do ambiente.

### Escopo da aplicação

O DeskFlow é uma ferramenta de produtividade operacional.

Ele não pretende substituir:

- sistemas oficiais de atendimento;
- plataformas ITSM;
- sistemas de gestão de identidade;
- sistemas de gerenciamento de credenciais;
- bases oficiais de conhecimento;
- mecanismos corporativos de controle de acesso.

Seu objetivo é atuar como uma camada de produtividade entre o profissional e seu fluxo operacional.

---

## Considerações finais

O DeskFlow combina processamento local, persistência no navegador, busca contextual, organização por categorias e tags e integrações opcionais para criar uma ferramenta voltada à recuperação rápida de conhecimento operacional.

A arquitetura prioriza:

- **processamento local;**
- **portabilidade dos dados;**
- **independência de infraestrutura central;**
- **busca contextual;**
- **extensibilidade através de integrações;**
- **adaptação ao fluxo real de trabalho.**

A principal característica arquitetural do projeto é manter o núcleo operacional simples e local, utilizando serviços externos como extensões opcionais quando necessário.
