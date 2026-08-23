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

// --- Hand-authored full tests sourced from public-domain US government
// science agencies (USGS/NASA/NOAA), adapted into IELTS Academic Reading
// format — not AI-generated placeholders, not Cambridge/IDP/British
// Council content. Each passage cites its real source at the top.

// Source: https://www.usgs.gov/programs/VHP (public domain, USGS.gov)
// Source: https://www.usgs.gov/mission-areas/natural-hazards/science/volcano-hazards (public domain, USGS.gov)
// Source: https://www.usgs.gov/programs/VHP/comprehensive-monitoring-provides-timely-warnings-volcano-reawakening (public domain, USGS.gov)
// Source: https://www.usgs.gov/faqs/how-can-we-tell-when-a-volcano-will-erupt (public domain, USGS.gov)
// Source: https://volcanoes.usgs.gov/vdap/instruments.html (public domain, USGS.gov)
// Source: https://www.usgs.gov/observatories/hvo/science/deformation-monitoring-tracks-moving-magma-and-faults (public domain, USGS.gov)
// Source: https://www.usgs.gov/programs/VHP/insar-satellite-based-technique-captures-overall-deformation-picture (public domain, USGS.gov)
// Source: https://www.usgs.gov/programs/VHP/vhp-uses-monitoring-data-and-volcanic-history-forecast-eruptions (public domain, USGS.gov)
// Source: https://www.usgs.gov/faqs/how-far-advance-could-scientists-predict-eruption-yellowstone-volcano (public domain, USGS.gov)
// Source: https://www.usgs.gov/news/featured-story/remembering-mount-pinatubo-25-years-ago-mitigating-a-crisis (public domain, USGS.gov)
// Source: https://www.usgs.gov/news/featured-story/international-volcano-scientists-unite (public domain, USGS.gov)

const volcanoBasics: ReadingPassage = {
  id: "volcano-hazards-basics",
  title: "Reading the warning signs: volcano hazards and early monitoring",
  subtitle: "How the USGS Volcano Hazards Program tracks danger before an eruption begins",
  paragraphs: [
    { label: "A", text: "The United States is home to around 160 potentially active volcanoes, from the ice-capped peaks of the Cascade Range to the remote islands of the Aleutian chain. The agency responsible for tracking them, the U.S. Geological Survey's Volcano Hazards Program, states that its purpose is to deliver forecasts, warnings and information based on a scientific understanding of volcanic processes, in order to enhance public safety and minimise social and economic disruption from volcanic unrest and eruption. To do this, the program runs five regional observatories, based in Alaska, California, the Cascades, Hawaii and Yellowstone, each responsible for a distinct geographic area. Their work is coordinated through the National Volcano Early Warning System, a nationwide framework designed to make sure that monitoring effort is matched to the level of risk each volcano poses." },
    { label: "B", text: "A single eruption can threaten people and property in several different ways at once. Fast-moving flows of hot ash, gas and rock fragments, known as pyroclastic flows, can travel down a volcano's slopes at speeds that make escape impossible for anyone caught in their path. Lava flows move more slowly but can bury roads, farmland and buildings under molten rock. Volcanic ash, ejected high into the atmosphere, drifts downwind and can contaminate water supplies, collapse roofs under its weight when wet, and ground aircraft for days. Melting snow and ice on a volcano's summit can combine with loose ash and debris to form a lahar, a fast-moving slurry that behaves like wet concrete and can travel far beyond the volcano itself. Notably, some of these hazards, particularly landslides, can occur on a volcano even without an eruption taking place at all." },
    { label: "C", text: "Before an eruption begins, a volcano usually gives some indication that magma or other fluids are moving beneath it. The clearest sign is often an increase in the frequency and intensity of earthquakes that can be felt by people living nearby, since rising magma forces its way through solid rock and generates detectable seismic activity. Other signs include new or noticeably stronger steaming and fumarolic activity, patches of ground that become unusually hot, subtle swelling of the ground surface as material accumulates underground, small but measurable changes in heat flow, and shifts in the chemical composition of the gases escaping from vents and fumaroles. Individually, none of these signs proves that an eruption is coming, but taken together they give scientists a picture of what is happening far below the surface." },
    { label: "D", text: "None of these warning signs guarantees that an eruption will actually follow. Precursory activity can continue for weeks, months or even years before an eruption begins, and it can just as easily fade away without ever being followed by one. At Campi Flegrei, a volcanic area near Naples in Italy, signs of unrest have continued on and off for more than sixty years without producing an eruption, a reminder that patience and continuous observation matter as much as any single reading. This is one reason scientists are cautious about issuing warnings on the strength of one instrument or one anomalous reading alone." },
    { label: "E", text: "There is, however, an important exception. Steam-blast eruptions, in which superheated water trapped underground suddenly flashes into steam, can occur with little or no warning at all, because they do not necessarily depend on fresh magma rising toward the surface. Because these explosions can be triggered by comparatively small and rapid changes in underground pressure, they are far harder to forecast than eruptions driven by magma, and they remain one of the more unpredictable hazards that a volcano observatory has to plan for." },
    { label: "F", text: "To help communities prepare, the Volcano Hazards Program produces high-resolution hazard-zonation maps, each with an accompanying explanation, that show which locations around a given volcano are most exposed to lava flows, ash fall, pyroclastic flows and lahars. These maps are built from the geological record of past eruptions and are shared with emergency planners so that evacuation routes and safe zones can be worked out long before they are ever needed. The program also works directly with local communities on preparedness planning, since a hazard map is only useful if the people who need it know it exists and understand what it means." },
    { label: "G", text: "Producing this kind of forecast depends on comprehensive, continuous monitoring, not just a burst of attention once a volcano starts to show signs of unrest. Instrument networks stay in place even when a volcano is quiet, because comparing later readings against a calm, well-documented baseline is what allows scientists to recognise when something unusual is happening. The instruments themselves, and how they are combined to build that fuller picture, are the subject of ongoing development across the volcano observatory network." },
  ],
  questions: [
    {
      id: "volcano-q1", number: 1, group: "Questions 1-4: Matching headings", kind: "matching-headings",
      prompt: "Choose the best heading for paragraph A.",
      options: [
        { value: "i", label: "i. Physical signs that often appear before an eruption" },
        { value: "ii", label: "ii. A hazard that can strike with almost no warning" },
        { value: "iii", label: "iii. The economic cost of volcanic disasters worldwide" },
        { value: "iv", label: "iv. The purpose and structure of a national monitoring network" },
        { value: "v", label: "v. Turning geological records into public hazard maps" },
        { value: "vi", label: "vi. Why warning signs do not always lead to an eruption" },
        { value: "vii", label: "vii. Multiple forms of danger from a single eruption" },
      ],
      answer: "iv",
      explanation: "Paragraph A introduces the Volcano Hazards Program's aim and the network of observatories that carry out its monitoring work.",
      evidence: "its purpose is to deliver forecasts, warnings and information based on a scientific understanding of volcanic processes, in order to enhance public safety and minimise social and economic disruption from volcanic unrest and eruption",
    },
    {
      id: "volcano-q2", number: 2, group: "Questions 1-4: Matching headings", kind: "matching-headings",
      prompt: "Choose the best heading for paragraph B.",
      options: [
        { value: "i", label: "i. Physical signs that often appear before an eruption" },
        { value: "ii", label: "ii. A hazard that can strike with almost no warning" },
        { value: "iii", label: "iii. The economic cost of volcanic disasters worldwide" },
        { value: "iv", label: "iv. The purpose and structure of a national monitoring network" },
        { value: "v", label: "v. Turning geological records into public hazard maps" },
        { value: "vi", label: "vi. Why warning signs do not always lead to an eruption" },
        { value: "vii", label: "vii. Multiple forms of danger from a single eruption" },
      ],
      answer: "vii",
      explanation: "Paragraph B lists several distinct hazards, from pyroclastic flows and lava to ash and lahars, that a single eruption can produce.",
      evidence: "Fast-moving flows of hot ash, gas and rock fragments, known as pyroclastic flows, can travel down a volcano's slopes at speeds that make escape impossible for anyone caught in their path.",
    },
    {
      id: "volcano-q3", number: 3, group: "Questions 1-4: Matching headings", kind: "matching-headings",
      prompt: "Choose the best heading for paragraph C.",
      options: [
        { value: "i", label: "i. Physical signs that often appear before an eruption" },
        { value: "ii", label: "ii. A hazard that can strike with almost no warning" },
        { value: "iii", label: "iii. The economic cost of volcanic disasters worldwide" },
        { value: "iv", label: "iv. The purpose and structure of a national monitoring network" },
        { value: "v", label: "v. Turning geological records into public hazard maps" },
        { value: "vi", label: "vi. Why warning signs do not always lead to an eruption" },
        { value: "vii", label: "vii. Multiple forms of danger from a single eruption" },
      ],
      answer: "i",
      explanation: "Paragraph C describes the physical signs, especially increased earthquake activity, that commonly appear before an eruption.",
      evidence: "an increase in the frequency and intensity of earthquakes that can be felt by people living nearby, since rising magma forces its way through solid rock and generates detectable seismic activity",
    },
    {
      id: "volcano-q4", number: 4, group: "Questions 1-4: Matching headings", kind: "matching-headings",
      prompt: "Choose the best heading for paragraph D.",
      options: [
        { value: "i", label: "i. Physical signs that often appear before an eruption" },
        { value: "ii", label: "ii. A hazard that can strike with almost no warning" },
        { value: "iii", label: "iii. The economic cost of volcanic disasters worldwide" },
        { value: "iv", label: "iv. The purpose and structure of a national monitoring network" },
        { value: "v", label: "v. Turning geological records into public hazard maps" },
        { value: "vi", label: "vi. Why warning signs do not always lead to an eruption" },
        { value: "vii", label: "vii. Multiple forms of danger from a single eruption" },
      ],
      answer: "vi",
      explanation: "Paragraph D explains that warning signs can persist for years or disappear without an eruption ever occurring, using Campi Flegrei as an example.",
      evidence: "Precursory activity can continue for weeks, months or even years before an eruption begins, and it can just as easily fade away without ever being followed by one.",
    },
    {
      id: "volcano-q5", number: 5, group: "Questions 5-9: True / False / Not Given", kind: "true-false-not-given",
      prompt: "The Volcano Hazards Program only begins monitoring a volcano once it starts to show signs of unrest.",
      options: [{ value: "TRUE", label: "TRUE" }, { value: "FALSE", label: "FALSE" }, { value: "NOT GIVEN", label: "NOT GIVEN" }],
      answer: "FALSE",
      explanation: "The passage states that monitoring networks remain in place even during quiet periods, not only once unrest begins.",
      evidence: "Instrument networks stay in place even when a volcano is quiet, because comparing later readings against a calm, well-documented baseline is what allows scientists to recognise when something unusual is happening.",
    },
    {
      id: "volcano-q6", number: 6, group: "Questions 5-9: True / False / Not Given", kind: "true-false-not-given",
      prompt: "An increase in earthquake activity near a volcano can indicate that magma is moving beneath it.",
      options: [{ value: "TRUE", label: "TRUE" }, { value: "FALSE", label: "FALSE" }, { value: "NOT GIVEN", label: "NOT GIVEN" }],
      answer: "TRUE",
      explanation: "Paragraph C directly links a rise in felt earthquakes to magma forcing its way through rock.",
      evidence: "an increase in the frequency and intensity of earthquakes that can be felt by people living nearby, since rising magma forces its way through solid rock and generates detectable seismic activity",
    },
    {
      id: "volcano-q7", number: 7, group: "Questions 5-9: True / False / Not Given", kind: "true-false-not-given",
      prompt: "Landslides on a volcano can occur even when there is no eruption taking place.",
      options: [{ value: "TRUE", label: "TRUE" }, { value: "FALSE", label: "FALSE" }, { value: "NOT GIVEN", label: "NOT GIVEN" }],
      answer: "TRUE",
      explanation: "Paragraph B states plainly that landslides can happen on a volcano without an eruption occurring.",
      evidence: "some of these hazards, particularly landslides, can occur on a volcano even without an eruption taking place at all",
    },
    {
      id: "volcano-q8", number: 8, group: "Questions 5-9: True / False / Not Given", kind: "true-false-not-given",
      prompt: "Every period of ground swelling at a volcano is eventually followed by an eruption.",
      options: [{ value: "TRUE", label: "TRUE" }, { value: "FALSE", label: "FALSE" }, { value: "NOT GIVEN", label: "NOT GIVEN" }],
      answer: "FALSE",
      explanation: "Paragraph D says precursory signs, which include swelling, can fade away without ever being followed by an eruption.",
      evidence: "it can just as easily fade away without ever being followed by one",
    },
    {
      id: "volcano-q9", number: 9, group: "Questions 5-9: True / False / Not Given", kind: "true-false-not-given",
      prompt: "The Volcano Hazards Program employs more scientists at its California observatory than at any of its other observatories.",
      options: [{ value: "TRUE", label: "TRUE" }, { value: "FALSE", label: "FALSE" }, { value: "NOT GIVEN", label: "NOT GIVEN" }],
      answer: "NOT GIVEN",
      explanation: "The passage names the five observatories but gives no information about staffing levels at any of them.",
      evidence: "the program runs five regional observatories, based in Alaska, California, the Cascades, Hawaii and Yellowstone, each responsible for a distinct geographic area",
    },
    {
      id: "volcano-q10", number: 10, group: "Questions 10-13: Sentence completion", kind: "sentence-completion",
      prompt: "Complete the sentence. A ______ eruption, caused by superheated water flashing suddenly into steam, can happen with little or no warning.",
      instruction: "Write ONE WORD ONLY.",
      answer: "steam-blast", acceptedAnswers: ["steam-blast", "steam-blast eruption"],
      explanation: "Paragraph E names this type of eruption and explains that it does not depend on new magma rising, so it can occur with little or no warning.",
      evidence: "Steam-blast eruptions, in which superheated water trapped underground suddenly flashes into steam, can occur with little or no warning at all",
    },
    {
      id: "volcano-q11", number: 11, group: "Questions 10-13: Sentence completion", kind: "sentence-completion",
      prompt: "Complete the sentence. The volcanic area of ______ in Italy has shown signs of unrest on and off for more than sixty years without erupting.",
      instruction: "Write NO MORE THAN TWO WORDS.",
      answer: "Campi Flegrei", acceptedAnswers: ["Campi Flegrei"],
      explanation: "Paragraph D names Campi Flegrei as an area near Naples that has shown intermittent unrest for over sixty years without an eruption.",
      evidence: "At Campi Flegrei, a volcanic area near Naples in Italy, signs of unrest have continued on and off for more than sixty years without producing an eruption",
    },
    {
      id: "volcano-q12", number: 12, group: "Questions 10-13: Sentence completion", kind: "sentence-completion",
      prompt: "Complete the sentence. To help communities prepare, the program produces high-resolution ______, each with an accompanying explanation.",
      instruction: "Write NO MORE THAN THREE WORDS.",
      answer: "hazard-zonation maps", acceptedAnswers: ["hazard-zonation maps", "hazard zonation maps"],
      explanation: "Paragraph F states that the program produces high-resolution hazard-zonation maps with accompanying explanations to guide preparedness.",
      evidence: "the Volcano Hazards Program produces high-resolution hazard-zonation maps, each with an accompanying explanation",
    },
    {
      id: "volcano-q13", number: 13, group: "Questions 10-13: Sentence completion", kind: "sentence-completion",
      prompt: "Complete the sentence. Monitoring effort across the United States is coordinated through the National Volcano ______ System.",
      instruction: "Write NO MORE THAN TWO WORDS.",
      answer: "Early Warning", acceptedAnswers: ["Early Warning"],
      explanation: "Paragraph A names the National Volcano Early Warning System as the framework that coordinates monitoring effort nationally.",
      evidence: "Their work is coordinated through the National Volcano Early Warning System, a nationwide framework designed to make sure that monitoring effort is matched to the level of risk each volcano poses.",
    },
  ],
};

const volcanoMonitoringTech: ReadingPassage = {
  id: "volcano-monitoring-tech",
  title: "Listening to a volcano: the instruments behind the forecast",
  subtitle: "How seismic, ground-deformation, gas and satellite data combine to track volcanic unrest",
  paragraphs: [
    { label: "A", text: "A single instrument rarely tells the whole story of what is happening inside a volcano. Comprehensive monitoring means deploying broad networks of many different kinds of instrument across a volcano, so that several types of observation, including earthquakes, ground movement, volcanic gas, and even the chemistry of nearby rock and water, can be combined into a more complete picture of volcanic activity. This approach proved its worth before the 2004 eruption at Mount St. Helens, when monitoring equipment first recorded a marked increase in earthquake activity; scientists then cross-referenced that seismic signal against gas measurements, ground-deformation data and satellite imagery to work out whether magma was actually moving toward the surface, and to decide what to tell the public." },
    { label: "B", text: "Seismic monitoring is usually the first line of defence. Networks of seismic stations are built to detect and locate the subtle earthquakes that occur as magma forces its way through surrounding rock. Many of these stations run on solar power and relay their readings back to an observatory in real time over low-power radio links, which means they can operate for long periods in remote terrain without regular servicing. Because a single sensor can only tell scientists that shaking occurred, not exactly where, stations are deliberately spread out across a wide area; comparing the arrival time of a given earthquake's waves at several stations allows its location and depth to be triangulated with reasonable precision." },
    { label: "C", text: "Ground deformation is tracked using two complementary instruments: continuous GPS receivers and tiltmeters. At the Hawaiian Volcano Observatory, more than sixty permanent GPS stations transmit data continuously, measuring ground movement to an accuracy of less than a centimetre. Operating in real time, GPS can pick up the comparatively rapid changes associated with magma moving toward the surface in the hours or days before an eruption. Tiltmeters, by contrast, are electronic instruments installed a few metres beneath the ground surface that measure minute changes in the slope of the ground; like GPS, they usually detect rapid tilt changes in the hours or days before an intrusion or eruption. One water-tube tiltmeter at Hawaii's observatory has been in continuous use since 1956, giving it the longest deformation record of any volcano in the world." },
    { label: "D", text: "These instruments reveal a simple underlying pattern. As magma accumulates in an underground reservoir, the ground surface above it typically swells upward, a process known as inflation; as magma later leaves the reservoir, the surface above it subsides again, a process known as deflation. Reading the balance between the two lets scientists infer roughly how much magma is present and where it is heading, well before any of it reaches the surface." },
    { label: "E", text: "Kilauea's south flank offers a striking example of what deformation monitoring can reveal. GPS data show the flank creeping steadily seaward at a rate of several centimetres a year, a slow and continuous motion. Roughly every two years, however, this steady creep is interrupted by a short episode of much faster movement, detected by the same GPS network, that releases roughly as much accumulated strain as a magnitude 5.5 earthquake would if it occurred instantaneously. Without continuous instrumental monitoring, this pattern of gradual creep punctuated by periodic acceleration would be invisible." },
    { label: "F", text: "Gas emissions offer an independent line of evidence, because rising magma carries dissolved gases that begin escaping well before eruption. Scanning ultraviolet spectrometers measure a volcano's output of sulfur dioxide, a key indicator of magma close to the surface; one such solar-powered, telemetered spectrometer was installed in 2016 at Sinabung volcano in Sumatra, Indonesia, specifically to track sulfur dioxide emissions and help forecast the volcano's activity. A complementary instrument, the MultiGAS sensor, measures the ratio of sulfur dioxide to other gases such as carbon dioxide; because different gases separate from magma at different depths, this ratio can reveal how deep the magma sits and which pathways the gas is following on its way to the surface." },
    { label: "G", text: "Satellite radar adds a view that no ground instrument can match. Interferometric Synthetic Aperture Radar, or InSAR, compares two radar images of the same area taken by an orbiting satellite at different times; the difference in phase between the two images reveals how far the ground surface has moved in between. Unlike GPS or tiltmeters, which each measure only a single point, InSAR produces a continuous map of ground deformation covering a large area at centimetre-scale accuracy. Because radar passes through cloud and works equally well in darkness, it is especially valuable at remote or hazardous volcanoes where ground-based monitoring is difficult to maintain. Between 1995 and 2001, InSAR revealed a pattern of ground uplift centred about five kilometres west of South Sister volcano in Oregon, a signal that ground instruments in the area would likely have missed. Satellites from several countries, including Italy, Germany, Canada, Japan and South Korea, now contribute imagery to this kind of analysis." },
    { label: "H", text: "No single one of these techniques is sufficient on its own. Seismic data show where rock is breaking, deformation data show where magma is accumulating or withdrawing, gas data show what is escaping from depth, and satellite radar shows how the whole surface is responding. It is the combination of all four, updated continuously and compared against each volcano's own history, that allows scientists to move from raw data toward an actual forecast of what a volcano might do next." },
  ],
  questions: [
    {
      id: "volcano-q14", number: 14, group: "Questions 14-19: Matching information", kind: "matching-information",
      prompt: "Which paragraph contains the following information? A description of an instrument that has produced the longest continuous ground-deformation record at any volcano.",
      instruction: "Write the correct letter, A-H.",
      options: [
        { value: "A", label: "Paragraph A" }, { value: "B", label: "Paragraph B" }, { value: "C", label: "Paragraph C" },
        { value: "D", label: "Paragraph D" }, { value: "E", label: "Paragraph E" }, { value: "F", label: "Paragraph F" },
        { value: "G", label: "Paragraph G" }, { value: "H", label: "Paragraph H" },
      ],
      answer: "C",
      explanation: "Paragraph C states that a tiltmeter in Hawaii, in continuous use since 1956, has produced the longest deformation record of any volcano.",
      evidence: "One water-tube tiltmeter at Hawaii's observatory has been in continuous use since 1956, giving it the longest deformation record of any volcano in the world.",
    },
    {
      id: "volcano-q15", number: 15, group: "Questions 14-19: Matching information", kind: "matching-information",
      prompt: "Which paragraph contains the following information? An example of a satellite-based measurement made at a volcano in the north-western United States.",
      instruction: "Write the correct letter, A-H.",
      options: [
        { value: "A", label: "Paragraph A" }, { value: "B", label: "Paragraph B" }, { value: "C", label: "Paragraph C" },
        { value: "D", label: "Paragraph D" }, { value: "E", label: "Paragraph E" }, { value: "F", label: "Paragraph F" },
        { value: "G", label: "Paragraph G" }, { value: "H", label: "Paragraph H" },
      ],
      answer: "G",
      explanation: "Paragraph G gives the example of InSAR detecting uplift near South Sister volcano in Oregon between 1995 and 2001.",
      evidence: "Between 1995 and 2001, InSAR revealed a pattern of ground uplift centred about five kilometres west of South Sister volcano in Oregon",
    },
    {
      id: "volcano-q16", number: 16, group: "Questions 14-19: Matching information", kind: "matching-information",
      prompt: "Which paragraph contains the following information? A comparison between a steady, gradual ground movement and a faster, episodic one at the same volcano.",
      instruction: "Write the correct letter, A-H.",
      options: [
        { value: "A", label: "Paragraph A" }, { value: "B", label: "Paragraph B" }, { value: "C", label: "Paragraph C" },
        { value: "D", label: "Paragraph D" }, { value: "E", label: "Paragraph E" }, { value: "F", label: "Paragraph F" },
        { value: "G", label: "Paragraph G" }, { value: "H", label: "Paragraph H" },
      ],
      answer: "E",
      explanation: "Paragraph E contrasts Kilauea's steady seaward creep with the faster episodes of movement that interrupt it roughly every two years.",
      evidence: "GPS data show the flank creeping steadily seaward at a rate of several centimetres a year, a slow and continuous motion. Roughly every two years, however, this steady creep is interrupted by a short episode of much faster movement",
    },
    {
      id: "volcano-q17", number: 17, group: "Questions 14-19: Matching information", kind: "matching-information",
      prompt: "Which paragraph contains the following information? An instrument installed at a volcano in Indonesia to track a specific gas.",
      instruction: "Write the correct letter, A-H.",
      options: [
        { value: "A", label: "Paragraph A" }, { value: "B", label: "Paragraph B" }, { value: "C", label: "Paragraph C" },
        { value: "D", label: "Paragraph D" }, { value: "E", label: "Paragraph E" }, { value: "F", label: "Paragraph F" },
        { value: "G", label: "Paragraph G" }, { value: "H", label: "Paragraph H" },
      ],
      answer: "F",
      explanation: "Paragraph F describes a scanning ultraviolet spectrometer installed at Sinabung volcano in Sumatra, Indonesia, to track sulfur dioxide.",
      evidence: "one such solar-powered, telemetered spectrometer was installed in 2016 at Sinabung volcano in Sumatra, Indonesia, specifically to track sulfur dioxide emissions",
    },
    {
      id: "volcano-q18", number: 18, group: "Questions 14-19: Matching information", kind: "matching-information",
      prompt: "Which paragraph contains the following information? A method of locating earthquakes that depends on comparing readings from several widely spaced sensors.",
      instruction: "Write the correct letter, A-H.",
      options: [
        { value: "A", label: "Paragraph A" }, { value: "B", label: "Paragraph B" }, { value: "C", label: "Paragraph C" },
        { value: "D", label: "Paragraph D" }, { value: "E", label: "Paragraph E" }, { value: "F", label: "Paragraph F" },
        { value: "G", label: "Paragraph G" }, { value: "H", label: "Paragraph H" },
      ],
      answer: "B",
      explanation: "Paragraph B explains that comparing the arrival time of seismic waves at multiple stations allows an earthquake's location to be triangulated.",
      evidence: "comparing the arrival time of a given earthquake's waves at several stations allows its location and depth to be triangulated with reasonable precision",
    },
    {
      id: "volcano-q19", number: 19, group: "Questions 14-19: Matching information", kind: "matching-information",
      prompt: "Which paragraph contains the following information? An explanation of why a technique that does not require instruments on the volcano's slopes is especially useful at dangerous sites.",
      instruction: "Write the correct letter, A-H.",
      options: [
        { value: "A", label: "Paragraph A" }, { value: "B", label: "Paragraph B" }, { value: "C", label: "Paragraph C" },
        { value: "D", label: "Paragraph D" }, { value: "E", label: "Paragraph E" }, { value: "F", label: "Paragraph F" },
        { value: "G", label: "Paragraph G" }, { value: "H", label: "Paragraph H" },
      ],
      answer: "G",
      explanation: "Paragraph G explains that InSAR, unlike ground-based instruments, works from orbit and is therefore valuable at remote or hazardous volcanoes.",
      evidence: "it is especially valuable at remote or hazardous volcanoes where ground-based monitoring is difficult to maintain",
    },
    {
      id: "volcano-q20", number: 20, group: "Questions 20-23: Multiple choice", kind: "multiple-choice",
      prompt: "According to the passage, comprehensive monitoring is valuable mainly because it...",
      options: [
        { value: "A", label: "A. replaces the need for scientists to visit a volcano in person." },
        { value: "B", label: "B. combines several types of observation into a more complete picture of activity." },
        { value: "C", label: "C. is cheaper than relying on a single type of instrument." },
        { value: "D", label: "D. only becomes necessary once unrest has clearly begun." },
      ],
      answer: "B",
      explanation: "Paragraph A explains that comprehensive monitoring combines several types of observation into a more complete picture of activity.",
      evidence: "several types of observation, including earthquakes, ground movement, volcanic gas, and even the chemistry of nearby rock and water, can be combined into a more complete picture of volcanic activity",
    },
    {
      id: "volcano-q21", number: 21, group: "Questions 20-23: Multiple choice", kind: "multiple-choice",
      prompt: "What does the passage state about the GPS network at the Hawaiian Volcano Observatory?",
      options: [
        { value: "A", label: "A. It consists of fewer than ten stations." },
        { value: "B", label: "B. It cannot detect movement smaller than several centimetres." },
        { value: "C", label: "C. It measures ground movement to an accuracy of less than a centimetre." },
        { value: "D", label: "D. It was installed after the 2004 unrest at Mount St. Helens." },
      ],
      answer: "C",
      explanation: "Paragraph C states that the more than sixty GPS stations measure ground movement to an accuracy of less than a centimetre.",
      evidence: "more than sixty permanent GPS stations transmit data continuously, measuring ground movement to an accuracy of less than a centimetre",
    },
    {
      id: "volcano-q22", number: 22, group: "Questions 20-23: Multiple choice", kind: "multiple-choice",
      prompt: "Why are MultiGAS sensors useful to volcanologists, according to the passage?",
      options: [
        { value: "A", label: "A. They measure the temperature of magma directly." },
        { value: "B", label: "B. They reveal how deep magma sits and which pathways gas follows, from the ratio of gases detected." },
        { value: "C", label: "C. They remove the need for seismic monitoring." },
        { value: "D", label: "D. They can only be used during daylight hours." },
      ],
      answer: "B",
      explanation: "Paragraph F explains that the ratio of sulfur dioxide to other gases measured by MultiGAS sensors reveals magma depth and gas pathways.",
      evidence: "this ratio can reveal how deep the magma sits and which pathways the gas is following on its way to the surface",
    },
    {
      id: "volcano-q23", number: 23, group: "Questions 20-23: Multiple choice", kind: "multiple-choice",
      prompt: "What advantage does InSAR have over ground-based deformation instruments, according to the passage?",
      options: [
        { value: "A", label: "A. It is unaffected by cloud cover or darkness and covers a much larger area." },
        { value: "B", label: "B. It gives a more precise reading at a single point than a tiltmeter." },
        { value: "C", label: "C. It requires instruments to be installed directly on the volcano's slopes." },
        { value: "D", label: "D. It can only be used on volcanoes that are already erupting." },
      ],
      answer: "A",
      explanation: "Paragraph G states that InSAR covers a large area at centimetre-scale accuracy and, unlike ground instruments, works through cloud and in darkness.",
      evidence: "InSAR produces a continuous map of ground deformation covering a large area at centimetre-scale accuracy. Because radar passes through cloud and works equally well in darkness, it is especially valuable at remote or hazardous volcanoes",
    },
    {
      id: "volcano-q24", number: 24, group: "Questions 24-26: Summary completion", kind: "summary-completion",
      prompt: "Complete the sentence. As magma accumulates beneath a volcano, the ground surface typically swells upward in a process called ______.",
      instruction: "Write ONE WORD ONLY.",
      answer: "inflation", acceptedAnswers: ["inflation"],
      explanation: "Paragraph D names this upward swelling process as inflation.",
      evidence: "the ground surface above it typically swells upward, a process known as inflation",
    },
    {
      id: "volcano-q25", number: 25, group: "Questions 24-26: Summary completion", kind: "summary-completion",
      prompt: "Complete the sentence. Sensors buried a few metres underground that detect minute changes in the angle of the ground surface are called ______.",
      instruction: "Write ONE WORD ONLY.",
      answer: "tiltmeters", acceptedAnswers: ["tiltmeters", "Tiltmeters"],
      explanation: "Paragraph C identifies tiltmeters as the instruments installed beneath the surface that measure changes in ground slope.",
      evidence: "Tiltmeters, by contrast, are electronic instruments installed a few metres beneath the ground surface that measure minute changes in the slope of the ground",
    },
    {
      id: "volcano-q26", number: 26, group: "Questions 24-26: Summary completion", kind: "summary-completion",
      prompt: "Complete the sentence. At Kilauea, the brief episodes of accelerated seaward movement that interrupt the south flank's steady creep release about as much strain as a magnitude ______ earthquake.",
      instruction: "Write NO MORE THAN TWO WORDS OR A NUMBER.",
      answer: "5.5", acceptedAnswers: ["5.5"],
      explanation: "Paragraph E states that these episodes release roughly as much strain as a magnitude 5.5 earthquake would release instantaneously.",
      evidence: "that releases roughly as much accumulated strain as a magnitude 5.5 earthquake would if it occurred instantaneously",
    },
  ],
};

