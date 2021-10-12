const List = require("../models/lists")
const Card = require("../models/card")
const Board = require("../models/board")
const HttpError = require("../models/httpError");
const { validationResult } = require("express-validator");

const getCard = (req, res, next) => {
  const id = req.params.id

  Card.findOne({ _id: id })
    // populate comments here
  .then((card) => res.json(card))
  .catch((err) => next(new HttpError("There is no such card.", 404)))
}

const createCard = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    const listId = req.body.listId

    let boardId;
    List.findById(listId, "boardId").then(list => boardId = list.boardId )


    const objToSend = {
      "title": req.body.card.title,
      "description": "",
      "labels": [],
      "listId": listId,
      "position": 65535.0,
      "archived": false,
      "dueDate": null,
      "completed": false,
      "boardId": boardId,
      "comments": [],
      "actions": [], 
      "commentsCount": 0 
    }

    Card.create(objToSend)
      .then((card) => {
        Card.findById(card._id, "title _id listId boardId createdAt updatedAt").then(
          (card) => {
            req.card = card
            next()
          }
        );
      })
      .catch((err) => 
        next(new HttpError("Creating card failed, please try again", 500))
      );
  } else {
    return next(new HttpError("The input field is empty.", 404));
  }
};

const addCardToList = (req, res, next) => {
  const card = req.card
  const listId = card.listId

  List.findByIdAndUpdate(listId, {
    $addToSet: { cards: card._id },
  }).then(() => next() )
};

const sendCard = (req, res, next) => {
  res.json(req.card)
}

exports.createCard = createCard;
exports.addCardToList = addCardToList;
exports.sendCard = sendCard
exports.getCard = getCard