# Product Requirements Document (PRD)

## 1. Visão Geral do Produto

- **Nome do Plugin:** JSON Toolkit for Obsidian (nome sugestivo: `obsidian-json-toolkit`)

- **Objetivo:** Fornecer formatação, minificação e manipulação robusta de payloads JSON dentro do Obsidian, permitindo alternar dinamicamente entre diferentes motores de parsing/formatação (`json5` e `jsonc-parser`) para lidar tanto com JSON estrito quanto com JSON contendo comentários, vírgulas residuais (*trailing commas*) ou chaves sem aspas.

- **Público-Alvo:** Desenvolvedores, administradores de sistemas, engenheiros de dados e usuários técnicos que documentam APIs, logs, configurações e payloads em notas Markdown.

## 2. Objetivos e Critérios de Sucesso

### 2.1 Objetivos de Negócio & Usabilidade

1. Eliminar a necessidade de sair do Obsidian para navegadores ou ferramentas externas (ex: JSONLint, DevToys) ao formatar payloads.

2. Permitir manipulação de JSON sem quebrar a sintaxe de comentários (`//`, `/* */`), comum em arquivos de configuração e anotações técnicas.

3. Manter o plugin leve (< 150 KB compilado), responsivo e 100% compatível com as plataformas Desktop e Mobile (iOS/Android).

### 2.2 Critérios de Aceite

- O usuário pode escolher nas configurações qual motor utilizar por padrão (`JSON5` ou `JSONC Parser`).

- Capacidade de formatar a seleção ativa ou detectar automaticamente o bloco de código Markdown ` ```json ` sob o cursor.

- Exibição de avisos contextuais (*Notices*) informativos com a linha e coluna exatas em caso de erro de sintaxe.

- Testes unitários para os formatadores isolados de qualquer dependência direta do runtime do Obsidian.

## 3. Arquitetura e Engenharia de Software

Para respeitar os princípios de Clean Code, SOLID e manutenibilidade, a lógica de formatação e os adaptadores de biblioteca ficam completamente desacoplados da camada de UI do Obsidian.

### 3.1 Padrão Estrutural: Strategy Pattern

Utilização do padrão Strategy para a formatação de JSON, expondo uma interface unificada (`IJsonEngine`).

```
[ Obsidian UI / Command Layer ]
               │
               ▼
      [ JsonService ]
               │
   ┌───────────┴───────────┐
   ▼                       ▼
[ Json5Engine ]     [ JsoncEngine ]
 (lib: json5)        (lib: jsonc-parser)
```

### 3.2 Estrutura de Pastas Proposta

Plaintext

```
obsidian-json-toolkit/
├── .github/
│   └── workflows/
│       └── release.yml
├── src/
│   ├── core/                      # Regras de domínio e contratos (agnóstico ao Obsidian)
│   │   ├── contracts/
│   │   │   ├── json-engine.interface.ts
│   │   │   └── format-options.interface.ts
│   │   ├── engines/
│   │   │   ├── json5-engine.ts
│   │   │   └── jsonc-engine.ts
│   │   └── services/
│   │       └── json-service.ts
│   │
│   ├── obsidian/                  # Camada de acoplamento com Obsidian e CodeMirror
│   │   ├── commands/
│   │   │   ├── format-block.command.ts
│   │   │   ├── format-selection.command.ts
│   │   │   └── minify-selection.command.ts
│   │   ├── settings/
│   │   │   ├── plugin-settings.ts
│   │   │   └── settings-tab.ts
│   │   └── utils/
│   │       ├── editor-detector.ts # Heurísticas de localização de blocos ```json
│   │       └── notice-helper.ts
│   │
│   └── main.ts                    # Entrypoint (ciclo de vida onload / onunload)
│
├── tests/                         # Testes automatizados (Jest ou Vitest)
│   ├── unit/
│   │   ├── json5-engine.spec.ts
│   │   └── jsonc-engine.spec.ts
│   └── mocks/
│       └── mock-editor.ts
│
├── esbuild.config.mjs
├── manifest.json
├── package.json
├── tsconfig.json
└── README.md
```

## 4. Requisitos Funcionais (FR)

### FR-01: Seleção de Engine nas Configurações

- **Descrição:** A aba de configurações do plugin deve conter um menu suspenso (*dropdown*) para definir a biblioteca ativa.

- **Opções:**

  - `JSONC (VS Code parser)`: Recomendado para manter comentários intactos com edições cirúrgicas na árvore sintática.

  - `JSON5`: Recomendado para serializações flexíveis (suporta chaves sem aspas, strings multilinhas, hexadecimal).

- **Parâmetros Adicionais:**

  - Tamanho da indentação (Tabs, 2 espaços, 4 espaços).

  - Ordenação alfabética das chaves (*Sort Keys* - booleano).

### FR-02: Formatação de Seleção Ativa

- **Descrição:** Executar o comando `JSON: Format Selection`.

- **Comportamento:**

  - Se houver texto selecionado, passa a string pelo `JsonService` com a engine ativa.

  - Substitui o texto selecionado pelo JSON formatado.

  - Caso o JSON seja inválido, o texto original é preservado e uma notificação com o erro é lançada.

### FR-03: Detecção e Formatação Automática de Bloco de Código

- **Descrição:** Executar o comando `JSON: Format Block under Cursor`.

- **Comportamento:**

  - Se o cursor estiver posicionado entre ` ```json ` e ` ``` `, o plugin detecta automaticamente os limites do bloco.

  - Aplica a formatação mantendo os delimitadores de bloco do Markdown inalterados.

### FR-04: Minificação de JSON

- **Descrição:** Executar o comando `JSON: Minify Selection / Block`.

- **Comportamento:** Remove quebras de linha e espaços excedentes, reduzindo o payload ao tamanho mínimo legível por máquina.

## 5. Requisitos Não Funcionais (NFR)

- **NFR-01 (Performance):** A formatação de payloads de até 2 MB deve ocorrer em menos de 100 ms sem congelar a UI principal.

- **NFR-02 (Mobile Readiness):** Nenhuma dependência nativa do Node (`fs`, `path`, `crypto`) deve ser importada. As bibliotecas `json5` e `jsonc-parser` devem rodar no runtime puro de navegador/WebView.

- **NFR-03 (Idempotência):** Aplicar o comando de formatação duas ou mais vezes consecutivas em um bloco válido não pode alterar o conteúdo nem introduzir mutações no texto.

- **NFR-04 (Bundle Size):** O artefato final `main.js` gerado pelo `esbuild` não deve exceder 200 KB.

## 6. Especificação das Interfaces e Motores

### 6.1 Contrato da Engine (`src/core/contracts/json-engine.interface.ts`)

TypeScript

```
export interface FormatOptions {
  indentSize: number;
  useTabs: boolean;
  sortKeys?: boolean;
}

