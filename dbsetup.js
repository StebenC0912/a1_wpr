const mysql = require('mysql2/promise');

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
        username VARCHAR(255) NOT NULL UNIQUE,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL
      )
    `;
    await connection.execute(createUsersTable);
    console.log("Created users table");

    // insert users
    const insertUsers = `
    INSERT IGNORE INTO users (username, email, password)
    VALUES
      ('User1', 'a@a.com', 'a'),
      ('User2', 'b@b.com', 'a'),
      ('User3', 'c@c.com', 'a')
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
        body TEXT NOT NULL
      )
    `;
    await connection.execute(createEmailsTable);
    console.log("Created emails table");

    // insert emails
    // insert emails
        //   const insertEmails = `
        //   INSERT INTO emails (sender_id, recipient_id, subject, body)
        //   VALUES
        //     (1, 2, 'Subject 1', 'Body 1'),
        //     (2, 1, 'Subject 2', 'Body 2'),
        //     (1, 3, 'Subject 3', 'Body 3'),
        //     (3, 1, 'Subject 4', 'Body 4'),
        //     (2, 3, 'Subject 5', 'Body 5'),
        //     (3, 2, 'Subject 6', 'Body 6'),
        //     (1, 2, 'Subject 7', 'Body 7'),
        //     (2, 1, 'Subject 8', 'Body 8')
            
        // `;
        //   await connection.query(insertEmails, (err, result) => {
        //     if (err) throw err;
        //     console.log("Inserted emails");
        //   });

  } catch (err) {
    console.error('Error setting up database: ', err);
  }
};