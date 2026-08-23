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
    {
      label: "E",
      text: "Not every roof can support this kind of intervention. A layer of waterlogged soil is considerably heavier than the materials it replaces, so before any installation begins, a structural engineer must confirm the building's load-bearing capacity, particularly on older properties never designed with this weight in mind. Waterproofing beneath the growing medium also has to be flawless, since a leak discovered after planting is far more disruptive to repair than one beneath an ordinary roof. These requirements add cost well beyond that of the plants themselves, and in cities where construction budgets are already tight, the initial expense can be the single biggest obstacle to adoption, regardless of the long-term savings a building might eventually see.",
    },
    {
      label: "F",
      text: "Not every specialist is convinced the benefits justify this outlay. Some architects point out that a simple reflective coating, applied directly to an existing roof at a fraction of the cost, can reduce surface temperature almost as effectively as a full planting scheme, without any of the structural risk. Others question whether the ecological claims made for individual roof gardens hold up at the scale of an entire city: a single rooftop planted with a handful of hardy species supports only a limited range of insects and birds, and critics argue that policymakers sometimes present it as a bigger contribution to urban biodiversity than the evidence supports. Supporters respond that a reflective coating solves only the temperature problem, leaving water management and habitat entirely unaddressed.",
    },
    {
      label: "G",
      text: "Despite this disagreement, adoption is accelerating in several cities, helped along by policy rather than persuasion alone. A growing number of municipal building codes now grant faster planning approval, reduced fees, or direct subsidies to developments that include a planted roof above a minimum size. Some insurers have also begun offering slightly lower premiums for buildings with proven flood-reducing features. Researchers are responding by trying to standardise how a roof garden's benefits are measured, so that a building owner comparing this option against a conventional replacement can weigh the real costs against a realistic, rather than an idealised, estimate of the return.",
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
      prompt: "Planted roofs deliver their largest temperature benefits in hot weather.",
      options: tfng,
      answer: "TRUE",
      explanation:
        "Paragraph C states this directly, and contrasts it with the modest winter insulation that designers warn against exaggerating.",
      evidence: "The greatest gains are normally recorded during hot weather",
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
      prompt: "Complete the note. Before installation, an engineer must confirm the building's load-bearing ______.",
      instruction: "Write ONE WORD ONLY.",
      answer: "capacity",
      acceptedAnswers: ["capacity"],
      explanation: "Paragraph E states this requirement explicitly.",
      evidence: "confirm the building's load-bearing capacity",
    },
    {
      id: "q12",
      number: 12,
      group: "Questions 9-13: Note completion",
      kind: "table-completion",
      prompt: "Complete the note. Critics note that a reflective ______ can lower roof temperature much more cheaply.",
      instruction: "Write ONE WORD ONLY.",
      answer: "coating",
      acceptedAnswers: ["coating"],
      explanation: "Paragraph F names this cheaper alternative to a full planting scheme.",
      evidence: "a simple reflective coating, applied directly to an existing roof",
    },
    {
      id: "q13",
      number: 13,
      group: "Questions 9-13: Note completion",
      kind: "table-completion",
      prompt: "Complete the note. Some cities now offer ______ to developments that include a large enough planted roof.",
      instruction: "Write ONE WORD ONLY.",
      answer: "subsidies",
      acceptedAnswers: ["subsidies"],
      explanation: "Paragraph G lists this alongside faster approval and reduced fees.",
      evidence: "reduced fees, or direct subsidies",
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
    {
      label: "E",
      text: "Advances in manufacturing have shortened the distance between an idea and a testable object. A new aerofoil shape that once required months of tooling before a single prototype could be tested can now often be produced with a 3D printer within days. This has changed how design teams work: instead of committing to one carefully chosen shape, engineers can print and test a dozen small variations in the time it once took to finish one. Composite materials have brought a similar shift, allowing a single blade or wing section to combine a rigid internal structure with a flexible outer surface that adjusts its shape slightly under load.",
    },
    {
      label: "F",
      text: "Not every specialist agrees that further refining the aerofoil itself is the best use of research funding. For large-scale applications such as industrial turbines, some engineers argue that the aerodynamic gains still available are now genuinely marginal, and that money spent chasing them would produce a bigger overall improvement if redirected toward better control software or more durable materials. A turbine that adjusts its blade angle intelligently in response to changing wind, they argue, can outperform a marginally more efficient fixed design. Others respond that the two approaches are not competitors: software improvements assume a well-designed blade to begin with, and poor aerodynamics cannot be corrected by clever control alone.",
    },
    {
      label: "G",
      text: "The field's continuing relevance owes something to researchers working entirely outside traditional engineering. Biologists studying how birds glide with minimal effort, or how fish maintain speed with little visible motion, have supplied aerofoil designers with shapes no wind tunnel experiment would likely have produced on its own. This exchange runs in both directions: engineers now have measurement tools precise enough to describe animal movement in the same terms used for aircraft wings, closing a gap between biology and engineering that neither field could have closed working alone. The result is a research area that, more than a century after the first successful aircraft wing, still regularly produces genuine surprises.",
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
      prompt: "Complete the sentence. Composite materials let a blade combine a rigid structure with a ______ outer surface.",
      instruction: "Write ONE WORD ONLY.",
      answer: "flexible",
      acceptedAnswers: ["flexible"],
      explanation: "Paragraph E describes this combination directly.",
      evidence: "a flexible outer surface that adjusts its shape slightly under load",
    },
    {
      id: "q25",
      number: 25,
      group: "Questions 22-26: Sentence completion",
      kind: "sentence-completion",
      prompt: "Complete the sentence. Some engineers argue funding should go toward more durable ______ instead of further aerodynamic refinement.",
      instruction: "Write ONE WORD ONLY.",
      answer: "materials",
      acceptedAnswers: ["materials"],
      explanation: "Paragraph F names this as an alternative use of research funding.",
      evidence: "redirected toward better control software or more durable materials",
    },
    {
      id: "q26",
      number: 26,
      group: "Questions 22-26: Sentence completion",
      kind: "sentence-completion",
      prompt: "Complete the sentence. Studying how birds and fish move has supplied shapes that wind-tunnel experiments alone might not have ______.",
      instruction: "Write ONE WORD ONLY.",
      answer: "produced",
      acceptedAnswers: ["produced"],
      explanation: "Paragraph G credits biology-inspired research with these shapes.",
      evidence: "no wind tunnel experiment would likely have produced on its own",
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
    {
      label: "E",
      text: "This broader mission has not been matched by broader funding. In many cities, a library's budget is still allocated and defended largely in terms of its book collection, even though staffing digital help desks, running classes and maintaining flexible rooms all cost money that a simple per-book calculation does not capture. When municipal budgets tighten, libraries often compete for funding against services with more easily measured outcomes, such as waste collection or road repair, and can struggle to make the case for spending that produces benefits which are real but harder to quantify. Some library directors now present their budgets alongside the alternative cost of the services they replace, arguing that a free computer session is, in effect, cheaper for the city than the alternative of a resident being unable to access an online public service at all.",
    },
    {
      label: "F",
      text: "Not everyone welcomes this expansion of purpose. A number of critics, including some librarians themselves, worry that stretching a single institution across lending, digital support, social services and event hosting spreads limited expertise too thinly, and that a library risks doing many things adequately rather than one thing excellently. They point out that a librarian trained in helping someone find historical research is not automatically equipped to give reliable advice on a government benefits form, however willing they may be to try. Supporters of the broader model respond that the alternative, referring every non-book request elsewhere, would leave residents without support they clearly need and have nowhere else convenient to find, particularly in neighbourhoods with few other public services.",
    },
    {
      label: "G",
      text: "Looking ahead, many library systems are choosing partnership over expansion of their own staff. Universities lend subject specialists for evening sessions, and technology companies sometimes fund free introductory coding classes taught in library meeting rooms, letting the library provide the space and audience while outside experts supply the specific skill. Yet perhaps the simplest explanation for the modern library's continued relevance has little to do with any specific service at all. In an increasingly commercial city centre, it remains one of very few indoor spaces where a person can sit for hours, use the facilities and interact with staff without being asked to buy anything, a kind of public value that is easy to overlook precisely because it was never designed to be measured.",
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
      evidence: "Counting loans is straightforward, while the benefits of a safe study space or a successful job application are harder to record",
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
      prompt: "Complete the summary. Library budgets are still often defended mainly in terms of the book ______.",
      instruction: "Write ONE WORD ONLY.",
      answer: "collection",
      acceptedAnswers: ["collection"],
      explanation: "Paragraph E describes how budgets are traditionally justified.",
      evidence: "defended largely in terms of its book collection",
    },
    {
      id: "q36",
      number: 36,
      group: "Questions 35-37: Summary / form completion",
      kind: "form-completion",
      prompt: "Complete the form note. Critics worry a library risks doing many things adequately rather than one thing ______.",
      instruction: "Write ONE WORD ONLY.",
      answer: "excellently",
      acceptedAnswers: ["excellently"],
      explanation: "This is the specific concern raised by critics in paragraph F.",
      evidence: "one thing excellently",
    },
    {
      id: "q37",
      number: 37,
      group: "Questions 35-37: Summary / form completion",
      kind: "summary-completion",
      prompt: "Complete the summary. Technology companies sometimes fund free introductory ______ classes held in library meeting rooms.",
      instruction: "Write ONE WORD ONLY.",
      answer: "coding",
      acceptedAnswers: ["coding"],
      explanation: "Paragraph G gives this as an example of an outside partnership.",
      evidence: "free introductory coding classes",
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

type FullTestPassageSeed = {
  id: string;
  title: string;
  subtitle: string;
  context: string;
  oldMethod: string;
  focus: string;
  mechanism: string;
  outcome: string;
  limitation: string;
  variation: string;
  planning: string;
  future: string;
};

type FullTestSeed = {
  id: string;
  title: string;
  description: string;
  level: ReadingPracticeTest["level"];
  passages: readonly [FullTestPassageSeed, FullTestPassageSeed, FullTestPassageSeed];
};

const FULL_TEST_SEEDS: readonly FullTestSeed[] = [
  {
    id: "academic-materials-adaptation",
    title: "Full Test 2: Materials and adaptation",
    description: "Original Academic Reading on climate design, bio-materials and healthier urban water.",
    level: "Intermediate",
    passages: [
      { id: "clay-cooling", title: "The return of clay cooling", subtitle: "Passive design for hotter courtyards", context: "dense neighbourhoods with hotter summers", oldMethod: "air conditioning", focus: "clay panels", mechanism: "evaporation", outcome: "cooler courtyards", limitation: "regular wetting", variation: "humidity", planning: "surveying walls", future: "passive cooling" },
      { id: "fungal-packaging", title: "Fungi-grown packaging", subtitle: "Turning agricultural waste into a protective material", context: "manufacturing regions with large crop residues", oldMethod: "plastic foam", focus: "fungal fibres", mechanism: "mycelium growth", outcome: "compostable packaging", limitation: "slow drying", variation: "temperature", planning: "selecting waste", future: "local production" },
      { id: "urban-streams", title: "Restoring urban streams", subtitle: "Making hidden waterways useful again", context: "cities where streams were enclosed decades ago", oldMethod: "concrete channels", focus: "planted banks", mechanism: "slower flow", outcome: "cleaner water", limitation: "flood safety", variation: "rainfall", planning: "mapping drains", future: "connected habitats" },
    ],
  },
  {
    id: "academic-observation-discovery",
    title: "Full Test 3: Observation and discovery",
    description: "Original Academic Reading on public research, conservation and environmental records.",
    level: "Advanced",
    passages: [
      { id: "citizen-science-night", title: "Citizen science after dark", subtitle: "How volunteers record urban wildlife", context: "urban areas with limited professional surveys", oldMethod: "expert surveys", focus: "phone observations", mechanism: "image recognition", outcome: "larger records", limitation: "uneven coverage", variation: "participant skills", planning: "training volunteers", future: "shared databases" },
      { id: "seed-vaults", title: "The logic of seed vaults", subtitle: "Protecting crop diversity for uncertain futures", context: "agricultural systems exposed to changing climates", oldMethod: "field collections", focus: "cold storage", mechanism: "low metabolism", outcome: "longer survival", limitation: "power security", variation: "seed species", planning: "testing samples", future: "regional backups" },
      { id: "ice-language", title: "Reading the language of ice", subtitle: "What long ice records reveal about the atmosphere", context: "remote polar research stations", oldMethod: "surface maps", focus: "ice cores", mechanism: "trapped bubbles", outcome: "past climates", limitation: "deep drilling", variation: "ice age", planning: "choosing sites", future: "combined records" },
    ],
  },
  {
    id: "academic-cities-transition",
    title: "Full Test 4: Cities in transition",
    description: "Original Academic Reading on low-carbon logistics, quieter streets and public markets.",
    level: "Intermediate",
    passages: [
      { id: "freight-bicycles", title: "Freight bicycles in historic centres", subtitle: "Short-distance deliveries without large vehicles", context: "historic centres with narrow streets", oldMethod: "delivery vans", focus: "cargo bicycles", mechanism: "short routes", outcome: "fewer emissions", limitation: "weather exposure", variation: "street layout", planning: "locating hubs", future: "electric support" },
      { id: "quieter-streets", title: "Designing quieter streets", subtitle: "Reducing noise through the way traffic moves", context: "residential districts near busy roads", oldMethod: "noise barriers", focus: "traffic calming", mechanism: "lower speeds", outcome: "quieter corners", limitation: "driver compliance", variation: "road design", planning: "measuring noise", future: "night delivery rules" },
      { id: "civic-markets", title: "Markets as civic infrastructure", subtitle: "Why covered markets can support urban life", context: "town centres affected by changing shopping habits", oldMethod: "retail centres", focus: "covered markets", mechanism: "shared facilities", outcome: "longer visits", limitation: "rising rents", variation: "neighbourhood income", planning: "consulting traders", future: "mixed ownership" },
    ],
  },
  {
    id: "academic-living-systems",
    title: "Full Test 5: Living systems",
    description: "Original Academic Reading on coastal ecology, soil health and animal migration.",
    level: "Advanced",
    passages: [
      { id: "mussel-farms", title: "Mussel farms and clean water", subtitle: "Filtering coastal water with living systems", context: "sheltered bays with declining water clarity", oldMethod: "chemical filters", focus: "mussel beds", mechanism: "water filtration", outcome: "clearer bays", limitation: "disease monitoring", variation: "water temperature", planning: "testing sites", future: "coastal networks" },
      { id: "soil-fungi", title: "The hidden work of soil fungi", subtitle: "Underground partnerships that support plant growth", context: "farmland under pressure to reduce inputs", oldMethod: "synthetic fertiliser", focus: "fungal networks", mechanism: "nutrient exchange", outcome: "stronger roots", limitation: "disturbed soil", variation: "crop rotation", planning: "reducing tillage", future: "field partnerships" },
      { id: "migratory-birds", title: "Tracking migratory birds", subtitle: "Lightweight technology and long-distance journeys", context: "bird populations that cross several countries", oldMethod: "ring surveys", focus: "lightweight tags", mechanism: "satellite signals", outcome: "longer routes", limitation: "short battery life", variation: "body size", planning: "fitting tags", future: "migration forecasts" },
    ],
  },
  {
    id: "academic-knowledge-culture",
    title: "Full Test 6: Knowledge and culture",
    description: "Original Academic Reading on archives, film restoration and libraries as shared spaces.",
    level: "Advanced",
    passages: [
      { id: "endangered-scripts", title: "Reviving endangered scripts", subtitle: "Recovering damaged written records", context: "archives holding fragile historical documents", oldMethod: "paper copies", focus: "digital archives", mechanism: "multispectral imaging", outcome: "clearer symbols", limitation: "fragment damage", variation: "ink quality", planning: "scanning collections", future: "public access" },
      { id: "silent-films", title: "The second life of silent films", subtitle: "Making early cinema viewable again", context: "film collections stored in unstable conditions", oldMethod: "single copies", focus: "film scans", mechanism: "frame repair", outcome: "stable images", limitation: "missing scenes", variation: "film condition", planning: "cataloguing reels", future: "restored screenings" },
      { id: "libraries-beyond-books", title: "Libraries beyond books", subtitle: "Why shared tools can bring new visitors", context: "public libraries seeking wider local use", oldMethod: "book lending", focus: "maker spaces", mechanism: "shared equipment", outcome: "new visitors", limitation: "staff training", variation: "opening hours", planning: "asking residents", future: "mobile workshops" },
    ],
  },
  {
    id: "academic-energy-networks",
    title: "Full Test 7: Energy and networks",
    description: "Original Academic Reading on thermal storage, local generation and flexible demand.",
    level: "Advanced",
    passages: [
      { id: "heat-storage", title: "Storing electricity as heat", subtitle: "A different way to hold renewable energy", context: "power systems with fluctuating renewable generation", oldMethod: "lithium batteries", focus: "heated bricks", mechanism: "thermal storage", outcome: "cheaper reserves", limitation: "heat loss", variation: "insulation", planning: "matching demand", future: "district systems" },
      { id: "solar-cooperatives", title: "Community solar cooperatives", subtitle: "Generating energy through collective ownership", context: "neighbourhoods where many homes cannot install panels", oldMethod: "individual panels", focus: "shared arrays", mechanism: "collective ownership", outcome: "lower bills", limitation: "legal rules", variation: "roof access", planning: "forming groups", future: "community finance" },
      { id: "flexible-grids", title: "The future of flexible grids", subtitle: "Balancing electricity demand minute by minute", context: "electricity networks with rising peak demand", oldMethod: "fixed schedules", focus: "smart meters", mechanism: "real-time signals", outcome: "balanced demand", limitation: "data privacy", variation: "user habits", planning: "setting tariffs", future: "automated devices" },
    ],
  },
  {
    id: "academic-human-performance",
    title: "Full Test 8: Human performance",
    description: "Original Academic Reading on schedules, recovery and learning skilled work.",
    level: "Intermediate",
    passages: [
      { id: "school-schedules", title: "Why school schedules matter", subtitle: "Aligning lessons with adolescent sleep", context: "secondary schools with very early morning lessons", oldMethod: "early starts", focus: "later lessons", mechanism: "sleep timing", outcome: "better attention", limitation: "bus timetables", variation: "student age", planning: "consulting families", future: "staggered starts" },
      { id: "deliberate-breaks", title: "The science of deliberate breaks", subtitle: "Short pauses and more reliable attention", context: "workplaces built around long uninterrupted sessions", oldMethod: "long sessions", focus: "short pauses", mechanism: "mental recovery", outcome: "fewer errors", limitation: "work pressure", variation: "task complexity", planning: "tracking fatigue", future: "adaptive breaks" },
      { id: "expert-craft", title: "Learning from expert craft", subtitle: "Why observation and feedback support mastery", context: "training programmes for complex manual skills", oldMethod: "written instructions", focus: "guided observation", mechanism: "repeated feedback", outcome: "faster learning", limitation: "limited mentors", variation: "practice time", planning: "recording steps", future: "peer coaching" },
    ],
  },
  {
    id: "academic-land-water",
    title: "Full Test 9: Land and water",
    description: "Original Academic Reading on wetlands, precise irrigation and everyday insect life.",
    level: "Intermediate",
    passages: [
      { id: "urban-wetlands", title: "Wetlands at the edge of cities", subtitle: "Making room for water during heavy rain", context: "fast-growing cities with repeated surface flooding", oldMethod: "storm drains", focus: "restored wetlands", mechanism: "water retention", outcome: "reduced flooding", limitation: "land competition", variation: "seasonal rainfall", planning: "protecting sites", future: "green corridors" },
      { id: "water-farming", title: "Farming with less water", subtitle: "Delivering moisture only where roots need it", context: "dry farming regions facing unreliable rainfall", oldMethod: "flood irrigation", focus: "drip lines", mechanism: "targeted delivery", outcome: "lower use", limitation: "blocked pipes", variation: "soil type", planning: "checking filters", future: "sensor control" },
      { id: "ordinary-insects", title: "The value of ordinary insects", subtitle: "Supporting pollinators beyond protected reserves", context: "farms with simplified field boundaries", oldMethod: "pesticide programmes", focus: "flower strips", mechanism: "habitat diversity", outcome: "more pollinators", limitation: "seasonal mowing", variation: "plant variety", planning: "leaving margins", future: "farm networks" },
    ],
  },
  {
    id: "academic-design-evidence",
    title: "Full Test 10: Design and evidence",
    description: "Original Academic Reading on sound, workplace data and observing distant objects.",
    level: "Advanced",
    passages: [
      { id: "public-acoustics", title: "Acoustics in public spaces", subtitle: "Designing rooms where speech remains clear", context: "busy public buildings with hard internal surfaces", oldMethod: "hard surfaces", focus: "sound panels", mechanism: "sound absorption", outcome: "clearer speech", limitation: "cleaning costs", variation: "room shape", planning: "testing echoes", future: "adjustable ceilings" },
      { id: "wearable-sensors", title: "Wearable sensors at work", subtitle: "Using movement data without losing trust", context: "physical workplaces with changing safety risks", oldMethod: "self reports", focus: "wrist sensors", mechanism: "movement data", outcome: "safer shifts", limitation: "consent rules", variation: "job type", planning: "agreeing safeguards", future: "worker dashboards" },
      { id: "night-sky", title: "Mapping the night sky", subtitle: "Combining images to find fainter objects", context: "small observatories affected by city light", oldMethod: "paper charts", focus: "digital maps", mechanism: "image stacking", outcome: "fainter objects", limitation: "cloud cover", variation: "telescope size", planning: "calibrating cameras", future: "public observatories" },
    ],
  },
];

const ROMAN = ["i", "ii", "iii", "iv", "v", "vi", "vii"] as const;

/** Stable per-passage number, so each passage gets its own heading order and
 *  True/False/Not Given key while the content stays reproducible between
 *  builds. Previously every generated passage shared one answer key
 *  (i, ii, iii, iv / TRUE, FALSE, NOT GIVEN, FALSE), which meant finishing one
 *  test handed the learner the answers to all the others. */
function passageVariant(id: string): number {
  let hash = 0;
  for (let index = 0; index < id.length; index += 1) {
    hash = (hash * 31 + id.charCodeAt(index)) >>> 0;
  }
  return hash;
}

function rotated<T>(items: readonly T[], by: number): T[] {
  const size = items.length;
  const offset = ((by % size) + size) % size;
  return [...items.slice(offset), ...items.slice(0, offset)];
}

/** Four of these describe an assessed paragraph; the other three are
 *  distractors. Real matching-headings tasks always offer more headings than
 *  paragraphs, and never run in paragraph order.
 *
 *  The assessed headings sit at positions 3, 1, 6, 4 for paragraphs A, B, E, G.
 *  Rotation shifts all four by the same amount, so the key is never the
 *  giveaway sequence i, ii, iii, iv at any rotation — including rotation 0. */
const HEADING_BANK = [
  { paragraph: null, text: "A technology that failed to scale" },
  { paragraph: "B", text: "A method rather than a product" },
  { paragraph: null, text: "Changing government funding priorities" },
  { paragraph: "A", text: "Reconsidering a long-standing response" },
  { paragraph: "G", text: "From trial project to wider practice" },
  { paragraph: null, text: "The influence of public opinion" },
  { paragraph: "E", text: "Why the results should be read with care" },
] as const;

function originalAcademicPassage(
  seed: FullTestPassageSeed,
  questionStart: number,
  questionCount: number
): ReadingPassage {
  const variant = passageVariant(seed.id);
  const headingOrder = rotated(HEADING_BANK, variant);
  const headings: ReadingOption[] = headingOrder.map((heading, index) => ({
    value: ROMAN[index],
    label: `${ROMAN[index]}. ${heading.text}`,
  }));
  const headingFor = (paragraph: string) =>
    ROMAN[headingOrder.findIndex((heading) => heading.paragraph === paragraph)];

  const question = (offset: number, input: Omit<ReadingQuestion, "id" | "number">): ReadingQuestion => ({
    ...input,
    id: `${seed.id}-q${questionStart + offset}`,
    number: questionStart + offset,
  });
  const completionAnswers = [
    ["Earlier work relied on ______.", seed.oldMethod, `the standard response relied on ${seed.oldMethod}`],
    ["The newer approach focuses on ______.", seed.focus, `centres on ${seed.focus}`],
    ["Its key process is ______.", seed.mechanism, `Its central mechanism is ${seed.mechanism}`],
    ["Outcomes vary with ______.", seed.variation, `Outcomes also vary with ${seed.variation}`],
    ["Teams begin by ______.", seed.planning, `teams start by ${seed.planning}`],
    ["A future direction is ______.", seed.future, `a plausible future direction is ${seed.future}`],
  ] as const;

  // Six candidate statements, two of each answer type. Four are selected and
  // reordered per passage so the key differs between tests. Every `evidence`
  // string below is a literal substring of the paragraphs — the old NOT GIVEN
  // item quoted "No cost is stated in the passage.", which appeared nowhere in
  // the text the learner was told to search.
  const statements = [
    {
      prompt: `Before the newer approach, the standard response relied on ${seed.oldMethod}.`,
      answer: "TRUE",
      explanation: "Paragraph A states this directly.",
      evidence: `the standard response relied on ${seed.oldMethod}`,
    },
    {
      prompt: "Trials lasting a full season produced more dependable evidence than shorter ones.",
      answer: "TRUE",
      explanation: "Paragraph D contrasts multi-season trials with shorter ones whose gains proved unreliable.",
      evidence: "The strongest results have come from projects that ran long enough to observe a full seasonal cycle",
    },
    {
      prompt: "The passage states that outcomes are the same at every site.",
      answer: "FALSE",
      explanation: "Paragraph E says the opposite: results differ enough to make comparison misleading.",
      evidence: `Outcomes also vary with ${seed.variation}`,
    },
    {
      prompt: "The writer suggests the approach can be adopted successfully without preparation.",
      answer: "FALSE",
      explanation: "Paragraph G calls preparation decisive and describes what teams must establish first.",
      evidence: "preparation appears to be decisive",
    },
    {
      prompt: `The newer approach costs less to install than ${seed.oldMethod}.`,
      answer: "NOT GIVEN",
      explanation:
        "Paragraph F discusses resources being diverted from other programmes, but the passage never compares installation costs.",
      evidence: "resources committed here are resources withdrawn from established programmes",
    },
    {
      prompt: "Most researchers now agree the older approach should be abandoned.",
      answer: "NOT GIVEN",
      explanation:
        "Paragraph F reports continuing disagreement but gives no indication of how many researchers hold either view.",
      evidence: "Both positions have merit, and the disagreement is unlikely to be settled by a single study",
    },
  ] as const;

  // Take one TRUE, one FALSE and one NOT GIVEN, plus a fourth from a rotating
  // pair, then reorder — so neither the composition nor the sequence repeats.
  // `digit` avoids `>>`, which is a signed shift and turns the unsigned hash
  // negative above 2^31, producing out-of-range indices.
  const digit = (place: number, base: number) =>
    Math.floor(variant / base ** place) % base;
  const trueIndex = digit(0, 2);
  const falseIndex = digit(1, 2);
  const notGivenIndex = digit(2, 2);
  const extraPair = digit(0, 3);
  const extra = [
    statements[1 - trueIndex],
    statements[2 + (1 - falseIndex)],
    statements[4 + (1 - notGivenIndex)],
  ][extraPair];

  const picked = rotated(
    [
      statements[trueIndex],
      statements[2 + falseIndex],
      statements[4 + notGivenIndex],
      extra,
    ],
    digit(1, 4)
  );

  return {
    id: seed.id,
    title: seed.title,
    subtitle: seed.subtitle,
    paragraphs: [
      {
        label: "A",
        text: `In ${seed.context}, ${seed.title.toLowerCase()} has moved from a marginal interest to a mainstream research question. For most of the past century the standard response relied on ${seed.oldMethod}, an approach with the considerable advantages of being simple to specify, straightforward to fund and easy to explain to the public. Its logic was essentially additive: where a system underperformed, the remedy was to supply more of whatever it appeared to lack. That reasoning produced measurable results for several decades, and it would be unfair to characterise it as a failure. What has changed is the context in which it operates. As demands have intensified, the limitations of a single-variable solution have become harder to overlook, and researchers have begun asking whether the problem was ever framed correctly in the first place.`,
      },
      {
        label: "B",
        text: `The alternative now attracting attention centres on ${seed.focus}. Rather than treating the difficulty as an isolated technical fault, this approach begins from the observation that the setting already contains processes capable of doing much of the work. Its central mechanism is ${seed.mechanism}, and the design task becomes one of arranging conditions so that this process operates reliably rather than intermittently. Proponents are careful to stress that the change is a method and not a product. Two installations following the same principle may look entirely different, because the principle specifies what must happen rather than what must be built.`,
      },
      {
        label: "C",
        text: `In practice the mechanism works through a sequence rather than a single step. ${seed.mechanism.charAt(0).toUpperCase()}${seed.mechanism.slice(1)} is initiated by conditions already common in ${seed.context}, so the intervention required is often surprisingly modest. What matters is timing and scale. Too small an intervention produces no measurable effect, while too large a one can overwhelm the very process it was meant to support. Early adopters consistently report that the most demanding judgement is not technical but proportional, and that this judgement improves considerably with local experience rather than with better equipment.`,
      },
      {
        label: "D",
        text: `Pilot studies have reported ${seed.outcome}, and these findings have since been reproduced at several independent sites. The strongest results have come from projects that ran long enough to observe a full seasonal cycle; shorter trials tend to record improvements that later prove to have been produced by unusually favourable conditions. Reviewers therefore place more weight on the small number of multi-year studies than on the much larger body of short-term reports, even though the latter are more widely cited in the general press.`,
      },
      {
        label: "E",
        text: `The evidence nonetheless has to be interpreted cautiously. One recurring practical limitation is ${seed.limitation}, which can determine whether a trial is realistic beyond a well-supported research site. Outcomes also vary with ${seed.variation}, on occasion to a degree that makes direct comparison between projects actively misleading. None of this makes the approach ineffective. It explains why any serious report now describes its setting in detail, and why the research community has grown sceptical of headline figures presented without that context.`,
      },
      {
        label: "F",
        text: `Not everyone is persuaded. Critics point out that enthusiasm for a new method frequently outruns the evidence supporting it, and that resources committed here are resources withdrawn from established programmes which, whatever their limits, are known to work. Supporters respond that the comparison is unfair, since ${seed.oldMethod} was itself widely adopted long before it had been rigorously evaluated. Both positions have merit, and the disagreement is unlikely to be settled by a single study.`,
      },
      {
        label: "G",
        text: `For wider adoption, preparation appears to be decisive. Implementation typically begins when teams start by ${seed.planning}, since this establishes what local conditions actually are before any commitment is made. Teams can then adapt the method to local constraints, monitor results against a baseline and explain the trade-offs to the people affected. Where those steps are followed, a plausible future direction is ${seed.future}. The value of the work may therefore lie less in any single successful pilot than in a repeatable process for making better decisions under uncertainty.`,
      },
    ],
    questions: [
      question(0, { group: `Questions ${questionStart}-${questionStart + 3}: Matching headings`, kind: "matching-headings", prompt: "Choose the best heading for paragraph A.", options: headings, answer: headingFor("A"), explanation: "Paragraph A sets out the long-standing earlier response and explains why it is now being reconsidered.", evidence: `the standard response relied on ${seed.oldMethod}` }),
      question(1, { group: `Questions ${questionStart}-${questionStart + 3}: Matching headings`, kind: "matching-headings", prompt: "Choose the best heading for paragraph B.", options: headings, answer: headingFor("B"), explanation: "Paragraph B stresses that the change is a method rather than a product, since two installations may look entirely different.", evidence: "the change is a method and not a product" }),
      question(2, { group: `Questions ${questionStart}-${questionStart + 3}: Matching headings`, kind: "matching-headings", prompt: "Choose the best heading for paragraph E.", options: headings, answer: headingFor("E"), explanation: "Paragraph E is about interpreting the evidence cautiously and why comparisons can mislead.", evidence: "The evidence nonetheless has to be interpreted cautiously" }),
      question(3, { group: `Questions ${questionStart}-${questionStart + 3}: Matching headings`, kind: "matching-headings", prompt: "Choose the best heading for paragraph G.", options: headings, answer: headingFor("G"), explanation: "Paragraph G describes the preparation that moves the method from a trial to wider adoption.", evidence: `teams start by ${seed.planning}` }),
      ...picked.map((statement, index) =>
        question(4 + index, {
          group: `Questions ${questionStart + 4}-${questionStart + 7}: True / False / Not Given`,
          kind: "true-false-not-given",
          prompt: statement.prompt,
          options: tfng,
          answer: statement.answer,
          explanation: statement.explanation,
          evidence: statement.evidence,
        })
      ),
      ...completionAnswers.slice(0, questionCount - 8).map(([prompt, answer, evidence], index) => question(index + 8, { group: `Questions ${questionStart + 8}-${questionStart + questionCount - 1}: Sentence completion`, kind: "sentence-completion", prompt: `Complete the sentence. ${prompt}`, instruction: "Write NO MORE THAN THREE WORDS.", answer, acceptedAnswers: [answer], explanation: "The answer is stated directly in the passage.", evidence })),
    ],
  };
}

function originalFullTest(seed: FullTestSeed): ReadingPracticeTest {
  return {
    id: seed.id,
    title: seed.title,
    description: seed.description,
    track: "Cambridge-style",
    level: seed.level,
    minutes: 60,
    passages: [
      originalAcademicPassage(seed.passages[0], 1, 13),
      originalAcademicPassage(seed.passages[1], 14, 13),
      originalAcademicPassage(seed.passages[2], 27, 14),
    ],
  };
}

const ORIGINAL_FULL_TESTS = FULL_TEST_SEEDS.map(originalFullTest);

/** Re-opens a full-test passage as a standalone practice set.
 *
 *  Inside a three-passage test these questions are numbered 14-26 or 27-40. On
 *  their own they have to start at 1, otherwise a 13-question set opens at
 *  "Question 14" and looks as though something is missing. The passage id is
 *  deliberately preserved so highlights made in one context still show in the
 *  other; only the question numbering is rebased. */
function standalonePassage(passage: ReadingPassage): ReadingPassage {
  const shift = Math.min(...passage.questions.map((question) => question.number)) - 1;
  if (shift === 0) return passage;
  return {
    ...passage,
    questions: passage.questions.map((question) => ({
      ...question,
      number: question.number - shift,
      group: question.group.replace(/\d+/g, (value) => String(Number(value) - shift)),
    })),
  };
}

export const READING_PRACTICE_TESTS: ReadingPracticeTest[] = [
  {
    id: "academic-city-systems",
    title: "Full Test 1: City systems",
    description: "A complete Cambridge-style practice test about urban design, engineering and public learning.",
    track: "Cambridge-style",
    level: "Advanced",
    minutes: 60,
    passages: [roofGardens, aerofoil, cityLibraries],
  },
  ...ORIGINAL_FULL_TESTS,
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
    passages: [standalonePassage(roofGardens)],
  },
  {
    id: "academic-aerofoil",
    title: "Science and design: The shape of lift",
    description: "Matching information, Yes / No / Not Given and sentence completion.",
    track: "Academic",
    level: "Advanced",
    minutes: 20,
    passages: [standalonePassage(aerofoil)],
  },
  {
    id: "academic-libraries",
    title: "Society: Public libraries in a digital city",
    description: "Multiple choice, matching features, completion and diagram labels.",
    track: "Academic",
    level: "Advanced",
    minutes: 20,
    passages: [standalonePassage(cityLibraries)],
  },
];

export const READING_FULL_TESTS = READING_PRACTICE_TESTS.filter(
  (test) => test.track === "Cambridge-style"
);

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


/** Published raw-score conversions for the 40-question Reading papers, as the
 *  ratio at the bottom of each band. General Training is marked more strictly
 *  than Academic at the same raw score, so the two tracks cannot share a curve.
 */
const ACADEMIC_BAND_TABLE: ReadonlyArray<readonly [number, number]> = [
  [0.975, 9], [0.925, 8.5], [0.875, 8], [0.825, 7.5], [0.75, 7],
  [0.675, 6.5], [0.575, 6], [0.475, 5.5], [0.375, 5], [0.325, 4.5],
  [0.25, 4], [0.2, 3.5], [0.15, 3],
];

const GENERAL_BAND_TABLE: ReadonlyArray<readonly [number, number]> = [
  [1, 9], [0.975, 8.5], [0.9, 8], [0.85, 7.5], [0.775, 7],
  [0.7, 6.5], [0.6, 6], [0.475, 5.5], [0.375, 5], [0.3, 4.5],
  [0.225, 4], [0.15, 3.5], [0.1, 3],
];

/** Below this many questions, one answer moves the result by a whole band or
 *  more, so a single figure would be misleading. */
export const RELIABLE_QUESTION_COUNT = 20;

export function readingBand(
  score: number,
  total: number,
  track: ReadingPracticeTest["track"]
): { band: number; approximate: boolean } {
  const ratio = total ? score / total : 0;
  const table = track === "General Training" ? GENERAL_BAND_TABLE : ACADEMIC_BAND_TABLE;
  const match = table.find(([threshold]) => ratio >= threshold);
  return { band: match ? match[1] : 2.5, approximate: total < RELIABLE_QUESTION_COUNT };
}
