import { Router } from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { createPaymentIntent, handleCallback } from "../controllers/payment.controller.js";

const router = Router();

router.post("/create-intent", protectRoute, createPaymentIntent);
router.post("/callback", handleCallback);



// // No auth needed - Stripe validates via signature
// router.post("/webhook", handleWebhook);

export default router;