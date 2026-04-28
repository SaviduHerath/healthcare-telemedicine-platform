const Groq = require("groq-sdk");
const SymptomCheck = require("../models/symptomCheck");

exports.analyzeSymptoms = async (req, res) => {
  try {
    //Get userId and userName from the request body
    const { symptoms, userId, userName } = req.body;

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY.trim() });

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are a medical assistant AI. 
          You must respond ONLY in a valid JSON object.
          The JSON MUST contain exactly these keys:
          "suggestions": (a string containing health advice),
          "specialties": (an array of strings of doctor types),
          "urgency": (a string: "Low", "Medium", or "High")`
        },
        { role: "user", content: symptoms }
      ],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" }
    });

    const aiResponse = JSON.parse(chatCompletion.choices[0].message.content);

    const newEntry = new SymptomCheck({
      userId: userId || "Guest",
      userName: userName || "Anonymous",
      symptoms,
      suggestions: aiResponse.suggestions,
      specialties: aiResponse.specialties,
      urgency: aiResponse.urgency || "Medium"
    });

    await newEntry.save();

    res.status(200).json(aiResponse);
  } catch (error) {
    console.error("Groq Error:", error);
    res.status(500).json({ error: "Failed to analyze symptoms" });
  }
};

//get patients
exports.getPatients = async (req, res) => {
  try {
    const response = await axios.get(
      "http://localhost:5001/api/admin/all-patients"
    );

    res.status(200).json(response.data);
  } catch (err) {
    console.error("Patient service error:", err.message);
    res.status(500).json({ message: "Failed to fetch patients" });
  }
};