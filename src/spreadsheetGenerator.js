import * as XLSX from 'xlsx';
import { CONDITIONS } from './adaptedIntegration';

/**
 * Generate a Scheme of Learning spreadsheet with 3 worksheets:
 * 1. LTP - Long-Term Plan (half-term overview)
 * 2. MTP - Medium-Term Plan (weekly overview)
 * 3. STP - Short-Term Plan (lesson-by-lesson)
 */
export const generateSchemeSpreadsheet = (formData, generatedScheme = null, selectedConditions = []) => {
  const workbook = XLSX.utils.book_new();

  // Get specification info
  const spec = formData.longTermPlan.specification;
  const specName = spec?.name || 'Custom Scheme';
  const year = formData.longTermPlan.year || '';
  const academicYear = formData.longTermPlan.academicYear || '';

  // 1. Create LTP Worksheet (Half-term overview)
  const ltpSheet = createLTPSheet(formData, specName, year, academicYear);
  XLSX.utils.book_append_sheet(workbook, ltpSheet, 'LTP - Half Term Overview');

  // 2. Create MTP Worksheet (Weekly overview)
  const mtpSheet = createMTPSheet(formData, specName, year);
  XLSX.utils.book_append_sheet(workbook, mtpSheet, 'MTP - Weekly Overview');

  // 3. Create STP Worksheet (Lesson-by-lesson)
  const stpSheet = createSTPSheet(formData, specName, year, selectedConditions);
  XLSX.utils.book_append_sheet(workbook, stpSheet, 'STP - Lesson Plans');

  // 4. Create Adaptations Guide Worksheet (if conditions selected)
  if (selectedConditions.length > 0) {
    const adaptSheet = createAdaptationsSheet(selectedConditions);
    XLSX.utils.book_append_sheet(workbook, adaptSheet, 'Adaptations Guide');
  }

  // Generate filename
  const filename = `Scheme_of_Learning_${year.replace(' ', '_')}_${academicYear}.xlsx`;

  // Write and download
  XLSX.writeFile(workbook, filename);
};

/**
 * LTP Worksheet - Long-Term Plan showing half-term overview
 */
const createLTPSheet = (formData, specName, year, academicYear) => {
  const topics = formData.longTermPlan.selectedTopics.filter(t => t.enabled);
  const mtps = formData.mediumTermPlans;

  // Header rows
  const data = [
    ['LONG-TERM PLAN (LTP) - HALF-TERM OVERVIEW'],
    [],
    ['Specification:', specName],
    ['Year Group:', year],
    ['Academic Year:', academicYear],
    ['Total Teaching Weeks:', topics.reduce((sum, t) => sum + (t.suggestedWeeks || 0), 0)],
    [],
    ['Assessment:', formData.longTermPlan.specification?.assessmentInfo || ''],
    [],
    // Column headers
    ['Half-Term', 'Unit/Topic', 'Spec Ref', 'Duration', 'Key Content', 'Assessment Focus', 'Resources'],
  ];

  // Half-term mapping
  const halfTerms = ['Autumn 1', 'Autumn 2', 'Spring 1', 'Spring 2', 'Summer 1', 'Summer 2'];

  // Distribute topics across half-terms
  let currentHalfTerm = 0;
  let weeksInCurrentTerm = 0;
  const weeksPerHalfTerm = 6; // Approximate

  topics.forEach((topic, index) => {
    const mtp = mtps.find(m => m.topicId === topic.id) || mtps[index] || {};

    // Move to next half-term if current one is full
    if (weeksInCurrentTerm >= weeksPerHalfTerm && currentHalfTerm < halfTerms.length - 1) {
      currentHalfTerm++;
      weeksInCurrentTerm = 0;
    }

    data.push([
      halfTerms[currentHalfTerm] || `Term ${currentHalfTerm + 1}`,
      topic.title,
      topic.id,
      `${topic.suggestedWeeks} weeks`,
      (topic.subtopics || []).slice(0, 3).join('; ') + (topic.subtopics?.length > 3 ? '...' : ''),
      mtp.assessmentFocus || '',
      mtp.resources || '',
    ]);

    weeksInCurrentTerm += topic.suggestedWeeks || 0;
  });

  // Add summary section
  data.push([]);
  data.push(['YEAR OVERVIEW']);
  data.push([]);

  // Summary by half-term
  data.push(['Half-Term', 'Topics Covered', 'Total Weeks']);

  halfTerms.forEach((ht, index) => {
    const termMtps = mtps.filter(m => m.termPosition === ht);
    const termTopics = termMtps.map(m => m.unitTitle).join(', ') || '-';
    const termWeeks = termMtps.reduce((sum, m) => {
      const weeks = parseInt(m.duration) || 0;
      return sum + weeks;
    }, 0);
    data.push([ht, termTopics || '-', termWeeks || '-']);
  });

  // Create worksheet
  const ws = XLSX.utils.aoa_to_sheet(data);

  // Set column widths
  ws['!cols'] = [
    { wch: 12 },  // Half-Term
    { wch: 40 },  // Unit/Topic
    { wch: 15 },  // Spec Ref
    { wch: 10 },  // Duration
    { wch: 50 },  // Key Content
    { wch: 25 },  // Assessment Focus
    { wch: 25 },  // Resources
  ];

  return ws;
};

