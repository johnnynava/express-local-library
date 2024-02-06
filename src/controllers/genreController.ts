import Genre from "../models/genre.js";
import Book from "../models/book.js";
import asyncHandler from "express-async-handler";
import { Request, Response, Next } from "express";
import { body, validationResult } from "express-validator";
import HTTPError from "../errors/error.js";

// Display list of all Genre.
export const genre_list = asyncHandler(async (req: Request, res: Response) => {
  const allGenres = await Genre.find().sort({ genre: 1 }).exec();
  res.render("genre_list", {
    title: "Genre List",
    genre_list: allGenres,
  });
});

// Display detail page for a specific Genre.
export const genre_detail = asyncHandler(
  async (req: Request, res: Response, next: Next) => {
    // Get details of genre and all associated books (in parallel)
    const [genre, booksInGenre] = await Promise.all([
      Genre.findById(req.params.id).exec(),
      Book.find({ genre: req.params.id }, "title summary").exec(),
    ]);
    if (genre === null) {
      // No results.
      const err = new HTTPError("Genre not found");
      err.status = 404;
      return next(err);
    }

    res.render("genre_detail", {
      title: "Genre Detail",
      genre: genre,
      genre_books: booksInGenre,
    });
  }
);

// Display Genre create form on GET.
export const genre_create_get = (req: Request, res: Response) => {
  res.render("genre_form", { title: "Create Genre" });
};

// Handle Genre create on POST.
export const genre_create_post = [
  // Validate and sanitize the name field.
  body("name", "Genre name must contain at least 3 characters")
    .trim()
    .isLength({ min: 3 })
    .escape(),

  // Process request after validation and sanitization.
  asyncHandler(async (req: Request, res: Response, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a genre object with escaped and trimmed data.
    const genre: any = new Genre({ name: req.body.name });

    if (!errors.isEmpty()) {
      // There are errors. Render the form again with sanitized values/error messages.
      res.render("genre_form", {
        title: "Create Genre",
        genre: genre,
        errors: errors.array(),
      });
      return;
    } else {
      // Data from form is valid.
      // Check if Genre with same name already exists.
      const genreExists: any = await Genre.findOne({
        name: req.body.name,
      }).exec();
      if (genreExists) {
        // Genre exists, redirect to its detail page.
        res.redirect(genreExists.url);
      } else {
        await genre.save();
        // New genre saved. Redirect to genre detail page.
        res.redirect(genre.url);
      }
    }
  }),
];

// Display Genre delete form on GET.
export const genre_delete_get = asyncHandler(
  async (req: Request, res: Response) => {
    const [genre, allBooksByGenre] = await Promise.all([
      Genre.findById(req.params.id).exec(),
      Book.find({ genre: req.params.id }, "title summary").exec(),
    ]);
    if (genre === null) {
      res.redirect("/catalog/genres");
    }
    res.render("genre_delete", {
      title: "Delete Genre",
      genre: genre,
      allBooksByGenre: allBooksByGenre,
    });
  }
);
// Handle Genre delete on POST.
export const genre_delete_post = asyncHandler(
  async (req: Request, res: Response) => {
    const [genre, allBooksByGenre] = await Promise.all([
      Genre.findById(req.params.id).exec(),
      Book.find({ genre: req.params.id }, "title summary").exec(),
    ]);
    if (genre === null) {
      res.redirect("/catalog/genres");
    }
    if (allBooksByGenre.length > 0) {
      res.render("genre_delete", {
        title: "Delete Genre",
        genre: genre,
        allBooksByGenre: allBooksByGenre,
      });
      return;
    } else {
      await Genre.findByIdAndDelete(req.body.genreid);
      res.redirect("/catalog/genres");
    }
  }
);

// Display Genre update form on GET.
export const genre_update_get = asyncHandler(
  async (req: Request, res: Response, next: Next) => {
    const genre = await Genre.findById(req.params.id).exec();

    if (genre === null) {
      const err = new HTTPError("Genre not found");
      err.status;
      return next(err);
    }
    console.log(genre);
    res.render("genre_form", {
      title: "Update genre",
      genre,
    });
  }
);

// Handle Genre update on POST.
export const genre_update_post = [
  body("name", "Title must contain three or more words")
    .trim()
    .isLength({ min: 3 })
    .escape(),
  asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    const genre = new Genre({
      name: req.body.name,
      _id: req.params.id,
    });
    if (!errors.isEmpty()) {
      res.render("genre_form", {
        title: "Update Genre",
        genre,
      });
      return;
    } else {
      const updatedGenre = await Genre.findByIdAndUpdate(req.params.id, genre);
      res.redirect(updatedGenre.url);
    }
  }),
];
