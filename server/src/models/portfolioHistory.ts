import { Schema, model, Document } from "mongoose";

// Cada documento representa o valor total da carteira de um usuário em uma data específica.
export interface IPortfolioHistory extends Document {
  userId: string;       // referência ao usuário (_id)
  date: Date;           // data (hora zerada)
  totalValue: number;   // valor total do portfólio naquele dia
}

const PortfolioHistorySchema = new Schema<IPortfolioHistory>(
  {
    userId: { type: String, required: true, index: true },
    date:   { type: Date, required: true, index: true },
    totalValue: { type: Number, required: true },
  },
  { timestamps: true }
);

// Garante que só exista um registro por usuário por dia
PortfolioHistorySchema.index({ userId: 1, date: 1 }, { unique: true });

export default model<IPortfolioHistory>(
  "PortfolioHistory",
  PortfolioHistorySchema
);
