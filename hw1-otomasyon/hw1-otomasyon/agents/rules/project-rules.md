## Proje Kurallarım ve Standartlar

## Kod Yazım Düzeni
- Use async/await for all asynchronous operations.
- Always use `try/catch` around external API calls (Google Sheets, Anthropic).
- Log each workflow step with a clear prefix: `[TRIGGER]`, `[PROCESS]`, `[SHEETS]`, `[AI]`.
- Never commit `.env` files. Always use `.env.example` as the template.

## Sistemin Isleyis Sırası
- The workflow MUST follow this exact sequence:
  Trigger → processJobData() → saveToGoogleSheets() → generateCoverLetter() → updateCoverLetterInSheets()
- Each function must be independently testable (single responsibility).
- All field defaults must be handled inside `processJobData()`, not scattered across functions.

## API Kullanımı
- Anthropic model: always use `claude-sonnet-4-20250514`.
- Google Sheets: always use `WidthType` DXA and append to `Applications!A:H`.
- Never hardcode API keys. Always read from `process.env`.

## Error Cevapları
- Return `{ success: false, error: message }` with HTTP 500 on all failures.
- Return `{ success: true, data: {...} }` with HTTP 200 on success.
