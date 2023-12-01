export const sourceTypes = [
  {
    value: 'journal',
    text: 'Lehtiartikkeli'
  },
  {
    value: 'book',
    text: 'Artikkeli kokoomateoksessa'
  }
];

export const searchTypes = [
  {
    value: 'title',
    text: 'Nimeke'
  },
  {
    value: 'melinda',
    text: 'Melinda-ID'
  },
  {
    value: 'issn',
    text: 'ISSN'
  },
  {
    value: 'isbn',
    text: 'ISBN'
  }
];

export const searchFilters = [
  {
    value: 'filter-arto',
    text: 'Arto-tietueet'
  },
  {
    value: 'filter-arto-fennica',
    text: 'Arto- ja Fennica-tietueet'
  },
  {
    value: 'filter-arto-fennica-melinda',
    text: 'Arto-, Fennica- ja Melinda-tietueet'
  }
];

// https://wiki.eduuni.fi/display/cscsuorat/7.5+Julkaisutyypit+2021
export const articleTypesBooks = [
  {
    value: 'A3 - Vertaisarvioitu kirjan tai muun kokoomateoksen osa',
    text: 'A3 - Vertaisarvioitu kirjan tai muun kokoomateoksen osa'
  },
  {
    value: 'B2 - (Vertaisarvioimaton) tieteellisen kirjan tai muun kokoomateoksen osa',
    text: 'B2 - (Vertaisarvioimaton) tieteellisen kirjan tai muun kokoomateoksen osa'
  },
  {
    value: 'D2 - Artikkeli ammatillisessa kokoomateoksessa',
    text: 'D2 - Artikkeli ammatillisessa kokoomateoksessa'
  }
];

// https://wiki.eduuni.fi/display/cscsuorat/7.5+Julkaisutyypit+2021
export const articleTypesJournal = [
  {
    value: 'A1 - Vertaisarvioitu alkuperäisartikkeli tieteellisessä aikakauslehdessä',
    text: 'A1 - Vertaisarvioitu alkuperäisartikkeli tieteellisessä aikakauslehdessä'
  },
  {
    value: 'A2 - Vertaisarvioitu katsausartikkeli tieteellisessä aikakauslehdessä',
    text: 'A2 - Vertaisarvioitu katsausartikkeli tieteellisessä aikakauslehdessä'
  },
  {
    value: 'B1 - Kirjoitus tieteellisessä aikakauslehdessä',
    text: 'B1 - Kirjoitus tieteellisessä aikakauslehdessä'
  },
  {
    value: 'D1 - Artikkeli ammattilehdessä',
    text: 'D1 - Artikkeli ammattilehdessä'
  },
  {
    value: 'E1 - Yleistajuinen artikkeli, sanomalehtiartikkeli',
    text: 'E1 - Yleistajuinen artikkeli, sanomalehtiartikkeli'
  }
];

export const authorRelators = [
  {
    value: 'kirjoittaja',
    text: 'Kirjoittaja'
  },
  {
    value: 'kuvittaja',
    text: 'Kuvittaja'
  },
  {
    value: 'kääntäjä',
    text: 'Kääntäjä'
  },
  {
    value: 'toimittaja',
    text: 'Toimittaja'
  },
  {
    value: 'yhteisö',
    text: 'Yhteisö'
  }
];

