import test from 'node:test';
import assert from 'node:assert/strict';
import {
  isResearchQuery,
  applyResearchIntent,
  extractStructuredPriceQuote,
  buildPsychisUserPrompt,
} from '../src/utils/engineClient.js';
import { sanitizeNodeData } from '../src/utils/nodeSanitizer.js';

test('explanations are research; requests for an amount remain numeric', () => {
  for (const query of ['Почему меняется курс доллара к рублю?', 'Объясни причины инфляции', 'Why did the dollar rise?']) {
    assert.equal(isResearchQuery(query), true, query);
  }
  for (const query of ['Какой сейчас официальный курс доллара к рублю?', 'Сколько стоит доллар?', 'How much does it cost?']) {
    assert.equal(isResearchQuery(query), false, query);
  }
});

test('legacy quote from any provider becomes research and survives sanitization and persistence', () => {
  const query = 'Почему меняется курс доллара к рублю?';
  const raw = {
    title: 'Причины изменения курса',
    description: 'Курс зависит от спроса и предложения валюты.',
    priceQuote: { rate: '85.6070', unit: '₽' },
    layout: { structure: 'price_hero', width: 340 },
  };
  const research = applyResearchIntent(raw, query);
  assert.equal(research.priceQuote, null);
  assert.equal(research.layout.structure, 'text_dossier');
  assert.equal(raw.layout.structure, 'price_hero');
  const saved = JSON.parse(JSON.stringify(sanitizeNodeData(research)));
  assert.equal(saved.kind, 'research');
  assert.equal(saved.description, raw.description);
  assert.equal(extractStructuredPriceQuote(query, { answer: '1 USD = 85.6070 RUB' }, raw), null);
});

test('quote formatting remains unchanged for a numeric request', () => {
  const raw = { priceQuote: { rate: '85.6070' }, layout: { structure: 'price_hero' } };
  assert.equal(applyResearchIntent(raw, 'Курс доллара сейчас'), raw);
});

test('research prompt does not demand a current financial quote', () => {
  const prompt = buildPsychisUserPrompt({ query: 'Почему меняется курс доллара?', isFinancial: true });
  assert.equal(prompt.includes('CRITICAL FINANCIAL, STOCK & MARKET QUOTE EXTRACTION MANDATE'), false);
});
