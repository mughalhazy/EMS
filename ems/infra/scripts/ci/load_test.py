#!/usr/bin/env python3
from __future__ import annotations

import statistics
import time
from concurrent.futures import ThreadPoolExecutor, as_completed

TOTAL_REQUESTS = 2000
CONCURRENCY = 100
TARGET_P95_MS = 120
MIN_THROUGHPUT = 400


def mock_event_ingestion(request_id: int) -> float:
  start = time.perf_counter()
  _ = {
      'event_id': f'evt-{request_id % 250}',
      'tenant_id': f'tenant-{request_id % 12}',
      'payload_size': request_id % 1024,
  }
  time.sleep(0.003)
  return (time.perf_counter() - start) * 1000


def run_load_test() -> dict[str, float]:
  started = time.perf_counter()
  latencies: list[float] = []

  with ThreadPoolExecutor(max_workers=CONCURRENCY) as executor:
    futures = [executor.submit(mock_event_ingestion, i) for i in range(TOTAL_REQUESTS)]
    for future in as_completed(futures):
      latencies.append(future.result())

  elapsed_s = time.perf_counter() - started
  throughput = TOTAL_REQUESTS / elapsed_s
  p95 = statistics.quantiles(latencies, n=20)[18] if latencies else 0
  return {
      'elapsed_s': elapsed_s,
      'throughput_rps': throughput,
      'p95_ms': p95,
  }


def main() -> None:
  report = run_load_test()
  print(
      f"Load test report: elapsed={report['elapsed_s']:.2f}s throughput={report['throughput_rps']:.2f}rps p95={report['p95_ms']:.2f}ms"
  )

  if report['p95_ms'] > TARGET_P95_MS:
    raise SystemExit(f"p95 latency too high: {report['p95_ms']:.2f}ms > {TARGET_P95_MS}ms")

  if report['throughput_rps'] < MIN_THROUGHPUT:
    raise SystemExit(f"throughput too low: {report['throughput_rps']:.2f}rps < {MIN_THROUGHPUT}rps")


if __name__ == '__main__':
  main()