export const ontologyTypes = [
  {
    value: 'yso',
    text: 'YSO - Yleinen suomalainen ontologia'
  },
  {
    value: 'ysoPaikat',
    text: 'YSO-paikat'
  },
  {
    value: 'ysoAika',
    text: 'YSO-aika'
  },
  {
    value: 'kanto',
    text: 'KANTO - Kansalliset toimijatiedot'
  },
  {
    value: 'slm',
    text: 'SLM - Suomalainen lajityyppi- ja muotosanasto'
  },
  {
    value: 'allfo',
    text: 'ALLFO - Allmän finländsk ontologi '
  },
  {
    value: 'allfoOrter',
    text: 'ALLFO-orter'
  },
  {
    value: 'allfoTid',
    text: 'ALLFO-tid'
  },
  {
    value: 'fgf',
    text: 'FGF - Finländsk genre- och formlista '
  },
  {
    value: 'afo',
    text: 'AFO - Luonnonvara- ja ympäristöontologia'
  },
  {
    value: 'kassu',
    text: 'Kassu - Kasvien suomenkieliset nimet'
  },
  {
    value: 'koko',
    text: 'KOKO-ontologia'
  },
  {
    value: 'finmesh',
    text: 'MeSH / FinMeSH'
  },
  {
    value: 'maotao',
    text: 'MAO/TAO - Museoalan ja taideteollisuusalan ontologia'
  },
  {
    value: 'other',
    text: 'Muu'
  },
  {
    value: 'otherPerson',
    text: 'Muu - Henkilö'
  },
  {
    value: 'otherCommunity',
    text: 'Muu - Yhteisö'
  },
  {
    value: 'otherTime',
    text: 'Muu - Aikamääre'
  }
];

export const languages = [
  {
    value: 'fi;fin;Suomi',
    text: 'Suomi'
  },
  {
    value: 'en;eng;Englanti',
    text: 'Englanti'
  },
  {
    value: 'sv;swe;Ruotsi',
    text: 'Ruotsi'
  },
  {
    value: 'es;esp;Espanja',
    text: 'Espanja'
  },
  {
    value: 'it;ita;Italia',
    text: 'Italia'
  },
  {
    value: 'no;nor;Norja',
    text: 'Norja'
  },
  {
    value: 'fr;fre;Ranska',
    text: 'Ranska'
  },
  {
    value: 'de;ger;Saksa',
    text: 'Saksa'
  },
  {
    value: 'da;dan;Tanska',
    text: 'Tanska'
  },
  {
    value: 'ru;rus;Venäjä',
    text: 'Venäjä'
  },
  {
    value: 'et;est;Viro',
    text: 'Viro'
  },
  {
    value: 'smn;smn;Inarinsaame',
    text: 'Inarinsaame'
  },
  {
    value: 'sme;sme;Pohj.saame',
    text: 'Pohjoissaame'
  },
  {
    value: 'smi;smi;Muu saam.',
    text: 'Muu saame'
  },
  {
    value: 'krl;krl;Karjala',
    text: 'Karjala'
  }
];

export const ccLicenses = [
  {
    value: 'CC BY 4.0',
    text: 'CC BY 4.0'
  },
  {
    value: 'CC BY-NC 4.0',
    text: 'CC BY-NC 4.0'
  },
  {
    value: 'CC BY-NC-ND 4.0',
    text: 'CC BY-NC-ND 4.0'
  },
  {
    value: 'CC BY-NC-SA 4.0',
    text: 'CC BY-NC-SA 4.0'
  },
  {
    value: 'CC BY-ND 4.0',
    text: 'CC BY-ND 4.0'
  },
  {
    value: 'CC BY-SA 4.0',
    text: 'CC BY-SA 4.0'
  },
  {
    value: 'CC0 1.0',
    text: 'CC0 1.0'
  },
  {
    value: 'Public Domain 1.0',
    text: 'Public Domain 1.0'
  }
]

