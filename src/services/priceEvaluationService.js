/*
  priceEvaluationService (client util)

  Notes for future Laravel integration:
  - Can keep this logic client-side for instant UI feedback, or expose as API:
    POST /api/price/evaluate { sellerPrice, estimatedPrice } -> { differencePercentage, status }
  - Centralizing logic in a service avoids duplication across UI components.
*/

export const PRICE_EVALUATION_STATUS = {
  GOOD: "good",
  ACCEPTABLE: "acceptable",
  SLIGHTLY_HIGH: "slightlyHigh",
  OVERPRICED: "overpriced"
};

const STATUS_CONFIG = [
  { max: 10, status: PRICE_EVALUATION_STATUS.GOOD },
  { max: 20, status: PRICE_EVALUATION_STATUS.ACCEPTABLE },
  { max: 30, status: PRICE_EVALUATION_STATUS.SLIGHTLY_HIGH },
  { max: Infinity, status: PRICE_EVALUATION_STATUS.OVERPRICED }
];

export function evaluatePrice(sellerPrice, estimatedPrice) {
  const seller = Number(sellerPrice);
  const estimate = Number(estimatedPrice);
  if (!Number.isFinite(seller) || !Number.isFinite(estimate) || estimate === 0) {
    return {
      differencePercentage: 0,
      differenceAbsPercentage: 0,
      status: PRICE_EVALUATION_STATUS.GOOD
    };
  }

  const differencePercentage = Math.round(((seller - estimate) / estimate) * 100);
  const differenceAbsPercentage = Math.abs(differencePercentage);
  const positiveDistance = differencePercentage;
  const status = STATUS_CONFIG.find((item) => positiveDistance <= item.max).status;

  return {
    differencePercentage,
    differenceAbsPercentage,
    status
  };
}

export function getPriceEvaluationClasses(status) {
  switch (status) {
    case PRICE_EVALUATION_STATUS.ACCEPTABLE:
      return { border: "border-yellow-500/30", bg: "bg-yellow-500/10", text: "text-yellow-700" };
    case PRICE_EVALUATION_STATUS.SLIGHTLY_HIGH:
      return { border: "border-orange-500/30", bg: "bg-orange-500/10", text: "text-orange-700" };
    case PRICE_EVALUATION_STATUS.OVERPRICED:
      return { border: "border-destructive/30", bg: "bg-destructive/10", text: "text-destructive" };
    default:
      return { border: "border-success/30", bg: "bg-success/10", text: "text-success" };
  }
}
