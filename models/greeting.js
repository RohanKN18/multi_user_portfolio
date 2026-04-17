import mongoose from "mongoose";
const Schema = mongoose.Schema;

const greetingSchema = new Schema({
  hi: String,
  name: {
    type: String,
    required: true
  },
  title: String,
  description: String,
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User"
  }
});

export default mongoose.model("Greeting", greetingSchema);