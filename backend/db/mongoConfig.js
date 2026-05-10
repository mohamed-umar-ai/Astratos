const mongoose = require('mongoose');

const connectDB = async () => {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 5000
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
};

module.exports = connectDB;

