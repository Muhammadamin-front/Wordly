/** Full Mock Listening — real 4-section IELTS-format tests: static content,
 *  graded 100% client-side (mirrors reading-practice.ts's precedent — the
 *  answer key already ships to the browser for Reading, same trade-off
 *  here). Audio is synthesized server-side per section from `turns` via
 *  ElevenLabs (see apps/api/app/services/listening_audio.py); `turns` is
 *  mirrored into apps/api/app/content/listening/<slug>.json by
 *  scripts/emit-listening-audio-content.mjs — run that after any content
 *  edit here, or the audio will lag the questions.
 */

export type ListeningSpeakerRole = "a" | "b" | "narrator";

export type ListeningTurn = {
  speaker: string;
  role: ListeningSpeakerRole;
  text: string;
};

/** A deliberate subset of ReadingQuestionKind (reading-practice.ts) — only
 *  the kinds that map to how IELTS Listening actually sets questions.
 *  matching-headings/true-false-not-given/yes-no-not-given/matching-information/
 *  diagram-labelling are Reading-only formats. */
export type ListeningQuestionKind =
  | "multiple-choice"
  | "multiple-answer"
  | "matching-features"
  | "sentence-completion"
  | "summary-completion"
  | "table-completion"
  | "form-completion"
  | "short-answer";

export type ListeningOption = { value: string; label: string };

export type ListeningQuestion = {
  id: string;
  number: number;
  section: 1 | 2 | 3 | 4;
  kind: ListeningQuestionKind;
  prompt: string;
  instruction?: string;
  options?: ListeningOption[];
  answer: string | string[];
  acceptedAnswers?: string[];
  explanation: string;
};

export type ListeningSection = {
  number: 1 | 2 | 3 | 4;
  title: string;
  turns: ListeningTurn[];
  questions: ListeningQuestion[];
};

export type ListeningFullTest = {
  slug: string;
  title: string;
  minutes: number;
  sections: ListeningSection[];
};

