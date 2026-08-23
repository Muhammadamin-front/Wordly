export type ListeningTrackGroup = "Everyday life" | "Health & services" | "Work & travel" | "Social & feelings";

export type ListeningTrack = {
  file: string;
  number: number;
  title: string;
  group: ListeningTrackGroup;
};

const FILES = `
english-conversations-0001-1-at-home-1.mp3 english-conversations-0002-2-at-home-2.mp3 english-conversations-0003-3-my-favorite-photographs.mp3 english-conversations-0004-4-location.mp3 english-conversations-0005-5-location-2.mp3 english-conversations-0006-6-color.mp3 english-conversations-0007-7-color-2.mp3 english-conversations-0008-8-no-questions.mp3 english-conversations-0009-9-short-answer.mp3 english-conversations-0010-10-telephone-call.mp3
english-conversations-0011-11-whats-a-grant.mp3 english-conversations-0012-12-im-busy-on-friday.mp3 english-conversations-0013-13-bless-you.mp3 english-conversations-0014-14-i-dont-feel-well.mp3 english-conversations-0015-15-can-you-help-me.mp3 english-conversations-0016-16-taking-a-cab.mp3 english-conversations-0017-17-i-hate-to-get-up.mp3 english-conversations-0018-18-a-hot-day.mp3 english-conversations-0019-19-phone-out-of-order-1.mp3 english-conversations-0020-20-phone-out-of-order-2.mp3
english-conversations-0021-21-getting-a-visa.mp3 english-conversations-0022-22-employing-a-new-member.mp3 english-conversations-0023-23-a-date-1.mp3 english-conversations-0024-24-what-did-you-do-yesterday.mp3 english-conversations-0025-25-travelling-by-air.mp3 english-conversations-0026-26-at-the-customs.mp3 english-conversations-0027-27-a-new-baby.mp3 english-conversations-0028-28-is-english-difficult.mp3 english-conversations-0029-29-washing-his-car.mp3 english-conversations-0030-30-at-the-restaurant.mp3
english-conversations-0031-31-whens-the-baby-due.mp3 english-conversations-0032-32-bus-stop.mp3 english-conversations-0033-33-gardening.mp3 english-conversations-0034-34-a-lazy-boy.mp3 english-conversations-0035-35-can-i-drive-there.mp3 english-conversations-0036-36-a-new-dress.mp3 english-conversations-0037-37-a-picnic.mp3 english-conversations-0038-38-im-going-skiing.mp3 english-conversations-0039-39-traffic-rules-1.mp3 english-conversations-0040-40-housework.mp3
english-conversations-0041-41-oral-exams.mp3 english-conversations-0042-42-would-you-call-me.mp3 english-conversations-0043-43-can-i-let-you-know.mp3 english-conversations-0044-44-a-less-formal-call.mp3 english-conversations-0045-45-a-cup-of-coffee.mp3 english-conversations-0046-46-how-about-a-drink.mp3 english-conversations-0047-47-i-have-a-sore-throat.mp3 english-conversations-0048-48-on-sale.mp3 english-conversations-0049-49-not-a-cloud-in-the-sky.mp3 english-conversations-0050-50-cold-and-windy.mp3
english-conversations-0051-51-its-beginning-to-snow.mp3 english-conversations-0052-52-a-house-at-the-shore.mp3 english-conversations-0053-53-a-soccer-game.mp3 english-conversations-0054-54-not-so-young.mp3 english-conversations-0055-55-is-she-single.mp3 english-conversations-0056-56-to-buy-a-birthday-present.mp3 english-conversations-0057-57-telephone.mp3 english-conversations-0058-58-a-light-eater.mp3 english-conversations-0059-59-a-nice-flat-1.mp3 english-conversations-0060-60-a-nice-flat-2.mp3
english-conversations-0061-61-afraid-of-flying.mp3 english-conversations-0062-62-a-plane-reservation.mp3 english-conversations-0063-63-getting-together.mp3 english-conversations-0064-64-hows-your-new-job-going.mp3 english-conversations-0065-65-we-eat-a-lot.mp3 english-conversations-0066-66-ill-take-you.mp3 english-conversations-0067-67-we-must-be-out-of-them.mp3 english-conversations-0068-68-doctors-appointment.mp3 english-conversations-0069-69-traffic-rules-2.mp3 english-conversations-0070-70-eating-out.mp3
english-conversations-0071-71-to-buy-a-bus-ticket.mp3 english-conversations-0072-72-on-the-phone.mp3 english-conversations-0073-73-operating-room.mp3 english-conversations-0074-74-a-car-loan.mp3 english-conversations-0075-75-a-cashier.mp3 english-conversations-0076-76-settling-down.mp3 english-conversations-0077-77-will-you-get-some-bread-for-me.mp3 english-conversations-0078-78-buying-a-present---in-a-jewellers-shop.mp3 english-conversations-0079-79-buying-a-present---in-a-toy-shop.mp3 english-conversations-0080-80-making-a-reservation.mp3
english-conversations-0081-81-ready-to-go.mp3 english-conversations-0082-82-an-interesting-movie.mp3 english-conversations-0083-83-a-new-job.mp3 english-conversations-0084-84-a-date-2.mp3 english-conversations-0085-85-smoking.mp3 english-conversations-0086-86-a-death.mp3 english-conversations-0087-87-a-birth.mp3 english-conversations-0088-88-a-coincidence.mp3 english-conversations-0089-89-how-have-you-been.mp3 english-conversations-0090-90-applying-for-a-job.mp3
english-conversations-0091-91-giving-directions.mp3 english-conversations-0092-92-talking-about-pets.mp3 english-conversations-0093-93-where-is-the-post-office.mp3 english-conversations-0094-94-meeting-an-old-friend.mp3 english-conversations-0095-95-using-public-transportation.mp3 english-conversations-0096-96-cafeteria-menu.mp3 english-conversations-0097-97-weekend-plans.mp3 english-conversations-0098-98-visiting-a-national-park.mp3 english-conversations-0099-99-bad-room-service.mp3 english-conversations-0100-100-photography-class.mp3
`.trim().split(/\s+/);

