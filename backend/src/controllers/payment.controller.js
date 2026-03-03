import Stripe from "stripe";
import { CHAPA_SECRET_KEY, PORT} from "../config/env.js";
import { User } from "../models/user.model.js";
import { Product } from "../models/product.model.js";
import { Order } from "../models/order.model.js";
import { Cart } from "../models/cart.model.js";
import { Chapa } from 'chapa-nodejs';



// const stripe = new Stripe(ENV.STRIPE_SECRET_KEY);
//creating chapa intent

export async function createPaymentIntent(req, res) {
  try {
    const { cartItems, shippingAddress } = req.body;
    const user = req.user;

    // Validate cart items
    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ error: "Cart is empty" });
    }

    // Calculate total from server-side (don't trust client - ever.)
    let subtotal = 0;
    const validatedItems = [];

    for (const item of cartItems) {
      const product = await Product.findById(item.product._id);
      if (!product) {
        return res.status(404).json({ error: `Product ${item.product.name} not found` });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({ error: `Insufficient stock for ${product.name}` });
      }

      subtotal += product.price * item.quantity;
      validatedItems.push({
        product: product._id.toString(),
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        image: product.images[0],
      });
    }

    const shipping = 10.0; // $10
    const tax = subtotal * 0.08; // 8%
    const total = subtotal + shipping + tax;

    if (total <= 0) {
      return res.status(400).json({ error: "Invalid order total" });
    }


      const chapa = new Chapa({
        secretKey: CHAPA_SECRET_KEY,
      });

      
      
      const tx_ref = await chapa.genTxRef();

           const order = await Order.create({
                user: user._id,
                orderItems: validatedItems,
                shippingAddress,
                totalPrice: total,
                paymentResult: {
                  id: tx_ref,
                  status: "pending",
                },
            });

      const response = await chapa.initialize({
      first_name: user.name,
      email: user.email,
      phone_number: user.phone,
      currency: "ETB",
      amount: total,
      tx_ref: tx_ref,
      callback_url: `http://localhost:${PORT}/api/payment/callback`,
      return_url: "http://localhost:3000/success",
      customization: {
        title: "My Store Payment",
        description: "Payment for items",
      },
    });

       res.json(response.data.checkout_url);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

      // find or create the stripe customer
    // let customer;
    // if (user.stripeCustomerId) {
    //   // find the customer
    //   customer = await stripe.customers.retrieve(user.stripeCustomerId);
    // } else {
    //   // create the customer
    //   customer = await stripe.customers.create({
    //     email: user.email,
    //     name: user.name,
    //     metadata: {
    //       clerkId: user.clerkId,
    //       userId: user._id.toString(),
    //     },
    //   });

      // add the stripe customer ID to the  user object in the DB
    //   await User.findByIdAndUpdate(user._id, { stripeCustomerId: customer.id });
    // }

    // create payment intent
    // const paymentIntent = await stripe.paymentIntents.create({
    //   amount: Math.round(total * 100), // convert to cents
    //   currency: "usd",
    //   customer: customer.id,
    //   automatic_payment_methods: {
    //     enabled: true,
    //   },
    //   metadata: {
    //     clerkId: user.clerkId,
    //     userId: user._id.toString(),
    //     orderItems: JSON.stringify(validatedItems),
    //     shippingAddress: JSON.stringify(shippingAddress),
    //     totalPrice: total.toFixed(2),
    //   },
    //   // in the webhooks section we will use this metadata
    // });

//     res.status(200).json({ clientSecret: paymentIntent.client_secret });
//   } catch (error) {
//     console.error("Error creating payment intent:", error);
//     res.status(500).json({ error: "Failed to create payment intent" });
//   }
// }

// export async function handleWebhook(req, res) {
//   const sig = req.headers["stripe-signature"];
//   let event;

//   try {
//     event = stripe.webhooks.constructEvent(req.body, sig, ENV.STRIPE_WEBHOOK_SECRET);
//   } catch (err) {
//     console.error("Webhook signature verification failed:", err.message);
//     return res.status(400).send(`Webhook Error: ${err.message}`);
//   }

//   if (event.type === "payment_intent.succeeded") {
//     const paymentIntent = event.data.object;

//     console.log("Payment succeeded:", paymentIntent.id);

//     try {
//       const { userId, clerkId, orderItems, shippingAddress, totalPrice } = paymentIntent.metadata;

//       // Check if order already exists (prevent duplicates)
//       const existingOrder = await Order.findOne({ "paymentResult.id": paymentIntent.id });
//       if (existingOrder) {
//         console.log("Order already exists for payment:", paymentIntent.id);
//         return res.json({ received: true });
//       }

//       // create order
//       const order = await Order.create({
//         user: userId,
//         clerkId,
//         orderItems: JSON.parse(orderItems),
//         shippingAddress: JSON.parse(shippingAddress),
//         paymentResult: {
//           id: paymentIntent.id,
//           status: "succeeded",
//         },
//         totalPrice: parseFloat(totalPrice),
//       });

//       // update product stock
//       const items = JSON.parse(orderItems);
//       for (const item of items) {
//         await Product.findByIdAndUpdate(item.product, {
//           $inc: { stock: -item.quantity },
//         });
//       }

//       console.log("Order created successfully:", order._id);
//     } catch (error) {
//       console.error("Error creating order from webhook:", error);
//     }
//   }

//   res.json({ received: true });
// }

export async function handleCallback(req, res) {
  try {
    const chapa = new Chapa({
      secretKey: CHAPA_SECRET_KEY,
    });

    const { tx_ref } = req.body;

    if (!tx_ref) {
      return res.status(400).json({ error: "Missing tx_ref" });
    }

    const result = await chapa.verify(tx_ref);

    // Find order
    const order = await Order.findOne({
      "paymentResult.id": tx_ref,
    });

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Prevent duplicate processing
    if (order.paymentResult.status === "paid") {
      return res.json({ message: "Already processed" });
    }

    if (result.status === "success") {
      // ✅ Update order
      order.paymentResult.status = "paid";
      order.isPaid = true;
      order.paidAt = new Date();
      await order.save();

      // ✅ Update stock
      for (const item of order.orderItems) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: -item.quantity },
        });
      }

      console.log("Payment successful:", tx_ref);
    } else {
      order.paymentResult.status = "failed";
      await order.save();

      console.log("Payment failed:", tx_ref);
    }

    res.sendStatus(200);

  } catch (error) {
    console.error("Callback error:", error);
    res.sendStatus(500);
  }
}