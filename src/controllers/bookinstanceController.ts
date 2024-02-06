import BookInstance from "../models/bookinstance.js";
import Book from "../models/book.js";
import asyncHandler from "express-async-handler";
import { Request, Response, Next } from "express";
import { body, validationResult } from "express-validator";
import HTTPError from "../errors/error.js";

// Display list of all BookInstances.
export const bookinstance_list = asyncHandler(
  async (req: Request, res: Response) => {
    const allBookInstances = await BookInstance.find().populate("book").exec();

    res.render("bookinstance_list", {
      title: "Book Instance List",
      bookinstance_list: allBookInstances,
    });
  }
);

// Display detail page for a specific BookInstance.
export const bookinstance_detail = asyncHandler(
  async (req: Request, res: Response, next: Next) => {
    const bookInstance = await BookInstance.findById(req.params.id)
      .populate("book")
      .exec();

    if (bookInstance === null) {
      // No results.
      const err = new HTTPError("Book copy not found");
      err.status = 404;
      return next(err);
    }

    res.render("bookinstance_detail", {
      title: "Book:",
      bookinstance: bookInstance,
    });
  }
);

// Display BookInstance create form on GET.
export const bookinstance_create_get = asyncHandler(
  async (req: Request, res: Response) => {
    const allBooks = await Book.find({}, "title").sort({ title: 1 }).exec();

    res.render("bookinstance_form", {
      title: "Create Book Instance",
      book_list: allBooks,
    });
  }
);

// Handle BookInstance create on POST.
export const bookinstance_create_post = [
  // Validate and sanitize fields.
  body("book", "Book must be specified").trim().isLength({ min: 1 }).escape(),
  body("imprint", "Imprint must be specified")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("status").escape(),
  body("due_back", "Invalid date")
    .optional({ values: "falsy" })
    .isISO8601()
    .toDate(),

  // Process request after validation and sanitization.
  asyncHandler(async (req: Request, res: Response, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a BookInstance object with escaped and trimmed data.
    const bookInstance = new BookInstance({
      book: req.body.book,
      imprint: req.body.imprint,
      status: req.body.status,
      due_back: req.body.due_back,
    });

    if (!errors.isEmpty()) {
      // There are errors.
      // Render form again with sanitized values and error messages.
      const allBooks = await Book.find({}, "title").sort({ title: 1 }).exec();

      res.render("bookinstance_form", {
        title: "Create BookInstance",
        book_list: allBooks,
        selected_book: bookInstance.book._id,
        errors: errors.array(),
        bookinstance: bookInstance,
      });
      return;
    } else {
      // Data from form is valid
      await bookInstance.save();
      res.redirect(bookInstance.url);
    }
  }),
];

// Display BookInstance delete form on GET.
export const bookinstance_delete_get = asyncHandler(
  async (req: Request, res: Response) => {
    const bookinstance = await BookInstance.findById(req.params.id)
      .populate("book")
      .exec();
    if (bookinstance === null) {
      res.redirect("/catalog/bookinstances");
    }
    res.render("bookinstance_delete", {
      title: "Delete Book Instance",
      bookinstance: bookinstance,
    });
  }
);

// Handle BookInstance delete on POST.
export const bookinstance_delete_post = asyncHandler(
  async (req: Request, res: Response) => {
    await BookInstance.findByIdAndDelete(req.body.bookinstanceid);
    res.redirect("/catalog/bookinstances");
  }
);

// Display BookInstance update form on GET.
export const bookinstance_update_get = asyncHandler(
  async (req: Request, res: Response, next: Next) => {
    const [allBooks, bookinstance] = await Promise.all([
      await Book.find({}, "title").sort({ title: 1 }).exec(),
      await BookInstance.findById(req.params.id).exec(),
    ]);

    if (bookinstance === null) {
      const err = new HTTPError("Book Instance not found");
      err.status = 404;
      return next(err);
    }

    res.render("bookinstance_form", {
      title: "Update Book Instance",
      book_list: allBooks,
      selected_book: bookinstance.book._id,
      bookinstance,
    });
  }
);

// Handle bookinstance update on POST.
export const bookinstance_update_post = [
  body("book", "Book must be specified").trim().isLength({ min: 1 }).escape(),
  body("imprint", "Imprint must be specified")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("status").escape(),
  body("due_back", "Invalid date")
    .optional({ values: "falsy" })
    .isISO8601()
    .toDate(),

  asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);

    const bookinstance = new BookInstance({
      book: req.body.book,
      imprint: req.body.imprint,
      status: req.body.status,
      due_back: req.body.date,
      _id: req.params.id,
    });
    const allBooks = await Book.find({}, "title").sort({ title: 1 }).exec();

    if (!errors.isEmpty()) {
      res.render("bookinstance_form", {
        title: "Update Book Instance",
        bookinstance,
        book_list: allBooks,
        selected_book: bookinstance.book._id,
      });
      return;
    } else {
      const updatedBookInstance = await BookInstance.findByIdAndUpdate(
        req.params.id,
        bookinstance
      );
      res.redirect(updatedBookInstance.url);
    }
  }),
];
