// Exam Board Specifications Database
// OCR GCSE Computer Science (J277)

export const examBoards = [
  { id: 'ocr', name: 'OCR' },
];

export const keyStages = [
  { id: 'ks4', name: 'KS4 (GCSE)', years: ['Year 10', 'Year 11'] },
];

export const subjects = [
  { id: 'computer-science', name: 'Computer Science' },
];

// Specifications data structure
export const specifications = {
  // OCR GCSE Computer Science (J277)
  'ocr-ks4-computer-science': {
    name: 'OCR GCSE Computer Science (J277)',
    examBoard: 'OCR',
    level: 'GCSE',
    code: 'J277',
    assessmentInfo: 'Paper 1: Computer Systems (50%) | Paper 2: Computational Thinking, Algorithms and Programming (50%)',
    years: {
      'Year 10': [
        {
          id: 'ocr-j277-1.1',
          title: '1.1 Systems Architecture',
          subtopics: [
            'The purpose of the CPU - the fetch-execute cycle',
            'CPU components: ALU, CU, Cache, Registers',
            'Von Neumann architecture',
            'CPU performance: clock speed, cache size, number of cores',
            'Embedded systems and their purpose',
          ],
          suggestedWeeks: 4,
        },
        {
          id: 'ocr-j277-1.2',
          title: '1.2 Memory and Storage',
          subtopics: [
            'Primary storage: RAM and ROM',
            'Virtual memory',
            'Secondary storage: magnetic, optical, solid state',
            'Characteristics of storage: capacity, speed, portability, durability, reliability, cost',
            'Units of data storage',
            'Data storage: binary, denary, hexadecimal conversion',
            'Binary arithmetic: addition, shifts',
            'Character encoding: ASCII, Unicode',
            'Representing images: pixels, resolution, colour depth, metadata',
            'Representing sound: sample rate, bit depth, bit rate',
            'Compression: lossy and lossless',
          ],
          suggestedWeeks: 6,
        },
        {
          id: 'ocr-j277-1.3',
          title: '1.3 Computer Networks, Connections and Protocols',
          subtopics: [
            'Types of network: LAN, WAN',
            'Factors affecting network performance',
            'Client-server and peer-to-peer networks',
            'Hardware needed for a LAN: NIC, switch, router, WAP',
            'The Internet as a worldwide collection of networks',
            'Star and mesh network topologies',
            'Wired and wireless connections, their advantages and disadvantages',
            'Encryption, IP addressing (IPv4 and IPv6), MAC addressing',
            'Standards and protocols: TCP/IP, HTTP, HTTPS, FTP, POP, IMAP, SMTP',
            'The concept of layers',
          ],
          suggestedWeeks: 5,
        },
        {
          id: 'ocr-j277-1.4',
          title: '1.4 Network Security',
          subtopics: [
            'Forms of attack: malware, social engineering, brute force, denial of service, data interception, SQL injection',
            'Threats posed to networks: people, software, hardware',
            'Identifying and preventing vulnerabilities: penetration testing',
            'Prevention methods: anti-malware, firewalls, user access levels, passwords, encryption, physical security',
          ],
          suggestedWeeks: 4,
        },
        {
          id: 'ocr-j277-1.5',
          title: '1.5 Systems Software',
          subtopics: [
            'Operating systems: user interface, memory management, multitasking, peripheral management, user management, file management',
            'Utility software: encryption, defragmentation, data compression, backup',
          ],
          suggestedWeeks: 3,
        },
        {
          id: 'ocr-j277-1.6',
          title: '1.6 Ethical, Legal, Cultural and Environmental Impacts',
          subtopics: [
            'Impacts of digital technology on wider society',
            'Ethical issues: privacy, ownership, censorship, surveillance',
            'Legal issues: Data Protection Act 2018, Computer Misuse Act 1990, Copyright Designs and Patents Act 1988, Freedom of Information Act 2000',
            'Cultural issues: digital divide, changing employment patterns',
            'Environmental issues: e-waste, energy consumption, sustainability',
            'Privacy issues: collecting data, cookies, tracking',
          ],
          suggestedWeeks: 3,
        },
      ],
      'Year 11': [
        {
          id: 'ocr-j277-2.1',
          title: '2.1 Algorithms',
          subtopics: [
            'Computational thinking: abstraction, decomposition, algorithmic thinking',
            'Designing algorithms: pseudocode, flowcharts',
            'Interpreting, correcting and completing algorithms',
            'Searching algorithms: binary search, linear search',
            'Sorting algorithms: bubble sort, merge sort, insertion sort',
          ],
          suggestedWeeks: 5,
        },
        {
          id: 'ocr-j277-2.2',
          title: '2.2 Programming Fundamentals',
          subtopics: [
            'Data types: integer, real, Boolean, character, string',
            'Programming concepts: variable declaration, constant declaration, assignment, iteration, selection, subroutines (procedures and functions)',
            'Operators: arithmetic (+, -, *, /, MOD, DIV, ^), comparison (==, !=, <, <=, >, >=), Boolean (AND, OR, NOT)',
          ],
          suggestedWeeks: 5,
        },
        {
          id: 'ocr-j277-2.3',
          title: '2.3 Additional Programming Techniques',
          subtopics: [
            'String manipulation',
            'File handling: open, read, write, close',
            'Use of records to store data',
            'SQL: SELECT, FROM, WHERE, wildcard (*)',
            'Arrays (one and two dimensional)',
            'Functions and procedures with parameters',
            'Local and global variables',
            'Random number generation',
          ],
          suggestedWeeks: 6,
        },
        {
          id: 'ocr-j277-2.4',
          title: '2.4 Producing Robust Programs',
          subtopics: [
            'Defensive design: input validation, authentication, maintainability (comments, indentation)',
            'Testing: iterative, final/terminal testing',
            'Identifying syntax and logic errors',
            'Selecting and using suitable test data: normal, boundary, invalid, erroneous',
          ],
          suggestedWeeks: 3,
        },
        {
          id: 'ocr-j277-2.5',
          title: '2.5 Boolean Logic',
          subtopics: [
            'Simple logic diagrams using AND, OR, NOT gates',
            'Truth tables',
            'Combining Boolean operators using AND, OR, NOT',
          ],
          suggestedWeeks: 2,
        },
        {
          id: 'ocr-j277-2.6',
          title: '2.6 Programming Languages and Integrated Development Environments',
          subtopics: [
            'Characteristics of high-level and low-level languages',
            'Purpose of translators: interpreter, compiler, assembler',
            'IDE tools: editor, error diagnostics, run-time environment, translator',
          ],
          suggestedWeeks: 2,
        },
        {
          id: 'ocr-j277-revision',
          title: 'Revision and Exam Preparation',
          subtopics: [
            'Paper 1 past paper practice',
            'Paper 2 past paper practice',
            'Programming project practice',
            'Topic consolidation and gap analysis',
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
