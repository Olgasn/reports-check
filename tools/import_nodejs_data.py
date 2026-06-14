#!/usr/bin/env python3
"""
Импорт провайдеров, ключей, моделей, курсов (дисциплин), лабораторных работ
и промптов из старой Node.js (NestJS/TypeORM) базы в новую .NET (EF Core) базу.

Источник: server/db/dev.sqlite
Цель:     src/ReportsCheck.Web/reports-check.sqlite

Схемы совпадают 1:1, значение LlmInterface ('OpenAi' | 'Ollama') хранится строкой
в обеих базах. Id сохраняются, чтобы внешние ключи (Models.KeyId/ProviderId,
Labs.CourseId) остались валидными. Таблицы импортируются в порядке зависимостей:
сначала родительские (Keys, Providers, Courses), затем дочерние (Models, Labs).

Скрипт идемпотентен: повторный запуск не создаёт дублей (INSERT OR IGNORE по Id).
Перед записью делается резервная копия целевой базы рядом с ней (*.bak-<ts>).

Запуск из корня репозитория:  python tools/import_nodejs_data.py
"""
from __future__ import annotations

import os
import shutil
import sqlite3
import sys
import time

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(REPO, "server", "db", "dev.sqlite")
DST = os.path.join(REPO, "src", "ReportsCheck.Web", "reports-check.sqlite")

# (целевая таблица, исходная таблица, [(целевая колонка, исходная колонка), ...])
TABLES = [
    ("Keys", "keys", [
        ("Id", "id"), ("Name", "name"), ("Value", "value"),
    ]),
    ("Providers", "providers", [
        ("Id", "id"), ("Name", "name"), ("Url", "url"),
    ]),
    ("Models", "models", [
        ("Id", "id"), ("Name", "name"), ("Value", "value"),
        ("TopP", "top_p"), ("Temperature", "temperature"),
        ("MaxRetries", "maxRetries"), ("QueryDelay", "queryDelay"),
        ("ErrorDelay", "errorDelay"), ("MaxTokens", "max_tokens"),
        ("LlmInterface", "llmInterface"), ("CacheControl", "cacheControl"),
        ("KeyId", "keyId"), ("ProviderId", "providerId"),
    ]),
    ("Courses", "courses", [
        ("Id", "id"), ("Name", "name"), ("Description", "description"),
    ]),
    ("Labs", "labs", [
        ("Id", "id"), ("Name", "name"), ("Description", "description"),
        ("Filename", "filename"), ("Filesize", "filesize"),
        ("Content", "content"), ("CourseId", "courseId"),
    ]),
    ("Prompts", "prompts", [
        ("Id", "id"), ("Content", "content"), ("CourseId", "courseId"),
    ]),
]


def backup(path: str) -> str:
    ts = time.strftime("%Y%m%d_%H%M%S")
    dst = f"{path}.bak-{ts}"
    shutil.copy2(path, dst)
    for ext in ("-wal", "-shm"):
        if os.path.exists(path + ext):
            shutil.copy2(path + ext, dst + ext)
    return dst


def main() -> int:
    for p, label in ((SRC, "источник"), (DST, "цель")):
        if not os.path.exists(p):
            print(f"ОШИБКА: {label} не найден: {p}", file=sys.stderr)
            return 1

    bak = backup(DST)
    print(f"Резервная копия целевой базы: {bak}")

    src = sqlite3.connect(SRC)
    src.row_factory = sqlite3.Row
    dst = sqlite3.connect(DST, timeout=10)

    try:
        dst.execute("PRAGMA foreign_keys = ON")
        with dst:  # одна транзакция на весь импорт
            for tgt_table, src_table, cols in TABLES:
                tgt_cols = [c[0] for c in cols]
                src_cols = [c[1] for c in cols]
                placeholders = ", ".join("?" for _ in cols)
                col_list = ", ".join(f'"{c}"' for c in tgt_cols)
                insert = (
                    f'INSERT OR IGNORE INTO "{tgt_table}" ({col_list}) '
                    f"VALUES ({placeholders})"
                )

                rows = src.execute(
                    f"SELECT {', '.join(src_cols)} FROM {src_table}"
                ).fetchall()

                before = dst.execute(
                    f'SELECT COUNT(*) FROM "{tgt_table}"'
                ).fetchone()[0]
                dst.executemany(insert, [tuple(r) for r in rows])
                after = dst.execute(
                    f'SELECT COUNT(*) FROM "{tgt_table}"'
                ).fetchone()[0]

                # Сдвигаем AUTOINCREMENT за максимальный импортированный Id,
                # чтобы EF Core выдавал новые Id без коллизий.
                max_id = dst.execute(
                    f'SELECT MAX("Id") FROM "{tgt_table}"'
                ).fetchone()[0]
                # sqlite_sequence не имеет UNIQUE по name, поэтому UPDATE, а если
                # строки ещё нет — INSERT.
                if max_id is not None:
                    cur = dst.execute(
                        "UPDATE sqlite_sequence SET seq=? "
                        "WHERE name=? AND seq < ?",
                        (max_id, tgt_table, max_id),
                    )
                    exists = dst.execute(
                        "SELECT 1 FROM sqlite_sequence WHERE name=?",
                        (tgt_table,),
                    ).fetchone()
                    if not exists:
                        dst.execute(
                            "INSERT INTO sqlite_sequence(name, seq) VALUES(?, ?)",
                            (tgt_table, max_id),
                        )

                print(
                    f"{tgt_table}: исходных {len(rows)}, "
                    f"добавлено {after - before}, пропущено {len(rows) - (after - before)} "
                    f"(уже было), итого в таблице {after}"
                )
        print("Импорт завершён успешно.")
        return 0
    finally:
        src.close()
        dst.close()


if __name__ == "__main__":
    raise SystemExit(main())
