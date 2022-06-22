const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const bodyParser = require("body-parser");
const app = express();
const usersPouter = require("./routes/users");
const cardPouter = require("./routes/card");

// Слушаем 3000 порт
const { PORT = 3000 } = process.env;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//подключаемся к серверу mongo
mongoose.connect("mongodb://localhost:27017/mestodb");

//мидлвэр временное решение
app.use((req, res, next) => {
  req.user = {
    _id: "62b3244c2d82aadc5b28c5d9", // _id созданного в предыдущем пункте пользователя
  };

  next();
});

app.use("/users", usersPouter);

app.use("/cards", cardPouter);

app.listen(PORT, () => {
  // Если всё работает, консоль покажет, какой порт приложение слушает
  console.log(`App listening on port ${PORT}`);
});
