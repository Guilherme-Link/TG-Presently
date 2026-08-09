# Presently Frontend

Frontend da aplicação Presently, desenvolvido com React + Vite.

## Requisitos

- Node.js instalado
- Backend da aplicação em execução
- `mkcert` instalado na máquina para gerar certificado local confiável

## Instalação do `mkcert` no Windows

O projeto usa `vite-plugin-mkcert` no arquivo [vite.config.js](./vite.config.js) para criar certificados locais durante o desenvolvimento.

### 1. Instale o `mkcert`

Você pode instalar de uma destas formas:

npm install -g mkcert
```

Se não tiver `Chocolatey` ou `Scoop`, instale um dos dois antes de seguir.

### 2. Instale a autoridade certificadora local

Depois de instalar o `mkcert`, execute:

```powershell
mkcert -install
```

Esse comando registra a CA local no sistema e permite que o navegador confie nos certificados gerados.

### 3. Execute o projeto pela primeira vez

Na primeira execução do frontend, o plugin gera os certificados dentro da pasta `certs/` automaticamente.

```powershell
npm install
npm run dev
```

### 4. Verifique se o certificado foi criado

Se tudo estiver correto, a pasta `certs/` será criada no projeto e o Vite subirá com HTTPS local.

## Scripts

```powershell
npm install
npm run dev
npm run build
npm run lint
```

## Observações

- O frontend usa HTTPS local para funcionar corretamente com o backend.
- Se o navegador avisar sobre certificado, normalmente o problema é o `mkcert -install` não ter sido executado com sucesso.
