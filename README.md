# 🚢 Sagar Netra

> ## 🇮🇳 AI-Powered Maritime Oil Spill Monitoring & Investigation Platform
>
> **Detect. Trace. Investigate. Protect.**

Sagar Netra is an AI-powered maritime intelligence prototype developed for the **Smart India Hackathon (SIH) 2026**.

The platform combines **Sentinel-1 SAR satellite imagery, AI-based oil-spill detection, geospatial analysis, wind/current data, and AIS vessel intelligence** to help maritime authorities detect oil spills and investigate their probable source.

The system is designed around a practical evidence pipeline:

```mermaid
flowchart LR
    A[🛰️ Sentinel-1 SAR] --> B[⚙️ Preprocessing]
    B --> C[🤖 AI Spill Detection]
    C --> D[📐 Spill Characterization]
    D --> E[🌊 Drift Backtracking]
    E --> F[🚢 AIS Correlation]
    F --> G[🎯 Suspect Ranking]
    G --> H[🛡️ Investigation]
🎯 Problem

Oil spills in offshore waters can be difficult to detect and investigate because:

Large maritime areas are difficult to monitor continuously.
Oil slicks can be confused with natural ocean features.
The original release location may differ from the visible slick location.
Vessel movements must be correlated with environmental conditions.
AIS data can contain gaps or suspicious behavior.
Manual investigation can be slow and resource-intensive.

Sagar Netra addresses these challenges by connecting satellite observations with AI, environmental data, and vessel intelligence.

🚀 Key Features
1. 🛰️ Satellite-Based Maritime Monitoring

The system monitors selected maritime Areas of Interest (AOIs), including:

West Coast – Zone 1
Mumbai High region
East Coast – Zone 2

Sentinel-1 SAR observations are used because SAR imagery can operate independently of daylight and is suitable for maritime surface monitoring.

2. 🤖 AI Oil-Spill Detection

The platform processes Sentinel-1 SAR imagery and performs AI-based analysis to classify regions as:

Satellite Image
      ↓
Preprocessing
      ↓
AI Model
      ↓
Oil / No-Oil
      ↓
Spill Region

The prototype uses a PyTorch-based computer vision pipeline for spill detection.

3. 📐 Spill Characterization

When a potential spill is detected, the system estimates:

Spill area
Slick geometry
Length
Width
Detection confidence

This converts a satellite observation into structured investigation evidence.

4. 🌊 Hindsight Drift Analysis

The detected slick is not automatically treated as the release location.

Instead, the platform performs backward drift analysis using environmental forcing data:

This helps estimate where the spill may have originated before reaching its observed position.

5. 🚢 AIS Vessel Correlation

The estimated origin zone is compared against AIS vessel tracks.

The filtering process progressively reduces the candidate vessel set:

Regional AIS Traffic
        ↓
Spatial Filter
        ↓
Temporal Filter
        ↓
Origin-Zone Matching
        ↓
Behavior Analysis
        ↓
Suspect Ranking

Example prototype funnel:

1,248 vessels
      ↓
   86 vessels
      ↓
   21 vessels
      ↓
    8 vessels
      ↓
    3 suspects
6. ⚠️ AIS Anomaly Detection

The system can highlight suspicious AIS behavior such as:

Transponder blackout periods
Sudden course changes
Speed reductions
Movement through the estimated origin zone
Temporal overlap with the estimated spill window
7. 🎯 Explainable Vessel Ranking

Candidate vessels are ranked using multiple evidence signals.

The objective is not simply to identify a vessel, but to show why a vessel became a high-priority investigation target.

🧭 Complete System Workflow
🏗️ System Architecture
🛠️ Technology Stack
Frontend
React 18
TypeScript
Vite
Tailwind CSS
Lucide React
Leaflet
Backend
Python
FastAPI
Uvicorn
HTTPX
Python-dotenv
AI / ML
PyTorch
ResNet-based computer vision model
Image preprocessing and inference pipeline
Satellite
Sentinel-1 SAR
Sentinel Hub APIs
Sentinel Hub Catalog API
Sentinel Hub Process API
Geospatial
Leaflet
GeoJSON
Spatial analysis
Wind/current data
📁 Project Structure

The project is divided into a React frontend and Python backend.

SIH/
│
├── backend/
│   ├── main.py
│   ├── ...
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── Timeline.tsx
│   │   │
│   │   ├── context/
│   │   │   └── SimulationContext.tsx
│   │   │
│   │   ├── data/
│   │   │   └── mockCases.ts
│   │   │
│   │   └── pages/
│   │       ├── Home.tsx
│   │       ├── LiveMonitoring.tsx
│   │       ├── Investigation.tsx
│   │       ├── Alerts.tsx
│   │       ├── HistoricalCases.tsx
│   │       ├── RiskPrediction.tsx
│   │       └── VesselAnalysis.tsx
│   │
│   ├── package.json
│   ├── vite.config.ts
│   └── ...
│
├── ml/
│   ├── ...
│   └── model files
│
├── kaggle/
│   └── ...
│
├── cache/
│   └── ...
│
├── .gitignore
└── README.md

node_modules should not be committed to GitHub. It is generated automatically by npm install.

⚙️ Installation & Setup
Prerequisites

Make sure the following are installed:

Node.js
npm
Python 3.10+
Git

Check:

node --version
npm --version
python --version
git --version
1️⃣ Clone the Repository
git clone <YOUR_GITHUB_REPOSITORY_URL>

Then:

cd SIH
2️⃣ Setup the Backend

Open a terminal in the project root:

cd backend

Create a Python virtual environment:

Windows
python -m venv venv

Activate it:

venv\Scripts\activate

Install backend dependencies:

pip install -r requirements.txt
3️⃣ Configure Sentinel Hub

Create:

backend/.env

Add your Sentinel Hub credentials:

SENTINEL_CLIENT_ID=your_client_id
SENTINEL_CLIENT_SECRET=your_client_secret

Do not commit .env to GitHub.

Your credentials should remain private.

4️⃣ Start the Backend Server

From the backend directory:

uvicorn main:app --reload

The backend will normally be available at:

http://127.0.0.1:8000

FastAPI documentation:

http://127.0.0.1:8000/docs
5️⃣ Setup the Frontend

Open a second terminal.

From the project root:

cd frontend

Install frontend dependencies:

npm install

Start the development server:

npm run dev

Vite will provide a local URL, normally:

http://localhost:5173

Open that URL in your browser.

🖥️ Running the Complete System

You should have two terminals running.

Terminal 1 — Backend
cd SIH/backend
venv\Scripts\activate
uvicorn main:app --reload
Terminal 2 — Frontend
cd SIH/frontend
npm run dev

Then open:

http://localhost:5173

The architecture is:

🔐 Environment Variables

The following credentials should be kept in environment variables:

SENTINEL_CLIENT_ID=...
SENTINEL_CLIENT_SECRET=...

Never hard-code private API credentials directly into source code.

Never commit:

.env
venv/
node_modules/
cache/
🎬 SIH Demo Walkthrough

The prototype includes a deterministic demo flow so that the complete investigation pipeline can be demonstrated reliably to judges.

🟢 Scenario A — Normal Patrol
Step 1

Open:

Home

Select a maritime monitoring zone.

Step 2

Go to:

Monitoring
Step 3

Start the monitoring workflow.

Step 4

Use the demo control:

No Spill / Clear
Step 5

The system demonstrates:

Satellite Observation
        ↓
Processing
        ↓
AI Analysis
        ↓
No Oil Spill
        ↓
AREA CLEAR

This demonstrates the normal surveillance path.

🔴 Scenario B — Oil Spill Investigation

This is the primary SIH demonstration scenario.

Step 1 — Detect

Start monitoring and trigger:

Spill Incident

The monitoring interface simulates the satellite acquisition and analysis process.

The system raises:

🚨 OIL SPILL DETECTED
Step 2 — Characterize

The system displays the detected spill region and its characteristics.

Example prototype values:

Area:       12.8 km²
Length:      7.2 km
Confidence:  96%
Step 3 — Estimate Origin

The investigation module performs backward drift analysis.

Detected Slick
      ↓
Wind + Current
      ↓
Backward Drift
      ↓
Probability Origin Zone

The map displays the estimated origin probability region.

Step 4 — Filter AIS Traffic

The system correlates vessel traffic with the estimated origin zone.

Example funnel:

1,248
  ↓
86
  ↓
21
  ↓
8
  ↓
3 Suspects
Step 5 — Rank Suspects

Candidate vessels are ranked using evidence such as:

Spatial overlap
Timing
Vessel trajectory
Course changes
Speed changes
AIS gaps
Origin-zone overlap

Example prototype candidates:

#1 MV OCEAN STAR
Suspicion Index: 87/100

#2 MV BLUE HORIZON
Suspicion Index: 71/100
Step 6 — Inspect Vessel

Select the highest-ranked vessel.

The investigation interface displays its AIS behavior and anomaly timeline.

Example:

Normal AIS
    ↓
AIS GAP
    ↓
Origin / Discharge Window
    ↓
AIS Restored

This allows the judge to understand why the vessel was flagged, rather than simply seeing an unexplained score.

Step 7 — Risk Prediction

Open the risk prediction section.

Move the timeline through:

+6h
+12h
+24h
+48h

The prototype demonstrates how the predicted slick movement can threaten sensitive coastal areas.

🧪 Demo Architecture

The demo is designed to clearly separate the real data pipeline from the deterministic demonstration controls.

This ensures the complete investigation story can be demonstrated consistently during the SIH presentation.

🌊 Core Investigation Logic

The central intelligence pipeline can be summarized as:

OBSERVE
   ↓
DETECT
   ↓
CHARACTERIZE
   ↓
TRACE
   ↓
CORRELATE
   ↓
RANK
   ↓
INVESTIGATE

Or technically:

🇮🇳 Why Sagar Netra?

Sagar Netra is designed around the needs of India's maritime environment.

Potential applications include:

Indian coastal surveillance
Oil-spill response
Maritime environmental protection
Offshore infrastructure monitoring
Vessel investigation
Pollution accountability
Coastal ecosystem protection

The platform can be extended toward larger-scale monitoring of India's extensive coastline and offshore economic zones.

🔮 Future Scope

The prototype can be extended with:

National-scale coastal monitoring
More frequent satellite ingestion
Additional SAR processing techniques
Improved oil-spill segmentation models
Real-time AIS streaming
Advanced drift modelling
Automatic anomaly detection
More environmental datasets
Multi-satellite fusion
Automated investigation reports
Authority notification workflows
🏆 Smart India Hackathon

Project: Sagar Netra

Domain: Maritime / Environmental Intelligence

Hackathon: Smart India Hackathon 2026

Core Objective

Build an intelligent system capable of detecting maritime oil spills from satellite observations, tracing their probable origin, correlating vessel activity, and supporting evidence-based investigation.

👥 Team

Team: Straw Hats Pirates

Developed for Smart India Hackathon 2026.

📜 Project Motto

Detect. Trace. Investigate. Protect.

🇮🇳 Sagar Netra — Intelligent Eyes for India's Maritime Domain.


### One important correction from your old README

Your old setup said:

```bash
cd Desktop/SIH
npm install
npm run dev