// https://wiki.eduuni.fi/display/cscsuorat/7.3+Tieteenalaluokitus+2021
export const sciences = [
  {
    value: '1 - Luonnontieteet - 111 - Matematiikka',
    text: ''
  },
  {
    value: '1 - Luonnontieteet - 112 - Tilastotiede',
    text: ''
  },
  {
    value: '1 - Luonnontieteet - 113 - Tietojenkäsittely ja informaatiotieteet',
    text: ''
  },
  {
    value: '1 - Luonnontieteet - 114 - Fysiikka',
    text: ''
  },
  {
    value: '1 - Luonnontieteet - 115 - Avaruustieteet ja tähtitiede',
    text: ''
  },
  {
    value: '1 - Luonnontieteet - 116 - Kemia',
    text: ''
  },
  {
    value: '1 - Luonnontieteet - 1171 - Geotieteet',
    text: ''
  },
  {
    value: '1 - Luonnontieteet - 1172 - Ympäristötiede',
    text: ''
  },
  {
    value: '1 - Luonnontieteet - 1181 - Ekologia, evoluutiobiologia',
    text: ''
  },
  {
    value: '1 - Luonnontieteet - 1182 - Biokemia, solu- ja molekyylibiologia',
    text: ''
  },
  {
    value: '1 - Luonnontieteet - 1183 - Kasvibiologia, mikrobiologia, virologia',
    text: ''
  },
  {
    value: '1 - Luonnontieteet - 1184 - Genetiikka, kehitysbiologia, fysiologia',
    text: ''
  },
  {
    value: '1 - Luonnontieteet - 119 - Muut luonnontieteet',
    text: ''
  },
  {
    value: '2 - Tekniikka - 211 - Arkkitehtuuri',
    text: ''
  },
  {
    value: '2 - Tekniikka - 212 - Rakennus- ja yhdyskuntatekniikka',
    text: ''
  },
  {
    value: '2 - Tekniikka - 213 - Sähkö-, automaatio- ja tietoliikennetekniikka, elektroniikka',
    text: ''
  },
  {
    value: '2 - Tekniikka - 214 - Kone- ja valmistustekniikka',
    text: ''
  },
  {
    value: '2 - Tekniikka - 215 - Teknillinen kemia, kemian prosessitekniikka',
    text: ''
  },
  {
    value: '2 - Tekniikka - 216 - Materiaalitekniikka',
    text: ''
  },
  {
    value: '2 - Tekniikka - 217 - Lääketieteen tekniikka',
    text: ''
  },
  {
    value: '2 - Tekniikka - 218 - Ympäristötekniikka',
    text: ''
  },
  {
    value: '2 - Tekniikka - 219 - Ympäristön bioteknologia',
    text: ''
  },
  {
    value: '2 - Tekniikka - 220 - Teollinen bioteknologia',
    text: ''
  },
  {
    value: '2 - Tekniikka - 221 - Nanoteknologia',
    text: ''
  },
  {
    value: '2 - Tekniikka - 222 - Muu tekniikka',
    text: ''
  },
  {
    value: '3 - Lääke- ja terveystieteet - 3111 - Biolääketieteet',
    text: ''
  },
  {
    value: '3 - Lääke- ja terveystieteet - 3112 - Neurotieteet',
    text: ''
  },
  {
    value: '3 - Lääke- ja terveystieteet - 3121 - Yleislääketiede, sisätaudit ja muut kliiniset lääketieteet',
    text: ''
  },
  {
    value: '3 - Lääke- ja terveystieteet - 3122 - Syöpätaudit',
    text: ''
  },
  {
    value: '3 - Lääke- ja terveystieteet - 3123 - Naisten- ja lastentaudit',
    text: ''
  },
  {
    value: '3 - Lääke- ja terveystieteet - 3124 - Neurologia ja psykiatria',
    text: ''
  },
  {
    value: '3 - Lääke- ja terveystieteet - 3125 - Korva-, nenä- ja kurkkutaudit, silmätaudit',
    text: ''
  },
  {
    value: '3 - Lääke- ja terveystieteet - 3126 - Kirurgia, anestesiologia, tehohoito, radiologia',
    text: ''
  },
  {
    value: '3 - Lääke- ja terveystieteet - 313 - Hammaslääketieteet',
    text: ''
  },
  {
    value: '3 - Lääke- ja terveystieteet - 3141 - Terveystiede',
    text: ''
  },
  {
    value: '3 - Lääke- ja terveystieteet - 3142 - Kansanterveystiede, ympäristö ja työterveys',
    text: ''
  },
  {
    value: '3 - Lääke- ja terveystieteet - 315 - Liikuntatiede',
    text: ''
  },
  {
    value: '3 - Lääke- ja terveystieteet - 316 - Hoitotiede',
    text: ''
  },
  {
    value: '3 - Lääke- ja terveystieteet - 317 - Farmasia',
    text: ''
  },
  {
    value: '3 - Lääke- ja terveystieteet - 318 - Lääketieteen bioteknologia',
    text: ''
  },
  {
    value: '3 - Lääke- ja terveystieteet - 319 - Oikeuslääketiede ja muut lääketieteet',
    text: ''
  },
  {
    value: '4 - Maatalous- ja metsätieteet - 4111 - Maataloustiede',
    text: ''
  },
  {
    value: '4 - Maatalous- ja metsätieteet - 4112 - Metsätiede',
    text: ''
  },
  {
    value: '4 - Maatalous- ja metsätieteet - 412 - Kotieläintiede, maitotaloustiede',
    text: ''
  },
  {
    value: '4 - Maatalous- ja metsätieteet - 413 - Eläinlääketiede',
    text: ''
  },
  {
    value: '4 - Maatalous- ja metsätieteet - 414 - Maatalouden bioteknologia',
    text: ''
  },
  {
    value: '4 - Maatalous- ja metsätieteet - 415 - Muut maataloustieteet',
    text: ''
  },
  {
    value: '5 - Yhteiskuntatieteet - 511 - Kansantaloustiede',
    text: ''
  },
  {
    value: '5 - Yhteiskuntatieteet - 512 - Liiketaloustiede',
    text: ''
  },
  {
    value: '5 - Yhteiskuntatieteet - 513 - Oikeustiede',
    text: ''
  },
  {
    value: '5 - Yhteiskuntatieteet - 5141 - Sosiologia',
    text: ''
  },
  {
    value: '5 - Yhteiskuntatieteet - 5142 - Sosiaali- ja yhteiskuntapolitiikka',
    text: ''
  },
  {
    value: '5 - Yhteiskuntatieteet - 515 - Psykologia',
    text: ''
  },
  {
    value: '5 - Yhteiskuntatieteet - 516 - Kasvatustieteet',
    text: ''
  },
  {
    value: '5 - Yhteiskuntatieteet - 517 - Valtio-oppi, hallintotiede',
    text: ''
  },
  {
    value: '5 - Yhteiskuntatieteet - 518 - Media- ja viestintätieteet',
    text: ''
  },
  {
    value: '5 - Yhteiskuntatieteet - 519 - Yhteiskuntamaantiede, talousmaantiede',
    text: ''
  },
  {
    value: '5 - Yhteiskuntatieteet - 520 - Muut yhteiskuntatieteet',
    text: ''
  },
  {
    value: '6 - Humanistiset tieteet - 611 - Filosofia',
    text: ''
  },
  {
    value: '6 - Humanistiset tieteet - 6121 - Kielitieteet',
    text: ''
  },
  {
    value: '6 - Humanistiset tieteet - 6122 - Kirjallisuuden tutkimus',
    text: ''
  },
  {
    value: '6 - Humanistiset tieteet - 6131 - Teatteri, tanssi, musiikki, muut esittävät taiteet',
    text: ''
  },
  {
    value: '6 - Humanistiset tieteet - 6132 - Kuvataide ja muotoilu',
    text: ''
  },
  {
    value: '6 - Humanistiset tieteet - 614 - Teologia',
    text: ''
  },
  {
    value: '6 - Humanistiset tieteet - 615 - Historia ja arkeologia',
    text: ''
  },
  {
    value: '6 - Humanistiset tieteet - 616 - Muut humanistiset tieteet',
    text: ''
  }
];

