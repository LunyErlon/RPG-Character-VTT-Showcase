from fastapi import FastAPI
from pydantic import BaseModel
from typing import Optional, Dict, Any
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Any, Dict, Optional
import json
import mysql.connector

# =============================================================================
# MODELOS DE DADOS (SCHEMAS)
# =============================================================================

# Modelo para criação de personagem (POST)
class PersonagemSchema(BaseModel):
    nome: str
    raca: str
    classe: str
    antecedente: str
    forca: int
    destreza: int
    constituicao: int
    inteligencia: int
    sabedoria: int
    carisma: int
    hp_maximo: int
    nivel: int
    experiencia: int
    hp_atual: int
    deslocamento: int
    ca: int
    bonus_proficiencia: int
    # --- NOVOS CAMPOS DA ABA 1 ---
    personalidade: Optional[str] = ""
    ideais: Optional[str] = ""
    defeitos: Optional[str] = ""
    inventario: Optional[str] = ""
    anotacoes: Optional[str] = ""
    # --- NOVOS CAMPOS DE NARRATIVA ---
    historia: Optional[str] = ""
    aparencia: Optional[str] = ""
    aliados: Optional[str] = ""
    tesouros: Optional[str] = ""
    outras_habilidades: Optional[str] = ""
    armas_selecionadas: Optional[List[Any]] = []
    equipamento_escolhido: Optional[str] = ""
    # ---------------------------------
    pericias_selecionadas: Optional[Dict[str, Any]] = None
    magias_selecionadas: Optional[Dict[str, Any]] = None
    armadura_selecionada: Optional[Dict[str, Any]] = None

# Modelo para atualização apenas das notas (PATCH)
class NotaUpdate(BaseModel):
    anotacoes: str

# Modelo de dados para validação
class SessaoSchema(BaseModel):
    sessao_id: str
    titulo: str
    prefacio: str

# Modelo para novo capítulo (POST)
class CapituloSchema(BaseModel):
    titulo: str

#Modelo para o bestiário (POST)

class MonstroSchema(BaseModel):
    nome: str
    ca: int
    hp: int
    deslocamento: str
    forca: int
    destreza: int
    constituicao: int
    inteligencia: int
    sabedoria: int
    carisma: int
    resistencia: str = ""
    imunidade_dano: str = ""
    imunidade_condicao: str = ""
    sentidos: str = ""
    idioma: str = ""
    nivel_desafio: str
    acoes: str

# Modelo para NPCs (POST)

class NPCSchema(BaseModel):
    nome: str
    raca: str
    classe: str
    antecedente: Optional[str] = "Nenhum"
    nivel_desafio: str # Faltava aqui
    bonus_proficiencia: int # Faltava aqui
    forca: int
    destreza: int
    constituicao: int
    inteligencia: int
    sabedoria: int
    carisma: int
    hp_maximo: int
    ca: int
    deslocamento: Optional[int] = 9
    historia: Optional[str] = ""
    aparencia: Optional[str] = ""
    aliados: Optional[str] = ""
    tesouros: Optional[str] = ""
    pericias_selecionadas: Optional[Dict[str, Any]] = None # Faltava aqui
    magias_selecionadas: Optional[Dict[str, Any]] = None # Faltava aqui

class GenericUpdate(BaseModel):
    campo: str
    valor: Any


# =============================================================================
# CONFIGURAÇÃO DA APLICAÇÃO
# =============================================================================

app = FastAPI()

# 🛡️ CONFIGURAÇÃO DO CORS
# Vamos liberar para todas as origens durante o desenvolvimento
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Em produção, você colocaria o endereço do seu site aqui
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configurações do seu MySQL
db_config = {
    "host": "localhost",
    "user": "root",
    "password": "Siegfred@007",
    "database": "simulador_rpg"
}

db = mysql.connector.connect(
    host="localhost",
    user="root",         # Seu usuário do MySQL
    password="Siegfred@007", # Sua senha do MySQL
    database="simulador_rpg" # O nome do banco (onde criou a tabela sessoes)
)

# =============================================================================
# ROTAS DA API
# =============================================================================

@app.get("/")
def home():
    return {"mensagem": "Simulador de RPG Online Ativo!"}

