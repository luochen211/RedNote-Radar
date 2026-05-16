# Hotel Video InsightHub
**Hotel Video Performance Analytics & Effectiveness Prediction System**
## 📖 Introduction
**Video-based Social Media Marketing Analysis and Effectiveness Prediction**
Video-based social media has become a transformative marketing force, dynamically reshaping consumer experiences through its multimodal nature (visual, audio, textual). This model accurately analyzes video social media content and predicts its marketing effectiveness, providing support for strategy optimization and research on consumer cognition and behavior.
The system utilizes a 5-module model to predict user engagement:
1.  **Single-modal Feature Extraction**: Processes video (VGG), audio (VGGish), and text (BERT).
2.  **Multimodal Interaction**: Models cross-modal relationships (Text-Audio, Text-Video).
3.  **Modal Adaptive Fusion**: Dynamically fuses features from different modalities.
4.  **User Attention**: Integrates visual/textual appeal and content consistency.
5.  **Engagement Prediction**: Predicts engagement scores using a Multilayer Perceptron (MLP).
## 🚀 Key Features
### 1. Home & Authentication
- Dual-language support (English/Chinese).
- System methodology and framework introduction.
- User and Administrator login portals.
### 2. Data Upload
- Support for 8 core data types:
    - Video file & Cover image
    - Title & Text content
    - Tags (Dynamic addition)
    - Hotel metrics (Followers, Subscribers, Total Likes)
### 3. Prediction Dashboard
- **Local Scope**: Engagement probability relative to the hotel's historical performance.
- **Global Scope**: Engagement probability relative to industry-leading performance across luxury-hotel social media data.
### 4. Analysis Dashboard
- **Content Quality Scores**: Video aesthetics, text readability, cover image quality/aesthetics, human voice/face presence.
- **Content Sentiment Scores**: Sentiment and arousal scores for Title, Text, and Audio.
- **Content Consistency Scores**: Consistency checks between Title-Tags, Title-Cover, Title-Video, Text-Audio, etc.
- **Oriental Aesthetics Score**:
    - **Richness**: Alignment with Taoist simplicity vs. ritualistic completeness.
    - **Harmony**: Color coordination based on traditional five-color theory.
    - **Adaption**: Color matching with geographical benchmarks.
    - **Cultural Style Similarity**: Modern, Oriental, and Western cultural alignment.
### 5. Admin Panel
- User management (View, Add, Delete).
- Data management (View, Export, Delete uploads).
- Prediction/Analysis result management.
## 🛠️ Tech Stack
- **Framework**: [Next.js](https://nextjs.org/) (React)
- **Database**: SQLite (via [Prisma ORM](https://www.prisma.io/))
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: NextAuth.js
## 🏁 Getting Started
### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn
### Installation
1.  **Clone the repository**
    ```bash
    git clone <repository-url>
    cd hotel-video-insighthub
    ```
2.  **Install dependencies**
    ```bash
    npm install
    ```
3.  **Setup Database**
    ```bash
    npx prisma generate
    npx prisma db push
    ```
4.  **Run Development Server**
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
## 🚄 Deploying to Railway
This project is ready to deploy to Railway as a Next.js app. The included
`railway.json` uses Railpack, builds with `npm run build`, syncs Prisma with
`npx prisma db push`, and starts the standalone Next.js server.

Set these Railway environment variables:
```bash
DATABASE_URL="file:/data/dev.db"
NEXTAUTH_URL="https://your-railway-domain.up.railway.app"
NEXTAUTH_SECRET="generate-a-long-random-secret"
```

Railway setup steps:
1. Create a new Railway project from this GitHub repository.
2. Add a Railway Volume mounted at `/data` if you keep SQLite.
3. Set the environment variables above. Update `NEXTAUTH_URL` after Railway gives
   you the production domain.
4. Deploy the service. Railway will use `railway.json` automatically.

For production use with multiple instances or heavier traffic, PostgreSQL is
recommended instead of SQLite.

## 📄 License
This project is private and proprietary.