That is not correct for your current structure if package.json is inside frontend.

Use:

SIH/
├── backend/
└── frontend/
    └── package.json

So the correct frontend startup is:

cd frontend
npm install
npm run dev

And backend separately:

cd backend
venv\Scripts\activate
uvicorn main:app --reload

So for the actual SIH demo, two terminals is the clean setup:

TERMINAL 1
SIH/backend
    ↓
FastAPI + Sentinel + ML
    ↓
http://127.0.0.1:8000


TERMINAL 2
SIH/frontend
    ↓
React + Vite
    ↓
http://localhost:5173

Also, I intentionally removed Reports as a core demo step from this README because we decided it is an extra feature rather than part of your main investigation workflow.

i need whole updated complete readmefile files with lots of flow diagrams and all info

Done. I made the complete updated README.md with:

🇮🇳 Sagar Netra branding and SIH 2026 context
Full problem → solution explanation
Lots of Mermaid flowcharts and architecture diagrams
Complete 7-stage core workflow
Satellite/Sentinel-1 pipeline
AI/ML pipeline
Drift backtracking
AIS filtering and suspect ranking
Frontend + backend architecture
Demo architecture
Scenario A and Scenario B complete walkthrough
Exact frontend/backend startup commands
Python virtual environment setup
Sentinel Hub .env setup
Git/GitHub setup
.gitignore guidance
Troubleshooting
Prototype vs production distinction
Limitations
Future scope
Environmental/economic/investigation impact
SIH presentation story
Quick-start section
Final end-to-end architecture diagram

