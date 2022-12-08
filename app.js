const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();

const dbPath = path.join(__dirname, "userData.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();
app.use(express.json());
const bcrypt = require("bcrypt");
//

app.post("/register/", async (request, response) => {
  const { username, name, password, gender, location } = request.body;
  const hashedPassword = await bcrypt.hash(request.body.password, 10);
  const selectUserQuery = `SELECT * FROM user WHERE username = '${username}'`;
  const dbUser = await db.get(selectUserQuery);

  if (dbUser === undefined) {
    if (password.length < 5) {
      response.status(400);
      response.send("Password is too short");
    } else {
      const createUserQuery = `
      INSERT INTO 
        user (username, name, password, gender, location) 
      VALUES 
        (
          '${username}', 
          '${name}',
          '${hashedPassword}', 
          '${gender}',
          '${location}'
        )`;
      const dbResponse = await db.run(createUserQuery);
      response.status = 200;
      response.send("User created successfully");
    }
  } else {
    response.status = 400;
    response.send("User already exists");
  }
});

//
/*
app.post("/register/", async (req, res) => {
  const { username, name, password, gender, location } = req.body;
  const hashedPassword = await bcrypt.hash(req.body.password, 10);
  const selectUserQuery = `SELECT * FROM user WHERE username='${username}';`;
  const dbUser = await db.get(selectUserQuery);
  if (dbUser === undefined) {
    if (password.length >= 5) {
      const createUserQuery = `INSERT INTO user (username, name, password, gender, location)
        VALUES('${username}','${name}','${hashedPassword}','${gender}','${location}') ;`;
      const dbResponse = await db.run(createUserQuery);
      res.status = 200;
      res.send("User created successfully");
    } else {
      res.status(400);
      res.send("Password is too short");
    }
  } else {
    res.status(400);
    res.send("User already exists");
  }
});
*/

app.post("/login/", async (req, res) => {
  const { username, password } = req.body;
  const Query = `SELECT * FROM user WHERE username ='${username}';`;
  const loginQueryid = await db.get(Query);
  if (loginQueryid === undefined) {
    res.status(400);
    res.send("Invalid user");
  } else {
    const isPasswordMatched = await bcrypt.compare(
      password,
      loginQueryid.password
    );
    if (isPasswordMatched == true) {
      res.status(200);
      res.send("Login success!");
    } else {
      res.status(400);
      res.send("Invalid password");
    }
  }
});

app.put("/change-password/", async (req, res) => {
  const { username, oldPassword, newPassword } = req.body;
  const Query = `SELECT * FROM user WHERE username ='${username}';`;
  const loginQueryid = await db.get(Query);
  const isPasswordMatched = await bcrypt.compare(
    oldPassword,
    loginQueryid.password
  );
  if (isPasswordMatched == true) {
    if (newPassword.length >= 5) {
      const hashedPassword = await bcrypt.hash(req.body.newPassword, 10);
      const Query = `INSERT INTO user (username, name, password, gender, location) 
      VALUES 
        (
          '${loginQueryid.username}', 
          '${loginQueryid.name}',
          '${hashedPassword}', 
          '${loginQueryid.gender}',
          '${loginQueryid.location}'
        ) WHERE username = '${username}';`;
      res.status(200);
      res.send("Password updated");
    } else {
      res.status(400);
      res.send("Password is too short");
    }
  } else {
    res.status(400);
    res.send("Invalid current password");
  }
});

module.exports = app;