# 1. LISTAR TODOS OS PERSONAGENS
@app.get("/personagens/")
def listar_personagens():
    try:
        conexao = mysql.connector.connect(**db_config)
        cursor = conexao.cursor(dictionary=True) 
        cursor.execute("SELECT * FROM personagens ORDER BY id DESC")
        lista = cursor.fetchall()

        # 🛡️ TRATAMENTO: Convertemos as strings JSON de cada personagem para objetos reais
        for p in lista:
            if p.get('pericias_selecionadas'):
                p['pericias_selecionadas'] = json.loads(p['pericias_selecionadas'])
            if p.get('magias_selecionadas'):
                p['magias_selecionadas'] = json.loads(p['magias_selecionadas'])

        cursor.close()
        conexao.close()
        return lista
    except Exception as e:
        print(f"Erro ao listar: {e}")
        return []

# 2. BUSCAR UM PERSONAGEM ESPECÍFICO
@app.get("/personagem/{id}")
def buscar_personagem(id: int):
    conexao = None
    cursor = None
    try:
        conexao = mysql.connector.connect(**db_config)
        cursor = conexao.cursor(dictionary=True) # <--- DEFINIDO AQUI (como dicionário facilita o JSON)

        cursor.execute("SELECT * FROM personagens WHERE id = %s", (id,))
        registro = cursor.fetchone()

        if registro:
            # Converte as strings JSON do banco de volta para objetos Python
            if registro['pericias_selecionadas']:
                registro['pericias_selecionadas'] = json.loads(registro['pericias_selecionadas'])
            if registro['magias_selecionadas']:
                registro['magias_selecionadas'] = json.loads(registro['magias_selecionadas'])
            return registro
        
        return {"erro": "Personagem não encontrado"}

    except Exception as e:
        return {"erro_tecnico": str(e)}
    finally:
        if cursor: cursor.close()
        if conexao: conexao.close()

# 3. CRIAR NOVO PERSONAGEM (POST)
@app.post("/personagem/")
def criar_personagem(p: PersonagemSchema):
    conexao = None
    cursor = None
    try:
        conexao = mysql.connector.connect(**db_config)
        cursor = conexao.cursor()

        # 📦 Transformando objetos complexos em Strings JSON para o Banco
        pericias_json = json.dumps(p.pericias_selecionadas)
        magias_json = json.dumps(p.magias_selecionadas)
        armadura_json = json.dumps(p.armadura_selecionada) # Novo!
        armas_json = json.dumps(p.armas_selecionadas)      # Novo!

        comando = """
        INSERT INTO personagens 
        (nome, raca, classe, antecedente, forca, destreza, constituicao, inteligencia, sabedoria, carisma, 
        hp_maximo, nivel, experiencia, hp_atual, deslocamento, ca, bonus_proficiencia, 
        historia, aparencia, aliados, tesouros, outras_habilidades,
        personalidade, ideais, defeitos, inventario, anotacoes,
        pericias_selecionadas, magias_selecionadas, 
        armadura_selecionada, armas_selecionadas, equipamento_escolhido)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """

        # ⚠️ A contagem aqui deve ser EXATAMENTE 32 itens para bater com o comando acima
        valores = (
            p.nome, p.raca, p.classe, p.antecedente, p.forca, p.destreza, 
            p.constituicao, p.inteligencia, p.sabedoria, p.carisma, 
            p.hp_maximo, p.nivel, p.experiencia, p.hp_atual, p.deslocamento,
            p.ca, p.bonus_proficiencia, 
            p.historia, p.aparencia, p.aliados, p.tesouros, p.outras_habilidades,
            p.personalidade, p.ideais, p.defeitos, p.inventario, p.anotacoes,
            pericias_json, magias_json, 
            armadura_json, armas_json, p.equipamento_escolhido # <--- OS 3 FALTANTES AQUI!
        )

        cursor.execute(comando, valores)
        conexao.commit()
        return {"mensagem": "Herói salvo!", "id": cursor.lastrowid}

    except Exception as erro_real:
        print(f"❌ ERRO NO BANCO: {erro_real}") 
        return JSONResponse(status_code=500, content={"erro_tecnico": str(erro_real)})
    finally:
        if cursor: cursor.close()
        if conexao: conexao.close()

# 4. EXCLUIR PERSONAGEM (DELETE)
@app.delete("/personagem/{personagem_id}")
def excluir_personagem(personagem_id: int):
    try:
        conexao = mysql.connector.connect(**db_config)
        cursor = conexao.cursor()
        cursor.execute("DELETE FROM personagens WHERE id = %s", (personagem_id,))
        conexao.commit()
        cursor.close()
        conexao.close()
        return {"mensagem": "Removido!"}
    except Exception as e:
        return {"erro_tecnico": str(e)}

