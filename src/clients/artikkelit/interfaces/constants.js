export const sourceTypes = [
  {
    value: "journal",
    text: "Lehtiartikkeli"
  },
  {
    value: "book",
    text: "Artikkeli kokoomateoksessa"
  }
]

export const searchTypes = [
  {
    value: "title",
    text: "Julkaisun nimellä"
  },
  {
    value: "melinda",
    text: "Melinda-ID"
  },
  {
    value: "issn",
    text: "ISSN"
  },
  {
    value: "isbn",
    text: "ISBN"
  }
]

// https://wiki.eduuni.fi/display/cscsuorat/7.5+Julkaisutyypit+2021
export const articleTypesBooks = [
  {
    value: "A3 - Vertaisarvioitu kirjan tai muun kokoomateoksen osa",
    text: "A3 - Vertaisarvioitu kirjan tai muun kokoomateoksen osa"
  },
  {
    value: "B2 - (Vertaisarvioimaton) tieteellisen kirjan tai muun kokoomateoksen osa",
    text: "B2 - (Vertaisarvioimaton) tieteellisen kirjan tai muun kokoomateoksen osa"
  },
  {
    value: "D2 - Artikkeli ammatillisessa kokoomateoksessa",
    text: "D2 - Artikkeli ammatillisessa kokoomateoksessa"
  } 
]

// https://wiki.eduuni.fi/display/cscsuorat/7.5+Julkaisutyypit+2021
export const articleTypesJournal = [
  {
    value: "A1 - Vertaisarvioitu alkuperäisartikkeli tieteellisessä aikakauslehdessä",
    text: "A1 - Vertaisarvioitu alkuperäisartikkeli tieteellisessä aikakauslehdessä"
  },
  {
    value: "A2 - Vertaisarvioitu katsausartikkeli tieteellisessä aikakauslehdessä",
    text: "A2 - Vertaisarvioitu katsausartikkeli tieteellisessä aikakauslehdessä"
  },
  {
    value: "B1 - Kirjoitus tieteellisessä aikakauslehdessä",
    text: "B1 - Kirjoitus tieteellisessä aikakauslehdessä"
  },
  {
    value: "D1 - Artikkeli ammattilehdessä",
    text: "D1 - Artikkeli ammattilehdessä"
  },
  {
    value: "E1 - Yleistajuinen artikkeli, sanomalehtiartikkeli",
    text: "E1 - Yleistajuinen artikkeli, sanomalehtiartikkeli"
  }
]

export const authorRelators = [
  {
    value: "kirjoittaja",
    text: "Kirjoittaja"
  },
  {
    value: "kuvittaja",
    text: "Kuvittaja"
  },
  {
    value: "kääntäjä",
    text: "Kääntäjä"
  },
  {
    value: "toimittaja",
    text: "Toimittaja"
  },
  {
    value: "yhteisö",
    text: "Yhteisö"
  }
]

export const ontologyTypes = [
  {
    value: "yso",
    text: "YSO - Yleinen suomalainen ontologia"
  },
  {
    value: "ysoPaikat",
    text: "YSO-paikat"
  },
  {
    value: "ysoAika",
    text: "YSO-aika"
  },
  {
    value: "yhteiso",
    text: "Suomalaiset yhteisönimet"
  },
  {
    value: "slm",
    text: "SLM - Suomalainen lajityyppi- ja muotosanasto"
  },
  {
    value: "allfo",
    text: "ALLFO - Allmän finländsk ontologi "
  },
  {
    value: "allfoOrter",
    text: "ALLFO-orter"
  },
  {
    value: "allfoTid",
    text: "ALLFO-tid"
  },
  {
    value: "fgf",
    text: "FGF - Finländsk genre- och formlista "
  },
  {
    value: "afo",
    text: "AFO - Luonnonvara- ja ympäristöontologia"
  },
  {
    value: "kassu",
    text: "Kassu - Kasvien suomenkieliset nimet"
  },
  {
    value: "soto",
    text: "SOTO - Sotatieteen ontologia"
  },
  {
    value: "finmesh",
    text: "MeSH / FinMeSH"
  },
  {
    value: "maotao",
    text: "MAO/TAO - Museoalan ja taideteollisuusalan ontologia"
  },
  {
    value: "other",
    text: "Muu"
  },
  {
    value: "otherPerson",
    text: "Muu - Henkilö"
  },
  {
    value: "otherCommunity",
    text: "Muu - Yhteisö"
  },
  {
    value: "otherTime",
    text: "Muu - Aikamääre"
  }
]

