# Pagina Statistiche con grafici interattivi — Design

Data: 2026-05-29
Stato: approvato (brainstorming)

## Obiettivo

Aggiungere a PlayLimit una **schermata dedicata "Statistiche"** con più grafici
impilati (ciascuno con titolo sopra e grafico sotto). Interazione touch-first:
sul grafico a linea e su quello a barre, tenendo premuto e trascinando compare
un **mirino tratteggiato** (linea verticale fino all'asse X + orizzontale fino
all'asse Y) con un **pallino** sul punto di intersezione, e i numeri in alto si
aggiornano in base alla posizione del dito.

Mobile-first: il gesto primario è il "tieni premuto e trascina" su telefono;
su desktop funziona col mouse.

## Decisioni prese

- **Accesso**: voce "Statistiche" nella pagina Impostazioni (come "Vedi cronologia").
- **Grafici** (3, impilati verticalmente, ognuno in una card con titolo):
  1. Andamento del saldo — grafico a **linea** (interattivo, scrubbing).
  2. Spese vs Vincite — **barre raggruppate** per periodo (interattivo, scrubbing).
  3. Esiti scommesse — **donut** vinte/perse/in sospeso + win rate (statico, tap evidenzia spicchio).
- **Periodo**: default **Tutto**, filtrabile per **Anno** o **Mese**.
- **Tecnologia grafici**: **SVG custom**, zero nuove dipendenze runtime. Niente
  librerie di charting (controllo totale sul gesto press-and-hold, look coerente,
  bundle minimo).
- **Test**: aggiungere **Vitest** (dev) e testare solo le funzioni pure di `stats.ts`.

## Architettura

Nuova vista `'stats'` nel tipo `View` di `App.tsx`, accanto a `'settings'` e
`'bet-history'`. `StatsPage` riceve `transactions` e `bets` (già disponibili).
I dati grezzi non vengono modificati: tutta la trasformazione vive in funzioni
pure in `src/utils/stats.ts`, così i componenti grafici ricevono solo numeri.

### Componenti nuovi

- `src/components/StatsPage.tsx` — pagina: header con back, `PeriodFilter`, 3 card-grafico.
- `src/components/PeriodFilter.tsx` — segmented control Tutto / Anno / Mese
  (default Tutto); con Anno/Mese, frecce ‹ › per scorrere il periodo selezionato.
- `src/components/LineChart.tsx` — andamento saldo, scrubbing.
- `src/components/BarChart.tsx` — barre raggruppate spese/vincite, scrubbing.
- `src/components/DonutChart.tsx` — esiti scommesse, statico + tap highlight.
- `src/hooks/useScrub.ts` — hook condiviso per i pointer events
  (down/move/up, `setPointerCapture`, `touch-action:none`), restituisce l'indice
  attivo del punto/barra sotto il dito. Riusato da LineChart e BarChart.

### Modulo dati `src/utils/stats.ts` (funzioni pure)

- `balanceSeries(transactions, range)` → `{ t:number, balance:number, label:string }[]`
  Ordina per `createdAt`, saldo cumulativo (vincita +, spesa −). Coerente col
  saldo della home: include tutte le transazioni (anche `hidden`, come fa
  `useTransactions`). Lo scrubbing aggancia il punto più vicino sull'asse X.
- `spesaVincitaBuckets(transactions, range)` → `{ label:string, spesa:number, vincita:number, start:number, end:number }[]`
  Raggruppa per periodo. Granularità automatica:
  - **Tutto** → per **mese**
  - **Anno** → 12 **mesi**
  - **Mese** → per **settimana**
- `betOutcomes(bets, range)` → `{ won:number, lost:number, pending:number, winRate:number }`
  Conteggi per stato + win rate = vinte / (vinte + perse). 0 se nessuna risolta.
- Helper di periodo: dato il filtro (`Tutto | Anno:YYYY | Mese:YYYY-MM`) produce
  l'intervallo `{ start, end }` usato per filtrare prima del calcolo.

### Wiring in `App.tsx`

- `View` estende a `'stats'`.
- `SettingsPage` riceve `onOpenStats` e mostra una riga "Statistiche".
- `StatsPage` riceve `transactions`, `bets`, `onBack`.

## Interazione (useScrub)

- `pointerdown` → `setPointerCapture`, attiva il mirino, calcola indice da `clientX`.
- `pointermove` (se premuto / mouse) → aggiorna indice.
- `pointerup` / `pointerleave`(mouse) → disattiva.
- `touch-action: none` sull'SVG per evitare lo scroll durante il trascinamento.
- LineChart: snap al punto più vicino, mirino X+Y + pallino, aggiorna valore+data.
- BarChart: evidenzia il gruppo (periodo) sotto il dito, mostra spesa/vincita +
  etichetta periodo; mirino verticale sul gruppo.

## Casi limite

- Nessun dato nel periodo per un grafico → placeholder "Nessun dato in questo
  periodo" al posto del grafico; la card resta visibile.
- Una sola transazione → la linea mostra comunque il punto.
- Nessuna scommessa risolta → donut mostra solo "in sospeso"/vuoto, win rate n/d.

## Stile

Coerente con l'attuale tema (card scure, bordo `#23252e`, spese coral `#ff7a7a`,
vincite verde `#54d98c`, in sospeso ambra). CSS in `src/styles/app.css` con le
classi delle card statistiche, riusando i token esistenti dove possibile.

## Testing

- **Vitest** aggiunto come devDependency, script `test`.
- Unit test su `stats.ts`: saldo cumulativo, bucketing per mese/settimana,
  win rate, filtri di periodo (Tutto/Anno/Mese), casi limite (vuoto, singolo).
- Componenti SVG: verifica manuale nel browser e su telefono.

## Fuori scope (YAGNI per ora)

- Categorie/tag delle spese e relativo grafico a torta per categoria.
- Export dei dati.
- Zoom/pinch sui grafici.