/**
 * MTP Worksheet - Medium-Term Plan showing weekly breakdown
 */
const createMTPSheet = (formData, specName, year) => {
  const mtps = formData.mediumTermPlans;
  const stps = formData.shortTermPlans;

  const data = [
    ['MEDIUM-TERM PLAN (MTP) - WEEKLY OVERVIEW'],
    [],
    ['Specification:', specName],
    ['Year Group:', year],
    [],
    // Column headers
    ['Unit', 'Week', 'Topic/Focus', 'Learning Objectives', 'Key Activities', 'Differentiation', 'Assessment', 'Homework'],
  ];

  mtps.forEach(mtp => {
    const unitStps = stps.filter(s => s.unitId === mtp.id).sort((a, b) => a.weekNumber - b.weekNumber);
    const durationWeeks = parseInt(mtp.duration) || 6;

    // Add unit header
    data.push([]);
    data.push([`UNIT: ${mtp.unitTitle}`, '', `Term: ${mtp.termPosition}`, `Duration: ${mtp.duration}`]);
    data.push(['Key Objectives:', mtp.keyObjectives || '']);
    data.push(['Prior Learning:', mtp.priorLearning || '']);
    data.push(['Key Vocabulary:', mtp.keyVocabulary || '']);
    data.push([]);

    // If we have STPs for this unit, use them
    if (unitStps.length > 0) {
      unitStps.forEach(stp => {
        data.push([
          mtp.unitTitle,
          `Week ${stp.weekNumber}`,
          stp.focusTopic || '',
          stp.learningObjectives || '',
          stp.keyActivities || '',
          `Stretch: ${stp.differentiation?.stretch || '-'}\nSupport: ${stp.differentiation?.support || '-'}\nSEN: ${stp.differentiation?.senAdaptations || '-'}`,
          stp.assessment || '',
          stp.homework || '',
        ]);
      });
    } else {
      // Generate placeholder weeks
      for (let week = 1; week <= durationWeeks; week++) {
        data.push([
          mtp.unitTitle,
          `Week ${week}`,
          '', // Topic/Focus
          '', // Learning Objectives
          '', // Key Activities
          '', // Differentiation
          '', // Assessment
          '', // Homework
        ]);
      }
    }
  });

  const ws = XLSX.utils.aoa_to_sheet(data);

  // Set column widths
  ws['!cols'] = [
    { wch: 30 },  // Unit
    { wch: 8 },   // Week
    { wch: 25 },  // Topic/Focus
    { wch: 40 },  // Learning Objectives
    { wch: 40 },  // Key Activities
    { wch: 35 },  // Differentiation
    { wch: 20 },  // Assessment
    { wch: 20 },  // Homework
  ];

  return ws;
};

/**
 * STP Worksheet - Short-Term Plan showing lesson-by-lesson breakdown
 */
