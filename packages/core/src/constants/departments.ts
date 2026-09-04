export const colleges = [
  {
    id: 'humanities',
    name: '인문대학',
    departments: [
      { value: 'KOREAN_LITERATURE', name: '국어국문학과' },
      { value: 'ENGLISH_LITERATURE', name: '영어영문학과' },
      { value: 'GERMAN_LITERATURE', name: '독어독문학과' },
      { value: 'FRENCH_LITERATURE', name: '불어불문학과' },
      { value: 'JAPANESE_LITERATURE', name: '일본지역문화학과' },
      { value: 'CHINESE_LITERATURE', name: '중어중국학과' },
    ],
  },

  {
    id: 'natural-science',
    name: '자연과학대학',
    departments: [
      { value: 'MATHEMATICS', name: '수학과' },
      { value: 'PHYSICS', name: '물리학과' },
      { value: 'CHEMISTRY', name: '화학과' },
      { value: 'FASHION_INDUSTRY', name: '패션산업학과' },
      { value: 'MARINE_SCIENCE', name: '해양학과' },
    ],
  },

  {
    id: 'social-science',
    name: '사회과학대학',
    departments: [
      { value: 'SOCIAL_WELFARE', name: '사회복지학과' },
      { value: 'MEDIA_COMMUNICATION', name: '미디어커뮤니케이션학과' },
      { value: 'LIBRARY_INFORMATION_SCIENCE', name: '문헌정보학과' },
      {
        value: 'CREATIVE_HUMAN_RESOURCE_DEVELOPMENT',
        name: '창의인재개발학과',
      },
    ],
  },

  {
    id: 'global-management',
    name: '글로벌정경대학',
    departments: [
      { value: 'PUBLIC_ADMINISTRATION', name: '행정학과' },
      { value: 'POLITICAL_INTERNATIONAL', name: '정치외교학과' },
      { value: 'ECONOMICS', name: '경제학과' },
      { value: 'INTERNATIONAL_TRADE', name: '무역학부' },
      { value: 'CONSUMER_SCIENCE', name: '소비자학과' },
      {
        value: 'GLOBAL_TRADE_LOGISTICS',
        name: '글로벌무역물류학과',
        note: '계약학과',
      },
    ],
  },

  {
    id: 'engineering',
    name: '공과대학',
    departments: [
      { value: 'MECHANICAL', name: '기계공학과' },
      { value: 'ELECTRICAL', name: '전기공학과' },
      { value: 'ELECTRONICS', name: '전자공학과' },
      { value: 'INDUSTRIAL_MANAGEMENT', name: '산업경영공학과' },
      { value: 'MATERIALS_SCIENCE', name: '신소재공학과' },
      { value: 'SAFETY', name: '안전공학과' },
      { value: 'ENERGY_CHEMICAL', name: '에너지화학공학과' },
      { value: 'BIOMEDICAL_ROBOTICS', name: '바이오로봇시스템공학과' },
    ],
  },

  {
    id: 'it',
    name: '정보기술대학',
    departments: [
      { value: 'COMPUTER_SCIENCE', name: '컴퓨터공학부' },
      {
        value: 'INFORMATION_TELECOMMUNICATION',
        name: '정보통신공학과',
      },
      { value: 'EMBEDDED_SYSTEM', name: '임베디드시스템공학과' },
    ],
  },

  {
    id: 'business',
    name: '경영대학',
    departments: [
      { value: 'BUSINESS_ADMINISTRATION', name: '경영학부' },
      { value: 'DATA_SCIENCE', name: '데이터과학과' },
      { value: 'TAX_ACCOUNTING', name: '세무회계학과' },
      {
        value: 'TECHNOLOGY_MANAGEMENT',
        name: '테크노경영학과',
        note: '계약학과',
      },
    ],
  },

  {
    id: 'arts-sports',
    name: '예술체육대학',
    departments: [
      { value: 'PAINTING', name: '조형예술학부' },
      { value: 'DESIGN', name: '디자인학부' },
      { value: 'PERFORMING_ARTS', name: '공연예술학과' },
      { value: 'SPORT_SCIENCE', name: '스포츠과학부' },
      { value: 'HEALTH_KINESIOLOGY', name: '운동건강학부' },
    ],
  },

  {
    id: 'education',
    name: '사범대학',
    departments: [
      { value: 'KOREAN_EDUCATION', name: '국어교육과' },
      { value: 'ENGLISH_EDUCATION', name: '영어교육과' },
      { value: 'JAPANESE_EDUCATION', name: '일어교육과' },
      { value: 'MATHEMATICS_EDUCATION', name: '수학교육과' },
      { value: 'PHYSICAL_EDUCATION', name: '체육교육과' },
      { value: 'EARLY_CHILDHOOD_EDUCATION', name: '유아교육과' },
      { value: 'HISTORY_EDUCATION', name: '역사교육과' },
      { value: 'ETHICS_EDUCATION', name: '윤리교육과' },
    ],
  },

  {
    id: 'urban-science',
    name: '도시과학대학',
    departments: [
      { value: 'URBAN_ADMINISTRATION', name: '도시행정학과' },
      {
        value: 'URBAN_ENVIRONMENTAL_ENGINEERING',
        name: '도시환경공학부',
      },
      { value: 'URBAN_ENGINEERING', name: '도시공학과' },
      { value: 'URBAN_ARCHITECTURE', name: '도시건축학부' },
      {
        value: 'URBAN_CONSTRUCTION_ENGINEERING',
        name: '도시건설공학과',
        note: '계약학과',
      },
    ],
  },

  {
    id: 'bio',
    name: '생명과학기술대학',
    departments: [
      { value: 'BIOLOGICAL_SCIENCES', name: '생명과학부' },
      { value: 'BIOENGINEERING', name: '생명공학부' },
    ],
  },

  {
    id: 'free-major',
    name: '융합자유전공대학',
    departments: [
      { value: 'LIBERAL_ARTS', name: '자유전공학부' },
      {
        value: 'INTERNATIONAL_LIBERAL_ARTS',
        name: '국제자유전공학부',
      },
      { value: 'CONVERGENCE', name: '융합학부' },
    ],
  },

  {
    id: 'east-asia',
    name: '동북아국제통상물류학부',
    departments: [
      { value: 'ICAS', name: '동북아국제통상전공' },
      { value: 'IBE', name: 'IBE전공' },
      { value: 'SLOG', name: '스마트물류공학전공' },
    ],
  },

  {
    id: 'law',
    name: '법학부',
    departments: [{ value: 'LAW', name: '법학부' }],
  },
];