// https://wiki.eduuni.fi/display/cscsuorat/7.6+Tutkimuslaitosten+ja+yliopistollisten+sairaaloiden+organisaatiotunnukset+2022
// https://wiki.eduuni.fi/display/cscsuorat/7.1+Korkeakoulujen+oppilaitosnumerot+2022
// Latest update: 24.8.2023 (MUU-384)
export const organizations = [
  {value: 'Aalto yliopisto', text: '', code: '10076'},
  {value: 'Centria-ammattikorkeakoulu', text: '', code: '02536'},
  {value: 'Diakonia-ammattikorkeakoulu', text: '', code: '02623'},
  {value: 'Geologian tutkimuskeskus', text: '', code: '5040011'},
  {value: 'Haaga-Helia ammattikorkeakoulu', text: '', code: '10056'},
  {value: 'Helsingin seudun yliopistollisen keskussairaalan erityisvastuualue', text: '', code: '15675350'},
  {value: 'Helsingin yliopisto', text: '', code: '01901'},
  {value: 'Humanistinen ammattikorkeakoulu', text: '', code: '02631'},
  {value: 'Hämeen ammattikorkeakoulu', text: '', code: '02467'},
  {value: 'Ilmatieteen laitos', text: '', code: '4940015'},
  {value: 'Itä-Suomen yliopisto', text: '', code: '10088'},
  {value: 'Jyväskylän ammattikorkeakoulu', text: '', code: '02504'},
  {value: 'Jyväskylän yliopisto', text: '', code: '01906'},
  {value: 'Kaakkois-Suomen ammattikorkeakoulu', text: '', code: '10118'},
  {value: 'Kajaanin ammattikorkeakoulu', text: '', code: '02473'},
  {value: 'Karelia-ammattikorkeakoulu', text: '', code: '02469'},
  {value: 'Kuopion yliopistollisen sairaalan erityisvastuualue', text: '', code: '01714953'},
  {value: 'LAB-ammattikorkeakoulu', text: '', code: '10126'},
  {value: 'Lapin ammattikorkeakoulu', text: '', code: '10108'},
  {value: 'Lapin yliopisto', text: '', code: '01918'},
  {value: 'Lappeenrannan-Lahden teknillinen yliopisto LUT', text: '', code: '01914'},
  {value: 'Laurea-ammattikorkeakoulu', text: '', code: '02629'},
  {value: 'Luonnonvarakeskus', text: '', code: '4100010'},
  {value: 'Lääkealan turvallisuus- ja kehittämiskeskus', text: '', code: '558005'},
  {value: 'Maanmittauslaitos', text: '', code: '4020217'},
  {value: 'Metropolia ammattikorkeakoulu', text: '', code: '10065'},
  {value: 'Oulun ammattikorkeakoulu', text: '', code: '02471'},
  {value: 'Oulun yliopisto', text: '', code: '01904'},
  {value: 'Oulun yliopistollisen sairaalan erityisvastuualue', text: '', code: '06794809'},
  {value: 'Poliisiammattikorkeakoulu', text: '', code: '02557'},
  {value: 'Ruokavirasto', text: '', code: '430001'},
  {value: 'Satakunnan ammattikorkeakoulu', text: '', code: '02507'},
  {value: 'Savonia-ammattikorkeakoulu', text: '', code: '02537'},
  {value: 'Seinäjoen ammattikorkeakoulu', text: '', code: '02472'},
  {value: 'Suomen Pankki', text: '', code: '02022481'},
  {value: 'Suomen ympäristökeskus', text: '', code: '7020017'},
  {value: 'Svenska handelshögskolan', text: '', code: '01910'},
  {value: 'Säteilyturvakeskus', text: '', code: '5550012'},
  {value: 'Taideyliopisto', text: '', code: '10103'},
  {value: 'Tampereen ammattikorkeakoulu', text: '', code: '02630'},
  {value: 'Tampereen yliopisto', text: '', code: '10122'},
  {value: 'Tampereen yliopistollisen sairaalan erityisvastuualue', text: '', code: '08265978'},
  {value: 'Teknologian tutkimuskeskus VTT Oy', text: '', code: '26473754'},
  {value: 'Terveyden ja hyvinvoinnin laitos', text: '', code: '5610017'},
  {value: 'Turun ammattikorkeakoulu', text: '', code: '02509'},
  {value: 'Turun yliopisto', text: '', code: '10089'},
  {value: 'Turun yliopistollisen keskussairaalan erityisvastuualue', text: '', code: '08282559'},
  {value: 'Työterveyslaitos', text: '', code: '02202669'},
  {value: 'Ulkopoliittinen instituutti', text: '', code: '1120017'},
  {value: 'Vaasan ammattikorkeakoulu', text: '', code: '02627'},
  {value: 'Vaasan yliopisto  ', text: '', code: '01913'},
  {value: 'Valtion taloudellinen tutkimuskeskus', text: '', code: '3060016'},
  {value: 'Yrkeshögskolan Arcada', text: '', code: '02535'},
  {value: 'Yrkeshögskolan Novia', text: '', code: '10066'},
  {value: 'Åbo Akademi', text: '', code: '01903'},
];