I also kept the Reports page out of the core demo workflow, consistent with our decision that it is an extra feature rather than a core investigation step.

📄 Complete README

Download the updated README.md

You can directly replace your current root-level README.md with this file. 

README.md
Document
make it little small

Yes — I shortened it significantly while keeping the important parts:

Core workflow + architecture diagrams
Satellite/AI/AIS pipelines
Scenario A & B demo flow
Frontend/backend setup
Sentinel Hub .env
GitHub setup
Project structure
Prototype vs production
Limitations + future scope
SIH presentation explanation

766 lines instead of 2,128, so it should be much more practical as a GitHub README.

Download the smaller updated README.md 

README.md
Document

Library
/
sih
/
README.md
🇮🇳 Sagar Netra 🚢🛰️

AI-Powered Maritime Oil Spill Monitoring & Investigation Platform
Detect. Trace. Investigate. Protect.

Sagar Netra is a Smart India Hackathon 2026 prototype for detecting offshore oil-spill signatures and helping investigators trace their probable origin using satellite observations, AI analysis, drift modelling and AIS vessel correlation.

🎯 What the Platform Does
flowchart LR
    A["🛰️ Sentinel-1 SAR"] --> B["🤖 AI Spill Detection"]
    B --> C["📐 Characterize Spill"]
    C --> D["🌊 Backtrack Drift"]
    D --> E["🎯 Origin Zone"]
    E --> F["🚢 AIS Correlation"]
    F --> G["⚠️ Anomaly Detection"]
    G --> H["🏆 Suspect Ranking"]

