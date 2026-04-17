import mongoose from "mongoose";
const Schema = mongoose.Schema;

const coreSkillSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  }
}, { _id: true }); // ensures each coreSkill has its own _id

const topicSchema = new Schema({
  topicName: {
    type: String,
    required: true,
    trim: true
  },
  coreSkills: [coreSkillSchema] // 🔥 now objects instead of strings
}, { _id: true });

const skillSchema = new Schema({
  skillName: {
    type: String,
    required: true
  },
  slug: String,
  topics: [topicSchema],
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User"
  }
});

export default mongoose.model("Skill", skillSchema);