export const languages = [
  {
    value: "fi;fin;Suomi",
    text: "Suomi"
  },
  {
    value: "en;eng;Englanti",
    text: "Englanti"
  },
  {
    value: "sv;swe;Ruotsi",
    text: "Ruotsi"
  },
  {
    value: "es;esp;Espanja",
    text: "Espanja"
  },
  {
    value: "it;ita;Italia",
    text: "Italia"
  },
  {
    value: "no;nor;Norja",
    text: "Norja"
  },
  {
    value: "fr;fre;Ranska",
    text: "Ranska"
  },
  {
    value: "de;ger;Saksa",
    text: "Saksa"
  },
  {
    value: "da;dan;Tanska",
    text: "Tanska"
  },
  {
    value: "ru;rus;Venäjä",
    text: "Venäjä"
  },
  {
    value: "et;est;Viro",
    text: "Viro"
  },
  {
    value: "smn;smn;Inarinsaame",
    text: "Inarinsaame"
  },
  {
    value: "sme;sme;Pohj.saame",
    text: "Pohjoissaame"
  },
  {
    value: "smi;smi;Muu saam.",
    text: "Muu saame"
  },
  {
    value: "krl;krl;Karjala",
    text: "Karjala"
  }
]

// https://wiki.eduuni.fi/display/cscsuorat/7.3+Tieteenalaluokitus+2021
export const sciences = [
  {
    value: "1 - Luonnontieteet - 111 - Matematiikka",
    text: ""
  },
  {
    value: "1 - Luonnontieteet - 112 - Tilastotiede",
    text: ""
  },
  {
    value: "1 - Luonnontieteet - 113 - Tietojenkäsittely ja informaatiotieteet",
    text: ""
  },
  {
    value: "1 - Luonnontieteet - 114 - Fysiikka",
    text: ""
  },
  {
    value: "1 - Luonnontieteet - 115 - Avaruustieteet ja tähtitiede",
    text: ""
  },
  {
    value: "1 - Luonnontieteet - 116 - Kemia",
    text: ""
  },
  {
    value: "1 - Luonnontieteet - 1171 - Geotieteet",
    text: ""
  },
  {
    value: "1 - Luonnontieteet - 1172 - Ympäristötiede",
    text: ""
  },
  {
    value: "1 - Luonnontieteet - 1181 - Ekologia, evoluutiobiologia",
    text: ""
  },
  {
    value: "1 - Luonnontieteet - 1182 - Biokemia, solu- ja molekyylibiologia",
    text: ""
  },
  {
    value: "1 - Luonnontieteet - 1183 - Kasvibiologia, mikrobiologia, virologia",
    text: ""
  },
  {
    value: "1 - Luonnontieteet - 1184 - Genetiikka, kehitysbiologia, fysiologia",
    text: ""
  },
  {
    value: "1 - Luonnontieteet - 119 - Muut luonnontieteet",
    text: ""
  },
  {
    value: "2 - Tekniikka - 211 - Arkkitehtuuri",
    text: ""
  },
  {
    value: "2 - Tekniikka - 212 - Rakennus- ja yhdyskuntatekniikka",
    text: ""
  },
  {
    value: "2 - Tekniikka - 213 - Sähkö-, automaatio- ja tietoliikennetekniikka, elektroniikka",
    text: ""
  },
  {
    value: "2 - Tekniikka - 214 - Kone- ja valmistustekniikka",
    text: ""
  },
  {
    value: "2 - Tekniikka - 215 - Teknillinen kemia, kemian prosessitekniikka",
    text: ""
  },
  {
    value: "2 - Tekniikka - 216 - Materiaalitekniikka",
    text: ""
  },
  {
    value: "2 - Tekniikka - 217 - Lääketieteen tekniikka",
    text: ""
  },
  {
    value: "2 - Tekniikka - 218 - Ympäristötekniikka",
    text: ""
  },
  {
    value: "2 - Tekniikka - 219 - Ympäristön bioteknologia",
    text: ""
  },
  {
    value: "2 - Tekniikka - 220 - Teollinen bioteknologia",
    text: ""
  },
  {
    value: "2 - Tekniikka - 221 - Nanoteknologia",
    text: ""
  },
  {
    value: "2 - Tekniikka - 222 - Muu tekniikka",
    text: ""
  },
  {
    value: "3 - Lääke- ja terveystieteet - 3111 - Biolääketieteet",
    text: ""
  },
  {
    value: "3 - Lääke- ja terveystieteet - 3112 - Neurotieteet",
    text: ""
  },
  {
    value: "3 - Lääke- ja terveystieteet - 3121 - Yleislääketiede, sisätaudit ja muut kliiniset lääketieteet",
    text: ""
  },
  {
    value: "3 - Lääke- ja terveystieteet - 3122 - Syöpätaudit",
    text: ""
  },
  {
    value: "3 - Lääke- ja terveystieteet - 3123 - Naisten- ja lastentaudit",
    text: ""
  },
  {
    value: "3 - Lääke- ja terveystieteet - 3124 - Neurologia ja psykiatria",
    text: ""
  },
  {
    value: "3 - Lääke- ja terveystieteet - 3125 - Korva-, nenä- ja kurkkutaudit, silmätaudit",
    text: ""
  },
  {
    value: "3 - Lääke- ja terveystieteet - 3126 - Kirurgia, anestesiologia, tehohoito, radiologia",
    text: ""
  },
  {
    value: "3 - Lääke- ja terveystieteet - 313 - Hammaslääketieteet",
    text: ""
  },
  {
    value: "3 - Lääke- ja terveystieteet - 3141 - Terveystiede",
    text: ""
  },
  {
    value: "3 - Lääke- ja terveystieteet - 3142 - Kansanterveystiede, ympäristö ja työterveys",
    text: ""
  },
  {
    value: "3 - Lääke- ja terveystieteet - 315 - Liikuntatiede",
    text: ""
  },
  {
    value: "3 - Lääke- ja terveystieteet - 316 - Hoitotiede",
    text: ""
  },
  {
    value: "3 - Lääke- ja terveystieteet - 317 - Farmasia",
    text: ""
  },
  {
    value: "3 - Lääke- ja terveystieteet - 318 - Lääketieteen bioteknologia",
    text: ""
  },
  {
    value: "3 - Lääke- ja terveystieteet - 319 - Oikeuslääketiede ja muut lääketieteet",
    text: ""
  },
  {
    value: "4 - Maatalous- ja metsätieteet - 4111 - Maataloustiede",
    text: ""
  },
  {
    value: "4 - Maatalous- ja metsätieteet - 4112 - Metsätiede",
    text: ""
  },
  {
    value: "4 - Maatalous- ja metsätieteet - 412 - Kotieläintiede, maitotaloustiede",
    text: ""
  },
  {
    value: "4 - Maatalous- ja metsätieteet - 413 - Eläinlääketiede",
    text: ""
  },
  {
    value: "4 - Maatalous- ja metsätieteet - 414 - Maatalouden bioteknologia",
    text: ""
  },
  {
    value: "4 - Maatalous- ja metsätieteet - 415 - Muut maataloustieteet",
    text: ""
  },
  {
    value: "5 - Yhteiskuntatieteet - 511 - Kansantaloustiede",
    text: ""
  },
  {
    value: "5 - Yhteiskuntatieteet - 512 - Liiketaloustiede",
    text: ""
  },
  {
    value: "5 - Yhteiskuntatieteet - 513 - Oikeustiede",
    text: ""
  },
  {
    value: "5 - Yhteiskuntatieteet - 5141 - Sosiologia",
    text: ""
  },
  {
    value: "5 - Yhteiskuntatieteet - 5142 - Sosiaali- ja yhteiskuntapolitiikka",
    text: ""
  },
  {
    value: "5 - Yhteiskuntatieteet - 515 - Psykologia",
    text: ""
  },
  {
    value: "5 - Yhteiskuntatieteet - 516 - Kasvatustieteet",
    text: ""
  },
  {
    value: "5 - Yhteiskuntatieteet - 517 - Valtio-oppi, hallintotiede",
    text: ""
  },
  {
    value: "5 - Yhteiskuntatieteet - 518 - Media- ja viestintätieteet",
    text: ""
  },
  {
    value: "5 - Yhteiskuntatieteet - 519 - Yhteiskuntamaantiede, talousmaantiede",
    text: ""
  },
  {
    value: "5 - Yhteiskuntatieteet - 520 - Muut yhteiskuntatieteet",
    text: ""
  },
  {
    value: "6 - Humanistiset tieteet - 611 - Filosofia",
    text: ""
  },
  {
    value: "6 - Humanistiset tieteet - 6121 - Kielitieteet",
    text: ""
  },
  {
    value: "6 - Humanistiset tieteet - 6122 - Kirjallisuuden tutkimus",
    text: ""
  },
  {
    value: "6 - Humanistiset tieteet - 6131 - Teatteri, tanssi, musiikki, muut esittävät taiteet",
    text: ""
  },
  {
    value: "6 - Humanistiset tieteet - 6132 - Kuvataide ja muotoilu",
    text: ""
  },
  {
    value: "6 - Humanistiset tieteet - 614 - Teologia",
    text: ""
  },
  {
    value: "6 - Humanistiset tieteet - 615 - Historia ja arkeologia",
    text: ""
  },
  {
    value: "6 - Humanistiset tieteet - 616 - Muut humanistiset tieteet",
    text: ""
  }
]

