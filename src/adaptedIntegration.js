/**
 * AdaptEd Integration Service
 *
 * Integrates Scheme of Learning with AdaptEd (neurodivergent) platform
 * for generating lesson adaptations for students with diverse learning needs.
 *
 * Supported conditions:
 * - Dyslexia
 * - Autism Spectrum
 * - ADHD
 * - Anxiety
 * - Dyscalculia
 * - Dyspraxia
 * - Visual Processing
 * - Auditory Processing
 * - Working Memory
 * - Processing Speed
 */

// Neurodivergent conditions and their adaptation strategies
export const CONDITIONS = {
  dyslexia: {
    id: 'dyslexia',
    name: 'Dyslexia',
    color: '#8B5CF6', // Purple
    adaptations: [
      'Use dyslexia-friendly fonts (OpenDyslexic, Comic Sans)',
      'Increase line spacing (1.5x minimum)',
      'Use cream/pastel background colors',
      'Chunk text into smaller paragraphs',
      'Provide audio alternatives for reading',
      'Use bullet points instead of dense text',
      'Highlight key vocabulary',
      'Allow extra time for reading tasks',
    ],
  },
  autism: {
    id: 'autism',
    name: 'Autism Spectrum',
    color: '#F59E0B', // Amber
    adaptations: [
      'Use literal language (avoid idioms/metaphors)',
      'Provide explicit, step-by-step instructions',
      'Include visual schedules and timers',
      'Reduce sensory overload (calm visuals)',
      'Offer advance notice of changes',
      'Provide clear success criteria',
      'Allow processing time between activities',
      'Create predictable lesson structure',
    ],
  },
  adhd: {
    id: 'adhd',
    name: 'ADHD',
    color: '#10B981', // Green
    adaptations: [
      'Break tasks into small, timed chunks (10-15 mins)',
      'Include movement breaks every 20 minutes',
      'Use fidget tools and standing options',
      'Provide visual checklists',
      'Minimize distractions in materials',
      'Use timers and countdowns',
      'Offer choice in task order',
      'Include interactive/hands-on elements',
    ],
  },
  anxiety: {
    id: 'anxiety',
    name: 'Anxiety',
    color: '#EC4899', // Pink
    adaptations: [
      'Provide clear expectations upfront',
      'Offer "safe" exit strategies',
      'Reduce time pressure where possible',
      'Break assessments into smaller parts',
      'Provide advance copies of materials',
      'Use calm, reassuring language',
      'Offer private check-ins',
      'Include mindfulness/breathing breaks',
    ],
  },
  dyscalculia: {
    id: 'dyscalculia',
    name: 'Dyscalculia',
    color: '#3B82F6', // Blue
    adaptations: [
      'Use visual representations of numbers',
      'Provide number lines and manipulatives',
      'Allow calculator use for complex calculations',
      'Use graph paper for alignment',
      'Color-code steps in procedures',
      'Relate numbers to real-world contexts',
      'Provide formula sheets',
      'Extra time for number-based tasks',
    ],
  },
  dyspraxia: {
    id: 'dyspraxia',
    name: 'Dyspraxia',
    color: '#6366F1', // Indigo
    adaptations: [
      'Provide alternatives to handwriting (typing)',
      'Use larger spaces for writing',
      'Allow extra time for physical tasks',
      'Provide printed notes instead of copying',
      'Use assistive technology',
      'Break motor tasks into steps',
      'Offer verbal responses as alternative',
      'Provide clear spatial organization',
    ],
  },
  visual_processing: {
    id: 'visual_processing',
    name: 'Visual Processing',
    color: '#14B8A6', // Teal
    adaptations: [
      'Use high contrast colors',
      'Enlarge text and images',
      'Reduce visual clutter on page',
      'Provide audio descriptions',
      'Use clear, sans-serif fonts',
      'Allow screen readers',
      'Highlight important information',
      'Use consistent layouts',
    ],
  },
  auditory_processing: {
    id: 'auditory_processing',
    name: 'Auditory Processing',
    color: '#F97316', // Orange
    adaptations: [
      'Provide written instructions alongside verbal',
      'Use visual cues and signals',
      'Reduce background noise',
      'Allow preferential seating',
      'Provide captions/subtitles for videos',
      'Check understanding frequently',
      'Use visual timers instead of verbal warnings',
      'Provide notes before discussions',
    ],
  },
  working_memory: {
    id: 'working_memory',
    name: 'Working Memory',
    color: '#EF4444', // Red
    adaptations: [
      'Provide step-by-step written instructions',
      'Use memory aids and checklists',
      'Reduce multi-step instructions',
      'Allow reference materials',
      'Teach memory strategies explicitly',
      'Repeat and rephrase key points',
      'Use visual organizers',
      'Provide scaffolded notes',
    ],
  },
  processing_speed: {
    id: 'processing_speed',
    name: 'Processing Speed',
    color: '#84CC16', // Lime
    adaptations: [
      'Allow extended time (25-50% extra)',
      'Reduce quantity of work, not quality',
      'Provide advance organizers',
      'Allow breaks during long tasks',
      'Prioritize quality over speed',
      'Use untimed practice activities',
      'Provide templates and frameworks',
      'Reduce copying requirements',
    ],
  },
};

