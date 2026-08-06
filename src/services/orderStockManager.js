import { PAYMENT_METHODS } from '../constants/paymentMethods.js';

const stockStateByOrder = new Map();
const productStockOverrides = new Map();

function normalizeItems(items = []) {
  return (items || []).map((item) => ({
    id: item?.id ?? item?.product_id ?? item?.productId,
    qty: Number(item?.qty ?? item?.quantity ?? 1) || 0,
  })).filter((item) => item.id != null && item.qty > 0);
}

function getOrderState(orderId) {
  if (!stockStateByOrder.has(orderId)) {
    stockStateByOrder.set(orderId, { created: false, accepted: false, rejected: false, originalStockByProduct: {}, currentStockByProduct: {} });
  }
  return stockStateByOrder.get(orderId);
}

function getBaseStockLookup(state, stockLookup) {
  const current = state.currentStockByProduct || {};
  if (current && Object.keys(current).length > 0) {
    return { ...current };
  }
  return { ...(stockLookup || {}) };
}

function applyProductsToStock(stockLookup = {}, items = [], delta) {
  const nextStockByProduct = { ...(stockLookup || {}) };
  const normalizedItems = normalizeItems(items);

  normalizedItems.forEach((item) => {
    const productId = String(item.id);
    const currentStock = Number(nextStockByProduct[productId] ?? 0);
    nextStockByProduct[productId] = Math.max(0, currentStock + delta * item.qty);
  });

  return nextStockByProduct;
}

function updateProductStockOverrides(stockLookup = {}) {
  Object.entries(stockLookup || {}).forEach(([productId, stock]) => {
    const normalizedId = String(productId);
    const normalizedStock = Number(stock) || 0;
    productStockOverrides.set(normalizedId, normalizedStock);
  });
}

export function getProductStockOverride(productId) {
  const normalizedId = String(productId);
  return productStockOverrides.has(normalizedId) ? Number(productStockOverrides.get(normalizedId)) : null;
}

export async function applyOrderStockChange({ orderId, paymentMethod, action, items, stockLookup }) {
  if (!orderId) return { changed: false, newStockForProduct: stockLookup || {} };

  const state = getOrderState(orderId);
  const normalizedItems = normalizeItems(items);
  updateProductStockOverrides(stockLookup || {});

  if (action === 'create') {
    if (paymentMethod === PAYMENT_METHODS.SHAM_CASH) {
      state.created = true;
      state.rejected = false;
      state.accepted = false;
      state.originalStockByProduct = {
        ...(state.originalStockByProduct || {}),
      };
      state.currentStockByProduct = {
        ...(state.currentStockByProduct || {}),
      };

      normalizedItems.forEach((item) => {
        const productId = String(item.id);
        const previousStock = Number(stockLookup?.[productId] ?? productStockOverrides.get(productId) ?? 0);
        if (!state.originalStockByProduct[productId]) {
          state.originalStockByProduct[productId] = previousStock;
        }
        state.currentStockByProduct[productId] = previousStock - item.qty;
        productStockOverrides.set(productId, state.currentStockByProduct[productId]);
      });

      return {
        changed: true,
        newStockForProduct: Object.fromEntries(Object.entries(state.currentStockByProduct).map(([productId, value]) => [productId, value])),
      };
    }

    return { changed: false, newStockForProduct: stockLookup || {} };
  }

  if (action === 'accept') {
    if (paymentMethod === PAYMENT_METHODS.CASH_ON_DELIVERY) {
      if (state.accepted) {
        return { changed: false, newStockForProduct: state.currentStockByProduct || stockLookup || {} };
      }
      state.accepted = true;
      const nextStock = applyProductsToStock(getBaseStockLookup(state, stockLookup), normalizedItems, -1);
      state.currentStockByProduct = nextStock;
      return { changed: true, newStockForProduct: nextStock };
    }

    return { changed: false, newStockForProduct: state.currentStockByProduct || stockLookup || {} };
  }

  if (action === 'reject') {
    if (paymentMethod === PAYMENT_METHODS.SHAM_CASH) {
      if (state.rejected) {
        return { changed: false, newStockForProduct: state.currentStockByProduct || stockLookup || {} };
      }
      state.rejected = true;
      normalizedItems.forEach((item) => {
        const productId = String(item.id);
        const originalStock = Number(state.originalStockByProduct?.[productId] ?? stockLookup?.[productId] ?? productStockOverrides.get(productId) ?? 0);
        const currentStock = Number(state.currentStockByProduct?.[productId] ?? originalStock);
        state.currentStockByProduct[productId] = Math.max(0, currentStock + item.qty);
        state.originalStockByProduct[productId] = originalStock;
        productStockOverrides.set(productId, state.currentStockByProduct[productId]);
      });
      return {
        changed: true,
        newStockForProduct: Object.fromEntries(Object.entries(state.currentStockByProduct).map(([productId, value]) => [productId, value])),
      };
    }

    return { changed: false, newStockForProduct: state.currentStockByProduct || stockLookup || {} };
  }

  return { changed: false, newStockForProduct: state.currentStockByProduct || stockLookup || {} };
}

export function clearStockStateForTests() {
  stockStateByOrder.clear();
  productStockOverrides.clear();
}
