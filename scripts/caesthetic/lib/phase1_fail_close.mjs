/**
 * CAESTHETIC Phase-1 fail-close for student/VOC Phase-0 paths.
 * SSOT: docs/ssot/CAESTHETIC_IG_GROWTH_PROGRAM.md §12 · DEC-812
 * Override (OFF by default): CAE_PHASE0_STUDENT_VOC_ALLOW=1
 */
export const OVERRIDE_ENV = "CAE_PHASE0_STUDENT_VOC_ALLOW";
export const CODE = "PHASE1_FAIL_CLOSE";
export const CANON = "docs/ssot/CAESTHETIC_IG_GROWTH_PROGRAM.md";

export function overrideEnabled(env = process.env) {
  return /^(1|true|yes|on)$/i.test(String(env[OVERRIDE_ENV] || "").trim());
}

/** @returns {number} non-zero exit code */
export function refuse(entrypoint, { stream = process.stderr } = {}) {
  stream.write(
    `${CODE}: ${entrypoint} is fail-closed for CAESTHETIC Phase-1.\n` +
      `  Student/VOC/academy Phase-0 paths must not drive @caesthetic.growth.\n` +
      `  Canon: ${CANON} (§12 supersession) · DEC-812\n` +
      `  Founder override (OFF by default): ${OVERRIDE_ENV}=1\n`
  );
  return 78;
}

export function requireOrExit(entrypoint) {
  if (overrideEnabled()) {
    process.stderr.write(
      `${CODE}_OVERRIDE: ${entrypoint} running with ${OVERRIDE_ENV}=1 ` +
        `(founder-only; not Phase-1 default)\n`
    );
    return;
  }
  process.exit(refuse(entrypoint));
}
