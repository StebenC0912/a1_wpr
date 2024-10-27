const express = require("express");
const cookieParser = require("cookie-parser");
const multer = require("multer");
const db = require("mysql2");
const ejs = require("ejs");
const app = express();
const port = 8000;

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static("public"));
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });
let query;
// Define the isValidCredentials function
(async () => {
  try {
    // connect to the database
    const connection = db.createConnection({
      host: "localhost",
      port: 3306,
      user: "root",
      password: "Stebenc0912@))@",
      database: "wpr2001040122",
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
      // Check if username and password are valid use mysql query
      query = `SELECT * FROM users WHERE email = '${email}' AND password = '${password}'`;
      connection.query(query, (err, result) => {
        if (err) throw err;
        const isValid = result.length > 0;
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

    function getPaginatedEmails(page, userId, number) {
      return new Promise((resolve, reject) => {
        if (number === 1) {
          query = `SELECT DISTINCT users.fullName AS senderName, emails.id, emails.subject, emails.date AS dateSent
            FROM emails
            JOIN users ON emails.sender_id = users.id
            WHERE emails.recipient_id = ${userId}   AND emails.isVisibleForRecipient = TRUE
            ORDER BY emails.date DESC`;
        } else {
          query = `SELECT DISTINCT users.fullName AS senderName, emails.id, emails.subject, emails.date AS dateSent
            FROM emails
            JOIN users ON emails.recipient_id = users.id
            WHERE emails.sender_id = ${userId} AND emails.isVisibleForSender = TRUE
            ORDER BY emails.date DESC`;
        }
        connection.query(query, (err, result) => {
          if (err) reject(err);
          const emails = result;

          const startIdx = (page - 1) * 5;
          const endIdx = startIdx + 5;
          const paginatedEmails = emails.slice(startIdx, endIdx);
          const totalPages = Math.ceil(emails.length / 5);
          resolve({ emails: paginatedEmails, totalPages });
        });
      });
    }

    // Serve the inbox page
    app.get("/inbox", (req, res) => {
      if (req.cookies.sessionId) {
        // get the user's messages from the database
        // and pass them to the inbox page
        // page
        query = "SELECT * FROM users WHERE id = ?";
        connection.query(
          query,
          [req.cookies.sessionId],
          async (err, result) => {
            if (err) throw err;
            let fullName = result[0].fullName;
            res.cookie("fullName", fullName);
            let userId = req.cookies.sessionId;
            const page = parseInt(req.query.page) || 1;
            const { emails, totalPages } = await getPaginatedEmails(
              page,
              userId,
              1
            );
            // Get current date for comparison
            const today = new Date();
            const currentYear = today.getFullYear();

            // Format the date before rendering the template
            emails.forEach((email) => {
              const emailDate = new Date(email.dateSent);
              const emailYear = emailDate.getFullYear();
              const isToday = today.toDateString() === emailDate.toDateString(); // Check if the email was sent today

              if (isToday) {
                // If today, only show hour and minute
                email.dateSent = emailDate.toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                });
              } else if (emailYear === currentYear) {
                // If in the same year, show "MMM DD" format
                email.dateSent = emailDate.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
              } else {
                // If from a previous year, show "MMM DD YYYY"
                email.dateSent = emailDate.toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                });
              }
            });
            res.render("inbox", {
              directory: "Inbox",
              fullName: fullName,
              emails: emails,
              currentPage: page,
              totalPages,
              isOutbox: false,
            });
          }
        );
      } else {
        return res.status(403).send(`
          <html>
            <head>
              <title>Access Denied</title>
              <meta http-equiv="refresh" content="5;url=/" />
            </head>
            <body>
              <h1>403 - Access Denied</h1>
              <p>You will be redirected to the login page in 5 seconds...</p>
              <script>
                setTimeout(() => {
                  window.location.href = "/";
                }, 5000);
              </script>
            </body>
          </html>
        `)
      }
    });
    // server outbox
    app.get("/outbox", (req, res) => {
      if (req.cookies.sessionId) {
        // get the user's messages from the database
        // and pass them to the inbox page
        // page
        query = "SELECT * FROM users WHERE id = ?";
        connection.query(
          query,
          [req.cookies.sessionId],
          async (err, result) => {
            if (err) throw err;
            let fullName = result[0].fullName;
            res.cookie("fullName", fullName);
            let userId = req.cookies.sessionId;
            const page = parseInt(req.query.page) || 1;
            const { emails, totalPages } = await getPaginatedEmails(
              page,
              userId,
              2
            );
            // Get current date for comparison
            const today = new Date();
            const currentYear = today.getFullYear();

            // Format the date before rendering the template
            emails.forEach((email) => {
              const emailDate = new Date(email.dateSent);
              const emailYear = emailDate.getFullYear();
              const isToday = today.toDateString() === emailDate.toDateString(); // Check if the email was sent today

              if (isToday) {
                // If today, only show hour and minute
                email.dateSent = emailDate.toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                });
              } else if (emailYear === currentYear) {
                // If in the same year, show "MMM DD" format
                email.dateSent = emailDate.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
              } else {
                // If from a previous year, show "MMM DD YYYY"
                email.dateSent = emailDate.toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                });
              }
            });
            res.render("inbox", {
              directory: "Outbox",
              fullName: fullName,
              emails: emails,
              currentPage: page,
              totalPages,
              isOutbox: true,
            });
          }
        );
      } else {
        return res.status(403).send(`
          <html>
            <head>
              <title>Access Denied</title>
              <meta http-equiv="refresh" content="5;url=/" />
            </head>
            <body>
              <h1>403 - Access Denied</h1>
              <p>You will be redirected to the login page in 5 seconds...</p>
              <script>
                setTimeout(() => {
                  window.location.href = "/";
                }, 5000);
              </script>
            </body>
          </html>
        `)
      }
    });
    // server compose
    app.get("/compose", (req, res) => {
      if (req.cookies.sessionId) {
        let fullName = req.cookies.fullName;
        query = "SELECT * FROM users";
        connection.query(query, (err, result) => {
          if (err) throw err;
          const users = result;
          res.render("compose", {
            fullName: fullName,
            users: users,
            error: "",
          });
        });
      } else {
        return res.status(403).send(`
          <html>
            <head>
              <title>Access Denied</title>
              <meta http-equiv="refresh" content="5;url=/" />
            </head>
            <body>
              <h1>403 - Access Denied</h1>
              <p>You will be redirected to the login page in 5 seconds...</p>
              <script>
                setTimeout(() => {
                  window.location.href = "/";
                }, 5000);
              </script>
            </body>
          </html>
        `)
      }
    });
    // Handle compose form submission
    app.post("/compose", upload.single("attachment"), (req, res) => {
      let { recipient, subject, body } = req.body;

      query = "SELECT * FROM users  WHERE email = ?";
      let fullName = req.cookies.fullName;
      console.log(body);
      connection.query("SELECT * FROM users", (err, result) => {
        if (err) throw err;
        const usersList = result;
        if (recipient === "") {
          res.render("compose", {
            fullName: fullName,
            users: usersList,
            error: "Please choose recipient",
          });
          return;
        }
        if (subject === "") {
          subject = "No subject";
        }
        connection.query(query, [recipient], (err, result) => {
          if (err) throw err;
          if (result.length > 0) {
            // Recipient found, you can access recipient details using result[0]
            const recipientId = result[0].id;
            if (recipientId == req.cookies.sessionId) {
              res.render("compose", {
                fullName: fullName,
                users: usersList,
                error: "You can't send email to yourself",
              });
            } else {
              // Insert the email into the database
              query =
                "INSERT INTO emails (sender_id, recipient_id, subject, body, externalFile) VALUES (?, ?, ?, ?, ?)";
              connection.query(query, [
                req.cookies.sessionId,
                recipientId,
                subject,
                body,
                req.file ? req.file.originalname : null,
              ]);
              console.log("Email sent successfully");
              res.render("compose", {
                fullName: req.cookies.fullName,
                users: usersList,
                error: "Send success",
              }); // Render the compose page with no error
            }
          } else {
            // Recipient not found
            console.log("Recipient does not exist");
            res.render("compose", {
              fullName: req.cookies.fullName,
              users: usersList,
              error: "Recipient does not exist",
            });
          }
        });
      });
    });

    // Serve the email detail page
    app.get("/email/:id", (req, res) => {
      if (req.cookies.sessionId) {
        const emailId = req.params.id;
        query = `SELECT sender.fullName AS senderName, receiver.fullName AS recipientName, emails.subject, emails.body, emails.date AS dateSent, emails.externalFile
      FROM emails
      JOIN users AS sender ON emails.sender_id = sender.id
      JOIN users AS receiver ON emails.recipient_id = receiver.id
      WHERE emails.id = ${emailId}`;

        connection.query(query, (err, result) => {
          if (err) throw err;
          let email = result[0];
          console.log(email);
          // replace \r\n with <br> tag
          email.body = email.body.replace(/\r\n/g, "<br>");
          res.render("email", {
            email,
            fullName: req.cookies.fullName,
          });
        });
      } else {
        res.redirect("/");
      }
    });
    // download file
    app.get("/uploads/:filename", (req, res) => {
      const filename = req.params.filename;
      res.download(`uploads/${filename}`, (err) => {
        if (err) {
          // Handle error, if any
          console.error(err);
          res.status(err.status).end();
        } else {
          // Redirect after the download is complete
          res.on("finish", () => {
            res.redirect("/inbox");
          });
        }
      });
    });

    // Handle deletion of selected emails
    app.post("/delete-emails", (req, res) => {
      const emailIds = req.body.emailIds;

      if (!emailIds) {
        // No emails were selected for deletion
        return res.redirect(req.get("referer"));
      }

      const emailIdsArray = Array.isArray(emailIds) ? emailIds : [emailIds];

      query = `DELETE FROM emails WHERE id IN (?) AND (
    (sender_id = ? AND isVisibleForSender = TRUE) OR
    (recipient_id = ? AND isVisibleForRecipient = TRUE)
  )`;

      connection.query(
        query,
        [emailIdsArray, req.cookies.sessionId, req.cookies.sessionId],
        (err, result) => {
          if (err) throw err;
          console.log("Deleted emails successfully:", result.affectedRows);
          res.redirect(req.get("referer")); // Redirect to the previous page
        }
      );
    });

    // sign out
    app.get("/signout", (req, res) => {
      res.clearCookie("sessionId");
      res.redirect("/");
    });
    app.listen(port, () => {
      console.log(`App listening at http://localhost:${port}`);
    });
  } catch (err) {
    console.error(err);
  }
})();