const volcanoForecasting: ReadingPassage = {
  id: "volcano-forecasting-uncertainty",
  title: "The limits of forecasting: probability, precedent and two contrasting eruptions",
  subtitle: "Why accurate science does not guarantee that a warning saves lives",
  paragraphs: [
    { label: "A", text: "Forecasting an eruption is not the same as predicting one with certainty. USGS scientists combine two complementary approaches. Longer-term forecasts draw on a volcano's geologic past: by cataloguing the size, timing and style of well-characterised eruptions preserved in the rock record, scientists can estimate how frequently a given volcano erupts and what kind of eruption is most likely when it does. Shorter-term forecasts depend instead on real-time monitoring data, interpreted against an established baseline of normal, quiet-period behaviour. Because that baseline is essential, volcanologists deliberately collect monitoring data even when a volcano shows no sign of unrest, so that a later, unusual reading can actually be recognised as unusual." },
    { label: "B", text: "A useful eruption forecast has to address several distinct questions at once: whether an eruption will happen at all, what style it is likely to take, what physical mechanism might trigger its onset, roughly when it might begin, how long it might continue, and what sequence of events might follow. Because a single volcano is capable of erupting in more than one way, scientists do not offer one fixed answer to these questions. Instead, they construct volcanic event trees, branching diagrams in which each possible path, from renewed quiet to a major explosive eruption, is assigned its own estimated probability. These trees are not fixed once and for all; they are continually updated as unrest unfolds, or revised again once an eruption has actually occurred." },
    { label: "C", text: "This probabilistic approach exists precisely because identical-looking warning signs do not always lead to the same outcome. At Yellowstone, for example, small earthquakes, gradual ground uplift and subsidence, and minor gas releases are common, ordinary events that do not, on their own, signal an approaching eruption; observatory staff instead watch for activity that substantially and simultaneously exceeds this background level at multiple locations. Even so, scientists believe that a genuinely catastrophic eruption at Yellowstone would likely be preceded by strong earthquake swarms and rapid ground deformation detectable for weeks, and quite possibly months or years, in advance, and that forecasting methods of this kind have advanced considerably over the past twenty-five years." },
    { label: "D", text: "The 1991 eruption of Mount Pinatubo in the Philippines shows this system working as intended. After small steam explosions began in early April, Philippine and American scientists began working together through the USGS Volcano Disaster Assistance Program; the combined team set up a temporary observatory, instrumented the volcano with seismometers, tiltmeters and sulfur-dioxide-measuring equipment, and rapidly produced a hazard map based on the deposits left by the volcano's past eruptions. As activity intensified through May and into June, a shallow, progressively climbing earthquake swarm on 6 June, coupled with measurable ground tilting and the extrusion of a small lava dome, prompted officials to evacuate thousands of people, including non-essential military personnel, to a safe distance well outside the mapped hazard zone. A further, larger eruption on 12 June removed any remaining doubt about the wisdom of that decision." },
    { label: "E", text: "Three days later, on 15 June, the climactic eruption sent an ash column roughly 28 miles into the atmosphere, collapsed the summit into a caldera more than a mile and a half across, and buried nearby valleys under pyroclastic deposits hundreds of feet thick. A typhoon struck the area at almost exactly the same time, and the resulting rain mixed with falling ash across a far wider area than the eruption alone would have covered. Several hundred people nonetheless died, mostly when roofs collapsed under the weight of rain-soaked ash, yet the evacuation carried out beforehand is credited with saving more than five thousand lives and around 250 million dollars in property that would otherwise have been lost." },
    { label: "F", text: "Nevado del Ruiz, in Colombia, shows the same science failing to prevent a disaster, not because the forecast was wrong but because the warning did not reach the people who needed it in time. The volcano began showing signs of unrest in December 1984, and by October 1985 an international team of scientists had completed a hazard assessment that correctly anticipated the kind of disaster that eventually occurred. Despite this, the resulting warnings were not disseminated widely enough, nor acted upon quickly enough, once the volcano erupted the following month. Meltwater from the volcano's summit ice cap combined with loose debris to form a lahar that swept downstream and destroyed the town of Armero, killing more than 23,000 people even though the danger had already been substantially foreseen." },
    { label: "G", text: "Together, the two events show that accurate forecasting is necessary but not sufficient: it must be matched by a warning system that reaches people in time and prompts them to act. The Nevado del Ruiz disaster prompted USGS and the US Agency for International Development to jointly create the Volcano Disaster Assistance Program, known as VDAP, in 1986, specifically to help other countries respond to volcanic emergencies by supplying monitoring equipment and expertise on short notice. The lesson carried by both case studies is the same one scientists still repeat today: a forecast is only as useful as the response it manages to trigger." },
  ],
  questions: [
    {
      id: "volcano-q27", number: 27, group: "Questions 27-30: Yes / No / Not Given", kind: "yes-no-not-given",
      prompt: "The scientists interpreting monitoring data need an established record of a volcano's normal, quiet-period behaviour before they can recognise unusual activity.",
      options: [{ value: "YES", label: "YES" }, { value: "NO", label: "NO" }, { value: "NOT GIVEN", label: "NOT GIVEN" }],
      answer: "YES",
      explanation: "Paragraph A states that scientists deliberately collect baseline data during quiet periods so that a later unusual reading can be recognised as unusual.",
      evidence: "volcanologists deliberately collect monitoring data even when a volcano shows no sign of unrest, so that a later, unusual reading can actually be recognised as unusual",
    },
    {
      id: "volcano-q28", number: 28, group: "Questions 27-30: Yes / No / Not Given", kind: "yes-no-not-given",
      prompt: "Because Yellowstone regularly shows small earthquakes, ground movement and gas releases, scientists treat each of these events individually as a sign that an eruption is imminent.",
      options: [{ value: "YES", label: "YES" }, { value: "NO", label: "NO" }, { value: "NOT GIVEN", label: "NOT GIVEN" }],
      answer: "NO",
      explanation: "Paragraph C states that these events are common at Yellowstone and do not, on their own, signal an approaching eruption; only a much larger, simultaneous deviation is treated as significant.",
      evidence: "small earthquakes, gradual ground uplift and subsidence, and minor gas releases are common, ordinary events that do not, on their own, signal an approaching eruption",
    },
    {
      id: "volcano-q29", number: 29, group: "Questions 27-30: Yes / No / Not Given", kind: "yes-no-not-given",
      prompt: "The volcanic event trees used by USGS scientists were originally developed as a tool for forecasting earthquakes.",
      options: [{ value: "YES", label: "YES" }, { value: "NO", label: "NO" }, { value: "NOT GIVEN", label: "NOT GIVEN" }],
      answer: "NOT GIVEN",
      explanation: "The passage explains what event trees are and how they are used for volcanoes, but says nothing about their origin in earthquake forecasting.",
      evidence: "they construct volcanic event trees, branching diagrams in which each possible path, from renewed quiet to a major explosive eruption, is assigned its own estimated probability",
    },
    {
      id: "volcano-q30", number: 30, group: "Questions 27-30: Yes / No / Not Given", kind: "yes-no-not-given",
      prompt: "The evacuation carried out before Pinatubo's climactic eruption prevented any deaths connected with the eruption.",
      options: [{ value: "YES", label: "YES" }, { value: "NO", label: "NO" }, { value: "NOT GIVEN", label: "NOT GIVEN" }],
      answer: "NO",
      explanation: "The passage states that several hundred people still died, mostly from roofs collapsing under rain-soaked ash, despite the evacuation.",
      evidence: "Several hundred people nonetheless died, mostly when roofs collapsed under the weight of rain-soaked ash",
    },
    {
      id: "volcano-q31", number: 31, group: "Questions 31-35: Multiple choice", kind: "multiple-choice",
      prompt: "What best distinguishes longer-term from shorter-term eruption forecasting, according to the passage?",
      options: [
        { value: "A", label: "A. Longer-term forecasting relies on instruments; shorter-term forecasting relies only on historical records." },
        { value: "B", label: "B. Longer-term forecasting draws on the geological record of past eruptions; shorter-term forecasting relies on real-time data compared against a quiet-period baseline." },
        { value: "C", label: "C. Longer-term forecasting is always more accurate than shorter-term forecasting." },
        { value: "D", label: "D. Shorter-term forecasting is only carried out once an eruption is already underway." },
      ],
      answer: "B",
      explanation: "Paragraph A defines longer-term forecasting as based on the geologic past and shorter-term forecasting as based on real-time data compared with a baseline.",
      evidence: "Longer-term forecasts draw on a volcano's geologic past: by cataloguing the size, timing and style of well-characterised eruptions preserved in the rock record, scientists can estimate how frequently a given volcano erupts and what kind of eruption is most likely when it does. Shorter-term forecasts depend instead on real-time monitoring data, interpreted against an established baseline of normal, quiet-period behaviour.",
    },
    {
      id: "volcano-q32", number: 32, group: "Questions 31-35: Multiple choice", kind: "multiple-choice",
      prompt: "Why do USGS scientists use volcanic event trees rather than issuing one single fixed forecast?",
      options: [
        { value: "A", label: "A. Regulations require that only probabilistic statements be issued to the public." },
        { value: "B", label: "B. A given volcano can erupt in more than one way, so a branching structure can represent a range of weighted possibilities." },
        { value: "C", label: "C. Event trees are simpler to communicate to the public than a hazard map." },
        { value: "D", label: "D. Past eruptions at any one volcano are always identical in style." },
      ],
      answer: "B",
      explanation: "Paragraph B explains that because a volcano can erupt in more than one way, scientists build a branching event tree with a probability assigned to each path, rather than giving one fixed answer.",
      evidence: "Because a single volcano is capable of erupting in more than one way, scientists do not offer one fixed answer to these questions. Instead, they construct volcanic event trees, branching diagrams in which each possible path, from renewed quiet to a major explosive eruption, is assigned its own estimated probability.",
    },
    {
      id: "volcano-q33", number: 33, group: "Questions 31-35: Multiple choice", kind: "multiple-choice",
      prompt: "In the case of Mount Pinatubo, what finally removed any remaining doubt about the need for evacuation?",
      options: [
        { value: "A", label: "A. The publication of the hazard map based on past eruption deposits." },
        { value: "B", label: "B. The arrival of the USGS Volcano Disaster Assistance Program team." },
        { value: "C", label: "C. A further, larger eruption on 12 June, three days before the climactic explosion." },
        { value: "D", label: "D. The onset of a typhoon over the area." },
      ],
      answer: "C",
      explanation: "Paragraph D states that a further, larger eruption on 12 June removed any remaining doubt about the evacuation decision.",
      evidence: "A further, larger eruption on 12 June removed any remaining doubt about the wisdom of that decision.",
    },
    {
      id: "volcano-q34", number: 34, group: "Questions 31-35: Multiple choice", kind: "multiple-choice",
      prompt: "What do the Pinatubo and Nevado del Ruiz case studies together suggest about eruption forecasting, according to the passage?",
      options: [
        { value: "A", label: "A. Forecasting is now precise enough to prevent all volcano-related deaths." },
        { value: "B", label: "B. Accurate scientific forecasting can still fail to save lives if warnings are not communicated and acted upon effectively." },
        { value: "C", label: "C. Lahars are more dangerous than pyroclastic flows in every case." },
        { value: "D", label: "D. Hazard maps are less useful than real-time seismic monitoring." },
      ],
      answer: "B",
      explanation: "Paragraph G draws the explicit conclusion that accurate forecasting is necessary but not sufficient without a warning system that reaches people in time.",
      evidence: "accurate forecasting is necessary but not sufficient: it must be matched by a warning system that reaches people in time and prompts them to act",
    },
    {
      id: "volcano-q35", number: 35, group: "Questions 31-35: Multiple choice", kind: "multiple-choice",
      prompt: "According to the passage, what specifically caused the deaths of most Pinatubo victims, despite the successful evacuation?",
      options: [
        { value: "A", label: "A. Pyroclastic flows reaching evacuation shelters." },
        { value: "B", label: "B. Roofs collapsing under ash made heavy by rain from a concurrent typhoon." },
        { value: "C", label: "C. Toxic gas exposure during the climactic eruption." },
        { value: "D", label: "D. Vehicle accidents during the evacuation itself." },
      ],
      answer: "B",
      explanation: "Paragraph E states that most deaths occurred when roofs collapsed under the weight of rain-soaked ash.",
      evidence: "Several hundred people nonetheless died, mostly when roofs collapsed under the weight of rain-soaked ash",
    },
    {
      id: "volcano-q36", number: 36, group: "Questions 36-40: Summary completion", kind: "summary-completion",
      prompt: "Complete the sentence. By October 1985, an international hazard assessment had already ______ anticipated the disaster that later struck Nevado del Ruiz.",
      instruction: "Write ONE WORD ONLY.",
      answer: "correctly", acceptedAnswers: ["correctly"],
      explanation: "Paragraph F states that the 1985 hazard assessment had correctly anticipated the kind of disaster that eventually occurred.",
      evidence: "by October 1985 an international team of scientists had completed a hazard assessment that correctly anticipated the kind of disaster that eventually occurred",
    },
    {
      id: "volcano-q37", number: 37, group: "Questions 36-40: Summary completion", kind: "summary-completion",
      prompt: "Complete the sentence. When Nevado del Ruiz erupted, meltwater and debris combined to form a ______ that destroyed the town of Armero.",
      instruction: "Write ONE WORD ONLY.",
      answer: "lahar", acceptedAnswers: ["lahar"],
      explanation: "Paragraph F states that meltwater combined with debris to form a lahar that destroyed Armero.",
      evidence: "Meltwater from the volcano's summit ice cap combined with loose debris to form a lahar that swept downstream and destroyed the town of Armero",
    },
    {
      id: "volcano-q38", number: 38, group: "Questions 36-40: Summary completion", kind: "summary-completion",
      prompt: "Complete the sentence. The Armero disaster killed more than ______ people.",
      instruction: "Write NO MORE THAN THREE WORDS OR A NUMBER.",
      answer: "23,000", acceptedAnswers: ["23,000", "23000"],
      explanation: "Paragraph F gives the death toll as more than 23,000 people.",
      evidence: "killing more than 23,000 people even though the danger had already been substantially foreseen",
    },
    {
      id: "volcano-q39", number: 39, group: "Questions 36-40: Summary completion", kind: "summary-completion",
      prompt: "Complete the sentence. Despite accurate warnings, they were not ______ widely enough to prevent the disaster.",
      instruction: "Write ONE WORD ONLY.",
      answer: "disseminated", acceptedAnswers: ["disseminated"],
      explanation: "Paragraph F states that the warnings were not disseminated widely enough, nor acted upon quickly enough.",
      evidence: "the resulting warnings were not disseminated widely enough, nor acted upon quickly enough, once the volcano erupted the following month",
    },
    {
      id: "volcano-q40", number: 40, group: "Questions 36-40: Summary completion", kind: "summary-completion",
      prompt: "Complete the sentence. In direct response to the disaster, USGS and USAID jointly created a program known as ______ in 1986.",
      instruction: "Write ONE WORD ONLY.",
      answer: "VDAP", acceptedAnswers: ["VDAP"],
      explanation: "Paragraph G states that USGS and USAID created the Volcano Disaster Assistance Program, known as VDAP, in 1986.",
      evidence: "USGS and the US Agency for International Development to jointly create the Volcano Disaster Assistance Program, known as VDAP, in 1986",
    },
  ],
};

const academicFullVolcanoHazards: ReadingPracticeTest = {
  id: "academic-full-volcano-hazards",
  title: "Full Test 11: Watching the mountain",
  description: "A complete Cambridge-style practice test about how the USGS Volcano Hazards Program detects unrest, tracks it with seismic, deformation, gas and satellite instruments, and turns that data into eruption forecasts.",
  track: "Cambridge-style",
  level: "Advanced",
  minutes: 60,
  passages: [volcanoBasics, volcanoMonitoringTech, volcanoForecasting],
};
// Source: https://oceanservice.noaa.gov/facts/coral_bleach.html (public domain, NOAA.gov)
// Source: https://oceanservice.noaa.gov/facts/acidification.html (public domain, NOAA.gov)
// Source: https://coralreefwatch.noaa.gov/ (public domain, NOAA.gov)
// Source: https://coralreefwatch.noaa.gov/product/5km/methodology.php (public domain, NOAA.gov)
// Source: https://oceanservice.noaa.gov/education/tutorial_corals/coral07_importance.html (public domain, NOAA.gov)
// Source: https://oceanservice.noaa.gov/education/tutorial_corals/coral08_climatechange.html (public domain, NOAA.gov)
// Source: https://oceanservice.noaa.gov/facts/coral.html (public domain, NOAA.gov)
// Source: https://oceanservice.noaa.gov/facts/coralmadeof.html (public domain, NOAA.gov)
// Source: https://oceanservice.noaa.gov/facts/coralwaters.html (public domain, NOAA.gov)
// Source: https://oceanservice.noaa.gov/education/tutorial_corals/coral05_distribution.html (public domain, NOAA.gov)
// Source: https://www.nesdis.noaa.gov/news/worlds-fourth-mass-coral-bleaching-event-likely-ended-2025 (public domain, NOAA.gov)

