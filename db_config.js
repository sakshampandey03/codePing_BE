import mongoose from 'mongoose'
import dotenv from "dotenv";
dotenv.config()

export const dbconnect = () =>{
    mongoose.connect(
        process.env.MONGO_DB_URL)
		.then(console.log(`DB Connection Success`))
		.catch((err) => {
			console.log(`DB Connection Failed`);
			console.log(err);
			process.exit(1);
		});
}
dbconnect()