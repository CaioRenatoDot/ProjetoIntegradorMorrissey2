<p align="center">
  <img width="300" height="300" alt="Logo do Watchd" src="https://github.com/user-attachments/assets/081326e1-63e0-4561-b6ae-91acdb91b838" />
</p>

---

# Watchd

Watchd é até então um protótipo interativo desenvolvido em React + Vite para descobrir séries, explorar listas da comunidade e visualizar títulos populares usando a API pública do TVMaze.

## Por que "Watchd"?

Basicamente a minha razão de ter escolhido o Watchd, foi o prazer que tenho de usar uma outra plataforma de filmes chamada "Letterboxd" a qual é muito legal e bem estruturada, não tinha ciência de alguma outra plataforma dessa voltada para series, então criei a minha própria. Todos os visuais foram criados por mim, logo, banners e favicon. (Criei pelo Canva)

## Escopo

O projeto foi criado como uma experiência web responsiva para consulta e avaliação de séries. A aplicação permite pesquisar títulos, abrir uma página de detalhes, fazer login com contas de demonstração e registrar uma avaliação simples com estrelas e review.

## Funcionalidades

- Busca de séries por título.
- Sugestões aleatórias de séries na página inicial.
- Consumo da API pública do TVMaze com `fetch`.
- Renderização dinâmica de cards a partir dos dados da API.
- Página de detalhes para cada série selecionada.
- Sistema simples de avaliação com estrelas e review sem Rich Text.
- Login mock com validação dinâmica.
- Telas de login, cadastro e recuperação de senha.
- Feedback visual com skeleton loading, mensagens de erro e confirmação.
- Layout responsivo estilizado com Tailwind CSS.

## Login de Demonstração

Pode usar uma das duas contas para acessar professor:

```txt
Usuário: caio@email.com
Senha: 123456
```

```txt
Usuário: SamuelMorrissey
Senha: 123456
```

## Tecnologias

- React
- Vite
- Tailwind CSS
- Lucide React
- API do TVMaze

## Decisões Técnicas

- React foi usado para organizar a interface em componentes reutilizáveis.
- Vite foi escolhido pela configuração simples e pelo carregamento rápido em desenvolvimento.
- Tailwind CSS foi usado para criar um layout responsivo sem escrever CSS manual extenso.
- A API do TVMaze foi escolhida por ser pública e fornecer dados de séries, imagens, datas, gêneros e notas do IMDB.
- O sistema de review usa `localStorage`, pois o projeto é um protótipo sem backend ainda.

## Como Executar

Instale as dependências:

```bash
npm install
```

Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

Gere a versão de produção:

```bash
npm run build
```

Pré-visualize a versão de produção:

```bash
npm run preview
```

## Documentação

- [Arquitetura](docs/ARCHITECTURE.md)
- [Componentes](docs/COMPONENTS.md)
- [Imagens de Design](docs/DESIGN_IMAGES.md)
