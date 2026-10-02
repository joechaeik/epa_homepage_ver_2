// Presentation windows preserve the official original artwork without redrawing it.
export type AlumniLogoPresentation = {
  white: boolean;
  dark?: boolean;
  label?: string;
  crop?: readonly [number, number, number, number, number, number];
  clip?: string;
};
export const alumniLogoPresentations: Record<string, AlumniLogoPresentation> = {
  "/images/alumni-logos/Argonne_National_Laboratory.png": { white: false, dark: true, crop: [974, 125, 360, 0, 105, 93] },
  "/images/alumni-logos/Shanghai_University.png": { white: false, dark: true, crop: [186, 70, 0, 0, 56, 70] },
  "/images/alumni-logos/Nanjing_University_of_Science_and_Technology.png": { white: false, dark: true, label: "Nanjing Univ. of Science & Technology", crop: [342, 55, 0, 0, 55, 55] },
  "/images/alumni-logos/Korea_Railroad_Research_Institute.png": { white: true, label: "KRRI", crop: [286, 36, 0, 0, 79, 36] },
  "/images/alumni-logos/Aekyung_Chemical.svg": {
    "white": true,
    "crop": [
      202,
      36.816,
      0,
      0,
      36.816,
      36.816
    ]
  },
  "/images/alumni-logos/Bandung_Institute_of_Technology.png": {
    "white": true
  },
  "/images/alumni-logos/Central_China_Normal_University.jpg": {
    "white": true
  },
  "/images/alumni-logos/Chongqing_University.png": {
    "white": true,
    "crop": [
      226,
      71,
      0,
      0,
      71,
      71
    ]
  },
  "/images/alumni-logos/DGIST.png": {
    "white": true,
    "crop": [
      760,
      201,
      209,
      48,
      342,
      104
    ]
  },
  "/images/alumni-logos/Foshan_University.png": {
    "white": true
  },
  "/images/alumni-logos/Hallym_University.png": {
    "white": true,
    "crop": [
      177,
      55,
      0,
      0,
      80,
      37
    ],
    "clip": "polygon(0 0,100% 0,100% 60%,70% 60%,70% 100%,0 100%)"
  },
  "/images/alumni-logos/Harbin_Institute_of_Technology.png": {
    "white": true
  },
  "/images/alumni-logos/Hefei_Institutes_of_Physical_Science_CAS.png": {
    "white": true,
    "crop": [
      1062,
      144,
      0,
      0,
      183,
      144
    ]
  },
  "/images/alumni-logos/Inner_Mongolia_Normal_University.png": {
    "white": true
  },
  "/images/alumni-logos/KIGAM.jpg": {
    "white": true,
    "crop": [
      530,
      391,
      78,
      132,
      374,
      124
    ]
  },
  "/images/alumni-logos/KIST.png": {
    "white": true,
    "crop": [
      219,
      52,
      0,
      0,
      62,
      52
    ]
  },
  "/images/alumni-logos/KOPRI.png": {
    "white": true,
    "crop": [
      344,
      90,
      8,
      0,
      329,
      83
    ]
  },
  "/images/alumni-logos/KRICT.svg": {
    "white": true,
    "crop": [
      841.9,
      100,
      0,
      0,
      330,
      100
    ]
  },
  "/images/alumni-logos/Korea_Science_Academy.png": {
    "white": true,
    "crop": [
      360,
      96,
      0,
      0,
      115,
      96
    ]
  },
  "/images/alumni-logos/Korea_University.png": {
    "white": true
  },
  "/images/alumni-logos/Kyungpook_National_University.jpg": {
    "white": true
  },
  "/images/alumni-logos/LX_MMA.png": {
    "white": true
  },
  "/images/alumni-logos/Nanjing_Tech_University.png": {
    "white": true,
    "crop": [
      700,
      239,
      0,
      0,
      205,
      239
    ]
  },
  "/images/alumni-logos/Pukyong_National_University.png": {
    "white": true,
    "crop": [
      336,
      61,
      0,
      0,
      62,
      61
    ]
  },
  "/images/alumni-logos/Research_Center_for_Eco_Environmental_Sciences_CAS.png": {
    "white": true
  },
  "/images/alumni-logos/Samsung_Electronics.png": {
    "white": true,
    "crop": [
      1600,
      425,
      104,
      104,
      1389,
      214
    ]
  },
  "/images/alumni-logos/Seoul_National_University.png": {
    "white": true
  },
  "/images/alumni-logos/Shandong_University.png": {
    "white": true,
    "crop": [
      384,
      225,
      0,
      0,
      226,
      225
    ]
  },
  "/images/alumni-logos/SK_Innovation.svg": {
    "white": true
  },
  "/images/alumni-logos/Sookmyung_Womens_University.png": {
    "white": true
  },
  "/images/alumni-logos/Sungshin_Womens_University.png": {
    "white": true
  },
  "/images/alumni-logos/Tianjin_University.png": {
    "white": true,
    "crop": [
      372,
      350,
      35,
      35,
      300,
      300
    ]
  },
  "/images/alumni-logos/University_of_Hyderabad.jpg": {
    "white": true
  },
  "/images/alumni-logos/University_of_South_China.png": {
    "white": true,
    "crop": [
      290,
      80,
      0,
      0,
      80,
      80
    ]
  },
  "/images/alumni-logos/Yonsei_University.png": {
    "white": true
  }
};