export const LISTENING_FULL_TESTS: ListeningFullTest[] = [
  {
    slug: "listening-full-test-1",
    title: "IELTS Listening Practice Test 1",
    minutes: 30,
    sections: [
      // Section 1 — everyday social conversation (form-completion), the
      // easiest section, matching real IELTS difficulty progression.
      {
        number: 1,
        title: "Riverside Leisure Centre — membership enquiry",
        turns: [
          { speaker: "Emma", role: "a", text: "Good afternoon, Riverside Leisure Centre, this is Emma speaking. How can I help you?" },
          { speaker: "Daniel", role: "b", text: "Hi, I'm calling to ask about your membership options. I'm new to the area." },
          { speaker: "Emma", role: "a", text: "Of course. We have three types of membership: Standard, which is thirty-two pounds a month; Premium, which includes the pool and spa for forty-five pounds; and there's also an Off-Peak membership for twenty-two pounds, but that's only valid before ten a.m. and after seven p.m." },
          { speaker: "Daniel", role: "b", text: "The Premium one sounds good. Does that include classes as well?" },
          { speaker: "Emma", role: "a", text: "Yes, all group classes are included, apart from personal training sessions, which are booked separately." },
          { speaker: "Daniel", role: "b", text: "Great. Can I sign up over the phone?" },
          { speaker: "Emma", role: "a", text: "I can take some details now and then you can come in to complete the registration. Could I have your full name, please?" },
          { speaker: "Daniel", role: "b", text: "Yes, it's Daniel Osei. That's O-S-E-I." },
          { speaker: "Emma", role: "a", text: "Thank you. And a contact phone number?" },
          { speaker: "Daniel", role: "b", text: "It's zero seven nine one two, double three four, five six seven." },
          { speaker: "Emma", role: "a", text: "And your address, please, just so we can post your membership card." },
          { speaker: "Daniel", role: "b", text: "Fourteen Chestnut Avenue, Milton Park." },
          { speaker: "Emma", role: "a", text: "Is that flat fourteen, or house number fourteen?" },
          { speaker: "Daniel", role: "b", text: "House number, no flat." },
          { speaker: "Emma", role: "a", text: "Perfect. Now, when would you like your membership to start?" },
          { speaker: "Daniel", role: "b", text: "As soon as possible — could I start this Saturday?" },
          { speaker: "Emma", role: "a", text: "That should be fine. I'll also need to give you an induction session before you can use the gym equipment. Would Saturday morning at nine work?" },
          { speaker: "Daniel", role: "b", text: "Saturday at nine is perfect." },
          { speaker: "Emma", role: "a", text: "One last thing — do you have any medical conditions we should know about, like a heart condition or asthma?" },
          { speaker: "Daniel", role: "b", text: "No, nothing like that." },
          { speaker: "Emma", role: "a", text: "Great, that's everything. We look forward to seeing you on Saturday." },
        ],
        questions: [
          { id: "t1-1", number: 1, section: 1, kind: "form-completion", prompt: "Name: Daniel ______", instruction: "Write ONE WORD ONLY for each answer.", answer: "Osei", acceptedAnswers: ["osei"], explanation: "The caller spells his surname: 'Daniel Osei. That's O-S-E-I.'" },
          { id: "t1-2", number: 2, section: 1, kind: "form-completion", prompt: "Address: 14 ______ Avenue", answer: "Chestnut", acceptedAnswers: ["chestnut"], explanation: "He gives his address as 'Fourteen Chestnut Avenue'." },
          { id: "t1-3", number: 3, section: 1, kind: "form-completion", prompt: "Area: Milton ______", answer: "Park", acceptedAnswers: ["park"], explanation: "The address continues '...Milton Park'." },
          { id: "t1-4", number: 4, section: 1, kind: "form-completion", prompt: "Contact number: ______", instruction: "Write the number only.", answer: "07912334567", acceptedAnswers: ["07912334567", "07912 334567"], explanation: "He reads the number: 'zero seven nine one two, double three four, five six seven.'" },
          { id: "t1-5", number: 5, section: 1, kind: "form-completion", prompt: "Membership type chosen: ______", answer: "Premium", acceptedAnswers: ["premium"], explanation: "Daniel says 'The Premium one sounds good.'" },
          { id: "t1-6", number: 6, section: 1, kind: "form-completion", prompt: "Monthly cost: £ ______", answer: "45", acceptedAnswers: ["45", "£45", "forty-five", "forty five"], explanation: "Emma says Premium is 'forty-five pounds'." },
          { id: "t1-7", number: 7, section: 1, kind: "form-completion", prompt: "Not included in Premium membership: ______ sessions", answer: "personal training", acceptedAnswers: ["personal training", "personal trainer"], explanation: "'All group classes are included, apart from personal training sessions.'" },
          { id: "t1-8", number: 8, section: 1, kind: "form-completion", prompt: "Membership start date: ______", answer: "Saturday", acceptedAnswers: ["saturday"], explanation: "Daniel asks 'could I start this Saturday?' and Emma agrees." },
          { id: "t1-9", number: 9, section: 1, kind: "form-completion", prompt: "Induction session time: ______", instruction: "Write the time only.", answer: "9am", acceptedAnswers: ["9am", "9 am", "9 a.m.", "9a.m.", "9:00", "9", "nine"], explanation: "Emma suggests 'Saturday morning at nine', which Daniel accepts." },
          { id: "t1-10", number: 10, section: 1, kind: "form-completion", prompt: "Medical conditions: ______", answer: "none", acceptedAnswers: ["none", "no", "no conditions", "nothing"], explanation: "Daniel says 'No, nothing like that' when asked about medical conditions." },
        ],
      },

      // Section 2 — everyday monologue (matching + multiple-choice).
      {
        number: 2,
        title: "A tour of Northgate Community Sports Park",
        turns: [
          { speaker: "Guide", role: "a", text: "Good morning everyone, and welcome to Northgate Community Sports Park. I'm going to give you a quick overview of what's on offer before you explore on your own." },
          { speaker: "Guide", role: "a", text: "The park covers around fifteen hectares and opened to the public just last spring. We've divided it into four main zones." },
          { speaker: "Guide", role: "a", text: "As you come through the main entrance, the first zone you'll reach is the Family Zone, which has a large adventure playground and a splash pad for younger children — that's open from May to September only." },
          { speaker: "Guide", role: "a", text: "Beyond that is the Sports Zone, home to six tennis courts, two full-size football pitches, and a running track that circles the whole area — that track is one point two kilometres long." },
          { speaker: "Guide", role: "a", text: "If you continue past the Sports Zone, you'll reach the Wellness Zone. This includes an outdoor gym with free weights and resistance equipment, plus a series of yoga platforms set among the trees — those are particularly popular at sunrise." },
          { speaker: "Guide", role: "a", text: "Finally, right at the back of the park, furthest from the entrance, is the Wildlife Zone — a protected wetland area with a boardwalk and two bird-watching hides. Dogs aren't permitted in this zone, to protect the nesting birds." },
          { speaker: "Guide", role: "a", text: "A few practical points: the park is free to enter, but the outdoor gym in the Wellness Zone requires a small day-pass, which you can buy from the kiosk near the main entrance for two pounds fifty." },
          { speaker: "Guide", role: "a", text: "The park closes at dusk, and there's no lighting after that, so please make sure you're back at the car park before the light goes. Right, let's head out and take a look." },
        ],
        questions: [
          {
            id: "t1-11", number: 11, section: 2, kind: "matching-features",
            prompt: "The splash pad", instruction: "Match each facility to the zone it is in.",
            options: [
              { value: "A", label: "Family Zone" }, { value: "B", label: "Sports Zone" },
              { value: "C", label: "Wellness Zone" }, { value: "D", label: "Wildlife Zone" },
            ],
            answer: "A", explanation: "'The first zone you'll reach is the Family Zone, which has a large adventure playground and a splash pad.'",
          },
          {
            id: "t1-12", number: 12, section: 2, kind: "matching-features",
            prompt: "The running track",
            options: [
              { value: "A", label: "Family Zone" }, { value: "B", label: "Sports Zone" },
              { value: "C", label: "Wellness Zone" }, { value: "D", label: "Wildlife Zone" },
            ],
            answer: "B", explanation: "'The Sports Zone, home to six tennis courts, two full-size football pitches, and a running track.'",
          },
          {
            id: "t1-13", number: 13, section: 2, kind: "matching-features",
            prompt: "The yoga platforms",
            options: [
              { value: "A", label: "Family Zone" }, { value: "B", label: "Sports Zone" },
              { value: "C", label: "Wellness Zone" }, { value: "D", label: "Wildlife Zone" },
            ],
            answer: "C", explanation: "'The Wellness Zone. This includes... a series of yoga platforms set among the trees.'",
          },
          {
            id: "t1-14", number: 14, section: 2, kind: "matching-features",
            prompt: "The bird-watching hides",
            options: [
              { value: "A", label: "Family Zone" }, { value: "B", label: "Sports Zone" },
              { value: "C", label: "Wellness Zone" }, { value: "D", label: "Wildlife Zone" },
            ],
            answer: "D", explanation: "'The Wildlife Zone — a protected wetland area with a boardwalk and two bird-watching hides.'",
          },
          {
            id: "t1-15", number: 15, section: 2, kind: "matching-features",
            prompt: "The outdoor gym",
            options: [
              { value: "A", label: "Family Zone" }, { value: "B", label: "Sports Zone" },
              { value: "C", label: "Wellness Zone" }, { value: "D", label: "Wildlife Zone" },
            ],
            answer: "C", explanation: "'The Wellness Zone. This includes an outdoor gym with free weights and resistance equipment.'",
          },
          {
            id: "t1-16", number: 16, section: 2, kind: "multiple-choice", prompt: "How large is the park?",
            options: [{ value: "A", label: "5 hectares" }, { value: "B", label: "10 hectares" }, { value: "C", label: "15 hectares" }, { value: "D", label: "20 hectares" }],
            answer: "C", explanation: "'The park covers around fifteen hectares.'",
          },
          {
            id: "t1-17", number: 17, section: 2, kind: "multiple-choice", prompt: "When did the park open?",
            options: [{ value: "A", label: "Last winter" }, { value: "B", label: "Last spring" }, { value: "C", label: "Last summer" }, { value: "D", label: "Last autumn" }],
            answer: "B", explanation: "'Opened to the public just last spring.'",
          },
          {
            id: "t1-18", number: 18, section: 2, kind: "multiple-choice", prompt: "How long is the running track?",
            options: [{ value: "A", label: "0.8 km" }, { value: "B", label: "1.2 km" }, { value: "C", label: "1.5 km" }, { value: "D", label: "2 km" }],
            answer: "B", explanation: "'A running track that circles the whole area — that track is one point two kilometres long.'",
          },
          {
            id: "t1-19", number: 19, section: 2, kind: "multiple-choice", prompt: "Why are dogs not allowed in the Wildlife Zone?",
            options: [{ value: "A", label: "To keep the boardwalk clean" }, { value: "B", label: "Because of visitor numbers" }, { value: "C", label: "To protect nesting birds" }, { value: "D", label: "No reason is given" }],
            answer: "C", explanation: "'Dogs aren't permitted in this zone, to protect the nesting birds.'",
          },
          {
            id: "t1-20", number: 20, section: 2, kind: "multiple-choice", prompt: "How much does the outdoor gym day-pass cost?",
            options: [{ value: "A", label: "£1.50" }, { value: "B", label: "£2.00" }, { value: "C", label: "£2.50" }, { value: "D", label: "It's free" }],
            answer: "C", explanation: "'A small day-pass... for two pounds fifty.'",
          },
        ],
      },

      // Section 3 — academic conversation (tutor + student), harder: opinions,
      // plans, and reasoning rather than simple facts.
      {
        number: 3,
        title: "Tutorial: a research project on urban bee populations",
        turns: [
          { speaker: "Tutor", role: "a", text: "Come in, Sarah. So, how's the research project on urban bee populations coming along?" },
          { speaker: "Sarah", role: "b", text: "It's going well, thanks. I've finished the literature review, but I'm still deciding on my methodology for the fieldwork." },
          { speaker: "Tutor", role: "a", text: "What are you considering?" },
          { speaker: "Sarah", role: "b", text: "I was going to do a survey of five parks across the city, but my supervisor suggested I focus on just two parks instead, and study them in much greater depth." },
          { speaker: "Tutor", role: "a", text: "That's sensible advice, actually — with limited time, depth is usually more valuable than breadth for this kind of study. Which two parks are you thinking of?" },
          { speaker: "Sarah", role: "b", text: "Riverside Park, because it has a lot of wildflowers, and then somewhere more urban, maybe Central Square, to compare a green space with a paved, built-up area." },
          { speaker: "Tutor", role: "a", text: "Good contrast. How will you actually count the bees?" },
          { speaker: "Sarah", role: "b", text: "I'll do timed observations — ten minutes at each site, twice a day, over four weeks." },
          { speaker: "Tutor", role: "a", text: "Four weeks might not be quite long enough to capture seasonal variation. Could you extend it to six?" },
          { speaker: "Sarah", role: "b", text: "I could, if I start a bit earlier. I'll speak to my supervisor about moving the start date forward." },
          { speaker: "Tutor", role: "a", text: "Good idea. Now, have you thought about how you'll present your findings? A written report, obviously, but will there be a presentation too?" },
          { speaker: "Sarah", role: "b", text: "Yes, there's a short presentation to the department in the final week of term." },
          { speaker: "Tutor", role: "a", text: "And are you using any specific software for the data analysis?" },
          { speaker: "Sarah", role: "b", text: "I was planning to use a simple spreadsheet, but a classmate mentioned a specialist ecology software package that might handle the statistics better." },
          { speaker: "Tutor", role: "a", text: "That's worth looking into — I can send you a link to a free version. One more thing: have you applied for ethical approval yet? Even observational fieldwork like this usually needs sign-off." },
          { speaker: "Sarah", role: "b", text: "Not yet — I didn't realise I needed it for something this simple." },
          { speaker: "Tutor", role: "a", text: "You do, because you'll be working in public parks. It's a quick form, but it can take the ethics committee up to two weeks to respond, so submit it as soon as possible." },
          { speaker: "Sarah", role: "b", text: "I'll do that today." },
        ],
        questions: [
          {
            id: "t1-21", number: 21, section: 3, kind: "multiple-choice", prompt: "What change did the student's supervisor suggest?",
            options: [{ value: "A", label: "Surveying more parks" }, { value: "B", label: "Focusing on fewer parks in more depth" }, { value: "C", label: "Changing the topic entirely" }, { value: "D", label: "Working with a partner" }],
            answer: "B", explanation: "'My supervisor suggested I focus on just two parks instead, and study them in much greater depth.'",
          },
          {
            id: "t1-22", number: 22, section: 3, kind: "multiple-choice", prompt: "Why did the student choose Central Square as one of her sites?",
            options: [{ value: "A", label: "It has the most wildflowers" }, { value: "B", label: "It's close to the university" }, { value: "C", label: "It provides contrast with a green space" }, { value: "D", label: "It was recommended by her supervisor" }],
            answer: "C", explanation: "'...to compare a green space with a paved, built-up area.'",
          },
          {
            id: "t1-23", number: 23, section: 3, kind: "multiple-choice", prompt: "What does the tutor suggest about the observation period?",
            options: [{ value: "A", label: "Shortening it to two weeks" }, { value: "B", label: "Extending it to six weeks" }, { value: "C", label: "Doing it only once a day" }, { value: "D", label: "Removing the timed element" }],
            answer: "B", explanation: "'Four weeks might not be quite long enough... Could you extend it to six?'",
          },
          {
            id: "t1-24", number: 24, section: 3, kind: "multiple-choice", prompt: "What does the student's classmate recommend?",
            options: [{ value: "A", label: "A general spreadsheet" }, { value: "B", label: "A statistics textbook" }, { value: "C", label: "Specialist ecology software" }, { value: "D", label: "A mapping application" }],
            answer: "C", explanation: "'A classmate mentioned a specialist ecology software package.'",
          },
          {
            id: "t1-25", number: 25, section: 3, kind: "multiple-choice", prompt: "What does the tutor say about ethical approval?",
            options: [{ value: "A", label: "It isn't necessary for this project" }, { value: "B", label: "It can be submitted after fieldwork starts" }, { value: "C", label: "It may take up to two weeks to be approved" }, { value: "D", label: "Only lab-based research needs it" }],
            answer: "C", explanation: "'It can take the ethics committee up to two weeks to respond.'",
          },
          { id: "t1-26", number: 26, section: 3, kind: "short-answer", prompt: "How many parks will the student study?", instruction: "Write NO MORE THAN TWO WORDS.", answer: "two", acceptedAnswers: ["two", "2", "two parks"], explanation: "The supervisor suggested 'just two parks'." },
          { id: "t1-27", number: 27, section: 3, kind: "short-answer", prompt: "How many minutes will each observation session last?", answer: "ten", acceptedAnswers: ["ten", "10", "ten minutes"], explanation: "'Timed observations — ten minutes at each site.'" },
          { id: "t1-28", number: 28, section: 3, kind: "short-answer", prompt: "How many times a day will she carry out observations?", answer: "twice", acceptedAnswers: ["twice", "2", "two", "two times"], explanation: "'Ten minutes at each site, twice a day.'" },
          { id: "t1-29", number: 29, section: 3, kind: "short-answer", prompt: "In which week of term is the department presentation?", answer: "final", acceptedAnswers: ["final", "the final week", "last", "last week"], explanation: "'There's a short presentation to the department in the final week of term.'" },
          { id: "t1-30", number: 30, section: 3, kind: "short-answer", prompt: "What must the student submit before starting fieldwork in the parks?", instruction: "Write NO MORE THAN THREE WORDS.", answer: "ethical approval", acceptedAnswers: ["ethical approval", "an ethics form", "ethics approval"], explanation: "'Have you applied for ethical approval yet?'" },
        ],
      },

      // Section 4 — academic lecture monologue, hardest: dense factual
      // content, single-word/number/name gap-fill only, no interaction.
      {
        number: 4,
        title: "Lecture: the printing press and its impact",
        turns: [
          { speaker: "Lecturer", role: "a", text: "Today I want to look at one of the most transformative inventions in human history: the printing press, and specifically the version developed by Johannes Gutenberg in the German city of Mainz, around fourteen forty." },
          { speaker: "Lecturer", role: "a", text: "Before Gutenberg, books in Europe were copied out entirely by hand, usually by monks working in monastery scriptoriums. A single copy of the Bible could take a scribe over a year to complete, which meant books were extremely rare and hugely expensive — realistically, only wealthy institutions like churches or universities could afford them." },
          { speaker: "Lecturer", role: "a", text: "Gutenberg's key innovation wasn't printing itself — woodblock printing already existed in parts of Asia — but rather movable metal type. He created individual, reusable letters cast from a metal alloy, which could be arranged into words, inked, and pressed onto paper, then rearranged for the next page." },
          { speaker: "Lecturer", role: "a", text: "This meant that once the type was set, a printer could produce hundreds of identical copies in the time it previously took to produce one by hand. By fourteen fifty-five, Gutenberg had completed his most famous work, a printed edition of the Bible, now known as the Gutenberg Bible — around one hundred and eighty copies were made, an enormous number for the time." },
          { speaker: "Lecturer", role: "a", text: "The effects spread remarkably quickly. Within fifty years, printing presses had been established in over two hundred cities across Europe, and it's estimated that some twenty million books had been printed by the year fifteen hundred — compare that to the mere thousands that existed in the whole of Europe before Gutenberg." },
          { speaker: "Lecturer", role: "a", text: "This explosion in book production had enormous social consequences. Literacy rates began to rise, because books were, for the first time, affordable to the emerging middle classes, not just the aristocracy and clergy." },
          { speaker: "Lecturer", role: "a", text: "It also played a critical role in the Reformation. Martin Luther's writings, criticising the Catholic Church, were printed and distributed across Germany within weeks — something that would have been unthinkable in the age of hand-copied manuscripts. Some historians argue the printing press was just as important to the Reformation's success as Luther's ideas themselves." },
          { speaker: "Lecturer", role: "a", text: "Science benefited too. Standardised, identical texts meant that scholars in different countries could refer to the exact same page and diagram when discussing a scientific work, which made accurate collaboration and correction possible in a way it simply hadn't been before." },
          { speaker: "Lecturer", role: "a", text: "Finally, I want to mention one lasting linguistic effect: the standardisation of spelling. Before printing, spelling varied enormously from region to region and even scribe to scribe. Printers, wanting consistency across their print runs, began to fix standard spellings — and many of the conventions we still use in English today can be traced directly back to decisions made by early printers in London." },
          { speaker: "Lecturer", role: "a", text: "Next week, we'll look at the second major printing revolution: the steam-powered press of the early nineteenth century." },
        ],
        questions: [
          { id: "t1-31", number: 31, section: 4, kind: "summary-completion", prompt: "Gutenberg developed his printing press in the German city of ______.", instruction: "Write ONE WORD ONLY for each answer.", answer: "Mainz", acceptedAnswers: ["mainz"], explanation: "'The version developed by Johannes Gutenberg in the German city of Mainz.'" },
          { id: "t1-32", number: 32, section: 4, kind: "summary-completion", prompt: "Before printing, books were copied by hand by ______ in monasteries.", answer: "monks", acceptedAnswers: ["monks"], explanation: "'Copied out entirely by hand, usually by monks working in monastery scriptoriums.'" },
          { id: "t1-33", number: 33, section: 4, kind: "summary-completion", prompt: "Gutenberg's key innovation was movable ______ type.", answer: "metal", acceptedAnswers: ["metal"], explanation: "'Movable metal type. He created individual, reusable letters cast from a metal alloy.'" },
          { id: "t1-34", number: 34, section: 4, kind: "summary-completion", prompt: "Gutenberg's most famous work, completed in 1455, was a printed edition of the ______.", answer: "Bible", acceptedAnswers: ["bible"], explanation: "'A printed edition of the Bible, now known as the Gutenberg Bible.'" },
          { id: "t1-35", number: 35, section: 4, kind: "summary-completion", prompt: "Approximately ______ copies of the Gutenberg Bible were made.", instruction: "Write ONE NUMBER ONLY.", answer: "180", acceptedAnswers: ["180", "one hundred and eighty", "one hundred eighty"], explanation: "'Around one hundred and eighty copies were made.'" },
          { id: "t1-36", number: 36, section: 4, kind: "summary-completion", prompt: "Within fifty years, presses were established in over ______ European cities.", answer: "200", acceptedAnswers: ["200", "two hundred"], explanation: "'Printing presses had been established in over two hundred cities across Europe.'" },
          { id: "t1-37", number: 37, section: 4, kind: "summary-completion", prompt: "An estimated ______ million books had been printed by the year 1500.", answer: "20", acceptedAnswers: ["20", "twenty"], explanation: "'Some twenty million books had been printed by the year fifteen hundred.'" },
          { id: "t1-38", number: 38, section: 4, kind: "summary-completion", prompt: "The printing press helped spread the writings of ______, which fuelled the Reformation.", instruction: "Write ONE NAME (up to TWO WORDS).", answer: "Martin Luther", acceptedAnswers: ["martin luther", "luther"], explanation: "'Martin Luther's writings, criticising the Catholic Church, were printed and distributed across Germany within weeks.'" },
          { id: "t1-39", number: 39, section: 4, kind: "summary-completion", prompt: "Printing allowed scholars to collaborate accurately using ______ texts.", answer: "standardised", acceptedAnswers: ["standardised", "standardized"], explanation: "'Standardised, identical texts meant that scholars in different countries could refer to the exact same page.'" },
          { id: "t1-40", number: 40, section: 4, kind: "summary-completion", prompt: "Many modern English spelling conventions can be traced back to early printers in ______.", answer: "London", acceptedAnswers: ["london"], explanation: "'Decisions made by early printers in London.'" },
        ],
      },
    ],
  },
];

