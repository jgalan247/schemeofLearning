// Exam Board Specifications Database
// This contains the official topics/chapters from major UK exam boards

export const examBoards = [
  { id: 'aqa', name: 'AQA' },
  { id: 'edexcel', name: 'Edexcel (Pearson)' },
  { id: 'ocr', name: 'OCR' },
  { id: 'wjec', name: 'WJEC' },
  { id: 'eduqas', name: 'Eduqas' },
  { id: 'cambridge', name: 'Cambridge International' },
];

export const keyStages = [
  { id: 'ks4', name: 'KS4 (GCSE)', years: ['Year 10', 'Year 11'] },
  { id: 'ks5', name: 'KS5 (A-Level)', years: ['Year 12', 'Year 13'] },
];

export const subjects = [
  { id: 'computer-science', name: 'Computer Science' },
  { id: 'mathematics', name: 'Mathematics' },
  { id: 'physics', name: 'Physics' },
  { id: 'chemistry', name: 'Chemistry' },
  { id: 'biology', name: 'Biology' },
  { id: 'english-language', name: 'English Language' },
  { id: 'english-literature', name: 'English Literature' },
  { id: 'history', name: 'History' },
  { id: 'geography', name: 'Geography' },
  { id: 'business', name: 'Business Studies' },
];

