const { SessionsClient } = require("@google-cloud/dialogflow");
const express = require("express");
const bodyParser = require("body-parser");
const app = express();

// Load your Dialogflow Service Account Key
const key = require("./dialogflow-key.json");

// Create a new Dialogflow session client with the credentials
const dialogflowClient = new SessionsClient({
  credentials: {
    private_key: key.private_key,
    client_email: key.client_email,
  },
  projectId: "assistant-xrop",
});

const sessionId = "121"; // Set this to any unique session ID
const sessionPath = dialogflowClient.projectAgentSessionPath(
  key.project_id,
  sessionId
);

app.use(bodyParser.json());

// Route to handle user input
app.post("/api/submit", async (req, res) => {
  const userInput = req.body.userInput;

  const request = {
    session: sessionPath,
    queryInput: {
      text: {
        text: userInput,
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

// Serve the HTML file with the form (you'll create this next)
app.use(express.static("public"));

app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
