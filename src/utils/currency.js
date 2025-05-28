// Mock exchange rates (replace with real API if available)
const exchangeRates = {
  MUR: { USD: 0.021, EUR: 0.019 },
  USD: { MUR: 47.62, EUR: 0.90 },
  EUR: { MUR: 52.63, USD: 1.11 },
};

export const convertCurrency = (amount, fromCurrency, toCurrency) => {
  if (fromCurrency === toCurrency) return amount;
  if (!exchangeRates[fromCurrency] || !exchangeRates[fromCurrency][toCurrency]) {
    console.warn(`Conversion from ${fromCurrency} to ${toCurrency} not supported`);
    return amount;
  }
  return (amount * exchangeRates[fromCurrency][toCurrency]).toFixed(2);
};