// Netlify serverless function: keeps your Anthropic API key off the public page.
exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method not allowed" };
  }

  let prompt;
  try {
    prompt = JSON.parse(event.body).prompt;
  } catch (e) {
    return { statusCode: 400, body: "Bad request" };
  }
  if (typeof prompt !== "string" || !prompt || prompt.length > 3000) {
    return { statusCode: 400, body: "Invalid prompt" };
  }

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model: "claude-sonnet-5-5",
      max_tokens: 1200,
      messages: [{ role: "user", content: prompt }]
    })
  });

  return {
    statusCode: res.status,
    headers: { "content-type": "application/json" },
    body: await res.text()
  };
};
