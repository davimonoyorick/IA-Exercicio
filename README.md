# AI Lab

Sistema web educacional para aprender conceitos de Inteligência Artificial na prática.
Duas ferramentas em uma interface: **Desfoque Facial** com OpenCV e **Token Quest** com NLTK.

---

## Módulos

###  Desfoque Facial
Detecta rostos em imagens usando o algoritmo **Haar Cascade** do OpenCV.
O rosto é preservado com uma máscara elíptica e o fundo é desfocado via **Gaussian Blur**.
Conceitos aplicados: ROI Detection, Alpha Blending, Visão Computacional.

###  Token Quest
Tokeniza qualquer texto usando o **NLTK** (Natural Language Toolkit) e classifica cada token por categoria: palavra, stopword, número, pontuação e maiúscula.
Inclui sistema de XP gamificado para acompanhar o aprendizado.
Conceitos aplicados: Tokenização BPE, Subword Units, Context Window.

---

## Estrutura do Projeto

```
ia-exercicio/
├── app.py                  ← Backend Flask (rotas + processamento)
├── requirements.txt        ← Dependências Python
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

## Como Rodar

### Pré-requisitos
- Python 3.10 ou superior — [python.org](https://python.org)

### Passo a passo

**1. Extraia o projeto e entre na pasta**
```bash
cd ia-exercicio
```



**2. Instale as dependências**
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

### Dependências

| Pacote                   | Versão mínima | Função                          |
|--------------------------|---------------|---------------------------------|
| flask                    | 3.0           | Servidor web e rotas HTTP       |
| opencv-python-headless   | 4.9           | Detecção facial e Gaussian Blur |
| numpy                    | 1.26          | Manipulação de matrizes/pixels  |
| nltk                     | 3.8           | Tokenização de texto            |

---

## Solução de Problemas

**Erro de `punkt` ou `stopwords` ao iniciar:**
```bash
python -c "import nltk; nltk.download('punkt'); nltk.download('punkt_tab'); nltk.download('stopwords')"
```
Depois rode `python app.py` novamente.

**Porta 5000 ocupada:**
Edite a última linha do `app.py` e troque a porta:
```python
app.run(debug=True, port=5001)
```

---

## Interface

- **Tema claro** por padrão — botão 🌙 no header para alternar para o tema escuro
- A preferência de tema é salva automaticamente no navegador
- Layout responsivo: adapta para desktop, tablet e mobile sem perda de conteúdo
