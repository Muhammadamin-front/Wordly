import type { Locale } from "./locales";

type LegalPage = "privacy" | "terms" | "support";

type LegalContent = {
  eyebrow: string;
  title: string;
  intro: string;
  sections: Array<{ title: string; body: string }>;
  review: string;
};

const content: Record<Locale, Record<LegalPage, LegalContent>> = {
  uz: {
    privacy: {
      eyebrow: "Maxfiylik", title: "Maxfiylik siyosati",
      intro: "Vocora hisob, o‘quv progressi va to‘lov ma’lumotlariga ehtiyotkorlik bilan munosabatda bo‘ladi.",
      sections: [
        { title: "Nimani qayta ishlaymiz", body: "Hisob uchun email va profil ma’lumotlari, o‘rganish jarayoni, texnik xavfsizlik signallari va to‘lov provayderidan kelgan to‘lov holatlarini qayta ishlaymiz." },
        { title: "Nima uchun", body: "Xizmatni taqdim etish, progressni saqlash, hisobni himoya qilish, support so‘rovlarini ko‘rish va qonuniy majburiyatlarni bajarish uchun." },
        { title: "Sizning tanlovingiz", body: "Profilni yangilashingiz yoki account deletion orqali hisobni yopishingiz mumkin. Moliyaviy va xavfsizlikka oid minimal yozuvlar qonun, firibgarlikning oldini olish va chargeback talablari uchun saqlanishi mumkin." },
      ],
      review: "Bu sahifa yuridik maslahat emas. Production ishga tushishidan oldin yurist ko‘rib chiqishi va mahalliy talablarga moslashtirishi kerak.",
    },
    terms: {
      eyebrow: "Shartlar", title: "Foydalanish shartlari", intro: "Vocora ta’limiy vosita. Natija muntazam mashq va shaxsiy mehnatga bog‘liq.",
      sections: [
        { title: "Hisobingiz", body: "Hisob xavfsizligi uchun parolingizni boshqalar bilan ulashmang. Tizimni buzish, boshqa foydalanuvchining hisobiga kirish yoki noqonuniy kontent yuklash mumkin emas." },
        { title: "To‘lov va obuna", body: "Pullik imkoniyat faqat to‘lov provayderidan tasdiqlangan holatdan keyin yoqiladi. Bekor qilish keyingi yangilanishni to‘xtatadi; refund shartlari provayder va qonunchilikka bog‘liq." },
        { title: "Kontent", body: "Dars materiallari shaxsiy o‘qish uchun. Ruxsatsiz nusxalash, qayta sotish yoki ommaviy tarqatish mumkin emas." },
      ],
      review: "Bu sahifa yakuniy yuridik hujjat emas. Launchdan oldin professional legal review talab qilinadi.",
    },
    support: {
      eyebrow: "Yordam", title: "Vocora support", intro: "Kirish, subscription, to‘lov yoki o‘quv jarayonida muammo bo‘lsa, bizga yozing.",
      sections: [
        { title: "Bog‘lanish", body: "support@vocora.uz manziliga yozing. Xabarda account emailingiz, yuz bergan holat va iloji bo‘lsa X-Request-ID ni yuboring. Parol, OTP yoki access token yubormang." },
        { title: "Javob vaqti", body: "Hisob yoki to‘lov bilan bog‘liq muammolar navbat bilan ko‘riladi. Xavfsizlik muammosini darhol “Security” mavzusi bilan yuboring." },
        { title: "Hisobni yopish", body: "Profil ichidagi Account deletion sahifasi orqali hisobni yopishingiz mumkin. Bu amaldan keyin login va barcha sessiyalar darhol bekor qilinadi." },
      ],
      review: "Support ma’lumotlari launchdan oldin owner tomonidan tasdiqlanishi kerak.",
    },
  },
  en: {
    privacy: { eyebrow: "Privacy", title: "Privacy Policy", intro: "Vocora handles account, learning-progress, and payment-related information with care.", sections: [{ title: "What we process", body: "We process account and profile information, learning progress, security signals, and payment status received from payment providers." }, { title: "Why", body: "To provide the service, retain learning progress, protect accounts, handle support requests, and meet legal obligations." }, { title: "Your choices", body: "You can update your profile or close your account. Minimum payment and security records may be retained where required for law, fraud prevention, or chargebacks." }], review: "This page is not legal advice. It requires legal review and local-law adaptation before launch." },
    terms: { eyebrow: "Terms", title: "Terms of Service", intro: "Vocora is an educational tool. Outcomes depend on regular practice and your own effort.", sections: [{ title: "Your account", body: "Keep your password private. Do not interfere with the service, access another account, or upload unlawful content." }, { title: "Payments and subscriptions", body: "Paid access is enabled only after the provider confirms payment. Cancellation stops future renewal; refunds depend on provider and applicable law." }, { title: "Content", body: "Learning material is for personal study. It may not be copied, resold, or distributed without permission." }], review: "This page is not a final legal agreement. Professional legal review is required before launch." },
    support: { eyebrow: "Support", title: "Vocora support", intro: "Contact us for sign-in, subscription, payment, or learning issues.", sections: [{ title: "Contact", body: "Write to support@vocora.uz with your account email, what happened, and an X-Request-ID if available. Never send a password, OTP, or access token." }, { title: "Response", body: "Account and payment issues are triaged in order. Send security concerns with “Security” in the subject." }, { title: "Account deletion", body: "You can close your account from the Account deletion page. Login access and active sessions are revoked immediately." }], review: "Support contact details should be confirmed by the owner before launch." },
  },
  ru: {
    privacy: { eyebrow: "Конфиденциальность", title: "Политика конфиденциальности", intro: "Vocora бережно обрабатывает данные аккаунта, прогресса и платежей.", sections: [{ title: "Что мы обрабатываем", body: "Мы обрабатываем данные аккаунта и профиля, учебный прогресс, сигналы безопасности и статусы платежей от платёжных провайдеров." }, { title: "Зачем", body: "Чтобы предоставлять сервис, сохранять прогресс, защищать аккаунты, обрабатывать обращения и выполнять юридические обязательства." }, { title: "Ваш выбор", body: "Вы можете обновить профиль или закрыть аккаунт. Минимальные платёжные и защитные записи могут храниться для соблюдения закона, защиты от мошенничества и чарджбеков." }], review: "Это не юридическая консультация. До запуска нужен юридический обзор и адаптация к местному праву." },
    terms: { eyebrow: "Условия", title: "Условия использования", intro: "Vocora — образовательный инструмент. Результат зависит от регулярной практики и ваших усилий.", sections: [{ title: "Аккаунт", body: "Не передавайте пароль другим. Нельзя вмешиваться в работу сервиса, получать доступ к чужим аккаунтам или загружать незаконный контент." }, { title: "Оплата и подписка", body: "Платный доступ включается только после подтверждения провайдером. Отмена останавливает будущие продления; возвраты зависят от провайдера и закона." }, { title: "Контент", body: "Учебные материалы предназначены для личного использования и не могут копироваться, перепродаваться или распространяться без разрешения." }], review: "Это не окончательный юридический документ. До запуска необходим профессиональный юридический обзор." },
    support: { eyebrow: "Поддержка", title: "Поддержка Vocora", intro: "Свяжитесь с нами по вопросам входа, подписки, оплаты или обучения.", sections: [{ title: "Контакт", body: "Пишите на support@vocora.uz: укажите email аккаунта, описание проблемы и X-Request-ID при наличии. Никогда не отправляйте пароль, OTP или access token." }, { title: "Ответ", body: "Проблемы с аккаунтом и оплатой обрабатываются по очереди. Вопросы безопасности отправляйте с темой “Security”." }, { title: "Удаление аккаунта", body: "Аккаунт можно закрыть на странице удаления. Доступ и активные сессии будут отозваны сразу." }], review: "Контактные данные поддержки должны быть подтверждены владельцем до запуска." },
  },
};

export function getLegalContent(locale: Locale, page: LegalPage) {
  return content[locale][page];
}
