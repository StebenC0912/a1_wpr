module.exports = async function () {
  // Your database setup code here
  const mysql = require("mysql2");

  const connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "stebenc09122002",
    database: "wpr2023",
  });

  connection.connect((err) => {
    if (err) throw err;
    console.log("Connected to MySQL database");

    // create users table
    const createUsersTable = `
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL
    )
  `;
    connection.query(createUsersTable, (err, result) => {
      if (err) throw err;
      console.log("Created users table");

      // insert users
      const insertUsers = `
      INSERT IGNORE INTO users (name, email, password)
      VALUES
        ('User 1', 'a@a.com', 'a'),
        ('User 2', 'b@b.com', 'a'),
        ('User 3', 'c@c.com', 'a')
    `;
      connection.query(insertUsers, (err, result) => {
        if (err) throw err;
        console.log("Inserted users");

        // create emails table
        const createEmailsTable = `
        CREATE TABLE IF NOT EXISTS emails (
          id INT AUTO_INCREMENT PRIMARY KEY,
          sender_id INT NOT NULL,
          recipient_id INT NOT NULL,
          subject VARCHAR(255) NOT NULL,
          body TEXT NOT NULL
        )
      `;
        connection.query(createEmailsTable, (err, result) => {
          if (err) throw err;
          console.log("Created emails table");

          // insert emails
          const insertEmails = `
          INSERT INTO emails (sender_id, recipient_id, subject, body)
          VALUES
            (1, 2, 'Subject 1', 'Body 1'),
            (2, 1, 'Subject 2', 'Body 2'),
            (1, 3, 'Subject 3', 'Body 3'),
            (3, 1, 'Subject 4', 'Body 4'),
            (2, 3, 'Subject 5', 'Body 5'),
            (3, 2, 'Subject 6', 'Body 6'),
            (1, 2, 'Subject 7', 'Body 7'),
            (2, 1, 'Subject 8', 'Body 8')
        `;
          connection.query(insertEmails, (err, result) => {
            if (err) throw err;
            console.log("Inserted emails");

            // close connection
            connection.end((err) => {
              if (err) throw err;
              console.log("Closed MySQL database connection");
            });
          });
        });
      });
    });
  });
};
