require("dotenv").config();
const chrono = require("chrono-node");
const { Configuration, OpenAIApi } = require("openai");

let openai = null;
if (process.env.OPENAI_API_KEY) {
  const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });
  openai = new OpenAIApi(configuration);
}

function heuristicParse(text) {
  const lower = text.toLowerCase();
  // priority heuristics
  let priority = "Medium";
  if (/critical|urgent|asap/.test(lower)) priority = "Critical";
  else if (/high priority|highly important|\bhigh\b/.test(lower))
    priority = "High";
  else if (/low priority|\blow\b/.test(lower)) priority = "Low";

  let status = "To Do";
  if (/in progress|working on|started/.test(lower)) status = "In Progress";
  else if (/done|completed|finished/.test(lower)) status = "Done";

  const chronoDate = chrono.parseDate(text);
  const dueDate = chronoDate ? chronoDate.toISOString() : null;

  let title = text
    .replace(
      /(remind me to|remind me|create (a )?task to|create a task to|please|can you|could you)/gi,
      ""
    )
    .replace(/(by|before|due|on)\s+[^,\.]+/gi, "")
    .replace(/(urgent|critical|high priority|low priority|high|low)/gi, "")
    .trim();

  if (!title) title = text.substring(0, 120);

  return { title, description: "", priority, status, dueDate };
}

function buildPrompt(transcript) {
  return `Extract valid JSON from the user's utterance. Return ONLY valid JSON (no extra commentary).
Fields:
- title (string) - short summary of the task
- description (string) - optional
- priority (Low|Medium|High|Critical|null)
- status (To Do|In Progress|Done|null)
- dueDate (ISO-8601 datetime string or natural language/null)

User utterance: """${transcript}"""
`;
}

exports.parseTranscript = async (req, res) => {
  try {
    const { transcript } = req.body;
    if (!transcript || typeof transcript !== "string")
      return res.status(400).json({ error: "Transcript required" });

    if (openai) {
      try {
        const prompt = buildPrompt(transcript);
        const completion = await openai.createChatCompletion({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content:
                "You are a strict JSON generator. Output ONLY valid JSON.",
            },
            { role: "user", content: prompt },
          ],
          max_tokens: 400,
          temperature: 0,
        });

        const raw = completion.data.choices[0].message.content.trim();

        try {
          const parsed = JSON.parse(raw);

          if (parsed.dueDate && typeof parsed.dueDate === "string") {
            const d = chrono.parseDate(parsed.dueDate);
            parsed.dueDate = d ? d.toISOString() : null;
          }
          return res.json({ transcript, parsed });
        } catch (jsonErr) {
          console.warn("OpenAI returned non-JSON; falling back to heuristics.");
          const parsed = heuristicParse(transcript);
          return res.json({
            transcript,
            parsed,
            warning: "AI returned non-JSON; used heuristics",
          });
        }
      } catch (aiErr) {
        console.error("OpenAI parse error", aiErr.message || aiErr);
        const parsed = heuristicParse(transcript);
        return res.json({
          transcript,
          parsed,
          warning: "AI parse failed; used heuristics",
        });
      }
    }

    const parsed = heuristicParse(transcript);
    return res.json({ transcript, parsed });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to parse" });
  }
};
