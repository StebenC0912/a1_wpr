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
// Define the isValidCredentials function
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
      const { email, password } = req.body;
      console.log(email, password);
      // Check if username and password are valid use mysql query
      query = `SELECT * FROM users WHERE email = '${email}' AND password = '${password}'`;
      connection.query(query, (err, result) => {
        if (err) throw err;
        const isValid = result.length > 0;
        console.log(result);
        if (isValid) {
          // Create a session for the user and set a cookie with the session ID
          res.cookie("sessionId", result[0].id);
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
    app.post("/signup", async (req, res) => {
      let notification = "";
      const {
        fullName,
        email,
        password,
        "re-enter-password": reEnterPassword,
      } = req.body;

      if (password.length < 6) {
        notification = " The password is too short (less than 6 characters)";
        res.render("signup", { error: notification });
      } else if (password !== reEnterPassword) {
        notification = "Password and Re-enter password must be the same";
        res.render("signup", { error: notification });
      } else {
        query = `SELECT * FROM users WHERE email = ?`;
        connection.query(query, [email], (err, result) => {
          if (err) throw err;
          if (result.length > 0) {
            notification = "Email already exists";
            res.render("signup", { error: notification });
          } else {
            query = `INSERT INTO users (fullName, email, password) VALUES (?, ?, ?)`;
            connection.query(query, [fullName, email, password]);
            console.log("Create new user successfully");
            res.redirect("/");
          }
        });
      }
    });
    function getPaginatedEmails(userId, page, pageSize) {
      // Your logic to retrieve paginated emails based on userId, page, and pageSize
      // This is just a placeholder, replace it with your actual implementation
      const emails = [
        { id: 1, sender: "John Doe", subject: "Meeting Tomorrow" },
        // Add more email objects as needed
      ];

      const startIdx = (page - 1) * pageSize;
      const endIdx = startIdx + pageSize;
      const paginatedEmails = emails.slice(startIdx, endIdx);

      const totalPages = Math.ceil(emails.length / pageSize);

      return { emails: paginatedEmails, totalPages };
    }

    // Serve the inbox page
    app.get("/inbox", (req, res) => {
      if (req.cookies.sessionId) {
        // get the user's messages from the database
        // and pass them to the inbox page
        // page
        query = "SELECT fullName FROM users WHERE id = ?";
        let userInfoCurrent;
        connection.query(query, [req.cookies.sessionId], (err, result) => {
          if (err) throw err;
          userInfoCurrent = result[0];
          console.log(userInfoCurrent);
        });
        query = `SELECT users.fullName AS senderName, emails.subject, emails.date AS dateSent
        FROM emails
        JOIN users ON emails.sender_id = users.id;
        `;
        connection.query(query, (err, result) => {
          if (err) throw err;
          res.render("inbox", {
            user: userInfoCurrent,
            emails: result,
          });
        });
      } else {
        res.redirect("/");
      }
    });

    app.listen(port, () => {
      console.log(`App listening at http://localhost:${port}`);
    });
  } catch (err) {
    console.error(err);
  }
})();
