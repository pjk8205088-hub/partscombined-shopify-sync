(() => {
  const root = document.querySelector('[data-payverse-payment]');
  const button = root?.querySelector('[data-payverse-button]');
  const status = root?.querySelector('[data-payverse-status]');
  if (!root || !button) return;

  const setStatus = (message) => {
    if (!status) return;
    status.hidden = !message;
    status.textContent = message || '';
  };

  button.addEventListener('click', async () => {
    button.disabled = true;
    setStatus('Preparing PayVerse checkout…');
    try {
      const response = await fetch(button.dataset.payverseEndpoint, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          productName: button.dataset.payverseProduct,
          amount: button.dataset.payverseAmount,
          currency: button.dataset.payverseCurrency,
        }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || 'PayVerse request failed');
      if (!window.payVerse?.requestUI) throw new Error('PayVerse SDK is unavailable');
      window.payVerse.requestUI(payload, (result) => {
        if (result?.resultStatus === 'SUCCESS') {
          setStatus('Payment completed.');
        } else {
          setStatus(result?.resultMessage || 'Payment was not completed.');
        }
        button.disabled = false;
      });
    } catch (error) {
      setStatus(error.message || 'Unable to start PayVerse checkout.');
      button.disabled = false;
    }
  });
})();