The objective is to move from:

"A spill was detected" → "Where did it probably originate, which vessels were relevant, and why?"

⭐ Key Features
Satellite Monitoring — Sentinel-1 SAR observations for selected maritime areas.
AI Spill Detection — classifies the observed region as oil / no-oil.
Spill Characterization — estimates area, geometry and confidence.
Hindsight Drift Analysis — uses wind/current information to backtrack the slick.
AIS Filtering — narrows regional vessel traffic using spatial-temporal overlap.
AIS Anomaly Detection — highlights suspicious gaps and movement changes.
Explainable Ranking — provides an attribution/suspicion score with reasons.
Risk Prediction — projects possible future coastal impact.
Interactive Investigation UI — map, timeline, vessel analysis and evidence views.

Prototype note: the SIH demo uses controlled scenarios/data for deterministic judging, while the satellite integration demonstrates the real Sentinel Hub acquisition path.

🔄 Core Workflow
flowchart LR
    A["1. ACQUIRE<br/>Image + Metadata"]
    B["2. PREPROCESS<br/>Calibrate + Filter"]
    C["3. DETECT<br/>AI: Oil / No-Oil"]
    D["4. CHARACTERIZE<br/>Area + Confidence"]
    E["5. HINDCAST<br/>Wind + Current"]
    F["6. CORRELATE<br/>AIS Filter + Score"]
    G["7. OUTPUT<br/>Origin + Ranking"]

    A --> B --> C --> D --> E --> F --> G
End-to-End Intelligence Flow
flowchart TD
    A["Maritime Area of Interest"] --> B["Sentinel-1 SAR"]
    B --> C["Preprocessing"]
    C --> D["Spill AI"]
    D --> E["Spill Geometry"]
    E --> F["Wind + Current Backtracking"]
    F --> G["Probable Origin Window"]
    G --> H["AIS Vessel Filtering"]
    H --> I["Anomaly Analysis"]
    I --> J["Suspect Ranking"]
    J --> K["Investigation Dashboard"]
🏗️ System Architecture
flowchart LR
    U["👤 Investigator"] --> FE["React Frontend"]

    FE --> API["FastAPI Backend"]

    API --> SH["Sentinel Hub"]
    API --> ML["PyTorch / ResNet18"]
    API --> GEO["Geo Processing"]
    API --> AIS["AIS Data"]
    API --> WC["Wind + Current Data"]

    SH --> API
    ML --> API
    GEO --> API
    AIS --> API
    WC --> API

    API --> FE
