export type ReadingQuestionKind =
  | "matching-headings"
  | "true-false-not-given"
  | "yes-no-not-given"
  | "multiple-choice"
  | "multiple-answer"
  | "sentence-completion"
  | "summary-completion"
  | "table-completion"
  | "form-completion"
  | "matching-information"
  | "matching-features"
  | "diagram-labelling"
  | "short-answer";

export type ReadingOption = { value: string; label: string };

export type ReadingQuestion = {
  id: string;
  number: number;
  group: string;
  kind: ReadingQuestionKind;
  prompt: string;
  instruction?: string;
  options?: ReadingOption[];
  answer: string | string[];
  acceptedAnswers?: string[];
  explanation: string;
  evidence: string;
};

export type ReadingParagraph = { label: string; text: string };

export type ReadingPassage = {
  id: string;
  title: string;
  subtitle: string;
  paragraphs: ReadingParagraph[];
  questions: ReadingQuestion[];
};

export type ReadingPracticeTest = {
  id: string;
  title: string;
  description: string;
  track: "Academic" | "General Training" | "Cambridge-style";
  level: "Beginner" | "Intermediate" | "Advanced";
  minutes: number;
  passages: ReadingPassage[];
};

export type ReadingQuestionTypeGuideId =
  | "matching-headings"
  | "multiple-choice"
  | "true-false-not-given"
  | "sentence-completion"
  | "matching-information"
  | "summary-completion";

export type ReadingQuestionTypeGuide = {
  id: ReadingQuestionTypeGuideId;
  title: string;
  description: string;
  strategy: readonly string[];
  kinds: readonly ReadingQuestionKind[];
};

export type ReadingQuestionPracticeItem = {
  test: ReadingPracticeTest;
  passage: ReadingPassage;
  question: ReadingQuestion;
};

const tfng: ReadingOption[] = [
  { value: "TRUE", label: "TRUE" },
  { value: "FALSE", label: "FALSE" },
  { value: "NOT GIVEN", label: "NOT GIVEN" },
];

const yng: ReadingOption[] = [
  { value: "YES", label: "YES" },
  { value: "NO", label: "NO" },
  { value: "NOT GIVEN", label: "NOT GIVEN" },
];

