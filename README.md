# Paciência de Associações

Um jogo de paciência (solitaire) em que, em vez de naipes e números, as
cartas trazem palavras em português. O objetivo é limpar o tabuleiro
selecionando grupos de 4 cartas que pertencem à mesma categoria, driblando
"pegadinhas" (palavras que parecem se encaixar em mais de uma categoria).

## Rodando localmente

```bash
npm install
npm run dev
```

## Scripts

- `npm run dev` — servidor de desenvolvimento
- `npm run build` — build de produção (checa tipos e gera `dist/`)
- `npm run test` — testes unitários da lógica do jogo (Vitest)
- `npm run lint` — lint (oxlint)

## Arquitetura

- `src/game/` — lógica pura do jogo (geração de níveis, validação de
  combinação, detecção de tabuleiro travado, o reducer principal). Sem
  dependência de React/DOM, testada com Vitest.
- `src/data/categories.ts` — banco de categorias e palavras (incluindo as
  palavras "ambíguas" usadas como pegadinhas) que alimenta o gerador
  procedural de níveis.
- `src/persistence/` — perfis locais (múltiplas pessoas podem jogar no
  mesmo navegador, cada uma com seu progresso) e o save por perfil, tudo
  em `localStorage`.
- `src/state/` — `GameProvider`/`useGame`, o `useReducer` que guarda o
  estado da partida atual.
- `src/components/` — camada de apresentação (tabuleiro, colunas, cartas,
  monte, HUD, modais de vitória/derrota).

## Publicação no GitHub Pages

O workflow em `.github/workflows/deploy.yml` builda e publica `dist/`
automaticamente a cada push em `main`, usando o "Deploy from GitHub
Actions" do Pages (ative em Settings → Pages → Source → "GitHub Actions").
O `base` em `vite.config.ts` está configurado para `/paciencia/`.
