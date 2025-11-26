import { useState, useCallback } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  BookOpen,
  Calendar,
  ClipboardList,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Plus,
  Trash2,
  Download,
  Loader2,
  CheckCircle,
  AlertCircle,
  GraduationCap,
  Target,
  Users,
  Clock,
  FileText,
} from 'lucide-react';

// Initial state structure
const initialState = {
  // Long-Term Plan (Academic Year)
  longTermPlan: {
    subject: '',
    yearGroup: '',
    academicYear: '',
    curriculum: '',
    overallAims: '',
    keyThemes: '',
    assessmentStrategy: '',
    crossCurricularLinks: '',
  },
  // Medium-Term Plans (Half-terms/Units)
  mediumTermPlans: [
    {
      id: 1,
      unitTitle: '',
      duration: '6 weeks',
      termPosition: 'Autumn 1',
      keyObjectives: '',
      priorLearning: '',
      futureLinks: '',
      keyVocabulary: '',
      resources: '',
      assessmentFocus: '',
    },
  ],
  // Short-Term Plans (Weekly/Lesson level)
  shortTermPlans: [
    {
      id: 1,
      weekNumber: 1,
      unitId: 1,
      focusTopic: '',
      learningObjectives: '',
      successCriteria: '',
      keyActivities: '',
      differentiation: {
        stretch: '',
        support: '',
        senAdaptations: '',
      },
      resources: '',
      assessment: '',
      homework: '',
    },
  ],
};

// Term positions for dropdown
const termPositions = [
  'Autumn 1',
  'Autumn 2',
  'Spring 1',
  'Spring 2',
  'Summer 1',
  'Summer 2',
];

// Duration options
const durationOptions = [
  '4 weeks',
  '5 weeks',
  '6 weeks',
  '7 weeks',
  '8 weeks',
  '10 weeks',
  '12 weeks',
];