const roofGardens: ReadingPassage = {
  id: "roof-gardens",
  title: "Roof gardens and the changing city",
  subtitle: "How planted roofs can make dense cities more resilient",
  paragraphs: [
    {
      label: "A",
      text: "For centuries, city builders have treated the roof as the final layer of a building: a surface that keeps rain out and heat in. That assumption is being questioned as urban areas become hotter, denser and more vulnerable to sudden storms. A planted roof, sometimes called a living roof, replaces part of a conventional waterproof surface with a shallow system of soil, plants and drainage layers. It is not a new idea, but new materials have made it practical for many existing buildings as well as new ones.",
    },
    {
      label: "B",
      text: "The most immediate benefit is often water management. During intense rainfall, a conventional roof sends nearly all water quickly into drains. A planted roof absorbs a proportion of that water and releases it gradually. This can reduce pressure on an old drainage network at the exact moment when it is most likely to fail. The effect varies with the depth of the growing medium, the season and the type of plants, so a green roof cannot eliminate flooding on its own. It is, however, a useful part of a wider urban strategy.",
    },
    {
      label: "C",
      text: "Planting also changes the temperature around a building. Dark roof surfaces absorb solar radiation and can become extremely hot in summer. Vegetation shades the roof and cools the air as water evaporates from leaves. Inside the building, this may lower the need for air conditioning. In winter, the same layers can provide a modest amount of insulation, although designers warn that this benefit should not be exaggerated. The greatest gains are normally recorded during hot weather.",
    },
    {
      label: "D",
      text: "A successful roof garden depends on choosing plants for the conditions rather than for their appearance alone. Roofs are windy, exposed and often dry, which makes many familiar garden species unsuitable. Low-growing plants with shallow roots are commonly used because they survive periods without rain and add little weight. More ambitious schemes can support shrubs, seating areas and food growing, but these require a stronger structure, deeper soil and regular maintenance. In other words, the ecological ambition of a roof must match the building beneath it.",
    },
  ],
  questions: [
    {
      id: "q1",
      number: 1,
      group: "Questions 1-4: Matching headings",
      kind: "matching-headings",
      prompt: "Choose the best heading for paragraph A.",
      options: [
        { value: "i", label: "i. A change in the original purpose of roofs" },
        { value: "ii", label: "ii. A complete solution to urban flooding" },
        { value: "iii", label: "iii. The financial value of city centre land" },
        { value: "iv", label: "iv. The hidden danger of drainage materials" },
      ],
      answer: "i",
      explanation: "Paragraph A contrasts the traditional protective role of a roof with its newer role as a planted surface.",
      evidence: "city builders have treated the roof as the final layer of a building",
    },
    {
      id: "q2",
      number: 2,
      group: "Questions 1-4: Matching headings",
      kind: "matching-headings",
      prompt: "Choose the best heading for paragraph B.",
      options: [
        { value: "i", label: "i. A change in the original purpose of roofs" },
        { value: "ii", label: "ii. Reducing a burden on urban infrastructure" },
        { value: "iii", label: "iii. An unexpected effect on indoor lighting" },
        { value: "iv", label: "iv. A reason to replace all city parks" },
      ],
      answer: "ii",
      explanation: "The passage explains that stored rainwater reduces pressure on drainage systems during storms.",
      evidence: "reduce pressure on an old drainage network",
    },
    {
      id: "q3",
      number: 3,
      group: "Questions 1-4: Matching headings",
      kind: "matching-headings",
      prompt: "Choose the best heading for paragraph C.",
      options: [
        { value: "i", label: "i. A limitation of winter construction" },
        { value: "ii", label: "ii. The risks of using dark surfaces" },
        { value: "iii", label: "iii. A seasonal advantage of vegetation" },
        { value: "iv", label: "iv. A method for storing solar energy" },
      ],
      answer: "iii",
      explanation: "Paragraph C focuses on summer cooling and explains why the winter effect is smaller.",
      evidence: "The greatest gains are normally recorded during hot weather.",
    },
    {
      id: "q4",
      number: 4,
      group: "Questions 1-4: Matching headings",
      kind: "matching-headings",
      prompt: "Choose the best heading for paragraph D.",
      options: [
        { value: "i", label: "i. Plant choice must follow the roof's conditions" },
        { value: "ii", label: "ii. The economic value of edible plants" },
        { value: "iii", label: "iii. Why familiar species grow faster" },
        { value: "iv", label: "iv. A ban on public access to roofs" },
      ],
      answer: "i",
      explanation: "The paragraph repeatedly links suitable plants and maintenance needs to the building's physical limits.",
      evidence: "the ecological ambition of a roof must match the building beneath it",
    },
    {
      id: "q5",
      number: 5,
      group: "Questions 5-8: True / False / Not Given",
      kind: "true-false-not-given",
      prompt: "Living roofs are only possible on newly built structures.",
      options: tfng,
      answer: "FALSE",
      explanation: "Paragraph A says the materials make planted roofs practical for existing buildings too.",
      evidence: "practical for many existing buildings as well as new ones",
    },
    {
      id: "q6",
      number: 6,
      group: "Questions 5-8: True / False / Not Given",
      kind: "true-false-not-given",
      prompt: "The amount of rainwater held by a planted roof is always the same.",
      options: tfng,
      answer: "FALSE",
      explanation: "The passage explicitly says the effect varies according to several factors.",
      evidence: "The effect varies with the depth of the growing medium, the season and the type of plants",
    },
    {
      id: "q7",
      number: 7,
      group: "Questions 5-8: True / False / Not Given",
      kind: "true-false-not-given",
      prompt: "Roof gardens can completely prevent flooding in every city.",
      options: tfng,
      answer: "FALSE",
      explanation: "The writer clearly limits the claim: a green roof cannot eliminate flooding by itself.",
      evidence: "cannot eliminate flooding on its own",
    },
    {
      id: "q8",
      number: 8,
      group: "Questions 5-8: True / False / Not Given",
      kind: "true-false-not-given",
      prompt: "The passage states the exact average reduction in a building's air-conditioning costs.",
      options: tfng,
      answer: "NOT GIVEN",
      explanation: "The passage says cooling needs may be lower but gives no number or average cost reduction.",
      evidence: "this may lower the need for air conditioning",
    },
    {
      id: "q9",
      number: 9,
      group: "Questions 9-13: Note completion",
      kind: "table-completion",
      prompt: "Complete the note. A planted roof contains soil, plants and ______ layers.",
      instruction: "Write ONE WORD ONLY.",
      answer: "drainage",
      acceptedAnswers: ["drainage"],
      explanation: "This list appears in paragraph A.",
      evidence: "soil, plants and drainage layers",
    },
    {
      id: "q10",
      number: 10,
      group: "Questions 9-13: Note completion",
      kind: "table-completion",
      prompt: "Complete the note. Water is released more ______ than on a conventional roof.",
      instruction: "Write ONE WORD ONLY.",
      answer: "gradually",
      acceptedAnswers: ["gradually"],
      explanation: "Paragraph B describes the slower release of retained rainwater.",
      evidence: "releases it gradually",
    },
    {
      id: "q11",
      number: 11,
      group: "Questions 9-13: Note completion",
      kind: "table-completion",
      prompt: "Complete the note. Vegetation cools air when water ______ from leaves.",
      instruction: "Write ONE WORD ONLY.",
      answer: "evaporates",
      acceptedAnswers: ["evaporates"],
      explanation: "The mechanism is named directly in paragraph C.",
      evidence: "water evaporates from leaves",
    },
    {
      id: "q12",
      number: 12,
      group: "Questions 9-13: Note completion",
      kind: "table-completion",
      prompt: "Complete the note. Low-growing plants add little ______ to a roof.",
      instruction: "Write ONE WORD ONLY.",
      answer: "weight",
      acceptedAnswers: ["weight"],
      explanation: "The reason for choosing these plants is stated in paragraph D.",
      evidence: "add little weight",
    },
    {
      id: "q13",
      number: 13,
      group: "Questions 9-13: Note completion",
      kind: "table-completion",
      prompt: "Complete the note. Larger roof gardens need regular ______.",
      instruction: "Write ONE WORD ONLY.",
      answer: "maintenance",
      acceptedAnswers: ["maintenance"],
      explanation: "More complex garden schemes require ongoing care.",
      evidence: "regular maintenance",
    },
  ],
};

