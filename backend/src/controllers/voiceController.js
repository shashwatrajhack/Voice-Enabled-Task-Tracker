require("dotenv").config();
const chrono = require("chrono-node");
const { Configuration, OpenAIApi } = require("openai");

/**
 * Voice parsing controller:
 * - If OPENAI_API_KEY present -> call OpenAI to extract JSON
 * - Else -> heuristic parser using chrono-node + regex
 *
 * The OpenAI call is wrapped in try/catch; if response is not strict JSON,
 * fallback to heuristic parse.
 */

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

  // status heuristics
  let status = "To Do";
  if (/in progress|working on|started/.test(lower)) status = "In Progress";
  else if (/done|completed|finished/.test(lower)) status = "Done";

  // date using chrono
  const chronoDate = chrono.parseDate(text);
  const dueDate = chronoDate ? chronoDate.toISOString() : null;

  // naive title extraction: strip common command phrases + dates + priorities
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

    // If OpenAI available, ask it to extract structured JSON
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

        // Try parse
        try {
          const parsed = JSON.parse(raw);
          // normalize dueDate using chrono if natural language provided
          if (parsed.dueDate && typeof parsed.dueDate === "string") {
            const d = chrono.parseDate(parsed.dueDate);
            parsed.dueDate = d ? d.toISOString() : null;
          }
          return res.json({ transcript, parsed });
        } catch (jsonErr) {
          // If model didn't return pure JSON, fall back to heuristics.
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

    // No OpenAI key => heuristics
    const parsed = heuristicParse(transcript);
    return res.json({ transcript, parsed });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to parse" });
  }
};