// Specifications data structure
// Each specification has topics organized by year
export const specifications = {
  // AQA GCSE Computer Science (8525)
  'aqa-ks4-computer-science': {
    name: 'AQA GCSE Computer Science (8525)',
    examBoard: 'AQA',
    level: 'GCSE',
    code: '8525',
    assessmentInfo: 'Paper 1: Computational thinking (50%) | Paper 2: Written assessment (50%)',
    years: {
      'Year 10': [
        {
          id: 'aqa-gcse-cs-1',
          title: '3.1 Fundamentals of Algorithms',
          subtopics: [
            'Representing algorithms',
            'Efficiency of algorithms',
            'Searching algorithms (linear, binary)',
            'Sorting algorithms (bubble, merge, insertion)',
          ],
          suggestedWeeks: 6,
        },
        {
          id: 'aqa-gcse-cs-2',
          title: '3.2 Programming',
          subtopics: [
            'Data types and structures',
            'Programming concepts (sequence, selection, iteration)',
            'Arithmetic, relational and Boolean operators',
            'String handling',
            'Subroutines and structured programming',
            'File handling',
          ],
          suggestedWeeks: 10,
        },
        {
          id: 'aqa-gcse-cs-3',
          title: '3.3 Fundamentals of Data Representation',
          subtopics: [
            'Number bases (binary, hexadecimal, denary)',
            'Converting between number bases',
            'Binary arithmetic',
            'Character encoding (ASCII, Unicode)',
            'Representing images and sound',
            'Data compression',
          ],
          suggestedWeeks: 6,
        },
        {
          id: 'aqa-gcse-cs-4',
          title: '3.4 Computer Systems',
          subtopics: [
            'Hardware and software',
            'Boolean logic',
            'Software classification',
            'Systems architecture (CPU, fetch-execute cycle)',
          ],
          suggestedWeeks: 5,
        },
      ],
      'Year 11': [
        {
          id: 'aqa-gcse-cs-5',
          title: '3.5 Fundamentals of Computer Networks',
          subtopics: [
            'Network types (LAN, WAN)',
            'Network topologies',
            'Network protocols (TCP/IP, HTTP, HTTPS)',
            'Network security',
            'The Internet and how it works',
          ],
          suggestedWeeks: 5,
        },
        {
          id: 'aqa-gcse-cs-6',
          title: '3.6 Fundamentals of Cyber Security',
          subtopics: [
            'Cyber security threats',
            'Social engineering',
            'Malicious code (malware)',
            'Methods of protection',
          ],
          suggestedWeeks: 4,
        },
        {
          id: 'aqa-gcse-cs-7',
          title: '3.7 Ethical, Legal, Cultural and Environmental Impacts',
          subtopics: [
            'Ethical issues',
            'Legal issues (Data Protection Act, Computer Misuse Act)',
            'Cultural issues',
            'Environmental issues',
            'Privacy issues',
          ],
          suggestedWeeks: 3,
        },
        {
          id: 'aqa-gcse-cs-8',
          title: '3.8 Non-Exam Assessment (NEA) Preparation',
          subtopics: [
            'Programming project',
            'Analysis and design',
            'Development and testing',
            'Evaluation',
          ],
          suggestedWeeks: 8,
        },
        {
          id: 'aqa-gcse-cs-9',
          title: 'Revision and Exam Preparation',
          subtopics: [
            'Past paper practice',
            'Topic review',
            'Exam technique',
          ],
          suggestedWeeks: 6,
        },
      ],
    },
  },

  // AQA A-Level Computer Science (7516/7517)
  'aqa-ks5-computer-science': {
    name: 'AQA A-Level Computer Science (7516/7517)',
    examBoard: 'AQA',
    level: 'A-Level',
    code: '7516/7517',
    assessmentInfo: 'Paper 1: On-screen exam (40%) | Paper 2: Written exam (40%) | NEA (20%)',
    years: {
      'Year 12': [
        {
          id: 'aqa-alevel-cs-1',
          title: '4.1 Fundamentals of Programming',
          subtopics: [
            'Programming paradigms',
            'Data types and structures',
            'Object-oriented programming',
            'Exception handling',
          ],
          suggestedWeeks: 8,
        },
        {
          id: 'aqa-alevel-cs-2',
          title: '4.2 Fundamentals of Data Structures',
          subtopics: [
            'Arrays and records',
            'Queues and stacks',
            'Linked lists',
            'Trees and graphs',
            'Hash tables',
          ],
          suggestedWeeks: 6,
        },
        {
          id: 'aqa-alevel-cs-3',
          title: '4.3 Fundamentals of Algorithms',
          subtopics: [
            'Graph traversal (BFS, DFS)',
            'Tree traversal',
            'Reverse Polish Notation',
            'Searching and sorting algorithms',
            'Optimisation algorithms',
          ],
          suggestedWeeks: 6,
        },
        {
          id: 'aqa-alevel-cs-4',
          title: '4.4 Theory of Computation',
          subtopics: [
            'Abstraction and automation',
            'Regular languages and finite state machines',
            'Context-free languages',
            'Classification of algorithms',
            'Turing machine',
          ],
          suggestedWeeks: 5,
        },
        {
          id: 'aqa-alevel-cs-5',
          title: '4.5 Fundamentals of Data Representation',
          subtopics: [
            'Number systems',
            'Floating point arithmetic',
            'Bitwise manipulation',
            'Information coding systems',
          ],
          suggestedWeeks: 4,
        },
      ],
      'Year 13': [
        {
          id: 'aqa-alevel-cs-6',
          title: '4.6 Fundamentals of Computer Systems',
          subtopics: [
            'Hardware and software',
            'Classification of programming languages',
            'Types of translators',
            'Logic gates and Boolean algebra',
          ],
          suggestedWeeks: 4,
        },
        {
          id: 'aqa-alevel-cs-7',
          title: '4.7 Fundamentals of Computer Organisation and Architecture',
          subtopics: [
            'Internal hardware components',
            'The stored program concept',
            'External hardware devices',
            'Processor instruction set',
            'Assembly language',
          ],
          suggestedWeeks: 5,
        },
        {
          id: 'aqa-alevel-cs-8',
          title: '4.8 Consequences of Uses of Computing',
          subtopics: [
            'Individual, social, legal and ethical issues',
          ],
          suggestedWeeks: 2,
        },
        {
          id: 'aqa-alevel-cs-9',
          title: '4.9 Fundamentals of Communication and Networking',
          subtopics: [
            'Communication basics',
            'Network topology and protocols',
            'Client-server and peer-to-peer',
            'Internet structure',
          ],
          suggestedWeeks: 4,
        },
        {
          id: 'aqa-alevel-cs-10',
          title: '4.10 Fundamentals of Databases',
          subtopics: [
            'Relational databases',
            'Database design and normalisation',
            'SQL',
            'Client-server databases',
          ],
          suggestedWeeks: 4,
        },
        {
          id: 'aqa-alevel-cs-11',
          title: '4.11 Big Data and Functional Programming',
          subtopics: [
            'Big Data concepts',
            'Functional programming paradigm',
            'Higher-order functions',
          ],
          suggestedWeeks: 3,
        },
        {
          id: 'aqa-alevel-cs-12',
          title: 'NEA Project',
          subtopics: [
            'Analysis',
            'Documented design',
            'Technical solution',
            'Testing',
            'Evaluation',
          ],
          suggestedWeeks: 8,
        },
      ],
    },
  },

  // OCR GCSE Computer Science (J277)
  'ocr-ks4-computer-science': {
    name: 'OCR GCSE Computer Science (J277)',
    examBoard: 'OCR',
    level: 'GCSE',
    code: 'J277',
    assessmentInfo: 'Paper 1: Computer systems (50%) | Paper 2: Computational thinking (50%)',
    years: {
      'Year 10': [
        {
          id: 'ocr-gcse-cs-1',
          title: '1.1 Systems Architecture',
          subtopics: [
            'The purpose of the CPU',
            'CPU performance',
            'Embedded systems',
          ],
          suggestedWeeks: 4,
        },
        {
          id: 'ocr-gcse-cs-2',
          title: '1.2 Memory and Storage',
          subtopics: [
            'Primary storage',
            'Secondary storage',
            'Units and data capacity',
            'Data storage (numbers, characters, images, sound)',
            'Compression',
          ],
          suggestedWeeks: 5,
        },
        {
          id: 'ocr-gcse-cs-3',
          title: '1.3 Computer Networks',
          subtopics: [
            'Networks and topologies',
            'Wired and wireless networks',
            'Protocols and layers',
          ],
          suggestedWeeks: 5,
        },
        {
          id: 'ocr-gcse-cs-4',
          title: '1.4 Network Security',
          subtopics: [
            'Threats to networks',
            'Identifying and preventing vulnerabilities',
          ],
          suggestedWeeks: 3,
        },
        {
          id: 'ocr-gcse-cs-5',
          title: '1.5 Systems Software',
          subtopics: [
            'Operating systems',
            'Utility software',
          ],
          suggestedWeeks: 3,
        },
        {
          id: 'ocr-gcse-cs-6',
          title: '1.6 Ethical, Legal, Cultural and Environmental Impacts',
          subtopics: [
            'Ethical, legal, cultural and environmental impact',
            'Privacy issues',
          ],
          suggestedWeeks: 3,
        },
      ],
      'Year 11': [
        {
          id: 'ocr-gcse-cs-7',
          title: '2.1 Algorithms',
          subtopics: [
            'Computational thinking',
            'Designing algorithms',
            'Searching algorithms',
            'Sorting algorithms',
          ],
          suggestedWeeks: 6,
        },
        {
          id: 'ocr-gcse-cs-8',
          title: '2.2 Programming Fundamentals',
          subtopics: [
            'Programming concepts',
            'Data types',
            'Additional programming techniques',
          ],
          suggestedWeeks: 8,
        },
        {
          id: 'ocr-gcse-cs-9',
          title: '2.3 Producing Robust Programs',
          subtopics: [
            'Defensive design',
            'Testing',
          ],
          suggestedWeeks: 3,
        },
        {
          id: 'ocr-gcse-cs-10',
          title: '2.4 Boolean Logic',
          subtopics: [
            'Boolean logic',
            'Logic gates and truth tables',
          ],
          suggestedWeeks: 3,
        },
        {
          id: 'ocr-gcse-cs-11',
          title: '2.5 Programming Languages and IDEs',
          subtopics: [
            'Languages',
            'The Integrated Development Environment (IDE)',
          ],
          suggestedWeeks: 2,
        },
        {
          id: 'ocr-gcse-cs-12',
          title: 'Revision and Exam Preparation',
          subtopics: [
            'Past paper practice',
            'Topic consolidation',
          ],
          suggestedWeeks: 5,
        },
      ],
    },
  },

  // Edexcel GCSE Computer Science (1CP2)
  'edexcel-ks4-computer-science': {
    name: 'Edexcel GCSE Computer Science (1CP2)',
    examBoard: 'Edexcel',
    level: 'GCSE',
    code: '1CP2',
    assessmentInfo: 'Paper 1: Principles (50%) | Paper 2: Application of Principles (50%)',
    years: {
      'Year 10': [
        {
          id: 'edexcel-gcse-cs-1',
          title: 'Topic 1: Computational Thinking',
          subtopics: [
            'Algorithms',
            'Decomposition',
            'Abstraction',
            'Flowcharts and pseudocode',
          ],
          suggestedWeeks: 5,
        },
        {
          id: 'edexcel-gcse-cs-2',
          title: 'Topic 2: Data',
          subtopics: [
            'Binary and hexadecimal',
            'Data representation',
            'Data storage and compression',
            'Encryption',
          ],
          suggestedWeeks: 6,
        },
        {
          id: 'edexcel-gcse-cs-3',
          title: 'Topic 3: Computers',
          subtopics: [
            'Hardware (CPU, memory, storage)',
            'Software (OS, applications)',
            'Logic',
          ],
          suggestedWeeks: 6,
        },
        {
          id: 'edexcel-gcse-cs-4',
          title: 'Topic 4: Networks',
          subtopics: [
            'Network types and topologies',
            'Protocols',
            'The Internet',
            'Network security',
          ],
          suggestedWeeks: 5,
        },
      ],
      'Year 11': [
        {
          id: 'edexcel-gcse-cs-5',
          title: 'Topic 5: Issues and Impact',
          subtopics: [
            'Emerging trends',
            'Environmental impact',
            'Ethical, legal, cultural and privacy issues',
          ],
          suggestedWeeks: 4,
        },
        {
          id: 'edexcel-gcse-cs-6',
          title: 'Topic 6: Problem Solving',
          subtopics: [
            'Problem solving with programming',
            'Searching and sorting algorithms',
            'Programming constructs',
            'Data structures',
            'Input/output and file handling',
            'Testing and evaluation',
          ],
          suggestedWeeks: 12,
        },
        {
          id: 'edexcel-gcse-cs-7',
          title: 'Revision and Exam Preparation',
          subtopics: [
            'Past paper practice',
            'Programming challenges',
            'Topic review',
          ],
          suggestedWeeks: 6,
        },
      ],
    },
  },

  // AQA GCSE Mathematics (8300)
  'aqa-ks4-mathematics': {
    name: 'AQA GCSE Mathematics (8300)',
    examBoard: 'AQA',
    level: 'GCSE',
    code: '8300',
    assessmentInfo: 'Paper 1: Non-calculator (33.3%) | Paper 2: Calculator (33.3%) | Paper 3: Calculator (33.3%)',
    years: {
      'Year 10': [
        {
          id: 'aqa-gcse-math-1',
          title: 'Number',
          subtopics: [
            'Structure and calculation',
            'Fractions, decimals and percentages',
            'Measures and accuracy',
          ],
          suggestedWeeks: 6,
        },
        {
          id: 'aqa-gcse-math-2',
          title: 'Algebra - Foundations',
          subtopics: [
            'Notation, vocabulary and manipulation',
            'Graphs',
            'Solving equations and inequalities',
          ],
          suggestedWeeks: 8,
        },
        {
          id: 'aqa-gcse-math-3',
          title: 'Ratio, Proportion and Rates of Change',
          subtopics: [
            'Ratio',
            'Proportion',
            'Rates of change',
          ],
          suggestedWeeks: 5,
        },
        {
          id: 'aqa-gcse-math-4',
          title: 'Geometry - Properties and Constructions',
          subtopics: [
            'Properties and constructions',
            'Mensuration and calculation',
            'Vectors',
          ],
          suggestedWeeks: 7,
        },
      ],
      'Year 11': [
        {
          id: 'aqa-gcse-math-5',
          title: 'Algebra - Advanced',
          subtopics: [
            'Sequences',
            'Quadratic equations',
            'Simultaneous equations',
            'Functions and transformations',
          ],
          suggestedWeeks: 8,
        },
        {
          id: 'aqa-gcse-math-6',
          title: 'Geometry - Trigonometry and Transformations',
          subtopics: [
            'Trigonometry',
            'Transformations',
            'Circle theorems',
          ],
          suggestedWeeks: 6,
        },
        {
          id: 'aqa-gcse-math-7',
          title: 'Probability',
          subtopics: [
            'Probability fundamentals',
            'Combined events',
            'Tree diagrams',
          ],
          suggestedWeeks: 4,
        },
        {
          id: 'aqa-gcse-math-8',
          title: 'Statistics',
          subtopics: [
            'Sampling',
            'Interpreting and representing data',
            'Averages and measures of spread',
          ],
          suggestedWeeks: 4,
        },
        {
          id: 'aqa-gcse-math-9',
          title: 'Revision and Exam Preparation',
          subtopics: [
            'Past paper practice',
            'Problem solving',
            'Topic consolidation',
          ],
          suggestedWeeks: 6,
        },
      ],
    },
  },

  // Edexcel A-Level Mathematics
  'edexcel-ks5-mathematics': {
    name: 'Edexcel A-Level Mathematics (9MA0)',
    examBoard: 'Edexcel',
    level: 'A-Level',
    code: '9MA0',
    assessmentInfo: 'Paper 1: Pure Mathematics 1 (33.3%) | Paper 2: Pure Mathematics 2 (33.3%) | Paper 3: Statistics & Mechanics (33.3%)',
    years: {
      'Year 12': [
        {
          id: 'edexcel-alevel-math-1',
          title: 'Pure Mathematics: Algebra and Functions',
          subtopics: [
            'Indices and surds',
            'Quadratic functions',
            'Equations and inequalities',
            'Graphs and transformations',
          ],
          suggestedWeeks: 6,
        },
        {
          id: 'edexcel-alevel-math-2',
          title: 'Pure Mathematics: Coordinate Geometry',
          subtopics: [
            'Straight lines',
            'Circles',
          ],
          suggestedWeeks: 4,
        },
        {
          id: 'edexcel-alevel-math-3',
          title: 'Pure Mathematics: Sequences and Series',
          subtopics: [
            'Binomial expansion',
            'Sequences and series',
          ],
          suggestedWeeks: 4,
        },
        {
          id: 'edexcel-alevel-math-4',
          title: 'Pure Mathematics: Trigonometry',
          subtopics: [
            'Trigonometric ratios',
            'Trigonometric identities',
            'Trigonometric equations',
          ],
          suggestedWeeks: 5,
        },
        {
          id: 'edexcel-alevel-math-5',
          title: 'Pure Mathematics: Exponentials and Logarithms',
          subtopics: [
            'Exponential functions',
            'Logarithms',
            'Exponential growth and decay',
          ],
          suggestedWeeks: 4,
        },
        {
          id: 'edexcel-alevel-math-6',
          title: 'Pure Mathematics: Differentiation',
          subtopics: [
            'Differentiation from first principles',
            'Differentiation techniques',
            'Applications of differentiation',
          ],
          suggestedWeeks: 6,
        },
        {
          id: 'edexcel-alevel-math-7',
          title: 'Statistics: Data Collection and Representation',
          subtopics: [
            'Sampling',
            'Data presentation',
            'Measures of location and spread',
          ],
          suggestedWeeks: 3,
        },
      ],
      'Year 13': [
        {
          id: 'edexcel-alevel-math-8',
          title: 'Pure Mathematics: Integration',
          subtopics: [
            'Integration as reverse of differentiation',
            'Definite integrals',
            'Areas under curves',
            'Integration techniques',
          ],
          suggestedWeeks: 6,
        },
        {
          id: 'edexcel-alevel-math-9',
          title: 'Pure Mathematics: Numerical Methods',
          subtopics: [
            'Location of roots',
            'Iteration',
            'Numerical integration',
          ],
          suggestedWeeks: 3,
        },
        {
          id: 'edexcel-alevel-math-10',
          title: 'Pure Mathematics: Vectors',
          subtopics: [
            'Vector basics',
            '3D vectors',
            'Vector problems',
          ],
          suggestedWeeks: 4,
        },
        {
          id: 'edexcel-alevel-math-11',
          title: 'Statistics: Probability and Distributions',
          subtopics: [
            'Probability',
            'Statistical distributions',
            'Normal distribution',
          ],
          suggestedWeeks: 5,
        },
        {
          id: 'edexcel-alevel-math-12',
          title: 'Statistics: Statistical Hypothesis Testing',
          subtopics: [
            'Hypothesis testing',
            'Correlation and regression',
          ],
          suggestedWeeks: 4,
        },
        {
          id: 'edexcel-alevel-math-13',
          title: 'Mechanics: Kinematics and Forces',
          subtopics: [
            'Kinematics',
            'Forces and Newtons laws',
            'Moments',
          ],
          suggestedWeeks: 6,
        },
        {
          id: 'edexcel-alevel-math-14',
          title: 'Revision and Exam Preparation',
          subtopics: [
            'Past paper practice',
            'Mixed topic questions',
          ],
          suggestedWeeks: 6,
        },
      ],
    },
  },

  // AQA GCSE Physics (8463)
  'aqa-ks4-physics': {
    name: 'AQA GCSE Physics (8463)',
    examBoard: 'AQA',
    level: 'GCSE',
    code: '8463',
    assessmentInfo: 'Paper 1: Topics 1-4 (50%) | Paper 2: Topics 5-8 (50%)',
    years: {
      'Year 10': [
        {
          id: 'aqa-gcse-phys-1',
          title: '4.1 Energy',
          subtopics: [
            'Energy stores and systems',
            'Conservation and dissipation of energy',
            'National and global energy resources',
          ],
          suggestedWeeks: 5,
        },
        {
          id: 'aqa-gcse-phys-2',
          title: '4.2 Electricity',
          subtopics: [
            'Current, potential difference and resistance',
            'Series and parallel circuits',
            'Domestic uses and safety',
            'Energy transfers',
            'Static electricity',
          ],
          suggestedWeeks: 7,
        },
        {
          id: 'aqa-gcse-phys-3',
          title: '4.3 Particle Model of Matter',
          subtopics: [
            'Changes of state and particle model',
            'Internal energy and energy transfers',
            'Particle model and pressure',
          ],
          suggestedWeeks: 4,
        },
        {
          id: 'aqa-gcse-phys-4',
          title: '4.4 Atomic Structure',
          subtopics: [
            'Atoms and isotopes',
            'Atoms and nuclear radiation',
            'Hazards and uses of radioactive emissions',
            'Nuclear fission and fusion',
          ],
          suggestedWeeks: 5,
        },
      ],
      'Year 11': [
        {
          id: 'aqa-gcse-phys-5',
          title: '4.5 Forces',
          subtopics: [
            'Forces and their interactions',
            'Work done and energy transfer',
            'Forces and elasticity',
            'Moments, levers and gears',
            'Pressure and pressure differences in fluids',
          ],
          suggestedWeeks: 6,
        },
        {
          id: 'aqa-gcse-phys-6',
          title: '4.6 Waves',
          subtopics: [
            'Waves in air, fluids and solids',
            'Electromagnetic waves',
            'Black body radiation',
          ],
          suggestedWeeks: 5,
        },
        {
          id: 'aqa-gcse-phys-7',
          title: '4.7 Magnetism and Electromagnetism',
          subtopics: [
            'Permanent and induced magnetism',
            'The motor effect',
            'Induced potential and transformers',
          ],
          suggestedWeeks: 4,
        },
        {
          id: 'aqa-gcse-phys-8',
          title: '4.8 Space Physics (Physics only)',
          subtopics: [
            'Solar system and orbits',
            'Life cycle of a star',
            'Red-shift',
          ],
          suggestedWeeks: 3,
        },
        {
          id: 'aqa-gcse-phys-9',
          title: 'Revision and Exam Preparation',
          subtopics: [
            'Required practicals review',
            'Past paper practice',
            'Topic consolidation',
          ],
          suggestedWeeks: 5,
        },
      ],
    },
  },
};

// Helper function to get specification key
export const getSpecificationKey = (examBoard, keyStage, subject) => {
  return `${examBoard}-${keyStage}-${subject}`;
};

// Helper function to get available specifications for a combination
export const getAvailableSpecification = (examBoard, keyStage, subject) => {
  const key = getSpecificationKey(examBoard, keyStage, subject);
  return specifications[key] || null;
};

// Get list of available combinations
export const getAvailableCombinations = () => {
  return Object.keys(specifications).map(key => {
    const parts = key.split('-');
    return {
      examBoard: parts[0],
      keyStage: parts[1],
      subject: parts.slice(2).join('-'),
      specName: specifications[key].name,
    };
  });
};
