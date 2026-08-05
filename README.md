# KoringaApp - Sistema de Gestão para CT Koringa Fight Team

O **KoringaApp** é um sistema de gestão completo desenvolvido para o Centro de Treinamento Koringa Fight Team. Ele foi projetado para gerenciar alunos, mensalidades, presenças, vendas na loja e todo o controle financeiro do CT.

## 🚀 Funcionalidades

- **Painel Inicial (Dashboard):** Visão geral de métricas, alunos ativos, inadimplentes, receitas e despesas.
- **Gestão de Alunos & Cobrança:** Cadastro de alunos, controle de planos (Mensal, Trimestral, Anual), datas de vencimento e status de pagamento.
- **Integração com Telegram:** Envio automático e manual de lembretes de cobrança para alunos que vencem no dia, direto em um grupo do Telegram.
- **Controle de Presença:** Check-in diário de alunos, histórico de treinos e frequência.
- **Loja & Estoque:** Venda de suplementos, equipamentos e vestuário, com baixa automática de estoque.
- **Financeiro & Caixas:** Lançamento de receitas e despesas (aluguel, salários, contas), fechamento de caixa mensal e cálculo de lucro líquido.

## 🛠️ Tecnologias Utilizadas

- **React** (v19)
- **TypeScript**
- **Vite** (Build tool rápida)
- **CSS Vanilla** (Design moderno, responsivo e com dark mode premium)
- **LocalStorage DB** (Banco de dados local no navegador)
- **Telegram Bot API** (Notificações)

## 📦 Como Rodar o Projeto

Este é um projeto Frontend sem necessidade de um servidor backend complexo (os dados são salvos no navegador).

1. **Instale as dependências:**
   ```bash
   npm install
   ```

2. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

3. **Acesse no navegador:**
   Abra `http://localhost:5173` (ou a porta informada no terminal). O login padrão de administrador é `admin@koringa.co` com a senha `admin123`.

## 📱 Configuração do Telegram

Para que as cobranças automáticas funcionem:
1. Crie um bot no **@BotFather** no Telegram e copie o Token.
2. Adicione o bot a um grupo, envie uma mensagem e descubra o **Chat ID** (usando `https://api.telegram.org/bot<SEU_TOKEN>/getUpdates`).
3. No KoringaApp, vá na aba **Telegram**, insira o Token e o Chat ID, e ative as notificações automáticas.
