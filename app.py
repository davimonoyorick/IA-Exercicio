import os, uuid
import cv2
import numpy as np
import nltk
from flask import Flask, request, jsonify, send_from_directory, render_template

# ── NLTK setup ────────────────────────────────────────────────────────────────
nltk.download("punkt",     quiet=True)
nltk.download("punkt_tab", quiet=True)
nltk.download("stopwords", quiet=True)

from nltk.tokenize import word_tokenize
from nltk.corpus   import stopwords

STOPWORDS_PT = set(stopwords.words("portuguese"))
STOPWORDS_EN = set(stopwords.words("english"))

# ── Flask ─────────────────────────────────────────────────────────────────────
app = Flask(__name__)

UPLOAD_FOLDER    = "uploads"
RESULTADO_FOLDER = "resultados"
ALLOWED_EXT      = {"jpg", "jpeg", "png", "webp"}

os.makedirs(UPLOAD_FOLDER,    exist_ok=True)
os.makedirs(RESULTADO_FOLDER, exist_ok=True)


# ═════════════════════════════════════════════════════════════════════════════
#  UTILITÁRIOS
# ═════════════════════════════════════════════════════════════════════════════

def extensao_valida(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXT

def salvar_upload(arq):
    nome = f"{uuid.uuid4().hex}_{arq.filename}"
    path = os.path.join(UPLOAD_FOLDER, nome)
    arq.save(path)
    return path

def salvar_resultado(img):
    nome = f"{uuid.uuid4().hex}.jpg"
    cv2.imwrite(os.path.join(RESULTADO_FOLDER, nome), img)
    return nome


# ═════════════════════════════════════════════════════════════════════════════
#  MÓDULO 1 — DESFOQUE FACIAL
# ═════════════════════════════════════════════════════════════════════════════

def processar_desfoque(caminho, intensidade=75):
    img = cv2.imread(caminho)
    if img is None:
        return {"erro": "Não foi possível carregar a imagem."}

    h, w = img.shape[:2]
    detector = cv2.CascadeClassifier(
        cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
    )
    gray   = cv2.equalizeHist(cv2.cvtColor(img, cv2.COLOR_BGR2GRAY))
    rostos = detector.detectMultiScale(gray, 1.1, 5, minSize=(50, 50))

    k     = intensidade if intensidade % 2 == 1 else intensidade + 1
    fundo = cv2.GaussianBlur(img, (k, k), 0)

    if len(rostos) == 0:
        resultado = img.copy()
    else:
        mask = np.zeros((h, w), dtype=np.uint8)
        for (x, y, fw, fh) in rostos:
            cv2.ellipse(mask, (x + fw//2, y + fh//2),
                        (fw//2, int(fh * .6)), 0, 0, 360, 255, -1)
        mask_s = cv2.GaussianBlur(mask, (31, 31), 0)
        alpha  = np.stack([mask_s.astype(np.float32) / 255] * 3, axis=-1)
        resultado = np.clip(img * alpha + fundo * (1 - alpha), 0, 255).astype(np.uint8)

        for i, (x, y, fw, fh) in enumerate(rostos):
            cv2.rectangle(resultado, (x, y), (x+fw, y+fh), (0, 230, 120), 2)
            lbl = f"Rosto {i+1}" if len(rostos) > 1 else "Rosto Detectado"
            py  = y - 10 if y - 10 > 10 else y + fh + 20
            cv2.putText(resultado, lbl, (x, py),
                        cv2.FONT_HERSHEY_SIMPLEX, .7, (0, 230, 120), 2)
        cv2.putText(resultado, f"Rostos: {len(rostos)}", (10, 30),
                    cv2.FONT_HERSHEY_SIMPLEX, .8, (255, 220, 0), 2)

    nome = salvar_resultado(resultado)
    return {"arquivo": nome, "rostos_detectados": int(len(rostos)), "resolucao": f"{w}x{h}"}


# ═════════════════════════════════════════════════════════════════════════════
#  MÓDULO 2 — TOKENIZADOR NLTK
# ═════════════════════════════════════════════════════════════════════════════

CORES = {
    "stopword":  "#6b7aff",
    "numero":    "#f9c74f",
    "pontuacao": "#ff6b6b",
    "maiuscula": "#43e97b",
    "palavra":   "#00f5d4",
}

def categorizar(tok):
    if all(c in ".,!?;:\"'()[]{}—-–…/" for c in tok):
        return "pontuacao"
    try:
        float(tok.replace(",", "."))
        return "numero"
    except ValueError:
        pass
    if tok.lower() in STOPWORDS_PT or tok.lower() in STOPWORDS_EN:
        return "stopword"
    if tok[0].isupper():
        return "maiuscula"
    return "palavra"

def tokenizar_nltk(texto):
    if not texto.strip():
        return {"tokens": [], "total": 0, "chars": 0, "categorias": {}}

    toks = word_tokenize(texto, language="portuguese")
    tokens, cats = [], {}
    for i, tok in enumerate(toks):
        cat = categorizar(tok)
        cats[cat] = cats.get(cat, 0) + 1
        tokens.append({"id": i, "token": tok, "categoria": cat, "cor": CORES.get(cat, "#aaa")})

    return {"tokens": tokens, "total": len(tokens), "chars": len(texto),
            "categorias": cats, "cores": CORES}


# ═════════════════════════════════════════════════════════════════════════════
#  ROTAS
# ═════════════════════════════════════════════════════════════════════════════

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/resultados/<nome>")
def servir_resultado(nome):
    return send_from_directory(RESULTADO_FOLDER, nome)

@app.route("/api/desfoque", methods=["POST"])
def api_desfoque():
    if "imagem" not in request.files:
        return jsonify({"erro": "Nenhuma imagem enviada."}), 400
    arq = request.files["imagem"]
    if not extensao_valida(arq.filename):
        return jsonify({"erro": "Formato inválido."}), 400
    intensidade = int(request.form.get("intensidade", 75))
    path = salvar_upload(arq)
    res  = processar_desfoque(path, intensidade)
    os.remove(path)
    return jsonify(res)

@app.route("/api/tokenizar", methods=["POST"])
def api_tokenizar():
    data  = request.get_json(force=True)
    texto = data.get("texto", "")
    if len(texto) > 3000:
        return jsonify({"erro": "Texto muito longo (máx 3000 chars)."}), 400
    return jsonify(tokenizar_nltk(texto))

if __name__ == "__main__":
    import startup
    app.run(debug=True, port=5000)
