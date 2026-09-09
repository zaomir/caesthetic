// Bounded console diagnostics; the parallel TAP artifact preserves full failures.
// Reporting never changes Node's test exit status or test selection.
export default async function* compactReporter(source) {
  let pass = 0, fail = 0, output = 0;
  const limit = value => String(value ?? '').slice(0, 1600).replace(/\x1b\[[0-9;]*m/g, '');
  for await (const event of source) {
    if (event.type === 'test:pass') pass++;
    if (event.type === 'test:fail') {
      fail++;
      const d = event.data, err = d.details?.error;
      yield `FAIL ${limit(d.name)} (${d.file ?? ''}:${d.line ?? ''})\n`;
      yield `${limit(err?.cause?.message ?? err?.message)}\n`;
      if (err?.cause?.stack) yield `${limit(err.cause.stack)}\n`;
    }
    if (['test:stdout','test:stderr'].includes(event.type) && output < 16000) {
      const line = limit(event.data.message);
      output += line.length;
      yield line;
    }
  }
  yield `COMPACT_TEST_SUMMARY pass=${pass} fail=${fail}\n`;
}