# 5. ATUALIZAR NOTAS (PATCH) - CORRIGIDO
@app.patch("/personagem/{personagem_id}/notas")
def atualizar_notas(personagem_id: int, nota: NotaUpdate):
    try:
        # Criamos a conexão local como nas outras rotas
        conexao = mysql.connector.connect(**db_config)
        cursor = conexao.cursor()
        
        sql = "UPDATE personagens SET anotacoes = %s WHERE id = %s"
        val = (nota.anotacoes, personagem_id)
        
        cursor.execute(sql, val)
        conexao.commit()
        
        cursor.close()
        conexao.close()
        return {"status": "sucesso", "mensagem": "Anotações sincronizadas!"}
    except Exception as e:
        return {"status": "erro", "mensagem": str(e)}
    
# 6. ROTA PARA SALVAR SESSÃO (POST)

@app.post("/sessao/")
async def criar_sessao(sessao: SessaoSchema):
    cursor = db.cursor()
    sql = "INSERT INTO sessoes (sessao_id, titulo, prefacio) VALUES (%s, %s, %s)"
    valores = (sessao.sessao_id, sessao.titulo, sessao.prefacio)
    cursor.execute(sql, valores)
    db.commit()
    return {"status": "Sessão gravada com sucesso!"}

# 7. ROTA PARA LISTAR SESSÕES

@app.get("/sessoes/")
async def listar_sessoes():
    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT * FROM sessoes ORDER BY data_criacao DESC")
    return cursor.fetchall()

# 8. ROTA PARA DELETAR SESSÃO

@app.delete("/sessao/{sessao_id}")
async def excluir_sessao(sessao_id: str):
    try:
        if not db.is_connected():
            db.reconnect()
            
        cursor = db.cursor()
        
        # SQL para apagar a sessão específica
        sql = "DELETE FROM sessoes WHERE sessao_id = %s"
        cursor.execute(sql, (sessao_id,))
        
        db.commit()
        cursor.close()
        
        return {"status": "sucesso", "mensagem": f"Sessão {sessao_id} apagada com sucesso!"}
    except Exception as e:
        print(f"❌ Erro ao apagar sessão: {str(e)}")
        return {"status": "erro", "detalhe": str(e)}
    
# 9. ROTA PARA ADICIONAR CAPÍTULO A UMA SESSÃO

@app.post("/sessao/{sessao_id}/capitulo/")
async def criar_capitulo(sessao_id: str, cap: CapituloSchema):
    cursor = db.cursor()
    sql = "INSERT INTO capitulos (sessao_id, titulo) VALUES (%s, %s)"
    cursor.execute(sql, (sessao_id, cap.titulo))
    db.commit()
    cursor.close()
    return {"status": "Capítulo inaugurado!"}

# 10. ROTA PARA LISTAR CAPÍTULOS DE UMA SESSÃO

@app.get("/sessao/{sessao_id}/capitulos/")
async def listar_capitulos(sessao_id: str):
    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT * FROM capitulos WHERE sessao_id = %s ORDER BY id ASC", (sessao_id,))
    resultado = cursor.fetchall()
    cursor.close()
    return resultado

# 11. ROTA PARA ADICIONAR MONSTRO AO BESTIÁRIO

@app.post("/monstro/")
async def criar_monstro(m: MonstroSchema):
    try:
        if not db.is_connected():
            db.reconnect()

        cursor = db.cursor()
        sql = """INSERT INTO monstros 
                (nome, ca, hp, deslocamento, forca, destreza, constituicao, inteligencia, sabedoria, carisma, 
                resistencia, imunidade_dano, imunidade_condicao, sentidos, idioma, nivel_desafio, acoes) 
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)"""
        valores = (m.nome, m.ca, m.hp, m.deslocamento, m.forca, m.destreza, m.constituicao, m.inteligencia, 
                m.sabedoria, m.carisma, m.resistencia, m.imunidade_dano, m.imunidade_condicao, 
                m.sentidos, m.idioma, m.nivel_desafio, m.acoes)
        cursor.execute(sql, valores)
        db.commit()
        cursor.close()

        print(f"🐉 Monstro {m.nome} catalogado com sucesso!")
        return {"status": "sucesso"}
    except Exception as e:
        print(f"❌ Erro ao salvar monstro: {str(e)}")
        return {"status": "erro", "detalhe": str(e)}
    
# 12. ROTA PARA CRIAÇÂO NPCS