export const sectionOrColumnList = [
  {
    value: 'Artikkelit',
    text: ''
  },
  {
    value: 'Kirjallisuus',
    text: ''
  },
  {
    value: 'Muut',
    text: ''
  },
  {
    value: 'Vertaisarvioidut artikkelit',
    text: ''
  }
];

export const journalTemplate = {
  authors: [
    {
      asteriId: '000001234',
      lastName: 'Malliyhteisö',
      organisations: [],
      relator: 'yhteisö'
    }
  ],
  isElectronic: false,
  isbns: [],
  issns: ['0123-4567'],
  notices: [],
  publisherInfo: {
    publisher: 'Mallijulkaisija',
    publisherLocation: 'Helsinki',
    publisherYears: {
      start: '2022',
      end: '2023'
    }
  },
  publishing: 'Helsinki : Mallijulkaisija, 2022-2023.',
  recordType: 'Kausijulkaisu',
  simpleElements: {
    articleLanguage: ['mul'],
    articleReference: [],
    articleSciences: [],
    f600s: [],
    f610s: [],
    f648s: [],
    f650s: [],
    f651s: [],
    f653s: [],
    f655s: [],
    localNotes598: [],
    methodology: [],
    noteGeneral: [],
    referenceLink: [],
    titleOther: [
      'Testijulkaisu',
      'Test publikation'
    ]
  },
  simpleGroups: {
    abstract: {
      language: [],
      term: []
    },
    localNotes599: [],
    otherClassificationNumber: [],
    universalDecimalClassificationNumber: []
  },
  sourceIds: ['(FI-MELINDA)001234567'],
  sourceType: 'nnas',
  title: 'Mallijulkaisu',
  years: '2022-2023.'
};

