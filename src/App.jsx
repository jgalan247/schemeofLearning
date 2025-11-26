import { useState } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  BookOpen,
  Sparkles,
  Plus,
  Loader2,
  CheckCircle,
  AlertCircle,
  Target,
  Users,
  Clock,
  FileText,
  Settings,
  ChevronDown,
  ChevronUp,
  Edit3,
  RefreshCw,
} from 'lucide-react';
import { CONDITIONS } from './adaptedIntegration';
import { specifications } from './examBoardSpecs';

// Get OCR J277 spec
const ocrSpec = specifications['ocr-ks4-computer-science'];

// Flatten all topics with subtopics for selection
const getAllTopics = () => {
  const topics = [];
  ['Year 10', 'Year 11'].forEach(year => {
    if (ocrSpec?.years[year]) {
      ocrSpec.years[year].forEach(topic => {
        topic.subtopics?.forEach(subtopic => {
          topics.push({
            id: `${topic.id}-${subtopic}`,
            year,
            chapter: topic.id,
            chapterTitle: topic.title,
            subtopic,
          });
        });
      });
    }
  });
  return topics;
};

const allTopics = getAllTopics();

// Empty lesson structure
const emptyLesson = {
  topic: '',
  year: 'Year 10',
  duration: '60 minutes',
  learningObjectives: '',
  successCriteria: '',
  starter: { activity: '', duration: '10 minutes', resources: '' },
  main: [
    { activity: '', duration: '15 minutes', resources: '' },
    { activity: '', duration: '20 minutes', resources: '' },
  ],
  plenary: { activity: '', duration: '10 minutes', resources: '' },
  keyQuestions: '',
  keywords: '',
  homework: '',
  differentiation: {
    stretch: '',
    support: '',
  },
  adaptations: {},
};