const createSTPSheet = (formData, specName, year, selectedConditions = []) => {
  const mtps = formData.mediumTermPlans;
  const stps = formData.shortTermPlans;

  // Build column headers dynamically based on selected conditions
  const baseHeaders = [
    'Unit',
    'Week',
    'Lesson 1 - Focus',
    'Lesson 1 - Activities',
    'Lesson 2 - Focus',
    'Lesson 2 - Activities',
    'Lesson 3 - Focus',
    'Lesson 3 - Activities',
    'Lesson 4 - Focus',
    'Lesson 4 - Activities',
    'Lesson 5 - Focus',
    'Lesson 5 - Activities',
    'Weekly Assessment',
    'SEN Adaptations',
    'Resources',
  ];

  // Add adaptation columns for each selected condition
  const conditionHeaders = selectedConditions.map(condId => {
    const condition = CONDITIONS[condId];
    return condition ? `${condition.name} Adaptations` : condId;
  });

  const allHeaders = [...baseHeaders, ...conditionHeaders];

  const data = [
    ['SHORT-TERM PLAN (STP) - LESSON-BY-LESSON'],
    [],
    ['Specification:', specName],
    ['Year Group:', year],
    selectedConditions.length > 0
      ? ['Neurodivergent Support:', selectedConditions.map(c => CONDITIONS[c]?.name).join(', ')]
      : [],
    [],
    // Column headers
    allHeaders,
  ].filter(row => row.length > 0);

  mtps.forEach(mtp => {
    const unitStps = stps.filter(s => s.unitId === mtp.id).sort((a, b) => a.weekNumber - b.weekNumber);
    const durationWeeks = parseInt(mtp.duration) || 6;

    // Add unit header
    data.push([]);
    data.push([`UNIT: ${mtp.unitTitle} (${mtp.termPosition})`]);
    data.push([]);

    // If we have STPs, expand them into lessons
    if (unitStps.length > 0) {
      unitStps.forEach(stp => {
        // Parse activities into potential lessons
        const activities = (stp.keyActivities || '').split('\n').filter(a => a.trim());
        const objectives = (stp.learningObjectives || '').split('\n').filter(o => o.trim());

        const baseRow = [
          mtp.unitTitle,
          `Week ${stp.weekNumber}: ${stp.focusTopic || ''}`,
          // Lesson 1
          objectives[0] || stp.focusTopic || '',
          activities[0] || 'Starter activity / Prior knowledge check',
          // Lesson 2
          objectives[1] || objectives[0] || '',
          activities[1] || 'Main teaching input',
          // Lesson 3
          objectives[2] || objectives[0] || '',
          activities[2] || 'Practical application / Practice',
          // Lesson 4
          objectives[3] || objectives[0] || '',
          activities[3] || 'Independent work / Extension',
          // Lesson 5
          objectives[4] || 'Review and consolidation',
          activities[4] || 'Assessment / Plenary / Homework set',
          // Assessment
          stp.assessment || '',
          // SEN
          stp.differentiation?.senAdaptations || '',
          // Resources
          stp.resources || '',
        ];

        // Add adaptation columns for each selected condition
        selectedConditions.forEach(condId => {
          const condition = CONDITIONS[condId];
          if (condition) {
            // Pick 2-3 relevant adaptations for this lesson
            const relevantAdaptations = condition.adaptations.slice(0, 3).join('; ');
            baseRow.push(relevantAdaptations);
          } else {
            baseRow.push('');
          }
        });

        data.push(baseRow);
      });
    } else {
      // Generate placeholder weeks with lesson structure
      for (let week = 1; week <= durationWeeks; week++) {
        const baseRow = [
          mtp.unitTitle,
          `Week ${week}`,
          '', '', // L1
          '', '', // L2
          '', '', // L3
          '', '', // L4
          '', '', // L5
          '', // Assessment
          '', // SEN
          '', // Resources
        ];

        // Add empty adaptation columns for each selected condition
        selectedConditions.forEach(() => {
          baseRow.push('');
        });

        data.push(baseRow);
      }
    }
  });

  // Add a lesson planning template section
  data.push([]);
  data.push([]);
  data.push(['LESSON PLANNING TEMPLATE']);
  data.push([]);
  data.push(['Lesson Structure', 'Timing', 'Description']);
  data.push(['Starter', '5-10 mins', 'Hook / Prior knowledge check / Do Now activity']);
  data.push(['Main Input', '15-20 mins', 'Teacher explanation / Modelling / Direct instruction']);
  data.push(['Guided Practice', '10-15 mins', 'Worked examples / We do together']);
  data.push(['Independent Practice', '15-20 mins', 'Students work independently / Differentiated tasks']);
  data.push(['Plenary', '5-10 mins', 'Review learning / Exit ticket / Preview next lesson']);
  data.push([]);
  data.push(['Differentiation Strategies:']);
  data.push(['- Stretch & Challenge:', 'Extension tasks, harder problems, open-ended questions']);
  data.push(['- Support:', 'Scaffolds, word banks, worked examples, peer support']);
  data.push(['- SEN:', 'Modified resources, extra time, visual aids, 1:1 support']);

  const ws = XLSX.utils.aoa_to_sheet(data);

  // Set column widths - base columns plus dynamic adaptation columns
  const baseColWidths = [
    { wch: 25 },  // Unit
    { wch: 20 },  // Week
    { wch: 20 },  // L1 Focus
    { wch: 25 },  // L1 Activities
    { wch: 20 },  // L2 Focus
    { wch: 25 },  // L2 Activities
    { wch: 20 },  // L3 Focus
    { wch: 25 },  // L3 Activities
    { wch: 20 },  // L4 Focus
    { wch: 25 },  // L4 Activities
    { wch: 20 },  // L5 Focus
    { wch: 25 },  // L5 Activities
    { wch: 20 },  // Assessment
    { wch: 25 },  // SEN
    { wch: 20 },  // Resources
  ];

  // Add column widths for each adaptation column
  const adaptationColWidths = selectedConditions.map(() => ({ wch: 40 }));

  ws['!cols'] = [...baseColWidths, ...adaptationColWidths];

  return ws;
};

