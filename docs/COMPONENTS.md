# Componentes

## `Navbar`

Renderiza a navegacao principal, busca recolhida e botoes de entrada/criacao de conta.

## `Hero`

Renderiza a hero full-bleed com formulario de busca, posters destacados e metricas.

## `ResultsSection`

Controla o titulo da lista, estado de carregamento e grid de resultados.

## `SeriesCard`

Card compacto de cada titulo, com poster, nota, generos e sinopse resumida.

## `SkeletonCard`

Skeleton de carregamento usado na grade de resultados enquanto a API responde.

## `LoginScreen`

Tela full-screen de login mock. Possui rows de posters em movimento e formulario de acesso.

## `SkeletonPosterRow`

Skeleton das rows de posters da tela de login enquanto as buscas iniciais carregam.

## `Label`

Label reutilizavel com checkbox customizado para opcoes booleanas, usado no login em `Lembrar acesso`.

## Padrao de estilo

O projeto usa Tailwind diretamente no JSX. O arquivo `src/styles.css` deve ficar somente com:

```css
@import "tailwindcss";
```
