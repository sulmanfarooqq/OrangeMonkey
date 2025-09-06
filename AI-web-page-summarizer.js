// ==UserScript==
// @name         Adjustable Page Summarizer + Q&A (Mistral AI + Auto-Hide Fix)
// @namespace    http://tampermonkey.net/
// @version      3.2
// @description  Summarize webpage and ask questions with draggable/resizable auto-hide panel using Mistral AI (with idle check)
// @author       You
// @match        *://*/*
// @grant        GM_xmlhttpRequest
// @grant        GM_addStyle
// ==/UserScript==

(function () {
  "use strict";
// this is a free key, get your own from https://mistral.ai

  const API_KEY = "CMpytMlUWyRIcztTKKNazty9nwggKzrm"; // your mistral key here 
  const API_URL = "https://api.mistral.ai/v1/chat/completions";
  let pageSummary = "";

  // Track last mouse position
  let mouseX = 0, mouseY = 0;
  document.addEventListener("mousemove", e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  // Panel UI
  const panel = document.createElement("div");
  panel.innerHTML = `
    <div id="mistral-header">📑 Mistral AI</div>
    <button id="summarizeBtn">📄 Summarize Page</button>
    <textarea id="qaInput" placeholder="Ask a question..." rows="2"></textarea>
    <button id="qaBtn">❓ Ask</button>
    <pre id="qaOutput">🔹 Ready</pre>
    <div id="mistral-resize"></div>
  `;
  document.body.appendChild(panel);
  panel.id = "mistral-panel";

  GM_addStyle(`
    #mistral-panel, #mistral-header, #qaInput, #qaOutput, #summarizeBtn, #qaBtn { font-family: monospace; }
    #mistral-panel {
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 300px;
      height: 320px;
      background: #111;
      color: #eee;
      border-radius: 12px;
      padding: 8px;
      display: flex;
      flex-direction: column;
      box-shadow: 0 4px 15px rgba(0,0,0,0.4);
      z-index: 9999;
      opacity: 1;
      transition: opacity 0.4s ease;
    }
    #mistral-header {
      background: #222;
      padding: 6px;
      text-align: center;
      border-radius: 8px;
      cursor: move;
      user-select: none;
      margin-bottom: 6px;
    }
    #summarizeBtn, #qaBtn {
      margin: 4px 0;
      padding: 6px;
      width: 100%;
      border: none;
      border-radius: 8px;
      background: #444;
      color: #fff;
      cursor: pointer;
    }
    #summarizeBtn:hover, #qaBtn:hover { background: #666; }
    #qaInput {
      width: 100%;
      flex-shrink: 0;
      background: #222;
      color: #fff;
      border: none;
      padding: 6px;
      border-radius: 8px;
      margin: 6px 0;
    }
    #qaOutput {
      flex: 1;
      background: #000;
      padding: 8px;
      border-radius: 8px;
      overflow-y: auto;
      white-space: pre-wrap;
      margin-top: 4px;
    }
    #mistral-resize {
      width: 12px;
      height: 12px;
      background: #555;
      position: absolute;
      right: 2px;
      bottom: 2px;
      cursor: se-resize;
      border-radius: 3px;
    }
  `);

  // --- Dragging ---
  const header = panel.querySelector("#mistral-header");
  let isDragging = false, offsetX, offsetY;

  header.addEventListener("mousedown", e => {
    isDragging = true;
    offsetX = e.clientX - panel.offsetLeft;
    offsetY = e.clientY - panel.offsetTop;
    document.addEventListener("mousemove", movePanel);
    document.addEventListener("mouseup", stopDrag);
  });

  function movePanel(e) {
    if (!isDragging) return;
    panel.style.left = e.clientX - offsetX + "px";
    panel.style.top = e.clientY - offsetY + "px";
    panel.style.bottom = "auto";
    panel.style.right = "auto";
  }
  function stopDrag() {
    isDragging = false;
    document.removeEventListener("mousemove", movePanel);
    document.removeEventListener("mouseup", stopDrag);
  }

  // --- Resizing ---
  const resizer = panel.querySelector("#mistral-resize");
  let isResizing = false;
  resizer.addEventListener("mousedown", () => {
    isResizing = true;
    document.addEventListener("mousemove", resizePanel);
    document.addEventListener("mouseup", stopResize);
  });
  function resizePanel(e) {
    if (!isResizing) return;
    panel.style.width = e.clientX - panel.offsetLeft + "px";
    panel.style.height = e.clientY - panel.offsetTop + "px";
  }
  function stopResize() {
    isResizing = false;
    document.removeEventListener("mousemove", resizePanel);
    document.removeEventListener("mouseup", stopResize);
  }

  // --- Auto-Hide with Idle Check ---
  const HIDE_DISTANCE = 250; // px distance threshold
  setInterval(() => {
    const rect = panel.getBoundingClientRect();
    const inPanel =
      mouseX >= rect.left &&
      mouseX <= rect.right &&
      mouseY >= rect.top &&
      mouseY <= rect.bottom;

    const dx = Math.max(rect.left - mouseX, mouseX - rect.right, 0);
    const dy = Math.max(rect.top - mouseY, mouseY - rect.bottom, 0);
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (inPanel || distance < HIDE_DISTANCE) {
      panel.style.opacity = 1;
    } else {
      panel.style.opacity = 0.1;
    }
  }, 400); // check every 400ms

  // --- API Call ---
  async function callMistral(messages) {
    return new Promise((resolve, reject) => {
      GM_xmlhttpRequest({
        method: "POST",
        url: API_URL,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_KEY}`,
        },
        data: JSON.stringify({ model: "mistral-small-latest", messages }),
        onload: function (res) {
          try {
            const data = JSON.parse(res.responseText);
            const msg = data.choices?.[0]?.message?.content || "⚠️ No response";
            resolve(msg);
          } catch (err) {
            reject(err);
          }
        },
        onerror: reject,
      });
    });
  }

  // --- Summarize ---
  document.getElementById("summarizeBtn").onclick = async () => {
    const text = document.body.innerText.slice(0, 6000);
    document.getElementById("qaOutput").innerText = "⏳ Summarizing...";
    const summary = await callMistral([
      { role: "system", content: "You are a helpful assistant that summarizes pages." },
      { role: "user", content: "Summarize this webpage content:\n" + text },
    ]);
    pageSummary = summary;
    document.getElementById("qaOutput").innerText = "📄 Summary:\n\n" + summary;
  };

  // --- Question Answering ---
  document.getElementById("qaBtn").onclick = async () => {
    const q = document.getElementById("qaInput").value;
    if (!pageSummary) {
      document.getElementById("qaOutput").innerText = "⚠️ Please summarize the page first.";
      return;
    }
    document.getElementById("qaOutput").innerText = "⏳ Thinking...";
    const answer = await callMistral([
      { role: "system", content: "You are a helpful assistant that answers questions using provided context." },
      { role: "user", content: "Here is the summary of the page:\n" + pageSummary },
      { role: "user", content: "Question: " + q },
    ]);
    document.getElementById("qaOutput").innerText = "❓ Q: " + q + "\n\n💡 A: " + answer;
  };
})();