const aerofoil: ReadingPassage = {
  id: "aerofoil-research",
  title: "The shape of lift",
  subtitle: "Why aerofoil research still matters beyond aviation",
  paragraphs: [
    {
      label: "A",
      text: "An aerofoil is a surface shaped to move efficiently through air or water. It is most familiar as the cross-section of an aircraft wing, yet its influence reaches far beyond aviation. Engineers use related principles when designing wind-turbine blades, racing bicycles and even the ventilation systems of tall buildings. In each case, the central task is to control the movement of a fluid around a surface rather than simply to reduce resistance.",
    },
    {
      label: "B",
      text: "Early explanations of flight often focused on the curved upper side of a wing. Since air travelling over this longer route was said to move faster, the pressure above the wing would become lower and lift would result. The explanation is useful as a first introduction, but it is incomplete. Modern researchers examine the angle at which a wing meets the airflow, the pattern of air leaving its trailing edge and the way pressure changes across the entire surface.",
    },
    {
      label: "C",
      text: "Wind tunnels remain valuable because they allow scientists to isolate one variable at a time. A small model can be tested repeatedly while the speed of the air, the angle of the model or the roughness of its surface is altered. Sensors record forces that cannot be seen directly. Computer simulations have become much more powerful, but physical tests are still needed to check whether a virtual model has ignored an important real-world detail, such as turbulence created by a rough edge.",
    },
    {
      label: "D",
      text: "For wind-energy designers, the goal is not to produce the greatest possible lift in every condition. A turbine blade must continue to work when wind direction and speed change, while avoiding excessive noise and mechanical stress. This is why a profile that performs brilliantly in a laboratory may not be chosen for a commercial turbine. The best design is usually a compromise between energy output, durability, cost and the conditions at a particular site.",
    },
  ],
  questions: [
    {
      id: "q14",
      number: 14,
      group: "Questions 14-17: Matching information",
      kind: "matching-information",
      prompt: "Which paragraph contains the following information? A use of aerofoil principles outside transport.",
      options: [
        { value: "A", label: "Paragraph A" }, { value: "B", label: "Paragraph B" }, { value: "C", label: "Paragraph C" }, { value: "D", label: "Paragraph D" },
      ],
      answer: "A",
      explanation: "Paragraph A mentions ventilation systems in tall buildings.",
      evidence: "the ventilation systems of tall buildings",
    },
    {
      id: "q15",
      number: 15,
      group: "Questions 14-17: Matching information",
      kind: "matching-information",
      prompt: "Which paragraph contains the following information? A reason that a familiar explanation is not enough.",
      options: [
        { value: "A", label: "Paragraph A" }, { value: "B", label: "Paragraph B" }, { value: "C", label: "Paragraph C" }, { value: "D", label: "Paragraph D" },
      ],
      answer: "B",
      explanation: "Paragraph B calls the familiar explanation incomplete and names other factors.",
      evidence: "The explanation is useful as a first introduction, but it is incomplete.",
    },
    {
      id: "q16",
      number: 16,
      group: "Questions 14-17: Matching information",
      kind: "matching-information",
      prompt: "Which paragraph contains the following information? A limitation of computer-based research.",
      options: [
        { value: "A", label: "Paragraph A" }, { value: "B", label: "Paragraph B" }, { value: "C", label: "Paragraph C" }, { value: "D", label: "Paragraph D" },
      ],
      answer: "C",
      explanation: "The paragraph says physical tests can identify a real-world detail missed by a virtual model.",
      evidence: "check whether a virtual model has ignored an important real-world detail",
    },
    {
      id: "q17",
      number: 17,
      group: "Questions 14-17: Matching information",
      kind: "matching-information",
      prompt: "Which paragraph contains the following information? A product design must balance several goals.",
      options: [
        { value: "A", label: "Paragraph A" }, { value: "B", label: "Paragraph B" }, { value: "C", label: "Paragraph C" }, { value: "D", label: "Paragraph D" },
      ],
      answer: "D",
      explanation: "Paragraph D calls the best turbine design a compromise between several competing requirements.",
      evidence: "a compromise between energy output, durability, cost and the conditions",
    },
    {
      id: "q18",
      number: 18,
      group: "Questions 18-21: Yes / No / Not Given",
      kind: "yes-no-not-given",
      prompt: "The writer believes that reducing resistance is the only purpose of aerofoil design.",
      options: yng,
      answer: "NO",
      explanation: "The writer says the task is to control fluid movement, not simply reduce resistance.",
      evidence: "rather than simply to reduce resistance",
    },
    {
      id: "q19",
      number: 19,
      group: "Questions 18-21: Yes / No / Not Given",
      kind: "yes-no-not-given",
      prompt: "The writer suggests that the curved-wing explanation is completely wrong.",
      options: yng,
      answer: "NO",
      explanation: "The writer says it is useful as a first introduction, but incomplete.",
      evidence: "useful as a first introduction, but it is incomplete",
    },
    {
      id: "q20",
      number: 20,
      group: "Questions 18-21: Yes / No / Not Given",
      kind: "yes-no-not-given",
      prompt: "The writer thinks that wind tunnels will soon be replaced entirely by simulations.",
      options: yng,
      answer: "NO",
      explanation: "Physical tests are described as still necessary even though simulations have improved.",
      evidence: "physical tests are still needed",
    },
    {
      id: "q21",
      number: 21,
      group: "Questions 18-21: Yes / No / Not Given",
      kind: "yes-no-not-given",
      prompt: "The writer states that every commercial turbine is tested at more than one site.",
      options: yng,
      answer: "NOT GIVEN",
      explanation: "The text refers to conditions at a particular site but gives no claim about testing every turbine at multiple sites.",
      evidence: "the conditions at a particular site",
    },
    {
      id: "q22",
      number: 22,
      group: "Questions 22-26: Sentence completion",
      kind: "sentence-completion",
      prompt: "Complete the sentence. An aerofoil controls the movement of a ______ around a surface.",
      instruction: "Write ONE WORD ONLY.",
      answer: "fluid",
      acceptedAnswers: ["fluid"],
      explanation: "The term covers both air and water.",
      evidence: "control the movement of a fluid around a surface",
    },
    {
      id: "q23",
      number: 23,
      group: "Questions 22-26: Sentence completion",
      kind: "sentence-completion",
      prompt: "Complete the sentence. Researchers study the angle at which a wing meets the ______.",
      instruction: "Write ONE WORD ONLY.",
      answer: "airflow",
      acceptedAnswers: ["airflow"],
      explanation: "This is one of the factors modern researchers examine.",
      evidence: "the angle at which a wing meets the airflow",
    },
    {
      id: "q24",
      number: 24,
      group: "Questions 22-26: Sentence completion",
      kind: "sentence-completion",
      prompt: "Complete the sentence. In a wind tunnel, scientists can change the model's surface ______.",
      instruction: "Write ONE WORD ONLY.",
      answer: "roughness",
      acceptedAnswers: ["roughness"],
      explanation: "Paragraph C lists roughness together with speed and angle.",
      evidence: "the roughness of its surface is altered",
    },
    {
      id: "q25",
      number: 25,
      group: "Questions 22-26: Sentence completion",
      kind: "sentence-completion",
      prompt: "Complete the sentence. Physical tests can reveal turbulence caused by a rough ______.",
      instruction: "Write ONE WORD ONLY.",
      answer: "edge",
      acceptedAnswers: ["edge"],
      explanation: "This is the example of a detail that simulations may ignore.",
      evidence: "turbulence created by a rough edge",
    },
    {
      id: "q26",
      number: 26,
      group: "Questions 22-26: Sentence completion",
      kind: "sentence-completion",
      prompt: "Complete the sentence. Turbine designers must reduce both noise and mechanical ______.",
      instruction: "Write ONE WORD ONLY.",
      answer: "stress",
      acceptedAnswers: ["stress"],
      explanation: "The passage names both requirements in the same sentence.",
      evidence: "avoiding excessive noise and mechanical stress",
    },
  ],
};