const coralReefBasics: ReadingPassage = {
  id: "coral-reef-basics",
  title: "Coral reefs: living infrastructure beneath the waves",
  subtitle: "Why reef-building corals matter far beyond the tropical waters they inhabit",
  paragraphs: [
    {
      label: "A",
      text: "A coral reef looks like a permanent feature of the seafloor, but it is built and constantly rebuilt by living animals. The basic unit of a reef is the polyp, a soft-bodied organism usually no more than a few millimetres across. Each polyp secretes a hard outer skeleton made of calcium carbonate, the same mineral found in limestone. As one generation of polyps dies, new polyps grow directly on top of the skeletons left behind, so a reef is really a shallow layer of living tissue spread over an immense foundation of skeletal remains accumulated over centuries. Through this slow, repeated cycle of growth and death, reef-building corals have created the largest structures of biological origin on Earth.",
    },
    {
      label: "B",
      text: "Reef-building corals cannot achieve this alone. Living inside the tissue of each polyp are millions of microscopic algae called zooxanthellae. The relationship is a genuine partnership: the algae make use of the coral's waste products to carry out photosynthesis, and in exchange they supply the coral with oxygen, remove its waste, and provide the organic compounds the coral needs to grow and to build its skeleton. Because corals themselves cannot manufacture their own food in the way plants do, this partnership, thought to have persisted for around twenty-five million years, supplies most of the energy a reef needs to keep expanding. The algae are also responsible for the vivid colours most people associate with healthy coral.",
    },
    {
      label: "C",
      text: "Because the partnership between coral and algae depends on light, reef-building corals are confined to a narrow set of conditions. Most species grow best in water between 23 and 29 degrees Celsius, and reef-building corals generally cannot tolerate sustained temperatures below 18 degrees Celsius, although a few can survive short spells as warm as 40 degrees Celsius. Reef corals also require quite salty water, typically between 32 and 42 parts per thousand, and the water must be clear enough for sunlight to reach the algae, which usually restricts shallow reef growth to depths where light can still penetrate, roughly the uppermost 30 metres. These combined requirements largely explain why the great majority of reef-building corals are found only in tropical and subtropical waters, roughly between 35 degrees north and 35 degrees south of the equator.",
    },
    {
      label: "D",
      text: "The result of these narrow requirements is a strikingly productive ecosystem. Coral reefs cover only about one per cent of the ocean floor, yet they provide habitat for at least a quarter of all known marine species. A single reef system can be home to well over four thousand species of fish alone, together with countless other corals, molluscs and crustaceans. Few other habitats on the planet pack such a density of species into so small a physical footprint, which is one reason biologists often compare reefs to tropical rainforests.",
    },
    {
      label: "E",
      text: "That biodiversity translates directly into economic value for coastal communities. More than half of the fish species harvested commercially in United States waters depend on coral reefs for at least part of their life cycle, and government agencies put the commercial value of the reef-dependent US fishing industry alone at over one hundred million dollars a year. Tourism adds a further, larger stream of income: local economies collect billions of dollars annually from visitors who come to dive, snorkel or fish around healthy reefs, spending on hotels, restaurants and tour operators along the way. In many small island nations, reef-related tourism and fishing are not simply profitable activities but central pillars of the entire economy.",
    },
    {
      label: "F",
      text: "Reefs also perform a protective function that has nothing to do with tourism revenue. Positioned just offshore, they absorb and break up the energy of incoming waves before it reaches the coast, reducing the impact of ordinary swells as well as storms and flooding. This natural buffering helps to prevent loss of life, limits damage to property, and slows the erosion of beaches and shorelines. For low-lying coastal settlements, an intact reef can function as a form of infrastructure that would be extremely expensive to replace with artificial barriers.",
    },
    {
      label: "G",
      text: "Finally, reefs are a source of biochemical discovery. Scientists have identified compounds in reef-dwelling animals and plants that are now being developed into treatments for cancer, arthritis, bacterial infections and viral diseases, precisely because reef organisms have evolved unusual chemical defences to survive in such crowded, competitive environments. Given how much coral reefs contribute, biologically, economically and medically, their recent decline in many parts of the world is not a narrow scientific concern but a loss with consequences that reach far beyond the reef itself.",
    },
  ],
  questions: [
    {
      id: "coral-q1",
      number: 1,
      group: "Questions 1-4: Matching headings",
      kind: "matching-headings",
      prompt: "Choose the best heading for paragraph D.",
      options: [
        { value: "i", label: "i. A structure built from the remains of previous generations" },
        { value: "ii", label: "ii. Two separate sources of income for coastal communities" },
        { value: "iii", label: "iii. A habitat that has proved impossible to study" },
        { value: "iv", label: "iv. Untapped chemical compounds with medical potential" },
        { value: "v", label: "v. The gradual disappearance of reefs around the world" },
        { value: "vi", label: "vi. A dense concentration of species living in a small space" },
        { value: "vii", label: "vii. A defence against coastal erosion and storm damage" },
      ],
      answer: "vi",
      explanation: "Paragraph D describes how reefs pack an unusually large number of species into a very small proportion of the ocean floor.",
      evidence: "Coral reefs cover only about one per cent of the ocean floor, yet they provide habitat for at least a quarter of all known marine species.",
    },
    {
      id: "coral-q2",
      number: 2,
      group: "Questions 1-4: Matching headings",
      kind: "matching-headings",
      prompt: "Choose the best heading for paragraph E.",
      options: [
        { value: "i", label: "i. A structure built from the remains of previous generations" },
        { value: "ii", label: "ii. Two separate sources of income for coastal communities" },
        { value: "iii", label: "iii. A habitat that has proved impossible to study" },
        { value: "iv", label: "iv. Untapped chemical compounds with medical potential" },
        { value: "v", label: "v. The gradual disappearance of reefs around the world" },
        { value: "vi", label: "vi. A dense concentration of species living in a small space" },
        { value: "vii", label: "vii. A defence against coastal erosion and storm damage" },
      ],
      answer: "ii",
      explanation: "Paragraph E covers both the commercial fishing value of reefs and a separate, larger stream of income from tourism.",
      evidence: "Tourism adds a further, larger stream of income: local economies collect billions of dollars annually from visitors",
    },
    {
      id: "coral-q3",
      number: 3,
      group: "Questions 1-4: Matching headings",
      kind: "matching-headings",
      prompt: "Choose the best heading for paragraph F.",
      options: [
        { value: "i", label: "i. A structure built from the remains of previous generations" },
        { value: "ii", label: "ii. Two separate sources of income for coastal communities" },
        { value: "iii", label: "iii. A habitat that has proved impossible to study" },
        { value: "iv", label: "iv. Untapped chemical compounds with medical potential" },
        { value: "v", label: "v. The gradual disappearance of reefs around the world" },
        { value: "vi", label: "vi. A dense concentration of species living in a small space" },
        { value: "vii", label: "vii. A defence against coastal erosion and storm damage" },
      ],
      answer: "vii",
      explanation: "Paragraph F explains how reefs absorb wave energy and so protect coastlines from storms and erosion.",
      evidence: "they absorb and break up the energy of incoming waves before it reaches the coast, reducing the impact of ordinary swells as well as storms and flooding",
    },
    {
      id: "coral-q4",
      number: 4,
      group: "Questions 1-4: Matching headings",
      kind: "matching-headings",
      prompt: "Choose the best heading for paragraph G.",
      options: [
        { value: "i", label: "i. A structure built from the remains of previous generations" },
        { value: "ii", label: "ii. Two separate sources of income for coastal communities" },
        { value: "iii", label: "iii. A habitat that has proved impossible to study" },
        { value: "iv", label: "iv. Untapped chemical compounds with medical potential" },
        { value: "v", label: "v. The gradual disappearance of reefs around the world" },
        { value: "vi", label: "vi. A dense concentration of species living in a small space" },
        { value: "vii", label: "vii. A defence against coastal erosion and storm damage" },
      ],
      answer: "iv",
      explanation: "Paragraph G describes compounds found in reef organisms that are being developed into new medical treatments.",
      evidence: "Scientists have identified compounds in reef-dwelling animals and plants that are now being developed into treatments for cancer, arthritis, bacterial infections and viral diseases",
    },
    {
      id: "coral-q5",
      number: 5,
      group: "Questions 5-9: True / False / Not Given",
      kind: "true-false-not-given",
      prompt: "Coral polyps build their skeletons out of calcium carbonate.",
      options: [
        { value: "TRUE", label: "TRUE" },
        { value: "FALSE", label: "FALSE" },
        { value: "NOT GIVEN", label: "NOT GIVEN" },
      ],
      answer: "TRUE",
      explanation: "Paragraph A states directly that each polyp secretes a skeleton made of calcium carbonate.",
      evidence: "Each polyp secretes a hard outer skeleton made of calcium carbonate, the same mineral found in limestone.",
    },
    {
      id: "coral-q6",
      number: 6,
      group: "Questions 5-9: True / False / Not Given",
      kind: "true-false-not-given",
      prompt: "Most of the physical bulk of a coral reef is made up of skeletal material left by earlier generations of polyps.",
      options: [
        { value: "TRUE", label: "TRUE" },
        { value: "FALSE", label: "FALSE" },
        { value: "NOT GIVEN", label: "NOT GIVEN" },
      ],
      answer: "TRUE",
      explanation: "Paragraph A describes a reef as a thin layer of living tissue over a large foundation of accumulated skeletal remains.",
      evidence: "a reef is really a shallow layer of living tissue spread over an immense foundation of skeletal remains accumulated over centuries",
    },
    {
      id: "coral-q7",
      number: 7,
      group: "Questions 5-9: True / False / Not Given",
      kind: "true-false-not-given",
      prompt: "Zooxanthellae algae gain nothing from living inside coral tissue.",
      options: [
        { value: "TRUE", label: "TRUE" },
        { value: "FALSE", label: "FALSE" },
        { value: "NOT GIVEN", label: "NOT GIVEN" },
      ],
      answer: "FALSE",
      explanation: "Paragraph B describes a two-way exchange: the algae use the coral's waste products for photosynthesis, so they do benefit from the relationship.",
      evidence: "the algae make use of the coral's waste products to carry out photosynthesis, and in exchange they supply the coral with oxygen",
    },
    {
      id: "coral-q8",
      number: 8,
      group: "Questions 5-9: True / False / Not Given",
      kind: "true-false-not-given",
      prompt: "Reef-building corals can survive indefinitely in water as cold as 15 degrees Celsius.",
      options: [
        { value: "TRUE", label: "TRUE" },
        { value: "FALSE", label: "FALSE" },
        { value: "NOT GIVEN", label: "NOT GIVEN" },
      ],
      answer: "FALSE",
      explanation: "Paragraph C states that reef-building corals generally cannot tolerate sustained temperatures below 18 degrees Celsius, which rules out indefinite survival at 15 degrees.",
      evidence: "reef-building corals generally cannot tolerate sustained temperatures below 18 degrees Celsius",
    },
    {
      id: "coral-q9",
      number: 9,
      group: "Questions 5-9: True / False / Not Given",
      kind: "true-false-not-given",
      prompt: "The majority of reef-building coral species grow south of the equator.",
      options: [
        { value: "TRUE", label: "TRUE" },
        { value: "FALSE", label: "FALSE" },
        { value: "NOT GIVEN", label: "NOT GIVEN" },
      ],
      answer: "NOT GIVEN",
      explanation: "Paragraph C gives a latitude range on both sides of the equator but never states that a majority of species are found on the southern side.",
      evidence: "roughly between 35 degrees north and 35 degrees south of the equator",
    },
    {
      id: "coral-q10",
      number: 10,
      group: "Questions 10-13: Sentence completion",
      kind: "sentence-completion",
      prompt: "Reef-building corals need water clear enough for sunlight to penetrate to a depth of roughly ______ metres.",
      instruction: "Write ONE WORD ONLY.",
      answer: "30",
      acceptedAnswers: ["30", "thirty"],
      explanation: "Paragraph C gives the approximate depth to which light must penetrate for shallow-water corals to survive.",
      evidence: "restricts shallow reef growth to depths where light can still penetrate, roughly the uppermost 30 metres",
    },
    {
      id: "coral-q11",
      number: 11,
      group: "Questions 10-13: Sentence completion",
      kind: "sentence-completion",
      prompt: "The commercial value of the reef-dependent US fishing industry is put at over ______ dollars a year.",
      instruction: "Write NO MORE THAN THREE WORDS.",
      answer: "one hundred million",
      acceptedAnswers: ["one hundred million", "100 million", "$100 million"],
      explanation: "Paragraph E gives the government estimate of the annual commercial value of reef-dependent US fisheries.",
      evidence: "the commercial value of the reef-dependent US fishing industry alone at over one hundred million dollars a year",
    },
    {
      id: "coral-q12",
      number: 12,
      group: "Questions 10-13: Sentence completion",
      kind: "sentence-completion",
      prompt: "For coastal settlements, an intact reef can act as a natural form of ______ that would be costly to replace artificially.",
      instruction: "Write ONE WORD ONLY.",
      answer: "infrastructure",
      acceptedAnswers: ["infrastructure"],
      explanation: "Paragraph F compares the protective function of a reef to a form of infrastructure that would be expensive to build artificially.",
      evidence: "an intact reef can function as a form of infrastructure that would be extremely expensive to replace with artificial barriers",
    },
    {
      id: "coral-q13",
      number: 13,
      group: "Questions 10-13: Sentence completion",
      kind: "sentence-completion",
      prompt: "Reef organisms have evolved unusual chemical ______ in order to survive in crowded, competitive environments.",
      instruction: "Write ONE WORD ONLY.",
      answer: "defences",
      acceptedAnswers: ["defences", "defenses"],
      explanation: "Paragraph G explains that the medically useful compounds exist because reef organisms evolved chemical defences to cope with intense competition.",
      evidence: "reef organisms have evolved unusual chemical defences to survive in such crowded, competitive environments",
    },
  ],
};

const coralBleachingMechanism: ReadingPassage = {
  id: "coral-bleaching-mechanism",
  title: "When the partnership breaks down: bleaching and acidification",
  subtitle: "How rising heat and changing seawater chemistry threaten the same organism in different ways",
  paragraphs: [
    {
      label: "A",
      text: "The relationship between a coral polyp and the microscopic algae living inside it is stable only within a fairly narrow range of conditions. When a coral becomes stressed, it may expel the symbiotic algae living in its tissues, a process known as bleaching because the coral tissue, now transparent, reveals the white calcium carbonate skeleton beneath it. Because zooxanthellae are the coral's primary source of food as well as its source of colour, a bleached coral is not simply pale; it has lost its major food supply at precisely the moment it is under the greatest physiological strain.",
    },
    {
      label: "B",
      text: "Elevated water temperature is by far the most common trigger. When surrounding seawater becomes even a degree or two warmer than the coral is adapted to over a sustained period, the photosynthetic machinery inside the algae is disrupted, and the coral responds by expelling its algal partners en masse. Warming is not, however, the only pathway to bleaching. Unusually cold water can provoke an almost identical response: in 2010, water temperatures in the Florida Keys fell 6.7 degrees Celsius below normal, and the resulting cold-water stress bleached corals across the region just as effectively as a heatwave might have done. Excess sunlight, pollution, land-based runoff and extreme low tides that expose reefs to air can act as additional or contributing stressors.",
    },
    {
      label: "C",
      text: "Bleaching itself is not necessarily fatal. A coral that has expelled its algae remains alive, though visibly weakened and considerably more vulnerable to disease, and if the stress that triggered bleaching is brief, the coral can regain its algal partners and recover much of its former condition. Prolonged or repeated stress is a different matter. During a single severe episode in 2005, thermal stress across the Caribbean exceeded the combined total of the previous two decades, and reefs across the region lost roughly half of their coral cover within that one year, illustrating how quickly sustained heat stress can convert a survivable event into large-scale mortality.",
    },
    {
      label: "D",
      text: "A second, chemically distinct threat is unfolding at the same time. Ocean acidification refers to a long-term reduction in the pH of seawater, driven primarily by the ocean's uptake of carbon dioxide released into the atmosphere by human activity. Since the industrial revolution, the ocean has absorbed roughly thirty per cent of all the carbon dioxide emitted from burning fossil fuels. This is not, on its own, an unwelcome process, since it has slowed the pace of atmospheric warming, but the chemical reactions that occur when the gas dissolves in seawater have consequences that extend well beyond the atmosphere.",
    },
    {
      label: "E",
      text: "When carbon dioxide dissolves in seawater, it reacts to form carbonic acid, which increases the concentration of hydrogen ions in the water and correspondingly lowers its pH. A less obvious consequence of this same reaction is a decline in the availability of carbonate ions, the very ions that corals, oysters, clams and sea urchins rely on as the raw material for building and maintaining their calcium carbonate shells and skeletons. As carbonate ions become scarcer, these organisms must expend more energy to extract what they need, leaving less available for growth, reproduction and repair, even before any additional stress from elevated temperature is taken into account.",
    },
    {
      label: "F",
      text: "The effects of acidification are not confined to organisms that build shells. Laboratory studies have found that some fish species lose a measure of their ability to detect predators when raised in more acidic water, a change that could alter the balance of an entire reef food web even where no coral is directly affected. Because acidification is occurring across the entire world's oceans, including coastal estuaries and other waterways close to shore, its consequences are not restricted to remote reef systems far from human populations.",
    },
    {
      label: "G",
      text: "Warming and acidification are frequently discussed as separate threats, yet a coral reef experiences them simultaneously and cannot treat them as isolated problems. A colony weakened by the loss of carbonate ions has fewer resources available to cope with a subsequent heat stress event, and a colony already stressed by high temperature has less capacity to compensate for slower skeletal growth. Understanding either process in isolation is scientifically useful, but predicting the future of any given reef increasingly requires accounting for both pressures acting together, often over the same years and in the same waters.",
    },
  ],
  questions: [
    {
      id: "coral-q14",
      number: 14,
      group: "Questions 14-17: Matching information",
      kind: "matching-information",
      prompt: "Which paragraph contains a specific example of coral bleaching caused by unusually low water temperatures?",
      instruction: "Write the correct letter, A-G.",
      options: [
        { value: "A", label: "Paragraph A" },
        { value: "B", label: "Paragraph B" },
        { value: "C", label: "Paragraph C" },
        { value: "D", label: "Paragraph D" },
        { value: "E", label: "Paragraph E" },
        { value: "F", label: "Paragraph F" },
        { value: "G", label: "Paragraph G" },
      ],
      answer: "B",
      explanation: "Paragraph B gives the 2010 Florida Keys episode as an example of cold-water bleaching.",
      evidence: "in 2010, water temperatures in the Florida Keys fell 6.7 degrees Celsius below normal, and the resulting cold-water stress bleached corals",
    },
    {
      id: "coral-q15",
      number: 15,
      group: "Questions 14-17: Matching information",
      kind: "matching-information",
      prompt: "Which paragraph refers to a change in fish behaviour linked to more acidic water?",
      instruction: "Write the correct letter, A-G.",
      options: [
        { value: "A", label: "Paragraph A" },
        { value: "B", label: "Paragraph B" },
        { value: "C", label: "Paragraph C" },
        { value: "D", label: "Paragraph D" },
        { value: "E", label: "Paragraph E" },
        { value: "F", label: "Paragraph F" },
        { value: "G", label: "Paragraph G" },
      ],
      answer: "F",
      explanation: "Paragraph F describes laboratory findings that some fish become less able to detect predators in more acidic water.",
      evidence: "some fish species lose a measure of their ability to detect predators when raised in more acidic water",
    },
    {
      id: "coral-q16",
      number: 16,
      group: "Questions 14-17: Matching information",
      kind: "matching-information",
      prompt: "Which paragraph compares the severity of one year's heat stress with that of the two previous decades combined?",
      instruction: "Write the correct letter, A-G.",
      options: [
        { value: "A", label: "Paragraph A" },
        { value: "B", label: "Paragraph B" },
        { value: "C", label: "Paragraph C" },
        { value: "D", label: "Paragraph D" },
        { value: "E", label: "Paragraph E" },
        { value: "F", label: "Paragraph F" },
        { value: "G", label: "Paragraph G" },
      ],
      answer: "C",
      explanation: "Paragraph C states that thermal stress during the 2005 Caribbean event exceeded the combined total of the previous two decades.",
      evidence: "thermal stress across the Caribbean exceeded the combined total of the previous two decades",
    },
    {
      id: "coral-q17",
      number: 17,
      group: "Questions 14-17: Matching information",
      kind: "matching-information",
      prompt: "Which paragraph states the proportion of atmospheric carbon dioxide the ocean has absorbed since the industrial revolution?",
      instruction: "Write the correct letter, A-G.",
      options: [
        { value: "A", label: "Paragraph A" },
        { value: "B", label: "Paragraph B" },
        { value: "C", label: "Paragraph C" },
        { value: "D", label: "Paragraph D" },
        { value: "E", label: "Paragraph E" },
        { value: "F", label: "Paragraph F" },
        { value: "G", label: "Paragraph G" },
      ],
      answer: "D",
      explanation: "Paragraph D gives the estimated proportion of fossil-fuel carbon dioxide that the ocean has absorbed since the industrial revolution.",
      evidence: "the ocean has absorbed roughly thirty per cent of all the carbon dioxide emitted from burning fossil fuels",
    },
    {
      id: "coral-q18",
      number: 18,
      group: "Questions 18-22: Yes / No / Not Given",
      kind: "yes-no-not-given",
      prompt: "Cold-water stress can bleach corals just as effectively as a heatwave.",
      options: [
        { value: "YES", label: "YES" },
        { value: "NO", label: "NO" },
        { value: "NOT GIVEN", label: "NOT GIVEN" },
      ],
      answer: "YES",
      explanation: "Paragraph B states explicitly that cold-water stress bleached corals just as effectively as a heatwave would have.",
      evidence: "the resulting cold-water stress bleached corals across the region just as effectively as a heatwave might have done",
    },
    {
      id: "coral-q19",
      number: 19,
      group: "Questions 18-22: Yes / No / Not Given",
      kind: "yes-no-not-given",
      prompt: "A coral that has bleached is always beyond recovery.",
      options: [
        { value: "YES", label: "YES" },
        { value: "NO", label: "NO" },
        { value: "NOT GIVEN", label: "NOT GIVEN" },
      ],
      answer: "NO",
      explanation: "Paragraph C directly contradicts this: a coral can regain its algal partners and largely recover if the stress was brief.",
      evidence: "if the stress that triggered bleaching is brief, the coral can regain its algal partners and recover much of its former condition",
    },
    {
      id: "coral-q20",
      number: 20,
      group: "Questions 18-22: Yes / No / Not Given",
      kind: "yes-no-not-given",
      prompt: "Ocean acidification is expected to reverse within the next decade.",
      options: [
        { value: "YES", label: "YES" },
        { value: "NO", label: "NO" },
        { value: "NOT GIVEN", label: "NOT GIVEN" },
      ],
      answer: "NOT GIVEN",
      explanation: "Paragraph D describes acidification as a long-term process driven by carbon dioxide uptake, but no timeframe for any reversal is mentioned anywhere in the passage.",
      evidence: "Ocean acidification refers to a long-term reduction in the pH of seawater, driven primarily by the ocean's uptake of carbon dioxide",
    },
    {
      id: "coral-q21",
      number: 21,
      group: "Questions 18-22: Yes / No / Not Given",
      kind: "yes-no-not-given",
      prompt: "The chemical reactions triggered by carbon dioxide dissolving in seawater have effects that go beyond the atmosphere.",
      options: [
        { value: "YES", label: "YES" },
        { value: "NO", label: "NO" },
        { value: "NOT GIVEN", label: "NOT GIVEN" },
      ],
      answer: "YES",
      explanation: "Paragraph D states directly that these chemical reactions have consequences extending well beyond the atmosphere.",
      evidence: "the chemical reactions that occur when the gas dissolves in seawater have consequences that extend well beyond the atmosphere",
    },
    {
      id: "coral-q22",
      number: 22,
      group: "Questions 18-22: Yes / No / Not Given",
      kind: "yes-no-not-given",
      prompt: "A coral colony weakened by the loss of carbonate ions is better able to cope with a subsequent heat stress event.",
      options: [
        { value: "YES", label: "YES" },
        { value: "NO", label: "NO" },
        { value: "NOT GIVEN", label: "NOT GIVEN" },
      ],
      answer: "NO",
      explanation: "Paragraph G states the opposite: a colony weakened by the loss of carbonate ions has fewer resources to cope with subsequent heat stress.",
      evidence: "A colony weakened by the loss of carbonate ions has fewer resources available to cope with a subsequent heat stress event",
    },
    {
      id: "coral-q23",
      number: 23,
      group: "Questions 23-26: Summary completion",
      kind: "summary-completion",
      prompt: "Complete the summary. When carbon dioxide dissolves in seawater it forms carbonic acid, which raises the concentration of hydrogen ions and lowers the water's ______.",
      instruction: "Write ONE WORD ONLY.",
      answer: "pH",
      acceptedAnswers: ["pH"],
      explanation: "Paragraph E states that the reaction increases hydrogen ion concentration and correspondingly lowers the water's pH.",
      evidence: "it reacts to form carbonic acid, which increases the concentration of hydrogen ions in the water and correspondingly lowers its pH",
    },
    {
      id: "coral-q24",
      number: 24,
      group: "Questions 23-26: Summary completion",
      kind: "summary-completion",
      prompt: "Complete the summary. The same chemical process reduces the availability of ______ ions that corals and other shelled animals need to build their skeletons.",
      instruction: "Write ONE WORD ONLY.",
      answer: "carbonate",
      acceptedAnswers: ["carbonate"],
      explanation: "Paragraph E identifies carbonate ions as the raw material that becomes less available as acidification proceeds.",
      evidence: "a decline in the availability of carbonate ions, the very ions that corals, oysters, clams and sea urchins rely on as the raw material for building and maintaining their calcium carbonate shells",
    },
    {
      id: "coral-q25",
      number: 25,
      group: "Questions 23-26: Summary completion",
      kind: "summary-completion",
      prompt: "Complete the summary. Some ______ species become less able to detect predators when living in more acidic water.",
      instruction: "Write ONE WORD ONLY.",
      answer: "fish",
      acceptedAnswers: ["fish"],
      explanation: "Paragraph F reports that some fish species lose part of their ability to detect predators in more acidic water.",
      evidence: "some fish species lose a measure of their ability to detect predators when raised in more acidic water",
    },
    {
      id: "coral-q26",
      number: 26,
      group: "Questions 23-26: Summary completion",
      kind: "summary-completion",
      prompt: "Complete the summary. Because acidification also affects coastal ______ close to shore, its impact is not limited to remote reef systems.",
      instruction: "Write ONE WORD ONLY.",
      answer: "estuaries",
      acceptedAnswers: ["estuaries"],
      explanation: "Paragraph F states that acidification affects coastal estuaries and other waterways close to shore, not only remote reefs.",
      evidence: "acidification is occurring across the entire world's oceans, including coastal estuaries and other waterways close to shore",
    },
  ],
};