Main Layers
Layer	Responsibility
Frontend	Monitoring, investigation, maps, timelines and visual analytics
Backend	APIs, Sentinel Hub requests and processing orchestration
AI/ML	Oil-spill classification/detection
Geospatial	Spill geometry, coordinates and spatial correlation
External Data	Sentinel-1, AIS, wind and current observations
🛰️ Satellite Data Pipeline
flowchart TD
    A["Select AOI"] --> B["Sentinel Hub Catalog"]
    B --> C["Find Latest Sentinel-1"]
    C --> D["Sentinel-1 GRD"]
    D --> E["VV SAR Processing"]
    E --> F["PNG / Image Output"]
    F --> G["Frontend Monitoring"]

The backend searches the requested area for the latest compatible Sentinel-1 GRD observation and requests a processed VV image through Sentinel Hub.

Current processing uses:

Sentinel-1 GRD
IW acquisition mode
VV polarization
Orthorectification
1024 × 1024 output
PNG response
Linear-power input for the current Evalscript configuration
🤖 AI / ML Pipeline
flowchart LR
    A["SAR Image"] --> B["Preprocess"]
    B --> C["ResNet18"]
    C --> D["Oil / No-Oil"]
    D --> E["Confidence"]
    E --> F["Spill Characterization"]

The prototype uses PyTorch + ResNet18 for the spill-classification component.

The ML result is then combined with the geospatial workflow rather than being treated as the complete investigation by itself.

🌊 Spill Investigation
flowchart TD
    A["Detected Slick"] --> B["Estimate Footprint"]
    B --> C["Length / Width / Area"]
    C --> D["Wind + Current"]
    D --> E["Backward Particle Drift"]
    E --> F["Probability Origin Rings"]
    F --> G["Release Window"]

The investigation stage connects the observed spill location to a probable earlier release area.

This is important because the current slick location may differ from the original release location due to environmental transport.

🚢 AIS Correlation
flowchart LR
    A["Regional AIS Traffic"] --> B["Spatial Filter"]
    B --> C["Temporal Filter"]
    C --> D["Origin-Zone Match"]
    D --> E["Anomaly Checks"]
    E --> F["Risk / Attribution Score"]
    F --> G["Ranked Vessels"]

Example prototype funnel:

1,248 vessels
      ↓
   86 candidates
      ↓
   21 candidates
      ↓
    8 candidates
      ↓
    3 suspects

The ranking can consider:

Presence in the origin zone
Timing overlap
Course changes
Speed changes
AIS transmission gaps
Spatial-temporal consistency
⚠️ AIS Blackout Analysis
flowchart TD
    A["AIS Track"] --> B{"Transmission Gap?"}
    B -- "No" --> C["Normal Track"]
    B -- "Yes" --> D["Measure Gap"]
    D --> E["Compare with Spill Window"]
    E --> F["Compare with Origin Zone"]
    F --> G["Anomaly Evidence"]

The prototype demonstrates a case where a vessel's AIS transmission gap overlaps the suspected discharge period and origin area.

Important: an AIS gap is treated as an investigative signal, not automatic proof of illegal discharge.

🗺️ Risk Prediction
flowchart LR
    A["Current Slick"] --> B["+6h"]
    B --> C["+12h"]
    C --> D["+24h"]
    D --> E["+48h"]
    E --> F["Coastal / Sensitive Zone Risk"]

The demo can show projected impact toward sensitive coastal areas using the available wind/current scenario.

🖥️ Frontend
Main navigation
flowchart LR
    H["🏠 Home"] --> M["🛰️ Monitoring"]
    M --> I["🔎 Investigation"]

The current prototype keeps the main workflow focused on:

Home
Monitoring
Investigation

The previously planned Reports/History pages are not required for the core SIH demo workflow and can remain outside the main navigation.

🎬 SIH Demo Flow
Scenario A — Normal Patrol / No Spill
sequenceDiagram
    participant J as Judge
    participant UI as Sagar Netra
    participant SAT as Sentinel/Simulation
    participant AI as Spill AI

    J->>UI: Select maritime zone
    J->>UI: Start Monitoring
    UI->>SAT: Request observation
    SAT-->>UI: SAR pass
    UI->>AI: Analyze image
    AI-->>UI: No spill
    UI-->>J: ✓ AREA CLEAR