const cityLibraries: ReadingPassage = {
  id: "city-libraries",
  title: "Public libraries in a digital city",
  subtitle: "Why civic learning spaces are being redesigned rather than replaced",
  paragraphs: [
    {
      label: "A",
      text: "Predictions that public libraries would disappear once books became digital have proved premature. In many cities, library visits have changed rather than declined. People still borrow printed books, but they also use quiet workspaces, attend language classes and ask staff for help with online services. The modern library is increasingly judged not by the number of books on its shelves, but by the range of learning opportunities it makes available to residents who might otherwise be excluded.",
    },
    {
      label: "B",
      text: "This shift has altered the design of library buildings. Rows of shelves once occupied most of the floor area, while activities that created noise were kept to a minimum. Newer buildings divide space into zones: silent rooms for concentrated study, flexible areas for group work and rooms equipped for workshops or recording. The aim is not to remove books, but to recognise that different visitors need different kinds of attention and different levels of sound.",
    },
    {
      label: "C",
      text: "Digital access remains central. Many citizens own a phone but do not have a reliable computer, printer or broadband connection at home. Libraries can provide these tools without requiring a purchase or a subscription. Staff members also help visitors evaluate online information, complete official forms and protect their privacy. This guidance matters because access to a device alone does not guarantee that someone can use digital services confidently or safely.",
    },
    {
      label: "D",
      text: "The challenge is to measure value fairly. Counting loans is straightforward, while the benefits of a safe study space or a successful job application are harder to record. Some library systems now collect stories from users alongside numerical data, while others track attendance at classes or use surveys months later. None of these methods is perfect, but together they offer a fuller picture of a library's social role than a single figure can provide.",
    },
  ],
  questions: [
    {
      id: "q27",
      number: 27,
      group: "Questions 27-29: Multiple choice",
      kind: "multiple-choice",
      prompt: "What is the main point of paragraph A?",
      options: [
        { value: "A", label: "Libraries have abandoned printed books completely." },
        { value: "B", label: "Libraries now serve several learning and inclusion purposes." },
        { value: "C", label: "Most residents only visit libraries for language classes." },
        { value: "D", label: "Digital books have made library visits more expensive." },
      ],
      answer: "B",
      explanation: "Paragraph A lists several new uses and frames the library as an inclusive learning space.",
      evidence: "the range of learning opportunities it makes available",
    },
    {
      id: "q28",
      number: 28,
      group: "Questions 27-29: Multiple choice",
      kind: "multiple-choice",
      prompt: "Why do newer library buildings divide their floor space into zones?",
      options: [
        { value: "A", label: "To display a larger number of books." },
        { value: "B", label: "To make all areas equally quiet." },
        { value: "C", label: "To support visitors with different activities and sound needs." },
        { value: "D", label: "To reduce the number of staff required." },
      ],
      answer: "C",
      explanation: "The writer explains that visitors need different kinds of attention and noise levels.",
      evidence: "different visitors need different kinds of attention and different levels of sound",
    },
    {
      id: "q29",
      number: 29,
      group: "Questions 27-29: Multiple choice",
      kind: "multiple-choice",
      prompt: "What does the writer say about providing devices in libraries?",
      options: [
        { value: "A", label: "It is enough to make people confident online." },
        { value: "B", label: "It removes the need for staff support." },
        { value: "C", label: "It is useful, but people may still need guidance." },
        { value: "D", label: "It should only be offered to job seekers." },
      ],
      answer: "C",
      explanation: "The text says hardware access alone does not guarantee confident or safe use.",
      evidence: "access to a device alone does not guarantee",
    },
    {
      id: "q30",
      number: 30,
      group: "Question 30: Multiple-answer multiple choice",
      kind: "multiple-answer",
      prompt: "Choose TWO services that the passage says library staff may help visitors with.",
      instruction: "Choose TWO letters, A-E.",
      options: [
        { value: "A", label: "Buying a personal printer" },
        { value: "B", label: "Evaluating online information" },
        { value: "C", label: "Completing official forms" },
        { value: "D", label: "Writing a novel" },
        { value: "E", label: "Building a broadband network" },
      ],
      answer: ["B", "C"],
      explanation: "Both tasks are explicitly listed in paragraph C.",
      evidence: "evaluate online information, complete official forms",
    },
    {
      id: "q31",
      number: 31,
      group: "Questions 31-34: Matching features",
      kind: "matching-features",
      prompt: "Which paragraph mentions people who have a phone but lack another important resource?",
      options: [
        { value: "A", label: "Paragraph A" }, { value: "B", label: "Paragraph B" }, { value: "C", label: "Paragraph C" }, { value: "D", label: "Paragraph D" },
      ],
      answer: "C",
      explanation: "Paragraph C contrasts phone ownership with missing home equipment and connection.",
      evidence: "own a phone but do not have a reliable computer, printer or broadband connection",
    },
    {
      id: "q32",
      number: 32,
      group: "Questions 31-34: Matching features",
      kind: "matching-features",
      prompt: "Which paragraph contrasts an easy measurement with less visible outcomes?",
      options: [
        { value: "A", label: "Paragraph A" }, { value: "B", label: "Paragraph B" }, { value: "C", label: "Paragraph C" }, { value: "D", label: "Paragraph D" },
      ],
      answer: "D",
      explanation: "Loans are simple to count; social benefits are not.",
      evidence: "Counting loans is straightforward, while the benefits ... are harder to record",
    },
    {
      id: "q33",
      number: 33,
      group: "Questions 31-34: Matching features",
      kind: "matching-features",
      prompt: "Which paragraph describes a change in how building space is organised?",
      options: [
        { value: "A", label: "Paragraph A" }, { value: "B", label: "Paragraph B" }, { value: "C", label: "Paragraph C" }, { value: "D", label: "Paragraph D" },
      ],
      answer: "B",
      explanation: "Paragraph B describes the move from shelves to separate purpose-based zones.",
      evidence: "Newer buildings divide space into zones",
    },
    {
      id: "q34",
      number: 34,
      group: "Questions 31-34: Matching features",
      kind: "matching-features",
      prompt: "Which paragraph describes a wider standard for judging a library?",
      options: [
        { value: "A", label: "Paragraph A" }, { value: "B", label: "Paragraph B" }, { value: "C", label: "Paragraph C" }, { value: "D", label: "Paragraph D" },
      ],
      answer: "A",
      explanation: "The paragraph says libraries are increasingly judged by more than shelf-book numbers.",
      evidence: "increasingly judged not by the number of books on its shelves",
    },
    {
      id: "q35",
      number: 35,
      group: "Questions 35-37: Summary / form completion",
      kind: "summary-completion",
      prompt: "Complete the summary. The modern library provides educational opportunities for residents who may otherwise be ______.",
      instruction: "Write ONE WORD ONLY.",
      answer: "excluded",
      acceptedAnswers: ["excluded"],
      explanation: "The word describes people lacking access to opportunities.",
      evidence: "residents who might otherwise be excluded",
    },
    {
      id: "q36",
      number: 36,
      group: "Questions 35-37: Summary / form completion",
      kind: "form-completion",
      prompt: "Complete the form note. Library staff can help users protect their online ______.",
      instruction: "Write ONE WORD ONLY.",
      answer: "privacy",
      acceptedAnswers: ["privacy"],
      explanation: "This is one of the digital-support tasks in paragraph C.",
      evidence: "protect their privacy",
    },
    {
      id: "q37",
      number: 37,
      group: "Questions 35-37: Summary / form completion",
      kind: "summary-completion",
      prompt: "Complete the summary. Some library systems collect users' ______ as well as numerical data.",
      instruction: "Write ONE WORD ONLY.",
      answer: "stories",
      acceptedAnswers: ["stories"],
      explanation: "The writer gives this as an alternative way to measure social value.",
      evidence: "collect stories from users alongside numerical data",
    },
    {
      id: "q38",
      number: 38,
      group: "Questions 38-39: Diagram labelling",
      kind: "diagram-labelling",
      prompt: "Library layout diagram: the room intended for concentrated study is the ______ room.",
      instruction: "Write ONE WORD ONLY.",
      answer: "silent",
      acceptedAnswers: ["silent"],
      explanation: "Paragraph B labels these rooms clearly.",
      evidence: "silent rooms for concentrated study",
    },
    {
      id: "q39",
      number: 39,
      group: "Questions 38-39: Diagram labelling",
      kind: "diagram-labelling",
      prompt: "Library layout diagram: rooms with equipment may be used for ______.",
      instruction: "Write ONE WORD ONLY.",
      answer: "workshops",
      acceptedAnswers: ["workshops"],
      explanation: "The equipment rooms are introduced for this activity.",
      evidence: "rooms equipped for workshops or recording",
    },
    {
      id: "q40",
      number: 40,
      group: "Question 40: Short answer",
      kind: "short-answer",
      prompt: "What kind of data do some library systems collect several months after classes?",
      instruction: "Write NO MORE THAN TWO WORDS.",
      answer: "surveys",
      acceptedAnswers: ["surveys", "survey"],
      explanation: "The final paragraph describes surveys carried out months later.",
      evidence: "use surveys months later",
    },
  ],
};

