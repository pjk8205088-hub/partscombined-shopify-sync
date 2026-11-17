# PayVerse payment integration scaffold

This scaffold keeps PayVerse signing secrets server-side. Do not place `PAYVERSE_SECRET_KEY` in Shopify theme code.

## Required environment variables

```text
PAYVERSE_MID=
PAYVERSE_CLIENT_KEY=
PAYVERSE_SECRET_KEY=
PAYVERSE_ENV=test
PAYVERSE_RETURN_URL=https://partscombined.com/apps/payverse/return
PAYVERSE_WEBHOOK_URL=https://partscombined.com/apps/payverse/webhook
ALLOWED_ORIGIN=https://partscombined.com
```

Run the syntax check with `npm run check`, run the local request test with `npm run smoke-test`, and start the service with `npm start`.

The smoke test uses local dummy credentials only. It does not contact PayVerse and does not create a payment.

The Shopify theme button should call the server endpoint to obtain a signed payment request. The server must create a unique order ID, calculate the amount from the Shopify cart/order source, and verify the PayVerse callback or webhook before marking an order paid.

## Theme files prepared

- `payverse-button.liquid`: product-page button markup and PayVerse SDK loading.
- `payverse-button.js`: calls the server signing endpoint and opens `requestUI()`.

Copy these files into the active Shopify theme only after the server URL, CORS policy, order mapping, and webhook verification are configured. The current repository does not contain the active Shopify theme source, so this step cannot be published to the live theme from the repository alone.

The official PayVerse SDK is loaded only in the browser:

```html
<script src="https://ui-snd.payverseglobal.com/js/payments.js"></script>
```

Replace the test SDK host with the production host only after PayVerse production approval.
