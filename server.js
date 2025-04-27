const express = require("express");
const bodyParser = require("body-parser");
const { Client } = require("pg");
const path = require("path");
const { SessionsClient } = require("@google-cloud/dialogflow");

const app = express();
const port = 3000;

// PostgreSQL client setup for user operations
const client = new Client({
  user: "postgres",
  host: "localhost",
  database: "sih",
  password: "Nithish@18",
  port: 5432,
});

// Connect to PostgreSQL
client
  .connect()
  .then(() => {
    console.log("Connected to PostgreSQL");
  })
  .catch((err) => {
    console.error("PostgreSQL connection error:", err.stack);
  });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public"))); // Serve static files

// Endpoint for registering a user
app.post("/register", async (req, res) => {
  const { fName, lName, email, password } = req.body;

  try {
    const query =
      "INSERT INTO users(first_name, last_name, email, password) VALUES($1, $2, $3, $4) RETURNING *";
    const values = [fName, lName, email, password];
    const result = await client.query(query, values);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error inserting data", err.stack);
    res.status(500).json({ error: "Database error" });
  }
});

// Endpoint for login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const query = "SELECT * FROM users WHERE email = $1 AND password = $2";
    const values = [email, password];
    const result = await client.query(query, values);

    if (result.rows.length > 0) {
      res
        .status(200)
        .json({ message: "Login successful", user: result.rows[0] });
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  } catch (err) {
    console.error("Error during login", err.stack);
    res.status(500).json({ error: "Database error" });
  }
});

// Endpoint to submit appraisal
app.post("/submit-appraisal", async (req, res) => {
  const { facultyName, employeeCode, publication, events, projects, lectures } =
    req.body;

  console.log("Received submission:", req.body); // Log incoming submission
  console.log("Response status:", res.statusCode);

  try {
    // Check for existing records
    const existingQuery =
      "SELECT * FROM appraisals WHERE employee_code = $1 AND faculty_name = $2";
    const existingValues = [employeeCode, facultyName];
    const existingResult = await client.query(existingQuery, existingValues);

    if (existingResult.rows.length > 0) {
      return res.status(409).json({ message: "Duplicate entry detected." }); // Conflict
    }

    const result = await client.query(
      "INSERT INTO appraisals (faculty_name, employee_code, publication, events, projects, lectures, submission_date) VALUES ($1, $2, $3, $4, $5, $6, NOW()) RETURNING *",
      [facultyName, employeeCode, publication, events, projects, lectures]
    );

    res.status(201).json({
      message: "Appraisal submitted successfully!",
      entry: result.rows[0],
    });
  } catch (err) {
    console.error("Error inserting data", err.stack);
    res.status(500).json({ message: "Error submitting appraisal data" });
  }
});

// Route to get all appraisal details
details(app, client);
function details(app, client) {
  app.get("/appraisals", async (req, res) => {
    try {
      const result = await client.query(
        "SELECT * FROM appraisals ORDER BY submission_date DESC"
      );
      res.status(200).json(result.rows);
    } catch (err) {
      console.error("Error fetching appraisal data", err.stack);
      res.status(500).json({ error: "Error fetching appraisal data" });
    }
  });
}

//route to get the admin details
app.post("/admins", async (req, res) => {
  console.log("Received data: ", req.body);
  const { email, pass } = req.body;

  try {
    const query = "SELECT * FROM admins WHERE email = $1 AND pass = $2";
    const values = [email, pass];
    const result = await client.query(query, values);

    if (result.rows.length > 0) {
      // User is authenticated
      const admin = result.rows[0];

      // Call details function to get appraisals after successful login
      try {
        const appraisalsResult = await client.query(
          "SELECT * FROM appraisals ORDER BY submission_date DESC"
        );

        // Return both the welcome message and the appraisals data
        res.status(200).json({
          message: "Welcome!!!",
          user: admin,
          appraisals: appraisalsResult.rows,
        });
      } catch (appraisalError) {
        console.error("Error fetching appraisal data", appraisalError.stack);
        res.status(500).json({ error: "Error fetching appraisal data" });
      }
    } else {
      // Invalid credentials
      res.status(401).json({ message: "Invalid credentials" });
    }
  } catch (err) {
    console.error("Error during login", err.stack);
    res.status(500).json({ error: "Database error" });
  }
});

// Dialogflow setup
const key = require("./dialogflow-key.json"); // Make sure the Dialogflow key is stored safely
const dialogflowClient = new SessionsClient({
  credentials: {
    private_key: key.private_key,
    client_email: key.client_email,
  },
  projectId: key.project_id,
});

const sessionId = "121"; // Use a unique session ID

// Middleware setup
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public"))); // Serve static files from the "public" folder

// Dialogflow interaction handler
app.post("/dialogflow", async (req, res) => {
  const userMessage = req.body.message; // Extract the user's message

  const sessionPath = dialogflowClient.projectAgentSessionPath(
    key.project_id,
    sessionId
  );

  const request = {
    session: sessionPath,
    queryInput: {
      text: {
        text: userMessage,
        languageCode: "en",
      },
    },
  };

  try {
    const [response] = await dialogflowClient.detectIntent(request);
    const botResponse = response.queryResult.fulfillmentText;
    res.json({ reply: botResponse });
  } catch (error) {
    console.error("Error during Dialogflow interaction:", error);
    res.status(500).json({ error: "Dialogflow request failed" });
  }
});

// Serve specific HTML files based on the URL
app.get("*", (req, res) => {
  const requestedUrl = req.url;
  let fileToServe = "index.html"; // Default file

  if (requestedUrl.includes("sih")) {
    fileToServe = "sih.html";
  } else if (requestedUrl.includes("details")) {
    fileToServe = "details.html";
  } else if (requestedUrl.includes("login")) {
    fileToServe = "login.html";
  } else if (requestedUrl.includes("admin")) {
    fileToServe = "admin_login.html";
  }

  res.sendFile(path.join(__dirname, "public", fileToServe));
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