const GROUP_RULES: ReadonlyArray<{ group: ListeningTrackGroup; match: readonly string[] }> = [
  {
    group: "Work & travel",
    match: ["visa", "customs", "travelling", "air", "flight", "flying", "plane", "reservation", "job", "employing", "interview", "applying", "grant", "loan", "cashier", "office", "taxi", "cab", "bus", "transportation", "directions", "post-office", "national-park", "hotel", "room-service", "ticket", "drive", "car", "traffic", "skiing", "shore"],
  },
  {
    group: "Health & services",
    match: ["doctor", "appointment", "sore-throat", "dont-feel-well", "operating-room", "help-me", "out-of-order", "sale", "shop", "buying", "present", "menu", "restaurant", "eating-out", "coffee", "drink", "bread", "cafeteria"],
  },
  {
    group: "Social & feelings",
    match: ["death", "birth", "baby", "single", "date", "friend", "coincidence", "how-have-you-been", "birthday", "bless-you", "busy", "lazy", "young", "afraid", "hate", "call", "telephone", "phone", "know"],
  },
];

function groupFor(file: string): ListeningTrackGroup {
  const slug = file.replace(/^english-conversations-\d{4}-\d+-/, "").replace(/\.mp3$/, "");
  const padded = `-${slug}-`;
  return GROUP_RULES.find((rule) => rule.match.some((word) => padded.includes(`-${word}-`)))?.group ?? "Everyday life";
}

function titleFromFile(file: string) {
  return file
    .replace(/^english-conversations-\d{4}-\d+-/, "")
    .replace(/\.mp3$/, "")
    .replace(/---/g, " - ")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export const LISTENING_GROUPS = ["All", "Everyday life", "Health & services", "Work & travel", "Social & feelings"] as const;

export const LISTENING_TRACKS: ListeningTrack[] = FILES.map((file, index) => ({
  file,
  number: index + 1,
  title: titleFromFile(file),
  group: groupFor(file),
}));

