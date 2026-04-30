import mongoose from 'mongoose';

const paperSchema = new mongoose.Schema(
  {
    subject_code: String,
    subject_name: String,
    branch: String,
    semester: Number,
    year: Number,
    session: String,
    session_code: String,
    examid: String,
    pdf_url: String,
    created_at: String
  },
  {
    collection: 'papers',   //  FORCE CORRECT COLLECTION
    timestamps: false
  }
);

export default mongoose.model('Paper', paperSchema);
