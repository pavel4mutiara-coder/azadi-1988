
export interface InitialLeader {
  nameEn: string;
  nameBn: string;
  designationEn: string;
  designationBn: string;
  subDesignationEn?: string;
  subDesignationBn?: string;
  order: number;
}

export const INITIAL_COMMITTEE: InitialLeader[] = [
  // 1. President & Vice-Presidents
  { nameEn: "Md. Abdus Sabir (Tutul)", nameBn: "মোঃ আব্দুছ ছাবির (টুটুল)", designationEn: "President", designationBn: "সভাপতি", order: 1 },
  { nameEn: "S. S. Nurul Huda Chow (Adv. Shahanur)", nameBn: "এস এস নুরুল হুদা চৌঃ (এডঃ শাহানুর)", designationEn: "Vice-President", designationBn: "সহ-সভাপতি", order: 2 },
  { nameEn: "Aminur Rahman (Shamim)", nameBn: "আমিনুর রহমান (শামীম)", designationEn: "Vice-President", designationBn: "সহ-সভাপতি", order: 3 },
  { nameEn: "Jubed Ahmed", nameBn: "জুবেদ আহমদ", designationEn: "Vice-President", designationBn: "সহ-সভাপতি", order: 4 },

  // 2. GS
  { nameEn: "Junel Ahmed", nameBn: "জুনেল আহমদ", designationEn: "General Secretary", designationBn: "সাধারণ সম্পাদক", order: 5 },
  { nameEn: "Kawsar Ahmed (Pappu)", nameBn: "কাওসার আহমদ (পাপ্পু)", designationEn: "Assistant General Secretary", designationBn: "সহ-সাধারণ সম্পাদক", order: 6 },

  // 3. Organizing
  { nameEn: "Tarek Ahmed", nameBn: "তারেক আহমদ", designationEn: "Organizing Secretary", designationBn: "সাংগঠনিক সম্পাদক", order: 7 },
  { nameEn: "Currently Vacant", nameBn: "বর্তমানে খালি", designationEn: "Assistant Organizing Secretary", designationBn: "সহ-সাংগঠনিক সম্পাদক", order: 8 },

  // 4. Social Welfare
  { nameEn: "Najib Salam", nameBn: "নাজিব সালাম", designationEn: "Social Welfare Secretary", designationBn: "সমাজ কল্যাণ সম্পাদক", order: 9 },
  { nameEn: "Samin Ahmed Limon", nameBn: "সামিন আহমদ লিমন", designationEn: "Assistant Social Welfare Secretary", designationBn: "সহ-সমাজ কল্যাণ সম্পাদক", order: 10 },

  // 5. Finance
  { nameEn: "Abdul Malik (Biplob)", nameBn: "আব্দুল মালিক (বিপ্লব)", designationEn: "Finance Secretary", designationBn: "অর্থ সম্পাদক", order: 11 },
  { nameEn: "Abdul Hadi (Rumman)", nameBn: "আব্দুল হাদী (রুম্মান)", designationEn: "Assistant Finance Secretary", designationBn: "সহ-অর্থ সম্পাদক", order: 12 },

  // 6. Publicity
  { nameEn: "Arafat Islam (Boni)", nameBn: "আরাফাত ইসলাম (বনি)", designationEn: "Publicity Secretary", designationBn: "প্রচার সম্পাদক", order: 13 },
  { nameEn: "Currently Vacant", nameBn: "বর্তমানে খালি", designationEn: "Assistant Publicity Secretary", designationBn: "সহ-প্রচার সম্পাদক", order: 14 },

  // 7. Sports
  { nameEn: "Rafayat Malik (Rafi)", nameBn: "রাফায়াত মালিক (রাফি)", designationEn: "Sports Secretary", designationBn: "ক্রীড়া সম্পাদক", order: 15 },
  { nameEn: "Harun Ahmed", nameBn: "হারুণ আহমদ", designationEn: "Assistant Sports Secretary", designationBn: "সহ-ক্রীড়া সম্পাদক", order: 16 },

  // 8. Religious
  { nameEn: "Naim Ahmed", nameBn: "নাঈম আহমদ", designationEn: "Religious Secretary", designationBn: "ধর্ম সম্পাদক", order: 17 },
  { nameEn: "Currently Vacant", nameBn: "বর্তমানে খালি", designationEn: "Assistant Religious Secretary", designationBn: "সহ-ধর্ম সম্পাদক", order: 18 },

  // 9. Education & Culture
  { nameEn: "Shafayat Rasul (Alif)", nameBn: "শাফায়াত রসুল (আলিফ)", designationEn: "Education, Literature & Cultural Secretary", designationBn: "শিক্ষা-সাহিত্য ও সাংস্কৃতিক সম্পাদক", order: 19 },
  { nameEn: "Aminul Islam (Nabil)", nameBn: "আমিনুল ইসলাম (নাবিল)", designationEn: "Assistant Education, Literature & Cultural Secretary", designationBn: "সহ-শিক্ষা-সাহিত্য ও সাংস্কৃতিক সম্পাদক", order: 20 },

  // 10. Women Affairs
  { nameEn: "Currently Vacant", nameBn: "বর্তমানে খালি", designationEn: "Women Affairs Secretary", designationBn: "মহিলা সম্পাদিকা", order: 21 },
  { nameEn: "Currently Vacant", nameBn: "বর্তমানে খালি", designationEn: "Assistant Women Affairs Secretary", designationBn: "সহ-মহিলা সম্পাদিকা", order: 22 },

  // 11. Office
  { nameEn: "Currently Vacant", nameBn: "বর্তমানে খালি", designationEn: "Office Secretary", designationBn: "দপ্তর সম্পাদক", order: 23 },
  { nameEn: "Currently Vacant", nameBn: "বর্তমানে খালি", designationEn: "Assistant Office Secretary", designationBn: "সহ-দপ্তর সম্পাদক", order: 24 }
];
