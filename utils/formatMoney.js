// utils/formatMoney.js
export const formatMoney = (value) => {
  return `$${parseFloat(value).toFixed(2)}`;
};
