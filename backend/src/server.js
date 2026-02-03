import express from "express";
import path from "path";
import { clerkMiddleware } from '@clerk/express'
import { PORT, NODE_ENV } from "./config/env.js";
import connectDB from "./config/db.js"; 
import { serve } from "inngest/express";
import { functions, inngest } from "./config/inngest.js";
import adminRoutes from "./routes/admin.route.js";
import userRoutes from "./routes/user.route.js";
import orderRoutes from "./routes/order.route.js";
import reviewRoutes from "./routes/review.route.js";
import productRoutes from "./routes/product.route.js";



const app = express();
app.use(express.json());

app.use(clerkMiddleware()); 


app.use("/api/inngest", serve({ client: inngest, functions }));

app.use("/api/admin", adminRoutes);
app.use("/api/users", userRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/products", productRoutes);




if (NODE_ENV === "production") {
    const adminDistPath = path.join(import.meta.dirname, "../../admin/dist");
    app.use(express.static(adminDistPath));

    app.get("{*splat}", (req, res) => {
        res.sendFile(path.join(adminDistPath, "index.html"));
    });
}

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log("Server is up and running");
  });
};

startServer();