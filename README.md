# AiLab - Sistema de Desfoque de Imagens e Tokenização de frases 

> Exercício prático da disciplina de **Inteligência Artificial**
> Faculdade **UNDB**
> Autor: **Davilson Carvalho**

---

##  Acesso Online

O sistema está disponível em produção via Render:

**[https://ia-exercicio.onrender.com](https://ia-exercicio.onrender.com)**

> ⚠️ O servidor pode demorar ~30 segundos para acordar na primeira requisição (limitação do plano gratuito do Render).

---

## Sobre o Projeto

Sistema web desenvolvido para demonstrar na prática conceitos de Inteligência Artificial, com foco em visão computacional e processamento de linguagem natural. A interface conta com tema claro/escuro e é totalmente responsiva.

---

## Módulos

###  Desfoque Facial (ROI e Manipulação de Imagem)
Detecta rostos em imagens usando o algoritmo **Haar Cascade** do OpenCV. O rosto é preservado com uma máscara elíptica suavizada e o fundo é desfocado via **Gaussian Blur**.

Conceitos aplicados: `ROI Detection` `Haar Cascade` `Alpha Blending` `Visão Computacional`

###  Token Quest (Tokenização)
Tokeniza qualquer texto usando o **NLTK** (Natural Language Toolkit) e classifica cada token por categoria: palavra, stopword, número, pontuação e maiúscula. Exibe métricas de tokens, caracteres e densidade (ch/token).

Conceitos aplicados: `Tokenização` `NLP` `Stopwords` `NLTK` `Context Window`

---

## Estrutura do Projeto

```
ia-exercicio/
├── app.py                  ← Backend Flask (rotas + processamento)
├── requirements.txt        ← Dependências Python
├── render.yaml             ← Configuração de deploy no Render
├── templates/
│   └── index.html          ← Estrutura HTML semântica
├── static/
│   ├── css/
│   │   └── style.css       ← Estilos, temas claro/escuro, responsividade
│   └── js/
│       └── app.js          ← Lógica de interação e requisições
├── uploads/                ← Imagens temporárias (criado automaticamente)
└── resultados/             ← Imagens processadas (criado automaticamente)
```

---

## Como Rodar Localmente

### Pré-requisitos
- Python 3.10 ou superior — [python.org](https://python.org)

### Passo a passo

**1. Clone o repositório e entre na pasta**
```bash
git clone https://github.com/davimonoyorick/IA-Exercicio.git
cd ia-exercicio
```

**2. Crie e ative um ambiente virtual**
```bash
python -m venv .venv

# Windows
.venv\Scripts\activate

# Mac / Linux
source .venv/bin/activate
```

**3. Instale as dependências**
```bash
pip install -r requirements.txt
```

**4. Inicie o servidor**
```bash
python app.py
```

**5. Acesse no navegador**
```
http://localhost:5000
```

---

## Dependências

| Pacote                   | Versão mínima | Função                          |
|--------------------------|---------------|---------------------------------|
| flask                    | 3.0           | Servidor web e rotas HTTP       |
| opencv-python-headless   | 4.9           | Detecção facial e Gaussian Blur |
| numpy                    | 1.26          | Manipulação de matrizes/pixels  |
| nltk                     | 3.8           | Tokenização de texto            |
| gunicorn                 | 21.0          | Servidor WSGI para produção     |

---

## Solução de Problemas

**Erro de `punkt` ou `stopwords` ao iniciar:**
```bash
python -c "import nltk; nltk.download('punkt'); nltk.download('punkt_tab'); nltk.download('stopwords')"
```

**Porta 5000 ocupada:**
Edite a última linha do `app.py`:
```python
app.run(debug=True, port=5001)
```

---

## Deploy

O sistema está hospedado no **Render** utilizando `gunicorn` como servidor WSGI.
Qualquer `git push` na branch principal aciona um novo deploy automaticamente.