const coralReefMonitoring: ReadingPassage = {
  id: "coral-reef-monitoring",
  title: "Tracking a global crisis: monitoring, mass bleaching and the search for resilience",
  subtitle: "How satellite data, global bleaching records and restoration science now fit together",
  paragraphs: [
    {
      label: "A",
      text: "Assessing the condition of coral reefs across an ocean basin, let alone the entire planet, is not a task that can be accomplished by divers alone. NOAA established its Coral Reef Watch programme in 2000 specifically to address this gap, and the programme has since become a central component of how reef managers and scientists track the onset of mass bleaching, events in which corals bleach not on a single reef but across areas spanning tens, hundreds or even thousands of kilometres. Rather than relying solely on reports submitted after bleaching has already been observed, the programme was designed to provide advance warning of the conditions likely to produce it.",
    },
    {
      label: "B",
      text: "The programme's core data product, known as CoralTemp, derives sea surface temperature from a combination of thermal infrared sensors carried on nine polar-orbiting satellites together with microwave sensors, blended into a continuous record stretching back to 1985. Measurements are deliberately calibrated to represent conditions after dark rather than at midday, because water temperature near the surface becomes more vertically uniform once the sun has set, which yields a more stable and representative estimate of the heat stress actually experienced by corals below the surface. From this temperature record, the system calculates a value called HotSpot, essentially the difference between the current sea surface temperature and the warmest monthly average typically recorded at that location during summer.",
    },
    {
      label: "C",
      text: "Because a brief spike in temperature is far less damaging than sustained heat, the programme also tracks Degree Heating Weeks, a figure obtained by summing all HotSpot values of one degree Celsius or more over a rolling twelve-week period. An accumulation beyond four degree-heating-weeks has been shown to cause significant bleaching, while an accumulation beyond eight has been associated with severe bleaching and substantial coral mortality. These thresholds underpin an alert scale that now extends across five escalating levels, from a Watch level indicating that bleaching is merely possible through to Level 5, at which more than eighty per cent of corals in the affected area are at risk of dying.",
    },
    {
      label: "D",
      text: "Global bleaching events, defined as periods in which heat stress sufficient to cause bleaching affects reefs in all three coral-bearing ocean basins simultaneously, have so far been confirmed on four occasions, in 1998, 2010, 2014 to 2017, and again beginning in 2023. Each event has coincided with a strong El Niño, the periodic warming of surface waters in the tropical Pacific that raises ocean temperatures well beyond their usual seasonal range. What has changed is not the trigger but the scale of the consequence: the most recent event, which NOAA determined had likely concluded by mid-2025, exposed roughly eighty-four per cent of the world's coral reef area to bleaching-level heat stress and produced confirmed mass bleaching in at least eighty-three countries and territories.",
    },
    {
      label: "E",
      text: "Comparing the four events reveals a troubling pattern rather than four unrelated disasters. Heat stress has grown more widespread and more severe with each successive occurrence, and scientists associated with the monitoring programme now describe thermal stress as a pervasive, rather than occasional, condition on reefs within US waters. Some researchers involved in tracking these events have concluded that, on current trends, many reefs are likely to experience bleaching-level heat stress on a near-annual basis in the coming years, leaving progressively less time between events for affected coral populations to recover.",
    },
    {
      label: "F",
      text: "Faced with this trajectory, conservation agencies have shifted a portion of their effort from monitoring alone toward active intervention. In the Florida Keys, NOAA and a coalition of partner organisations launched Mission: Iconic Reefs, a large-scale restoration programme targeting seven ecologically significant reef sites across nearly three million square feet of reef habitat. The programme's goal is to return these sites to a self-sustaining condition by 2040 through the outplanting of close to half a million nursery-raised coral colonies, alongside the reintroduction of herbivorous species such as crabs and urchins that help keep reef surfaces clear of the algae that would otherwise outcompete young corals.",
    },
    {
      label: "G",
      text: "A parallel strand of research is attempting to make restored corals better able to withstand the conditions that caused the original decline. Laboratory trials have shown that corals deliberately exposed to variable, occasionally elevated temperatures over an extended period become measurably more resistant to subsequent heat stress than corals grown under constant conditions, and are less likely to bleach when that stress arrives. Building on this finding, restoration programmes are increasingly selecting parent corals for spawning specifically because they have survived previous bleaching events, in the hope of producing offspring populations that are both genetically diverse and inherently more heat-tolerant than the reefs they are intended to replace.",
    },
  ],
  questions: [
    {
      id: "coral-q27",
      number: 27,
      group: "Questions 27-30: Matching headings",
      kind: "matching-headings",
      prompt: "Choose the best heading for paragraph A.",
      options: [
        { value: "i", label: "i. A pattern of worsening impact from one event to the next" },
        { value: "ii", label: "ii. A technique for identifying corals likely to resist future stress" },
        { value: "iii", label: "iii. A programme created to provide advance warning rather than after-the-fact reports" },
        { value: "iv", label: "iv. A method that avoids measurements taken during daylight hours" },
        { value: "v", label: "v. A scale that converts accumulated heat stress into levels of risk" },
        { value: "vi", label: "vi. A single explanation for four otherwise unrelated events" },
        { value: "vii", label: "vii. A large-scale attempt to rebuild specific reef sites" },
      ],
      answer: "iii",
      explanation: "Paragraph A explains that Coral Reef Watch was designed to give advance warning rather than simply collecting reports after bleaching had already occurred.",
      evidence: "Rather than relying solely on reports submitted after bleaching has already been observed, the programme was designed to provide advance warning of the conditions likely to produce it",
    },
    {
      id: "coral-q28",
      number: 28,
      group: "Questions 27-30: Matching headings",
      kind: "matching-headings",
      prompt: "Choose the best heading for paragraph C.",
      options: [
        { value: "i", label: "i. A pattern of worsening impact from one event to the next" },
        { value: "ii", label: "ii. A technique for identifying corals likely to resist future stress" },
        { value: "iii", label: "iii. A programme created to provide advance warning rather than after-the-fact reports" },
        { value: "iv", label: "iv. A method that avoids measurements taken during daylight hours" },
        { value: "v", label: "v. A scale that converts accumulated heat stress into levels of risk" },
        { value: "vi", label: "vi. A single explanation for four otherwise unrelated events" },
        { value: "vii", label: "vii. A large-scale attempt to rebuild specific reef sites" },
      ],
      answer: "v",
      explanation: "Paragraph C describes the Degree Heating Weeks measure and the five-level alert scale built from it.",
      evidence: "These thresholds underpin an alert scale that now extends across five escalating levels",
    },
    {
      id: "coral-q29",
      number: 29,
      group: "Questions 27-30: Matching headings",
      kind: "matching-headings",
      prompt: "Choose the best heading for paragraph E.",
      options: [
        { value: "i", label: "i. A pattern of worsening impact from one event to the next" },
        { value: "ii", label: "ii. A technique for identifying corals likely to resist future stress" },
        { value: "iii", label: "iii. A programme created to provide advance warning rather than after-the-fact reports" },
        { value: "iv", label: "iv. A method that avoids measurements taken during daylight hours" },
        { value: "v", label: "v. A scale that converts accumulated heat stress into levels of risk" },
        { value: "vi", label: "vi. A single explanation for four otherwise unrelated events" },
        { value: "vii", label: "vii. A large-scale attempt to rebuild specific reef sites" },
      ],
      answer: "i",
      explanation: "Paragraph E states that heat stress has become more widespread and severe with each successive global bleaching event.",
      evidence: "Heat stress has grown more widespread and more severe with each successive occurrence",
    },
    {
      id: "coral-q30",
      number: 30,
      group: "Questions 27-30: Matching headings",
      kind: "matching-headings",
      prompt: "Choose the best heading for paragraph F.",
      options: [
        { value: "i", label: "i. A pattern of worsening impact from one event to the next" },
        { value: "ii", label: "ii. A technique for identifying corals likely to resist future stress" },
        { value: "iii", label: "iii. A programme created to provide advance warning rather than after-the-fact reports" },
        { value: "iv", label: "iv. A method that avoids measurements taken during daylight hours" },
        { value: "v", label: "v. A scale that converts accumulated heat stress into levels of risk" },
        { value: "vi", label: "vi. A single explanation for four otherwise unrelated events" },
        { value: "vii", label: "vii. A large-scale attempt to rebuild specific reef sites" },
      ],
      answer: "vii",
      explanation: "Paragraph F describes Mission: Iconic Reefs, a large-scale programme to restore seven specific reef sites in the Florida Keys.",
      evidence: "a large-scale restoration programme targeting seven ecologically significant reef sites across nearly three million square feet of reef habitat",
    },
    {
      id: "coral-q31",
      number: 31,
      group: "Questions 31-35: Multiple choice",
      kind: "multiple-choice",
      prompt: "According to the passage, why does NOAA Coral Reef Watch calibrate its temperature measurements to conditions after dark?",
      options: [
        { value: "A", label: "A. Satellites are only able to collect thermal data at night" },
        { value: "B", label: "B. Night-time readings avoid interference from cloud cover" },
        { value: "C", label: "C. Water temperature near the surface is more uniform after dark, giving a more reliable estimate of heat stress" },
        { value: "D", label: "D. Coral bleaching predominantly occurs during night-time hours" },
      ],
      answer: "C",
      explanation: "Paragraph B explains that night-time measurements are used because surface water temperature becomes more vertically uniform after dark, producing a more stable estimate of heat stress.",
      evidence: "water temperature near the surface becomes more vertically uniform once the sun has set, which yields a more stable and representative estimate of the heat stress",
    },
    {
      id: "coral-q32",
      number: 32,
      group: "Questions 31-35: Multiple choice",
      kind: "multiple-choice",
      prompt: "Based on the passage, what has been associated with an accumulation of heat stress beyond eight degree-heating-weeks?",
      options: [
        { value: "A", label: "A. Bleaching becomes possible for the first time" },
        { value: "B", label: "B. Severe bleaching and substantial coral mortality" },
        { value: "C", label: "C. The monitoring programme stops issuing further alerts" },
        { value: "D", label: "D. Corals recover their algal partners more quickly" },
      ],
      answer: "B",
      explanation: "Paragraph C states that an accumulation beyond eight degree-heating-weeks has been associated with severe bleaching and substantial coral mortality.",
      evidence: "an accumulation beyond eight has been associated with severe bleaching and substantial coral mortality",
    },
    {
      id: "coral-q33",
      number: 33,
      group: "Questions 31-35: Multiple choice",
      kind: "multiple-choice",
      prompt: "What do all four of the global coral bleaching events described in the passage have in common?",
      options: [
        { value: "A", label: "A. Each was confined to a single ocean basin" },
        { value: "B", label: "B. Each coincided with a strong El Niño" },
        { value: "C", label: "C. Each was confirmed only after coral mortality had occurred on every affected reef" },
        { value: "D", label: "D. Each caused the same proportion of the world's reefs to bleach" },
      ],
      answer: "B",
      explanation: "Paragraph D states that each of the four global bleaching events has coincided with a strong El Niño.",
      evidence: "Each event has coincided with a strong El Niño, the periodic warming of surface waters in the tropical Pacific",
    },
    {
      id: "coral-q34",
      number: 34,
      group: "Questions 31-35: Multiple choice",
      kind: "multiple-choice",
      prompt: "Which of the following is NOT described as part of the Mission: Iconic Reefs approach?",
      options: [
        { value: "A", label: "A. Outplanting nursery-raised coral colonies" },
        { value: "B", label: "B. Reintroducing herbivorous species such as crabs and urchins" },
        { value: "C", label: "C. Restoring seven reef sites across nearly three million square feet of habitat" },
        { value: "D", label: "D. Relocating coral colonies to reefs outside the Florida Keys" },
      ],
      answer: "D",
      explanation: "Paragraph F describes outplanting, reintroducing herbivorous species, and restoring seven Florida Keys sites, but never mentions relocating corals to reefs outside the Florida Keys.",
      evidence: "the outplanting of close to half a million nursery-raised coral colonies, alongside the reintroduction of herbivorous species such as crabs and urchins",
    },
    {
      id: "coral-q35",
      number: 35,
      group: "Questions 31-35: Multiple choice",
      kind: "multiple-choice",
      prompt: "Why are restoration programmes increasingly choosing corals that survived earlier bleaching events as parents for breeding, according to the passage?",
      options: [
        { value: "A", label: "A. Because those corals grow faster than corals that have never bleached" },
        { value: "B", label: "B. Because they are easier to collect than corals from undisturbed reefs" },
        { value: "C", label: "C. In the hope of producing offspring that are genetically diverse and more heat-tolerant" },
        { value: "D", label: "D. Because laboratory trials showed no difference between bleached and unbleached parent corals" },
      ],
      answer: "C",
      explanation: "Paragraph G states that programmes select survivors as parents in the hope of producing genetically diverse, more heat-tolerant offspring.",
      evidence: "restoration programmes are increasingly selecting parent corals for spawning specifically because they have survived previous bleaching events, in the hope of producing offspring populations that are both genetically diverse and inherently more heat-tolerant",
    },
    {
      id: "coral-q36",
      number: 36,
      group: "Questions 36-40: Summary completion",
      kind: "summary-completion",
      prompt: "Complete the summary. NOAA's Coral Reef Watch programme was established in ______.",
      instruction: "Write ONE WORD ONLY.",
      answer: "2000",
      acceptedAnswers: ["2000"],
      explanation: "Paragraph A states that NOAA established the Coral Reef Watch programme in 2000.",
      evidence: "NOAA established its Coral Reef Watch programme in 2000",
    },
    {
      id: "coral-q37",
      number: 37,
      group: "Questions 36-40: Summary completion",
      kind: "summary-completion",
      prompt: "Complete the summary. The CoralTemp sea surface temperature record extends continuously back to ______.",
      instruction: "Write ONE WORD ONLY.",
      answer: "1985",
      acceptedAnswers: ["1985"],
      explanation: "Paragraph B states that the CoralTemp record is blended into a continuous record stretching back to 1985.",
      evidence: "blended into a continuous record stretching back to 1985",
    },
    {
      id: "coral-q38",
      number: 38,
      group: "Questions 36-40: Summary completion",
      kind: "summary-completion",
      prompt: "Complete the summary. Degree Heating Weeks are calculated by summing HotSpot values over a rolling ______-week period.",
      instruction: "Write ONE WORD ONLY.",
      answer: "twelve",
      acceptedAnswers: ["twelve", "12"],
      explanation: "Paragraph C states that Degree Heating Weeks sum HotSpot values over a rolling twelve-week period.",
      evidence: "summing all HotSpot values of one degree Celsius or more over a rolling twelve-week period",
    },
    {
      id: "coral-q39",
      number: 39,
      group: "Questions 36-40: Summary completion",
      kind: "summary-completion",
      prompt: "Complete the summary. At Alert Level 5, more than ______ per cent of corals in the affected area are considered at risk of dying.",
      instruction: "Write ONE WORD ONLY.",
      answer: "eighty",
      acceptedAnswers: ["eighty", "80"],
      explanation: "Paragraph C states that at Level 5, more than eighty per cent of corals in the affected area are at risk of dying.",
      evidence: "Level 5, at which more than eighty per cent of corals in the affected area are at risk of dying",
    },
    {
      id: "coral-q40",
      number: 40,
      group: "Questions 36-40: Summary completion",
      kind: "summary-completion",
      prompt: "Complete the summary. The fourth global bleaching event caused confirmed mass bleaching in at least ______ countries and territories.",
      instruction: "Write ONE WORD ONLY.",
      answer: "eighty-three",
      acceptedAnswers: ["eighty-three", "83"],
      explanation: "Paragraph D states that the fourth global bleaching event produced confirmed mass bleaching in at least eighty-three countries and territories.",
      evidence: "produced confirmed mass bleaching in at least eighty-three countries and territories",
    },
  ],
};

const academicFullCoralReefs: ReadingPracticeTest = {
  id: "academic-full-coral-reefs",
  title: "Full Test 12: Coral reefs under pressure",
  description:
    "A complete Cambridge-style practice test about coral reef ecosystems, the mechanics of bleaching and ocean acidification, and how scientists monitor and respond to a warming ocean.",
  track: "Cambridge-style",
  level: "Advanced",
  minutes: 60,
  passages: [coralReefBasics, coralBleachingMechanism, coralReefMonitoring],
};

const solarActivityBasics: ReadingPassage = {
  id: "solar-activity-basics",
  title: "The Restless Sun",
  subtitle: "Sunspots, solar flares and coronal mass ejections in the Sun's activity cycle",
  paragraphs: [
    {
      label: "A",
      text: "Although the Sun appears to shine with unchanging brightness, its surface is anything but calm. Astronomers have long tracked a rhythm in solar behaviour known as the solar cycle, a period of roughly eleven years during which the Sun swings between a quiet phase called solar minimum and a turbulent phase called solar maximum. During solar maximum, the number of eruptions, bursts and explosive events on the Sun's surface rises sharply, while during solar minimum the Sun can go for weeks with almost no visible activity at all. This cycle is driven by changes in the Sun's magnetic field, which becomes increasingly tangled as the cycle progresses before eventually resetting.",
    },
    {
      label: "B",
      text: "The clearest visible sign of where the Sun sits in its cycle is the sunspot. Sunspots are dark blemishes that appear on the solar surface, or photosphere, and they mark regions where the Sun's magnetic field is unusually strong and knotted. Because a strong magnetic field temporarily suppresses the flow of hot gas from the Sun's interior, these regions cool relative to their surroundings and therefore look darker by comparison, though they remain far hotter than anything found on Earth. Sunspots tend to cluster in active regions, and it is from these same magnetically stressed regions that the most dramatic solar events tend to erupt. Counting sunspots over time is one of the oldest and most reliable ways scientists track the progress of the solar cycle.",
    },
    {
      label: "C",
      text: "Chief among these dramatic events is the solar flare, an intense and sudden burst of radiation released from the Sun's surface. Flares occur when twisted magnetic field lines above an active region become so stressed that they suddenly snap and reconnect in a process called magnetic reconnection, releasing vast amounts of stored magnetic energy in a matter of minutes. This energy is emitted across almost the entire electromagnetic spectrum at once, including X-rays, gamma rays, ultraviolet light, visible light and radio waves. The very largest flares are counted among the most powerful explosions anywhere in the solar system; a single major flare can release energy roughly equivalent to a billion hydrogen bombs detonating simultaneously.",
    },
    {
      label: "D",
      text: "Scientists classify solar flares by strength using a lettered scale that resembles the Richter scale for earthquakes. Flares are sorted into five broad classes, A, B, C, M and X, with A representing the weakest events, barely distinguishable from background radiation, and X representing the strongest. Each class also carries a numerical sub-level from 1 to 9, and moving up one full letter class represents a tenfold increase in energy output, so that an M-class flare releases ten times more energy than a C-class flare of the same number. Unlike the other letters, X-class flares have no fixed upper limit; the most powerful flare ever recorded, in 2003, overwhelmed the satellite instruments measuring it and was later estimated at X28.",
    },
    {
      label: "E",
      text: "Frequently, though not always, a solar flare is accompanied by a second and physically distinct phenomenon: a coronal mass ejection, or CME. Where a flare is essentially a flash of radiation, a CME is a genuine expulsion of matter, a vast cloud of magnetised plasma hurled outward from the Sun's outer atmosphere, the corona. A single CME can carry billions of tons of solar material into space, along with an embedded magnetic field that can be even stronger than the magnetic field of the surrounding solar wind. CMEs tend to originate from the same twisted magnetic structures, known as flux ropes, that produce flares, and they are frequently triggered by the same episode of magnetic reconnection.",
    },
    {
      label: "F",
      text: "Because a flare is pure radiation and a CME is physical material, the two phenomena reach Earth on very different timescales. Radiation from a flare travels at the speed of light, so it reaches Earth in about eight minutes, the same time it takes ordinary sunlight to arrive. A CME, however, must physically cross the roughly ninety-three million miles between the Sun and Earth, and even the fastest examples, travelling at speeds close to three thousand kilometres per second, take at least fifteen hours to arrive; slower CMEs can take several days. This difference in travel time matters enormously for anyone trying to forecast when a solar event might affect our planet, since a flare gives almost no advance warning while a CME leaves a window, however brief, in which to prepare.",
    },
    {
      label: "G",
      text: "Solar flares and CMEs are not merely scientific curiosities confined to the Sun's own atmosphere. When they are aimed at Earth, they mark the beginning of what scientists call space weather, a chain of physical effects that can ripple through our planet's magnetic field and upper atmosphere. Understanding exactly what a flare or a CME is, and how the two differ, is therefore the essential first step before considering what happens once that energy and material actually reach Earth.",
    },
  ],
  questions: [
    {
      id: "space-q1", number: 1, group: "Questions 1-4: Matching headings", kind: "matching-headings",
      prompt: "The passage has seven paragraphs, A-G. Choose the correct heading for paragraph B from the list of headings below.",
      options: [
        { value: "i", label: "i. A protective delay between two different kinds of solar event" },
        { value: "ii", label: "ii. The billion-bomb burst that reshapes the Sun's magnetic field" },
        { value: "iii", label: "iii. A scale for ranking the power of solar radiation bursts" },
        { value: "iv", label: "iv. Why the Sun's darker patches mark its most active zones" },
        { value: "v", label: "v. A cloud of matter distinct from a flash of radiation" },
        { value: "vi", label: "vi. The regular rhythm behind a change in solar behaviour" },
        { value: "vii", label: "vii. Two forms of solar activity that share a common trigger" },
      ],
      answer: "iv",
      explanation: "Paragraph B explains that sunspots, the Sun's dark patches, mark the regions where its magnetic field is most active.",
      evidence: "Sunspots are dark blemishes that appear on the solar surface, or photosphere, and they mark regions where the Sun's magnetic field is unusually strong and knotted.",
    },
    {
      id: "space-q2", number: 2, group: "Questions 1-4: Matching headings", kind: "matching-headings",
      prompt: "Choose the correct heading for paragraph C from the list of headings above.",
      options: [
        { value: "i", label: "i. A protective delay between two different kinds of solar event" },
        { value: "ii", label: "ii. The billion-bomb burst that reshapes the Sun's magnetic field" },
        { value: "iii", label: "iii. A scale for ranking the power of solar radiation bursts" },
        { value: "iv", label: "iv. Why the Sun's darker patches mark its most active zones" },
        { value: "v", label: "v. A cloud of matter distinct from a flash of radiation" },
        { value: "vi", label: "vi. The regular rhythm behind a change in solar behaviour" },
        { value: "vii", label: "vii. Two forms of solar activity that share a common trigger" },
      ],
      answer: "ii",
      explanation: "Paragraph C describes how magnetic reconnection releases a burst of radiation as powerful as roughly a billion hydrogen bombs.",
      evidence: "a single major flare can release energy roughly equivalent to a billion hydrogen bombs detonating simultaneously",
    },
    {
      id: "space-q3", number: 3, group: "Questions 1-4: Matching headings", kind: "matching-headings",
      prompt: "Choose the correct heading for paragraph E from the list of headings above.",
      options: [
        { value: "i", label: "i. A protective delay between two different kinds of solar event" },
        { value: "ii", label: "ii. The billion-bomb burst that reshapes the Sun's magnetic field" },
        { value: "iii", label: "iii. A scale for ranking the power of solar radiation bursts" },
        { value: "iv", label: "iv. Why the Sun's darker patches mark its most active zones" },
        { value: "v", label: "v. A cloud of matter distinct from a flash of radiation" },
        { value: "vi", label: "vi. The regular rhythm behind a change in solar behaviour" },
        { value: "vii", label: "vii. Two forms of solar activity that share a common trigger" },
      ],
      answer: "v",
      explanation: "Paragraph E draws a distinction between a flare, which is radiation, and a CME, which is an expulsion of physical matter.",
      evidence: "Where a flare is essentially a flash of radiation, a CME is a genuine expulsion of matter, a vast cloud of magnetised plasma hurled outward from the Sun's outer atmosphere",
    },
    {
      id: "space-q4", number: 4, group: "Questions 1-4: Matching headings", kind: "matching-headings",
      prompt: "Choose the correct heading for paragraph F from the list of headings above.",
      options: [
        { value: "i", label: "i. A protective delay between two different kinds of solar event" },
        { value: "ii", label: "ii. The billion-bomb burst that reshapes the Sun's magnetic field" },
        { value: "iii", label: "iii. A scale for ranking the power of solar radiation bursts" },
        { value: "iv", label: "iv. Why the Sun's darker patches mark its most active zones" },
        { value: "v", label: "v. A cloud of matter distinct from a flash of radiation" },
        { value: "vi", label: "vi. The regular rhythm behind a change in solar behaviour" },
        { value: "vii", label: "vii. Two forms of solar activity that share a common trigger" },
      ],
      answer: "i",
      explanation: "Paragraph F explains that the differing arrival times of flare radiation and CME material create a brief warning window before the CME hits.",
      evidence: "a flare gives almost no advance warning while a CME leaves a window, however brief, in which to prepare",
    },
    {
      id: "space-q5", number: 5, group: "Questions 5-9: True, False, or Not Given", kind: "true-false-not-given",
      prompt: "Sunspots are hotter than the surrounding surface of the Sun.",
      answer: "FALSE",
      explanation: "The passage states that sunspots are relatively cooler than their surroundings, which is why they appear dark.",
      evidence: "these regions cool relative to their surroundings and therefore look darker by comparison, though they remain far hotter than anything found on Earth",
    },
    {
      id: "space-q6", number: 6, group: "Questions 5-9: True, False, or Not Given", kind: "true-false-not-given",
      prompt: "Solar maximum typically lasts longer than solar minimum.",
      answer: "NOT GIVEN",
      explanation: "The passage describes the eleven-year cycle and its two phases but never compares how long each phase lasts.",
      evidence: "a period of roughly eleven years during which the Sun swings between a quiet phase called solar minimum and a turbulent phase called solar maximum",
    },
    {
      id: "space-q7", number: 7, group: "Questions 5-9: True, False, or Not Given", kind: "true-false-not-given",
      prompt: "Radiation from a solar flare reaches Earth at the same speed as ordinary sunlight.",
      answer: "TRUE",
      explanation: "The passage directly states that flare radiation travels at light speed, arriving in the same time as sunlight.",
      evidence: "Radiation from a flare travels at the speed of light, so it reaches Earth in about eight minutes, the same time it takes ordinary sunlight to arrive.",
    },
    {
      id: "space-q8", number: 8, group: "Questions 5-9: True, False, or Not Given", kind: "true-false-not-given",
      prompt: "Coronal mass ejections typically reach Earth faster than the radiation from a solar flare.",
      answer: "FALSE",
      explanation: "The passage shows flare radiation arrives in about eight minutes, while even the fastest CMEs take at least fifteen hours, so CMEs are far slower, not faster.",
      evidence: "even the fastest examples, travelling at speeds close to three thousand kilometres per second, take at least fifteen hours to arrive; slower CMEs can take several days",
    },
    {
      id: "space-q9", number: 9, group: "Questions 5-9: True, False, or Not Given", kind: "true-false-not-given",
      prompt: "The energy from a major solar flare is released across almost the whole electromagnetic spectrum.",
      answer: "TRUE",
      explanation: "The passage states that flare energy is emitted across nearly the entire electromagnetic spectrum, listing several types of radiation.",
      evidence: "This energy is emitted across almost the entire electromagnetic spectrum at once, including X-rays, gamma rays, ultraviolet light, visible light and radio waves.",
    },
    {
      id: "space-q10", number: 10, group: "Questions 10-13: Sentence completion", kind: "sentence-completion",
      prompt: "Complete the sentence below. Sunspots tend to cluster in what are known as active ______.",
      instruction: "Write ONE WORD ONLY.",
      answer: "regions", acceptedAnswers: ["regions", "region"],
      explanation: "The passage states that sunspots cluster in active regions.",
      evidence: "Sunspots tend to cluster in active regions, and it is from these same magnetically stressed regions that the most dramatic solar events tend to erupt.",
    },
    {
      id: "space-q11", number: 11, group: "Questions 10-13: Sentence completion", kind: "sentence-completion",
      prompt: "Complete the sentence below. The process in which twisted magnetic field lines snap and realign, releasing energy, is called magnetic ______.",
      instruction: "Write ONE WORD ONLY.",
      answer: "reconnection", acceptedAnswers: ["reconnection"],
      explanation: "The passage names this process magnetic reconnection.",
      evidence: "they suddenly snap and reconnect in a process called magnetic reconnection, releasing vast amounts of stored magnetic energy in a matter of minutes",
    },
    {
      id: "space-q12", number: 12, group: "Questions 10-13: Sentence completion", kind: "sentence-completion",
      prompt: "Complete the sentence below. The most powerful solar flare ever recorded occurred in ______.",
      instruction: "Write ONE WORD ONLY.",
      answer: "2003", acceptedAnswers: ["2003"],
      explanation: "The passage states the record flare occurred in 2003.",
      evidence: "the most powerful flare ever recorded, in 2003, overwhelmed the satellite instruments measuring it and was later estimated at X28",
    },
    {
      id: "space-q13", number: 13, group: "Questions 10-13: Sentence completion", kind: "sentence-completion",
      prompt: "Complete the sentence below. A coronal mass ejection can carry billions of tons of solar ______ into space.",
      instruction: "Write ONE WORD ONLY.",
      answer: "material", acceptedAnswers: ["material"],
      explanation: "The passage states a CME can carry billions of tons of solar material into space.",
      evidence: "A single CME can carry billions of tons of solar material into space, along with an embedded magnetic field that can be even stronger than the magnetic field of the surrounding solar wind.",
    },
  ],
};

