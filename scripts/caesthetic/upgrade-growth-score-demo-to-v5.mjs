#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

function upgrade(report) {
  const diagnosis = report.humanDiagnosis;
  const problems = diagnosis.problem_inventory || [];
  const tasks = diagnosis.remediation_tasks || [];
  const taskByProblem = new Map();
  for (const task of tasks) {
    for (const problemId of task.problem_refs || []) {
      if (!taskByProblem.has(problemId)) taskByProblem.set(problemId, task);
    }
  }

  const gapInventory = problems.map((problem) => {
    const task = taskByProblem.get(problem.id);
    const verified = problem.status === "diagnosed";
    const longWork = /high/i.test(problem.complexity || "") || /high/i.test(task?.effort_complexity || "");
    const mode = !verified ? "backlog" : longWork ? "start_in_30_days" : "close_in_30_days";
    return {
      id: problem.id,
      title: problem.title,
      diagnosis_state: verified ? "verified_gap" : problem.status === "monitor" ? "monitor" : "insufficient_evidence",
      surfaces: [problem.surface],
      journey_stage: problem.surface === "website" ? "booking" : problem.surface === "reputation" ? "trust" : "discovery",
      evidence_refs: problem.evidence_refs,
      why_it_matters: problem.impact,
      sprint_fit: { mode },
      repair_plan: {
        outcome: task?.outcome || "Collect the missing public evidence before assigning a repair.",
        diy_steps: task?.steps || ["Record the missing source, date and method.", "Do not invent a fix until the evidence is approved."],
        dependencies: task?.dependencies || [],
        owner_role: task?.owner_role || "Practice owner or named operator",
        done_when: task?.acceptance_evidence || ["A dated public observation exists."],
        ...(mode === "start_in_30_days" ? {
          day_30_outcome: "The first approved public correction is live and the remaining work is scoped.",
          beyond_day_30: "Continue the remaining public-path work after Day 30; it is not Sprint scope by default.",
        } : {}),
      },
    };
  });

  const verified = gapInventory.filter((gap) => gap.diagnosis_state === "verified_gap");
  if (verified.length < 3) {
    throw new Error(`${report.practice?.name || "report"} is evidence_incomplete`);
  }

  const close = verified.filter((gap) => gap.sprint_fit.mode === "close_in_30_days");
  const start = verified.filter((gap) => gap.sprint_fit.mode === "start_in_30_days");
  const selected = [...close.slice(0, 3), ...start.slice(0, close.length >= 2 ? 1 : 0)].slice(0, 4);
  while (selected.length < 3) {
    const extra = verified.find((gap) => !selected.includes(gap));
    if (!extra) break;
    extra.sprint_fit.mode = "close_in_30_days";
    delete extra.repair_plan.day_30_outcome;
    delete extra.repair_plan.beyond_day_30;
    selected.push(extra);
  }
  selected.slice(2).forEach((gap, index) => {
    if (index === 0 && gap.sprint_fit.mode !== "start_in_30_days" && start.includes(gap)) return;
  });

  const primary = selected[0];
  const supporting = selected.slice(1);
  gapInventory.forEach((gap) => {
    if (!selected.includes(gap) && gap.diagnosis_state === "verified_gap") gap.sprint_fit.mode = "backlog";
  });

  const next = structuredClone(report);
  next.schemaVersion = 5;
  next.humanDiagnosis = {
    ...diagnosis,
    binding_constraint: {
      ...diagnosis.binding_constraint,
      gap_ref: primary.id,
    },
    gap_inventory: gapInventory,
    focus_selection: {
      primary_gap_id: primary.id,
      supporting_gap_ids: supporting.map((gap) => gap.id),
      selected_by: diagnosis.reviewer.name,
      selected_at: diagnosis.reviewer.approved_at,
      rationale: `The named reviewer selected ${primary.title} as the binding hole and the related 30-day repairs.`,
    },
  };
  delete next.humanDiagnosis.top_priorities;
  delete next.humanDiagnosis.problem_inventory;
  delete next.humanDiagnosis.remediation_tasks;
  delete next.humanDiagnosis.roadmap_preview;
  return next;
}

const demos = [
  "site-caesthetic/score/demo-medical-aesthetics-search-gap/report.json",
  "site-caesthetic/score/demo-injector-practice-booking-friction/report.json",
  "site-caesthetic/score/demo-aesthetics-clinic-reputation-gap/report.json",
];

for (const relative of demos) {
  const file = path.join(root, relative);
  const report = JSON.parse(fs.readFileSync(file, "utf8"));
  fs.writeFileSync(file, `${JSON.stringify(upgrade(report), null, 2)}\n`);
  console.log(`Upgraded ${relative}`);
}
