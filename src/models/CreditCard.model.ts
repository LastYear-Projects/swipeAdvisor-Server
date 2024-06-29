import mongoose from "mongoose";

export interface ICreditCard {
    cardName: String;
    pointValue: Number;
}

const CreditCardSchema = new mongoose.Schema<ICreditCard>({
    cardName: {
        type: String,
        required:true
    },
    pointValue: {
        type: Number
    }
})

const CreditCard = mongoose.model<ICreditCard>("creditCard", CreditCardSchema, "creditCards")
export default CreditCard;
