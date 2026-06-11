# Componentes

## `BackButton`

Botão reutilizável de retorno, usado em páginas internas para voltar ao fluxo anterior.

## `BrandLogo`

Renderiza a marca Watchd com imagem e texto. Pode receber uma ação de clique em telas como a de login.

## `Navbar`

Renderiza a navegação principal, a busca recolhida/expandida e os botões de entrada, criação de conta e logout. Também indica a página ativa e dispara eventos de navegação.

## `Hero`

Renderiza a hero da página inicial com formulário de busca, pôsteres destacados, métricas e estados visuais baseados nos dados carregados.

## `ResultsSection`

Controla o título da lista, o estado de carregamento, o estado vazio e o grid de resultados.

## `SeriesCard`

Card compacto de cada título, com pôster, nota, gêneros e sinopse resumida.

## `SeriesDetailPage`

Página de detalhes de uma série selecionada. Busca os dados da série, mostra pôster, gêneros, nota e resumo, além de incluir o formulário de avaliação.

## `SeriesReviewForm`

Formulário de review da série. Permite selecionar estrelas, escrever um comentário, acompanhar o limite de caracteres e receber feedback após salvar.

## `ListPage`

Renderiza listas da comunidade a partir de dados locais. Funciona como uma vitrine de coleções e permite abrir os detalhes de cada lista.

## `ListDetailPage`

Mostra os detalhes de uma lista selecionada, com cards das séries relacionadas e uma ação para abrir a página de detalhes de cada título.

## `DiaryPage`

Exibe as avaliações salvas pelo usuário no `localStorage`. Também mostra estados diferentes para usuário logado, usuário deslogado e diário vazio.

## `HomeFooter`

Rodapé simples da página inicial com informações básicas do projeto.

## `SkeletonCard`

Skeleton de carregamento usado na grade de resultados enquanto a API responde.

## `LoginScreen`

Tela full-screen de autenticação mock. Possui fileiras de pôsteres em movimento e alterna entre login, cadastro e recuperação de senha.

## `SkeletonPosterRow`

Skeleton das fileiras de pôsteres da tela de login enquanto as buscas iniciais carregam.

## `Label`

Label reutilizável com checkbox customizado para opções booleanas, usado nos formulários de autenticação.

## Dados e serviços relacionados

## `services/tvmaze.js`

Centraliza o consumo da API pública do TVMaze com `fetch`, incluindo busca de séries, detalhes por ID e lista de séries populares.

## `data/communityLists.js`

Mantém os dados locais das listas da comunidade exibidas nas páginas de listas.

## `utils/seriesReviews.js`

Centraliza a leitura e gravação das reviews no `localStorage`.

```css
@import "tailwindcss";
```
