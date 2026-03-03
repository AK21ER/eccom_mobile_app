import { Router } from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { createPaymentIntent, handleCallback, getPaymentStatus } from "../controllers/payment.controller.js";

const router = Router();

router.post("/create-intent", protectRoute, createPaymentIntent);
router.post("/callback", handleCallback);
router.get("/status/:tx_ref", getPaymentStatus);



// // No auth needed - Stripe validates via signature
// router.post("/webhook", handleWebhook);

export default router;