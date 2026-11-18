import test from 'node:test';
import assert from 'node:assert/strict';
import { classifyPrediction, predictionLocationKey } from '../src/utils/predictionZones.js';
const now = 1000000;
test('matches model Safe boundary at 60', () => {
  assert.equal(classifyPrediction({ score: 60 }, now, now).label, 'Green zone');
  assert.equal(classifyPrediction({ score: 59.9 }, now, now).label, 'Red zone');
  assert.equal(classifyPrediction({ score: 0 }, now, now).label, 'Red zone');
  assert.equal(classifyPrediction({ score: 100 }, now, now).label, 'Green zone');
});
test('missing, malformed or out of range predictions never create a safe zone', () => {
  for (const prediction of [null, {}, { score: null }, { score: '95' }, { score: NaN }, { score: -1 }, { score: 101 }]) {
    assert.equal(classifyPrediction(prediction, now, now), null);
  }
});
test('expired and future predictions remain unclassified', () => {
  assert.equal(classifyPrediction({ score: 95 }, now - 120000, now), null);
  assert.equal(classifyPrediction({ score: 95 }, now + 1, now), null);
  assert.equal(classifyPrediction({ score: 95 }, undefined, now), null);
});
test('a moved location gets its own prediction key; nearby GPS jitter reuses a cell', () => {
  assert.equal(predictionLocationKey({ lat: 28.613901, lng: 77.209001 }), predictionLocationKey({ lat: 28.613902, lng: 77.209002 }));
  assert.notEqual(predictionLocationKey({ lat: 28.61, lng: 77.20 }), predictionLocationKey({ lat: 28.62, lng: 77.21 }));
});
