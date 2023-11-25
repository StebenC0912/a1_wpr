const mysql = require("mysql2/promise");

module.exports = async function () {
  try {
    const connection = await mysql.createConnection({
      host: "localhost",
      port: 3306,
      user: "root",
      password: "stebenc09122002",
      database: "wpr2023",
    });

    console.log("Connected to MySQL database");

    // create users table
    const createUsersTable = `
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        fullName VARCHAR(255) NOT NULL
      )
    `;
    await connection.execute(createUsersTable);
    console.log("Created users table");

    // insert users
    const insertUsers = `
    INSERT IGNORE INTO users (email, password, fullName)
    VALUES
      ('a@a.com', '123456', 'A'),
      ('b@b.com', '123456', 'B'),
      ('c@c.com', '123456', 'C')
    `;
    await connection.execute(insertUsers);
    console.log("Inserted users");

    // create emails table
    const createEmailsTable = `
      CREATE TABLE IF NOT EXISTS emails (
        id INT AUTO_INCREMENT PRIMARY KEY,
        sender_id INT NOT NULL,
        recipient_id INT NOT NULL,
        subject VARCHAR(255) NOT NULL,
        body TEXT NOT NULL,
        date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (sender_id) REFERENCES users(id)
      )
    `;
    await connection.execute(createEmailsTable);
    console.log("Created emails table");

    // insert emails
    // insert emails
    const insertEmails = `
          INSERT INTO emails (sender_id, recipient_id, subject, body, date)
          VALUES
            (1, 2, 'Subject 1', 'Body 1', '2021-02-01 00:00:00'),
            (2, 1, 'Subject 2', 'Body 2', '2021-02-02 00:00:00'),
            (1, 3, 'Subject 3', 'Body 3', '2021-02-03 00:00:00'),
            (3, 1, 'Subject 4', 'Body 4', '2021-02-04 00:00:00'),
            (2, 3, 'Subject 5', 'Body 5', '2021-02-05 00:00:00'),
            (3, 2, 'Subject 6', 'Body 6', '2021-02-06 00:00:00'),
            (1, 2, 'Subject 7', 'Body 7', '2021-02-07 00:00:00'),
            (2, 1, 'Subject 8', 'Body 8', '2021-02-08 00:00:00')
        `;
    // await connection.query(insertEmails);
  } catch (err) {
    console.error("Error setting up database: ", err);
  }
};
