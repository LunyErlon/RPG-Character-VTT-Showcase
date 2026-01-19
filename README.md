# ⚔️ RPG Virtual Tabletop (VTT) & Character Manager

**⚠️ PROJETO EM DESENVOLVIMENTO COMERCIAL**

> Este repositório contém a documentação técnica e amostras de código de um software proprietário (SaaS) que estou desenvolvendo. Para proteger a propriedade intelectual do produto, o código-fonte completo não está disponível publicamente.
>
> **Recrutadores e Gestores:** Disponibilizei trechos chaves da arquitetura na pasta `/Code_Snippets` para análise técnica.

---

## 🚀 Visão Geral
Aplicação Fullstack para facilitar sessões de RPG de mesa. O sistema atua como um VTT (Virtual Tabletop), gerenciando criação de fichas e persistência de dados de campanha.

## 🏗 Arquitetura
O projeto utiliza uma arquitetura desacoplada para performance:
- **Core Logic (Client-Side):** Módulos JavaScript (`dndMath.js`) processam as regras matemáticas e rolagens de dados no frontend, garantindo feedback instantâneo ao usuário.
- **Frontend:** React.js (Interface Reativa).
- **Backend API:** Python (FastAPI) atua como camada de transporte e orquestração.
- **Database:** MySQL.

## 💻 Amostras de Código Disponíveis
Você pode visualizar a qualidade do meu código nos arquivos da pasta `/Code_Snippets`:

1. **dndMath.js:** Biblioteca de funções lógicas para regras de RPG (Rolagem de dados, modificadores e validações).
2. **main.py (Backend):** Estrutura da API em FastAPI, atuando como orquestrador entre o Frontend e o Banco de Dados MySQL.
3. **CriacaoHeroi.jsx (Frontend):** Componente React principal para a interface de construção de personagens.

## 📸 Screenshots
Na pasta Screenshots

---
Developed by **Luny Erlon**
