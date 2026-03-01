# 🐉 VTT Epic Tabletop & Character Manager (SaaS Showcase)

![Project Status](https://img.shields.io/badge/Status-Desenvolvimento_Comercial-brightgreen)
![React](https://img.shields.io/badge/Frontend-React.js-blue)
![Python](https://img.shields.io/badge/Backend-Python_/_FastAPI-yellow)
![Database](https://img.shields.io/badge/Database-MySQL-lightgrey)

**⚠️ PROJETO EM DESENVOLVIMENTO COMERCIAL (SaaS)**

> Este repositório contém a documentação técnica, arquitetural e visual de um software proprietário que estou desenvolvendo. Para proteger a propriedade intelectual do produto visando monetização futura, o código-fonte completo é privado.
> 
> 💡 **Para Recrutadores e Gestores Técnicos:** Disponibilizei trechos-chave da arquitetura na pasta `/Code_Snippets` para análise da qualidade do meu código, lógica e estruturação.

---

## 🎲 Visão Geral do Projeto

O **VTT Epic Tabletop** é uma aplicação Fullstack robusta projetada para elevar a imersão em sessões de RPG de mesa. Atuando como um *Virtual Tabletop* completo e um gerenciador de campanhas, o sistema elimina a fricção matemática do jogo por meio de automação avançada, permitindo que Mestres e Jogadores foquem na narrativa e na estratégia.

O projeto foi arquitetado unindo princípios sólidos de Engenharia de Software com manipulação avançada de estado no front-end e cálculos assíncronos de alta performance.

---

## 🏗️ Arquitetura e Decisões Técnicas

Para sustentar um ambiente multiplayer reativo e pesado visualmente, o projeto utiliza uma arquitetura desacoplada com foco em performance:

* **Core Logic (Client-Side):** Módulos JavaScript isolados processam as regras matemáticas pesadas e validações no frontend, garantindo feedback instantâneo ao usuário e poupando requisições desnecessárias.
* **Frontend:** Construído em **React.js**, focado em interfaces dinâmicas, renderização de tabuleiro e gestão de estado complexo entre as visões do jogador e do mestre.
* **Backend API:** Desenvolvido em **Python (FastAPI)**, atuando como uma camada de transporte de alta velocidade e orquestração de regras de negócio estritas.
* **Banco de Dados:** **MySQL**, garantindo consistência relacional para a persistência de fichas, inventários e dados de campanha.
* **Integração Cloud:** Conexão com a API do Dropbox para gestão de *assets* (mapas e tokens).

---

## ✨ Funcionalidades Principais (Features)

* **Fichas Dinâmicas e Motor de Regras:** Automação em tempo real de atributos, HP, XP e Perícias. Alterações de estado refletem instantaneamente na interface.
* **Tabuleiro Vivo (Live Board):** * Controle de passagem de tempo com **Ciclo de Dia/Noite** fluido.
  * **Clima Dinâmico:** Renderização de chuva e neve afetando a imersão.
  * **Iluminação Reativa:** Sistema onde fontes de luz interagem com os elementos do cenário em tempo real.

---

## 💻 Amostras de Código Disponíveis (`/Code_Snippets`)

Convido você a analisar a estruturação do projeto através das amostras públicas:

1. 🧮 `dndMath.js`: Biblioteca client-side de funções lógicas para regras do sistema (rolagem de dados complexas, cálculo de modificadores e validações matemáticas).
2. ⚙️ `main.py`: Estrutura do Backend em FastAPI, demonstrando a criação de endpoints escaláveis e orquestração entre o Frontend e o MySQL.
3. ⚛️ `CriacaoHeroi.jsx`: Componente React principal demonstrando a interface reativa de construção de personagens e manipulação de estado.

---

## 📸 Vitrine Visual (Screenshots & Demos)

Para visualizar o front-end dinâmico e a interface da aplicação em funcionamento, acesse a pasta `/Screenshots` neste repositório.

*(Em breve: GIFs demonstrativos do sistema de iluminação e ciclo dia/noite)*

---

## 👨‍💻 Autor

**Luny Erlon** Desenvolvedor Fullstack | Automação, APIs & Game Dev  
*Engenheiro focado em traduzir regras de negócios complexas e cálculos estruturais em soluções de software eficientes e escaláveis.*

* 🌐 **Portfólio & Infraestrutura:** [portfolioluny.deven.com.br](https://portfolioluny.deven.com.br)
* 🏢 **Iniciativa:** Fundador da Deven (Systems & Games)
