const db = require("../config/db");

exports.createPoll = (question, options, userId, callback) => {
  const optionsJSON = JSON.stringify(options);
  const votesJSON = JSON.stringify(Array(options.length).fill(0));

  db.run(
    "INSERT INTO polls (question, options, votes, user_id) VALUES (?, ?, ?, ?)",
    [question, optionsJSON, votesJSON, userId],
    function (err) {
      if (err) {
        return callback(err);
      }
      callback(null, this.lastID);
    }
  );
};

exports.getPollById = (pollId, userId, callback) => {
  db.get(
    "SELECT * FROM polls WHERE id = ? AND user_id = ?",
    [pollId, userId],
    (err, row) => {
      if (err) {
        return callback(err);
      }
      callback(null, row);
    }
  );
};

exports.voteOnPoll = (pollId, optionIndex, userId, callback) => {
  this.getPollById(pollId, userId, (err, poll) => {
    if (err) {
      return callback(err);
    }
    if (!poll) {
      return callback(new Error("Encuesta no encontrada o no pertenece al usuario."));
    }

    const votes = JSON.parse(poll.votes);
    votes[optionIndex] += 1;

    const votesJSON = JSON.stringify(votes);

    db.run(
      "UPDATE polls SET votes = ? WHERE id = ? AND user_id = ?",
      [votesJSON, pollId, userId],
      function (err) {
        if (err) {
          return callback(err);
        }
        callback(null, votes);
      }
    );
  });
};

exports.deletePollById = (pollId, userId, callback) => {
  db.run(
    "DELETE FROM polls WHERE id = ? AND user_id = ?",
    [pollId, userId],
    function (err) {
      if (err) {
        return callback(err);
      }
      callback(null, this.changes);
    }
  );
};

exports.updatePollById = (pollId, question, options, userId, callback) => {
  const optionsJSON = JSON.stringify(options);

  db.run(
    "UPDATE polls SET question = ?, options = ? WHERE id = ? AND user_id = ?",
    [question, optionsJSON, pollId, userId],
    function (err) {
      if (err) {
        return callback(err);
      }
      callback(null, this.changes);
    }
  );
};
