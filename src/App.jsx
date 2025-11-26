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
  GripVertical,
  ChevronUp,
  ChevronDown,
  Settings,
  Library,
  FileSpreadsheet,
} from 'lucide-react';
import { generateSchemeSpreadsheet } from './spreadsheetGenerator';
import { CONDITIONS, exportForAdaptEd } from './adaptedIntegration';
import {
  examBoards,
  keyStages,
  subjects,
  specifications,
  getSpecificationKey,
} from './examBoardSpecs';

// Initial state structure
const initialState = {
  // Long-Term Plan (Academic Year)
  longTermPlan: {
    examBoard: '',
    keyStage: '',
    subject: '',
    year: '',
    academicYear: '',
    specification: null,
    selectedTopics: [],
    overallAims: '',
    assessmentStrategy: '',
    crossCurricularLinks: '',
  },
  // Medium-Term Plans (Half-terms/Units)
  mediumTermPlans: [],
  // Short-Term Plans (Weekly/Lesson level)
  shortTermPlans: [],
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
  const [draggedTopic, setDraggedTopic] = useState(null);
  const [showAddCustomTopic, setShowAddCustomTopic] = useState(false);
  const [customTopic, setCustomTopic] = useState({ title: '', subtopics: '', suggestedWeeks: 4 });
  const [selectedConditions, setSelectedConditions] = useState([]);

  const steps = [
    { id: 1, name: 'Long-Term Plan', icon: Calendar, description: 'Specification & Topics' },
    { id: 2, name: 'Medium-Term Plans', icon: ClipboardList, description: 'Unit planning' },
    { id: 3, name: 'Short-Term Plans', icon: Clock, description: 'Weekly details' },
    { id: 4, name: 'Generate', icon: Sparkles, description: 'AI synthesis' },
  ];

  // Get available years based on key stage
  const getAvailableYears = () => {
    const ks = keyStages.find((k) => k.id === formData.longTermPlan.keyStage);
    return ks ? ks.years : [];
  };

  // Get specification based on selections
  const getSpecification = () => {
    const { examBoard, keyStage, subject } = formData.longTermPlan;
    if (!examBoard || !keyStage || !subject) return null;
    const key = getSpecificationKey(examBoard, keyStage, subject);
    return specifications[key] || null;
  };

  // Check if a specification exists for current selection
  const specificationExists = () => {
    return getSpecification() !== null;
  };

  // Handle exam board/subject selection changes
  const handleSelectionChange = (field, value) => {
    setFormData((prev) => {
      const newLTP = { ...prev.longTermPlan, [field]: value };

      // Reset dependent fields when parent changes
      if (field === 'examBoard' || field === 'keyStage' || field === 'subject') {
        newLTP.year = '';
        newLTP.selectedTopics = [];
        newLTP.specification = null;
      }

      return { ...prev, longTermPlan: newLTP };
    });
  };

  // Load topics from specification when year is selected
  const loadTopicsFromSpecification = (year) => {
    const spec = getSpecification();
    if (!spec || !spec.years[year]) return;

    const topics = spec.years[year].map((topic, index) => ({
      ...topic,
      order: index,
      isCustom: false,
      enabled: true,
    }));

    setFormData((prev) => ({
      ...prev,
      longTermPlan: {
        ...prev.longTermPlan,
        year,
        specification: spec,
        selectedTopics: topics,
      },
    }));
  };

  // Handle Long-Term Plan changes
  const handleLTPChange = useCallback((field, value) => {
    setFormData((prev) => ({
      ...prev,
      longTermPlan: { ...prev.longTermPlan, [field]: value },
    }));
  }, []);

  // Toggle topic enabled/disabled
  const toggleTopic = (topicId) => {
    setFormData((prev) => ({
      ...prev,
      longTermPlan: {
        ...prev.longTermPlan,
        selectedTopics: prev.longTermPlan.selectedTopics.map((t) =>
          t.id === topicId ? { ...t, enabled: !t.enabled } : t
        ),
      },
    }));
  };

  // Remove topic completely
  const removeTopic = (topicId) => {
    setFormData((prev) => ({
      ...prev,
      longTermPlan: {
        ...prev.longTermPlan,
        selectedTopics: prev.longTermPlan.selectedTopics.filter((t) => t.id !== topicId),
      },
    }));
  };

  // Move topic up in order
  const moveTopicUp = (index) => {
    if (index === 0) return;
    setFormData((prev) => {
      const topics = [...prev.longTermPlan.selectedTopics];
      [topics[index - 1], topics[index]] = [topics[index], topics[index - 1]];
      return {
        ...prev,
        longTermPlan: { ...prev.longTermPlan, selectedTopics: topics },
      };
    });
  };

  // Move topic down in order
  const moveTopicDown = (index) => {
    setFormData((prev) => {
      const topics = [...prev.longTermPlan.selectedTopics];
      if (index >= topics.length - 1) return prev;
      [topics[index], topics[index + 1]] = [topics[index + 1], topics[index]];
      return {
        ...prev,
        longTermPlan: { ...prev.longTermPlan, selectedTopics: topics },
      };
    });
  };

  // Drag and drop handlers
  const handleDragStart = (e, index) => {
    setDraggedTopic(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedTopic === null || draggedTopic === index) return;
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    if (draggedTopic === null || draggedTopic === dropIndex) return;

    setFormData((prev) => {
      const topics = [...prev.longTermPlan.selectedTopics];
      const [removed] = topics.splice(draggedTopic, 1);
      topics.splice(dropIndex, 0, removed);
      return {
        ...prev,
        longTermPlan: { ...prev.longTermPlan, selectedTopics: topics },
      };
    });
    setDraggedTopic(null);
  };

  const handleDragEnd = () => {
    setDraggedTopic(null);
  };

  // Add custom topic
  const addCustomTopic = () => {
    if (!customTopic.title.trim()) return;

    const newTopic = {
      id: `custom-${Date.now()}`,
      title: customTopic.title,
      subtopics: customTopic.subtopics.split('\n').filter((s) => s.trim()),
      suggestedWeeks: parseInt(customTopic.suggestedWeeks) || 4,
      isCustom: true,
      enabled: true,
    };

    setFormData((prev) => ({
      ...prev,
      longTermPlan: {
        ...prev.longTermPlan,
        selectedTopics: [...prev.longTermPlan.selectedTopics, newTopic],
      },
    }));

    setCustomTopic({ title: '', subtopics: '', suggestedWeeks: 4 });
    setShowAddCustomTopic(false);
  };

  // Update topic weeks
  const updateTopicWeeks = (topicId, weeks) => {
    setFormData((prev) => ({
      ...prev,
      longTermPlan: {
        ...prev.longTermPlan,
        selectedTopics: prev.longTermPlan.selectedTopics.map((t) =>
          t.id === topicId ? { ...t, suggestedWeeks: parseInt(weeks) || 1 } : t
        ),
      },
    }));
  };

  // Generate Medium-Term Plans from selected topics
  const generateMTPsFromTopics = () => {
    const enabledTopics = formData.longTermPlan.selectedTopics.filter((t) => t.enabled);

    const mtps = enabledTopics.map((topic, index) => ({
      id: index + 1,
      topicId: topic.id,
      unitTitle: topic.title,
      duration: `${topic.suggestedWeeks} weeks`,
      termPosition: termPositions[index % 6] || 'Autumn 1',
      keyObjectives: topic.subtopics ? topic.subtopics.join('\n') : '',
      priorLearning: '',
      futureLinks: '',
      keyVocabulary: '',
      resources: '',
      assessmentFocus: '',
    }));

    setFormData((prev) => ({
      ...prev,
      mediumTermPlans: mtps,
      shortTermPlans: [],
    }));

    setCurrentStep(2);
  };

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

  // Toggle neurodivergent condition selection
  const toggleCondition = (conditionId) => {
    setSelectedConditions(prev =>
      prev.includes(conditionId)
        ? prev.filter(c => c !== conditionId)
        : [...prev, conditionId]
    );
  };

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
  "specificationInfo": {
    "examBoard": "string",
    "qualification": "string",
    "specCode": "string"
  },
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
      "specificationLinks": ["array of spec references"],
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
    link.download = `scheme-of-learning-${formData.longTermPlan.subject}-${formData.longTermPlan.year}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Navigation
  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, 4));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  // Calculate total weeks
  const totalWeeks = formData.longTermPlan.selectedTopics
    .filter((t) => t.enabled)
    .reduce((sum, t) => sum + (t.suggestedWeeks || 0), 0);

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
          <div className="space-y-6">
            {/* Specification Selection Card */}
            <div className="card">
              <div className="flex items-center gap-3 mb-6">
                <Settings className="w-6 h-6 text-primary-600" />
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Select Specification</h2>
                  <p className="text-sm text-gray-500">
                    Choose your exam board, key stage, subject, and year to load the official topics
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Exam Board
                  </label>
                  <select
                    className="input-field"
                    value={formData.longTermPlan.examBoard}
                    onChange={(e) => handleSelectionChange('examBoard', e.target.value)}
                  >
                    <option value="">Select exam board...</option>
                    {examBoards.map((board) => (
                      <option key={board.id} value={board.id}>
                        {board.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Key Stage
                  </label>
                  <select
                    className="input-field"
                    value={formData.longTermPlan.keyStage}
                    onChange={(e) => handleSelectionChange('keyStage', e.target.value)}
                    disabled={!formData.longTermPlan.examBoard}
                  >
                    <option value="">Select key stage...</option>
                    {keyStages.map((ks) => (
                      <option key={ks.id} value={ks.id}>
                        {ks.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject
                  </label>
                  <select
                    className="input-field"
                    value={formData.longTermPlan.subject}
                    onChange={(e) => handleSelectionChange('subject', e.target.value)}
                    disabled={!formData.longTermPlan.keyStage}
                  >
                    <option value="">Select subject...</option>
                    {subjects.map((subj) => (
                      <option key={subj.id} value={subj.id}>
                        {subj.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Year
                  </label>
                  <select
                    className="input-field"
                    value={formData.longTermPlan.year}
                    onChange={(e) => loadTopicsFromSpecification(e.target.value)}
                    disabled={!formData.longTermPlan.subject || !specificationExists()}
                  >
                    <option value="">Select year...</option>
                    {getAvailableYears().map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Specification Info */}
              {formData.longTermPlan.specification && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-green-800">
                      {formData.longTermPlan.specification.name}
                    </span>
                  </div>
                  <p className="text-sm text-green-700">
                    {formData.longTermPlan.specification.assessmentInfo}
                  </p>
                </div>
              )}

              {/* Warning if spec not found */}
              {formData.longTermPlan.examBoard &&
                formData.longTermPlan.keyStage &&
                formData.longTermPlan.subject &&
                !specificationExists() && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-amber-600" />
                      <span className="text-amber-800">
                        This specification is not yet in our database. You can add topics manually below.
                      </span>
                    </div>
                  </div>
                )}

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Academic Year
                </label>
                <input
                  type="text"
                  className="input-field max-w-xs"
                  placeholder="e.g., 2024-2025"
                  value={formData.longTermPlan.academicYear}
                  onChange={(e) => handleLTPChange('academicYear', e.target.value)}
                />
              </div>
            </div>

            {/* Topics Management Card */}
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Library className="w-6 h-6 text-primary-600" />
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Topics & Chapters</h2>
                    <p className="text-sm text-gray-500">
                      Reorder, remove, or add topics. Drag to reorder or use arrows.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-sm text-gray-600">
                    Total: <span className="font-semibold">{totalWeeks} weeks</span>
                  </div>
                  <button
                    onClick={() => setShowAddCustomTopic(true)}
                    className="btn-secondary flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Custom Topic
                  </button>
                </div>
              </div>

              {/* Topics List */}
              {formData.longTermPlan.selectedTopics.length > 0 ? (
                <div className="space-y-2">
                  {formData.longTermPlan.selectedTopics.map((topic, index) => (
                    <div
                      key={topic.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDrop={(e) => handleDrop(e, index)}
                      onDragEnd={handleDragEnd}
                      className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                        topic.enabled
                          ? 'bg-white border-gray-200 hover:border-primary-300'
                          : 'bg-gray-50 border-gray-100 opacity-60'
                      } ${draggedTopic === index ? 'opacity-50 border-dashed' : ''}`}
                    >
                      {/* Drag Handle */}
                      <div className="cursor-grab text-gray-400 hover:text-gray-600">
                        <GripVertical className="w-5 h-5" />
                      </div>

                      {/* Order Arrows */}
                      <div className="flex flex-col">
                        <button
                          onClick={() => moveTopicUp(index)}
                          disabled={index === 0}
                          className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                        >
                          <ChevronUp className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => moveTopicDown(index)}
                          disabled={index === formData.longTermPlan.selectedTopics.length - 1}
                          className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                        >
                          <ChevronDown className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Topic Number */}
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-semibold text-sm">
                        {index + 1}
                      </div>

                      {/* Topic Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className={`font-medium ${topic.enabled ? 'text-gray-900' : 'text-gray-500'}`}>
                            {topic.title}
                          </h4>
                          {topic.isCustom && (
                            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
                              Custom
                            </span>
                          )}
                        </div>
                        {topic.subtopics && topic.subtopics.length > 0 && (
                          <p className="text-sm text-gray-500 truncate mt-1">
                            {topic.subtopics.slice(0, 3).join(' • ')}
                            {topic.subtopics.length > 3 && ` • +${topic.subtopics.length - 3} more`}
                          </p>
                        )}
                      </div>

                      {/* Weeks Input */}
                      <div className="flex items-center gap-2">
                        <label className="text-sm text-gray-500">Weeks:</label>
                        <input
                          type="number"
                          min="1"
                          max="20"
                          className="w-16 px-2 py-1 border border-gray-300 rounded text-center text-sm"
                          value={topic.suggestedWeeks}
                          onChange={(e) => updateTopicWeeks(topic.id, e.target.value)}
                        />
                      </div>

                      {/* Toggle Enable/Disable */}
                      <button
                        onClick={() => toggleTopic(topic.id)}
                        className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                          topic.enabled
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                        }`}
                      >
                        {topic.enabled ? 'Enabled' : 'Disabled'}
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={() => removeTopic(topic.id)}
                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg">
                  <Library className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-lg font-medium">No topics loaded</p>
                  <p className="text-sm mt-1">
                    Select a specification above to load topics, or add custom topics manually.
                  </p>
                </div>
              )}

              {/* Add Custom Topic Modal */}
              {showAddCustomTopic && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Custom Topic</h3>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Topic Title
                        </label>
                        <input
                          type="text"
                          className="input-field"
                          placeholder="e.g., Introduction to Databases"
                          value={customTopic.title}
                          onChange={(e) => setCustomTopic({ ...customTopic, title: e.target.value })}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Subtopics (one per line)
                        </label>
                        <textarea
                          className="textarea-field h-32"
                          placeholder="Entity relationships&#10;SQL queries&#10;Normalisation"
                          value={customTopic.subtopics}
                          onChange={(e) => setCustomTopic({ ...customTopic, subtopics: e.target.value })}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Suggested Weeks
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="20"
                          className="input-field w-24"
                          value={customTopic.suggestedWeeks}
                          onChange={(e) => setCustomTopic({ ...customTopic, suggestedWeeks: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                      <button
                        onClick={() => setShowAddCustomTopic(false)}
                        className="btn-secondary"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={addCustomTopic}
                        disabled={!customTopic.title.trim()}
                        className="btn-primary"
                      >
                        Add Topic
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Additional LTP Fields */}
            <div className="card">
              <div className="flex items-center gap-3 mb-6">
                <Calendar className="w-6 h-6 text-primary-600" />
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Additional Planning Details</h2>
                  <p className="text-sm text-gray-500">Optional information to enhance your scheme</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
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

                <div>
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cross-Curricular Links
                  </label>
                  <textarea
                    className="textarea-field h-20"
                    placeholder="How does this subject connect with other areas of the curriculum?"
                    value={formData.longTermPlan.crossCurricularLinks}
                    onChange={(e) => handleLTPChange('crossCurricularLinks', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Generate MTPs Button */}
            {formData.longTermPlan.selectedTopics.filter((t) => t.enabled).length > 0 && (
              <div className="flex justify-center">
                <button
                  onClick={generateMTPsFromTopics}
                  className="btn-primary flex items-center gap-2 px-8 py-3 text-lg"
                >
                  <ChevronRight className="w-5 h-5" />
                  Generate Medium-Term Plans from Topics
                </button>
              </div>
            )}
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
                      Review and enhance the unit plans generated from your topics
                    </p>
                  </div>
                </div>
                <button onClick={addMTP} className="btn-primary flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Add Unit
                </button>
              </div>
            </div>

            {formData.mediumTermPlans.length === 0 ? (
              <div className="card text-center py-12">
                <ClipboardList className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-gray-500">No medium-term plans yet.</p>
                <p className="text-sm text-gray-400 mt-1">
                  Go back to Step 1 and generate MTPs from your topics, or add units manually.
                </p>
              </div>
            ) : (
              formData.mediumTermPlans.map((mtp, index) => (
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
              ))
            )}
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

            {formData.mediumTermPlans.length === 0 ? (
              <div className="card text-center py-12">
                <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-gray-500">No medium-term plans to create weekly plans for.</p>
                <p className="text-sm text-gray-400 mt-1">
                  Go back to Step 2 and add some units first.
                </p>
              </div>
            ) : (
              formData.mediumTermPlans.map((mtp) => (
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
              ))
            )}
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
                    <p className="text-gray-500">Specification</p>
                    <p className="font-medium">
                      {formData.longTermPlan.specification?.name || 'Custom'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Year</p>
                    <p className="font-medium">{formData.longTermPlan.year || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Academic Year</p>
                    <p className="font-medium">{formData.longTermPlan.academicYear || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Topics</p>
                    <p className="font-medium">
                      {formData.longTermPlan.selectedTopics.filter((t) => t.enabled).length} enabled
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Units Planned</p>
                    <p className="font-medium">{formData.mediumTermPlans.length}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Weekly Plans</p>
                    <p className="font-medium">{formData.shortTermPlans.length}</p>
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

            {/* Neurodivergent Support Selection */}
            <div className="card">
              <div className="flex items-center gap-3 mb-4">
                <Users className="w-6 h-6 text-purple-600" />
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Neurodivergent Support (AdaptEd)</h2>
                  <p className="text-sm text-gray-500">
                    Select conditions to include specific adaptations in your scheme
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-4">
                {Object.values(CONDITIONS).map((condition) => (
                  <button
                    key={condition.id}
                    onClick={() => toggleCondition(condition.id)}
                    className={`p-3 rounded-lg border-2 transition-all text-left ${
                      selectedConditions.includes(condition.id)
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-300 bg-white'
                    }`}
                  >
                    <div
                      className="w-3 h-3 rounded-full mb-2"
                      style={{ backgroundColor: condition.color }}
                    />
                    <p className={`text-sm font-medium ${
                      selectedConditions.includes(condition.id)
                        ? 'text-purple-700'
                        : 'text-gray-700'
                    }`}>
                      {condition.name}
                    </p>
                  </button>
                ))}
              </div>

              {selectedConditions.length > 0 && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <p className="text-sm text-purple-800 font-medium mb-2">
                    Selected: {selectedConditions.map(c => CONDITIONS[c]?.name).join(', ')}
                  </p>
                  <p className="text-xs text-purple-700">
                    Adaptation strategies will be included in your spreadsheet export and an Adaptations Guide worksheet will be added.
                  </p>
                </div>
              )}

              {selectedConditions.length > 0 && (
                <div className="mt-4">
                  <button
                    onClick={() => exportForAdaptEd(formData)}
                    className="btn-secondary w-full flex items-center justify-center gap-2 py-2"
                  >
                    <Download className="w-4 h-4" />
                    Export for AdaptEd (JSON)
                  </button>
                </div>
              )}
            </div>

            {/* Export to Spreadsheet */}
            <div className="card">
              <div className="flex items-center gap-3 mb-4">
                <FileSpreadsheet className="w-6 h-6 text-green-600" />
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Export to Spreadsheet</h2>
                  <p className="text-sm text-gray-500">
                    Download your scheme as an Excel file with LTP, MTP, and STP worksheets
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h4 className="font-medium text-gray-700 mb-2">Worksheets included:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li><strong>1. LTP - Half-Term Overview:</strong> Topics distributed across the year by half-term</li>
                  <li><strong>2. MTP - Weekly Overview:</strong> Week-by-week breakdown for each unit</li>
                  <li><strong>3. STP - Lesson Plans:</strong> 5-lesson structure for each week</li>
                  {selectedConditions.length > 0 && (
                    <li><strong>4. Adaptations Guide:</strong> Neurodivergent support strategies for selected conditions</li>
                  )}
                </ul>
              </div>

              <button
                onClick={() => generateSchemeSpreadsheet(formData, generatedScheme, selectedConditions)}
                disabled={formData.longTermPlan.selectedTopics.filter(t => t.enabled).length === 0}
                className="btn-primary w-full flex items-center justify-center gap-2 py-3 bg-green-600 hover:bg-green-700"
              >
                <FileSpreadsheet className="w-5 h-5" />
                Export to Excel Spreadsheet
                {selectedConditions.length > 0 && ` (with ${selectedConditions.length} adaptations)`}
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