export const bookTemplate = {
  authors: [
    {
      asteriId: '000004321',
      firstName: 'Malli',
      lastName: 'Mallailija',
      organisations: [],
      relator: 'kirjoittaja'
    }
  ],
  isElectronic: false,
  isbns: ['123-45-6789-0'],
  issns: [],
  notices: [],
  publisherInfo: {
    publisher: 'Helsingin Mallijulkaisijat ry',
    publisherLocation: 'Helsinki',
    publisherYears: {
      start: '2023'
    }
  },
  publishing: 'Helsinki : Helsingin Mallijulkaisijat ry, 2023',
  recordType: 'Monografia',
  simpleElements: {
    articleLanguage: ['fin'],
    articleReference: [],
    articleSciences: [],
    f600s: [],
    f610s: [],
    f648s: [],
    f650s: [],
    f651s: [],
    f653s: [],
    f655s: [],
    localNotes598: [],
    methodology: [],
    noteGeneral: [],
    referenceLink: [],
    titleOther: []
  },
  simpleGroups: {
    abstract: {
      language: [],
      term: []
    },
    localNotes599: [],
    otherClassificationNumber: [],
    universalDecimalClassificationNumber: []
  },
  sourceIds: ['(FI-MELINDA)007654321'],
  sourceType: 'nnam',
  title: 'Kirjamalli',
  years: '2023'
};
