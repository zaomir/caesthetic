# CAESTHETIC — Payment, Dispute & Evidence Runtime

Status: runtime canon
Date: 2026-08-24
Applies to: CAESTHETIC commercial orders, invoices, payment requests, Wise rail, Stripe ACH preparation

## 1. Commercial SSOT

CAESTHETIC owns the commercial truth:

`Commercial Order → CAESTHETIC Invoice → Payment Request → Payment Rail → Confirmed Funds → Delivery → Evidence Bundle`

Wise and Stripe are payment rails, not the commercial SSOT. Canonical identifiers remain in CAESTHETIC: `order_number`, `sow_id`, `invoice_number`, `payment_request_id`, signer/client identity, amount/currency, service period and Evidence Bundle.

## 2. Current rails

Wise:
- payment link / Wise Invoice may be used as the client-facing rail;
- operator reconciliation remains valid;
- redirect or page completion never means `credited`.

### 2.1 Wise candidate URL confirmation — 2026-09-03

- Candidate runtime payment URL supplied for review: `https://wise.com/pay/r/kwMcyJYZK6SpTxc`.
- Live verification returned HTTP 200, requested `500 USD` and displayed the payee as `Rovlex International Ltd`.
- Founder confirmation: the link and displayed payee identity are correct for this payment rail.
- Status: `approved_candidate`.
- Runtime activation remains a separate controlled server-side configuration through `CAESTHETIC_WISE_PAYMENT_LINK`; the URL must not be hard-coded into the public site or client bundle.

This records the approved candidate without changing payment-settlement or reconciliation rules.

Stripe ACH:
- code-side ACH Checkout is already prepared with `us_bank_account`;
- it is fail-closed unless `STRIPE_SECRET_KEY` is configured;
- settlement is accepted only from Stripe `checkout.session.async_payment_succeeded`, not `checkout.session.completed`;
- Stripe-side account/payment-method configuration is a separate activation step.

No payment provider may replace the CAESTHETIC invoice/order/payment-request model.

### Lead-to-Revenue Check payment contract

`lead_to_revenue_check` is an allowed commercial-order product only when:

- the signed order references the confirmed written scope through `sow_id`;
- the amount is exactly `50000` USD minor units;
- the private payment request is created from that order;
- the reusable Wise rail URL remains server-side in `CAESTHETIC_WISE_PAYMENT_LINK`;
- redirect remains execution evidence only and never marks the request credited.

Payment email, receipt and hosted-rail labels resolve from the allowlisted product
code. The automatic 30-day Sprint activation path is restricted to
`growth_sprint`; a paid Check cannot start a Sprint or create a Sprint service period.

## 3. Payer authorization

Before leaving the private payment page, record:
- payer name;
- payer relationship to the practice;
- expected account type;
- explicit authority attestation;
- timestamp;
- terms version;
- supporting IP/user-agent evidence.

Do not store PHI, card data, bank login credentials, full bank account details or Stripe `client_secret` values.

## 4. Reconciliation gate

Only confirmed incoming funds may become `credited`.

Controls:
- expected amount and currency;
- unique `provider_transaction_id`;
- explicit `partial`, `overpaid`, `reference_missing`, `unmatched` states;
- ambiguous cases → `manual_review`;
- one provider transaction cannot settle two payment requests.

Sprint activation requires both `credited` and completed Day-0 Access Gate.

## 5. Settlement status vs risk status

Settlement/delivery status and dispute risk are separate dimensions.

`status` remains the payment/service lifecycle (`payment_pending`, `credited`, `delivery_started`, `returned`, etc.).

`risk_status` is provider-neutral: `none | open | under_review | won | lost`.

Opening a dispute/return case must not turn an already-paid payment request into a payable request again. Only an explicit confirmed funds return changes settlement status to `returned` or `refunded`.

## 6. Provider-neutral payment cases

Use `caesthetic_payment_cases` for:
- ACH return;
- dispute;
- inquiry;
- early warning;
- refund;
- reversal;
- other provider cases.

Case lifecycle: `open → under_review/contested → won/lost/accepted/reversed/closed`.

Legacy card-chargeback statuses remain only for backwards compatibility; the new canonical model is provider-neutral.

## 7. Provider event ledger

`caesthetic_payment_provider_events` stores sanitized provider events with provider/event ID uniqueness.

A provider event is evidence only. Recording an event cannot by itself set `credited`.

Future Stripe/Wise API/webhook integrations should normalize their events here while existing reconciliation remains authoritative.

## 8. Evidence during delivery

Evidence is created during delivery, not reconstructed after a dispute.

`caesthetic_service_receipts` supports:
- weekly receipts;
- monthly delivery statements;
- milestone receipts;
- dependency records;
- approvals.

Each receipt may contain deliverables, client dependencies, source references and acknowledgement state (`sent`, `acknowledged`, `approved`, `objected`).

## 9. Evidence Bundle

One payment request can have versioned bundles `EVD-<invoice/order>-V<n>`.

Bundle categories:
- contract;
- payment;
- service_start;
- delivery;
- client_interaction;
- dependency;
- acceptance;
- communications;
- dispute.

`build_bundle` joins Commercial Order, Payment Request, payer authorization, provider IDs, payment evidence events, provider events, service receipts, payment cases and additional evidence items into one manifest.

The manifest receives a SHA-256 hash and a coverage report. Core coverage checks contract, invoice, payer authorization, payment reconciliation and communications. Once service has started, service-start and delivery evidence are also required.

`freeze_bundle` makes evidence immutable. Frozen items cannot be edited/deleted. A frozen bundle can only advance to `submitted`; submitted bundles are immutable.

## 10. Operator API

`caesthetic-dispute-evidence` exposes public GET health only. Mutations require Supabase service role or `CAESTHETIC_BILLING_ADMIN_KEY`.

Actions:
- `record_evidence`
- `record_service_receipt`
- `record_provider_event`
- `attach_provider_objects`
- `open_case`
- `update_case`
- `build_bundle`
- `freeze_bundle`
- `get_bundle`

`attach_provider_objects` stores provider metadata only and cannot change settlement status.

## 11. Stripe ACH mapping when Stripe-side setup is completed

Map Stripe objects into generic fields:
- Stripe Customer → `provider_customer_id`;
- Checkout Session → `provider_session_id`;
- ACH PaymentIntent/payment object → `provider_payment_id`;
- PaymentMethod → `provider_payment_method_id`;
- mandate/authorization → `provider_authorization_id`;
- Stripe Event → `caesthetic_payment_provider_events`;
- ACH return/dispute/inquiry → `caesthetic_payment_cases`.

Stripe webhook signature verification, mandate wording, Financial Connections configuration and account-side activation remain separate from this provider-neutral evidence layer.

## 12. Security boundary

All payment/evidence tables have RLS enabled and no public policies. Provider secrets remain server-side. Evidence payloads must be sanitized and contain no PHI or payment credentials.

This runtime implements operational evidence controls; it does not replace state-specific legal review of healthcare compensation, contracts or dispute rights.
