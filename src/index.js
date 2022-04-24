const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");
const { send } = require("express/lib/response");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find((user) => user.username === username);

  if (!user) {
    return response.status(404).json({ error: "User not found" });
  }

  request.user = user;
  return next();
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;

  const userAlreadyExist = users.some((user) => user.username === username);

  if (userAlreadyExist) {
    return response.status(400).json({ error: "User already exist" });
  }
  const newUser = {
    id: uuidv4(),
    name,
    username,
    todos: new Array(),
  };

  users.push(newUser);

  return response.json(newUser).status(201);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.json(user.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;

  const { user } = request;

  const newTask = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  user.todos.push(newTask);

  return response.status(201).json(newTask);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { title, deadline } = request.body;
  const { user } = request;

  const updatedTask = user.todos.find((task) => task.id === id);

  if (!updatedTask) {
    return response.status(404).json({ error: "Task not found" });
  }

  updatedTask.title = title;
  updatedTask.deadline = new Date(deadline);

  return response.json(updatedTask);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;

  const updatedTask = user.todos.find((task) => task.id === id);

  if (!updatedTask) {
    return response.status(404).json({ error: "Task not found" });
  }

  updatedTask.done = true;

  return response.status(201).json(updatedTask);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;

  const findTask = user.todos.find((task) => task.id === id);

  if (!findTask) {
    return response.status(404).json({ error: "Task not found" });
  }
  console.log(findTask);

  user.todos.splice(findTask, 1);

  return response.status(204).send();
});

module.exports = app;
