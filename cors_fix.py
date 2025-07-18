"""
Arquivo para adicionar CORS ao backend Python Flask
Adicione este código no início do seu arquivo app.py
"""

from flask_cors import CORS

# Adicione esta linha após criar a instância do Flask
# app = Flask(__name__)
# CORS(app)  # <- Adicione esta linha

# Ou configure CORS mais específico:
# CORS(app, origins=['http://localhost:5173', 'http://127.0.0.1:5173'])

print("""
INSTRUÇÕES PARA CORRIGIR CORS NO BACKEND PYTHON:

1. Instale flask-cors:
   pip install flask-cors

2. Adicione no início do seu app.py:
   from flask_cors import CORS

3. Após criar a instância do Flask, adicione:
   app = Flask(__name__)
   CORS(app)  # <- Esta linha resolve o problema de CORS

4. Reinicie o servidor Python:
   python app.py

Exemplo completo:
```python
from flask import Flask
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Permite requisições de qualquer origem

# ... resto do seu código
```
""")