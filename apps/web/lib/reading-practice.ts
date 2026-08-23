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
        { value: "ii", label: "ii. A dense concentration of species living in a small space" },
        { value: "iii", label: "iii. Two separate sources of income for coastal communities" },
        { value: "iv", label: "iv. A defence against coastal erosion and storm damage" },
        { value: "v", label: "v. Untapped chemical compounds with medical potential" },
        { value: "vi", label: "vi. A habitat that has proved impossible to study" },
        { value: "vii", label: "vii. The gradual disappearance of reefs around the world" },
      ],
      answer: "ii",
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
        { value: "ii", label: "ii. A dense concentration of species living in a small space" },
        { value: "iii", label: "iii. Two separate sources of income for coastal communities" },
        { value: "iv", label: "iv. A defence against coastal erosion and storm damage" },
        { value: "v", label: "v. Untapped chemical compounds with medical potential" },
        { value: "vi", label: "vi. A habitat that has proved impossible to study" },
        { value: "vii", label: "vii. The gradual disappearance of reefs around the world" },
      ],
      answer: "iii",
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
        { value: "ii", label: "ii. A dense concentration of species living in a small space" },
        { value: "iii", label: "iii. Two separate sources of income for coastal communities" },
        { value: "iv", label: "iv. A defence against coastal erosion and storm damage" },
        { value: "v", label: "v. Untapped chemical compounds with medical potential" },
        { value: "vi", label: "vi. A habitat that has proved impossible to study" },
        { value: "vii", label: "vii. The gradual disappearance of reefs around the world" },
      ],
      answer: "iv",
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
        { value: "ii", label: "ii. A dense concentration of species living in a small space" },
        { value: "iii", label: "iii. Two separate sources of income for coastal communities" },
        { value: "iv", label: "iv. A defence against coastal erosion and storm damage" },
        { value: "v", label: "v. Untapped chemical compounds with medical potential" },
        { value: "vi", label: "vi. A habitat that has proved impossible to study" },
        { value: "vii", label: "vii. The gradual disappearance of reefs around the world" },
      ],
      answer: "v",
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
