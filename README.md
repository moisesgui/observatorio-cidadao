# Minha Voz Importa (Observatório Cidadão)

Plataforma de pesquisa cidadã anônima para escutar prioridades da população — começando por Espacinha.

## Stack

- [TanStack Start](https://tanstack.com/start) + React 19
- Tailwind CSS 4
- Leaflet / OpenStreetMap nos resultados

## Desenvolvimento local

Requer Node.js **22.12+** (recomendado para `@tanstack/react-start`).

```sh
git clone https://github.com/moisesgui/minhavozimporta.git
cd minhavozimporta
npm install
npm run dev
```

A aplicação sobe em `http://localhost:8080`.

## Scripts

| Comando        | Descrição              |
| -------------- | ---------------------- |
| `npm run dev`  | Servidor de desenvolvimento |
| `npm run build`| Build de produção      |
| `npm run preview` | Preview do build   |
| `npm test`     | Testes (Vitest)        |
| `npm run lint` | ESLint                 |