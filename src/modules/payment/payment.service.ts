import { prisma } from "@/src/lib/prisma";
import { stripe } from "@/src/lib/stripe";

const createPayment = async (rentalOrderId: string, customerId: string) => {
  const order = await prisma.rentalOrder.findFirst({
    where: { id: rentalOrderId, customerId },
    include: { payment: true },
  });

  if (!order) {
    throw new Error("Rental order not found");
  }

  if (order.payment) {
    throw new Error("This order already has a payment record");
  }

  if (order.status !== "CONFIRMED") {
    throw new Error("Order must be CONFIRMED by the provider before payment");
  }

  const amountInCents = Math.round(Number(order.totalAmount) * 100);

  const paymentIntent = await stripe.paymentIntents.create({
    amount: amountInCents,
    currency: "usd",
    metadata: {
      rentalOrderId: order.id,
      customerId: customerId,
    },
  });

  const payment = await prisma.payment.create({
    data: {
      transactionId: paymentIntent.id,
      gatewayRef: paymentIntent.client_secret ?? undefined,
      amount: order.totalAmount,
      provider: "STRIPE",
      method: "CARD",
      status: "PENDING",
      userId: customerId,
      rentalOrderId: order.id,
    },
  });

  return {
    payment,
    clientSecret: paymentIntent.client_secret,
  };
};

const confirmPayment = async (payload: any) => {
  const paymentIntent = payload.data.object;
  const rentalOrderId = paymentIntent.metadata.rentalOrderId;

  if (!rentalOrderId) {
    throw new Error("Missing rentalOrderId in payment metadata");
  }

  if (payload.type === "payment_intent.succeeded") {
    await prisma.$transaction(async (transection) => {
      await transection.payment.update({
        where: { rentalOrderId },
        data: {
          status: "COMPLETED",
          paidAt: new Date(),
        },
      });

      await transection.rentalOrder.update({
        where: { id: rentalOrderId },
        data: { status: "PAID" },
      });
    });
  }

  if (payload.type === "payment_intent.payment_failed") {
    await prisma.payment.update({
      where: { rentalOrderId },
      data: { status: "FAILED" },
    });
  }

  return { received: true };
};

const getMyPayments = async (customerId: string) => {
  return prisma.payment.findMany({
    where: { userId: customerId },
    include: {
      rentalOrder: {
        include: { rentalItems: { include: { gearItem: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};

const getPaymentById = async (paymentId: string, customerId: string) => {
  const payment = await prisma.payment.findFirst({
    where: { id: paymentId, userId: customerId },
    include: {
      rentalOrder: {
        include: { rentalItems: { include: { gearItem: true } } },
      },
    },
  });

  if (!payment) {
    throw new Error("Payment not found");
  }

  return payment;
};

export const paymentService = {
  createPayment,
  confirmPayment,
  getMyPayments,
  getPaymentById,
};