function App() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState(initialState);
  const [apiKey, setApiKey] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedScheme, setGeneratedScheme] = useState(null);
  const [error, setError] = useState(null);

  const steps = [
    { id: 1, name: 'Long-Term Plan', icon: Calendar, description: 'Academic year overview' },
    { id: 2, name: 'Medium-Term Plans', icon: ClipboardList, description: 'Unit planning' },
    { id: 3, name: 'Short-Term Plans', icon: Clock, description: 'Weekly details' },
    { id: 4, name: 'Generate', icon: Sparkles, description: 'AI synthesis' },
  ];

  // Handle Long-Term Plan changes
  const handleLTPChange = useCallback((field, value) => {
    setFormData((prev) => ({
      ...prev,
      longTermPlan: { ...prev.longTermPlan, [field]: value },
    }));
  }, []);

  // Handle Medium-Term Plan changes
  const handleMTPChange = useCallback((id, field, value) => {
    setFormData((prev) => ({
      ...prev,
      mediumTermPlans: prev.mediumTermPlans.map((mtp) =>
        mtp.id === id ? { ...mtp, [field]: value } : mtp
      ),
    }));
  }, []);

  // Add new Medium-Term Plan
  const addMTP = useCallback(() => {
    const newId = Math.max(...formData.mediumTermPlans.map((m) => m.id), 0) + 1;
    setFormData((prev) => ({
      ...prev,
      mediumTermPlans: [
        ...prev.mediumTermPlans,
        {
          id: newId,
          unitTitle: '',
          duration: '6 weeks',
          termPosition: termPositions[prev.mediumTermPlans.length % 6] || 'Autumn 1',
          keyObjectives: '',
          priorLearning: '',
          futureLinks: '',
          keyVocabulary: '',
          resources: '',
          assessmentFocus: '',
        },
      ],
    }));
  }, [formData.mediumTermPlans]);

  // Remove Medium-Term Plan
  const removeMTP = useCallback((id) => {
    setFormData((prev) => ({
      ...prev,
      mediumTermPlans: prev.mediumTermPlans.filter((mtp) => mtp.id !== id),
      shortTermPlans: prev.shortTermPlans.filter((stp) => stp.unitId !== id),
    }));
  }, []);

  // Handle Short-Term Plan changes
  const handleSTPChange = useCallback((id, field, value) => {
    setFormData((prev) => ({
      ...prev,
      shortTermPlans: prev.shortTermPlans.map((stp) =>
        stp.id === id ? { ...stp, [field]: value } : stp
      ),
    }));
  }, []);

  // Handle nested differentiation changes
  const handleDifferentiationChange = useCallback((stpId, field, value) => {
    setFormData((prev) => ({
      ...prev,
      shortTermPlans: prev.shortTermPlans.map((stp) =>
        stp.id === stpId
          ? { ...stp, differentiation: { ...stp.differentiation, [field]: value } }
          : stp
      ),
    }));
  }, []);

  // Add new Short-Term Plan
  const addSTP = useCallback((unitId) => {
    const unitSTPs = formData.shortTermPlans.filter((s) => s.unitId === unitId);
    const newWeekNumber = unitSTPs.length > 0 ? Math.max(...unitSTPs.map((s) => s.weekNumber)) + 1 : 1;
    const newId = Math.max(...formData.shortTermPlans.map((s) => s.id), 0) + 1;

    setFormData((prev) => ({
      ...prev,
      shortTermPlans: [
        ...prev.shortTermPlans,
        {
          id: newId,
          weekNumber: newWeekNumber,
          unitId,
          focusTopic: '',
          learningObjectives: '',
          successCriteria: '',
          keyActivities: '',
          differentiation: {
            stretch: '',
            support: '',
            senAdaptations: '',
          },
          resources: '',
          assessment: '',
          homework: '',
        },
      ],
    }));
  }, [formData.shortTermPlans]);

  // Remove Short-Term Plan
  const removeSTP = useCallback((id) => {
    setFormData((prev) => ({
      ...prev,
      shortTermPlans: prev.shortTermPlans.filter((stp) => stp.id !== id),
    }));
  }, []);

  // Generate Scheme of Learning using Gemini API
  const generateScheme = async () => {
    if (!apiKey) {
      setError('Please enter your Gemini API key');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const prompt = `You are an expert curriculum designer and educational consultant. Based on the following planning data, generate a comprehensive, detailed Scheme of Learning document.

INPUT DATA:
${JSON.stringify(formData, null, 2)}

Generate a structured JSON response with the following format:
{
  "schemeTitle": "string - descriptive title",
  "executiveSummary": "string - brief overview of the entire scheme",
  "longTermPlan": {
    "rationale": "string - educational rationale for the year's planning",
    "yearOverview": "string - narrative overview of the academic year",
    "keyCompetencies": ["array of key competencies students will develop"],
    "assessmentCycle": "string - description of assessment approach",
    "termBreakdown": [
      {
        "term": "string",
        "focus": "string",
        "keyOutcomes": ["array"]
      }
    ]
  },
  "mediumTermPlans": [
    {
      "unitTitle": "string",
      "term": "string",
      "duration": "string",
      "rationale": "string - why this unit at this point",
      "bigIdeas": ["array of big ideas/concepts"],
      "knowledgeProgression": "string - how knowledge builds",
      "skillsProgression": "string - how skills develop",
      "vocabulary": ["array of key vocabulary with definitions"],
      "assessmentOpportunities": [
        {
          "type": "string (formative/summative)",
          "description": "string",
          "timing": "string"
        }
      ],
      "misconceptions": ["array of common misconceptions to address"],
      "crossCurricular": ["array of links to other subjects"]
    }
  ],
  "shortTermPlans": [
    {
      "unitTitle": "string",
      "weekNumber": "number",
      "topic": "string",
      "objectives": ["array of specific learning objectives"],
      "successCriteria": ["array of measurable success criteria"],
      "lessonSequence": [
        {
          "lessonNumber": "number",
          "focus": "string",
          "activities": ["array of activities"],
          "timing": "string"
        }
      ],
      "differentiation": {
        "allStudents": "string - what all students will achieve",
        "mostStudents": "string - what most will achieve",
        "someStudents": "string - extension/stretch",
        "senSupport": "string - specific SEN adaptations",
        "ealSupport": "string - EAL considerations"
      },
      "resources": ["array of resources needed"],
      "assessment": {
        "method": "string",
        "criteria": "string"
      },
      "homework": "string",
      "teacherNotes": "string - any additional guidance"
    }
  ],
  "appendices": {
    "vocabularyGlossary": [
      {
        "term": "string",
        "definition": "string",
        "context": "string"
      }
    ],
    "resourceList": ["array of all resources mentioned"],
    "assessmentSchedule": "string - overview of all assessments",
    "senProvisionMap": "string - overview of SEN support strategies"
  }
}

Be thorough, educational, and ensure progression is clear throughout. Fill in any gaps intelligently based on UK curriculum standards and best pedagogical practice. Return ONLY valid JSON.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Parse the JSON response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsedScheme = JSON.parse(jsonMatch[0]);
        setGeneratedScheme(parsedScheme);
      } else {
        throw new Error('Failed to parse AI response');
      }
    } catch (err) {
      setError(`Generation failed: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // Download scheme as JSON
  const downloadScheme = () => {
    if (!generatedScheme) return;
    const dataStr = JSON.stringify(generatedScheme, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `scheme-of-learning-${formData.longTermPlan.subject}-${formData.longTermPlan.yearGroup}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Navigation
  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, 4));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3">
            <div className="bg-primary-600 p-2 rounded-lg">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Scheme of Learning Generator</h1>
              <p className="text-sm text-gray-500">AI-powered curriculum planning for educators</p>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <nav aria-label="Progress">
          <ol className="flex items-center justify-between">
            {steps.map((step, index) => (
              <li key={step.id} className="flex items-center">
                <button
                  onClick={() => setCurrentStep(step.id)}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                    currentStep === step.id
                      ? 'bg-primary-50 border-2 border-primary-500'
                      : currentStep > step.id
                      ? 'bg-green-50 border-2 border-green-500'
                      : 'bg-gray-50 border-2 border-gray-200'
                  }`}
                >
                  <div
                    className={`step-indicator ${
                      currentStep === step.id
                        ? 'step-active'
                        : currentStep > step.id
                        ? 'step-completed'
                        : 'step-pending'
                    }`}
                  >
                    {currentStep > step.id ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <step.icon className="w-5 h-5" />
                    )}
                  </div>
                  <div className="hidden md:block text-left">
                    <p
                      className={`text-sm font-medium ${
                        currentStep === step.id
                          ? 'text-primary-700'
                          : currentStep > step.id
                          ? 'text-green-700'
                          : 'text-gray-500'
                      }`}
                    >
                      {step.name}
                    </p>
                    <p className="text-xs text-gray-400">{step.description}</p>
                  </div>
                </button>
                {index < steps.length - 1 && (
                  <ChevronRight className="w-5 h-5 text-gray-300 mx-2 hidden sm:block" />
                )}
              </li>
            ))}
          </ol>
        </nav>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {/* Step 1: Long-Term Plan */}
        {currentStep === 1 && (
          <div className="card">
            <div className="flex items-center gap-3 mb-6">
              <Calendar className="w-6 h-6 text-primary-600" />
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Long-Term Plan</h2>
                <p className="text-sm text-gray-500">
                  Define the academic year scope, themes, and overall curriculum goals
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g., Mathematics, English, Science"
                  value={formData.longTermPlan.subject}
                  onChange={(e) => handleLTPChange('subject', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Year Group
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g., Year 7, Year 10, KS3"
                  value={formData.longTermPlan.yearGroup}
                  onChange={(e) => handleLTPChange('yearGroup', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Academic Year
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g., 2024-2025"
                  value={formData.longTermPlan.academicYear}
                  onChange={(e) => handleLTPChange('academicYear', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Curriculum/Specification
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g., AQA GCSE, National Curriculum KS3"
                  value={formData.longTermPlan.curriculum}
                  onChange={(e) => handleLTPChange('curriculum', e.target.value)}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Overall Aims for the Year
                </label>
                <textarea
                  className="textarea-field h-24"
                  placeholder="What are the overarching goals students should achieve by the end of this academic year?"
                  value={formData.longTermPlan.overallAims}
                  onChange={(e) => handleLTPChange('overallAims', e.target.value)}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Key Themes & Big Ideas
                </label>
                <textarea
                  className="textarea-field h-24"
                  placeholder="What are the central themes, concepts, or big ideas that will run through the year's learning?"
                  value={formData.longTermPlan.keyThemes}
                  onChange={(e) => handleLTPChange('keyThemes', e.target.value)}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assessment Strategy
                </label>
                <textarea
                  className="textarea-field h-24"
                  placeholder="Describe the overall approach to assessment: when will formal assessments occur? What types of assessment will be used?"
                  value={formData.longTermPlan.assessmentStrategy}
                  onChange={(e) => handleLTPChange('assessmentStrategy', e.target.value)}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cross-Curricular Links
                </label>
                <textarea
                  className="textarea-field h-20"
                  placeholder="How does this subject connect with other areas of the curriculum? What opportunities exist for cross-curricular learning?"
                  value={formData.longTermPlan.crossCurricularLinks}
                  onChange={(e) => handleLTPChange('crossCurricularLinks', e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Medium-Term Plans */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <ClipboardList className="w-6 h-6 text-primary-600" />
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Medium-Term Plans</h2>
                    <p className="text-sm text-gray-500">
                      Break down the year into half-term units with specific focus areas
                    </p>
                  </div>
                </div>
                <button onClick={addMTP} className="btn-primary flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Add Unit
                </button>
              </div>
            </div>

            {formData.mediumTermPlans.map((mtp, index) => (
              <div key={mtp.id} className="card">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Unit {index + 1}: {mtp.unitTitle || 'Untitled'}
                  </h3>
                  {formData.mediumTermPlans.length > 1 && (
                    <button
                      onClick={() => removeMTP(mtp.id)}
                      className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>

                <div className="grid md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Unit Title
                    </label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="e.g., Number Operations"
                      value={mtp.unitTitle}
                      onChange={(e) => handleMTPChange(mtp.id, 'unitTitle', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Term Position
                    </label>
                    <select
                      className="input-field"
                      value={mtp.termPosition}
                      onChange={(e) => handleMTPChange(mtp.id, 'termPosition', e.target.value)}
                    >
                      {termPositions.map((term) => (
                        <option key={term} value={term}>
                          {term}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duration
                    </label>
                    <select
                      className="input-field"
                      value={mtp.duration}
                      onChange={(e) => handleMTPChange(mtp.id, 'duration', e.target.value)}
                    >
                      {durationOptions.map((duration) => (
                        <option key={duration} value={duration}>
                          {duration}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Key Objectives
                    </label>
                    <textarea
                      className="textarea-field h-24"
                      placeholder="What will students know/understand/be able to do by the end of this unit?"
                      value={mtp.keyObjectives}
                      onChange={(e) => handleMTPChange(mtp.id, 'keyObjectives', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Prior Learning Required
                    </label>
                    <textarea
                      className="textarea-field h-24"
                      placeholder="What should students already know before starting this unit?"
                      value={mtp.priorLearning}
                      onChange={(e) => handleMTPChange(mtp.id, 'priorLearning', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Key Vocabulary
                    </label>
                    <textarea
                      className="textarea-field h-20"
                      placeholder="List key terms and vocabulary for this unit"
                      value={mtp.keyVocabulary}
                      onChange={(e) => handleMTPChange(mtp.id, 'keyVocabulary', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Assessment Focus
                    </label>
                    <textarea
                      className="textarea-field h-20"
                      placeholder="How will learning be assessed in this unit?"
                      value={mtp.assessmentFocus}
                      onChange={(e) => handleMTPChange(mtp.id, 'assessmentFocus', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Links to Future Learning
                    </label>
                    <textarea
                      className="textarea-field h-20"
                      placeholder="How does this unit connect to future topics?"
                      value={mtp.futureLinks}
                      onChange={(e) => handleMTPChange(mtp.id, 'futureLinks', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Resources Needed
                    </label>
                    <textarea
                      className="textarea-field h-20"
                      placeholder="List key resources, textbooks, materials needed"
                      value={mtp.resources}
                      onChange={(e) => handleMTPChange(mtp.id, 'resources', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Step 3: Short-Term Plans */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="card">
              <div className="flex items-center gap-3 mb-4">
                <Clock className="w-6 h-6 text-primary-600" />
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Short-Term Plans</h2>
                  <p className="text-sm text-gray-500">
                    Detail weekly plans with specific activities, differentiation, and SEN support
                  </p>
                </div>
              </div>
            </div>

            {formData.mediumTermPlans.map((mtp) => (
              <div key={mtp.id} className="space-y-4">
                <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Target className="w-5 h-5 text-primary-600" />
                      <h3 className="font-semibold text-primary-800">
                        {mtp.unitTitle || `Unit ${mtp.id}`} - {mtp.termPosition}
                      </h3>
                    </div>
                    <button
                      onClick={() => addSTP(mtp.id)}
                      className="btn-primary flex items-center gap-2 text-sm"
                    >
                      <Plus className="w-4 h-4" />
                      Add Week
                    </button>
                  </div>
                </div>

                {formData.shortTermPlans
                  .filter((stp) => stp.unitId === mtp.id)
                  .sort((a, b) => a.weekNumber - b.weekNumber)
                  .map((stp) => (
                    <div key={stp.id} className="card border-l-4 border-l-primary-500">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-500" />
                          Week {stp.weekNumber}
                        </h4>
                        <button
                          onClick={() => removeSTP(stp.id)}
                          className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Focus Topic
                          </label>
                          <input
                            type="text"
                            className="input-field"
                            placeholder="What is the main focus for this week?"
                            value={stp.focusTopic}
                            onChange={(e) => handleSTPChange(stp.id, 'focusTopic', e.target.value)}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Assessment Method
                          </label>
                          <input
                            type="text"
                            className="input-field"
                            placeholder="How will learning be checked?"
                            value={stp.assessment}
                            onChange={(e) => handleSTPChange(stp.id, 'assessment', e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Learning Objectives
                          </label>
                          <textarea
                            className="textarea-field h-24"
                            placeholder="By the end of this week, students will..."
                            value={stp.learningObjectives}
                            onChange={(e) =>
                              handleSTPChange(stp.id, 'learningObjectives', e.target.value)
                            }
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Success Criteria
                          </label>
                          <textarea
                            className="textarea-field h-24"
                            placeholder="Students can demonstrate success by..."
                            value={stp.successCriteria}
                            onChange={(e) =>
                              handleSTPChange(stp.id, 'successCriteria', e.target.value)
                            }
                          />
                        </div>
                      </div>

                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Key Activities
                        </label>
                        <textarea
                          className="textarea-field h-24"
                          placeholder="Describe the main activities and tasks for this week's lessons"
                          value={stp.keyActivities}
                          onChange={(e) => handleSTPChange(stp.id, 'keyActivities', e.target.value)}
                        />
                      </div>

                      {/* Differentiation Section */}
                      <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <h5 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          Differentiation & SEN Support
                        </h5>

                        <div className="grid md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-600 mb-2">
                              Stretch & Challenge
                            </label>
                            <textarea
                              className="textarea-field h-20 text-sm"
                              placeholder="Extension activities for higher attainers"
                              value={stp.differentiation.stretch}
                              onChange={(e) =>
                                handleDifferentiationChange(stp.id, 'stretch', e.target.value)
                              }
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-600 mb-2">
                              Support Strategies
                            </label>
                            <textarea
                              className="textarea-field h-20 text-sm"
                              placeholder="Scaffolds and support for struggling learners"
                              value={stp.differentiation.support}
                              onChange={(e) =>
                                handleDifferentiationChange(stp.id, 'support', e.target.value)
                              }
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-600 mb-2">
                              SEN Adaptations
                            </label>
                            <textarea
                              className="textarea-field h-20 text-sm"
                              placeholder="Specific adaptations for SEN students"
                              value={stp.differentiation.senAdaptations}
                              onChange={(e) =>
                                handleDifferentiationChange(stp.id, 'senAdaptations', e.target.value)
                              }
                            />
                          </div>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Resources
                          </label>
                          <input
                            type="text"
                            className="input-field"
                            placeholder="Materials, worksheets, equipment needed"
                            value={stp.resources}
                            onChange={(e) => handleSTPChange(stp.id, 'resources', e.target.value)}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Homework
                          </label>
                          <input
                            type="text"
                            className="input-field"
                            placeholder="Homework task for the week"
                            value={stp.homework}
                            onChange={(e) => handleSTPChange(stp.id, 'homework', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                {formData.shortTermPlans.filter((stp) => stp.unitId === mtp.id).length === 0 && (
                  <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                    <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No weekly plans for this unit yet.</p>
                    <button
                      onClick={() => addSTP(mtp.id)}
                      className="text-primary-600 hover:text-primary-700 font-medium mt-2"
                    >
                      Add the first week
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Step 4: Generate */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div className="card">
              <div className="flex items-center gap-3 mb-6">
                <Sparkles className="w-6 h-6 text-primary-600" />
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Generate Scheme of Learning</h2>
                  <p className="text-sm text-gray-500">
                    Use AI to synthesize your planning into a comprehensive scheme
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gemini API Key
                </label>
                <input
                  type="password"
                  className="input-field"
                  placeholder="Enter your Gemini API key"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Get your API key from{' '}
                  <a
                    href="https://makersuite.google.com/app/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 hover:underline"
                  >
                    Google AI Studio
                  </a>
                </p>
              </div>

              {/* Summary of inputs */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="font-medium text-gray-700 mb-3">Planning Summary</h3>
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Subject</p>
                    <p className="font-medium">{formData.longTermPlan.subject || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Year Group</p>
                    <p className="font-medium">{formData.longTermPlan.yearGroup || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Academic Year</p>
                    <p className="font-medium">{formData.longTermPlan.academicYear || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Units Planned</p>
                    <p className="font-medium">{formData.mediumTermPlans.length}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Weekly Plans</p>
                    <p className="font-medium">{formData.shortTermPlans.length}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Curriculum</p>
                    <p className="font-medium">{formData.longTermPlan.curriculum || 'Not specified'}</p>
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              <button
                onClick={generateScheme}
                disabled={isGenerating}
                className="btn-primary w-full flex items-center justify-center gap-2 py-3"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating your Scheme of Learning...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Generate Scheme of Learning
                  </>
                )}
              </button>
            </div>

            {/* Generated Output */}
            {generatedScheme && (
              <div className="card">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <FileText className="w-6 h-6 text-green-600" />
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">
                        {generatedScheme.schemeTitle || 'Generated Scheme of Learning'}
                      </h2>
                      <p className="text-sm text-green-600">Successfully generated!</p>
                    </div>
                  </div>
                  <button onClick={downloadScheme} className="btn-secondary flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Download JSON
                  </button>
                </div>

                {/* Executive Summary */}
                {generatedScheme.executiveSummary && (
                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-800 mb-2">Executive Summary</h3>
                    <p className="text-gray-600 bg-gray-50 p-4 rounded-lg">
                      {generatedScheme.executiveSummary}
                    </p>
                  </div>
                )}

                {/* Long-Term Plan Output */}
                {generatedScheme.longTermPlan && (
                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-primary-600" />
                      Long-Term Plan
                    </h3>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                      {generatedScheme.longTermPlan.rationale && (
                        <div>
                          <p className="text-sm font-medium text-blue-800">Rationale</p>
                          <p className="text-sm text-blue-700">{generatedScheme.longTermPlan.rationale}</p>
                        </div>
                      )}
                      {generatedScheme.longTermPlan.yearOverview && (
                        <div>
                          <p className="text-sm font-medium text-blue-800">Year Overview</p>
                          <p className="text-sm text-blue-700">{generatedScheme.longTermPlan.yearOverview}</p>
                        </div>
                      )}
                      {generatedScheme.longTermPlan.keyCompetencies && (
                        <div>
                          <p className="text-sm font-medium text-blue-800">Key Competencies</p>
                          <ul className="list-disc list-inside text-sm text-blue-700">
                            {generatedScheme.longTermPlan.keyCompetencies.map((comp, i) => (
                              <li key={i}>{comp}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Medium-Term Plans Output */}
                {generatedScheme.mediumTermPlans && generatedScheme.mediumTermPlans.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <ClipboardList className="w-5 h-5 text-primary-600" />
                      Medium-Term Plans
                    </h3>
                    <div className="space-y-4">
                      {generatedScheme.mediumTermPlans.map((mtp, index) => (
                        <div key={index} className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <h4 className="font-medium text-green-800 mb-2">
                            {mtp.unitTitle} - {mtp.term} ({mtp.duration})
                          </h4>
                          {mtp.rationale && (
                            <p className="text-sm text-green-700 mb-2">{mtp.rationale}</p>
                          )}
                          {mtp.bigIdeas && (
                            <div className="mb-2">
                              <p className="text-xs font-medium text-green-800">Big Ideas:</p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {mtp.bigIdeas.map((idea, i) => (
                                  <span
                                    key={i}
                                    className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded"
                                  >
                                    {idea}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Short-Term Plans Output */}
                {generatedScheme.shortTermPlans && generatedScheme.shortTermPlans.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <Clock className="w-5 h-5 text-primary-600" />
                      Short-Term Plans
                    </h3>
                    <div className="space-y-4">
                      {generatedScheme.shortTermPlans.map((stp, index) => (
                        <div key={index} className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                          <h4 className="font-medium text-purple-800 mb-2">
                            {stp.unitTitle} - Week {stp.weekNumber}: {stp.topic}
                          </h4>
                          {stp.objectives && (
                            <div className="mb-2">
                              <p className="text-xs font-medium text-purple-800">Objectives:</p>
                              <ul className="list-disc list-inside text-sm text-purple-700">
                                {stp.objectives.map((obj, i) => (
                                  <li key={i}>{obj}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {stp.differentiation && (
                            <div className="grid grid-cols-2 gap-2 mt-2">
                              {stp.differentiation.senSupport && (
                                <div className="bg-purple-100 rounded p-2">
                                  <p className="text-xs font-medium text-purple-800">SEN Support:</p>
                                  <p className="text-xs text-purple-700">{stp.differentiation.senSupport}</p>
                                </div>
                              )}
                              {stp.differentiation.someStudents && (
                                <div className="bg-purple-100 rounded p-2">
                                  <p className="text-xs font-medium text-purple-800">Extension:</p>
                                  <p className="text-xs text-purple-700">{stp.differentiation.someStudents}</p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Appendices */}
                {generatedScheme.appendices && (
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <GraduationCap className="w-5 h-5 text-primary-600" />
                      Appendices
                    </h3>
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      {generatedScheme.appendices.vocabularyGlossary &&
                        generatedScheme.appendices.vocabularyGlossary.length > 0 && (
                          <div className="mb-4">
                            <p className="text-sm font-medium text-gray-700 mb-2">Vocabulary Glossary</p>
                            <div className="grid gap-2">
                              {generatedScheme.appendices.vocabularyGlossary.slice(0, 10).map((item, i) => (
                                <div key={i} className="text-sm">
                                  <span className="font-medium text-gray-800">{item.term}:</span>{' '}
                                  <span className="text-gray-600">{item.definition}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      {generatedScheme.appendices.senProvisionMap && (
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-2">SEN Provision Map</p>
                          <p className="text-sm text-gray-600">{generatedScheme.appendices.senProvisionMap}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className="btn-secondary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>
          <button
            onClick={nextStep}
            disabled={currentStep === 4}
            className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-500">
          <p>Scheme of Learning Generator - Empowering educators with AI-driven curriculum planning</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
