# PontoCloud - Sistema de Controle de Ponto

## 📖 Descrição

O **PontoCloud** é um sistema de software para web desenvolvido para o gerenciamento e controle de ponto de funcionários. A aplicação oferece uma interface de administrador para gestão completa e uma tela de login simplificada para que os funcionários registrem suas entradas e saídas.

O painel administrativo permite o cadastro de funcionários, a visualização de relatórios, o monitoramento de registros em tempo real e a geração de espelhos de ponto em PDF. O sistema foi construído com tecnologias web modernas, focando numa experiência de usuário limpa e funcional.

## ✨ Funcionalidades Principais

A plataforma é dividida em duas áreas principais: o Painel do Administrador e a Área do Funcionário.

### Painel de Administrador

-   **Dashboard Intuitivo:** Visualização rápida de métricas importantes, como horas trabalhadas no dia e os últimos registros de ponto efetuados.
-   **Gestão de Funcionários:**
    -   Cadastro, edição e exclusão de funcionários.
    -   Atribuição de informações como nome, CPF (usado como matrícula), cargo e turno.
-   **Registro de Ponto Manual:** Administradores podem registrar o ponto manualmente para qualquer funcionário, selecionando o tipo de registro (entrada, saída, intervalo).
-   **Histórico Completo:** Acesso a um histórico detalhado de todos os registros de ponto, com filtros por funcionário.
-   **Geração de Relatórios:** Emissão do "Espelho de Ponto" em formato PDF para um funcionário e mês específico.
-   **Configurações do Sistema:** Ajustes de preferências, formatos e tolerâncias.

### Área do Funcionário

-   **Login Simplificado:** O funcionário utiliza o CPF para autenticar e acessar a tela de registro.
-   **Registro de Ponto Rápido:** Após a autenticação, o funcionário é direcionado para uma tela onde pode registrar facilmente sua entrada, início/fim de intervalo ou saída.

## 💻 Tecnologias Utilizadas

-   **Frontend:**
    -   **HTML5:** Estruturação semântica da aplicação.
    -   **CSS3 / TailwindCSS:** Estilização moderna e responsiva, com um sistema de classes utilitárias.
    -   **JavaScript (ES6+):** Manipulação dinâmica da interface, lógica de negócios e comunicação com a API.
-   **Ícones:**
    -   **Font Awesome:** Biblioteca de ícones para melhorar a interface do usuário.

## 🚀 Como Executar o Projeto

Para executar a interface do PontoCloud, são necessários um navegador web e um ambiente de servidor backend que responda às requisições da API.

1.  **Servidor Backend:**
    -   É necessário um servidor backend para gerenciar a autenticação, os dados de funcionários e os registros de ponto.
    -   O frontend está configurado para se comunicar com a API na seguinte URL base: `http://localhost:3000`.
    -   Certifique-se de que o seu backend esteja em execução neste endereço ou altere a constante `API_URL` no topo do arquivo `script.js` para o endereço correto.

2.  **Frontend:**
    -   Com o backend rodando, basta abrir o arquivo `index.html` em qualquer navegador de internet moderno (Google Chrome, Firefox, etc.).

## 🔧 Configuração da API (Backend)

O frontend espera que o backend forneça os seguintes endpoints para funcionar corretamente:

| Método | Endpoint | Descrição |
| :--- | :--- | :--- |
| `POST` | `/auth/login` | Autentica um administrador com email e senha. |
| `POST` | `/auth/ponto/login` | Autentica um funcionário com CPF para registro de ponto. |
| `GET` | `/funcionarios` | Retorna a lista de todos os funcionários cadastrados. |
| `POST` | `/funcionarios` | Cadastra um novo funcionário no sistema. |
| `DELETE` | `/funcionarios/:id` | Exclui um funcionário pelo seu ID. |
| `POST` | `/registro-ponto` | Cria um novo registro de ponto (entrada, saída, etc.). |
| `GET` | `/registro-ponto` | Retorna os registros de ponto mais recentes para o dashboard. |
| `GET` | `/relatorios/espelho-ponto/funcionario/:id/pdf` | Gera e retorna um arquivo PDF do espelho de ponto. |

A autenticação é baseada em token (Bearer Token), que é enviado no cabeçalho `Authorization` de requisições protegidas.