import mongoose from "mongoose";
import { DB_URL } from "./env.js";

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(DB_URL);
        console.log(`✅ Connected to MONGODB: ${conn.connection.host}`);
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        process.exit(1);
    }
};

export default connectDB;