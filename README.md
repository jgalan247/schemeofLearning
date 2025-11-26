# Scheme of Learning Generator

An AI-powered curriculum planning tool that helps teachers create comprehensive Schemes of Learning across three planning horizons: Long-Term, Medium-Term, and Short-Term.

## Features

- **Long-Term Planning (LTP)**: Define academic year scope, curriculum goals, key themes, and assessment strategies
- **Medium-Term Planning (MTP)**: Break down the year into half-term units with specific objectives, vocabulary, and progression mapping
- **Short-Term Planning (STP)**: Detail weekly plans with learning objectives, activities, differentiation strategies, and SEN support
- **AI-Powered Generation**: Uses Google's Gemini AI to synthesize your planning into a comprehensive, coherent scheme
- **Export Functionality**: Download generated schemes as JSON for further processing or record-keeping

## Tech Stack

- **React 18** - Modern UI library
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Google Generative AI (Gemini)** - AI model for scheme generation
- **Lucide React** - Beautiful icons

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- A Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd schemeofLearning
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser to `http://localhost:5173`

### Building for Production

```bash
npm run build
npm run preview
```

## Usage Guide

### Step 1: Long-Term Plan
Define the overall scope for the academic year:
- Subject and year group
- Curriculum/specification being followed
- Overall aims and key themes
- Assessment strategy
- Cross-curricular links

### Step 2: Medium-Term Plans
Break the year into units/half-terms:
- Add multiple units (typically 6 for a full year)
- Specify duration and term position
- Define key objectives and vocabulary
- Link to prior and future learning
- Outline assessment focus

### Step 3: Short-Term Plans
Detail weekly lesson plans for each unit:
- Focus topics and learning objectives
- Success criteria
- Key activities
- **Differentiation**: Stretch & challenge, support strategies, SEN adaptations
- Resources and homework

### Step 4: Generate
- Enter your Gemini API key
- Review the planning summary
- Click "Generate Scheme of Learning"
- Download the comprehensive output as JSON

## Output Structure

The generated scheme includes:
- **Executive Summary** - Overview of the entire scheme
- **Long-Term Plan** - Rationale, year overview, key competencies
- **Medium-Term Plans** - Big ideas, knowledge/skills progression, misconceptions
- **Short-Term Plans** - Lesson sequences, differentiation, teacher notes
- **Appendices** - Vocabulary glossary, resource list, SEN provision map

## Environment Variables

Create a `.env.local` file for persistent API key storage (optional):
```
VITE_GEMINI_API_KEY=your-api-key-here
```

## License

MIT License - feel free to use and modify for educational purposes.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