Demo steps
Open Monitoring.
Select a maritime zone such as West Coast Zone 1.
Start monitoring.
Use the demo control for No Spill / Clear.
Show the scan/processing sequence.
Finish on the AREA CLEAR result.
Scenario B — Spill Trace Investigation
sequenceDiagram
    participant J as Judge
    participant UI as Dashboard
    participant AI as Spill AI
    participant GEO as Drift Engine
    participant AIS as AIS Engine

    J->>UI: Trigger Spill Incident
    UI->>AI: Analyze SAR observation
    AI-->>UI: Oil Spill Detected
    UI->>GEO: Backtrack slick
    GEO-->>UI: Origin probability zone
    UI->>AIS: Filter vessel traffic
    AIS-->>UI: Ranked suspects
    UI-->>J: Investigation evidence
Recommended judging sequence
Trigger Spill Incident.
Show the SAR scan.
Show OIL SPILL DETECTED.
Enter Investigation Mode.
Show the drift/backtracking map.
Show the probability-origin zone.
Show the AIS filtering funnel.
Open the top-ranked vessel.
Show its AIS anomaly / blackout timeline.
Open Risk Prediction.
Move the timeline toward +48h.
Explain the potential coastal impact.
🛠️ Technology Stack
Category	Technology
Frontend	React 18 + Vite + TypeScript
Styling	Tailwind CSS
Icons	Lucide React
Mapping	Leaflet
Backend	Python + FastAPI
AI / ML	PyTorch + ResNet18
Satellite	Sentinel-1 SAR + Sentinel Hub
Geo Data	GeoJSON / geospatial processing
Maritime Data	AIS
Environmental Data	Wind + Current
Version Control	Git + GitHub
📁 Project Structure
SIH/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── data/
│   │   └── pages/
│   │       ├── Home.tsx
│   │       ├── LiveMonitoring.tsx
│   │       └── Investigation.tsx
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
│
├── backend/
│   ├── main.py
│   ├── ...
│   └── .env
│
├── ml/
│   └── ...
│
├── kaggle/
│   └── ...
│
├── cache/
│   └── ...
│
├── .gitignore
└── README.md

Do not commit node_modules, .env, model binaries, caches or other generated/private files.

💻 Requirements

Install:

Node.js (LTS recommended)
Python 3.10+
Git

Check installation:

node --version
npm --version
python --version
git --version
📦 Installation
1. Clone the repository
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd SIH
2. Frontend dependencies
cd frontend
npm install
3. Backend environment

Open a second terminal:

cd SIH/backend

Create a virtual environment:

Windows
python -m venv venv
venv\Scripts\activate
macOS / Linux
python3 -m venv venv
source venv/bin/activate

Install backend packages:

pip install -r requirements.txt

If the project does not contain requirements.txt, install the packages currently used by the backend, including FastAPI, Uvicorn, HTTPX and python-dotenv.

🔐 Sentinel Hub Configuration

Create:

backend/.env

Add:

SENTINEL_CLIENT_ID=your_client_id
SENTINEL_CLIENT_SECRET=your_client_secret

Keep these credentials private.

flowchart LR
    A[".env"] --> B["FastAPI Backend"]
    B --> C["OAuth Token"]
    C --> D["Sentinel Hub API"]

Never put Sentinel credentials directly inside frontend code or commit .env to GitHub.

▶️ Start the Application

The prototype normally uses two servers.

Terminal 1 — Backend
cd SIH/backend

Activate the virtual environment and run:

uvicorn main:app --reload

The backend will normally be available at:

http://127.0.0.1:8000

If your main.py exposes a different app/module path, use that existing path instead.

Terminal 2 — Frontend
cd SIH/frontend
npm run dev

Vite will normally provide:

http://localhost:5173

Open that address in the browser.

🔌 Runtime Flow
flowchart LR
    B["Browser"] --> F["React / Vite"]
    F --> A["FastAPI"]
    A --> S["Sentinel Hub"]
    A --> M["ML Model"]
    A --> G["Geo / AIS / Environment"]
    S --> A
    M --> A
    G --> A
    A --> F

For the SIH presentation, keep both frontend and backend running before starting the demo.

🧪 Before the Demo