// https://wiki.eduuni.fi/display/cscsuorat/7.6+Tutkimuslaitosten+ja+yliopistollisten+sairaaloiden+organisaatiotunnukset+2021
// https://wiki.eduuni.fi/display/cscsuorat/7.1+Korkeakoulujen+oppilaitosnumerot+2021
// updated 21.3.2023
export const organizations = [
  {value: "Aalto yliopisto - 10076", text:""},
  {value: "Centria-ammattikorkeakoulu - 02536", text:""},
  {value: "Diakonia-ammattikorkeakoulu - 02623", text:""},
  {value: "Geologian tutkimuskeskus - 5040011", text:""},
  {value: "Haaga-Helia ammattikorkeakoulu - 10056", text:""},
  {value: "Helsingin seudun yliopistollisen keskussairaalan erityisvastuualue - 15675350", text:""},
  {value: "Helsingin yliopisto - 01901", text:""},
  {value: "Humanistinen ammattikorkeakoulu - 02631", text:""},
  {value: "Hämeen ammattikorkeakoulu - 02467", text:""},
  {value: "Ilmatieteen laitos - 4940015", text:""},
  {value: "Itä-Suomen yliopisto - 10088", text:""},
  {value: "Jyväskylän ammattikorkeakoulu - 02504", text:""},
  {value: "Jyväskylän yliopisto - 01906", text:""},
  {value: "Kaakkois-Suomen ammattikorkeakoulu - 10118", text:""},
  {value: "Kajaanin ammattikorkeakoulu - 02473", text:""},
  {value: "Karelia-ammattikorkeakoulu - 02469", text:""},
  {value: "Kuopion yliopistollisen sairaalan erityisvastuualue - 01714953", text:""},
  {value: "LAB-ammattikorkeakoulu - 10126", text:""},
  {value: "Lahden ammattikorkeakoulu - 02470", text:""},
  {value: "Lapin ammattikorkeakoulu - 10108", text:""},
  {value: "Lapin yliopisto  - 01918", text:""},
  {value: "Lappeenrannan-Lahden teknillinen yliopisto LUT - 01914", text:""},
  {value: "Laurea-ammattikorkeakoulu - 02629", text:""},
  {value: "Luonnonvarakeskus - 4100010", text:""},
  {value: "Lääkealan turvallisuus- ja kehittämiskeskus - 558005", text:""},
  {value: "Maanmittauslaitos - 4020217", text:""},
  {value: "Metropolia ammattikorkeakoulu - 10065", text:""},
  {value: "Oulun ammattikorkeakoulu - 02471", text:""},
  {value: "Oulun yliopisto - 01904", text:""},
  {value: "Oulun yliopistollisen sairaalan erityisvastuualue - 06794809", text:""},
  {value: "Poliisiammattikorkeakoulu - 02557", text:""},
  {value: "Ruokavirasto - 430001", text:""},
  {value: "Saimaan ammattikorkeakoulu - 02609", text:""},
  {value: "Satakunnan ammattikorkeakoulu - 02507", text:""},
  {value: "Savonia-ammattikorkeakoulu - 02537", text:""},
  {value: "Seinäjoen ammattikorkeakoulu - 02472", text:""},
  {value: "Suomen Pankki - 02022481", text:""},
  {value: "Suomen ympäristökeskus - 7020017", text:""},
  {value: "Svenska handelshögskolan - 01910", text:""},
  {value: "Säteilyturvakeskus - 5550012", text:""},
  {value: "Taideyliopisto - 10103", text:""},
  {value: "Tampereen ammattikorkeakoulu - 02630", text:""},
  {value: "Tampereen tekn. yliopisto - 01915", text:""},
  {value: "Tampereen yliopisto (uusi) - 10122", text:""},
  {value: "Tampereen yliopisto (vanha) - 01905", text:""},
  {value: "Tampereen yliopistollisen sairaalan erityisvastuualue - 08265978", text:""},
  {value: "Teknologian tutkimuskeskus VTT Oy - 26473754", text:""},
  {value: "Terveyden ja hyvinvoinnin laitos - 5610017", text:""},
  {value: "Turun ammattikorkeakoulu - 02509", text:""},
  {value: "Turun yliopisto - 10089", text:""},
  {value: "Turun yliopistollisen keskussairaalan erityisvastuualue - 08282559", text:""},
  {value: "Työterveyslaitos - 02202669", text:""},
  {value: "Ulkopoliittinen instituutti - 1120017", text:""},
  {value: "Vaasan ammattikorkeakoulu - 02627", text:""},
  {value: "Vaasan yliopisto - 01913", text:""},
  {value: "Valtion taloudellinen tutkimuskeskus - 3060016", text:""},
  {value: "Yrkeshögskolan Arcada - 02535", text:""},
  {value: "Yrkeshögskolan Novia - 10066", text:""},
  {value: "Åbo Akademi - 01903", text:""}  
]

