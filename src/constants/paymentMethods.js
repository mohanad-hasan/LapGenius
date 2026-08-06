// Payment method constants are used across checkout, order storage, and seller workflows.
// Keeping these values in one place makes it easier to integrate with a Laravel API later.
// Example Laravel API payloads:
// { payment_method: "cash_on_delivery" }
// { payment_method: "sham_cash" }

export const PAYMENT_METHODS = {
  CASH_ON_DELIVERY: "cash_on_delivery",
  SHAM_CASH: "sham_cash",
};
