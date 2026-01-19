// src/utils/dndMath.js
import { 
  racaData, 
  classData, 
  PERICIAS_MAP, 
  DB_ARMAS_DETALHES, 
  DADOS_VIDA_CLASSE, 
  PROGRESSAO_MAGIAS, 
  classeResistenciasData 
} from '../data/dndData';

// =============================================================================
// 1. CÁLCULOS DE BASE (MODIFICADORES E ATRIBUTOS)
// =============================================================================

/**
 * Calcula o modificador clássico de D&D 5e.
 * Formula: $$Modificador = \lfloor \frac{Atributo - 10}{2} \rfloor$$
 */
export const getMod = (valor) => {
  const num = Number(valor) || 10;
  const mod = Math.floor((num - 10) / 2);
  return mod >= 0 ? `+${mod}` : mod;
};

/**
 * Calcula o valor total de um atributo somando a base e o bônus racial.
 */
// No seu arquivo dndMath.js
export const calcularTotal = (valorBase, atributo, racaNome) => {
  const base = Number(valorBase) || 0;
  
  // 🛡️ Busca o bônus no racaData. Se não existir, o bônus é 0.
  const bonusRacial = racaData[racaNome]?.[atributo] || 0;
  
  return base + bonusRacial;
};


// =============================================================================
// 2. CÁLCULOS DE FICHA (PLAYER E NPC)
// =============================================================================

/**
 * Calcula o valor final de uma perícia com proficiência.
 */
export const calcularPericia = (entidade, nomePericia) => {
  const atributoBase = PERICIAS_MAP[nomePericia];
  const valorAtributo = entidade[atributoBase] || 10;
  const mod = Math.floor((valorAtributo - 10) / 2);
  
  const eProficiente = entidade.pericias_selecionadas?.[nomePericia];
  const bonus = eProficiente ? (entidade.bonus_proficiencia || 2) : 0;
  
  const total = mod + bonus;
  return total >= 0 ? `+${total}` : total;
};

/**
 * Calcula a Classe de Armadura (CA) baseada no tipo de proteção.
 */
export const calcularCA = (dados) => {
  // 1. Se os dados não existem ou estão vazios, para aqui.
  if (!dados || !dados.destreza) return 10; 

  try {
    // 2. Calculamos o valor total de Destreza (Base + Raça)
    // Passamos 'dados' (o objeto completo) para o calcularTotal
    const valorDes = calcularTotal(dados.destreza, 'destreza', dados);
    
    // 3. Calculamos o modificador
    const modDes = Math.floor((valorDes - 10) / 2);    
    const armadura = dados.armadura_selecionada;

    // 4. Lógica de cálculo por tipo de armadura
    if (!armadura || armadura.tipo === 'nenhuma' || armadura.tipo === 'nenhum') {
      return 10 + modDes;
    }

    if (armadura.tipo === 'leve') {
      return (armadura.ca || 10) + modDes;
    }

    if (armadura.tipo === 'media') {
      return (armadura.ca || 10) + (modDes > 2 ? 2 : modDes);
    }

    if (armadura.tipo === 'pesada') {
      return (armadura.ca || 10);
    }

    return 10 + modDes;
  } catch (error) {
    console.error("Erro no cálculo de CA:", error);
    return 10; // Retorno de segurança
  }
};

export const calcularHPInicial = (dados, dadosDasClasses) => {
  // 1. Verificação básica
  if (!dados || !dados.classe) return 0;

  // 2. Busca o HP Base da Classe (Ex: 10)
  const hpBase = Number(dadosDasClasses[dados.classe]?.hp_inicial) || 8;

  // 3. Busca o bônus da Raça (Ex: +2)
  const bonusRaca = Number(racaData[dados.raca]?.constituicao) || 0;

  // 4. Calcula o Valor Total de Constituição
  const conTotal = Number(dados.constituicao || 10) + bonusRaca;

  // 5. CÁLCULO DO MODIFICADOR (Puro, sem texto "+" ou "-")
  const modPuro = Math.floor((conTotal - 10) / 2);

  // 6. Retorna a soma matemática real
  return hpBase + modPuro;
};

