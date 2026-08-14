#!/usr/bin/env bash
# Dropbox draft sync for CAESTHETIC VOC student batches — FAIL-CLOSED for Phase-1.
# Canon: docs/ssot/CAESTHETIC_IG_GROWTH_PROGRAM.md §12 · DEC-812
# Override (OFF by default): CAE_PHASE0_STUDENT_VOC_ALLOW=1
set -euo pipefail

ENTRY="scripts/caesthetic/sync-ig-voc-dropbox.sh"
CODE="PHASE1_FAIL_CLOSE"
OVERRIDE="${CAE_PHASE0_STUDENT_VOC_ALLOW:-}"

if [[ ! "${OVERRIDE}" =~ ^(1|true|yes|on)$ ]]; then
  cat >&2 <<EOF
${CODE}: ${ENTRY} is fail-closed for CAESTHETIC Phase-1.
  Student/VOC Dropbox draft sync must not feed B_CAE_IG / @caesthetic.growth.
  Canon: docs/ssot/CAESTHETIC_IG_GROWTH_PROGRAM.md (§12) · DEC-812
  Founder override (OFF by default): CAE_PHASE0_STUDENT_VOC_ALLOW=1
  Blocked pattern: rclone sync …/COPY-VOC-* → dropbox:SIMON_OPS/content/B_CAE_IG/COPY-VOC-*
EOF
  exit 78
fi

echo "${CODE}_OVERRIDE: ${ENTRY} running with CAE_PHASE0_STUDENT_VOC_ALLOW=${OVERRIDE}" >&2
SRC="${1:-}"
DST="${2:-}"
if [[ -z "${SRC}" || -z "${DST}" ]]; then
  echo "usage: CAE_PHASE0_STUDENT_VOC_ALLOW=1 $0 <local-COPY-VOC-dir> <dropbox:…/COPY-VOC-…/>" >&2
  exit 2
fi
case "${DST}" in
  *COPY-VOC*|*B_CAE_IG*VOC*|*/cae-ig-voc/*) ;;
  *)
    echo "${CODE}: destination must be a VOC / B_CAE_IG VOC path; got: ${DST}" >&2
    exit 2
    ;;
esac
exec rclone sync "${SRC}" "${DST}"
