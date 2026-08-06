import test from 'node:test';
import assert from 'node:assert/strict';
import { applyOrderStockChange, clearStockStateForTests } from './orderStockManager.js';
import { PAYMENT_METHODS } from '../constants/paymentMethods.js';

test('Sham Cash create reduces stock and reject restores it once', async () => {
  clearStockStateForTests();

  const result = await applyOrderStockChange({
    orderId: 'order-1',
    paymentMethod: PAYMENT_METHODS.SHAM_CASH,
    action: 'create',
    items: [{ id: 42, qty: 2 }],
    stockLookup: { 42: 10 },
  });

  assert.equal(result.changed, true);
  assert.equal(result.newStockForProduct?.['42'], 8);

  const rejectResult = await applyOrderStockChange({
    orderId: 'order-1',
    paymentMethod: PAYMENT_METHODS.SHAM_CASH,
    action: 'reject',
    items: [{ id: 42, qty: 2 }],
    stockLookup: { 42: 8 },
  });

  assert.equal(rejectResult.changed, true);
  assert.equal(rejectResult.newStockForProduct?.['42'], 10);

  const secondReject = await applyOrderStockChange({
    orderId: 'order-1',
    paymentMethod: PAYMENT_METHODS.SHAM_CASH,
    action: 'reject',
    items: [{ id: 42, qty: 2 }],
    stockLookup: { 42: 10 },
  });

  assert.equal(secondReject.changed, false);
});

test('COD accept reduces stock but reject does not change it', async () => {
  clearStockStateForTests();

  const acceptResult = await applyOrderStockChange({
    orderId: 'order-2',
    paymentMethod: PAYMENT_METHODS.CASH_ON_DELIVERY,
    action: 'accept',
    items: [{ id: 77, qty: 1 }],
    stockLookup: { 77: 5 },
  });

  assert.equal(acceptResult.changed, true);
  assert.equal(acceptResult.newStockForProduct?.['77'], 4);

  const rejectResult = await applyOrderStockChange({
    orderId: 'order-2',
    paymentMethod: PAYMENT_METHODS.CASH_ON_DELIVERY,
    action: 'reject',
    items: [{ id: 77, qty: 1 }],
    stockLookup: { 77: 4 },
  });

  assert.equal(rejectResult.changed, false);
  assert.equal(rejectResult.newStockForProduct?.['77'], 4);
});
