import mongoose from "mongoose";
const Schema = mongoose.Schema;

const footerSchema = new Schema({
  contact: {
    email: String,
    phone: String
  },
  socialLinks: [{
    name: { type: String, default: "" },
    url: { type: String, default: "" }
  }],
  copyright: {
    year: String,        // Better to keep as String for flexibility
    name: String
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User"
  }
}, { timestamps: true });

export default mongoose.model("Footer", footerSchema);