const spaceWeatherEarth: ReadingPassage = {
  id: "space-weather-earth",
  title: "When the Sun Reaches Earth",
  subtitle: "How space weather interacts with Earth's magnetosphere and ionosphere",
  paragraphs: [
    {
      label: "A",
      text: "When a solar flare or a coronal mass ejection is directed at Earth, the resulting chain of disturbances is known as space weather, a term that deliberately echoes ordinary terrestrial weather because its effects, though invisible to most people, can be just as consequential. Space weather does not endanger life at the surface directly, because Earth is shielded by two overlapping defences: a magnetic field that deflects most charged particles, and an atmosphere thick enough to absorb the radiation that gets through. Nevertheless, the technological systems that modern societies depend upon sit either within or above these defences, and it is here that space weather leaves its mark.",
    },
    {
      label: "B",
      text: "The first line of defence is the magnetosphere, a vast, comet-shaped bubble of magnetic field generated deep within Earth by the convective motion of molten iron in the planet's outer core. The magnetosphere shields Earth from solar and cosmic particle radiation and from the slow erosion of the atmosphere that would otherwise be caused by the constant outward pressure of the solar wind. Far from being a fixed, static shield, the magnetosphere is part of a dynamic system that continuously responds to changing solar, planetary and even interstellar conditions, flexing and reshaping itself as pressure from the Sun varies.",
    },
    {
      label: "C",
      text: "When a coronal mass ejection arrives, it does not usually breach the magnetosphere outright; instead, it interacts with it. The strength of the resulting geomagnetic storm depends heavily on the orientation of the magnetic field embedded within the incoming CME. If that field points south, opposite to Earth's own magnetic field at the point of contact, it can link up with Earth's field through magnetic reconnection, a process that pumps energy and charged particles from the CME directly into Earth's magnetic system. A CME whose embedded field instead points north tends to slide past with comparatively little effect, even if it is otherwise a large and fast-moving event.",
    },
    {
      label: "D",
      text: "Some of the energy and particles funnelled into the magnetosphere are guided by Earth's magnetic field lines down toward the polar regions, where the field lines converge and dip into the atmosphere. There, energetic particles collide with atoms and molecules of oxygen and nitrogen, transferring energy that is subsequently released as visible light, the phenomenon known as the aurora. The colour of an aurora depends on both the gas involved and the altitude of the collision: oxygen produces a green glow at altitudes of roughly sixty to one hundred and twenty miles and a red glow higher still, while nitrogen tends to produce blue or pink light lower in the atmosphere. Because the polar regions are where Earth's field lines meet the atmosphere most directly, auroras are ordinarily confined to high latitudes, though an unusually strong storm can push them much further toward the equator.",
    },
    {
      label: "E",
      text: "Beneath the magnetosphere lies a second, thinner layer of Earth's defences: the ionosphere, a region stretching from roughly fifty to four hundred miles above the surface where solar radiation is intense enough to strip electrons from atmospheric gases, leaving behind a sea of electrically charged particles. The ionosphere forms the boundary between the bulk of Earth's atmosphere and the vacuum of space, and it is naturally reactive, thickening on the sunlit side of the planet during the day and thinning again at night as ionised particles recombine into neutral atoms.",
    },
    {
      label: "F",
      text: "The ionosphere is also where many of the more disruptive effects of space weather actually occur, because radio and satellite navigation signals either pass directly through this layer or, in the case of high-frequency radio, deliberately bounce off it to travel long distances. A strong flare's burst of X-rays can suddenly and sharply increase ionisation in the lower ionosphere on the sunlit side of Earth, a change that can absorb or scatter high-frequency radio waves and produce what is called a radio blackout. Space weather forecasters rate these blackouts on a five-level scale from R1, a minor and brief degradation of radio contact, up to R5, a complete blackout across the entire sunlit side of the planet that can last for hours.",
    },
    {
      label: "G",
      text: "Because Global Positioning System and other satellite navigation signals must also pass through the ionosphere on their way to receivers at the surface, sudden changes in ionospheric density can degrade the accuracy of these signals or, in severe cases, cause a temporary loss of the signal altogether. In December 2006, for instance, a pair of X-class flares triggered disturbances that disrupted GPS reception at ground stations, a reminder that the layer responsible for producing the aurora's beauty is the same layer capable of quietly undermining navigation systems on which modern transport, agriculture and emergency services increasingly rely.",
    },
  ],
  questions: [
    {
      id: "space-q14", number: 14, group: "Questions 14-17: Matching headings", kind: "matching-headings",
      prompt: "The passage has seven paragraphs, A-G. Choose the correct heading for paragraph B from the list of headings below.",
      options: [
        { value: "i", label: "i. Why the direction of an incoming magnetic field decides a storm's strength" },
        { value: "ii", label: "ii. A boundary layer that thickens by day and thins by night" },
        { value: "iii", label: "iii. A scale for rating how badly radio signals are disrupted" },
        { value: "iv", label: "iv. A shield generated deep inside the planet" },
        { value: "v", label: "v. Signals that travel through, or bounce off, a hidden electrical layer" },
        { value: "vi", label: "vi. The many colours produced when particles strike the upper atmosphere" },
        { value: "vii", label: "vii. An invisible chain of effects triggered when the Sun aims at Earth" },
      ],
      answer: "iv",
      explanation: "Paragraph B describes the magnetosphere as a magnetic bubble generated inside Earth's core that shields the planet.",
      evidence: "a vast, comet-shaped bubble of magnetic field generated deep within Earth by the convective motion of molten iron in the planet's outer core",
    },
    {
      id: "space-q15", number: 15, group: "Questions 14-17: Matching headings", kind: "matching-headings",
      prompt: "Choose the correct heading for paragraph C from the list of headings above.",
      options: [
        { value: "i", label: "i. Why the direction of an incoming magnetic field decides a storm's strength" },
        { value: "ii", label: "ii. A boundary layer that thickens by day and thins by night" },
        { value: "iii", label: "iii. A scale for rating how badly radio signals are disrupted" },
        { value: "iv", label: "iv. A shield generated deep inside the planet" },
        { value: "v", label: "v. Signals that travel through, or bounce off, a hidden electrical layer" },
        { value: "vi", label: "vi. The many colours produced when particles strike the upper atmosphere" },
        { value: "vii", label: "vii. An invisible chain of effects triggered when the Sun aims at Earth" },
      ],
      answer: "i",
      explanation: "Paragraph C explains that the strength of a geomagnetic storm depends on whether the CME's magnetic field points north or south.",
      evidence: "The strength of the resulting geomagnetic storm depends heavily on the orientation of the magnetic field embedded within the incoming CME.",
    },
    {
      id: "space-q16", number: 16, group: "Questions 14-17: Matching headings", kind: "matching-headings",
      prompt: "Choose the correct heading for paragraph D from the list of headings above.",
      options: [
        { value: "i", label: "i. Why the direction of an incoming magnetic field decides a storm's strength" },
        { value: "ii", label: "ii. A boundary layer that thickens by day and thins by night" },
        { value: "iii", label: "iii. A scale for rating how badly radio signals are disrupted" },
        { value: "iv", label: "iv. A shield generated deep inside the planet" },
        { value: "v", label: "v. Signals that travel through, or bounce off, a hidden electrical layer" },
        { value: "vi", label: "vi. The many colours produced when particles strike the upper atmosphere" },
        { value: "vii", label: "vii. An invisible chain of effects triggered when the Sun aims at Earth" },
      ],
      answer: "vi",
      explanation: "Paragraph D explains how the colour of an aurora depends on the gas and altitude involved.",
      evidence: "The colour of an aurora depends on both the gas involved and the altitude of the collision",
    },
    {
      id: "space-q17", number: 17, group: "Questions 14-17: Matching headings", kind: "matching-headings",
      prompt: "Choose the correct heading for paragraph F from the list of headings above.",
      options: [
        { value: "i", label: "i. Why the direction of an incoming magnetic field decides a storm's strength" },
        { value: "ii", label: "ii. A boundary layer that thickens by day and thins by night" },
        { value: "iii", label: "iii. A scale for rating how badly radio signals are disrupted" },
        { value: "iv", label: "iv. A shield generated deep inside the planet" },
        { value: "v", label: "v. Signals that travel through, or bounce off, a hidden electrical layer" },
        { value: "vi", label: "vi. The many colours produced when particles strike the upper atmosphere" },
        { value: "vii", label: "vii. An invisible chain of effects triggered when the Sun aims at Earth" },
      ],
      answer: "iii",
      explanation: "Paragraph F describes the five-level R1 to R5 scale used to rate radio blackouts.",
      evidence: "Space weather forecasters rate these blackouts on a five-level scale from R1, a minor and brief degradation of radio contact, up to R5, a complete blackout across the entire sunlit side of the planet that can last for hours.",
    },
    {
      id: "space-q18", number: 18, group: "Questions 18-22: Yes, No, or Not Given", kind: "yes-no-not-given",
      prompt: "Earth's magnetic field is a fixed, unchanging structure.",
      answer: "NO",
      explanation: "The passage states that the magnetosphere is dynamic and continuously reshapes itself, directly contradicting the idea that it is fixed.",
      evidence: "Far from being a fixed, static shield, the magnetosphere is part of a dynamic system that continuously responds to changing solar, planetary and even interstellar conditions, flexing and reshaping itself as pressure from the Sun varies.",
    },
    {
      id: "space-q19", number: 19, group: "Questions 18-22: Yes, No, or Not Given", kind: "yes-no-not-given",
      prompt: "A CME whose magnetic field points north generally has less effect on Earth's magnetosphere than one whose field points south.",
      answer: "YES",
      explanation: "The passage states that a north-pointing CME field tends to slide past with little effect, while a south-pointing field links up with Earth's field and transfers energy.",
      evidence: "A CME whose embedded field instead points north tends to slide past with comparatively little effect, even if it is otherwise a large and fast-moving event.",
    },
    {
      id: "space-q20", number: 20, group: "Questions 18-22: Yes, No, or Not Given", kind: "yes-no-not-given",
      prompt: "Auroras have been photographed on planets other than Earth.",
      answer: "NOT GIVEN",
      explanation: "The passage only discusses auroras on Earth and never mentions other planets.",
      evidence: "There, energetic particles collide with atoms and molecules of oxygen and nitrogen, transferring energy that is subsequently released as visible light, the phenomenon known as the aurora.",
    },
    {
      id: "space-q21", number: 21, group: "Questions 18-22: Yes, No, or Not Given", kind: "yes-no-not-given",
      prompt: "The ionosphere is thicker during the day than it is at night.",
      answer: "YES",
      explanation: "The passage states that the ionosphere thickens on the sunlit side during the day and thins again at night.",
      evidence: "it is naturally reactive, thickening on the sunlit side of the planet during the day and thinning again at night as ionised particles recombine into neutral atoms",
    },
    {
      id: "space-q22", number: 22, group: "Questions 18-22: Yes, No, or Not Given", kind: "yes-no-not-given",
      prompt: "A sufficiently strong geomagnetic storm can make auroras visible closer to the equator than usual.",
      answer: "YES",
      explanation: "The passage states that an unusually strong storm can push auroras much further toward the equator.",
      evidence: "though an unusually strong storm can push them much further toward the equator",
    },
    {
      id: "space-q23", number: 23, group: "Questions 23-26: Multiple choice", kind: "multiple-choice",
      prompt: "According to the passage, a CME triggers magnetic reconnection with Earth's field when:",
      options: [
        { value: "A", label: "A. the CME travels slower than average" },
        { value: "B", label: "B. the CME's magnetic field points in the same direction as Earth's field" },
        { value: "C", label: "C. the CME's magnetic field points south, opposite Earth's field" },
        { value: "D", label: "D. the CME arrives during the daytime" },
      ],
      answer: "C",
      explanation: "The passage states that a south-pointing CME field, opposite Earth's own field, can link up with it through magnetic reconnection.",
      evidence: "If that field points south, opposite to Earth's own magnetic field at the point of contact, it can link up with Earth's field through magnetic reconnection",
    },
    {
      id: "space-q24", number: 24, group: "Questions 23-26: Multiple choice", kind: "multiple-choice",
      prompt: "Why are auroras normally confined to high latitudes?",
      options: [
        { value: "A", label: "A. Only polar regions receive charged particles from the Sun" },
        { value: "B", label: "B. Earth's magnetic field lines converge and dip into the atmosphere there" },
        { value: "C", label: "C. The ionosphere only exists near the poles" },
        { value: "D", label: "D. Oxygen and nitrogen are found only in polar air" },
      ],
      answer: "B",
      explanation: "The passage explains that particles are guided toward the poles because that is where Earth's field lines converge and dip into the atmosphere.",
      evidence: "Some of the energy and particles funnelled into the magnetosphere are guided by Earth's magnetic field lines down toward the polar regions, where the field lines converge and dip into the atmosphere.",
    },
    {
      id: "space-q25", number: 25, group: "Questions 23-26: Multiple choice", kind: "multiple-choice",
      prompt: "What directly causes a radio blackout, according to the passage?",
      options: [
        { value: "A", label: "A. A sudden increase in ionisation in the lower ionosphere caused by a flare's X-rays" },
        { value: "B", label: "B. The complete disappearance of the ionosphere at night" },
        { value: "C", label: "C. A drop in solar wind speed" },
        { value: "D", label: "D. The collapse of Earth's magnetosphere" },
      ],
      answer: "A",
      explanation: "The passage states that a flare's burst of X-rays sharply increases ionisation in the lower ionosphere, which absorbs or scatters HF radio waves and causes a blackout.",
      evidence: "A strong flare's burst of X-rays can suddenly and sharply increase ionisation in the lower ionosphere on the sunlit side of Earth, a change that can absorb or scatter high-frequency radio waves and produce what is called a radio blackout.",
    },
    {
      id: "space-q26", number: 26, group: "Questions 23-26: Multiple choice", kind: "multiple-choice",
      prompt: "What happened to GPS reception at ground stations in December 2006, according to the passage?",
      options: [
        { value: "A", label: "A. It improved temporarily" },
        { value: "B", label: "B. It was disrupted by disturbances following a pair of X-class flares" },
        { value: "C", label: "C. It was unaffected because GPS satellites orbit above the ionosphere" },
        { value: "D", label: "D. It failed permanently" },
      ],
      answer: "B",
      explanation: "The passage states that a pair of X-class flares in December 2006 triggered disturbances that disrupted GPS reception at ground stations.",
      evidence: "In December 2006, for instance, a pair of X-class flares triggered disturbances that disrupted GPS reception at ground stations",
    },
  ],
};

const spaceWeatherImpacts: ReadingPassage = {
  id: "space-weather-impacts",
  title: "When Space Weather Meets Infrastructure",
  subtitle: "Historical storms, modern vulnerabilities and the challenge of forecasting",
  paragraphs: [
    {
      label: "A",
      text: "On 1 September 1859, the British astronomer Richard Carrington was sketching a cluster of sunspots when he witnessed an intense flash of white light erupt from within the group, the first solar flare ever observed and recorded. Roughly seventeen hours later, far faster than the several days a coronal mass ejection typically requires to cross the ninety-three million miles separating the Sun and Earth, a geomagnetic storm of extraordinary violence struck the planet. Auroras were reported as far from the poles as the Caribbean, and telegraph systems across North America and Europe malfunctioned dramatically: operators reported sparks leaping from their equipment, some received electric shocks, and a handful of telegraph offices caught fire. In several stations, operators disconnected their batteries entirely and continued sending messages powered solely by the current the storm itself had induced in the lines.",
    },
    {
      label: "B",
      text: "What became known as the Carrington Event remains, on the strength of later analysis, the most extreme geomagnetic storm on record, equivalent to the highest category, G5, on the modern five-level scale used to rate such storms. Because the mid-nineteenth-century world depended on relatively little electrical infrastructure, the damage, though dramatic, was largely contained to telegraph networks. A storm of comparable strength striking today's far more electrified and interconnected world would confront a vastly larger set of vulnerable systems, from satellite constellations to the power grids that keep hospitals, water treatment plants and financial systems running.",
    },
    {
      label: "C",
      text: "A smaller-scale preview of that vulnerability arrived on 13 March 1989. Four days earlier, an X-class flare had launched a coronal mass ejection directly toward Earth; when the CME's shock front reached Earth's magnetosphere that evening, the resulting geomagnetic storm induced electrical currents in the long transmission lines of Hydro-Quebec's power grid. Within about ninety seconds, protective relays across the network tripped in a rapid cascading sequence, and the entire Quebec grid collapsed, leaving roughly six million people without electricity, some for more than nine hours, in the middle of a cold Canadian night.",
    },
    {
      label: "D",
      text: "The mechanism behind such failures is now well understood. A geomagnetic storm's fluctuating magnetic field induces so-called geomagnetically induced currents, or GICs, in any sufficiently long electrical conductor, including power transmission lines. These slow, quasi-direct currents are not what transmission equipment is designed to carry, and they can saturate transformer cores, causing transformers to overheat, distort the alternating current waveform and trip protective systems that were never designed with a solar storm in mind. In the most severe storms, this combination of effects can trigger the kind of rapid, cascading grid failure that struck Quebec, and in extreme cases can permanently damage costly transformers that may take months to replace.",
    },
    {
      label: "E",
      text: "Power grids are not the only infrastructure at risk. Satellites in low Earth orbit are vulnerable in two distinct ways: geomagnetic storms heat and expand the upper atmosphere, increasing atmospheric drag on orbiting spacecraft and shortening their operational lifetimes, while energetic particles associated with radiation storms can degrade solar panels, corrupt onboard memory and, in rare cases, disable satellite electronics outright. Global navigation satellite signals, including GPS, are separately vulnerable to the ionospheric disturbances described earlier, with polar regions especially exposed because fewer navigation satellites are visible overhead there and because auroral disturbance of the polar ionosphere is typically most intense at high latitudes.",
    },
    {
      label: "F",
      text: "Commercial aviation faces its own particular exposure, especially on polar routes flown between North America and Asia, where airlines rely on high-frequency radio for long-range communication precisely because they are often out of range of ordinary line-of-sight systems. During a severe radiation storm, HF radio communication through the polar regions can be degraded or lost entirely for hours at a time, forcing airlines to reroute flights away from the poles, a costly adjustment that can add substantially to fuel consumption and flight time on affected routes.",
    },
    {
      label: "G",
      text: "Forecasting these events remains genuinely difficult, in part because the most useful direct measurements of an incoming CME come from spacecraft stationed at the L1 Lagrange point, a gravitationally stable location roughly one million miles from Earth, directly between Earth and the Sun. Satellites such as NASA's DSCOVR and ACE sit at this vantage point, sampling the solar wind as it streams past, but because L1 is so much closer to Earth than to the Sun, this arrangement typically provides only fifteen to sixty minutes of advance warning before a CME's shock front actually arrives, leaving grid operators, satellite controllers and airlines only a narrow window in which to take protective action.",
    },
    {
      label: "H",
      text: "That narrow warning window, combined with the reliance of current forecasting on a small number of ageing spacecraft, means that predicting the precise timing, strength and orientation of a geomagnetic storm well in advance remains one of the most persistent challenges in space weather science. Researchers can now identify, within hours, when the Sun has launched a CME broadly toward Earth, yet the fine details that determine whether a given storm will merely brighten the aurora or instead threaten satellites and power grids often remain uncertain until the storm is already almost upon us.",
    },
  ],
  questions: [
    {
      id: "space-q27", number: 27, group: "Questions 27-30: Matching headings", kind: "matching-headings",
      prompt: "The passage has eight paragraphs, A-H. Choose the correct heading for paragraph A from the list of headings below.",
      options: [
        { value: "i", label: "i. A costly detour forced on long-distance flights" },
        { value: "ii", label: "ii. An entire regional power network collapses in under two minutes" },
        { value: "iii", label: "iii. A single event still used as a worst-case benchmark" },
        { value: "iv", label: "iv. Orbiting hardware exposed to two separate kinds of danger" },
        { value: "v", label: "v. The electrical mechanism that overloads a transformer" },
        { value: "vi", label: "vi. A nineteenth-century storm disrupts an early telecommunications network" },
        { value: "vii", label: "vii. A challenge that forecasters have yet to fully solve" },
        { value: "viii", label: "viii. A narrow window of warning from a distant vantage point" },
      ],
      answer: "vi",
      explanation: "Paragraph A describes how the 1859 storm caused sparks, shocks and fires in telegraph systems, a nineteenth-century telecommunications network.",
      evidence: "telegraph systems across North America and Europe malfunctioned dramatically: operators reported sparks leaping from their equipment, some received electric shocks, and a handful of telegraph offices caught fire",
    },
    {
      id: "space-q28", number: 28, group: "Questions 27-30: Matching headings", kind: "matching-headings",
      prompt: "Choose the correct heading for paragraph C from the list of headings above.",
      options: [
        { value: "i", label: "i. A costly detour forced on long-distance flights" },
        { value: "ii", label: "ii. An entire regional power network collapses in under two minutes" },
        { value: "iii", label: "iii. A single event still used as a worst-case benchmark" },
        { value: "iv", label: "iv. Orbiting hardware exposed to two separate kinds of danger" },
        { value: "v", label: "v. The electrical mechanism that overloads a transformer" },
        { value: "vi", label: "vi. A nineteenth-century storm disrupts an early telecommunications network" },
        { value: "vii", label: "vii. A challenge that forecasters have yet to fully solve" },
        { value: "viii", label: "viii. A narrow window of warning from a distant vantage point" },
      ],
      answer: "ii",
      explanation: "Paragraph C describes how the entire Quebec grid collapsed within about ninety seconds.",
      evidence: "Within about ninety seconds, protective relays across the network tripped in a rapid cascading sequence, and the entire Quebec grid collapsed",
    },
    {
      id: "space-q29", number: 29, group: "Questions 27-30: Matching headings", kind: "matching-headings",
      prompt: "Choose the correct heading for paragraph E from the list of headings above.",
      options: [
        { value: "i", label: "i. A costly detour forced on long-distance flights" },
        { value: "ii", label: "ii. An entire regional power network collapses in under two minutes" },
        { value: "iii", label: "iii. A single event still used as a worst-case benchmark" },
        { value: "iv", label: "iv. Orbiting hardware exposed to two separate kinds of danger" },
        { value: "v", label: "v. The electrical mechanism that overloads a transformer" },
        { value: "vi", label: "vi. A nineteenth-century storm disrupts an early telecommunications network" },
        { value: "vii", label: "vii. A challenge that forecasters have yet to fully solve" },
        { value: "viii", label: "viii. A narrow window of warning from a distant vantage point" },
      ],
      answer: "iv",
      explanation: "Paragraph E explains that satellites face two distinct kinds of danger: atmospheric drag and radiation damage.",
      evidence: "Satellites in low Earth orbit are vulnerable in two distinct ways: geomagnetic storms heat and expand the upper atmosphere, increasing atmospheric drag on orbiting spacecraft and shortening their operational lifetimes, while energetic particles associated with radiation storms can degrade solar panels, corrupt onboard memory and, in rare cases, disable satellite electronics outright.",
    },
    {
      id: "space-q30", number: 30, group: "Questions 27-30: Matching headings", kind: "matching-headings",
      prompt: "Choose the correct heading for paragraph G from the list of headings above.",
      options: [
        { value: "i", label: "i. A costly detour forced on long-distance flights" },
        { value: "ii", label: "ii. An entire regional power network collapses in under two minutes" },
        { value: "iii", label: "iii. A single event still used as a worst-case benchmark" },
        { value: "iv", label: "iv. Orbiting hardware exposed to two separate kinds of danger" },
        { value: "v", label: "v. The electrical mechanism that overloads a transformer" },
        { value: "vi", label: "vi. A nineteenth-century storm disrupts an early telecommunications network" },
        { value: "vii", label: "vii. A challenge that forecasters have yet to fully solve" },
        { value: "viii", label: "viii. A narrow window of warning from a distant vantage point" },
      ],
      answer: "viii",
      explanation: "Paragraph G explains that spacecraft at L1 give forecasters only fifteen to sixty minutes of advance warning.",
      evidence: "this arrangement typically provides only fifteen to sixty minutes of advance warning before a CME's shock front actually arrives, leaving grid operators, satellite controllers and airlines only a narrow window in which to take protective action.",
    },
    {
      id: "space-q31", number: 31, group: "Questions 31-34: Matching information", kind: "matching-information",
      instruction: "Which paragraph contains the following information? Write the correct letter, A-H.",
      prompt: "a description of the specific physical process that damages electrical equipment during a storm",
      options: [
        { value: "A", label: "Paragraph A" }, { value: "B", label: "Paragraph B" },
        { value: "C", label: "Paragraph C" }, { value: "D", label: "Paragraph D" },
        { value: "E", label: "Paragraph E" }, { value: "F", label: "Paragraph F" },
        { value: "G", label: "Paragraph G" }, { value: "H", label: "Paragraph H" },
      ],
      answer: "D",
      explanation: "Paragraph D explains how geomagnetically induced currents saturate transformer cores and trip protective systems.",
      evidence: "These slow, quasi-direct currents are not what transmission equipment is designed to carry, and they can saturate transformer cores, causing transformers to overheat, distort the alternating current waveform and trip protective systems that were never designed with a solar storm in mind.",
    },
    {
      id: "space-q32", number: 32, group: "Questions 31-34: Matching information", kind: "matching-information",
      instruction: "Which paragraph contains the following information? Write the correct letter, A-H.",
      prompt: "a comparison between the scale of a historical storm and the highest point on a modern rating system",
      options: [
        { value: "A", label: "Paragraph A" }, { value: "B", label: "Paragraph B" },
        { value: "C", label: "Paragraph C" }, { value: "D", label: "Paragraph D" },
        { value: "E", label: "Paragraph E" }, { value: "F", label: "Paragraph F" },
        { value: "G", label: "Paragraph G" }, { value: "H", label: "Paragraph H" },
      ],
      answer: "B",
      explanation: "Paragraph B states that the Carrington Event is equivalent to G5, the highest category on the modern geomagnetic storm scale.",
      evidence: "What became known as the Carrington Event remains, on the strength of later analysis, the most extreme geomagnetic storm on record, equivalent to the highest category, G5, on the modern five-level scale used to rate such storms.",
    },
    {
      id: "space-q33", number: 33, group: "Questions 31-34: Matching information", kind: "matching-information",
      instruction: "Which paragraph contains the following information? Write the correct letter, A-H.",
      prompt: "a reason why airlines choose to avoid certain routes during severe storms",
      options: [
        { value: "A", label: "Paragraph A" }, { value: "B", label: "Paragraph B" },
        { value: "C", label: "Paragraph C" }, { value: "D", label: "Paragraph D" },
        { value: "E", label: "Paragraph E" }, { value: "F", label: "Paragraph F" },
        { value: "G", label: "Paragraph G" }, { value: "H", label: "Paragraph H" },
      ],
      answer: "F",
      explanation: "Paragraph F explains that degraded or lost HF radio communication forces airlines to reroute flights away from the poles.",
      evidence: "During a severe radiation storm, HF radio communication through the polar regions can be degraded or lost entirely for hours at a time, forcing airlines to reroute flights away from the poles",
    },
    {
      id: "space-q34", number: 34, group: "Questions 31-34: Matching information", kind: "matching-information",
      instruction: "Which paragraph contains the following information? Write the correct letter, A-H.",
      prompt: "an acknowledgment that some aspects of a storm's impact are still hard to predict shortly before it happens",
      options: [
        { value: "A", label: "Paragraph A" }, { value: "B", label: "Paragraph B" },
        { value: "C", label: "Paragraph C" }, { value: "D", label: "Paragraph D" },
        { value: "E", label: "Paragraph E" }, { value: "F", label: "Paragraph F" },
        { value: "G", label: "Paragraph G" }, { value: "H", label: "Paragraph H" },
      ],
      answer: "H",
      explanation: "Paragraph H states that the fine details of a storm's severity often remain uncertain until it is almost upon us.",
      evidence: "yet the fine details that determine whether a given storm will merely brighten the aurora or instead threaten satellites and power grids often remain uncertain until the storm is already almost upon us",
    },
    {
      id: "space-q35", number: 35, group: "Questions 35-40: True, False, or Not Given", kind: "true-false-not-given",
      prompt: "The 1989 Quebec blackout was caused by a coronal mass ejection that followed an X-class solar flare.",
      answer: "TRUE",
      explanation: "The passage states that an X-class flare launched a CME that reached Earth and induced the currents that collapsed the grid.",
      evidence: "Four days earlier, an X-class flare had launched a coronal mass ejection directly toward Earth; when the CME's shock front reached Earth's magnetosphere that evening, the resulting geomagnetic storm induced electrical currents in the long transmission lines of Hydro-Quebec's power grid.",
    },
    {
      id: "space-q36", number: 36, group: "Questions 35-40: True, False, or Not Given", kind: "true-false-not-given",
      prompt: "Geomagnetically induced currents are a type of current that transmission equipment is specifically designed to handle.",
      answer: "FALSE",
      explanation: "The passage directly states that these currents are not what transmission equipment is designed to carry.",
      evidence: "These slow, quasi-direct currents are not what transmission equipment is designed to carry",
    },
    {
      id: "space-q37", number: 37, group: "Questions 35-40: True, False, or Not Given", kind: "true-false-not-given",
      prompt: "Hydro-Quebec installed new equipment after 1989 specifically to reduce the risk of future storm damage.",
      answer: "NOT GIVEN",
      explanation: "The passage describes the mechanism of the 1989 failure but never mentions what equipment, if any, was installed afterward.",
      evidence: "In the most severe storms, this combination of effects can trigger the kind of rapid, cascading grid failure that struck Quebec, and in extreme cases can permanently damage costly transformers that may take months to replace.",
    },
    {
      id: "space-q38", number: 38, group: "Questions 35-40: True, False, or Not Given", kind: "true-false-not-given",
      prompt: "The coronal mass ejection responsible for the Carrington Event reached Earth faster than a CME typically travels.",
      answer: "TRUE",
      explanation: "The passage states the 1859 storm struck roughly seventeen hours after the flare, far faster than the several days a CME typically requires.",
      evidence: "Roughly seventeen hours later, far faster than the several days a coronal mass ejection typically requires to cross the ninety-three million miles separating the Sun and Earth, a geomagnetic storm of extraordinary violence struck the planet.",
    },
    {
      id: "space-q39", number: 39, group: "Questions 35-40: True, False, or Not Given", kind: "true-false-not-given",
      prompt: "Only satellites in geostationary orbit, far above the atmosphere, are at risk from space weather.",
      answer: "FALSE",
      explanation: "The passage states that satellites in low Earth orbit are vulnerable in two distinct ways, contradicting the claim that only geostationary satellites are at risk.",
      evidence: "Satellites in low Earth orbit are vulnerable in two distinct ways: geomagnetic storms heat and expand the upper atmosphere, increasing atmospheric drag on orbiting spacecraft and shortening their operational lifetimes",
    },
    {
      id: "space-q40", number: 40, group: "Questions 35-40: True, False, or Not Given", kind: "true-false-not-given",
      prompt: "The 1989 Quebec blackout resulted in permanent injuries to Hydro-Quebec employees.",
      answer: "NOT GIVEN",
      explanation: "The passage describes the duration of the power outage but never mentions any injuries to employees.",
      evidence: "the entire Quebec grid collapsed, leaving roughly six million people without electricity, some for more than nine hours, in the middle of a cold Canadian night",
    },
  ],
};

const academicFullSpaceWeather: ReadingPracticeTest = {
  id: "academic-full-space-weather",
  title: "Full Test 13: Solar Flares, Coronal Mass Ejections and Space Weather",
  description:
    "A complete Cambridge-style practice test about the Sun's activity cycle, how solar storms interact with Earth's magnetosphere and ionosphere, and the real-world impacts of space weather on power grids, satellites, aviation and forecasting.",
  track: "Cambridge-style",
  level: "Advanced",
  minutes: 60,
  passages: [solarActivityBasics, spaceWeatherEarth, spaceWeatherImpacts],
};

