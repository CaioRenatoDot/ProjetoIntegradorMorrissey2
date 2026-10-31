# Arquitetura

O Watchd e um app React/Vite. Os dados das series (titulos, posters, notas, sinopses) vem da API publica da TVMaze; contas, reviews, watchlist, favoritos e listas vem da watchdAPI.

## Estrutura

- `src/App.jsx`: estado global (sessao, busca, pagina ativa) e a troca entre paginas. As paginas fora da home sao carregadas sob demanda com `React.lazy`.
- `src/components/`: paginas e componentes visuais. As secoes do perfil ficam em `components/profile/`.
- `src/services/api.js`: chamadas a watchdAPI. Um helper `request()` cuida de cookie, header de auth, JSON e traducao dos erros pelo `code` que a API devolve.
- `src/services/session.js`: unico lugar que le e grava o token da sessao no `localStorage`.
- `src/services/tvmaze.js`: acesso a TVMaze e a sugestao de series parecidas.
- `src/utils/routes.js`: le e monta as URLs das paginas (ver Rotas).
- `src/utils/`: outros helpers puros (formatacao, forca da senha).
- `src/data/constants.js`: poster fallback e classes usadas nos carrosseis.
- `src/styles.css`: entrada do Tailwind.

## Rotas

Nao ha biblioteca de rotas; o `App` le a URL em `utils/routes.js`:

- `#diary`, `#my-series`, `#my-watchlist`, `#lists`, `#my-lists`, `#profile`, `#edit-profile`, `#search`: paginas fixas.
- `#series/<id>` e `#list/<id>`: detalhe de serie e de lista, com URL propria para compartilhar e recarregar.
- `/<username>` (path, nao hash): perfil publico. No GitHub Pages isso funciona porque o deploy copia o `index.html` para `404.html`.

De onde o usuario veio (para o botao voltar) fica no `history.state`. Quem chega por link direto, sem historico, volta para a pagina de origem padrao.

## Sessao

O login grava um cookie `httpOnly` na API e tambem guarda o token no `localStorage`, que o `api.js` envia no header `Authorization` quando o navegador bloqueia o cookie de terceiros. O motivo e o risco dessa escolha estao no README, em "Limitacoes e proximos passos".

## Qualidade

- `npm run lint`: ESLint (regras de hooks e variaveis nao usadas).
- `npm test`: Vitest, hoje cobrindo `utils/routes.js` e `utils/passwordStrength.js`.
