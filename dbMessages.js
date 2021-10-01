import mongoose from "mongoose";

const whatsappSchema = mongoose.Schema({
  message: String,
  name: String,
  timeStamp: String,
  received: Boolean,
});
// Collection
export default mongoose.model("messagecontent", whatsappSchema);