const aquiferBasics: ReadingPassage = {
  id: "aquifer-basics",
  title: "How aquifers store and move water",
  subtitle: "The hidden architecture of the world's underground water supply",
  paragraphs: [
    {
      label: "A",
      text: "Groundwater is one of the most valuable natural resources on Earth, yet most people never see it and rarely think about where it comes from. It lies hidden beneath the ground, filling the tiny spaces between grains of soil, sand and rock. Although it cannot be seen from the surface, the volume involved is immense: scientists estimate that there is more than a thousand times more water stored underground than is held in all of the world's rivers and lakes combined. This hidden reserve supplies drinking water to roughly half the population of the United States and to nearly all of its rural residents.",
    },
    {
      label: "B",
      text: "Not all of the water beneath the surface is available for use. Close to the ground, soil and rock contain both air and water; this is called the unsaturated zone. Further down, every open space between particles of rock or sediment is completely filled with water, forming the saturated zone. The boundary between these two zones, where saturation begins, is known as the water table. Below the water table lie aquifers: geologic formations that contain enough saturated, permeable material to yield significant quantities of water to wells and springs. Aquifers are sometimes described as huge underground storehouses of water, and it is from them that wells, springs and much of the world's fresh water supply are drawn.",
    },
    {
      label: "C",
      text: "Whether a layer of rock or sediment makes a good aquifer depends on two properties: porosity and permeability. Porosity refers to the amount of open space between individual grains of material, while permeability describes how well those spaces are connected to one another, allowing water to pass through. Sand and gravel typically have high porosity and permeability, so water can move through them freely, sometimes travelling several metres in a single day. Clay and shale, by contrast, may hold just as much water within their pore spaces, but the spaces are poorly connected, so water movement can be reduced to only a few centimetres in a century. This is why sand and gravel deposits usually make far better aquifers than layers of clay.",
    },
    {
      label: "D",
      text: "Aquifers are generally classified as either unconfined or confined. An unconfined aquifer lies close to the surface and is capped only by the unsaturated zone above it. Because there is no impermeable barrier between the ground surface and the saturated material below, an unconfined aquifer is recharged directly: rain and melting snow simply infiltrate downward through the soil until they reach the water table. This direct connection to the surface makes unconfined aquifers relatively easy to replenish, but it also leaves them more exposed to surface contamination and to the effects of drought.",
    },
    {
      label: "E",
      text: "A confined aquifer, in contrast, is sandwiched between two layers of far less permeable rock, often clay or shale, which act as confining layers above and below the saturated material. Water within a confined aquifer is trapped under pressure, because it cannot easily escape upward or downward through the confining layers. If a well is drilled through the upper confining layer into a confined aquifer, this pressure can force water to rise well above the top of the aquifer itself, and in some cases the water will flow out at the surface without any pumping at all. A well of this kind is known as an artesian well, and it is direct evidence of the pressure that builds up within confined systems.",
    },
    {
      label: "F",
      text: "Aquifers are not isolated underground reservoirs; they are part of a single, connected water system. Precipitation that soaks into the ground eventually adds water back into an aquifer, a process known as recharge, while the same aquifer typically discharges water into nearby streams, springs and wetlands, helping to sustain them, particularly during periods when rainfall is scarce and surface flow would otherwise dry up. Because a single aquifer can extend for many kilometres beneath the surface, the water drawn from a well in one location can be connected to conditions and users many kilometres away, meaning that a change in pumping in one area can, over time, be felt by people and ecosystems far from that well.",
    },
    {
      label: "G",
      text: "Under natural conditions, the amount of water leaving an aquifer through discharge and pumping is roughly balanced by the amount of water added through recharge, and the water table remains fairly stable over the long term. Around a working well, however, pumping continuously removes water faster than it can flow in from the surrounding aquifer, producing a local, funnel-shaped drop in the water table known as a cone of depression. A small, temporary cone of depression is normal, but when pumping consistently outpaces recharge, this local decline can spread and deepen, setting the stage for the more widespread effects addressed in the next stage of the story: groundwater depletion.",
    },
  ],
  questions: [
    {
      id: "gw-q1",
      number: 1,
      group: "Questions 1-4: Matching headings",
      kind: "matching-headings",
      prompt: "Choose the best heading for paragraph B from the list of headings below.",
      instruction:
        "There are more headings than paragraphs, so you will not use all of them.",
      options: [
        { value: "i", label: "i. A hidden reserve larger than the world's surface water" },
        { value: "ii", label: "ii. Rock properties that control the speed of underground flow" },
        { value: "iii", label: "iii. Layers of pressure: how confined aquifers behave" },
        { value: "iv", label: "iv. A resource replenished from above" },
        { value: "v", label: "v. A last line of defence against contamination" },
        { value: "vi", label: "vi. Defining nature's underground reservoirs" },
      ],
      answer: "vi",
      explanation:
        "Paragraph B introduces and defines the water table and the aquifer as an underground storehouse of water.",
      evidence: "Aquifers are sometimes described as huge underground storehouses of water",
    },
    {
      id: "gw-q2",
      number: 2,
      group: "Questions 1-4: Matching headings",
      kind: "matching-headings",
      prompt: "Choose the best heading for paragraph C from the list of headings below.",
      instruction:
        "There are more headings than paragraphs, so you will not use all of them.",
      options: [
        { value: "i", label: "i. A hidden reserve larger than the world's surface water" },
        { value: "ii", label: "ii. Rock properties that control the speed of underground flow" },
        { value: "iii", label: "iii. Layers of pressure: how confined aquifers behave" },
        { value: "iv", label: "iv. A resource replenished from above" },
        { value: "v", label: "v. A last line of defence against contamination" },
        { value: "vi", label: "vi. Defining nature's underground reservoirs" },
      ],
      answer: "ii",
      explanation:
        "Paragraph C explains how porosity and permeability determine how quickly water can move through a rock layer.",
      evidence:
        "Whether a layer of rock or sediment makes a good aquifer depends on two properties: porosity and permeability",
    },
    {
      id: "gw-q3",
      number: 3,
      group: "Questions 1-4: Matching headings",
      kind: "matching-headings",
      prompt: "Choose the best heading for paragraph D from the list of headings below.",
      instruction:
        "There are more headings than paragraphs, so you will not use all of them.",
      options: [
        { value: "i", label: "i. A hidden reserve larger than the world's surface water" },
        { value: "ii", label: "ii. Rock properties that control the speed of underground flow" },
        { value: "iii", label: "iii. Layers of pressure: how confined aquifers behave" },
        { value: "iv", label: "iv. A resource replenished from above" },
        { value: "v", label: "v. A last line of defence against contamination" },
        { value: "vi", label: "vi. Defining nature's underground reservoirs" },
      ],
      answer: "iv",
      explanation:
        "Paragraph D describes how an unconfined aquifer is recharged directly by rain and melting snow infiltrating from the surface.",
      evidence:
        "rain and melting snow simply infiltrate downward through the soil until they reach the water table",
    },
    {
      id: "gw-q4",
      number: 4,
      group: "Questions 1-4: Matching headings",
      kind: "matching-headings",
      prompt: "Choose the best heading for paragraph E from the list of headings below.",
      instruction:
        "There are more headings than paragraphs, so you will not use all of them.",
      options: [
        { value: "i", label: "i. A hidden reserve larger than the world's surface water" },
        { value: "ii", label: "ii. Rock properties that control the speed of underground flow" },
        { value: "iii", label: "iii. Layers of pressure: how confined aquifers behave" },
        { value: "iv", label: "iv. A resource replenished from above" },
        { value: "v", label: "v. A last line of defence against contamination" },
        { value: "vi", label: "vi. Defining nature's underground reservoirs" },
      ],
      answer: "iii",
      explanation:
        "Paragraph E explains that water in a confined aquifer is trapped under pressure between confining layers, producing artesian wells.",
      evidence: "Water within a confined aquifer is trapped under pressure",
    },
    {
      id: "gw-q5",
      number: 5,
      group: "Questions 5-8: True/False/Not Given",
      kind: "true-false-not-given",
      prompt:
        "The passage states that there is less water stored underground than in all of the world's rivers and lakes combined.",
      instruction:
        "Write TRUE if the statement agrees with the passage, FALSE if it contradicts the passage, or NOT GIVEN if there is no information on this.",
      options: [
        { value: "TRUE", label: "TRUE" },
        { value: "FALSE", label: "FALSE" },
        { value: "NOT GIVEN", label: "NOT GIVEN" },
      ],
      answer: "FALSE",
      explanation:
        "The passage says underground water exceeds surface water by more than a thousand times, the opposite of the statement.",
      evidence:
        "there is more than a thousand times more water stored underground than is held in all of the world's rivers and lakes combined",
    },
    {
      id: "gw-q6",
      number: 6,
      group: "Questions 5-8: True/False/Not Given",
      kind: "true-false-not-given",
      prompt: "An unconfined aquifer receives water directly through infiltration from the surface.",
      instruction:
        "Write TRUE if the statement agrees with the passage, FALSE if it contradicts the passage, or NOT GIVEN if there is no information on this.",
      options: [
        { value: "TRUE", label: "TRUE" },
        { value: "FALSE", label: "FALSE" },
        { value: "NOT GIVEN", label: "NOT GIVEN" },
      ],
      answer: "TRUE",
      explanation:
        "Paragraph D confirms that unconfined aquifers are recharged directly as rain and melting snow infiltrate down to the water table.",
      evidence:
        "an unconfined aquifer is recharged directly: rain and melting snow simply infiltrate downward through the soil until they reach the water table",
    },
    {
      id: "gw-q7",
      number: 7,
      group: "Questions 5-8: True/False/Not Given",
      kind: "true-false-not-given",
      prompt: "Artesian wells were first identified in the United States during the eighteenth century.",
      instruction:
        "Write TRUE if the statement agrees with the passage, FALSE if it contradicts the passage, or NOT GIVEN if there is no information on this.",
      options: [
        { value: "TRUE", label: "TRUE" },
        { value: "FALSE", label: "FALSE" },
        { value: "NOT GIVEN", label: "NOT GIVEN" },
      ],
      answer: "NOT GIVEN",
      explanation:
        "The passage explains what an artesian well is but gives no date or country for when they were first identified.",
      evidence:
        "A well of this kind is known as an artesian well, and it is direct evidence of the pressure that builds up within confined systems",
    },
    {
      id: "gw-q8",
      number: 8,
      group: "Questions 5-8: True/False/Not Given",
      kind: "true-false-not-given",
      prompt: "Water drawn from an aquifer at one location can affect conditions many kilometres away.",
      instruction:
        "Write TRUE if the statement agrees with the passage, FALSE if it contradicts the passage, or NOT GIVEN if there is no information on this.",
      options: [
        { value: "TRUE", label: "TRUE" },
        { value: "FALSE", label: "FALSE" },
        { value: "NOT GIVEN", label: "NOT GIVEN" },
      ],
      answer: "TRUE",
      explanation:
        "Paragraph F states that because aquifers extend widely, pumping in one place can affect users and ecosystems far from that well.",
      evidence:
        "the water drawn from a well in one location can be connected to conditions and users many kilometres away",
    },
    {
      id: "gw-q9",
      number: 9,
      group: "Questions 9-13: Sentence completion",
      kind: "sentence-completion",
      prompt:
        "Complete the sentence. The boundary between the unsaturated zone and the saturated zone below it is called the ______.",
      instruction: "Write NO MORE THAN TWO WORDS.",
      answer: "water table",
      acceptedAnswers: ["water table", "the water table"],
      explanation: "Paragraph B defines this boundary directly.",
      evidence: "The boundary between these two zones, where saturation begins, is known as the water table",
    },
    {
      id: "gw-q10",
      number: 10,
      group: "Questions 9-13: Sentence completion",
      kind: "sentence-completion",
      prompt:
        "Complete the sentence. Sand and gravel typically have high porosity and ______, allowing water to pass through freely.",
      instruction: "Write ONE WORD ONLY.",
      answer: "permeability",
      acceptedAnswers: ["permeability"],
      explanation: "Paragraph C names porosity and permeability as the two properties that determine flow.",
      evidence: "depends on two properties: porosity and permeability",
    },
    {
      id: "gw-q11",
      number: 11,
      group: "Questions 9-13: Sentence completion",
      kind: "sentence-completion",
      prompt:
        "Complete the sentence. In a ______ aquifer, water is trapped under pressure between two layers of less permeable rock.",
      instruction: "Write ONE WORD ONLY.",
      answer: "confined",
      acceptedAnswers: ["confined"],
      explanation: "Paragraph E describes the confined aquifer as sandwiched between confining layers, trapping water under pressure.",
      evidence: "A confined aquifer, in contrast, is sandwiched between two layers of far less permeable rock",
    },
    {
      id: "gw-q12",
      number: 12,
      group: "Questions 9-13: Sentence completion",
      kind: "sentence-completion",
      prompt:
        "Complete the sentence. When pressure forces groundwater to rise above the top of a confined aquifer, sometimes without pumping, the result is called an ______ well.",
      instruction: "Write ONE WORD ONLY.",
      answer: "artesian",
      acceptedAnswers: ["artesian"],
      explanation: "Paragraph E names this kind of well directly.",
      evidence: "A well of this kind is known as an artesian well",
    },
    {
      id: "gw-q13",
      number: 13,
      group: "Questions 9-13: Sentence completion",
      kind: "sentence-completion",
      prompt:
        "Complete the sentence. Around a heavily pumped well, a local, funnel-shaped drop in the water table is known as a cone of ______.",
      instruction: "Write ONE WORD ONLY.",
      answer: "depression",
      acceptedAnswers: ["depression"],
      explanation: "Paragraph G names this local decline directly.",
      evidence: "producing a local, funnel-shaped drop in the water table known as a cone of depression",
    },
  ],
};

const groundwaterDepletionCauses: ReadingPassage = {
  id: "groundwater-depletion-causes",
  title: "The causes and detection of groundwater depletion",
  subtitle: "Why underground reserves are shrinking, and how scientists track the loss",
  paragraphs: [
    {
      label: "A",
      text: "Groundwater depletion is usually defined as a long-term decline in the level of water stored in an aquifer, caused by pumping that persistently exceeds the rate at which the aquifer is recharged. The relationship is often compared to a bank account: as long as withdrawals stay within the amount being deposited, a balance can be maintained indefinitely, but once withdrawals consistently exceed deposits, the balance falls and will eventually run low. Depletion of this kind is not simply a short-term fluctuation caused by a single dry season; it is a sustained downward trend that can continue for decades if the underlying pattern of pumping is not changed.",
    },
    {
      label: "B",
      text: "In the United States, cumulative groundwater depletion between 1900 and 2008 has been estimated at roughly 1,000 cubic kilometres, an average of about 9.2 cubic kilometres a year across that entire period. This long-term average, however, disguises a sharp recent acceleration. During the final years of that period, from 2000 to 2008, the depletion rate averaged almost 25 cubic kilometres a year, nearly three times the rate typical of the twentieth century as a whole. Such figures indicate that the pace at which the country's underground reserves are being drawn down has been increasing rather than levelling off.",
    },
    {
      label: "C",
      text: "Several factors drive this accelerating withdrawal. Agricultural irrigation is the largest single use, consuming more than 50 billion gallons of groundwater a day in the United States, much of it in regions with limited surface water. Rapidly growing urban areas add further demand, since municipal supplies increasingly rely on wells to meet the needs of expanding populations. Demand also spikes during drought, when reduced rainfall lowers natural recharge just as farmers and cities turn more heavily to groundwater to make up for the shortfall in surface water, compounding the pressure on aquifers from two directions at once.",
    },
    {
      label: "D",
      text: "The most direct consequence of sustained over-pumping is a falling water table. As the water table drops, existing wells may no longer reach the saturated zone and can run dry, forcing well owners to drill deeper, more expensive replacements. Pumping costs also rise, since water must be lifted a greater distance to the surface. In places where many wells draw from the same aquifer, overlapping cones of depression can widen and merge, producing a broad, persistent decline across an entire region rather than a series of isolated local effects around individual wells.",
    },
    {
      label: "E",
      text: "A second, often irreversible, consequence is land subsidence. When large volumes of water are withdrawn from aquifers containing fine-grained sediment, the sediment can compact permanently as the water that once helped support it is removed, causing the ground surface above to sink. Nationally, more than 17,000 square miles across 45 states, an area comparable in size to New Hampshire and Vermont combined, have been directly affected by subsidence, and more than 80 percent of documented subsidence in the country has been attributed to groundwater withdrawal. In California's San Joaquin Valley, a series of historical photographs taken at the same site in 1925, 1955 and 1977 famously documents the sinking ground surface. Because compacted sediment cannot fully expand again even if pumping stops, this loss of underground storage capacity is generally considered permanent.",
    },
    {
      label: "F",
      text: "Tracking depletion accurately is essential for managing it, but doing so across a whole aquifer system, sometimes spanning several states, is not straightforward. The traditional method relies on networks of monitoring wells, where water levels are measured repeatedly over months or years to reveal long-term trends. This approach can be highly precise at each individual well, but because wells are unevenly distributed and often sparse, well-based monitoring alone struggles to capture how storage is changing across an entire aquifer system rather than at isolated points.",
    },
    {
      label: "G",
      text: "Since 2002, satellites known as GRACE have offered a complementary, large-scale view. These satellites can detect extremely small changes in the Earth's gravitational field that occur when significant amounts of mass, including water, shift from one place to another. Because groundwater is only one of several types of water storage that influence gravity readings, scientists must subtract the estimated contribution of snow, surface water and soil moisture from the total signal in order to isolate the change attributable to groundwater. Combining these satellite-derived estimates with ground-based data and computer models, researchers have produced national assessments of depletion; one such study found that combined losses from California's Central Valley and the south-central High Plains totalled roughly 90 cubic kilometres, about three times the storage capacity of Lake Mead, the largest reservoir in the United States.",
    },
    {
      label: "H",
      text: "GRACE data are not, however, a substitute for ground-based monitoring. The satellites are sensitive to mass changes only across very large areas, generally more than 100,000 square kilometres, which makes them well suited to tracking broad regional or national trends but poorly suited to informing decisions about a single aquifer or well field. For that reason, the most reliable national assessments continue to combine satellite measurements with ground-based observations rather than relying on either method alone.",
    },
  ],
  questions: [
    {
      id: "gw-q14",
      number: 14,
      group: "Questions 14-17: Matching information",
      kind: "matching-information",
      prompt:
        "Which paragraph contains a comparison between the combined water losses from two aquifer systems and the storage capacity of a well-known reservoir?",
      instruction: "Write the correct letter, A-H.",
      options: [
        { value: "A", label: "Paragraph A" },
        { value: "B", label: "Paragraph B" },
        { value: "C", label: "Paragraph C" },
        { value: "D", label: "Paragraph D" },
        { value: "E", label: "Paragraph E" },
        { value: "F", label: "Paragraph F" },
        { value: "G", label: "Paragraph G" },
        { value: "H", label: "Paragraph H" },
      ],
      answer: "G",
      explanation:
        "Paragraph G compares combined losses from two aquifer systems to the storage capacity of Lake Mead.",
      evidence:
        "combined losses from California's Central Valley and the south-central High Plains totalled roughly 90 cubic kilometres, about three times the storage capacity of Lake Mead",
    },
    {
      id: "gw-q15",
      number: 15,
      group: "Questions 14-17: Matching information",
      kind: "matching-information",
      prompt:
        "Which paragraph contains a figure showing that the recent rate of depletion is nearly three times the twentieth-century average?",
      instruction: "Write the correct letter, A-H.",
      options: [
        { value: "A", label: "Paragraph A" },
        { value: "B", label: "Paragraph B" },
        { value: "C", label: "Paragraph C" },
        { value: "D", label: "Paragraph D" },
        { value: "E", label: "Paragraph E" },
        { value: "F", label: "Paragraph F" },
        { value: "G", label: "Paragraph G" },
        { value: "H", label: "Paragraph H" },
      ],
      answer: "B",
      explanation:
        "Paragraph B gives the 2000-2008 depletion rate as nearly three times the twentieth-century average rate.",
      evidence:
        "the depletion rate averaged almost 25 cubic kilometres a year, nearly three times the rate typical of the twentieth century as a whole",
    },
    {
      id: "gw-q16",
      number: 16,
      group: "Questions 14-17: Matching information",
      kind: "matching-information",
      prompt:
        "Which paragraph explains why satellite data alone cannot guide decisions about a single aquifer?",
      instruction: "Write the correct letter, A-H.",
      options: [
        { value: "A", label: "Paragraph A" },
        { value: "B", label: "Paragraph B" },
        { value: "C", label: "Paragraph C" },
        { value: "D", label: "Paragraph D" },
        { value: "E", label: "Paragraph E" },
        { value: "F", label: "Paragraph F" },
        { value: "G", label: "Paragraph G" },
        { value: "H", label: "Paragraph H" },
      ],
      answer: "H",
      explanation:
        "Paragraph H explains that GRACE is suited to large-scale trends but poorly suited to single-aquifer decisions.",
      evidence:
        "which makes them well suited to tracking broad regional or national trends but poorly suited to informing decisions about a single aquifer or well field",
    },
    {
      id: "gw-q17",
      number: 17,
      group: "Questions 14-17: Matching information",
      kind: "matching-information",
      prompt:
        "Which paragraph gives a reason why the loss of underground storage space caused by subsidence cannot be undone?",
      instruction: "Write the correct letter, A-H.",
      options: [
        { value: "A", label: "Paragraph A" },
        { value: "B", label: "Paragraph B" },
        { value: "C", label: "Paragraph C" },
        { value: "D", label: "Paragraph D" },
        { value: "E", label: "Paragraph E" },
        { value: "F", label: "Paragraph F" },
        { value: "G", label: "Paragraph G" },
        { value: "H", label: "Paragraph H" },
      ],
      answer: "E",
      explanation:
        "Paragraph E explains that compacted sediment cannot fully expand again, so the storage loss is permanent.",
      evidence:
        "Because compacted sediment cannot fully expand again even if pumping stops, this loss of underground storage capacity is generally considered permanent",
    },
    {
      id: "gw-q18",
      number: 18,
      group: "Questions 18-21: Yes/No/Not Given",
      kind: "yes-no-not-given",
      prompt:
        "Agricultural irrigation is described as the only significant cause of increased groundwater pumping in the United States.",
      instruction:
        "Write YES if the statement agrees with the claims of the writer, NO if it contradicts them, or NOT GIVEN if there is no information on this.",
      options: [
        { value: "YES", label: "YES" },
        { value: "NO", label: "NO" },
        { value: "NOT GIVEN", label: "NOT GIVEN" },
      ],
      answer: "NO",
      explanation:
        "Paragraph C also names growing urban demand and drought-driven pumping as significant drivers, not irrigation alone.",
      evidence:
        "Rapidly growing urban areas add further demand, since municipal supplies increasingly rely on wells to meet the needs of expanding populations",
    },
    {
      id: "gw-q19",
      number: 19,
      group: "Questions 18-21: Yes/No/Not Given",
      kind: "yes-no-not-given",
      prompt:
        "More than 80 percent of the land subsidence documented in the United States has been linked to groundwater withdrawal.",
      instruction:
        "Write YES if the statement agrees with the claims of the writer, NO if it contradicts them, or NOT GIVEN if there is no information on this.",
      options: [
        { value: "YES", label: "YES" },
        { value: "NO", label: "NO" },
        { value: "NOT GIVEN", label: "NOT GIVEN" },
      ],
      answer: "YES",
      explanation: "Paragraph E states this figure directly.",
      evidence: "more than 80 percent of documented subsidence in the country has been attributed to groundwater withdrawal",
    },
    {
      id: "gw-q20",
      number: 20,
      group: "Questions 18-21: Yes/No/Not Given",
      kind: "yes-no-not-given",
      prompt:
        "GRACE satellites measure groundwater storage directly, without needing information about any other type of water storage.",
      instruction:
        "Write YES if the statement agrees with the claims of the writer, NO if it contradicts them, or NOT GIVEN if there is no information on this.",
      options: [
        { value: "YES", label: "YES" },
        { value: "NO", label: "NO" },
        { value: "NOT GIVEN", label: "NOT GIVEN" },
      ],
      answer: "NO",
      explanation:
        "Paragraph G states scientists must subtract snow, surface water and soil moisture from the total signal, so the measurement is not direct.",
      evidence:
        "scientists must subtract the estimated contribution of snow, surface water and soil moisture from the total signal in order to isolate the change attributable to groundwater",
    },
    {
      id: "gw-q21",
      number: 21,
      group: "Questions 18-21: Yes/No/Not Given",
      kind: "yes-no-not-given",
      prompt: "The historical photographs of the San Joaquin Valley were taken by the same photographer on each occasion.",
      instruction:
        "Write YES if the statement agrees with the claims of the writer, NO if it contradicts them, or NOT GIVEN if there is no information on this.",
      options: [
        { value: "YES", label: "YES" },
        { value: "NO", label: "NO" },
        { value: "NOT GIVEN", label: "NOT GIVEN" },
      ],
      answer: "NOT GIVEN",
      explanation:
        "The passage mentions the photographs and their dates but never says who took them.",
      evidence:
        "a series of historical photographs taken at the same site in 1925, 1955 and 1977 famously documents the sinking ground surface",
    },
    {
      id: "gw-q22",
      number: 22,
      group: "Questions 22-26: Summary completion",
      kind: "summary-completion",
      prompt:
        "Complete the summary. Because it is impractical to check every well by hand across a whole country, scientists have turned to ______ that orbit the Earth.",
      instruction: "Write NO MORE THAN TWO WORDS for each answer, taken from the passage.",
      answer: "satellites",
      acceptedAnswers: ["satellites", "GRACE satellites"],
      explanation: "Paragraph G introduces GRACE as satellites offering a large-scale view.",
      evidence: "satellites known as GRACE have offered a complementary, large-scale view",
    },
    {
      id: "gw-q23",
      number: 23,
      group: "Questions 22-26: Summary completion",
      kind: "summary-completion",
      prompt:
        "Complete the summary. Launched in 2002, these instruments can detect tiny changes in the planet's ______ that occur when large amounts of water are gained or lost in a region.",
      instruction: "Write NO MORE THAN TWO WORDS for each answer, taken from the passage.",
      answer: "gravitational field",
      acceptedAnswers: ["gravitational field", "gravity field"],
      explanation: "Paragraph G states the satellites detect changes in the Earth's gravitational field.",
      evidence: "detect extremely small changes in the Earth's gravitational field",
    },
    {
      id: "gw-q24",
      number: 24,
      group: "Questions 22-26: Summary completion",
      kind: "summary-completion",
      prompt:
        "Complete the summary. Because the satellites record total water storage, researchers must subtract the contribution of ______, surface water and soil moisture in order to isolate the groundwater signal.",
      instruction: "Write NO MORE THAN TWO WORDS for each answer, taken from the passage.",
      answer: "snow",
      acceptedAnswers: ["snow"],
      explanation: "Paragraph G lists snow, surface water and soil moisture as components that must be subtracted.",
      evidence: "subtract the estimated contribution of snow, surface water and soil moisture from the total signal",
    },
    {
      id: "gw-q25",
      number: 25,
      group: "Questions 22-26: Summary completion",
      kind: "summary-completion",
      prompt:
        "Complete the summary. This information is then combined with ground-based data and ______ to build a national picture of depletion.",
      instruction: "Write NO MORE THAN TWO WORDS for each answer, taken from the passage.",
      answer: "computer models",
      acceptedAnswers: ["computer models", "models"],
      explanation: "Paragraph G says satellite estimates are combined with ground-based data and computer models.",
      evidence: "Combining these satellite-derived estimates with ground-based data and computer models",
    },
    {
      id: "gw-q26",
      number: 26,
      group: "Questions 22-26: Summary completion",
      kind: "summary-completion",
      prompt:
        "Complete the summary. In one assessment, combined losses from two major aquifer systems reached a volume roughly three times the storage capacity of ______.",
      instruction: "Write NO MORE THAN TWO WORDS for each answer, taken from the passage.",
      answer: "Lake Mead",
      acceptedAnswers: ["Lake Mead"],
      explanation: "Paragraph G states the combined losses were about three times the storage capacity of Lake Mead.",
      evidence: "about three times the storage capacity of Lake Mead, the largest reservoir in the United States",
    },
  ],
};

