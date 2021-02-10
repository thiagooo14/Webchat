/* eslint-disable function-paren-newline */
const connection = require('./connection');

const changeValues = async (nickname, message) => {
  const d = new Date();

  const hoursWithoutZeroes = (dt) => dt.getHours() % 12 || 12;

  const day = d.getDate() < 10 ? `0${d.getDate()}` : d.getDate();
  const month = d.getMonth();
  const year = d.getFullYear();

  const hour = hoursWithoutZeroes(d);
  const minutes = d.getMinutes();
  const sigla = d.getHours() > 12 ? 'PM' : 'AM';

  const date = `${day}-${month}-${year} ${hour}:${minutes} ${sigla}`;

  const data = await connection().then((db) =>
    db.collection('messages').insertOne({ nickname, message, date }));

  return data.ops[0];
};

const getAll = async () => {
  const data = await connection().then((db) => db.collection('messages').find({}).toArray());
  return data;
};

module.exports = {
  changeValues,
  getAll,
};