@app.post("/npc/")
async def salvar_npc(n: NPCSchema):
    try:
        if not db.is_connected():
            db.reconnect()
        
        cursor = db.cursor()

        # Convertendo objetos complexos para string JSON
        magias_json = json.dumps(n.magias_selecionadas) if n.magias_selecionadas else "{}"
        pericias_json = json.dumps(n.pericias_selecionadas) if n.pericias_selecionadas else "{}"

        # SQL Atualizado com Nível de Desafio e Perícias
        sql = """INSERT INTO npcs 
                 (nome, raca, classe, antecedente, nivel_desafio, bonus_proficiencia,
                  forca, destreza, constituicao, inteligencia, sabedoria, carisma, 
                  hp_maximo, hp_atual, ca, deslocamento, historia, aparencia, 
                  aliados, tesouros, magias_selecionadas, pericias_selecionadas) 
                 VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)"""
        
        valores = (
            n.nome, n.raca, n.classe, n.antecedente, n.nivel_desafio, n.bonus_proficiencia,
            n.forca, n.destreza, n.constituicao, n.inteligencia, n.sabedoria, n.carisma,
            n.hp_maximo, n.hp_maximo, n.ca, n.deslocamento, n.historia, n.aparencia,
            n.aliados, n.tesouros, magias_json, pericias_json
        )

        cursor.execute(sql, valores)
        db.commit()
        cursor.close()

        return {"status": "sucesso", "mensagem": f"NPC {n.nome} registrado no Bestiário!"}

    except Exception as e:
        print(f"Erro técnico ao salvar NPC: {e}")
        return {"status": "erro", "detalhe": str(e)}    
    
    
# 13. ROTA PARA LISTAR TODOS OS NPCS

@app.get("/npcs/")
async def listar_npcs():
    try:
        if not db.is_connected():
            db.reconnect()
        
        cursor = db.cursor(dictionary=True) # Retorna como dicionário Python
        cursor.execute("SELECT * FROM npcs ORDER BY id DESC")
        npcs = cursor.fetchall()
        
        # Converte a string JSON de magias de volta para objeto
        for npc in npcs:
            if npc['magias_selecionadas']:
                npc['magias_selecionadas'] = json.loads(npc['magias_selecionadas'])
        
        cursor.close()
        return npcs
    except Exception as e:
        return {"status": "erro", "detalhe": str(e)}
    
# 14. ROTA GENÉRICA PARA ATUALIZAÇÃO DE CAMPOS

@app.patch("/personagem/{personagem_id}/update_field")
def atualizar_campo_generico(personagem_id: int, up: GenericUpdate):
    try:
        conexao = mysql.connector.connect(**db_config)
        cursor = conexao.cursor()
        
        # ATENÇÃO: Em sistemas reais, validaríamos se 'up.campo' é um nome de coluna seguro
        sql = f"UPDATE personagens SET {up.campo} = %s WHERE id = %s"
        
        # Se o valor for um dicionário (como perícias), salvamos como JSON string
        valor_final = json.dumps(up.valor) if isinstance(up.valor, dict) else up.valor
        
        cursor.execute(sql, (valor_final, personagem_id))
        conexao.commit()
        cursor.close()
        conexao.close()
        return {"status": "sucesso"}
    except Exception as e:
        return {"status": "erro", "detalhe": str(e)}
    
    # 15. ATUALIZAR PERSONAGEM COMPLETO (PUT) - PARA ATUALIZAÇÕES MAIORES

    @app.put("/personagem/{id}")
    def atualizar_personagem(id: int, p: PersonagemSchema):
        conexao = None
        cursor = None
        try:
            conexao = mysql.connector.connect(**db_config)
            cursor = conexao.cursor()

            pericias_json = json.dumps(p.pericias_selecionadas)
            magias_json = json.dumps(p.magias_selecionadas)

            comando = """
            UPDATE personagens SET 
            nome=%s, raca=%s, classe=%s, antecedente=%s, forca=%s, destreza=%s, 
            constituicao=%s, inteligencia=%s, sabedoria=%s, carisma=%s, 
            hp_maximo=%s, hp_atual=%s, ca=%s, historia=%s, aparencia=%s, 
            pericias_selecionadas=%s, magias_selecionadas=%s 
            WHERE id=%s
            """
            valores = (
                p.nome, p.raca, p.classe, p.antecedente, p.forca, p.destreza,
                p.constituicao, p.inteligencia, p.sabedoria, p.carisma,
                p.hp_maximo, p.hp_atual, p.ca, p.historia, p.aparencia,
                pericias_json, magias_json, id
            )

            cursor.execute(comando, valores)
            conexao.commit()
            return {"mensagem": "Lenda atualizada!"}
        except Exception as e:
            return JSONResponse(status_code=500, content={"erro": str(e)})
        finally:
            if cursor: cursor.close()
            if conexao: conexao.close()