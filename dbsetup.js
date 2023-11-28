const mysql = require("mysql2/promise");

(async () => {
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
    ('a@a.com', '123456', 'Alice Doe'),
    ('b@b.com', '123456', 'Bob Smith'),
    ('c@c.com', '123456', 'Charlie Brown')
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
        externalFile VARCHAR(255),
        FOREIGN KEY (sender_id) REFERENCES users(id)
      )
    `;
    await connection.execute(createEmailsTable);
    console.log("Created emails table");

    // insert emails
    const insertEmails = `
  INSERT INTO emails (sender_id, recipient_id, subject, body, date)
  VALUES
    (1, 2, 'Hello', 'Hi there! How are you?', '2023-11-01 12:00:00'),
    (2, 1, 'Meeting Tomorrow', 'Are you available for a meeting tomorrow?', '2023-11-02 14:30:00'),
    (1, 3, 'Project Update', 'Here''s the latest update on the project.', '2023-11-03 09:45:00'),
    (3, 1, 'Important Announcement', 'We have an important announcement to make.', '2023-11-04 16:20:00'),
    (2, 3, 'Invitation', 'You''re invited to our event next week.', '2023-11-05 18:00:00'),
    (3, 2, 'Feedback Needed', 'We would appreciate your feedback on the recent changes.', '2023-11-06 10:15:00'),
    (1, 2, 'URGENT: Action Required', 'Action is required on the following matter.', '2023-11-07 13:30:00'),
    (2, 1, 'Follow-up', 'Just following up on our previous conversation.', '2023-11-08 11:45:00'),
    (1, 2, 'Special Announcement', 'We have a special announcement to share with you.', '2023-11-09 08:00:00'),
    (2, 1, 'Exciting News', 'Exciting news! You won''t want to miss this.', '2023-11-10 15:00:00'),
    (1, 3, 'Check this out', 'You should check this out.', '2023-11-11 10:30:00'),
    (3, 1, 'Important Update', 'We have an important update regarding the project.', '2023-11-12 14:00:00'),
    (2, 3, 'Meeting Minutes', 'Here are the meeting minutes from our last meeting.', '2023-11-13 16:45:00'),
    (3, 2, 'Next Steps', 'Here are the next steps we need to take.', '2023-11-14 11:00:00'),
    (1, 2, 'URGENT: Action Required', 'Action is required on the following matter.', '2023-11-15 09:30:00'),
    (2, 1, 'Follow-up', 'Just following up on our previous conversation.', '2023-11-16 13:15:00'),
    (1, 2, 'Special Announcement', 'We have a special announcement to share with you.', '2023-11-17 08:45:00'),
    (2, 1, 'Exciting News', 'Exciting news! You won''t want to miss this.', '2023-11-18 14:30:00'),
    (1, 3, 'Check this out', 'You should check this out.', '2023-11-19 16:00:00'),
    (3, 1, 'Important Update', 'We have an important update regarding the project.', '2023-11-20 12:30:00'),
    (2, 3, 'Meeting Minutes', 'Here are the meeting minutes from our last meeting.', '2023-11-21 09:00:00'),
    (3, 2, 'Next Steps', 'Here are the next steps we need to take.', '2023-11-22 15:45:00'),
    (1, 2, 'URGENT: Action Required', 'Action is required on the following matter.', '2023-11-23 11:30:00'),
    (2, 1, 'Follow-up', 'Just following up on our previous conversation.', '2023-11-24 14:15:00')
`;

  
    await connection.query(insertEmails);
  } catch (err) {
    console.error("Error setting up database: ", err);
  }
})();
