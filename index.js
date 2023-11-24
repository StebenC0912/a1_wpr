const express = require("express");
const cookieParser = require("cookie-parser");
const db = require("mysql2");
const ejs = require("ejs");
const app = express();
const port = 8000;

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static("public"));

// set up database connection, run the dbsetup.js file to create the database and tables
const dbSetup = require("./dbsetup");
let query; 
(async () => {
  try {
    await dbSetup();
    // connect to the database

    const connection = db.createConnection({
      host: "localhost",
      port: 3306,
      user: "root",
      password: "stebenc09122002",
      database: "wpr2023",
    });
    connection.connect((err) => {
      console.log("Connected to MySQL database index");
    });
    // Serve the sign-in page
    app.get("/", (req, res) => {
      if (req.cookies.sessionId) {
        res.redirect("/inbox");
      } else {
        res.render("login", { error: req.query.error });
      }
    });
    // Handle sign-in form submission
    app.post("/", (req, res) => {
      const { username, password } = req.body;
      // Check if username and password are valid use mysql query
      query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
      connection.query(query, (err, result) => {
        if (err) throw err;
        const isValid = result.length > 0;
        if (isValid) {
          // Create a session for the user and set a cookie with the session ID
          const sessionId = createSession(username);
          res.cookie("sessionId", sessionId);
          res.redirect("/inbox");
        } else {
          const error = "Invalid information";
          res.render("login", { error });
        }
      });
    });
    // server get sign up page
    app.get("/signup", (req, res) => {
      res.render("signup", { error: req.query.error });
    });
    // Handle sign-up form submission
    app.post("/signup", (req, res) => {
      let notification;
      const {
        username,
        password,
        "re-enter-password": reEnterPassword,
        email,
      } = req.body;
      // Check if username, password, and email are valid
      if (password < 6) {
        notification = " The password is too short (less than 6 characters)"
      } else if (password !== reEnterPassword) {
        notification =
          "Password and Re-enter password must be the same";
      } else if (isValidCredentials(username, password, email)) {
        notification = "Username or email already exists";
      } else {
        // Create a session for the user and set a cookie with the session ID
        const sessionId = createSession(username);
        res.cookie("sessionId", sessionId);
        res.redirect("/inbox");
      }
      res.render("signup", { error: notification });
    });
    // Serve the inbox page
    app.get("/inbox", (req, res) => {
      if (req.cookies.sessionId) {
        res.send("<h1>Welcome to your inbox</h1>");
      } else {
        res.redirect("/");
      }
    });

    

    function createSession(username) {
      // Create a session for the user and return the session ID
      // use the cookie-session library to generate a session ID
      // no need to store the session ID in the database
      // just return it
      return Math.floor(Math.random() * 1000000);
    }

    app.listen(port, () => {
      console.log(`App listening at http://localhost:${port}`);
    });
  } catch (err) {
    console.error(err);
  }
})();
