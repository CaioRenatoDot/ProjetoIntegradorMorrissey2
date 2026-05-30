# Componentes

## `BackButton`

Botao reutilizavel de retorno, usado em paginas internas para voltar ao fluxo anterior.

## `BrandLogo`

Renderiza a marca Watchd com imagem e texto. Pode receber acao de clique em telas como login.

## `Navbar`

Renderiza a navegacao principal, busca recolhida/expandida e botoes de entrada, criacao de conta e logout. Tambem indica a pagina ativa e dispara eventos de navegacao.

## `Hero`

Renderiza a hero da pagina inicial com formulario de busca, posters destacados, metricas e estados visuais baseados nos dados carregados.

## `ResultsSection`

Controla o titulo da lista, estado de carregamento, estado vazio e grid de resultados.

## `SeriesCard`

Card compacto de cada titulo, com poster, nota, generos e sinopse resumida.

## `SeriesDetailPage`

Pagina de detalhes de uma serie selecionada. Busca os dados da serie, mostra poster, generos, nota, resumo e inclui o formulario de avaliacao.

## `SeriesReviewForm`

Formulario de review da serie. Permite selecionar estrelas, escrever um comentario, acompanhar limite de caracteres e receber feedback apos salvar.

## `ListPage`

Renderiza listas da comunidade a partir de dados locais. Funciona como uma vitrine de colecoes e permite abrir os detalhes de cada lista.

## `ListDetailPage`

Mostra os detalhes de uma lista selecionada, com cards das series relacionadas e acao para abrir a pagina de detalhes de cada titulo.

## `DiaryPage`

Exibe as avaliacoes salvas pelo usuario no `localStorage`. Tambem mostra estados diferentes para usuario logado, usuario deslogado e diario vazio.

## `HomeFooter`

Rodape simples da pagina inicial com informacoes basicas do projeto.

## `SkeletonCard`

Skeleton de carregamento usado na grade de resultados enquanto a API responde.

## `LoginScreen`

Tela full-screen de autenticacao mock. Possui rows de posters em movimento e alterna entre login, cadastro e recuperacao de senha.

## `SkeletonPosterRow`

Skeleton das rows de posters da tela de login enquanto as buscas iniciais carregam.

## `Label`

Label reutilizavel com checkbox customizado para opcoes booleanas, usado nos formularios de autenticacao.


```css
@import "tailwindcss";
```