/**
 * Generate adaptation suggestions for a lesson based on selected conditions
 */
export const generateAdaptationSuggestions = (lessonContent, conditions) => {
  const suggestions = {};

  conditions.forEach((conditionId) => {
    const condition = CONDITIONS[conditionId];
    if (condition) {
      suggestions[conditionId] = {
        name: condition.name,
        color: condition.color,
        adaptations: condition.adaptations,
        // Generate specific suggestions based on lesson content
        specificSuggestions: generateSpecificSuggestions(lessonContent, condition),
      };
    }
  });

  return suggestions;
};

/**
 * Generate specific suggestions based on lesson content and condition
 */
const generateSpecificSuggestions = (lesson, condition) => {
  const suggestions = [];

  // Activity-based suggestions
  if (lesson.keyActivities) {
    if (condition.id === 'adhd') {
      suggestions.push(`Break "${lesson.focusTopic}" activities into 10-minute segments`);
    }
    if (condition.id === 'dyslexia') {
      suggestions.push(`Provide audio recording of instructions for "${lesson.focusTopic}"`);
    }
    if (condition.id === 'autism') {
      suggestions.push(`Create visual schedule showing all steps for "${lesson.focusTopic}"`);
    }
  }

  // Assessment-based suggestions
  if (lesson.assessment) {
    if (condition.id === 'anxiety') {
      suggestions.push('Offer assessment as a take-home option or split across sessions');
    }
    if (condition.id === 'processing_speed') {
      suggestions.push('Allow 50% extra time for assessment completion');
    }
  }

  return suggestions;
};

/**
 * Format STP data for AdaptEd API consumption
 */
export const formatForAdaptEd = (formData) => {
  const { longTermPlan, mediumTermPlans, shortTermPlans } = formData;

  return {
    metadata: {
      specification: longTermPlan.specification?.name || 'Custom',
      specCode: longTermPlan.specification?.code || '',
      yearGroup: longTermPlan.year,
      academicYear: longTermPlan.academicYear,
      subject: longTermPlan.subject,
      exportDate: new Date().toISOString(),
    },
    lessons: shortTermPlans.map((stp) => {
      const mtp = mediumTermPlans.find((m) => m.id === stp.unitId);
      return {
        id: stp.id,
        unitTitle: mtp?.unitTitle || '',
        weekNumber: stp.weekNumber,
        topic: stp.focusTopic,
        objectives: stp.learningObjectives,
        successCriteria: stp.successCriteria,
        activities: stp.keyActivities,
        assessment: stp.assessment,
        resources: stp.resources,
        homework: stp.homework,
        existingDifferentiation: {
          stretch: stp.differentiation?.stretch || '',
          support: stp.differentiation?.support || '',
          sen: stp.differentiation?.senAdaptations || '',
        },
      };
    }),
    units: mediumTermPlans.map((mtp) => ({
      id: mtp.id,
      title: mtp.unitTitle,
      duration: mtp.duration,
      termPosition: mtp.termPosition,
      objectives: mtp.keyObjectives,
      vocabulary: mtp.keyVocabulary,
      assessmentFocus: mtp.assessmentFocus,
    })),
  };
};

/**
 * Export lesson data as AdaptEd-compatible JSON file
 */
export const exportForAdaptEd = (formData) => {
  const adaptedData = formatForAdaptEd(formData);
  const dataStr = JSON.stringify(adaptedData, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `adapted_lessons_${formData.longTermPlan.year?.replace(' ', '_')}_${Date.now()}.json`;
  link.click();
  URL.revokeObjectURL(url);
};

/**
 * Generate a comprehensive adaptation report for all lessons
 */
export const generateAdaptationReport = (formData, selectedConditions) => {
  const report = {
    metadata: {
      generatedAt: new Date().toISOString(),
      specification: formData.longTermPlan.specification?.name,
      yearGroup: formData.longTermPlan.year,
      conditions: selectedConditions.map((c) => CONDITIONS[c]?.name),
    },
    conditionOverview: selectedConditions.map((conditionId) => ({
      condition: CONDITIONS[conditionId]?.name,
      generalStrategies: CONDITIONS[conditionId]?.adaptations,
    })),
    lessonAdaptations: formData.shortTermPlans.map((stp) => {
      const mtp = formData.mediumTermPlans.find((m) => m.id === stp.unitId);
      return {
        unit: mtp?.unitTitle,
        week: stp.weekNumber,
        topic: stp.focusTopic,
        adaptations: generateAdaptationSuggestions(stp, selectedConditions),
      };
    }),
  };

  return report;
};

export default {
  CONDITIONS,
  generateAdaptationSuggestions,
  formatForAdaptEd,
  exportForAdaptEd,
  generateAdaptationReport,
};
