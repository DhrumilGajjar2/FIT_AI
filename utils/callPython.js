const { spawn } = require("child_process");

const callPythonModel = (userData) => {
  return new Promise((resolve, reject) => {
    console.log("🚀 Sending data to Python AI model:", JSON.stringify(userData, null, 2));

    const pythonProcess = spawn(process.platform === "win32" ? "python" : "python3", ["ai_model/model.py"]);

    pythonProcess.stdin.write(JSON.stringify(userData));
    pythonProcess.stdin.end();

    let result = "";

    pythonProcess.stdout.on("data", (data) => {
      result += data.toString();
    });

    pythonProcess.stderr.on("data", (data) => {
      console.error("❌ Python Script Error:", data.toString());
      reject(new Error(`AI Model Error: ${data.toString().trim()}`));
    });

    pythonProcess.on("close", (code) => {
      console.log("📌 Python Process Exited with Code:", code);

      if (code !== 0) {
        return reject(new Error(`Python process exited with code ${code}`));
      }

      try {
        if (!result.trim()) {
          return reject(new Error("AI Model returned an empty response."));
        }

        const jsonMatch = result.match(/\{.*\}/s);
        if (!jsonMatch) {
          return reject(new Error("AI Model returned invalid JSON."));
        }

        const aiResponse = JSON.parse(jsonMatch[0]);
        console.log("✅ Received AI Response:", JSON.stringify(aiResponse, null, 2));
        resolve(aiResponse);
      } catch (error) {
        console.error("❌ AI Response Parsing Error:", error);
        reject(new Error("Error parsing AI response. Please try again."));
      }
    });

    setTimeout(() => {
      console.error("⏳ AI model execution timed out.");
      reject(new Error("AI model execution timed out."));
      pythonProcess.kill();
    }, 40000);
  });
};

module.exports = callPythonModel;