const communityCentre: ReadingPassage = {
  id: "community-centre",
  title: "Using the Riverside Community Centre",
  subtitle: "A practical guide for new members",
  paragraphs: [
    {
      label: "A",
      text: "Riverside Community Centre is open to everyone who lives, studies or works in the local area. New members can join online or at the reception desk. Adults pay a small annual fee, while people under eighteen can join free of charge if a parent or guardian completes the form. Membership gives you access to the building and lets you book most activities.",
    },
    {
      label: "B",
      text: "Classes include yoga, beginner computer skills, conversational English and a weekly art club. You should book a place through the website because popular sessions fill quickly. If you cannot attend, cancel at least twenty-four hours before the class begins. This allows someone on the waiting list to take your place. Equipment is provided for most classes, but participants in the art club should bring an old shirt or apron.",
    },
    {
      label: "C",
      text: "The centre also has two meeting rooms available for community groups. Bookings can be made up to three months in advance. A refundable deposit is required for evening events, and the person making the booking is responsible for leaving the room clean. The smaller room has a projector, while the larger room is better for meetings of more than twenty people.",
    },
    {
      label: "D",
      text: "For help with a booking, speak to the reception team between 9.00 and 17.00 on weekdays. Outside these hours, send an email and include your membership number. The centre publishes changes to opening hours on its noticeboard and social media pages, especially during public holidays. Lost property is kept at reception for one month before it is donated to a local charity.",
    },
  ],
  questions: [
    {
      id: "gq1", number: 1, group: "Questions 1-3: Multiple choice", kind: "multiple-choice", prompt: "Who can become a member of the Riverside Community Centre?",
      options: [{ value: "A", label: "Only people who live in the area" }, { value: "B", label: "People who live, study or work locally" }, { value: "C", label: "Only adults with an annual fee" }, { value: "D", label: "People invited by an existing member" }], answer: "B",
      explanation: "The first paragraph gives three ways a person can be connected to the local area.", evidence: "lives, studies or works in the local area",
    },
    {
      id: "gq2", number: 2, group: "Questions 1-3: Multiple choice", kind: "multiple-choice", prompt: "What should a person do if they cannot attend a booked class?",
      options: [{ value: "A", label: "Find another participant" }, { value: "B", label: "Call reception immediately" }, { value: "C", label: "Cancel at least one day before" }, { value: "D", label: "Pay for the equipment" }], answer: "C",
      explanation: "The instruction is given to make places available to people waiting.", evidence: "cancel at least twenty-four hours before",
    },
    {
      id: "gq3", number: 3, group: "Questions 1-3: Multiple choice", kind: "multiple-choice", prompt: "Which activity requires participants to bring an item of clothing?",
      options: [{ value: "A", label: "Yoga" }, { value: "B", label: "Computer skills" }, { value: "C", label: "Conversational English" }, { value: "D", label: "Art club" }], answer: "D",
      explanation: "Only the art club has a clothing requirement.", evidence: "participants in the art club should bring an old shirt or apron",
    },
    {
      id: "gq4", number: 4, group: "Questions 4-6: Form completion", kind: "form-completion", prompt: "Complete the form. Young people under eighteen need a parent or ______ to complete the form.", instruction: "Write ONE WORD ONLY.", answer: "guardian", acceptedAnswers: ["guardian"], explanation: "This is the second adult named in the membership rule.", evidence: "a parent or guardian completes the form",
    },
    {
      id: "gq5", number: 5, group: "Questions 4-6: Form completion", kind: "form-completion", prompt: "Complete the form. Evening events require a refundable ______.", instruction: "Write ONE WORD ONLY.", answer: "deposit", acceptedAnswers: ["deposit"], explanation: "The payment is returned when the conditions are met.", evidence: "A refundable deposit is required for evening events",
    },
    {
      id: "gq6", number: 6, group: "Questions 4-6: Form completion", kind: "form-completion", prompt: "Complete the form. Include your membership ______ when you email outside reception hours.", instruction: "Write ONE WORD ONLY.", answer: "number", acceptedAnswers: ["number"], explanation: "This lets the reception team identify the member.", evidence: "include your membership number",
    },
    {
      id: "gq7", number: 7, group: "Questions 7-10: Matching information", kind: "matching-information", prompt: "Which paragraph mentions a time limit for keeping an item?", options: [{ value: "A", label: "Paragraph A" }, { value: "B", label: "Paragraph B" }, { value: "C", label: "Paragraph C" }, { value: "D", label: "Paragraph D" }], answer: "D", explanation: "Lost property is kept for a fixed period.", evidence: "kept at reception for one month",
    },
    {
      id: "gq8", number: 8, group: "Questions 7-10: Matching information", kind: "matching-information", prompt: "Which paragraph mentions an item available in only one room?", options: [{ value: "A", label: "Paragraph A" }, { value: "B", label: "Paragraph B" }, { value: "C", label: "Paragraph C" }, { value: "D", label: "Paragraph D" }], answer: "C", explanation: "The projector is attached to the smaller meeting room.", evidence: "The smaller room has a projector",
    },
    {
      id: "gq9", number: 9, group: "Questions 7-10: Matching information", kind: "matching-information", prompt: "Which paragraph mentions a way to inform people about changes?", options: [{ value: "A", label: "Paragraph A" }, { value: "B", label: "Paragraph B" }, { value: "C", label: "Paragraph C" }, { value: "D", label: "Paragraph D" }], answer: "D", explanation: "The centre uses two channels to publish altered opening times.", evidence: "noticeboard and social media pages",
    },
    {
      id: "gq10", number: 10, group: "Questions 7-10: Matching information", kind: "matching-information", prompt: "Which paragraph mentions an advantage that membership provides?", options: [{ value: "A", label: "Paragraph A" }, { value: "B", label: "Paragraph B" }, { value: "C", label: "Paragraph C" }, { value: "D", label: "Paragraph D" }], answer: "A", explanation: "Membership gives building access and booking rights.", evidence: "gives you access to the building and lets you book most activities",
    },
  ],
};

