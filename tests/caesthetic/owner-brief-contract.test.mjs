import assert from "node:assert/strict";
import test from "node:test";
import { report } from "../../scripts/caesthetic/build-spoken-medspa-russian.mjs";
import {
  OWNER_BRIEF_LAYOUT_CONTRACT,
  OWNER_BRIEF_SECTION_IDS,
  PREVIOUS_OWNER_BRIEF_LAYOUT_CONTRACT,
  isOwnerBriefLayout,
  validateOwnerBriefPresentation,
} from "../../scripts/caesthetic/owner-brief-contract.mjs";

const clone = (value) => structuredClone(value);

test("owner brief v2.1 keeps one shared nine-section presentation contract", () => {
  assert.equal(OWNER_BRIEF_LAYOUT_CONTRACT, "owner-brief/2.1.0");
  assert.equal(PREVIOUS_OWNER_BRIEF_LAYOUT_CONTRACT, "owner-brief/2.0.0");
  assert.equal(OWNER_BRIEF_SECTION_IDS.length, 9);
  assert.equal(isOwnerBriefLayout(report), true);
  assert.equal(validateOwnerBriefPresentation(report), true);
  assert.equal(report.presentation.owner_copy.implementation_options.length, 3);
  assert.equal(report.presentation.owner_copy.research_scope.links.length, 8);
});

test("owner brief v2 fails closed on missing localization or a fourth implementation path", () => {
  const missingLabel = clone(report);
  delete missingLabel.presentation.owner_copy.ui.observed_label;
  assert.throws(() => validateOwnerBriefPresentation(missingLabel), /owner_copy\.ui\.observed_label is required/);

  const fourthPath = clone(report);
  fourthPath.presentation.owner_copy.implementation_options.push(clone(fourthPath.presentation.owner_copy.implementation_options[0]));
  assert.throws(() => validateOwnerBriefPresentation(fourthPath), /exactly three implementation options/);
});

test("owner brief v2 cannot expose unassessed modules or change the Four-Surface commercial contracts", () => {
  const visibleUnknowns = clone(report);
  visibleUnknowns.presentation.hide_unassessed = false;
  assert.throws(() => validateOwnerBriefPresentation(visibleUnknowns), /must hide unassessed/);

  const wrongCommercialContract = clone(report);
  wrongCommercialContract.presentation.commercial_contract = "five-surfaces/1.0.0";
  assert.throws(() => validateOwnerBriefPresentation(wrongCommercialContract), /commercial contract is invalid/);
});

test("owner brief v2.1 publishes only approved HTTP(S) research links", () => {
  const unapprovedLink = clone(report);
  unapprovedLink.presentation.owner_copy.research_scope.links.push(["Другой источник", "https://example.com/"]);
  assert.throws(() => validateOwnerBriefPresentation(unapprovedLink), /contains an unapproved source/);

  const credentialLink = clone(report);
  credentialLink.presentation.owner_copy.research_scope.links[0][1] = "https://user:secret@example.com/";
  assert.throws(() => validateOwnerBriefPresentation(credentialLink), /must not contain credentials/);
});
