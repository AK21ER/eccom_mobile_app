import express from "express";
import path from "path";
import { clerkMiddleware } from '@clerk/express'
import { PORT, NODE_ENV } from "./config/env.js";
import connectDB from "./config/db.js"; 
import { serve } from "inngest/express";
import { functions, inngest } from "./config/inngest.js";
import adminRoutes from "./routes/admin.route.js";


const app = express();
app.use(express.json());

app.use(clerkMiddleware()); 


app.use("/api/inngest", serve({ client: inngest, functions }));

app.use("/api/admin", adminRoutes);

if (NODE_ENV === "production") {
    const adminDistPath = path.join(import.meta.dirname, "../../admin/dist");
    app.use(express.static(adminDistPath));

    app.get("{*splat}", (req, res) => {
        res.sendFile(path.join(adminDistPath, "index.html"));
    });
}

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    connectDB();
});
