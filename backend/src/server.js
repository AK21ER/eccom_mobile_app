import express from "express";
import path from "path";
import { clerkMiddleware } from '@clerk/express'
import { PORT, NODE_ENV } from "./config/env.js";
import connectDB from "./config/db.js"; 

const app = express();

app.use(clerkMiddleware()); 

app.get("/", (req, res) => {
    res.send("Hello World!");
});

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
