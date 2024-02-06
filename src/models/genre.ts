import mongoose, { mongo } from "mongoose";

const Schema = mongoose.Schema;

const GenreSchema = new Schema(
  {
    name: { type: String, required: true },
  },
  {
    virtuals: {
      url: {
        get: function () {
          return `/catalog/genre/${this._id}`;
        },
      },
    },
  }
);

export default mongoose.model("Genre", GenreSchema);