// =============================================================================
// 3. REGRAS DE MAGIA E RESISTÊNCIA
// =============================================================================

export const calcularTotalResistencia = (attr, dados) => {
  const valorAtributo = dados[attr] || 10;
  const mod = Math.floor((valorAtributo - 10) / 2);
  const proficienciasDaClasse = classeResistenciasData[dados.classe] || [];
  const bonusProfic = proficienciasDaClasse.includes(attr) ? (dados.bonus_proficiencia || 2) : 0;
  
  const total = mod + bonusProfic;
  return total >= 0 ? `+${total}` : total;
};


export const calcularLimiteMagias = (dados, PROGRESSAO, modFunc) => {
  // 🛡️ PROTEÇÃO: Se 'dados' for undefined ou null, retorna valores zerados imediatamente
  if (!dados || !dados.classe) {
    return { truques: 0, magias: 0 };
  }

  const classe = dados.classe;
  const progressao = PROGRESSAO[classe];

  if (!progressao) return { truques: 0, magias: 0 };

  const truques = progressao.truques || 0;
  let magias = 0;

  if (progressao.preparadas === 'modificador') {
    const atributo = progressao.atributoChave || 'inteligencia';
    // Garantimos que passamos um valor numérico para o modFunc
    const valorAtributo = dados[atributo] || 10;
    const mod = parseInt(modFunc(valorAtributo)) || 0;
    magias = Math.max(1, mod + 1);
  } else {
    magias = progressao.magias_conhecidas || 2;
  }

  return { truques, magias };
};


// =============================================================================
// 4. ESPECÍFICOS DE NPC E MONSTROS
// =============================================================================

export const calcularHPMaximoNPC = (dados) => {
  const vidaBase = DADOS_VIDA_CLASSE[dados.classe] || 8;
  const modCon = Math.floor(((dados.constituicao || 10) - 10) / 2);

  let multiplicadorCR = 1;
  const cr = dados.nivel_desafio;
  if (cr === "1/2" || cr === "1") multiplicadorCR = 2;
  else if (parseInt(cr) > 1) multiplicadorCR = parseInt(cr) * 2;

  const resultado = (vidaBase + modCon) * multiplicadorCR;
  return resultado > 0 ? resultado : 1;
};

export const calcularAcertoNPC = (armaNome, dados) => {
  const arma = DB_ARMAS_DETALHES[armaNome] || { atributo: 'forca' };
  const mod = Math.floor(((dados[arma.atributo] || 10) - 10) / 2);
  const total = mod + (dados.bonus_proficiencia || 2);
  return total >= 0 ? `+${total}` : total;
};

export const calcularDanoNPC = (armaNome, dados) => {
  const arma = DB_ARMAS_DETALHES[armaNome] || { dado: '1d4', atributo: 'forca' };
  const mod = Math.floor(((dados[arma.atributo] || 10) - 10) / 2);
  return mod === 0 ? arma.dado : `${arma.dado} ${mod > 0 ? '+' : ''}${mod}`;
};

// =============================================================================
// 5. UTILITÁRIOS DE ROLAGEM
// =============================================================================

export const rolar4d6DropLowest = () => {
  let dados = Array.from({ length: 4 }, () => Math.floor(Math.random() * 6) + 1);
  dados.sort((a, b) => a - b);
  dados.shift(); 
  return dados.reduce((a, b) => a + b, 0);
};

export const calcularHPMaximo = (dados) => {
  const hpBaseClasse = classData[dados.classe] || 8;
  const conTotal = calcularTotal(dados.constituicao, 'constituicao', dados.raca);
  const modCon = Math.floor((conTotal - 10) / 2);
  const resultado = hpBaseClasse + modCon;
  return resultado > 0 ? resultado : 1;
};