Use this checklist:

[ ] Backend starts without errors
[ ] Frontend starts without errors
[ ] Sentinel credentials are loaded
[ ] Monitoring page opens
[ ] Map loads correctly
[ ] Scenario A works
[ ] Scenario B works
[ ] Investigation page works
[ ] AIS ranking appears
[ ] Risk prediction works
[ ] No private keys are exposed
🚀 GitHub Setup

From the project root:

git init
git add .
git commit -m "Initial Sagar Netra prototype"

Connect your GitHub repository:

git remote add origin <YOUR_GITHUB_REPOSITORY_URL>
git branch -M main
git push -u origin main

Check:

git status
git remote -v
Recommended .gitignore
node_modules/
venv/
__pycache__/
.env
*.pyc
.cache/
cache/
dist/
build/

Do not upload:

.env
Sentinel Hub secrets
node_modules/
Python virtual environment
large generated caches
private datasets
large model files unless intentionally required
⚡ Prototype vs Production

Sagar Netra is currently an SIH demonstration prototype.

Prototype
flowchart LR
    A["Real/Prototype Inputs"] --> B["Controlled Demo Scenario"]
    B --> C["Deterministic Investigation"]
    C --> D["Judge Demonstration"]
Production vision
flowchart LR
    A["Continuous Satellite Ingestion"] --> B["Automated AI Detection"]
    B --> C["Operational Drift Models"]
    C --> D["Live AIS"]
    D --> E["Alerting"]
    E --> F["Investigator Workflow"]

The prototype demonstrates the architecture and intelligence workflow without claiming that every component is already an operational national-scale surveillance system.

⚠️ Important Limitations
Sentinel observations are not continuously available for every location.
Satellite acquisition depends on satellite revisit and data availability.
AIS coverage and transmission quality vary.
Environmental drift modelling depends on the quality and resolution of wind/current inputs.
AI confidence should not be interpreted as legal proof.
A vessel ranking identifies candidates for investigation; it does not establish guilt.
Real operational deployment would require validated datasets, stronger uncertainty modelling, security controls and domain validation.
🔮 Future Scope
flowchart TD
    A["Current Prototype"]
    A --> B["More Satellite Sources"]
    A --> C["Real-Time AIS"]
    A --> D["Advanced Drift Models"]
    A --> E["Larger AI Models"]
    A --> F["Automated Alerts"]
    A --> G["National Coastal Monitoring"]
    A --> H["Investigator Collaboration"]

Potential extensions:

Multi-satellite fusion
Near-real-time ingestion
Improved oil-spill segmentation
Ensemble wind/current forecasting
Vessel behaviour anomaly models
Automated alert prioritization
Historical incident analytics
Secure evidence management
National-scale coastal monitoring
🌱 Expected Impact
Environmental
Faster spill awareness
Earlier response
Reduced spread and ecosystem damage
Better monitoring of sensitive coastal areas
Investigation
Faster identification of relevant vessels
Evidence-based prioritization
Reduced manual AIS screening
Spatial-temporal investigation support
Operational
Scalable monitoring of large offshore areas
Unified satellite, AIS and environmental information
Faster transition from detection to investigation
🏆 SIH Presentation Story

A simple way to explain Sagar Netra:

"We are not only detecting an oil spill. We are connecting the spill to its probable origin and then correlating that origin with vessel behaviour."

30-second architecture explanation
Satellite
   ↓
AI Detection
   ↓
Spill Characterization
   ↓
Drift Backtracking
   ↓
Origin Probability
   ↓
AIS Correlation
   ↓
Anomaly Detection
   ↓
Suspect Ranking
   ↓
Investigator
Key differentiation

Detection alone tells authorities WHERE the spill is.

Sagar Netra aims to help explain WHERE it likely came from and WHICH vessels deserve investigation.

🇮🇳 Why Sagar Netra?

India has a long coastline, major ports, offshore energy infrastructure and environmentally sensitive marine ecosystems.

A scalable maritime intelligence layer can help authorities combine:

Satellite + AI + Ocean Dynamics + AIS + Geospatial Intelligence

into one investigation workflow.

🛡️ Project Motto
Detect. Trace. Investigate. Protect.

Sagar Netra — Indian Maritime Intelligence Platform 🇮🇳