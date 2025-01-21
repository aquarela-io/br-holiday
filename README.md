# br-holiday

Uma biblioteca utilitária para verificar e obter feriados brasileiros. Utiliza dados estáticos pré-compilados para anos anteriores e a [Brasil API](https://brasilapi.com.br/) para dados em tempo real.

## Instalação

```bash
npm install br-holiday
```

## Uso

### Importação

```typescript
import { BRHoliday } from "br-holiday";
```

### Exemplos Básicos

```typescript
// Inicialização padrão (usa dados estáticos quando disponíveis)
const holidays = new BRHoliday();

// Verificar se uma data é feriado
const isHoliday = await holidays.isHoliday("2024-01-01");
console.log(isHoliday); // true

// Obter todos os feriados de um ano
const holidayList = await holidays.getHolidays(2024);
console.log(holidayList);
/* Output:
[
  {
    date: '2024-01-01',
    name: 'Confraternização Universal',
    type: 'national'
  },
  ...
]
*/
```

### Modo Live (Apenas API)

```typescript
// Inicialização ignorando dados estáticos
const liveHolidays = new BRHoliday({ skipStatic: true });

// Sempre fará requisições à API
const holidays = await liveHolidays.getHolidays(2024);
```

## API

### Classe `BRHoliday`

#### Construtor

```typescript
new BRHoliday(options?: { skipStatic?: boolean })
```

- `options.skipStatic`: Se `true`, ignora dados estáticos e sempre usa a API (padrão: `false`)

#### Métodos

##### `getHolidays(year: number): Promise<Holiday[]>`

Retorna um array de feriados para o ano especificado.

- `year`: Ano para buscar os feriados (ex: 2024)
- Retorna: Promise com array de objetos `Holiday`

##### `isHoliday(date: string): Promise<boolean>`

Verifica se uma data específica é feriado.

- `date`: Data no formato 'YYYY-MM-DD'
- Retorna: Promise com `true` se for feriado, `false` caso contrário
- Lança erro se o formato da data for inválido

#### Tipos

```typescript
type Holiday = {
  date: string; // YYYY-MM-DD
  name: string; // Nome do feriado
  type: string; // Tipo do feriado (ex: 'national')
};
```

## Scripts

A biblioteca inclui vários scripts úteis para desenvolvimento:

- `npm run build`: Compila o código e gera dados estáticos
- `npm run build:static`: Gera dados estáticos dos feriados (±2 anos do ano atual)
- `npm run restore:static`: Restaura dados de teste para desenvolvimento
- `npm test`: Executa os testes e restaura dados de teste
- `npm run test:memory`: Executa testes de vazamento de memória

## Licença

MIT

## Contribuição

Contribuições são bem-vindas! Por favor, abra uma issue ou pull request.
