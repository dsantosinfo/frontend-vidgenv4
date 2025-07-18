#!/bin/bash

# ==============================================================================
#  install_frontend.sh - Instalador Interativo para Frontend Vite
# ==============================================================================
#  Este script automatiza a implantação de uma aplicação frontend
#  Node.js/Vite, configurando-a para rodar como um serviço systemd no host,
#  sem interferir com ambientes Docker existentes.
# ==============================================================================

# --- Configurações ---
FRONTEND_REPO_URL="git@github.com:dsantosinfo/frontend-vidgenv4.git"
PROJECT_DIR="VidGenFrontend"
BRANCH="main"
NODE_VERSION="20"
DEFAULT_APP_PORT="3000" # Porta comum para frontends. Evita conflito com 8000 (backend) e 9000 (Portainer)
SERVICE_NAME="vidgen-frontend.service"

# --- Cores e Funções ---
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'
success() { echo -e "${GREEN}✓ ${1}${NC}"; }
fail() { echo -e "${RED}✗ ${1}${NC}"; exit 1; }
warning() { echo -e "${YELLOW}⚠️  ${1}${NC}"; }
info() { echo -e "${CYAN}i ${1}${NC}"; }
ask_question() { read -p "$(echo -e "${YELLOW}?${NC}") ${1} " -n 1 -r; echo; }

# --- Início do Script ---
clear
echo "======================================================"
echo "      Instalador Interativo do Frontend VidGen      "
echo "======================================================"
echo "Este script irá instalar o frontend como um processo"
echo "no servidor, sem usar ou interferir com o Docker."
echo

#
# PASSO 1: VERIFICAR DEPENDÊNCIAS DO SISTEMA
#
info "[1/6] Verificando dependências (Git, Node.js, NPM)..."
if ! command -v git &> /dev/null; then
    warning "Git não foi encontrado. Tentando instalar..."
    sudo apt-get update && sudo apt-get install -y git || fail "Falha ao instalar o Git."
fi

if ! command -v node &> /dev/null || ! command -v npm &> /dev/null; then
    warning "Node.js ou NPM não foram encontrados."
    ask_question "Deseja instalar o Node.js v${NODE_VERSION} agora? [s/N]"
    if [[ $REPLY =~ ^[Ss]$ ]]; then
        curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | sudo -E bash -
        sudo apt-get install -y nodejs || fail "A instalação do Node.js falhou."
    else
        fail "Node.js e NPM são necessários para continuar."
    fi
fi
success "Dependências do sistema verificadas."
echo

#
# PASSO 2: OBTER O CÓDIGO-FONTE DO GIT
#
info "[2/6] Obtendo o código-fonte do frontend..."
if [ -d "$PROJECT_DIR" ]; then
    warning "A pasta do projeto '${PROJECT_DIR}' já existe."
    ask_question "Deseja apenas atualizar (pull) o código? (Responda 'n' para apagar e clonar novamente) [S/n]"
    if [[ ! $REPLY =~ ^[Nn]$ ]]; then
        cd "$PROJECT_DIR" && git pull origin "$BRANCH" && cd .. || fail "Falha ao atualizar o repositório."
        success "Repositório atualizado com sucesso."
    else
        rm -rf "$PROJECT_DIR"
        git clone --branch "$BRANCH" "$FRONTEND_REPO_URL" "$PROJECT_DIR" || fail "Falha ao clonar o repositório."
        success "Repositório clonado do zero."
    fi
else
    git clone --branch "$BRANCH" "$FRONTEND_REPO_URL" "$PROJECT_DIR" || fail "Falha ao clonar o repositório."
    success "Repositório clonado com sucesso."
fi
# Entra na pasta do projeto para os próximos passos
cd "$PROJECT_DIR" || fail "Não foi possível entrar na pasta do projeto '${PROJECT_DIR}'."
echo

#
# PASSO 3: CONFIGURAR O ENDEREÇO DO BACKEND
#
info "[3/6] Configurando o endereço do Backend..."
read -p "$(echo -e "  ${YELLOW}?${NC} Por favor, insira o endereço IP e porta do seu backend (ex: ${BOLD}123.45.67.89:8000${NC}): ")" BACKEND_ADDRESS
if [ -z "$BACKEND_ADDRESS" ]; then
    fail "O endereço do backend não pode ser vazio."
fi

ENV_FILE=".env"
ENV_CONTENT="VITE_API_BASE_URL=http://${BACKEND_ADDRESS}"

