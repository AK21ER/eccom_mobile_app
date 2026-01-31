import express from "express";
import path from "path";
import { PORT, NODE_ENV } from "./config/env.js";

const app = express();


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
});
