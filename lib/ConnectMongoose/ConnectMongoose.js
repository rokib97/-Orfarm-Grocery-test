import mongoose from "mongoose";

const ConnectMongoose = async () => {
  try {
    const res = await mongoose.connect(process.env.MongooseURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // console.log("Mongoose Connect Successfully");
  } catch (error) {
    // console.error("Test MongoDB connection failed:", error);
  }
};

export default ConnectMongoose;