export const READING_PRACTICE_TESTS: ReadingPracticeTest[] = [
  {
    id: "academic-city-systems",
    title: "Academic Reading: City systems",
    description: "A complete Cambridge-style practice test about urban design, engineering and public learning.",
    track: "Cambridge-style",
    level: "Advanced",
    minutes: 60,
    passages: [roofGardens, aerofoil, cityLibraries],
  },
  {
    id: "general-training-community",
    title: "General Training: Community Centre",
    description: "A clear practical guide with membership, bookings and local service information.",
    track: "General Training",
    level: "Beginner",
    minutes: 15,
    passages: [communityCentre],
  },
  {
    id: "academic-roof-gardens",
    title: "Urban resilience: Roof gardens",
    description: "Matching headings, True / False / Not Given and note completion.",
    track: "Academic",
    level: "Intermediate",
    minutes: 20,
    passages: [roofGardens],
  },
  {
    id: "academic-aerofoil",
    title: "Science and design: The shape of lift",
    description: "Matching information, Yes / No / Not Given and sentence completion.",
    track: "Academic",
    level: "Advanced",
    minutes: 20,
    passages: [aerofoil],
  },
  {
    id: "academic-libraries",
    title: "Society: Public libraries in a digital city",
    description: "Multiple choice, matching features, completion and diagram labels.",
    track: "Academic",
    level: "Advanced",
    minutes: 20,
    passages: [cityLibraries],
  },
];

