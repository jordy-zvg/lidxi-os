import type { CheckoutSession, CheckoutSessionRequest, PaymentIntent } from './types.js';

export const mockCheckoutSession = (req: CheckoutSessionRequest): CheckoutSession => {
  const id = `cs_test_mock_${req.orderId.slice(0, 8)}`;
  return {
    id,
    url: `https://checkout.example.test/${id}?amount=${req.amountCents}`,
  };
};

export const mockPaymentIntent = (orderId: string): PaymentIntent => {
  const id = `pi_test_mock_${orderId.slice(0, 8)}`;
  return {
    id,
    clientSecret: `${id}_secret_mock`,
    status: 'requires_payment_method',
  };
};