/** Mirrors reading-practice.ts's isCorrect() semantics exactly, but is a
 *  fresh, small (~10-line) implementation rather than an import — the
 *  reading component that owns that logic is large, dual-purpose, and
 *  reading-type-specific; duplicating this little pure function is lower
 *  risk than adding a shared export surface to it. Keep the two in sync by
 *  hand if either's grading semantics change. */
export function isListeningCorrect(
  question: ListeningQuestion,
  value: string | string[] | undefined
): boolean {
  if (Array.isArray(question.answer)) {
    return (
      Array.isArray(value) &&
      [...value].sort().join("|") === [...question.answer].sort().join("|")
    );
  }
  if (Array.isArray(value)) return false;
  const normalise = (entry: string) => entry.trim().toLocaleLowerCase().replace(/[.]/g, "");
  const accepted = [question.answer, ...(question.acceptedAnswers ?? [])].map(normalise);
  return value ? accepted.includes(normalise(value)) : false;
}

/** Published raw-score conversion for the 40-question Academic Listening
 *  paper (as the ratio at the bottom of each band) — unlike Reading, IELTS
 *  Listening uses one table regardless of Academic/General Training. Close
 *  to but not identical to Reading Academic's table, so this is its own
 *  constant rather than a reuse of readingBand's. */
const LISTENING_BAND_TABLE: ReadonlyArray<readonly [number, number]> = [
  [0.975, 9], [0.925, 8.5], [0.875, 8], [0.8, 7.5], [0.75, 7],
  [0.65, 6.5], [0.575, 6], [0.45, 5.5], [0.4, 5], [0.325, 4.5],
  [0.25, 4], [0.175, 3.5],
];

export function listeningBand(score: number, total: number): { band: number; approximate: boolean } {
  const ratio = total ? score / total : 0;
  const match = LISTENING_BAND_TABLE.find(([threshold]) => ratio >= threshold);
  return { band: match ? match[1] : 2.5, approximate: total < 20 };
}
