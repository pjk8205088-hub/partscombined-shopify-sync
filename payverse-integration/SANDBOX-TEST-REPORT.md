# PayVerse Sandbox Test Report

Date: 2026-11-24 (Asia/Seoul)

## Scope

- Sandbox payment authorization
- Sandbox cancellation/refund
- Webhook delivery and result recording

## Current result

**NOT RUN — required PayVerse sandbox credentials are not configured.**

The Railway service `payverse-api` currently contains the sandbox environment and callback URLs, but does not contain:

- `PAYVERSE_MID`
- `PAYVERSE_CLIENT_KEY`
- `PAYVERSE_SECRET_KEY`

No payment request, authorization, cancellation, refund, or customer charge was performed.

## Ready infrastructure

- Railway service: `payverse-api`
- Sandbox mode: `PAYVERSE_ENV=test`
- Health endpoint: `/health`
- Webhook endpoint: `/api/payverse/webhook`
- Callback origin: `https://partscombined.com`

## Required next step

Add the three PayVerse sandbox credentials to Railway Variables. Then rerun this report with:

1. A small sandbox authorization request.
2. Verification of the returned `tid` and final status via callback/webhook.
3. A sandbox cancellation/refund request using the provider's approved cancellation API.
4. Verification that the final state is recorded and no live charge occurred.

Secret keys must remain in Railway environment variables and must not be placed in Shopify theme code or chat.

## PayVerse network configuration checked

Checked against the official PayVerse network configuration guide on 2026-11-24.

- PayVerse requires HTTPS and TLS 1.2 or higher.
- Test outbound endpoint: `https://pay-snd.payverseglobal.com`.
- Production outbound endpoint: `https://pay.payverseglobal.com`.
- Test Webhook source IP to allow if an inbound ACL is used: `182.162.130.21`.
- Production Webhook source IP: `182.162.130.11`.
- The payment request must include a Webhook URL so approval and cancellation status changes can be delivered.

### Network conclusion

The Railway public domain uses HTTPS, and the application exposes an HTTPS Webhook URL. The PayVerse test source IP and provider endpoint still need to be allowlisted if a store firewall or ACL is introduced. Credential-based payment and refund tests remain pending.
