const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');
const vm = require('node:vm');

const source = readFileSync(path.join(__dirname, '../epilogue.js'), 'utf8');

function render(outcome) {
  const pages = [];
  const article = { appendChild: (page) => pages.push(page) };
  const document = {
    currentScript: { dataset: { outcome } },
    querySelector: () => article,
    createElement: () => ({
      attributes: {},
      setAttribute(name, value) { this.attributes[name] = value; }
    })
  };
  vm.runInNewContext(source, { document });
  return pages.map(({ attributes, className, innerHTML }) => ({ attributes, className, innerHTML }));
}

for (const outcome of ['daniel-accused', 'ash-accused', 'ryu-accused', 'candy-accused', 'other-accused', 'tie']) {
  test(`${outcome}: all epilogues stay on one reading page`, () => {
    const pages = render(outcome);
    assert.equal(pages.length, outcome === 'daniel-accused' ? 2 : 1);
    assert.match(pages[0].className, /gourmet-epilogue/);
    assert.ok(pages[0].innerHTML.length > 500);
    assert.doesNotMatch(pages[0].innerHTML, /undefined|null|NaN/);
    assert.doesNotMatch(pages[0].innerHTML, /대회 전날 해파리/);
    assert.ok(pages.every(page => page.attributes['aria-labelledby']));
  });
}

test('Daniel ending keeps the four-year monologue separate and within Ash knowledge', () => {
  const [future, monologue] = render('daniel-accused');
  assert.match(future.innerHTML, /12년/);
  assert.match(monologue.innerHTML, /사건 4년 뒤/);
  assert.match(monologue.innerHTML, /10년 전/);
  assert.doesNotMatch(monologue.innerHTML, /12년|까마귀|흑진주|제조 기록/);
});

test('Monologue uses one named heading and a readable dateline', () => {
  const monologue = render('daniel-accused')[1];
  assert.equal((monologue.innerHTML.match(/<h[23]\b/g) || []).length, 1);
  assert.match(monologue.innerHTML, /<h2 id="epilogue-daniel-accused-2">/);
  assert.match(monologue.innerHTML, /class="scene-dateline">사건 4년 뒤/);
  assert.doesNotMatch(monologue.innerHTML, /애쉬의 기록|애쉬가 남긴 기록|script-kicker/);
  assert.ok(monologue.innerHTML.includes(`id="${monologue.attributes['aria-labelledby']}"`));
});

test('Character names retain separate colors without styling scene locations as names', () => {
  const html = render('daniel-accused')[0].innerHTML;
  for (const name of ['캔디', '애쉬', '류진환']) {
    assert.ok(html.includes(`<span class="character-name" data-character="${name}">${name}</span>`));
  }
  assert.match(html, /class="scene-dateline">사건 12년 뒤 · 왕실 주방<\/p>/);
  assert.doesNotMatch(html, /<img[^>]+alt="(?:캔디|애쉬|류진환)"/);
});

test('Emphasis is limited to explicitly selected dialogue', () => {
  const [future, monologue] = render('daniel-accused');
  assert.equal((future.innerHTML.match(/dialogue-emphasis/g) || []).length, 2);
  assert.match(future.innerHTML, /dialogue-emphasis" data-speaker="캔디">“그리고 나/);
  assert.doesNotMatch(monologue.innerHTML, /dialogue-emphasis/);
  assert.doesNotMatch(render('tie')[0].innerHTML, /dialogue-emphasis/);
});

test('Ash ending accounts for one year in custody, eight at the inn and three at her restaurant', () => {
  const html = render('ash-accused')[0].innerHTML;
  assert.match(html, /그 주방에서 8년/);
  assert.match(html, /문을 연 지 3년이 지났을 때/);
  assert.match(html, /사건 12년 뒤/);
  assert.doesNotMatch(html, /한 달쯤|무혐의 결정문|새 흑진주를 받/);
});

test('Candy custody branch preserves Daniel promotion, not Candy promotion', () => {
  const html = render('candy-accused')[0].innerHTML;
  assert.match(html, /왕실 요리장이 된 <span class="character-name" data-character="다니엘">다니엘<\/span>/);
  assert.match(html, /제과점을 연 지 11년/);
  assert.doesNotMatch(html, /왕실 요리장이 된 <span class="character-name" data-character="캔디">|세 번째 도전/);
});

test('Legacy outcomes still resolve to their canonical ending', () => {
  for (const [legacy, canonical] of Object.entries({
    daniel: 'daniel-accused',
    'daniel-deny': 'daniel-accused',
    'ash-cleared': 'ash-accused',
    'ash-ryu-cleared': 'ash-accused',
    'ash-candy-cleared': 'ash-accused',
    'ryu-silent': 'ryu-accused',
    'ryu-confess': 'ryu-accused',
    'ryu-protect': 'ryu-accused',
    'candy-hide': 'candy-accused',
    'candy-confess': 'candy-accused',
    'candy-resign': 'candy-accused'
  })) {
    assert.deepEqual(render(legacy), render(canonical));
  }
  assert.deepEqual(render('unknown'), []);
});
