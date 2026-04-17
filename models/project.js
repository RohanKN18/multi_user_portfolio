import mongoose from "mongoose";
const Schema = mongoose.Schema;

const projectSchema = new Schema({
  projectName: {
    type: String,
    required: true
  },
  projectSlug: String,
  githubLink: String,
  liveLink: String,
  image: String,
  description: String,

  techStack: {
    languages: [String],
    frameworks: [String],
    databases: [String],
    tools: [String]
  },

  features: [String],
  role: String,
  startDate: String,
  endDate: String,
  status: String,
  highlights: [String],
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User"
  }
});

export default mongoose.model("Project", projectSchema);