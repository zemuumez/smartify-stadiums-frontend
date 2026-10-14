const { test } = require('node:test');
const assert = require('node:assert/strict');
const { languages, isLocale, safeReturnPath } = require('../.test-build/i18n/catalog');
test('English and Amharic have identical nonempty message keys', () => {
  assert.deepEqual(Object.keys(languages.en.messages).sort(), Object.keys(languages.am.messages).sort());
  for (const language of Object.values(languages)) for (const value of Object.values(language.messages)) assert.ok(value.trim());
  assert.equal(isLocale('am'), true); assert.equal(isLocale('__proto__'), false);
});
test('login return paths preserve booking context and reject external redirects', () => {
  assert.equal(safeReturnPath('/bookings/new?field=field-2&date=2099-01-01'), '/bookings/new?field=field-2&date=2099-01-01');
  for (const unsafe of ['https://evil.example', '//evil.example', '/\\evil.example', '/\r\nevil']) assert.equal(safeReturnPath(unsafe), '/bookings');
});