export const READING_LIBRARY_GROUPS = [
  {
    title: "Academic Reading",
    description: "Original academic passages, vocabulary-rich evidence and timed questions.",
    items: ["academic-roof-gardens", "academic-aerofoil", "academic-libraries"],
  },
  {
    title: "Cambridge-style full tests",
    description: "Three passages, 40 questions and one uninterrupted exam flow.",
    items: ["academic-city-systems"],
  },
  {
    title: "General Training Reading",
    description: "Everyday notices, services and practical information in a timed Reading flow.",
    items: ["general-training-community"],
  },
  {
    title: "Practice by question type",
    description: "Build accuracy on one difficult format at a time.",
    items: ["general-training-community", "academic-roof-gardens", "academic-aerofoil", "academic-libraries"],
  },
  {
    title: "Practice by difficulty",
    description: "Start with structured evidence, then move into denser academic reasoning.",
    items: ["academic-roof-gardens", "academic-aerofoil", "academic-libraries"],
  },
] as const;

export const READING_QUESTION_TYPE_GUIDES: readonly ReadingQuestionTypeGuide[] = [
  {
    id: "matching-headings",
    title: "Matching Headings",
    description: "Find each paragraph's main idea, not an interesting detail.",
    strategy: [
      "Read the first and final sentence of every paragraph first.",
      "Underline the paragraph's repeated idea before reading the headings.",
      "Reject headings that match one example but not the whole paragraph.",
    ],
    kinds: ["matching-headings"],
  },
  {
    id: "multiple-choice",
    title: "Multiple Choice",
    description: "Compare every option with the evidence in the passage.",
    strategy: [
      "Read the question before searching the passage.",
      "Locate the evidence, then compare all options, not only the first familiar one.",
      "Watch for options that are partly true but do not answer the question.",
    ],
    kinds: ["multiple-choice", "multiple-answer"],
  },
  {
    id: "true-false-not-given",
    title: "True / False / Not Given",
    description: "Separate contradiction from information the passage never states.",
    strategy: [
      "TRUE means the statement agrees with the text.",
      "FALSE means the text says the opposite; NOT GIVEN means there is no clear evidence.",
      "Do not use outside knowledge or make logical guesses beyond the passage.",
    ],
    kinds: ["true-false-not-given", "yes-no-not-given"],
  },
  {
    id: "sentence-completion",
    title: "Sentence Completion",
    description: "Complete a sentence using the exact word limit and passage meaning.",
    strategy: [
      "Read the instruction first and circle the word limit.",
      "Predict the grammar of the missing answer before you scan the text.",
      "Copy only the necessary word or words, and check spelling carefully.",
    ],
    kinds: ["sentence-completion", "table-completion", "form-completion", "short-answer"],
  },
  {
    id: "matching-information",
    title: "Matching Information",
    description: "Locate one precise detail in the paragraph that contains it.",
    strategy: [
      "Identify the unique keyword or idea in the question.",
      "Scan for synonyms rather than expecting the same words.",
      "A paragraph may be used more than once unless the instruction says otherwise.",
    ],
    kinds: ["matching-information", "matching-features"],
  },
  {
    id: "summary-completion",
    title: "Summary Completion",
    description: "Follow the summary's order and choose language that fits its grammar.",
    strategy: [
      "Use the summary headings to find the right part of the passage.",
      "Check the words immediately before and after each gap.",
      "Keep the original meaning; a familiar word can still be the wrong fit.",
    ],
    kinds: ["summary-completion", "diagram-labelling"],
  },
] as const;

export function getReadingTest(testId: string): ReadingPracticeTest {
  return READING_PRACTICE_TESTS.find((test) => test.id === testId) ?? READING_PRACTICE_TESTS[0];
}

export function allReadingQuestions(test: ReadingPracticeTest): ReadingQuestion[] {
  return test.passages.flatMap((passage) => passage.questions);
}

export function getReadingQuestionTypeGuide(id: ReadingQuestionTypeGuideId): ReadingQuestionTypeGuide {
  return READING_QUESTION_TYPE_GUIDES.find((guide) => guide.id === id) ?? READING_QUESTION_TYPE_GUIDES[0];
}

export function getQuestionsForReadingQuestionType(
  id: ReadingQuestionTypeGuideId
): ReadingQuestionPracticeItem[] {
  const guide = getReadingQuestionTypeGuide(id);
  const seen = new Set<string>();

  return READING_PRACTICE_TESTS.flatMap((test) =>
    test.passages.flatMap((passage) =>
      passage.questions
        .filter((question) => guide.kinds.includes(question.kind))
        .map((question) => ({ test, passage, question }))
    )
  ).filter((item) => {
    if (seen.has(item.question.id)) return false;
    seen.add(item.question.id);
    return true;
  });
}
