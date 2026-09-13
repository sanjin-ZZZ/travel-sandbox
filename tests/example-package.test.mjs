import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {validateTrip} from '../scripts/validate-trip.mjs';

const example = new URL('../assets/example-trip.json', import.meta.url);
const page = new URL('../examples/harbor-weekend/index.html', import.meta.url);

test('公开示例保留完整旅行需求到沙盘的虚构行程', async () => {
  const trip = validateTrip(JSON.parse(await readFile(example, 'utf8')));
  const html = await readFile(page, 'utf8');

  assert.equal(trip.title, '湖山海慢游 · 三日示例');
  assert.equal(trip.days.length, 3);
  assert.match(html, /湖山海慢游/);
});
