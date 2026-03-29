# テストカバレッジ計測ガイド

カバレッジは通常運用には組み込まず、参考に確認したい場合のみ実行する。

## バックエンド (pytest-cov)

### 実行コマンド

```bash
cd backend && uv run pytest --cov=app --cov-report=term-missing
```

### レポートの見方

```
Name                              Stmts   Miss  Cover   Missing
---------------------------------------------------------------
app/services/thread_service.py       30      0   100%
app/routers/threads.py               66     27    59%   24, 41, 56-60
app/services/openai_service.py       30     21    30%   14-16, 23-37
---------------------------------------------------------------
TOTAL                               268     63    76%
```

| 列 | 意味 |
|---|---|
| Stmts | ファイル内の実行可能な文の総数 |
| Miss | テストで一度も実行されなかった文の数 |
| Cover | `(Stmts - Miss) / Stmts` のカバレッジ率 |
| Missing | 未実行の行番号 |

### 注意点

- `openai_service.py` は OpenAI 呼び出しをモックしているため低くなるが、設計上の意図なので問題ない
- `config.py` や `main.py` はアプリ起動時の処理がテスト環境で通らないため低くなりやすい

---

## フロントエンド (Vitest + @vitest/coverage-v8)

### 実行コマンド

```bash
cd frontend && npx vitest run --coverage
```

### レポートの見方

```
File    | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
--------|---------|----------|---------|---------|-------------------
hooks   |   86.15 |    66.66 |   80.76 |      84 |
  ...ts |    77.5 |       20 |   70.58 |   75.75 | 39-47,54-57
stores  |     100 |      100 |     100 |     100 |
```

| 列 | 意味 |
|---|---|
| % Stmts | 実行された文の割合 |
| % Branch | `if/else` や三項演算子などの分岐を両方通った割合 |
| % Funcs | 呼び出された関数の割合 |
| % Lines | 実行された行の割合 |

### 注意点

- デフォルトではテストからインポートされたファイルのみが集計対象になる
  - 一度もインポートされていないファイルは表示されない
- HTMLレポートも出力したい場合は `vite.config.ts` の `reporter` を変更する

```ts
// vite.config.ts
coverage: {
  reporter: ['text', 'html'], // html を追加すると frontend/coverage/ にファイルが生成される
},
```

- `coverage/` ディレクトリは `.gitignore` に追加しておく

```
# frontend/.gitignore
coverage/
```

---

## HTMLレポートについて

`reporter` に `html` を追加すると `frontend/coverage/` にソースコードへの色付きハイライトが生成される。

| 色 | 意味 |
|---|---|
| 緑 | テストで実行された行 |
| 赤 | 一度も実行されなかった行 |
| 黄 | 分岐の片方だけ通った行 |

ターミナルの行番号だけでは分かりにくい「どの条件分岐が抜けているか」を視覚的に確認できる。
