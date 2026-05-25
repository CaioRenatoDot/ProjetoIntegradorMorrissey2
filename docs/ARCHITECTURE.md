# Arquitetura

O Watchd e um app React/Vite que consome a API publica da TVMaze para exibir titulos, posters, notas e sinopses.

## Estrutura

- `src/App.jsx`: orquestra estado global da tela, busca, login mock e alternancia entre catalogo/login.
- `src/components/`: componentes visuais reutilizaveis.
- `src/data/constants.js`: listas de busca, poster fallback e classes utilitarias usadas em carrosseis.
- `src/services/tvmaze.js`: camada de acesso a API TVMaze.
- `src/utils/`: helpers puros de formatacao e manipulacao de arrays.
- `src/styles.css`: entrada do Tailwind. Nao deve conter CSS manual.

## Fluxo

1. Ao abrir `Filmes`, o app busca termos aleatorios definidos em `randomFilmSearches`.
2. Quando o usuario pesquisa, a grade troca para os resultados reais do termo digitado.
3. A tela de login e apenas mock visual; ao enviar o formulario, o usuario vira `Caio` na navbar.
4. O login usa tres rows de posters vindos de buscas diferentes em `loginRowSearches`.