if [ -f "$ENV_FILE" ]; then
    warning "O arquivo '${ENV_FILE}' já existe."
    ask_question "Deseja sobrescrevê-lo com o novo endereço do backend? [s/N]"
    if [[ ! $REPLY =~ ^[Ss]$ ]]; then
        info "Arquivo .env mantido. O build usará o endereço existente."
    else
        echo "$ENV_CONTENT" > "$ENV_FILE"
        success "Arquivo '${ENV_FILE}' atualizado com sucesso."
    fi
else
    echo "$ENV_CONTENT" > "$ENV_FILE"
    success "Arquivo '${ENV_FILE}' criado com sucesso."
fi
echo

#
# PASSO 4: INSTALAR DEPENDÊNCIAS E FAZER O BUILD
#
info "[4/6] Instalando dependências do Node.js..."
npm install || fail "Falha ao executar 'npm install'."
success "Dependências instaladas."
echo
info "Gerando o build de produção..."
npm run build || fail "Falha ao executar 'npm run build'."
success "Build de produção criado na pasta 'dist/'."
echo

#
# PASSO 5: CONFIGURAR O SERVIÇO SYSTEMD
#
info "[5/6] Configurando para rodar como um serviço de sistema..."
if [ -f "/etc/systemd/system/${SERVICE_NAME}" ]; then
    warning "Um serviço com o nome '${SERVICE_NAME}' já existe."
    ask_question "Deseja ${RED}REMOVER${NC} o serviço antigo e criar um novo? [s/N]"
    if [[ $REPLY =~ ^[Ss]$ ]]; then
        sudo systemctl stop ${SERVICE_NAME}
        sudo systemctl disable ${SERVICE_NAME}
        sudo rm "/etc/systemd/system/${SERVICE_NAME}"
        sudo systemctl daemon-reload
        success "Serviço antigo removido."
    else
        info "Criação do serviço pulada."
        # Volta para o diretório original antes de sair
        cd ..
        exit 0
    fi
fi

DEFAULT_USER=$(whoami)
read -p "$(echo -e "  ${YELLOW}?${NC} Usuário que rodará o serviço [${BOLD}$DEFAULT_USER${NC}]: ")" SERVICE_USER
SERVICE_USER=${SERVICE_USER:-$DEFAULT_USER}

read -p "$(echo -e "  ${YELLOW}?${NC} Porta para o frontend [${BOLD}$DEFAULT_APP_PORT${NC}]: ")" FRONTEND_PORT
FRONTEND_PORT=${FRONTEND_PORT:-$DEFAULT_APP_PORT}

PROJECT_PATH=$(pwd)
# Adiciona o script "start" ao package.json se não existir
npm pkg set scripts.start="serve" > /dev/null

SERVICE_CONTENT="[Unit]
Description=Vidgen Frontend Application
After=network.target

[Service]
Type=simple
User=${SERVICE_USER}
WorkingDirectory=${PROJECT_PATH}
ExecStart=/usr/bin/npm start -- -s dist -l ${FRONTEND_PORT}
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=vidgen-frontend

[Install]
WantedBy=multi-user.target
"

echo "$SERVICE_CONTENT" | sudo tee "/etc/systemd/system/${SERVICE_NAME}" > /dev/null
success "Arquivo de serviço systemd criado."

sudo systemctl daemon-reload
sudo systemctl enable ${SERVICE_NAME}
sudo systemctl start ${SERVICE_NAME}
success "Serviço '${SERVICE_NAME}' habilitado e iniciado."
echo

#
# PASSO 6: CONFIGURAR O FIREWALL
#
info "[6/6] Configurando o Firewall (UFW)..."
ask_question "Deseja abrir a porta ${FRONTEND_PORT} no firewall? [s/N]"
if [[ $REPLY =~ ^[Ss]$ ]]; then
    sudo ufw allow ${FRONTEND_PORT}/tcp
    sudo ufw reload
    success "Firewall configurado para permitir conexões na porta ${FRONTEND_PORT}."
fi
echo

# --- Conclusão ---
# Volta para o diretório original
cd ..
echo "======================================================"
success "Instalação do frontend concluída!"
echo "Sua aplicação agora está rodando em:"
echo -e "  ${CYAN}http://$(curl -s ifconfig.me):${FRONTEND_PORT}${NC}"
echo
echo "Comandos úteis:"
echo -e "  - Ver status:  ${CYAN}sudo systemctl status ${SERVICE_NAME}${NC}"
echo -e "  - Ver logs:    ${CYAN}sudo journalctl -u ${SERVICE_NAME} -f${NC}"
echo -e "  - Parar:       ${CYAN}sudo systemctl stop ${SERVICE_NAME}${NC}"
echo -e "  - Reiniciar:   ${CYAN}sudo systemctl restart ${SERVICE_NAME}${NC}"
echo "======================================================"