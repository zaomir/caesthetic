export const CAESTHETIC_REPO_SYNC = Object.freeze({
  type: "caesthetic_repo_sync",
  operations: Object.freeze(["run_once", "install_and_start", "status"]),
  sourceRepo: "zaomir/grainee-v2",
  satelliteRepo: "zaomir/caesthetic",
  branch: "main",
  runner: "scripts/caesthetic/continuous-sync-runner.sh",
  intervalSeconds: 15,
  policy: "DEC-829",
});

export function validateCaestheticRepoSyncRequest(request) {
  if (!request || request.type !== CAESTHETIC_REPO_SYNC.type) return false;
  if (!CAESTHETIC_REPO_SYNC.operations.includes(request.operation)) return false;
  const params = request.params || {};
  if (params.branch && params.branch !== "main") return false;
  const requestKeys = Object.keys(request);
  const paramKeys = Object.keys(params);
  if (requestKeys.some((key) => !["request_id", "type", "created_at", "requested_by", "operation", "params"].includes(key))) return false;
  if (paramKeys.some((key) => key !== "branch")) return false;
  return true;
}
