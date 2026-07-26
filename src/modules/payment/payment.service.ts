import { config } from "../../config";
import { prisma } from "../../lib/prisma";
import { stripe } from "../../lib/stripe";

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
	const session = await stripe.checkout.sessions.create({
		line_items: [
			{
				price_data: {
					currency: "usd",
					product_data: {
						name: `Rental Order #${order.id}`,
					},
					unit_amount: amountInCents,
				},
				quantity: 1,
			},
		],
		mode: "payment",
		payment_method_types: ["card"],
		success_url: `${config.APP_URL}/payment-success?orderId=${order.id}`,
		cancel_url: `${config.APP_URL}/payment-cancelled?orderId=${order.id}`,
		metadata: {
			rentalOrderId: order.id,
			customerId: customerId,
		},
	});

	const payment = await prisma.payment.create({
		data: {
			transactionId: session.id,
			gatewayRef: session.payment_intent as string | undefined,
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
		paymentUrl: session.url,
	};
};

const confirmPayment = async (payload: any) => {
	switch (payload.type) {
		case "checkout.session.completed": {
			const session = payload.data.object;
			const rentalOrderId = session.metadata?.rentalOrderId;

			if (!rentalOrderId) {
				console.log("Webhook: Missing rentalOrderId in session metadata");
				return;
			}

			await prisma.$transaction(async (tx) => {
				await tx.payment.update({
					where: { rentalOrderId },
					data: {
						status: "COMPLETED",
						paidAt: new Date(),
						gatewayRef: session.payment_intent as string,
					},
				});

				await tx.rentalOrder.update({
					where: { id: rentalOrderId },
					data: { status: "PAID" },
				});
			});
			break;
		}

		case "checkout.session.expired": {
			const session = payload.data.object;
			const rentalOrderId = session.metadata?.rentalOrderId;

			if (rentalOrderId) {
				await prisma.payment.update({
					where: { rentalOrderId },
					data: { status: "FAILED" },
				});
			}
			break;
		}

		default:
			console.log(`Webhook: Unhandled event type ${payload.type}`);
			break;
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
