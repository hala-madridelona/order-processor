import Stripe from 'stripe';
import { createPayment } from '../sql/operations/payment.js';
import { updateOrderStatus } from '../sql/operations/orders.js';
import { OrderStatus } from '../sql/models/orders.js';

let stripe: Stripe | null = null;
const getStripe = (): Stripe => {
    if (!stripe) {
        stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
    }
    return stripe;
}

export const createPaymentIntent = async (orderId: string) => {
    try {
        const stripe = getStripe();
        const paymentIntent = await stripe.paymentIntents.create({
            // Amout is in smallest currency -> paise
            amount: 10000,
            currency: 'inr',
            metadata: {
                orderId
            }
        });

        const paymentIntentId = paymentIntent.id;
        // Add an entry in payments table
        await createPayment(orderId, paymentIntentId);
        // Update status in orders table
        await updateOrderStatus(orderId, OrderStatus.PAYMENT_INITIATED);

        return paymentIntent.client_secret;
    } catch (error) {
        const errorMessage = (error as Error).message;
        throw new Error(`Could not create payment intent: ${errorMessage}`);
    }
}