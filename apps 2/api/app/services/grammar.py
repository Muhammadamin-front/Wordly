"""Grammar question bank for the multiplayer quiz (and future drills).

Static and versioned with the code, like the writing prompt bank: grammar MCQs
are editorial content that changes rarely and needs review — a database table
adds churn without benefit at this size. Each entry is
{"prompt", "options", "answer_index"}; `grammar_questions()` returns a sampled,
option-shuffled copy so no two rounds look identical.
"""
import random
from typing import Dict, List

QUESTIONS: Dict[str, List[dict]] = {
    "A1": [
        {"prompt": "I ___ a student.", "options": ["am", "is", "are", "be"], "answer_index": 0},
        {"prompt": "She ___ from Bukhara.", "options": ["are", "is", "am", "be"], "answer_index": 1},
        {"prompt": "They ___ my friends.", "options": ["is", "am", "are", "was"], "answer_index": 2},
        {"prompt": "This is ___ apple.", "options": ["a", "an", "the", "—"], "answer_index": 1},
        {"prompt": "I have ___ brother.", "options": ["an", "a", "two", "any"], "answer_index": 1},
        {"prompt": "___ you like tea?", "options": ["Does", "Is", "Do", "Are"], "answer_index": 2},
        {"prompt": "He ___ football every day.", "options": ["play", "plays", "playing", "played"], "answer_index": 1},
        {"prompt": "We ___ not have a car.", "options": ["does", "is", "are", "do"], "answer_index": 3},
        {"prompt": "There ___ a book on the table.", "options": ["are", "is", "am", "have"], "answer_index": 1},
        {"prompt": "There ___ many students in class.", "options": ["is", "am", "are", "be"], "answer_index": 2},
        {"prompt": "This is ___ book. It's mine.", "options": ["my", "me", "I", "mine's"], "answer_index": 0},
        {"prompt": "___ is your name?", "options": ["Who", "What", "Where", "When"], "answer_index": 1},
        {"prompt": "___ do you live?", "options": ["What", "Who", "Where", "Why"], "answer_index": 2},
        {"prompt": "I get up ___ seven o'clock.", "options": ["in", "on", "at", "to"], "answer_index": 2},
        {"prompt": "My birthday is ___ May.", "options": ["at", "on", "in", "by"], "answer_index": 2},
        {"prompt": "The cat is ___ the chair.", "options": ["on", "at", "of", "to"], "answer_index": 0},
    ],
    "A2": [
        {"prompt": "I ___ to Samarkand last year.", "options": ["go", "goes", "went", "gone"], "answer_index": 2},
        {"prompt": "She ___ TV when I called.", "options": ["watches", "was watching", "watched", "is watching"], "answer_index": 1},
        {"prompt": "We ___ dinner right now.", "options": ["cook", "cooked", "are cooking", "cooks"], "answer_index": 2},
        {"prompt": "He is ___ than his brother.", "options": ["tall", "taller", "tallest", "more tall"], "answer_index": 1},
        {"prompt": "This is the ___ film of the year.", "options": ["good", "better", "best", "most good"], "answer_index": 2},
        {"prompt": "I'm going ___ visit my grandmother.", "options": ["to", "for", "at", "on"], "answer_index": 0},
        {"prompt": "You ___ wear a seatbelt in the car.", "options": ["can", "must", "may", "could"], "answer_index": 1},
        {"prompt": "___ you swim when you were five?", "options": ["Must", "Should", "Could", "May"], "answer_index": 2},
        {"prompt": "There isn't ___ milk in the fridge.", "options": ["some", "any", "no", "a"], "answer_index": 1},
        {"prompt": "Would you like ___ water?", "options": ["any", "an", "some", "many"], "answer_index": 2},
        {"prompt": "How ___ apples do you want?", "options": ["much", "many", "some", "any"], "answer_index": 1},
        {"prompt": "How ___ money do you have?", "options": ["many", "much", "few", "a lot"], "answer_index": 1},
        {"prompt": "I have never ___ sushi.", "options": ["eat", "ate", "eaten", "eating"], "answer_index": 2},
        {"prompt": "She has lived here ___ 2020.", "options": ["for", "since", "from", "at"], "answer_index": 1},
        {"prompt": "If it rains, we ___ at home.", "options": ["stay", "will stay", "stayed", "staying"], "answer_index": 1},
        {"prompt": "He asked me ___ him.", "options": ["help", "to help", "helping", "helped"], "answer_index": 1},
    ],
    "B1": [
        {"prompt": "By the time we arrived, the film ___.", "options": ["started", "has started", "had started", "starts"], "answer_index": 2},
        {"prompt": "This bridge ___ in 1898.", "options": ["built", "was built", "is building", "has built"], "answer_index": 1},
        {"prompt": "English ___ all over the world.", "options": ["speaks", "is spoken", "spoke", "is speaking"], "answer_index": 1},
        {"prompt": "If I ___ rich, I would travel the world.", "options": ["am", "was", "were", "be"], "answer_index": 2},
        {"prompt": "She said she ___ tired.", "options": ["is", "was", "be", "were"], "answer_index": 1},
        {"prompt": "I wish I ___ speak French.", "options": ["can", "could", "will", "would"], "answer_index": 1},
        {"prompt": "The man ___ lives next door is a doctor.", "options": ["which", "who", "whose", "whom"], "answer_index": 1},
        {"prompt": "The book ___ I read was fantastic.", "options": ["who", "whose", "which", "where"], "answer_index": 2},
        {"prompt": "I'm used ___ up early.", "options": ["to get", "to getting", "get", "getting"], "answer_index": 1},
        {"prompt": "She suggested ___ to the museum.", "options": ["to go", "go", "going", "gone"], "answer_index": 2},
        {"prompt": "I look forward to ___ from you.", "options": ["hear", "hearing", "heard", "be heard"], "answer_index": 1},
        {"prompt": "You ___ have seen him — he's abroad.", "options": ["mustn't", "can't", "shouldn't", "needn't"], "answer_index": 1},
        {"prompt": "He has been working here ___ ten years.", "options": ["since", "from", "for", "during"], "answer_index": 2},
        {"prompt": "Despite ___ hard, he failed the exam.", "options": ["study", "studying", "to study", "studied"], "answer_index": 1},
        {"prompt": "Neither Aziz ___ Karim came to the party.", "options": ["or", "and", "nor", "but"], "answer_index": 2},
        {"prompt": "The teacher made us ___ the exercise again.", "options": ["to do", "doing", "do", "done"], "answer_index": 2},
    ],
    "B2": [
        {"prompt": "Had I known about the meeting, I ___ come.", "options": ["would", "would have", "will have", "had"], "answer_index": 1},
        {"prompt": "Not only ___ late, but he also forgot the tickets.", "options": ["he was", "was he", "he is", "is he"], "answer_index": 1},
        {"prompt": "It's high time you ___ a decision.", "options": ["make", "made", "will make", "have made"], "answer_index": 1},
        {"prompt": "The report needs ___ by Friday.", "options": ["finish", "to finishing", "finishing", "finished"], "answer_index": 2},
        {"prompt": "She would rather you ___ smoke here.", "options": ["don't", "didn't", "won't", "not"], "answer_index": 1},
        {"prompt": "___ the weather, the match went ahead.", "options": ["Despite", "Although", "However", "Even"], "answer_index": 0},
        {"prompt": "By next June, they ___ the new stadium.", "options": ["will finish", "will have finished", "finish", "are finishing"], "answer_index": 1},
        {"prompt": "He denied ___ the window.", "options": ["to break", "break", "breaking", "broken"], "answer_index": 2},
        {"prompt": "Scarcely ___ arrived when the phone rang.", "options": ["I had", "had I", "I have", "have I"], "answer_index": 1},
        {"prompt": "The proposal, ___ merits are clear, was rejected.", "options": ["which", "that", "whose", "what"], "answer_index": 2},
        {"prompt": "I'd sooner ___ the truth, however painful.", "options": ["know", "to know", "knowing", "knew"], "answer_index": 0},
        {"prompt": "___ as it may seem, the story is true.", "options": ["Strange", "Strangely", "Stranger", "Strangest"], "answer_index": 0},
        {"prompt": "The suspect is believed ___ the country.", "options": ["to leave", "to have left", "leaving", "left"], "answer_index": 1},
        {"prompt": "Under no circumstances ___ the door.", "options": ["you should open", "should you open", "you open", "open you"], "answer_index": 1},
        {"prompt": "But for your help, I ___ the deadline.", "options": ["would miss", "would have missed", "will miss", "missed"], "answer_index": 1},
        {"prompt": "It was only when I got home ___ I noticed the mistake.", "options": ["when", "which", "that", "then"], "answer_index": 2},
    ],
}



CEFR_ORDER = ("A1", "A2", "B1", "B2", "C1", "C2")


def nearest_available_level(level: str, available) -> str:
    """The requested level, or the closest one below it that exists.

    Content currently stops at B2. Falling back to A1 meant a learner placed at
    C1 was handed A1 questions — the largest possible mismatch — and, because
    score_grammar used the same fallback, graded against them too.
    """
    if level in available:
        return level
    index = CEFR_ORDER.index(level) if level in CEFR_ORDER else 0
    for candidate in reversed(CEFR_ORDER[:index]):
        if candidate in available:
            return candidate
    return next(iter(available))


def grammar_questions(level: str, count: int) -> List[dict]:
    """A sampled, option-shuffled copy of the bank for one quiz round."""
    bank = QUESTIONS[nearest_available_level(level, QUESTIONS)]
    picked = random.sample(bank, min(count, len(bank)))
    rounds = []
    for q in picked:
        options = list(q["options"])
        answer = options[q["answer_index"]]
        random.shuffle(options)
        rounds.append(
            {"prompt": q["prompt"], "options": options, "answer_index": options.index(answer)}
        )
    return rounds