const groundwaterConsequences: ReadingPassage = {
  id: "groundwater-consequences",
  title: "The wider consequences of groundwater depletion, and responses to it",
  subtitle: "From shrinking rivers and saltwater intrusion to managed aquifer recharge",
  paragraphs: [
    {
      label: "A",
      text: "Groundwater and surface water are frequently treated as separate resources, yet hydrologically they form a single, interconnected system. In most river basins, aquifers continuously discharge water into channels, sustaining what is known as baseflow, the portion of a river's discharge that persists between rainfall events and that becomes proportionally most important during dry periods, when direct runoff has ceased. When pumping from a well intercepts water that would otherwise have travelled onward to a stream, the result is streamflow depletion: a reduction in river flow attributable not to reduced rainfall but to groundwater withdrawal. Because aquifers respond slowly to changes in pumping, the resulting decline in streamflow can take years to become apparent and may ultimately be measured a considerable distance from the well responsible for it.",
    },
    {
      label: "B",
      text: "Where a falling water table drops below the depth that streamside, or riparian, vegetation can reach with its roots, the consequences for local ecosystems can be severe. Cottonwood and willow trees lining desert rivers, for instance, depend on a shallow, reliable water table rather than on rainfall alone, since rain in arid regions is often too infrequent to sustain them. Along Arizona's Santa Cruz River, extensive groundwater pumping was accompanied by a documented loss of riparian gallery forest between 1942 and 1989, as the water table serving the corridor fell below the reach of the vegetation's roots, illustrating how a hydrological change below ground can be expressed, sometimes irreversibly, as an ecological one above it.",
    },
    {
      label: "C",
      text: "Along coastlines, fresh groundwater and denser, underlying saline water are held in a rough equilibrium: outward-flowing fresh groundwater exerts pressure that keeps the interface with saltwater pushed seaward. Pumping disturbs this balance. As fresh groundwater is withdrawn faster than it is replenished, the outward pressure weakens, and saline water can migrate inland and upward, a process known as saltwater intrusion, eventually contaminating wells that once yielded fresh water. The severity of intrusion at a given site depends on several interacting factors: the rate of pumping relative to the rate of recharge, the distance between the zone where groundwater discharges and the nearest source of saline water, the geologic structure of the aquifer, and the presence of confining layers that can either slow or channel the movement of saline water inland.",
    },
    {
      label: "D",
      text: "In many coastal aquifer systems, saltwater intrusion does not occur in isolation. Where sustained pumping has also caused land subsidence, the combination can be particularly damaging: a sinking land surface increases the exposure of low-lying coastal land to flooding and tidal inundation, while the reduced freshwater pressure that accompanies overpumping simultaneously makes it easier for saline water to advance inland. Addressing either problem in isolation, without considering how pumping practices contribute to both, risks leaving a coastal aquifer system only partially protected.",
    },
    {
      label: "E",
      text: "One increasingly common management response is managed aquifer recharge, commonly abbreviated as MAR, in which water is deliberately introduced into an aquifer to rebuild storage rather than being left to infiltrate naturally alone. Water drawn from treated wastewater, captured storm run-off or seasonal floodwater is directed into the ground, either through surface infiltration basins that allow it to percolate slowly downward or through injection wells that deliver it directly into deeper, confined layers. Once underground, this water rejoins the same saturated zone tapped by wells, gradually raising the water table and, over time, helping to offset losses caused by pumping that exceeds natural recharge.",
    },
    {
      label: "F",
      text: "Managed aquifer recharge is also used specifically to counter saltwater intrusion. By introducing freshwater landward of the saltwater front, typically through a line of injection wells positioned parallel to the coast, water managers can raise the local hydraulic head, the pressure that drives groundwater flow, sufficiently to halt or even reverse the inland advance of saline water. This approach effectively recreates, artificially, the outward pressure that pumping had previously eroded, functioning as a freshwater barrier against further intrusion rather than simply replenishing storage that has already been depleted.",
    },
    {
      label: "G",
      text: "Beyond combating salinity, managed aquifer recharge is credited with several further benefits: it can help reduce ongoing subsidence by restoring pressure to compacting sediments, and by sustaining the water table it can help maintain the baseflow that supports rivers and the ecosystems that depend on them. Even so, most water managers present recharge as a complement to reduced pumping rather than a substitute for it: because MAR addresses only the supply side of the equation, restoring what has already been withdrawn, sustainable management of any aquifer ultimately still depends on keeping long-term withdrawal in balance with recharge, exactly the relationship whose breakdown caused depletion in the first place.",
    },
  ],
  questions: [
    {
      id: "gw-q27",
      number: 27,
      group: "Questions 27-30: Multiple choice",
      kind: "multiple-choice",
      prompt:
        "According to paragraph A, why might a reduction in a river's flow caused by groundwater pumping not become obvious until long after pumping begins, and possibly far from the well itself?",
      instruction: "Choose the correct letter, A, B, C or D.",
      options: [
        { value: "A", label: "A. Rivers are affected by rainfall long before they are affected by groundwater." },
        {
          value: "B",
          label:
            "B. Aquifers change slowly in response to pumping, and the effect can travel through the connected system to a discharge point some distance away.",
        },
        { value: "C", label: "C. Streamflow depletion only affects rivers during exceptionally wet years." },
        { value: "D", label: "D. Wells are always drilled directly beside the rivers they eventually affect." },
      ],
      answer: "B",
      explanation:
        "Paragraph A explains that aquifers respond slowly, so the decline can take years to appear and be measured far from the well.",
      evidence:
        "Because aquifers respond slowly to changes in pumping, the resulting decline in streamflow can take years to become apparent and may ultimately be measured a considerable distance from the well responsible for it",
    },
    {
      id: "gw-q28",
      number: 28,
      group: "Questions 27-30: Multiple choice",
      kind: "multiple-choice",
      prompt: "What does the example of the Santa Cruz River in paragraph B mainly illustrate?",
      instruction: "Choose the correct letter, A, B, C or D.",
      options: [
        { value: "A", label: "A. Riparian vegetation is more resilient to groundwater decline than desert plants." },
        { value: "B", label: "B. Rainfall alone is normally sufficient to sustain riparian vegetation in arid regions." },
        {
          value: "C",
          label:
            "C. A falling water table can remove the water source that riparian vegetation depends on, with lasting ecological effects.",
        },
        { value: "D", label: "D. Groundwater pumping has had no measurable impact on vegetation along the Santa Cruz River." },
      ],
      answer: "C",
      explanation:
        "The Santa Cruz example shows riparian forest disappearing as the water table fell below the reach of its roots.",
      evidence:
        "extensive groundwater pumping was accompanied by a documented loss of riparian gallery forest between 1942 and 1989, as the water table serving the corridor fell below the reach of the vegetation's roots",
    },
    {
      id: "gw-q29",
      number: 29,
      group: "Questions 27-30: Multiple choice",
      kind: "multiple-choice",
      prompt: "Based on paragraph C, what directly allows saltwater to begin moving inland into a coastal aquifer?",
      instruction: "Choose the correct letter, A, B, C or D.",
      options: [
        { value: "A", label: "A. An increase in the number of confining layers within the aquifer." },
        {
          value: "B",
          label: "B. A weakening of the outward pressure normally maintained by fresh groundwater flow.",
        },
        { value: "C", label: "C. A rise in the geologic permeability of coastal sediment." },
        { value: "D", label: "D. An increase in the distance between the aquifer and the coastline." },
      ],
      answer: "B",
      explanation:
        "Paragraph C states that as pumping weakens the outward pressure of fresh groundwater, saline water migrates inland.",
      evidence: "the outward pressure weakens, and saline water can migrate inland and upward",
    },
    {
      id: "gw-q30",
      number: 30,
      group: "Questions 27-30: Multiple choice",
      kind: "multiple-choice",
      prompt:
        "Why, according to paragraph G, is managed aquifer recharge generally regarded as incomplete on its own as a management strategy?",
      instruction: "Choose the correct letter, A, B, C or D.",
      options: [
        { value: "A", label: "A. It is technically impossible to combine it with reduced pumping." },
        { value: "B", label: "B. It only works in coastal aquifers affected by saltwater intrusion." },
        {
          value: "C",
          label:
            "C. It restores water that has already been withdrawn but does not, by itself, bring long-term withdrawal back into balance with recharge.",
        },
        { value: "D", label: "D. It has been shown to increase the rate of subsidence in most aquifer systems." },
      ],
      answer: "C",
      explanation:
        "Paragraph G states MAR addresses only the supply side, while sustainable management still requires balancing withdrawal with recharge.",
      evidence:
        "because MAR addresses only the supply side of the equation, restoring what has already been withdrawn, sustainable management of any aquifer ultimately still depends on keeping long-term withdrawal in balance with recharge",
    },
    {
      id: "gw-q31",
      number: 31,
      group: "Questions 31-34: Matching features",
      kind: "matching-features",
      prompt:
        "How much water is being withdrawn compared with how much is naturally replacing it.",
      instruction: "Match each statement with the correct factor, A-D. You may use each letter once.",
      options: [
        { value: "A", label: "A. The rate of pumping relative to the rate of recharge" },
        { value: "B", label: "B. The distance between the discharge zone and the nearest source of saline water" },
        { value: "C", label: "C. The geologic structure of the aquifer" },
        { value: "D", label: "D. The presence of confining layers" },
      ],
      answer: "A",
      explanation: "This restates the pumping-to-recharge ratio named in paragraph C.",
      evidence: "the rate of pumping relative to the rate of recharge",
    },
    {
      id: "gw-q32",
      number: 32,
      group: "Questions 31-34: Matching features",
      kind: "matching-features",
      prompt: "How close the point where groundwater leaves the aquifer is to a body of saline water.",
      instruction: "Match each statement with the correct factor, A-D. You may use each letter once.",
      options: [
        { value: "A", label: "A. The rate of pumping relative to the rate of recharge" },
        { value: "B", label: "B. The distance between the discharge zone and the nearest source of saline water" },
        { value: "C", label: "C. The geologic structure of the aquifer" },
        { value: "D", label: "D. The presence of confining layers" },
      ],
      answer: "B",
      explanation: "This restates the distance factor named in paragraph C.",
      evidence: "the distance between the zone where groundwater discharges and the nearest source of saline water",
    },
    {
      id: "gw-q33",
      number: 33,
      group: "Questions 31-34: Matching features",
      kind: "matching-features",
      prompt: "Layers that can slow down or redirect the movement of saline water underground.",
      instruction: "Match each statement with the correct factor, A-D. You may use each letter once.",
      options: [
        { value: "A", label: "A. The rate of pumping relative to the rate of recharge" },
        { value: "B", label: "B. The distance between the discharge zone and the nearest source of saline water" },
        { value: "C", label: "C. The geologic structure of the aquifer" },
        { value: "D", label: "D. The presence of confining layers" },
      ],
      answer: "D",
      explanation: "This restates the confining-layer factor named in paragraph C.",
      evidence: "the presence of confining layers that can either slow or channel the movement of saline water inland",
    },
    {
      id: "gw-q34",
      number: 34,
      group: "Questions 31-34: Matching features",
      kind: "matching-features",
      prompt: "The overall arrangement of rock and sediment that make up the aquifer.",
      instruction: "Match each statement with the correct factor, A-D. You may use each letter once.",
      options: [
        { value: "A", label: "A. The rate of pumping relative to the rate of recharge" },
        { value: "B", label: "B. The distance between the discharge zone and the nearest source of saline water" },
        { value: "C", label: "C. The geologic structure of the aquifer" },
        { value: "D", label: "D. The presence of confining layers" },
      ],
      answer: "C",
      explanation: "This restates the geologic structure factor named in paragraph C.",
      evidence: "the geologic structure of the aquifer",
    },
    {
      id: "gw-q35",
      number: 35,
      group: "Questions 35-40: Summary completion",
      kind: "summary-completion",
      prompt:
        "Complete the summary. Water from sources such as treated wastewater or captured storm run-off is directed into the ground through infiltration basins or ______, allowing it to rejoin the saturated zone tapped by wells.",
      instruction: "Write NO MORE THAN TWO WORDS for each answer, taken from the passage.",
      answer: "injection wells",
      acceptedAnswers: ["injection wells"],
      explanation: "Paragraph E states water is directed through infiltration basins or injection wells.",
      evidence: "through injection wells that deliver it directly into deeper, confined layers",
    },
    {
      id: "gw-q36",
      number: 36,
      group: "Questions 35-40: Summary completion",
      kind: "summary-completion",
      prompt:
        "Complete the summary. Once underground, this recharged water rejoins the same ______ that is tapped by wells.",
      instruction: "Write NO MORE THAN TWO WORDS for each answer, taken from the passage.",
      answer: "saturated zone",
      acceptedAnswers: ["saturated zone"],
      explanation: "Paragraph E states the water rejoins the same saturated zone tapped by wells.",
      evidence: "this water rejoins the same saturated zone tapped by wells",
    },
    {
      id: "gw-q37",
      number: 37,
      group: "Questions 35-40: Summary completion",
      kind: "summary-completion",
      prompt:
        "Complete the summary. Where the aim is to stop the inland advance of saline water, the recharged freshwater is introduced ______ of the saltwater front.",
      instruction: "Write NO MORE THAN TWO WORDS for each answer, taken from the passage.",
      answer: "landward",
      acceptedAnswers: ["landward"],
      explanation: "Paragraph F states freshwater is introduced landward of the saltwater front.",
      evidence: "By introducing freshwater landward of the saltwater front",
    },
    {
      id: "gw-q38",
      number: 38,
      group: "Questions 35-40: Summary completion",
      kind: "summary-completion",
      prompt:
        "Complete the summary. This raises the local hydraulic ______ enough to halt the intrusion.",
      instruction: "Write NO MORE THAN TWO WORDS for each answer, taken from the passage.",
      answer: "head",
      acceptedAnswers: ["head", "hydraulic head"],
      explanation: "Paragraph F states this raises the local hydraulic head, the pressure that drives groundwater flow.",
      evidence: "water managers can raise the local hydraulic head, the pressure that drives groundwater flow",
    },
    {
      id: "gw-q39",
      number: 39,
      group: "Questions 35-40: Summary completion",
      kind: "summary-completion",
      prompt:
        "Complete the summary. Beyond combating salinity, the same technique can also help to reduce ongoing ______.",
      instruction: "Write NO MORE THAN TWO WORDS for each answer, taken from the passage.",
      answer: "subsidence",
      acceptedAnswers: ["subsidence"],
      explanation: "Paragraph G states MAR can help reduce ongoing subsidence.",
      evidence: "it can help reduce ongoing subsidence by restoring pressure to compacting sediments",
    },
    {
      id: "gw-q40",
      number: 40,
      group: "Questions 35-40: Summary completion",
      kind: "summary-completion",
      prompt:
        "Complete the summary. Sustaining the water table also helps support the baseflow that sustains rivers and the ______ that depend on them.",
      instruction: "Write NO MORE THAN TWO WORDS for each answer, taken from the passage.",
      answer: "ecosystems",
      acceptedAnswers: ["ecosystems"],
      explanation: "Paragraph G states MAR helps maintain baseflow that supports rivers and the ecosystems that depend on them.",
      evidence: "it can help maintain the baseflow that supports rivers and the ecosystems that depend on them",
    },
  ],
};

const academicFullGroundwater: ReadingPracticeTest = {
  id: "academic-full-groundwater",
  title: "Full Test 14: Groundwater and aquifer depletion",
  description:
    "A complete Cambridge-style practice test about how aquifers work, why groundwater reserves are shrinking, and how scientists and water managers detect and respond to depletion, based on USGS Water Science School research.",
  track: "Cambridge-style",
  level: "Advanced",
  minutes: 60,
  passages: [aquiferBasics, groundwaterDepletionCauses, groundwaterConsequences],
};

const ensoBasics: ReadingPassage = {
  id: "enso-basics",
  title: "El Niño, La Niña and the rhythm of the Pacific",
  subtitle: "An introduction to the El Niño-Southern Oscillation cycle",
  paragraphs: [
    {
      label: "A",
      text: `Every few years, meteorologists and news reports around the world start talking about El Niño or La Niña, but few people outside the world of climate science understand what these terms actually describe. Both are phases of a single natural climate cycle called the El Niño-Southern Oscillation, or ENSO, which develops in the tropical Pacific Ocean and then influences weather far beyond it. Rather than being a single event, ENSO is best understood as a cycle with three possible states: a warm phase known as El Niño, a cool phase known as La Niña, and a middle state, referred to as ENSO-neutral, in which neither pattern dominates. The cycle does not follow a fixed timetable; instead, it shifts between these phases irregularly, roughly every two to seven years, disrupting the wind and rainfall patterns that tropical regions normally experience and sending ripple effects across the globe.`,
    },
    {
      label: "B",
      text: `The name El Niño has religious rather than scientific origins. In the 1600s, fishermen off the coast of South America noticed that every so often the usually cool coastal waters turned unusually warm, and that this warming tended to peak around Christmas. They called the phenomenon El Niño de Navidad, using a Spanish phrase that can be translated as "the Christmas child", in reference to the infant Jesus. The opposite, cool-water pattern was given a matching name much later: La Niña, meaning "the little girl". It is also known by other names, including El Viejo and simply "a cold event", reflecting the fact that scientists sometimes describe it as the mirror image, or "anti-El Niño", of its warm counterpart.`,
    },
    {
      label: "C",
      text: `To understand either phase of ENSO, it helps to start with what happens in the Pacific when neither is present. Under normal conditions, trade winds blow steadily from east to west along the equator, dragging sun-warmed surface water away from South America and piling it up in the western Pacific, near Asia and Indonesia. As this warm water is pushed toward the west, cooler, nutrient-rich water from the ocean depths rises up to replace it along the South American coast, a process oceanographers call upwelling. This upwelling supports some of the richest fishing grounds in the world, since the nutrients it carries to the surface sustain plankton and, in turn, the fish that feed on them.`,
    },
    {
      label: "D",
      text: `During an El Niño episode, this normal pattern breaks down. The trade winds weaken, and sometimes even reverse direction, so the warm pool of water that is usually confined to the western Pacific spreads back east toward the Americas. Because the winds driving it have weakened, the upwelling of cold water off South America weakens too, or stops altogether, cutting off the supply of nutrients that coastal fisheries depend on. Warmer water sitting where cold water would normally be also affects the atmosphere above it, encouraging more rain to fall over the central and eastern Pacific while the far western Pacific, including Indonesia, becomes drier than usual.`,
    },
    {
      label: "E",
      text: `La Niña episodes represent roughly the opposite situation. Trade winds strengthen beyond their usual force, pushing even more warm water toward the western Pacific and intensifying the upwelling of cold, nutrient-rich water along the South American coast. The eastern Pacific becomes cooler than average, and the additional nutrients reaching the surface can boost marine productivity in the region. Because the atmosphere responds to the pattern of ocean temperatures beneath it, La Niña also shifts the position of the jet stream, the high-altitude river of air that helps steer weather systems, moving it further north than usual over North America.`,
    },
    {
      label: "F",
      text: `Because ocean temperatures fluctuate naturally from month to month, climate scientists do not declare an El Niño or La Niña simply because the sea feels a little warmer or cooler than usual. Officially, an El Niño is only recognised once sea surface temperatures in a specific region of the tropical Pacific known as Niño-3.4 rise to at least 0.5°C above the long-term average, and stay there for five consecutive, overlapping three-month periods. La Niña is declared under the mirror-image rule, with temperatures at least 0.5°C below average for the same length of time. On average, a full episode, once triggered, typically lasts nine to 12 months, although some have persisted for several years, and El Niño episodes tend to occur somewhat more often than La Niña episodes over the long term.`,
    },
    {
      label: "G",
      text: `When neither El Niño nor La Niña is active, the Pacific is said to be in an ENSO-neutral state, and forecasters find it considerably harder to anticipate seasonal shifts in rainfall, storms or temperature than when one phase is clearly established. Once a phase does become established, however, its effects reach far beyond the tropical Pacific. In North America, for example, El Niño winters tend to bring drier, warmer conditions to the northern United States and Canada, while the Gulf Coast and south-eastern states see wetter weather and a greater risk of flooding. La Niña winters tend to do the opposite, bringing drought risk to the southern United States while the Pacific Northwest and western Canada receive heavy rain, and Atlantic hurricane seasons tend to become more active. The mechanisms behind these distant effects, and their consequences for people and ecosystems, are explored later in this test.`,
    },
  ],
  questions: [
    {
      id: "enso-q1",
      number: 1,
      group: "Questions 1-4: Matching headings",
      kind: "matching-headings",
      prompt: `Choose the best heading for paragraph A.`,
      options: [
        { value: "i", label: "i. A gap in scientific understanding" },
        { value: "ii", label: "ii. Naming a recurring pattern after a religious festival" },
        { value: "iii", label: "iii. The normal flow of wind and water across the Pacific" },
        { value: "iv", label: "iv. Three states of a single climate cycle" },
        { value: "v", label: "v. A permanent solution to unpredictable weather" },
        { value: "vi", label: "vi. How weakening winds transform ocean currents" },
      ],
      answer: "iv",
      explanation: `Paragraph A introduces ENSO as a single cycle that moves between three possible states rather than describing one fixed event.`,
      evidence: `ENSO is best understood as a cycle with three possible states: a warm phase known as El Niño, a cool phase known as La Niña, and a middle state, referred to as ENSO-neutral`,
    },
    {
      id: "enso-q2",
      number: 2,
      group: "Questions 1-4: Matching headings",
      kind: "matching-headings",
      prompt: `Choose the best heading for paragraph B.`,
      options: [
        { value: "i", label: "i. A gap in scientific understanding" },
        { value: "ii", label: "ii. Naming a recurring pattern after a religious festival" },
        { value: "iii", label: "iii. The normal flow of wind and water across the Pacific" },
        { value: "iv", label: "iv. Three states of a single climate cycle" },
        { value: "v", label: "v. A permanent solution to unpredictable weather" },
        { value: "vi", label: "vi. How weakening winds transform ocean currents" },
      ],
      answer: "ii",
      explanation: `Paragraph B explains that the term El Niño originated from fishermen linking the warming to the Christmas season, not from any scientific classification.`,
      evidence: `The name El Niño has religious rather than scientific origins.`,
    },
    {
      id: "enso-q3",
      number: 3,
      group: "Questions 1-4: Matching headings",
      kind: "matching-headings",
      prompt: `Choose the best heading for paragraph C.`,
      options: [
        { value: "i", label: "i. A gap in scientific understanding" },
        { value: "ii", label: "ii. Naming a recurring pattern after a religious festival" },
        { value: "iii", label: "iii. The normal flow of wind and water across the Pacific" },
        { value: "iv", label: "iv. Three states of a single climate cycle" },
        { value: "v", label: "v. A permanent solution to unpredictable weather" },
        { value: "vi", label: "vi. How weakening winds transform ocean currents" },
      ],
      answer: "iii",
      explanation: `Paragraph C describes the everyday behaviour of trade winds and upwelling in the Pacific when ENSO is neutral.`,
      evidence: `trade winds blow steadily from east to west along the equator, dragging sun-warmed surface water away from South America and piling it up in the western Pacific`,
    },
    {
      id: "enso-q4",
      number: 4,
      group: "Questions 1-4: Matching headings",
      kind: "matching-headings",
      prompt: `Choose the best heading for paragraph D.`,
      options: [
        { value: "i", label: "i. A gap in scientific understanding" },
        { value: "ii", label: "ii. Naming a recurring pattern after a religious festival" },
        { value: "iii", label: "iii. The normal flow of wind and water across the Pacific" },
        { value: "iv", label: "iv. Three states of a single climate cycle" },
        { value: "v", label: "v. A permanent solution to unpredictable weather" },
        { value: "vi", label: "vi. How weakening winds transform ocean currents" },
      ],
      answer: "vi",
      explanation: `Paragraph D describes how weakening trade winds during El Niño push warm water eastward and shut down upwelling.`,
      evidence: `The trade winds weaken, and sometimes even reverse direction, so the warm pool of water that is usually confined to the western Pacific spreads back east toward the Americas.`,
    },
    {
      id: "enso-q5",
      number: 5,
      group: "Questions 5-9: True/False/Not Given",
      kind: "true-false-not-given",
      prompt: `La Niña episodes are associated with trade winds that are stronger than usual.`,
      instruction: `Write TRUE, FALSE, or NOT GIVEN.`,
      answer: "TRUE",
      explanation: `The passage states directly that trade winds strengthen during La Niña.`,
      evidence: `Trade winds strengthen beyond their usual force, pushing even more warm water toward the western Pacific`,
    },
    {
      id: "enso-q6",
      number: 6,
      group: "Questions 5-9: True/False/Not Given",
      kind: "true-false-not-given",
      prompt: `An El Niño cannot be officially declared unless the relevant sea surface temperatures stay elevated for five consecutive three-month periods.`,
      instruction: `Write TRUE, FALSE, or NOT GIVEN.`,
      answer: "TRUE",
      explanation: `The passage sets out this exact criterion for officially recognising an El Niño.`,
      evidence: `an El Niño is only recognised once sea surface temperatures in a specific region of the tropical Pacific known as Niño-3.4 rise to at least 0.5°C above the long-term average, and stay there for five consecutive, overlapping three-month periods`,
    },
    {
      id: "enso-q7",
      number: 7,
      group: "Questions 5-9: True/False/Not Given",
      kind: "true-false-not-given",
      prompt: `La Niña episodes occur more frequently than El Niño episodes.`,
      instruction: `Write TRUE, FALSE, or NOT GIVEN.`,
      answer: "FALSE",
      explanation: `The passage states the opposite: El Niño episodes tend to occur somewhat more often than La Niña episodes.`,
      evidence: `El Niño episodes tend to occur somewhat more often than La Niña episodes over the long term`,
    },
    {
      id: "enso-q8",
      number: 8,
      group: "Questions 5-9: True/False/Not Given",
      kind: "true-false-not-given",
      prompt: `El Niño events have become more frequent in recent decades as a result of climate change.`,
      instruction: `Write TRUE, FALSE, or NOT GIVEN.`,
      answer: "NOT GIVEN",
      explanation: `The passage discusses frequency and duration of episodes but never links El Niño frequency to climate change.`,
      evidence: `The cycle does not follow a fixed timetable; instead, it shifts between these phases irregularly, roughly every two to seven years`,
    },
    {
      id: "enso-q9",
      number: 9,
      group: "Questions 5-9: True/False/Not Given",
      kind: "true-false-not-given",
      prompt: `Upwelling off the coast of South America increases during an El Niño event.`,
      instruction: `Write TRUE, FALSE, or NOT GIVEN.`,
      answer: "FALSE",
      explanation: `The passage states that upwelling weakens or stops during El Niño, the opposite of increasing.`,
      evidence: `the upwelling of cold water off South America weakens too, or stops altogether, cutting off the supply of nutrients`,
    },
    {
      id: "enso-q10",
      number: 10,
      group: "Questions 10-13: Sentence completion",
      kind: "sentence-completion",
      prompt: `According to the passage, the warming that inspired the name "El Niño" typically peaked close to ______.`,
      instruction: `Write ONE WORD ONLY.`,
      answer: "Christmas",
      acceptedAnswers: ["Christmas"],
      explanation: `The passage states that the warming tended to peak around Christmas, which is why the phenomenon was named El Niño de Navidad.`,
      evidence: `this warming tended to peak around Christmas`,
    },
    {
      id: "enso-q11",
      number: 11,
      group: "Questions 10-13: Sentence completion",
      kind: "sentence-completion",
      prompt: `Under normal conditions, the trade winds push warm surface water toward the ______ Pacific.`,
      instruction: `Write ONE WORD ONLY.`,
      answer: "western",
      acceptedAnswers: ["western", "west"],
      explanation: `Trade winds drag warm water away from South America and pile it up in the western Pacific.`,
      evidence: `piling it up in the western Pacific, near Asia and Indonesia`,
    },
    {
      id: "enso-q12",
      number: 12,
      group: "Questions 10-13: Sentence completion",
      kind: "sentence-completion",
      prompt: `An El Niño is only officially declared once sea surface temperatures in the Niño-3.4 region rise at least ______°C above average.`,
      instruction: `Write ONE WORD ONLY.`,
      answer: "0.5",
      acceptedAnswers: ["0.5", "0.5°C"],
      explanation: `The official criterion requires sea surface temperatures to be at least 0.5°C above the long-term average.`,
      evidence: `rise to at least 0.5°C above the long-term average`,
    },
    {
      id: "enso-q13",
      number: 13,
      group: "Questions 10-13: Sentence completion",
      kind: "sentence-completion",
      prompt: `A typical ENSO episode, once triggered, usually lasts between nine and ______ months.`,
      instruction: `Write ONE WORD ONLY.`,
      answer: "12",
      acceptedAnswers: ["12", "twelve"],
      explanation: `The passage states that a full episode typically lasts nine to 12 months.`,
      evidence: `a full episode, once triggered, typically lasts nine to 12 months`,
    },
  ],
};

