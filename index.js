const express = require("express");
const cookieParser = require("cookie-parser");
const db = require("mysql2");
const app = express();
const port = 8000;

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static("public"));
// set up database connection, run the dbsetup.js file to create the database and tables
const dbSetup = require("./dbsetup");
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
      console.log("Connected to MySQL database");
    });
    // Serve the sign-in page
    app.get("/", (req, res) => {
      res.send(`
      <h1>Sign in</h1>
      <form method="POST" action="/signin">
        <label for="username">Username:</label>
        <input type="text" id="username" name="username" required>
        <br>
        <label for="password">Password:</label>
        <input type="password" id="password" name="password" required>
        <br>
        <button type="submit">Sign in</button>
      </form>
      <p>Don't have an account? <a href="/signup">Sign up</a></p>
    `);
    });
    // Handle sign-in form submission
    app.post("/signin", (req, res) => {
      const { username, password } = req.body;
      // Check if username and password are valid
      if (isValidCredentials(username, password)) {
        // Create a session for the user and set a cookie with the session ID
        const sessionId = createSession(username);
        res.cookie("sessionId", sessionId);
        res.redirect("/inbox");
      } else {
        res.send(`
      <h1>Sign in</h1>
      <p>Invalid username or password</p>
      <form method="POST" action="/signin">
        <label for="username">Username:</label>
        <input type="text" id="username" name="username" required>
        <br>
        <label for="password">Password:</label>
        <input type="password" id="password" name="password" required>
        <br>
        <button type="submit">Sign in</button>
      </form>
      <p>Don't have an account? <a href="/signup">Sign up</a></p>
    `);
      }
    });
    const response = `
    <h1>Sign up</h1>
    <form method="POST" action="/signup">
      <label for="username">Username:</label>
      <input type="text" id="username" name="username" required>
      <br>
      <label for="password">Password:</label>
      <input type="password" id="password" name="password" required>
      <br>
      <label for="re-enter-password">Re-enter password:</label>
      <input type="password" id="re-enter-password" name="re-enter-password" required>
      <br>
      <label for="email">Email:</label>
      <input type="email" id="email" name="email" required>
      <br>
      <button type="submit">Sign up</button>
  `;
    // server get sign up page
    app.get("/signup", (req, res) => {
      res.send(response);
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
      if (password !== reEnterPassword) {
        notification =
          "Password and re-enter password must be the same";
      } else if (isValidCredentials(username, password, email)) {
        notification = "Username or email already exists";
      } else {
        // Create a session for the user and set a cookie with the session ID
        const sessionId = createSession(username);
        res.cookie("sessionId", sessionId);
        res.redirect("/inbox");
      }
      res.send(
        response + `
        <p id="notification">${notification}</p>
      ` 
      );
    });
    // Serve the inbox page
    app.get("/inbox", (req, res) => {
      if (req.cookies.sessionId) {
        res.send("<h1>Welcome to your inbox</h1>");
      } else {
        res.redirect("/");
      }
    });

    // Helper functions
    function isValidCredentials(username, password, email) {
      // Check if username and password are valid
      // Return true or false
    }

    function createSession(username) {
      // Create a session for the user and return the session ID
    }

    app.listen(port, () => {
      console.log(`App listening at http://localhost:${port}`);
    });
  } catch (err) {
    console.error(err);
  }
})();