// (https://finto.fi/mts/fi/page/m991)
export const reviewTypesList = [
  {
    value: "elokuva-arvostelu",
    text: "Elokuva-arvostelu"
  },
  {
    value: "kirja-arvostelu",
    text: "Kirja-arvostelu"
  },
  {
    value: "musiikkiarvostelu",
    text: "Musiikkiarvostelu"
  } ,
  {
    value: "sirkusarvostelu",
    text: "Sirkusarvostelu"
  },
  {
    value: "taidearvostelu",
    text: "Taidearvostelu"
  },
  {
    value: "tanssiarvostelu",
    text: "Tanssiarvostelu"
  },
  {
    value: "teatteriarvostelu",
    text: "Teatteriarvostelu"
  }
]

export const sectionOrColumnList = [
  {
    value: "Artikkelit",
    text: ""
  },
  {
    value: "Kirjallisuus",
    text: ""
  },
  {
    value: "Muut",
    text: ""
  },
  {
    value: "Vertaisarvioidut artikkelit",
    text: ""
  }
]

export const journalTemplate = {
  authors: [
    {
      asteriId: "000001234",
      lastName: "Malliyhteisö",
      organisations: [],
      relator: "yhteisö"
    }
  ],
  isElectronic: false,
  isbns: [],
  issns: [
    "0123-4567"
  ],
  notices: [],
  publisherInfo: {
    publisher: "Mallijulkaisija",
    publisherLocation: "Helsinki",
    publisherYears: {
      start: "2022",
      end: "2023"
    }
  },
  publishing: "Helsinki : Mallijulkaisija, 2022-2023.",
  recordType: "Kausijulkaisu",
  simpleElements: {
    articleLanguage: [
      "mul"
    ],
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
      "Testijulkaisu",
      "Test publikation"
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
  sourceIds: [
    "(FI-MELINDA)001234567"
  ],
  sourceType: "nnas",
  title: "Mallijulkaisu",
  years: "2022-2023."
}

export const bookTemplate = {
  authors: [
    {
      asteriId: "000004321",
      firstName: "Malli",
      lastName: "Mallailija",
      organisations: [],
      relator: "kirjoittaja"
    }
  ],
  isElectronic: false,
  isbns: [
    "123-45-6789-0"
  ],
  issns: [],
  notices: [],
  publisherInfo: {
    publisher: "Helsingin Mallijulkaisijat ry",
    publisherLocation: "Helsinki",
    publisherYears: {
      start: "2023"
    }
  },
  publishing: "Helsinki : Helsingin Mallijulkaisijat ry, 2023",
  recordType: "Monografia",
  simpleElements: {
    articleLanguage: [
      "fin"
    ],
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
  sourceIds: [
    "(FI-MELINDA)007654321"
  ],
  sourceType: "nnam",
  title: "Kirjamalli",
  years: "2023"
}