const ensoMechanisms: ReadingPassage = {
  id: "enso-mechanisms",
  title: "Inside the engine of ENSO",
  subtitle: "The ocean and atmosphere mechanisms that drive El Niño and La Niña",
  paragraphs: [
    {
      label: "A",
      text: `Beneath the shifting sea-surface temperatures of ENSO lies an equally important atmospheric partner: the Walker circulation. This is a continuous loop of moving air stretching across the tropical Pacific, in which the lower part of the loop flows from east to west near the ocean surface while the upper part flows from west to east at much higher altitude. Under normal, ENSO-neutral conditions, warm, moist air rises over the western Pacific and the Maritime Continent, where sea temperatures are highest, before travelling east at altitude and sinking as dry, stable air over the eastern Pacific Ocean. This constant overturning helps explain why Indonesia and northern Australia are normally humid and rainy while the eastern tropical Pacific, off the coast of South America, stays comparatively dry.`,
    },
    {
      label: "B",
      text: `The strength of the Walker circulation is closely tied to a hidden feature of the ocean itself: the thermocline, the boundary layer that separates warm surface water from the much colder water below, commonly identified by the depth at which temperature drops to around 20°C. Because trade winds pile up warm water in the west, the thermocline sits deep beneath the surface in the western Pacific but rises close to the surface in the eastern Pacific, where upwelling continually draws cold water upward. This lopsided arrangement, warm and deep in the west, cool and shallow in the east, is itself a product of the very winds that the temperature contrast helps to sustain, a feedback loop that keeps the whole system running in its normal state.`,
    },
    {
      label: "C",
      text: `El Niño disturbs this feedback loop at its source. As the trade winds weaken, the warm pool of water that is usually confined to the western Pacific spreads back east, and the rising branch of the Walker circulation follows the warm water with it. The result is a circulation that is not merely displaced but substantially weakened: rainfall that would normally fall over Indonesia and the western Pacific dwindles, while the central and eastern Pacific, ordinarily dry, receive far more rain than usual. Because a weaker circulation means weaker trade winds, and weaker trade winds allow the warm pool to spread even further east, the changes reinforce one another until the pattern eventually peaks and begins to decay.`,
    },
    {
      label: "D",
      text: `La Niña, by contrast, does not disrupt the normal Walker circulation so much as sharpen it. Trade winds blow harder than usual, piling even more warm water into the western Pacific and intensifying the temperature contrast that drives the entire loop. Rainfall over Indonesia and the Maritime Continent increases beyond its already substantial norm, upwelling off South America strengthens further, and the eastern Pacific cools even more than it would under neutral conditions. In this sense, La Niña can be thought of as an exaggerated version of ordinary Pacific conditions rather than a distinct pattern in its own right.`,
    },
    {
      label: "E",
      text: `Long before scientists connected ocean temperatures to these atmospheric shifts, they had already noticed a separate, purely atmospheric seesaw: sea-level pressure at Darwin, in northern Australia, tends to rise just as pressure at Tahiti, in the central Pacific, falls, and vice versa. This relationship, named the Southern Oscillation, gives ENSO the second half of its name and is tracked using the Southern Oscillation Index, or SOI, calculated from the normalised difference in pressure between the two stations. During El Niño, pressure drops at Tahiti and rises at Darwin, producing a negative SOI; during La Niña, the pattern reverses and the index turns positive.`,
    },
    {
      label: "F",
      text: `The influence of ENSO does not stop at the edge of the Pacific. Meteorologists describe the long-distance links between weather in one region and weather in another, often thousands of miles away, as teleconnections, and ENSO is among the most powerful drivers of these connections anywhere on the planet. The mechanism usually involves Rossby waves, enormous undulations in the atmosphere whose peaks and troughs create alternating regions of high and low pressure as they travel. Crucially, Rossby waves do not wander freely; they are guided along the path of the jet streams, the fast-moving currents of air that circle the globe at high altitude, which act as waveguides steering the waves toward particular regions.`,
    },
    {
      label: "G",
      text: `One jet stream in particular, the Pacific subtropical jet, is especially sensitive to ENSO. By warming the tropical atmosphere, El Niño amplifies the temperature contrast between the tropics and higher latitudes that helps to power the jet stream, while also triggering Rossby wave patterns that can shift its path further south than usual, altering the track of winter storms across North America. These pressure and wind anomalies are also associated with the Pacific-North American pattern, an oscillating arrangement of pressure centres over the North Pacific and North America that shapes temperature and rainfall not only across that continent but across parts of Europe as well.`,
    },
  ],
  questions: [
    {
      id: "enso-q14",
      number: 14,
      group: "Questions 14-17: Matching headings",
      kind: "matching-headings",
      prompt: `Choose the best heading for paragraph A.`,
      options: [
        { value: "i", label: "i. A shift that follows the warm water" },
        { value: "ii", label: "ii. A pressure difference that gave ENSO half its name" },
        { value: "iii", label: "iii. A theory later disproved by satellite data" },
        { value: "iv", label: "iv. An atmospheric loop spanning the Pacific" },
        { value: "v", label: "v. An intensified version of the everyday pattern" },
        { value: "vi", label: "vi. A permanent barrier to accurate forecasting" },
      ],
      answer: "iv",
      explanation: `Paragraph A introduces the Walker circulation as a continuous loop of air spanning the tropical Pacific.`,
      evidence: `a continuous loop of moving air stretching across the tropical Pacific`,
    },
    {
      id: "enso-q15",
      number: 15,
      group: "Questions 14-17: Matching headings",
      kind: "matching-headings",
      prompt: `Choose the best heading for paragraph C.`,
      options: [
        { value: "i", label: "i. A shift that follows the warm water" },
        { value: "ii", label: "ii. A pressure difference that gave ENSO half its name" },
        { value: "iii", label: "iii. A theory later disproved by satellite data" },
        { value: "iv", label: "iv. An atmospheric loop spanning the Pacific" },
        { value: "v", label: "v. An intensified version of the everyday pattern" },
        { value: "vi", label: "vi. A permanent barrier to accurate forecasting" },
      ],
      answer: "i",
      explanation: `Paragraph C explains that the rising branch of the Walker circulation moves east along with the shifting warm pool during El Niño.`,
      evidence: `the rising branch of the Walker circulation follows the warm water with it`,
    },
    {
      id: "enso-q16",
      number: 16,
      group: "Questions 14-17: Matching headings",
      kind: "matching-headings",
      prompt: `Choose the best heading for paragraph D.`,
      options: [
        { value: "i", label: "i. A shift that follows the warm water" },
        { value: "ii", label: "ii. A pressure difference that gave ENSO half its name" },
        { value: "iii", label: "iii. A theory later disproved by satellite data" },
        { value: "iv", label: "iv. An atmospheric loop spanning the Pacific" },
        { value: "v", label: "v. An intensified version of the everyday pattern" },
        { value: "vi", label: "vi. A permanent barrier to accurate forecasting" },
      ],
      answer: "v",
      explanation: `Paragraph D describes La Niña as sharpening, rather than disrupting, the normal Walker circulation pattern.`,
      evidence: `La Niña can be thought of as an exaggerated version of ordinary Pacific conditions rather than a distinct pattern in its own right`,
    },
    {
      id: "enso-q17",
      number: 17,
      group: "Questions 14-17: Matching headings",
      kind: "matching-headings",
      prompt: `Choose the best heading for paragraph E.`,
      options: [
        { value: "i", label: "i. A shift that follows the warm water" },
        { value: "ii", label: "ii. A pressure difference that gave ENSO half its name" },
        { value: "iii", label: "iii. A theory later disproved by satellite data" },
        { value: "iv", label: "iv. An atmospheric loop spanning the Pacific" },
        { value: "v", label: "v. An intensified version of the everyday pattern" },
        { value: "vi", label: "vi. A permanent barrier to accurate forecasting" },
      ],
      answer: "ii",
      explanation: `Paragraph E explains that the Southern Oscillation, a pressure seesaw between Darwin and Tahiti, gives ENSO the second half of its name.`,
      evidence: `This relationship, named the Southern Oscillation, gives ENSO the second half of its name`,
    },
    {
      id: "enso-q18",
      number: 18,
      group: "Questions 18-22: Yes/No/Not Given",
      kind: "yes-no-not-given",
      prompt: `The thermocline lies closer to the surface in the eastern Pacific than in the western Pacific.`,
      instruction: `Write YES, NO, or NOT GIVEN.`,
      answer: "YES",
      explanation: `The passage states that the thermocline is deep in the west but rises close to the surface in the east.`,
      evidence: `the thermocline sits deep beneath the surface in the western Pacific but rises close to the surface in the eastern Pacific`,
    },
    {
      id: "enso-q19",
      number: 19,
      group: "Questions 18-22: Yes/No/Not Given",
      kind: "yes-no-not-given",
      prompt: `Rossby waves travel independently of the jet streams.`,
      instruction: `Write YES, NO, or NOT GIVEN.`,
      answer: "NO",
      explanation: `The passage states that Rossby waves are guided by the jet streams rather than travelling independently.`,
      evidence: `Rossby waves do not wander freely; they are guided along the path of the jet streams`,
    },
    {
      id: "enso-q20",
      number: 20,
      group: "Questions 18-22: Yes/No/Not Given",
      kind: "yes-no-not-given",
      prompt: `A negative Southern Oscillation Index value indicates that El Niño conditions are present.`,
      instruction: `Write YES, NO, or NOT GIVEN.`,
      answer: "YES",
      explanation: `The passage states that El Niño produces a negative SOI, since pressure drops at Tahiti and rises at Darwin.`,
      evidence: `During El Niño, pressure drops at Tahiti and rises at Darwin, producing a negative SOI`,
    },
    {
      id: "enso-q21",
      number: 21,
      group: "Questions 18-22: Yes/No/Not Given",
      kind: "yes-no-not-given",
      prompt: `The Pacific-North American pattern affects weather only in North America.`,
      instruction: `Write YES, NO, or NOT GIVEN.`,
      answer: "NO",
      explanation: `The passage states that the pattern shapes weather in parts of Europe as well as North America.`,
      evidence: `shapes temperature and rainfall not only across that continent but across parts of Europe as well`,
    },
    {
      id: "enso-q22",
      number: 22,
      group: "Questions 18-22: Yes/No/Not Given",
      kind: "yes-no-not-given",
      prompt: `Scientists have identified the precise trigger that initiates every El Niño event.`,
      instruction: `Write YES, NO, or NOT GIVEN.`,
      answer: "NOT GIVEN",
      explanation: `This passage describes the mechanisms of ENSO but never discusses whether the exact trigger of each event is known.`,
      evidence: `El Niño disturbs this feedback loop at its source. As the trade winds weaken, the warm pool of water that is usually confined to the western Pacific spreads back east`,
    },
    {
      id: "enso-q23",
      number: 23,
      group: "Questions 23-26: Summary completion",
      kind: "summary-completion",
      prompt: `Complete the summary. Under normal conditions, the Walker circulation brings rising air over the western Pacific and sinking air over the ______ Pacific.`,
      instruction: `Write NO MORE THAN TWO WORDS.`,
      answer: "eastern",
      acceptedAnswers: ["eastern", "the eastern"],
      explanation: `Under neutral conditions, dry air sinks over the eastern Pacific Ocean while moist air rises in the west.`,
      evidence: `sinking as dry, stable air over the eastern Pacific Ocean`,
    },
    {
      id: "enso-q24",
      number: 24,
      group: "Questions 23-26: Summary completion",
      kind: "summary-completion",
      prompt: `Complete the summary. According to the passage, the west-to-east difference in thermocline depth results from the action of the ______.`,
      instruction: `Write NO MORE THAN TWO WORDS.`,
      answer: "trade winds",
      acceptedAnswers: ["trade winds", "the trade winds"],
      explanation: `The passage attributes the deep thermocline in the west and shallow thermocline in the east to the piling-up effect of the trade winds.`,
      evidence: `Because trade winds pile up warm water in the west, the thermocline sits deep beneath the surface in the western Pacific`,
    },
    {
      id: "enso-q25",
      number: 25,
      group: "Questions 23-26: Summary completion",
      kind: "summary-completion",
      prompt: `Complete the summary. During an El Niño event, the usual Walker circulation pattern is disrupted as the ______ shifts back toward the east.`,
      instruction: `Write NO MORE THAN TWO WORDS.`,
      answer: "warm pool",
      acceptedAnswers: ["warm pool", "the warm pool"],
      explanation: `The passage describes the warm pool of water, normally confined to the western Pacific, spreading eastward during El Niño.`,
      evidence: `the warm pool of water that is usually confined to the western Pacific spreads back east`,
    },
    {
      id: "enso-q26",
      number: 26,
      group: "Questions 23-26: Summary completion",
      kind: "summary-completion",
      prompt: `Complete the summary. The Southern Oscillation Index is calculated from sea-level pressure differences between Darwin and ______.`,
      instruction: `Write NO MORE THAN TWO WORDS.`,
      answer: "Tahiti",
      acceptedAnswers: ["Tahiti"],
      explanation: `The Southern Oscillation is described as a pressure seesaw between Darwin and Tahiti.`,
      evidence: `sea-level pressure at Darwin, in northern Australia, tends to rise just as pressure at Tahiti, in the central Pacific, falls`,
    },
  ],
};

const ensoImpactsForecasting: ReadingPassage = {
  id: "enso-impacts-forecasting",
  title: "Living with ENSO: impacts and the limits of forecasting",
  subtitle: "How El Niño and La Niña shape weather, fisheries and economies, and why predicting them remains hard",
  paragraphs: [
    {
      label: "A",
      text: `Because El Niño and La Niña can often be identified months before their effects peak, ENSO offers something rare in seasonal climate science: genuine advance warning. As Dongmin Kim, a researcher who has studied its influence on United States weather extremes, has observed, forecasters "can often predict its arrival many seasons in advance", giving communities, farmers and emergency planners time to prepare for the droughts, floods and disrupted fisheries that follow. This section now examines both the benefits ENSO forecasting delivers and the limitations that still constrain it.`,
    },
    {
      label: "B",
      text: `Much of this benefit is concentrated in a few vulnerable regions. During La Niña, the North Pacific jet stream tends to shift poleward, reducing precipitation over the southern United States and heightening the likelihood of drought, particularly across the Southwest. El Niño produces roughly the opposite effect, pushing the jet stream further south and bringing wetter-than-normal conditions to the southern states, which raises the risk of flooding, especially across the Southeast and Northeast. As Kim has noted, this influence is likely to grow: "future U.S. extreme hydroclimate variability is not solely driven by the changing mean climate state; ENSO also plays a significant role."`,
    },
    {
      label: "C",
      text: `The financial stakes of these swings are considerable. Between 1980 and 2024, drought caused approximately 368 billion dollars in economic losses across the United States, while inland flooding caused a further 293 billion dollars in damage; in 2024 alone, extreme weather and climate events cost the country an estimated 182.7 billion dollars. Because this influence is expected to grow, forecasting ENSO accurately is an increasingly pressing economic concern.`,
    },
    {
      label: "D",
      text: `Beyond the United States mainland, ENSO reshapes marine ecosystems across the Pacific. During El Niño, weakened upwelling off South America starves surface waters of nutrients, leaving fewer phytoplankton to support the base of the food web, while species that normally prefer warmer waters, including yellowtail and albacore tuna, move into areas that are usually too cold for them. La Niña has the opposite effect: strengthened upwelling delivers more nutrients than usual, supporting greater biodiversity and drawing cold-water species such as squid and salmon toward areas like the California coast.`,
    },
    {
      label: "E",
      text: `The clearest illustration of ENSO's reach into a single industry may be its effect on Pacific salmon. El Niño typically brings warmer, drier winters to the Pacific Northwest, which means a smaller mountain snowpack and less cold water flowing into salmon-bearing rivers, degrading the freshwater habitat those fish depend on. Alaska, by contrast, often benefits: El Niño tends to bring a milder, wetter winter with more snowmelt and rain-fed runoff to its coastal watersheds, which usually benefits its salmon. La Niña reverses both patterns, generally helping Pacific Northwest salmon while proving harder on Alaska's already cold rivers. Pink salmon, whose distinctive two-year life cycle appears to leave them especially exposed to ENSO's fluctuations, seem more sensitive to these swings than other species, and the poor West Coast salmon catch that followed the powerful 1982-83 El Niño prompted one of the first Federal Fishery Disaster Declarations in the United States.`,
    },
    {
      label: "F",
      text: `Forecasting ENSO would be far harder without coupled ocean-atmosphere general circulation models, computer simulations that represent the ocean and atmosphere together and allow their interactions to evolve through time. Their development has allowed scientists to issue operational forecasts a season or more ahead of an event. Even so, current forecasts are generally described as having only modest skill at lead times of two to three seasons, although performance is considerably better for some regions and times of year than for others.`,
    },
    {
      label: "G",
      text: `Forecast accuracy also depends heavily on timing. Springtime is, somewhat notoriously, the worst season in which to issue an ENSO forecast, a phenomenon researchers call the spring predictability barrier. Spring is a transitional period: an existing El Niño or La Niña is often decaying from its winter peak, sometimes passing through neutral conditions before a new phase develops later in the year, which means the underlying ENSO signal is weak relative to background noise. The barrier also has a physical cause, since the temperature gradient across the tropical Pacific, and with it the coupling between ocean and atmosphere that keeps ENSO self-reinforcing, is naturally weaker in spring than at other times of year. Statistical forecasting methods are especially vulnerable, with skill for early-summer targets falling away sharply once a forecast is issued during this barrier, more so than for models that simulate the ocean and atmosphere directly.`,
    },
    {
      label: "H",
      text: `Much still remains unresolved. Researchers have not settled whether ENSO behaves as a self-sustaining oscillation, or whether it depends instead on an external trigger to kick off each new episode; questions about what initiates a given event, and why some, such as the exceptionally powerful 1997-98 El Niño, turn out to be so much stronger than others, remain genuinely open. Progress is also constrained by observation: past and present measurements of the atmosphere and ocean are not available in enough detail across large stretches of the tropics, which limits scientists' understanding of ENSO's diversity, since, as researchers often note, no two El Niños are alike. Even state-of-the-art forecasting models carry systematic errors. Many display a so-called cold tongue bias, showing sea surface temperatures that are abnormally cool across the western and central equatorial Pacific, stretching the cold tongue further than it really extends. Others mishandle cloud behaviour, in some cases predicting less cloud cover during El Niño conditions when, in reality, the opposite occurs, distorting how strong a simulated event appears.`,
    },
  ],
  questions: [
    {
      id: "enso-q27",
      number: 27,
      group: "Questions 27-31: Matching information",
      kind: "matching-information",
      prompt: `Which paragraph contains a specific monetary figure for losses in a single year?`,
      instruction: `Write the correct letter, A-H.`,
      answer: "C",
      explanation: `Paragraph C gives the 2024 figure of 182.7 billion dollars in losses from extreme weather and climate events.`,
      evidence: `in 2024 alone, extreme weather and climate events cost the country an estimated 182.7 billion dollars`,
    },
    {
      id: "enso-q28",
      number: 28,
      group: "Questions 27-31: Matching information",
      kind: "matching-information",
      prompt: `Which paragraph names a specific historical El Niño event used as an example of unusually extreme behaviour?`,
      instruction: `Write the correct letter, A-H.`,
      answer: "H",
      explanation: `Paragraph H cites the 1997-98 El Niño as an example of an event that was far stronger than others.`,
      evidence: `the exceptionally powerful 1997-98 El Niño`,
    },
    {
      id: "enso-q29",
      number: 29,
      group: "Questions 27-31: Matching information",
      kind: "matching-information",
      prompt: `Which paragraph describes a species considered especially vulnerable to ENSO because of the length of its life cycle?`,
      instruction: `Write the correct letter, A-H.`,
      answer: "E",
      explanation: `Paragraph E describes pink salmon as especially exposed to ENSO because of their two-year life cycle.`,
      evidence: `Pink salmon, whose distinctive two-year life cycle appears to leave them especially exposed to ENSO's fluctuations`,
    },
    {
      id: "enso-q30",
      number: 30,
      group: "Questions 27-31: Matching information",
      kind: "matching-information",
      prompt: `Which paragraph explains why forecasts issued in one particular season of the year are considered the least reliable?`,
      instruction: `Write the correct letter, A-H.`,
      answer: "G",
      explanation: `Paragraph G explains the spring predictability barrier, describing why spring forecasts are least reliable.`,
      evidence: `Springtime is, somewhat notoriously, the worst season in which to issue an ENSO forecast`,
    },
    {
      id: "enso-q31",
      number: 31,
      group: "Questions 27-31: Matching information",
      kind: "matching-information",
      prompt: `Which paragraph names two tropical fish species that move beyond their usual range during one phase of ENSO?`,
      instruction: `Write the correct letter, A-H.`,
      answer: "D",
      explanation: `Paragraph D names yellowtail and albacore tuna as species that move into normally cold areas during El Niño.`,
      evidence: `species that normally prefer warmer waters, including yellowtail and albacore tuna, move into areas that are usually too cold for them`,
    },
    {
      id: "enso-q32",
      number: 32,
      group: "Questions 32-35: Multiple choice",
      kind: "multiple-choice",
      prompt: `According to the passage, why does La Niña tend to increase drought risk in the southern United States?`,
      options: [
        { value: "a", label: "Because trade winds weaken across the equatorial Pacific" },
        { value: "b", label: "Because upwelling weakens off the South American coast" },
        { value: "c", label: "Because the North Pacific jet stream shifts poleward, reducing precipitation there" },
        { value: "d", label: "Because the Southern Oscillation Index becomes strongly negative" },
      ],
      answer: "c",
      explanation: `The passage states that during La Niña, the North Pacific jet stream shifts poleward, reducing precipitation over the southern United States.`,
      evidence: `During La Niña, the North Pacific jet stream tends to shift poleward, reducing precipitation over the southern United States`,
    },
    {
      id: "enso-q33",
      number: 33,
      group: "Questions 32-35: Multiple choice",
      kind: "multiple-choice",
      prompt: `What does the passage suggest is the main reason El Niño's effects on Pacific salmon differ between the Pacific Northwest and Alaska?`,
      options: [
        { value: "a", label: "El Niño brings opposite winter conditions to the two regions, degrading habitat in one while boosting runoff in the other" },
        { value: "b", label: "Alaska salmon do not depend on freshwater habitat quality" },
        { value: "c", label: "Alaska's fisheries are not covered by federal disaster declarations" },
        { value: "d", label: "Pink salmon are the only species found in Alaska" },
      ],
      answer: "a",
      explanation: `El Niño brings warm, dry winters that degrade Pacific Northwest habitat but milder, wetter winters that increase helpful runoff in Alaska.`,
      evidence: `Alaska, by contrast, often benefits: El Niño tends to bring a milder, wetter winter with more snowmelt and rain-fed runoff to its coastal watersheds, which usually benefits its salmon`,
    },
    {
      id: "enso-q34",
      number: 34,
      group: "Questions 32-35: Multiple choice",
      kind: "multiple-choice",
      prompt: `Based on the passage, coupled ocean-atmosphere general circulation models (CGCMs) are significant mainly because they`,
      options: [
        { value: "a", label: "eliminated the spring predictability barrier entirely" },
        { value: "b", label: "proved that ENSO is a self-sustaining oscillation" },
        { value: "c", label: "removed the cold tongue bias from earlier forecasting methods" },
        { value: "d", label: "made it possible to issue operational ENSO forecasts a season or more ahead" },
      ],
      answer: "d",
      explanation: `The passage credits CGCMs with allowing scientists to issue operational forecasts a season or more ahead of an event.`,
      evidence: `Their development has allowed scientists to issue operational forecasts a season or more ahead of an event`,
    },
    {
      id: "enso-q35",
      number: 35,
      group: "Questions 32-35: Multiple choice",
      kind: "multiple-choice",
      prompt: `The passage indicates that some forecasting models misrepresent cloud behaviour during El Niño by`,
      options: [
        { value: "a", label: "predicting increased cloud cover when reduced cover actually occurs" },
        { value: "b", label: "predicting reduced cloud cover in some cases when the opposite occurs" },
        { value: "c", label: "ignoring cloud cover entirely in their calculations" },
        { value: "d", label: "applying observations from La Niña events to El Niño forecasts" },
      ],
      answer: "b",
      explanation: `The passage states that some models predict less cloud cover during El Niño when, in reality, the opposite occurs.`,
      evidence: `in some cases predicting less cloud cover during El Niño conditions when, in reality, the opposite occurs`,
    },
    {
      id: "enso-q36",
      number: 36,
      group: "Questions 36-40: Summary completion",
      kind: "summary-completion",
      prompt: `Complete the sentence. Current ENSO forecasts are generally described as having only modest skill at lead times of two to three ______.`,
      instruction: `Write NO MORE THAN TWO WORDS.`,
      answer: "seasons",
      acceptedAnswers: ["seasons"],
      explanation: `The passage states that forecasts have modest skill at lead times of two to three seasons.`,
      evidence: `current forecasts are generally described as having only modest skill at lead times of two to three seasons`,
    },
    {
      id: "enso-q37",
      number: 37,
      group: "Questions 36-40: Summary completion",
      kind: "summary-completion",
      prompt: `Complete the sentence. According to the passage, ocean-atmosphere coupling is naturally weaker during ______ than at other times of year, making forecasts issued then less reliable.`,
      instruction: `Write NO MORE THAN TWO WORDS.`,
      answer: "spring",
      acceptedAnswers: ["spring", "springtime"],
      explanation: `The passage explains that the coupling between ocean and atmosphere is naturally weaker in spring, which underlies the spring predictability barrier.`,
      evidence: `is naturally weaker in spring than at other times of year`,
    },
    {
      id: "enso-q38",
      number: 38,
      group: "Questions 36-40: Summary completion",
      kind: "summary-completion",
      prompt: `Complete the sentence. Researchers disagree about whether ENSO is a self-sustaining oscillation or depends instead on an external ______.`,
      instruction: `Write NO MORE THAN TWO WORDS.`,
      answer: "trigger",
      acceptedAnswers: ["trigger", "external trigger"],
      explanation: `The passage states that researchers have not settled whether ENSO depends on an external trigger to begin each episode.`,
      evidence: `whether it depends instead on an external trigger to kick off each new episode`,
    },
    {
      id: "enso-q39",
      number: 39,
      group: "Questions 36-40: Summary completion",
      kind: "summary-completion",
      prompt: `Complete the sentence. Limited observational data restrict scientists' understanding of ENSO's ______, since no two El Niños are alike.`,
      instruction: `Write NO MORE THAN TWO WORDS.`,
      answer: "diversity",
      acceptedAnswers: ["diversity"],
      explanation: `The passage links insufficient observational detail to limited understanding of ENSO's diversity.`,
      evidence: `limits scientists' understanding of ENSO's diversity`,
    },
    {
      id: "enso-q40",
      number: 40,
      group: "Questions 36-40: Summary completion",
      kind: "summary-completion",
      prompt: `Complete the sentence. Many forecasting models show a so-called ______ bias, in which sea surface temperatures across the western and central equatorial Pacific appear abnormally cool.`,
      instruction: `Write NO MORE THAN TWO WORDS.`,
      answer: "cold tongue",
      acceptedAnswers: ["cold tongue", "cold tongue bias"],
      explanation: `The passage names this systematic model error the cold tongue bias.`,
      evidence: `Many display a so-called cold tongue bias, showing sea surface temperatures that are abnormally cool across the western and central equatorial Pacific`,
    },
  ],
};

const academicFullElNino: ReadingPracticeTest = {
  id: "academic-full-el-nino",
  title: "Full Test 15: El Niño, La Niña and the Pacific's shifting climate",
  description:
    "A complete Cambridge-style practice test about the El Niño-Southern Oscillation (ENSO), covering how the cycle forms in the tropical Pacific, the ocean and atmosphere mechanisms that drive El Niño and La Niña, and their real-world impacts on weather, fisheries, economies and forecasting.",
  track: "Cambridge-style",
  level: "Advanced",
  minutes: 60,
  passages: [ensoBasics, ensoMechanisms, ensoImpactsForecasting],
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
  academicFullVolcanoHazards,
  academicFullCoralReefs,
  academicFullSpaceWeather,
  academicFullGroundwater,
  academicFullElNino,
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