function App() {
  const [apiKey, setApiKey] = useState('');
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [customTopic, setCustomTopic] = useState('');
  const [lesson, setLesson] = useState(emptyLesson);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAdapting, setIsAdapting] = useState(false);
  const [error, setError] = useState(null);
  const [selectedConditions, setSelectedConditions] = useState([]);
  const [showTopicSelector, setShowTopicSelector] = useState(true);
  const [expandedSections, setExpandedSections] = useState({
    starter: true,
    main: true,
    plenary: true,
    differentiation: true,
    adaptations: true,
  });

  // Toggle section expand/collapse
  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Toggle condition selection
  const toggleCondition = (conditionId) => {
    setSelectedConditions(prev =>
      prev.includes(conditionId)
        ? prev.filter(c => c !== conditionId)
        : [...prev, conditionId]
    );
  };

  // Update lesson field
  const updateLesson = (field, value) => {
    setLesson(prev => ({ ...prev, [field]: value }));
  };

  // Update nested lesson field (starter, plenary)
  const updateLessonSection = (section, field, value) => {
    setLesson(prev => ({
      ...prev,
      [section]: { ...prev[section], [field]: value }
    }));
  };

  // Update main activity
  const updateMainActivity = (index, field, value) => {
    setLesson(prev => ({
      ...prev,
      main: prev.main.map((activity, i) =>
        i === index ? { ...activity, [field]: value } : activity
      )
    }));
  };

  // Add main activity
  const addMainActivity = () => {
    setLesson(prev => ({
      ...prev,
      main: [...prev.main, { activity: '', duration: '15 minutes', resources: '' }]
    }));
  };

  // Remove main activity
  const removeMainActivity = (index) => {
    if (lesson.main.length > 1) {
      setLesson(prev => ({
        ...prev,
        main: prev.main.filter((_, i) => i !== index)
      }));
    }
  };

  // Generate lesson using AI
  const generateLesson = async () => {
    const topic = selectedTopic?.subtopic || customTopic;
    if (!topic) {
      setError('Please select or enter a topic');
      return;
    }
    if (!apiKey) {
      setError('Please enter your API key');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const context = selectedTopic
        ? `OCR GCSE Computer Science (J277), ${selectedTopic.year}, Chapter ${selectedTopic.chapter}: ${selectedTopic.chapterTitle}`
        : 'OCR GCSE Computer Science (J277)';

      const prompt = `You are an expert UK secondary school Computer Science teacher. Generate a detailed lesson plan for:

Topic: ${topic}
Context: ${context}
Duration: ${lesson.duration}

Return a JSON object with this exact structure:
{
  "learningObjectives": "3-4 clear objectives starting with action verbs (Understand, Explain, Apply, etc.)",
  "successCriteria": "3-4 measurable success criteria starting with 'I can...'",
  "starter": {
    "activity": "Engaging 10-minute starter activity with specific instructions",
    "duration": "10 minutes",
    "resources": "List of resources needed"
  },
  "main": [
    {
      "activity": "First main activity with detailed teacher instructions",
      "duration": "15 minutes",
      "resources": "Resources needed"
    },
    {
      "activity": "Second main activity - could be practical/hands-on",
      "duration": "20 minutes",
      "resources": "Resources needed"
    }
  ],
  "plenary": {
    "activity": "Consolidation activity to check understanding",
    "duration": "10 minutes",
    "resources": "Resources if needed"
  },
  "keyQuestions": "5-6 questions to ask during the lesson, from recall to higher-order thinking",
  "keywords": "8-10 key terms with brief definitions",
  "homework": "Appropriate homework task",
  "differentiation": {
    "stretch": "Extension activities for higher attainers",
    "support": "Scaffolding and support strategies for those who need it"
  }
}

Make the lesson engaging, practical where possible, and aligned with UK teaching standards. Return ONLY valid JSON.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const generated = JSON.parse(jsonMatch[0]);
        setLesson(prev => ({
          ...prev,
          topic,
          ...generated,
        }));
        setShowTopicSelector(false);
      } else {
        throw new Error('Failed to parse AI response');
      }
    } catch (err) {
      setError(`Generation failed: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate adaptations using AI
  const generateAdaptations = async () => {
    if (selectedConditions.length === 0) {
      setError('Please select at least one condition');
      return;
    }
    if (!apiKey) {
      setError('Please enter your API key');
      return;
    }

    setIsAdapting(true);
    setError(null);

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const conditionNames = selectedConditions.map(c => CONDITIONS[c]?.name).join(', ');

      const prompt = `You are a SENCO (Special Educational Needs Coordinator) expert. Adapt this lesson for students with: ${conditionNames}

CURRENT LESSON:
Topic: ${lesson.topic}
Learning Objectives: ${lesson.learningObjectives}
Starter: ${lesson.starter.activity}
Main Activities: ${lesson.main.map(m => m.activity).join(' | ')}
Plenary: ${lesson.plenary.activity}

For EACH condition (${conditionNames}), provide specific adaptations in this JSON format:
{
  ${selectedConditions.map(c => `"${c}": {
    "starterAdaptation": "How to adapt the starter for ${CONDITIONS[c]?.name}",
    "mainAdaptations": "How to adapt main activities",
    "plenaryAdaptation": "How to adapt the plenary",
    "resources": "Additional resources or modifications needed",
    "environmentalChanges": "Classroom setup or environmental considerations",
    "supportStrategies": "Specific support strategies"
  }`).join(',\n  ')}
}

Be specific and practical. Reference the actual lesson activities. Return ONLY valid JSON.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const adaptations = JSON.parse(jsonMatch[0]);
        setLesson(prev => ({
          ...prev,
          adaptations,
        }));
      } else {
        throw new Error('Failed to parse AI response');
      }
    } catch (err) {
      setError(`Adaptation failed: ${err.message}`);
    } finally {
      setIsAdapting(false);
    }
  };

  // Reset to start new lesson
  const resetLesson = () => {
    setLesson(emptyLesson);
    setSelectedTopic(null);
    setCustomTopic('');
    setSelectedConditions([]);
    setShowTopicSelector(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-primary-600 p-2 rounded-lg">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Lesson Planner</h1>
                <p className="text-sm text-gray-500">AI-powered lesson creation with SEN adaptations</p>
              </div>
            </div>
            {!showTopicSelector && (
              <button onClick={resetLesson} className="btn-secondary flex items-center gap-2">
                <Plus className="w-4 h-4" />
                New Lesson
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* API Key Input */}
        <div className="card mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Settings className="w-5 h-5 text-gray-600" />
            <h2 className="font-semibold text-gray-900">API Configuration</h2>
          </div>
          <input
            type="password"
            className="input-field"
            placeholder="Enter your Gemini API key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
          <p className="text-xs text-gray-500 mt-2">
            Get your API key from{' '}
            <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">
              Google AI Studio
            </a>
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Topic Selection */}
        {showTopicSelector && (
          <div className="card mb-6">
            <div className="flex items-center gap-3 mb-4">
              <Target className="w-5 h-5 text-primary-600" />
              <h2 className="font-semibold text-gray-900">Step 1: Select Topic</h2>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Choose from OCR J277 Specification
              </label>
              <select
                className="input-field"
                value={selectedTopic?.id || ''}
                onChange={(e) => {
                  const topic = allTopics.find(t => t.id === e.target.value);
                  setSelectedTopic(topic || null);
                  setCustomTopic('');
                }}
              >
                <option value="">Select a topic...</option>
                {['Year 10', 'Year 11'].map(year => (
                  <optgroup key={year} label={year}>
                    {allTopics.filter(t => t.year === year).map(topic => (
                      <option key={topic.id} value={topic.id}>
                        {topic.chapter}: {topic.subtopic}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">or enter custom topic</span>
              </div>
            </div>

            <input
              type="text"
              className="input-field"
              placeholder="Enter a custom topic (e.g., 'Introduction to Python loops')"
              value={customTopic}
              onChange={(e) => {
                setCustomTopic(e.target.value);
                setSelectedTopic(null);
              }}
            />

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lesson Duration
              </label>
              <select
                className="input-field w-48"
                value={lesson.duration}
                onChange={(e) => updateLesson('duration', e.target.value)}
              >
                <option value="45 minutes">45 minutes</option>
                <option value="50 minutes">50 minutes</option>
                <option value="60 minutes">60 minutes</option>
                <option value="90 minutes">90 minutes (double)</option>
              </select>
            </div>

            <button
              onClick={generateLesson}
              disabled={isGenerating || (!selectedTopic && !customTopic)}
              className="btn-primary w-full mt-6 flex items-center justify-center gap-2 py-3"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating Lesson...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate Lesson Plan
                </>
              )}
            </button>
          </div>
        )}

        {/* Generated Lesson - Editable */}
        {!showTopicSelector && (
          <>
            {/* Lesson Header */}
            <div className="card mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-primary-600" />
                  <h2 className="font-semibold text-gray-900">Step 2: Review & Edit Lesson</h2>
                </div>
                <button
                  onClick={generateLesson}
                  disabled={isGenerating}
                  className="btn-secondary flex items-center gap-2 text-sm"
                >
                  <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                  Regenerate
                </button>
              </div>

              <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-4">
                <h3 className="font-medium text-primary-800">{lesson.topic}</h3>
                <p className="text-sm text-primary-600">
                  {selectedTopic ? `${selectedTopic.chapterTitle} • ${selectedTopic.year}` : 'Custom Topic'}
                  {' • '}{lesson.duration}
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Learning Objectives
                  </label>
                  <textarea
                    className="textarea-field h-32"
                    value={lesson.learningObjectives}
                    onChange={(e) => updateLesson('learningObjectives', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Success Criteria
                  </label>
                  <textarea
                    className="textarea-field h-32"
                    value={lesson.successCriteria}
                    onChange={(e) => updateLesson('successCriteria', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Starter */}
            <div className="card mb-4">
              <button
                onClick={() => toggleSection('starter')}
                className="w-full flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-900">Starter</h3>
                    <p className="text-sm text-gray-500">{lesson.starter.duration}</p>
                  </div>
                </div>
                {expandedSections.starter ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>

              {expandedSections.starter && (
                <div className="mt-4 space-y-3">
                  <textarea
                    className="textarea-field h-24"
                    placeholder="Starter activity..."
                    value={lesson.starter.activity}
                    onChange={(e) => updateLessonSection('starter', 'activity', e.target.value)}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      className="input-field"
                      placeholder="Duration"
                      value={lesson.starter.duration}
                      onChange={(e) => updateLessonSection('starter', 'duration', e.target.value)}
                    />
                    <input
                      className="input-field"
                      placeholder="Resources"
                      value={lesson.starter.resources}
                      onChange={(e) => updateLessonSection('starter', 'resources', e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Main Activities */}
            <div className="card mb-4">
              <button
                onClick={() => toggleSection('main')}
                className="w-full flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center">
                    <Edit3 className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-900">Main Activities</h3>
                    <p className="text-sm text-gray-500">{lesson.main.length} activities</p>
                  </div>
                </div>
                {expandedSections.main ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>

              {expandedSections.main && (
                <div className="mt-4 space-y-4">
                  {lesson.main.map((activity, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Activity {index + 1}</span>
                        {lesson.main.length > 1 && (
                          <button
                            onClick={() => removeMainActivity(index)}
                            className="text-red-500 text-sm hover:text-red-700"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      <textarea
                        className="textarea-field h-20 mb-2"
                        placeholder="Activity description..."
                        value={activity.activity}
                        onChange={(e) => updateMainActivity(index, 'activity', e.target.value)}
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          className="input-field text-sm"
                          placeholder="Duration"
                          value={activity.duration}
                          onChange={(e) => updateMainActivity(index, 'duration', e.target.value)}
                        />
                        <input
                          className="input-field text-sm"
                          placeholder="Resources"
                          value={activity.resources}
                          onChange={(e) => updateMainActivity(index, 'resources', e.target.value)}
                        />
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={addMainActivity}
                    className="btn-secondary w-full flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Activity
                  </button>
                </div>
              )}
            </div>

            {/* Plenary */}
            <div className="card mb-4">
              <button
                onClick={() => toggleSection('plenary')}
                className="w-full flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-900">Plenary</h3>
                    <p className="text-sm text-gray-500">{lesson.plenary.duration}</p>
                  </div>
                </div>
                {expandedSections.plenary ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>

              {expandedSections.plenary && (
                <div className="mt-4 space-y-3">
                  <textarea
                    className="textarea-field h-24"
                    placeholder="Plenary activity..."
                    value={lesson.plenary.activity}
                    onChange={(e) => updateLessonSection('plenary', 'activity', e.target.value)}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      className="input-field"
                      placeholder="Duration"
                      value={lesson.plenary.duration}
                      onChange={(e) => updateLessonSection('plenary', 'duration', e.target.value)}
                    />
                    <input
                      className="input-field"
                      placeholder="Resources"
                      value={lesson.plenary.resources}
                      onChange={(e) => updateLessonSection('plenary', 'resources', e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Additional Details */}
            <div className="card mb-6">
              <h3 className="font-semibold text-gray-900 mb-4">Additional Details</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Key Questions</label>
                  <textarea
                    className="textarea-field h-24"
                    value={lesson.keyQuestions}
                    onChange={(e) => updateLesson('keyQuestions', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Keywords & Definitions</label>
                  <textarea
                    className="textarea-field h-24"
                    value={lesson.keywords}
                    onChange={(e) => updateLesson('keywords', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Homework</label>
                  <textarea
                    className="textarea-field h-20"
                    value={lesson.homework}
                    onChange={(e) => updateLesson('homework', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Differentiation</label>
                  <input
                    className="input-field mb-2"
                    placeholder="Stretch & Challenge"
                    value={lesson.differentiation.stretch}
                    onChange={(e) => setLesson(prev => ({
                      ...prev,
                      differentiation: { ...prev.differentiation, stretch: e.target.value }
                    }))}
                  />
                  <input
                    className="input-field"
                    placeholder="Support strategies"
                    value={lesson.differentiation.support}
                    onChange={(e) => setLesson(prev => ({
                      ...prev,
                      differentiation: { ...prev.differentiation, support: e.target.value }
                    }))}
                  />
                </div>
              </div>
            </div>

            {/* Step 3: Adaptations */}
            <div className="card mb-6">
              <div className="flex items-center gap-3 mb-4">
                <Users className="w-5 h-5 text-purple-600" />
                <h2 className="font-semibold text-gray-900">Step 3: Generate Adaptations</h2>
              </div>

              <p className="text-sm text-gray-600 mb-4">
                Select conditions to generate specific adaptations for this lesson
              </p>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-4">
                {Object.values(CONDITIONS).map((condition) => (
                  <button
                    key={condition.id}
                    onClick={() => toggleCondition(condition.id)}
                    className={`p-2 rounded-lg border-2 transition-all text-left text-sm ${
                      selectedConditions.includes(condition.id)
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    <div
                      className="w-2 h-2 rounded-full mb-1"
                      style={{ backgroundColor: condition.color }}
                    />
                    <span className={selectedConditions.includes(condition.id) ? 'text-purple-700' : 'text-gray-700'}>
                      {condition.name}
                    </span>
                  </button>
                ))}
              </div>

              <button
                onClick={generateAdaptations}
                disabled={isAdapting || selectedConditions.length === 0}
                className="btn-primary w-full flex items-center justify-center gap-2 py-3 bg-purple-600 hover:bg-purple-700"
              >
                {isAdapting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating Adaptations...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Generate Adaptations for {selectedConditions.length} Condition{selectedConditions.length !== 1 ? 's' : ''}
                  </>
                )}
              </button>
            </div>

            {/* Display Adaptations */}
            {Object.keys(lesson.adaptations).length > 0 && (
              <div className="card mb-6">
                <button
                  onClick={() => toggleSection('adaptations')}
                  className="w-full flex items-center justify-between mb-4"
                >
                  <h3 className="font-semibold text-gray-900">Generated Adaptations</h3>
                  {expandedSections.adaptations ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>

                {expandedSections.adaptations && (
                  <div className="space-y-4">
                    {selectedConditions.map(conditionId => {
                      const condition = CONDITIONS[conditionId];
                      const adaptation = lesson.adaptations[conditionId];
                      if (!adaptation) return null;

                      return (
                        <div
                          key={conditionId}
                          className="border-l-4 rounded-lg p-4 bg-gray-50"
                          style={{ borderColor: condition.color }}
                        >
                          <h4 className="font-medium text-gray-900 mb-3" style={{ color: condition.color }}>
                            {condition.name}
                          </h4>
                          <div className="space-y-2 text-sm">
                            {adaptation.starterAdaptation && (
                              <div>
                                <span className="font-medium text-gray-700">Starter: </span>
                                <span className="text-gray-600">{adaptation.starterAdaptation}</span>
                              </div>
                            )}
                            {adaptation.mainAdaptations && (
                              <div>
                                <span className="font-medium text-gray-700">Main: </span>
                                <span className="text-gray-600">{adaptation.mainAdaptations}</span>
                              </div>
                            )}
                            {adaptation.plenaryAdaptation && (
                              <div>
                                <span className="font-medium text-gray-700">Plenary: </span>
                                <span className="text-gray-600">{adaptation.plenaryAdaptation}</span>
                              </div>
                            )}
                            {adaptation.resources && (
                              <div>
                                <span className="font-medium text-gray-700">Resources: </span>
                                <span className="text-gray-600">{adaptation.resources}</span>
                              </div>
                            )}
                            {adaptation.environmentalChanges && (
                              <div>
                                <span className="font-medium text-gray-700">Environment: </span>
                                <span className="text-gray-600">{adaptation.environmentalChanges}</span>
                              </div>
                            )}
                            {adaptation.supportStrategies && (
                              <div>
                                <span className="font-medium text-gray-700">Support: </span>
                                <span className="text-gray-600">{adaptation.supportStrategies}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-6 mt-12">
        <div className="max-w-5xl mx-auto px-4 text-center text-sm text-gray-500">
          <p>Lesson Planner - AI-powered lesson creation with SEN adaptations</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