export interface EngineResult {
  success: boolean;
  data?: string;
  error?: {
    message: string;
    line?: number;
    column?: number;
  };
}

export interface IJsonEngine {
  readonly id: 'json5' | 'jsonc';
  readonly name: string;
  format(input: string, options: FormatOptions): EngineResult;
  minify(input: string): EngineResult;
}
```

### 6.2 Estratégia de Diferenciação das Bibliotecas

| **Característica**                 | **Implementação com jsonc-parser**                                                 | **Implementação com json5**                                                                                                          |
| ---------------------------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| **Comentários (`//`, `/* */`)**    | Mantidos intactos via edits sintáticos (`format(..., { insertSpaces, tabSize })`). | Parsers padrão de JSON5 convertem para objeto JS; ao serializar de volta, **comentários são removidos**. Indicado alertar o usuário. |
| **Sintaxe Relaxada**               | Permite comentários e trailing commas.                                             | Permite hexadecimal, chaves sem aspas, trailing commas e strings multilinhas.                                                        |
| **Recuperação de Posição de Erro** | Fornece `offset` e `length` exatos para cada erro de sintaxe.                      | Retorna mensagem de erro com indicação de linha/coluna nativa.                                                                       |

## 7. Configurações Padrão (`PluginSettings`)

TypeScript

```
export interface PluginSettings {
  selectedEngine: 'jsonc' | 'json5';
  indentSize: number;
  useTabs: boolean;
  sortKeys: boolean;
  notifyOnSuccess: boolean;
}

export const DEFAULT_SETTINGS: PluginSettings = {
  selectedEngine: 'jsonc',
  indentSize: 2,
  useTabs: false,
  sortKeys: false,
  notifyOnSuccess: false,
};
```

## 8. Plano de Lançamento e Roadmap

### Fase 1: MVP

- [ ] Scaffold inicial do projeto com TypeScript + `esbuild`.

- [ ] Configuração de pastas `core`, `obsidian` e `tests`.

- [ ] Implementação da interface `IJsonEngine` e dos adaptadores `JsoncEngine` e `Json5Engine`.

- [ ] Comando de formatação e minificação por seleção de texto.

- [ ] Aba de configurações para escolha do motor.

### Fase 2: Experiência de Edição (DX)

- [ ] Implementação do scanner de bloco ` ```json ` sob o cursor.

- [ ] Atalhos de teclado customizáveis pré-registrados.

- [ ] Suporte a ordenação de chaves (*Sort Keys*).

### Fase 3: Comunidade e Polimento

- [ ] Cobertura de testes unitários > 85% para a camada `core`.

- [ ] Criação de documentação clara no `../README.md` com GIFs demonstrando as diferenças entre JSONC e JSON5.

- [ ] Submissão do repositório à lista oficial de plugins comunitários do Obsidian.
