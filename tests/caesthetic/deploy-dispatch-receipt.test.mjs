import test from 'node:test';
import assert from 'node:assert/strict';
import {caestheticDispatchReceipt,shaMatchesRequested} from '../../scripts/agent-api/lib/deploy-allowlist.mjs';

test('dispatch receipt distinguishes the deployed source from the triggering event commit',()=>{
  const source='a'.repeat(40),event='b'.repeat(40);
  const meta={ok:true,deployed_sha:source,requested_sha:source,workflow_event_head_sha:event,conclusion:'success',workflow_run_id:123,workflow_run_url:'https://github.com/zaomir/grainee-v2/actions/runs/123'};
  const receipt=caestheticDispatchReceipt({status:0,stdout:'dispatch accepted\n'+JSON.stringify(meta)},1);
  assert.equal(receipt.ok,true);assert.equal(receipt.deployed_sha,source);assert.equal(receipt.workflow_head_sha,event);
  assert.equal(shaMatchesRequested(source,receipt.deployed_sha,event),true);
  assert.equal(caestheticDispatchReceipt({status:1,stdout:JSON.stringify({...meta,ok:false,conclusion:'failure'})},1).ok,false);
  assert.equal(caestheticDispatchReceipt({status:null,stdout:''},1).ok,false);
  assert.equal(caestheticDispatchReceipt({status:0,stdout:JSON.stringify({ok:true,workflow_event_head_sha:event})},1).ok,false);
});
