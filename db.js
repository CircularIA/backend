import { connect } from 'mongoose';

export const connectDB = async () => {
    try{
        const connectionParams = {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        };
        await connect(process.env.DB, connectionParams);
        console.log('Connected to database.');
    } catch (error) {
        console.log(error);
        console.log('Could not connect to database.')
    }
}
