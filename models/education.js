import mongoose from "mongoose";
const Schema = mongoose.Schema;

const educationSchema = new Schema({
  level: {
    type: String,
  },
  school: String,
  score: String,
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User"
  }
});

export default mongoose.model("Education", educationSchema);