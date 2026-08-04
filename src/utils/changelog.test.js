import assert from 'node:assert/strict';
import test from 'node:test';
import { parseChangelog } from './changelog.js';

test('parses releases, sections, and user-facing changes', () => {
  const releases = parseChangelog(`# 更新日誌

## 2.7.2 - 2026-08-04

### 新增
- 可以調整壁紙位置

### 調整
- 可以按 Esc 關閉視窗`);

  assert.deepEqual(releases, [
    {
      title: '2.7.2 - 2026-08-04',
      sections: [
        { title: '新增', items: ['可以調整壁紙位置'] },
        { title: '調整', items: ['可以按 Esc 關閉視窗'] },
      ],
    },
  ]);
});
