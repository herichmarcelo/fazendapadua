# CercasApp - Controle de Cercas PWA

Sistema PWA (Progressive Web App) completo para gerenciamento de serviços de construção e manutenção de cercas em fazendas, desenvolvido com Next.js 14, Supabase, TypeScript e Tailwind CSS. Otimizado totalmente para uso mobile no campo.

## 🚀 Funcionalidades

- **Autenticação Obrigatória**: Sistema só funciona com usuário logado
- **Dashboard Mobile-First**: Visão geral otimizada para celular
- **Gestão de Serviços**: CRUD completo com formulário touch-optimized
- **Tipos de Serviço**: Cadastro com preços automáticos
- **Controle de Empresas**: Gerenciamento de responsáveis
- **Bottom Navigation**: Navegação inferior estilo app nativo
- **Tema Verde Agronegócio**: Paleta de cores profissional
- **PWA Completo**: Instalável como app nativo
- **Calculadora Automática**: Valor total calculado em tempo real

## 📱 Instalação no Celular

### iOS (iPhone/iPad):
1. Abra o Safari e acesse o sistema
2. Toque no botão Compartilhar (quadrado com seta para cima)
3. Role para baixo e toque em "Adicionar à Tela de Início"
4. Toque em "Adicionar"
5. O app aparecerá na sua tela inicial como um app nativo

### Android:
1. Abra o Chrome e acesse o sistema
2. Toque no menu (três pontos) no canto superior direito
3. Toque em "Instalar aplicativo" ou "Adicionar à tela inicial"
4. Confirme a instalação
5. O app aparecerá na sua tela inicial como um app nativo

## 🛠️ Stack Técnológica

- **Framework**: Next.js 14+ (App Router)
- **Linguagem**: TypeScript
- **Banco de Dados**: Supabase (PostgreSQL)
- **Autenticação**: Supabase Auth
- **Estilização**: Tailwind CSS
- **PWA**: @ducanh2912/next-pwa
- **Validação**: React Hook Form + Zod
- **Ícones**: Lucide React

## 📋 Pré-requisitos

- Node.js 18+ instalado
- Conta no Supabase (gratuita)
- npm ou yarn

## 🔧 Instalação

### 1. Clone o repositório
```bash
cd C:\Projects\FazStoPadua\cercas-pwa
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Configure o Supabase

#### 3.1 Crie um projeto no Supabase
1. Acesse [https://supabase.com](https://supabase.com)
2. Crie uma conta (se ainda não tiver)
3. Crie um novo projeto
4. Aguarde o projeto ser configurado

#### 3.2 Configure as variáveis de ambiente
Crie um arquivo `.env.local` na raiz do projeto com o seguinte conteúdo:

```env
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima
SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role
```

#### 3.3 Execute o script SQL
1. No dashboard do Supabase, vá em SQL Editor
2. Crie um novo query
3. Copie o conteúdo do arquivo `schema.sql`
4. Execute o script

### 4. Execute o projeto
```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000) no navegador.

## 🎨 Tema Verde Agronegócio

- **Verde Primário**: #009739
- **Verde Escuro**: #006B2B
- **Verde Claro**: #4CAF50
- **Verde Suave**: #E8F5E9
- **Amarelo Ouro**: #FFD700

## 📁 Estrutura do Projeto

```
cercas-pwa/
├── app/
│   ├── layout.tsx           # Layout com PWA meta tags
│   ├── page.tsx             # Dashboard autenticado
│   ├── auth/
│   │   ├── login/           # Tela de login
│   │   └── register/        # Tela de cadastro
│   ├── servicos/
│   │   ├── page.tsx         # Lista em cards mobile
│   │   ├── novo/            # Formulário touch-optimized
│   │   └── [id]/edit/       # Edição
│   ├── empresas/            # Gestão de empresas
│   ├── pagamentos/          # Controle financeiro
│   ├── tipos-servico/       # Configuração de tipos
│   ├── relatorios/          # Relatórios
│   └── mais/                # Menu adicional
├── components/
│   ├── ui/                  # Componentes mobile
│   │   ├── BottomNav.tsx    # Navegação inferior
│   │   └── Header.tsx       # Header mobile
│   ├── servicos/            # Cards de serviços
│   └── dashboard/           # Componentes dashboard
├── lib/
│   ├── supabase/            # Configuração Supabase
│   ├── actions/             # Server Actions
│   ├── types.ts             # Tipos TypeScript
│   └── utils.ts             # Funções utilitárias
├── public/
│   ├── manifest.json         # Manifest PWA
│   └── icons/               # Ícones PWA
├── next.config.js            # Config PWA
├── tailwind.config.ts       # Config Tailwind
└── schema.sql               # Script SQL banco
```

## 🔐 Autenticação

O sistema exige autenticação obrigatória. Usuários não autenticados são redirecionados automaticamente para a tela de login.

### Criar um usuário:
1. Acesse `/auth/register`
2. Preencha email e senha
3. Clique em "Criar Conta"
4. Faça login com as credenciais criadas

## 📱 Funcionalidades Mobile

- **Inputs Touch-Optimized**: Campos de texto com 16px para evitar zoom
- **Bottom Navigation**: Navegação fixa na parte inferior
- **Cards Adaptativos**: Layout responsivo para mobile
- **Botão FAB**: Botão flutuante para ações rápidas
- **Safe Area**: Suporte a notch e áreas seguras
- **Pull to Refresh**: Atualização ao puxar a tela
- **Loading States**: Feedback visual durante carregamento

## 🚀 Deploy na Vercel

1. Conecte seu repositório ao Vercel
2. Configure as variáveis de ambiente no Vercel
3. Deploy automático
4. O PWA será instalável automaticamente

## 📝 Dados Iniciais

O sistema vem pré-configurado com:
- 5 empresas (JUNIOR CABRINE, EDENILSON, DEVILSON, EDERILSON, DENILSON)
- 7 tipos de serviço com preços padrão

## 🎯 Como Usar

1. **Criar Conta**: Primeiro acesso requer cadastro
2. **Login**: Entre com email e senha
3. **Dashboard**: Veja o resumo geral
4. **Novo Serviço**: Use o botão + na navegação inferior
5. **Selecionar Tipo**: O preço é preenchido automaticamente
6. **Preencher Dados**: Metragem, local, observações
7. **Salvar**: O valor total é calculado automaticamente

## 🐛 Troubleshooting

### Erro de conexão com Supabase
Verifique se as variáveis de ambiente estão corretas no arquivo `.env.local`

### PWA não instala
Verifique se o manifesto.json está configurado corretamente e se os ícones existem

### Login não funciona
Verifique se as políticas RLS estão configuradas corretamente no Supabase

## 📄 Licença

Este projeto é privado e propriedade da Fazenda Cabrines.

---

Desenvolvido com 🌱 para o agronegócio brasileiro