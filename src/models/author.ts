import mongoose from "mongoose";
import { DateTime } from "luxon";

const Schema = mongoose.Schema;

const AuthorSchema = new Schema(
  {
    first_name: { type: String, required: true, maxLength: 100 },
    family_name: { type: String, required: true, maxLength: 100 },
    date_of_birth: { type: Date },
    date_of_death: { type: Date },
  },
  {
    virtuals: {
      name: {
        get: function () {
          let fullname = "";
          if (this.first_name && this.family_name) {
            fullname = `${this.family_name}, ${this.first_name}`;
          }
          return fullname;
        },
      },
      url: {
        get: function () {
          return `/catalog/author/${this._id}`;
        },
      },
      date_of_birth_formatted: {
        get: function () {
          return this.date_of_birth
            ? DateTime.fromJSDate(this.date_of_birth).toLocaleString(
                DateTime.DATE_MED
              )
            : "";
        },
      },
      date_of_death_formatted: {
        get: function () {
          return this.date_of_death
            ? DateTime.fromJSDate(this.date_of_death).toLocaleString(
                DateTime.DATE_MED
              )
            : "";
        },
      },
      lifespan: {
        get: function () {
          return (
            (this.date_of_birth
              ? DateTime.fromJSDate(this.date_of_birth).toLocaleString(
                  DateTime.DATE_MED
                )
              : "") +
            " - " +
            (this.date_of_death
              ? DateTime.fromJSDate(this.date_of_death).toLocaleString(
                  DateTime.DATE_MED
                )
              : "")
          );
        },
      },
    },
  }
);

export default mongoose.model("Author", AuthorSchema);
