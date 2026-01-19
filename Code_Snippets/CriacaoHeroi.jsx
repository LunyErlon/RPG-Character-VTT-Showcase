import React, { useState, useEffect} from 'react';

import { 
  racaData, 
  classData, 
  antecedentesData, 
  EQUIPAMENTO_INICIAL, 
  PERICIAS_MAP, 
  opcoesPericiasClasse, 
  classeResistenciasData 
} from '../data/dndData';

const CriacaoHeroi = ({ 
  formData, 
  sairEResetarFicha,
  setFormData,
  poolPlayer, 
  setPoolPlayer, 
  onGerarAuto, 
  onGerarManual, 
  onAtribuir,
  abaCriacao,
  setAbaCriacao,
  getMod,
  calcularTotal,
  calcularCA,
  calcularHPInicial,
  toggleMagia,
  calcularLimiteMagias,  
  DATABASE_MAGIAS,
  PROGRESSAO_MAGIAS,
  salvarPersonagem,
  setAbaPlayer,
  // Abas internas
  abaInternaCriacao,
  setAbaInternaCriacao,
  toggleProficiencia
}) => {
  // Estado local para o modo de rolagem (Auto/Manual)
  const [modoManual, setModoManual] = useState(false);

  // Funções auxiliares de cálculo locais para a ficha
  const calcularTotalPericia = (nome) => {
  const atributoRelacionado = PERICIAS_MAP[nome];
  
  // 1. Pegamos o Modificador (Ex: +3) - Garantimos que seja um número
  const modificadorBase = getMod(calcularTotal(formData[atributoRelacionado], atributoRelacionado, formData.raca));
  
  // 2. Verificamos se é proficiente (Classe ou Antecedente)
  const eProficiente = (formData.pericias_selecionadas?.[nome] || 
                       antecedentesData[formData.antecedente]?.pericias?.includes(nome));
  
  // 3. Soma matemática (Se proficiente, soma 2)
  const totalNumerico = Number(modificadorBase) + (eProficiente ? 2 : 0);
  
  // 4. Retornamos apenas o número (A formatação de "+" faremos no HTML)
  return totalNumerico;
};

const calcularTotalResistencia = (atributo) => {
  const modificadorBase = getMod(calcularTotal(formData[atributo], atributo, formData.raca));
  const proficienciasClasse = classeResistenciasData[formData.classe] || [];
  const eProficiente = proficienciasClasse.includes(atributo);
  
  const totalNumerico = Number(modificadorBase) + (eProficiente ? 2 : 0);
  
  return totalNumerico;
};


useEffect(() => {
  setAbaCriacao(1); // Força a primeira aba ao abrir o componente
}, []);

// JSX de renderização

  return (
    <div className="painel-criacao-master">
      {/* 1. NAVEGAÇÃO ENTRE ABAS */}
      <nav className="abas-criacao-nav">
        <button className={abaInternaCriacao === 'caracteristicas' ? 'active' : ''} onClick={() => setAbaInternaCriacao('caracteristicas')}>1. Características</button>
        <button className={abaInternaCriacao === 'descricao' ? 'active' : ''} onClick={() => setAbaInternaCriacao('descricao')}>2. Descrição</button>
        <button className={abaInternaCriacao === 'magias' ? 'active' : ''} onClick={() => setAbaInternaCriacao('magias')}>3. Magias e Truques</button>
        <button className="btn-voltar-home" onClick={sairEResetarFicha}>⬅ Sair</button>
      </nav>

      <section className="criacao-container formulario-pergaminho">
        <div className="conteudo-aba-criacao">
          
          {/* CONTEÚDO: CARACTERÍSTICAS */}
          {abaInternaCriacao === 'caracteristicas' && (
            <div className="aba-caracteristicas-grid">
              
              <header className="ficha-header-identidade">
                <div className="campo-nome-principal">
                  <label>NOME DO PERSONAGEM</label>
                  <input type="text" placeholder="Ex: Arathor" value={formData.nome} onChange={e => setFormData({ ...formData, nome: e.target.value })} />
                </div>
                <div className="linha-identidade-secundaria">
                  <div className="id-box">
                    <label>RAÇA</label>
                    <select value={formData.raca} onChange={e => setFormData({ ...formData, raca: e.target.value })}>
                      {Object.keys(racaData).map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                  <div className="id-box">
                    <label>CLASSE</label>
                    <select value={formData.classe} onChange={e => setFormData({ ...formData, classe: e.target.value })}>
                      {Object.keys(classData).map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="id-box">
                    <label>ANTECEDENTE</label>
                    <select value={formData.antecedente} onChange={e => setFormData({ ...formData, antecedente: e.target.value })}>
                      {Object.keys(antecedentesData).map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                  </div>
                </div>
              </header>

              <div className="corpo-ficha-dnd" style={{ display: 'grid', gridTemplateColumns: '160px 240px 1fr 280px', gap: '20px' }}>
                
                {/* COLUNA 1: ATRIBUTOS */}
                <aside className="col-atributos">
                  <div className="painel-dados-mini">
                    <div className="seletor-modo">
                      <button type="button" onClick={() => setModoManual(false)} className={!modoManual ? 'active' : ''}>Auto</button>
                      <button type="button" onClick={() => setModoManual(true)} className={modoManual ? 'active' : ''}>Manual</button>
                    </div>
                    <button type="button" className="btn-dados" onClick={modoManual ? onGerarManual : onGerarAuto} disabled={poolPlayer.tentativas >= 3}>
                      🎲 Rolar ({poolPlayer.tentativas}/3)
                    </button>
                  </div>

                  {modoManual && (
                    <div className="pool-numeros-dnd">
                      {poolPlayer.numeros.map((n, i) => (
                        <div key={i} className={`n-reserva-dnd ${n.usado ? 'usado' : ''} ${poolPlayer.selecionado === i ? 'foco' : ''}`}
                             onClick={() => !n.usado && setPoolPlayer(prev => ({...prev, selecionado: i}))}>
                          {n.usado ? "✓" : n.valor}
                        </div>
                      ))}
                    </div>
                  )}

                  {['forca', 'destreza', 'constituicao', 'inteligencia', 'sabedoria', 'carisma'].map(attr => {
                    const valorBase = formData[attr] || 0;
                    const total = calcularTotal(valorBase, attr, formData.raca);

                    // 🎯 VERIFICAÇÃO: Se há um dado selecionado na piscina, este card fica "clicável"
                    const podeReceber = poolPlayer.selecionado !== null;

                    return (
                      <div 
                        key={attr} 
                        // ✨ Adicionamos a classe 'pode-receber' se houver um dado selecionado
                        className={`bloco-atributo-dnd ${podeReceber ? 'pode-receber' : ''}`}
                        // 🖱️ Gatilho para alocar o número
                        onClick={() => podeReceber && onAtribuir(attr)}
                        style={{ cursor: podeReceber ? 'pointer' : 'default' }}
                      >
                        <label>{attr.toUpperCase()}</label>

                        <div className="valor-mod">
                          {valorBase === 0 ? "--" : getMod(total)}
                        </div>

                        <div className="valor-base">
                          {valorBase === 0 ? 0 : total}
                        </div>

                        {racaData[formData.raca]?.[attr] > 0 && (
                          <small style={{ color: '#27ae60', fontSize: '0.7rem' }}>
                            +{racaData[formData.raca][attr]} (Raça)
                          </small>
                        )}
                      </div>
                    );
                  })}
                </aside>

                {/* COLUNA 2: BÔNUS, TESTE RESISTÊNCIA E PERÍCIAS */}
                  <section className="col-pericias-salvaguardas">
                    <div className="box-ficha-interna" style={{ marginBottom: '15px', textAlign: 'center' }}>
                      <div className="dnd-text-block" style={{ alignItems: 'center', background: 'rgba(139, 69, 19, 0.1)' }}>
                            <label>Bônus de Proficiência</label>
                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#8b4513', padding: '5px' }}>
                              +2
                            </div>
                            <small style={{ fontSize: '0.6rem', opacity: 0.7 }}>(Nível 1)</small>
                      </div>
                    </div>


                        {/* 2. BOX TESTES DE RESISTÊNCIA (AUTOMÁTICOS) */}
                        <div className="box-ficha-interna" style={{ marginBottom: '20px' }}>
                          <h4>TESTES DE RESISTÊNCIA</h4>
                          <div className="lista-pericias-dnd">
                            {['forca', 'destreza', 'constituicao', 'inteligencia', 'sabedoria', 'carisma'].map(attr => {
                              const proficienciasDaClasse = classeResistenciasData[formData.classe] || [];
                              const eProficiente = proficienciasDaClasse.includes(attr);
                              return (
                                <div key={attr} className="linha-pericia-dnd">
                                  <input type="checkbox" checked={eProficiente} readOnly style={{ cursor: 'default' }} />
                                  <span className="valor-pericia">
                                    {calcularTotalResistencia(attr) >= 0 ? `+${calcularTotalResistencia(attr)}` : calcularTotalResistencia(attr)}
                                  </span>
                                  <div className="pericia-nome-texto">
                                    <span>{attr.charAt(0).toUpperCase() + attr.slice(1)}</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* 3. BOX PERÍCIAS (ESCOLHA LIMITADA PELA CLASSE) */}
                        <div className="box-ficha-interna">
                          <h4>PERÍCIAS</h4>
                          <div className="lista-pericias-dnd">
                            {Object.keys(PERICIAS_MAP).map(nome => {
                              const dadosClasse = opcoesPericiasClasse[formData.classe] || { qtd: 0, opcoes: [] };
                              const periciasDoAntecedente = antecedentesData[formData.antecedente]?.pericias || [];

                              const vindaDoAntecedente = periciasDoAntecedente.includes(nome);
                              const permitidaPelaClasse = dadosClasse.opcoes.includes(nome);
                              const selecionadaPelaClasse = formData.pericias_selecionadas?.[nome] || false;

                              const marcada = vindaDoAntecedente || selecionadaPelaClasse;

                              return (
                                <div 
                                  key={nome} 
                                  className="linha-pericia-dnd"
                                  style={{ opacity: (permitidaPelaClasse || vindaDoAntecedente) ? 1 : 0.4 }}
                                >
                                  <input
                                    type="checkbox"
                                    checked={marcada}
                                    onChange={() => {
                                      // Só permitimos clicar se não vier do antecedente E se for uma opção da classe
                                      if (!vindaDoAntecedente && permitidaPelaClasse) {
                                        toggleProficiencia(nome);
                                      }
                                    }}
                                    // Desabilita se for do antecedente (já é bônus fixo) ou se não for da lista da classe
                                    disabled={vindaDoAntecedente || !permitidaPelaClasse}
                                  />
                                  
                                  <span className="valor-pericia">
                                    {calcularTotalPericia(nome) >= 0 ? `+${calcularTotalPericia(nome)}` : calcularTotalPericia(nome)}
                                  </span>

                                  <div className="pericia-nome-texto">
                                    <span>{nome}</span>
                                    {vindaDoAntecedente && <small style={{ color: '#8b4513' }}> (Antecedente)</small>}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </section>

                      {/* COLUNA 3: CÁLCULOS AUTOMÁTICOS DE CA E INICIATIVA */}
                      <aside className="col-central-stats">
                        <div className="vitals-row-dnd" style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                          {/* CA = 10 + Modificador de Destreza */}
                          <div className="vital-circulo">
                            <span>CA</span>
                            <strong>{calcularCA(formData)}</strong>
                          </div>

                          {/* Círculo de Pontos de Vida Máximos (HP MÁX) */}
                          <div className="vital-circulo" style={{ border: '2px solid #b22222' }}>
                            <span style={{ color: '#b22222' }}>HP MÁX</span>
                            <strong>{calcularHPInicial(formData) || 10}</strong>
                          </div>

                          {/* Iniciativa = Modificador de Destreza */}
                          <div className="vital-circulo">
                            <span>INICIATIVA</span>
                            <strong>
                              {isNaN(getMod(calcularTotal(formData.destreza, 'destreza', formData.raca)))
                              ? "+0"
                              : getMod(calcularTotal(formData.destreza, 'destreza', formData.raca))}
                            </strong>
                          </div>

                          {/* Deslocamento = Valor da Raça */}
                          <div className="vital-circulo">
                            <span>DESL.</span>
                            <strong>{formData.deslocamento || 9}m</strong>
                          </div>
                        </div>

                        <div className="personality-fields">
                          <div className="dnd-text-block">
                            <label>Traços de Personalidade</label>
                            <textarea
                              className="dnd-textarea-standard"
                              rows="3"
                              placeholder="Traços de Personalidade"
                              value={formData.personalidade || ''}
                              onChange={(e) => setFormData({...formData, personalidade: e.target.value})}
                            ></textarea>
                          </div>

                          <div className="dnd-text-block">
                            <label>Ideais</label>
                            <textarea
                              className="dnd-textarea-standard"
                              rows="2"
                              placeholder="No que ele(a) acredita?"
                              value={formData.ideais || ''}
                              onChange={(e) => setFormData({...formData, ideais: e.target.value})}
                            ></textarea>
                          </div>

                          <div className="dnd-text-block">
                            <label>Ligações</label>
                            <textarea
                              className="dnd-textarea-standard"
                              rows="2"
                              placeholder="Pessoas ou lugares importantes?"
                              value={formData.ligacoes || ''}
                              onChange={(e) => setFormData({...formData, ligacoes: e.target.value})}
                            ></textarea>
                          </div>

                          <div className="dnd-text-block">
                            <label>Defeitos</label>
                            <textarea
                              className="dnd-textarea-standard"
                              rows="2"
                              placeholder="Traços de Personalidade"
                              value={formData.defeitos || ''}
                              onChange={(e) => setFormData({...formData, defeitos: e.target.value})}
                            ></textarea>
                          </div>
                        </div>
                      </aside>


                      {/* COLUNA 4: PROFICIÊNCIAS E EQUIPAMENTOS (Agora Padronizados!) */}
                      <aside className="col-textos-longos" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <div className="dnd-text-block" style={{ flex: 1 }}>
                          <label>Outras Proficiências e Idiomas</label>
                          <textarea
                            className="dnd-textarea-standard"
                            style={{ height: '200px' }} // Altura maior para proficiências
                            placeholder="Descreva aqui outras proficiências e idiomas do seu personagem..."
                            value={formData.anotacoes || ''}
                            onChange={e => setFormData({ ...formData, anotacoes: e.target.value })}
                          ></textarea>
                        </div>

                        {/* ESCOLHA DE ARMADURA */}
                        <div className="dnd-text-block">
                          <label>Armadura de Classe</label>
                          <div className="opcoes-arsenal">
                            {EQUIPAMENTO_INICIAL[formData.classe]?.armadura?.map((arm, i) => (
                              <label key={i} className="radio-dnd">
                                <input
                                  type="radio"
                                  name="armadura"
                                  onChange={() => setFormData({ ...formData, armadura_selecionada: arm })}
                                  checked={formData.armadura_selecionada?.nome === arm.nome}
                                />
                                {arm.nome} (Base {arm.ca})
                              </label>
                            )) || <small>Esta classe não inicia com armaduras.</small>}
                          </div>
                        </div>

                        {/* ESCOLHA DE ARMAS */}
                        <div className="dnd-text-block">
                          <label>Armas Iniciais</label>
                          <div className="opcoes-arsenal">
                            {EQUIPAMENTO_INICIAL[formData.classe]?.armas?.map((arma, i) => (
                              <label key={i} className="radio-dnd">
                                <input 
                                type="radio" 
                                name="arma" 
                                value={arma}
                                // 🛡️ O '|| []' garante que, se for undefined, ele trate como lista vazia
                                checked={(formData.armas_selecionadas || []).includes(arma)}
                                onChange={() => setFormData({ 
                                  ...formData, 
                                  armas_selecionadas: [arma] 
                                })} 
                              />
                                {arma}
                              </label>
                            )) || <small>Selecione uma classe.</small>}
                          </div>
                        </div>

                        {/* INSTRUMENTOS (EXCLUSIVO BARDO) */}
                        {formData.classe === 'Bardo' && (
                          <div className="dnd-text-block">
                            <label>Instrumento Musical (Escolha 1)</label>
                            <select 
                              className="id-box select"
                              value={formData.equipamento_escolhido || ""}
                              onChange={(e) => setFormData({ 
                                ...formData, 
                                equipamento_escolhido: e.target.value 
                              })}
                            >
                              <option value="" disabled>Selecione um instrumento...</option>
                              {EQUIPAMENTO_INICIAL['Bardo'].instrumentos.map(inst => (
                                <option key={inst} value={inst}>{inst}</option>
                              ))}
                            </select>
                          </div>
                        )}

                        <div className="dnd-text-block" style={{ flex: 1 }}>
                          <label>Outros Itens na Mochila</label>
                          <textarea
                            className="dnd-textarea-standard"
                            placeholder="Tochas, Rações, Cordas..."
                            rows="4"
                             value={formData.inventario || ''}
                             onChange={(e) => setFormData({...formData, inventario: e.target.value})}

                          ></textarea>
                        </div>
                      </aside>
                    </div>
                  </div>
          )}
             

            {/* --- ABA 2: DESCRIÇÃO --- */}
          {abaInternaCriacao === 'descricao' && (
            <div className="aba-descricao-grid">
              <div className="corpo-ficha-dnd" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

                {/* COLUNA 1: HISTÓRIA E APARÊNCIA */}
                <div className="col-narrativa" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <div className="dnd-text-block">
                    <label>📜 História do Personagem</label>
                    <textarea
                      className="dnd-textarea-standard"
                      style={{ height: '350px' }}
                      placeholder="Conte a trajetória do seu herói..."
                      value={formData.historia || ''}
                      onChange={e => setFormData({ ...formData, historia: e.target.value })}
                    ></textarea>
                  </div>

                  <div className="dnd-text-block">
                    <label>🎭 Aparência (Olhos, Cabelo, Pele, Idade, Peso)</label>
                    <textarea
                      className="dnd-textarea-standard"
                      rows="5"
                      placeholder="Ex: Cicatriz no olho esquerdo, 1.80m, trajes nobres..."
                      value={formData.aparencia || ''}
                      onChange={e => setFormData({ ...formData, aparencia: e.target.value })}
                    ></textarea>
                  </div>
                </div>

                {/* COLUNA 2: ALIADOS E TESOUROS */}
                <div className="col-extras" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <div className="dnd-text-block">
                    <label>🤝 Aliados e Organizações</label>
                    <textarea
                      className="dnd-textarea-standard"
                      style={{ height: '200px' }}
                      placeholder="Símbolos, facções e companheiros..."
                      value={formData.aliados || ''}
                      onChange={e => setFormData({ ...formData, aliados: e.target.value })}
                    ></textarea>
                  </div>

                  <div className="dnd-text-block">
                    <label>💰 Tesouros e Outros Bens</label>
                    <textarea
                      className="dnd-textarea-standard"
                      style={{ height: '260px' }}
                      placeholder="Relíquias, moedas e itens de valor sentimental..."
                      value={formData.tesouros || ''}
                      onChange={e => setFormData({ ...formData, tesouros: e.target.value })}
                    ></textarea>
                  </div>

                  <div className="dnd-text-block">
                    <label>⚔️ Outras Características e Habilidades</label>
                    <textarea
                      className="dnd-textarea-standard"
                      rows="4"
                      placeholder="Habilidades especiais de raça ou histórico..."
                      value={formData.outras_habilidades || ''}
                      onChange={e => setFormData({ ...formData, outras_habilidades: e.target.value })}
                    ></textarea>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* --- ABA 3: MAGIAS E TRUQUES --- */}
          {abaInternaCriacao === 'magias' && (
            <div className="aba-magias-grid">
              
              {/* 1. PAINEL DE ESTATÍSTICAS ARCANAS (Contadores Dinâmicos) */}
              <div className="vtt-stats-grid" style={{ marginBottom: '20px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                
                <div className="vtt-stat">
                  TRUQUES
                  <strong>
                    {(formData.magias_selecionadas?.[0]?.length || 0)} / {calcularLimiteMagias(formData, PROGRESSAO_MAGIAS, getMod).truques}
                  </strong>
                </div>

                <div className="vtt-stat">
                  MAGIAS (Nível 1)
                  <strong>
                    {(formData.magias_selecionadas?.[1]?.length || 0)} / {calcularLimiteMagias(formData, PROGRESSAO_MAGIAS, getMod).magias}
                  </strong>
                </div>

                <div className="vtt-stat">
                  ESPAÇOS (Slots) 
                  <strong>{PROGRESSAO_MAGIAS[formData.classe]?.slots?.[1] || 0}</strong>
                </div>

                <div className="vtt-stat">
                  HABILIDADE DE CONJURAÇÃO 
                  <strong>{PROGRESSAO_MAGIAS[formData.classe]?.preparadas || 'Não se aplica'}</strong>
                </div>

              </div>

              {/* 2. SELEÇÃO DE MAGIAS POR COLUNA */}
              <div className="corpo-ficha-dnd">
                
                {/* VERIFICAÇÃO DE SEGURANÇA: A classe possui magias no banco de dados? */}
                {DATABASE_MAGIAS[formData.classe] ? (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    
                    {/* COLUNA 1: TRUQUES (CANTRIPS) */}
                    <div className="dnd-text-block">
                      <label>🪄 Truques Disponíveis para {formData.classe.toUpperCase()}</label>
                      <div className="lista-magias-selecao" style={{ maxHeight: '400px', overflowY: 'auto', background: 'rgba(0,0,0,0.02)', padding: '10px', borderRadius: '5px' }}>
                        {DATABASE_MAGIAS[formData.classe]?.[0]?.map(mensagem_magia => (
                          <div key={mensagem_magia} className="linha-pericia-dnd">
                            <input
                              type="checkbox"
                              checked={formData.magias_selecionadas?.[0]?.includes(mensagem_magia) || false}
                              onChange={() => toggleMagia(mensagem_magia, 0)}
                            />
                            <span>{mensagem_magia}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* COLUNA 2: MAGIAS NÍVEL 1 */}
                    <div className="dnd-text-block">
                      <label>📜 Magias de Nível 1 para {formData.classe.toUpperCase()}</label>
                      <div className="lista-magias-selecao" style={{ maxHeight: '400px', overflowY: 'auto', background: 'rgba(0,0,0,0.02)', padding: '10px', borderRadius: '5px' }}>
                        {DATABASE_MAGIAS[formData.classe]?.[1]?.map(mensagem_magia => (
                          <div key={mensagem_magia} className="linha-pericia-dnd">
                            <input
                              type="checkbox"
                              checked={formData.magias_selecionadas?.[1]?.includes(mensagem_magia) || false}
                              onChange={() => toggleMagia(mensagem_magia, 1)}
                            />
                            <span>{mensagem_magia}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                ) : (
                  /* MENSAGEM PARA CLASSES SEM MAGIA (Exemplo: Bárbaro ou Guerreiro) */
                  <div className="aviso-sem-magia" style={{ textAlign: 'center', padding: '40px', background: 'rgba(139, 69, 19, 0.05)', borderRadius: '10px', border: '1px dashed #8b4513' }}>
                    <p style={{ color: '#8b4513', fontWeight: 'bold' }}>
                      Esta classe foca em habilidades marciais e não utiliza magias no nível 1.
                    </p>
                  </div>
                )}
              </div>

              {/* 3. ÁREA DE FINALIZAÇÃO */}
              <div className="area-acoes-final" style={{ marginTop: '30px', textAlign: 'center' }}>
                <hr className="divisor-pergaminho" style={{ opacity: 0.3, marginBottom: '20px' }} />

                <button
                  className="btn-finalizar-heroi"
                  onClick={salvarPersonagem}
                  style={{
                    padding: '15px 40px',
                    fontSize: '1.2rem',
                    backgroundColor: '#8b4513',
                    color: 'white',
                    border: '2px solid #d4af37',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
                  }}
                >
                  🔥 Lacrar Pergaminho de Herói
                </button>
                
                <p style={{ color: '#8b4513', fontSize: '0.85rem', marginTop: '10px', fontStyle: 'italic' }}>
                  * Ao clicar, as informações serão registradas permanentemente na Taverna.
                </p>
              </div>

            </div>
          )}

        </div>
      </section>
    </div>
  );

};







export default CriacaoHeroi;