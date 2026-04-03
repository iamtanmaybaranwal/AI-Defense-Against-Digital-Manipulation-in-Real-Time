# CIVIS – Real-Time AI Defense Against Digital Manipulation

🚀 **Live Demo:**  
https://nischay-gdgjp.netlify.app  

This Project is used in GDG Jaipur Hackcrux Hackathon and was selected in top 10 teams among 120 teams.

CIVIS is an AI-powered system that detects **psychological manipulation in digital content before misinformation spreads.**

Instead of asking:

❓ *“Is this news true?”*

CIVIS asks a deeper question:

> **“Is this content engineered to manipulate human behavior?”**

If antivirus protects computers from malware, **CIVIS protects society from manipulation.**

---

# The Problem

Misinformation spreads rapidly online — not because it is convincing, but because it is **emotionally engineered**.

Manipulative content often uses psychological triggers such as:

- Fear
- Urgency
- Outrage
- Identity conflict

These tactics bypass rational thinking and encourage people to **react and share content instantly**.

By the time fact-checkers verify the information, **the narrative may already have spread widely.**

---

# Our Solution

CIVIS introduces a **real-time AI system that detects manipulation signals in digital content.**

The platform supports **multi-modal input**, allowing analysis of:

- Text
- Voice input
- Images / screenshots

CIVIS evaluates psychological influence patterns and generates a **Manipulation Risk Score** with explanation.

This helps users **pause and critically evaluate information before believing or sharing it.**

---

# Key Features

### Multi-Modal Content Analysis
Analyze **text, voice, and images** to detect manipulation signals.

### Real-Time Manipulation Detection
Detect psychological manipulation patterns instantly.

### Emotional Trigger Detection
Identify fear, urgency, outrage, and identity-based persuasion tactics.

### Explainable AI
Provide reasoning for why content was flagged.

### Manipulation Risk Score
Generate a risk score indicating how strongly content attempts to influence behavior.

### Scalable Architecture
Designed for browser extensions, media tools, and platform integrations.

---

# APIs & Services Used

### Groq API
Used for **high-speed LLM inference** and AI-based content analysis.

### Serper API
Used for **real-time web search** to gather context and verify claims.

### NewsAPI
Used to fetch **relevant news sources** and credibility signals.

---

# Technology Stack

### Frontend
- React
- Vite
- CSS

### Backend
- Node.js
- Express

### AI / NLP
- Transformer-based NLP models
- Multilingual embeddings
- Emotion classification
- Manipulation pattern detection

---

# Project Structure

```

backend
│
├── civisAnalyzer.js
├── civisAnalyzer(t).js
├── server.js
├── package.json
│
gdg-jp
│
├── public
├── src
│   ├── assets
│   ├── components
│   ├── App.jsx
│   ├── main.jsx
│
├── index.html
├── vite.config.js

````

---

# Running the Project Locally

## 1. Clone the Repository

```bash
git clone https://github.com/your-username/civis.git
cd civis
````

---

## 2. Setup Backend

Navigate to backend folder:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file and add your API keys:

```
GROQ_API_KEY=your_groq_api_key
SERPER_API_KEY=your_serper_api_key
NEWS_API_KEY=your_news_api_key
```

Start the backend server:

```bash
node server.js
```

---

## 3. Setup Frontend

Open a new terminal and run:

```bash
cd gdg-jp
npm install
npm run dev
```

The app will run locally at:

```
http://localhost:5173
```

---

# Example Use Case

Example viral claim:

> “Burj Khalifa attacked by drones.”

CIVIS analyzes the content and detects:

* Fear trigger
* Urgency framing
* Geopolitical narrative

Result:

**High Manipulation Risk Score**

This demonstrates how CIVIS can warn users **before misinformation spreads.**

---

# Deployment Vision

CIVIS can be deployed through:

* Browser extensions for real-time content analysis
* Platform APIs for social media moderation
* Tools for journalists and fact-checkers

Our goal is to create an **AI-powered intelligence layer for the digital information ecosystem.**

---

# Team Nischay

Built for **GDG Jaipur Hackathon**

Team Members:

* Tanmay Baranwal
* Shravani Jadhav

  