/**
 * Adaptations Guide Worksheet - Reference sheet for neurodivergent support strategies
 */
const createAdaptationsSheet = (selectedConditions) => {
  const data = [
    ['ADAPTATIONS GUIDE - NEURODIVERGENT SUPPORT STRATEGIES'],
    [],
    ['This guide provides evidence-based strategies for supporting students with diverse learning needs.'],
    ['Select relevant adaptations based on individual student needs and apply across lesson planning.'],
    [],
  ];

  selectedConditions.forEach(conditionId => {
    const condition = CONDITIONS[conditionId];
    if (!condition) return;

    data.push([]);
    data.push([`${condition.name.toUpperCase()}`]);
    data.push(['Strategy', 'Implementation Notes']);

    condition.adaptations.forEach((adaptation, index) => {
      data.push([
        adaptation,
        '', // Space for teacher to add implementation notes
      ]);
    });
  });

  // Add general implementation guidance
  data.push([]);
  data.push([]);
  data.push(['IMPLEMENTATION CHECKLIST']);
  data.push([]);
  data.push(['✓ Review student EHCP/IEP documentation']);
  data.push(['✓ Consult with SENCO for specific recommendations']);
  data.push(['✓ Communicate adaptations with teaching assistants']);
  data.push(['✓ Prepare differentiated resources in advance']);
  data.push(['✓ Plan for flexible groupings']);
  data.push(['✓ Build in regular check-ins with supported students']);
  data.push(['✓ Review and adjust adaptations based on student feedback']);
  data.push([]);
  data.push(['RESOURCES']);
  data.push(['- British Dyslexia Association: www.bdadyslexia.org.uk']);
  data.push(['- National Autistic Society: www.autism.org.uk']);
  data.push(['- ADHD Foundation: www.adhdfoundation.org.uk']);
  data.push(['- Anxiety UK: www.anxietyuk.org.uk']);

  const ws = XLSX.utils.aoa_to_sheet(data);

  ws['!cols'] = [
    { wch: 60 },  // Strategy
    { wch: 40 },  // Implementation Notes
  ];

  return ws;
};

export default generateSchemeSpreadsheet;
