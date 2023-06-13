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
    text: 'Julkaisun nimellä'
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
// updated 21.3.2023
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
  {value: 'Lahden ammattikorkeakoulu', text: '', code: '02470'},
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
  {value: 'Saimaan ammattikorkeakoulu', text: '', code: '02609'},
  {value: 'Satakunnan ammattikorkeakoulu', text: '', code: '02507'},
  {value: 'Savonia-ammattikorkeakoulu', text: '', code: '02537'},
  {value: 'Seinäjoen ammattikorkeakoulu', text: '', code: '02472'},
  {value: 'Suomen Pankki', text: '', code: '02022481'},
  {value: 'Suomen ympäristökeskus', text: '', code: '7020017'},
  {value: 'Svenska handelshögskolan', text: '', code: '01910'},
  {value: 'Säteilyturvakeskus', text: '', code: '5550012'},
  {value: 'Taideyliopisto', text: '', code: '10103'},
  {value: 'Tampereen ammattikorkeakoulu', text: '', code: '02630'},
  {value: 'Tampereen tekn. yliopisto', text: '', code: '01915'},
  {value: 'Tampereen yliopisto (uusi)', text: '', code: '10122'},
  {value: 'Tampereen yliopisto (vanha)', text: '', code: '01905'},
  {value: 'Tampereen yliopistollisen sairaalan erityisvastuualue', text: '', code: '08265978'},
  {value: 'Teknologian tutkimuskeskus VTT Oy', text: '', code: '26473754'},
  {value: 'Terveyden ja hyvinvoinnin laitos', text: '', code: '5610017'},
  {value: 'Turun ammattikorkeakoulu', text: '', code: '02509'},
  {value: 'Turun yliopisto', text: '', code: '10089'},
  {value: 'Turun yliopistollisen keskussairaalan erityisvastuualue', text: '', code: '08282559'},
  {value: 'Työterveyslaitos', text: '', code: '02202669'},
  {value: 'Ulkopoliittinen instituutti', text: '', code: '1120017'},
  {value: 'Vaasan ammattikorkeakoulu', text: '', code: '02627'},
  {value: 'Vaasan yliopisto', text: '', code: '01913'},
  {value: 'Valtion taloudellinen tutkimuskeskus', text: '', code: '3060016'},
  {value: 'Yrkeshögskolan Arcada', text: '', code: '02535'},
  {value: 'Yrkeshögskolan Novia', text: '', code: '10066'},
  {value: 'Åbo Akademi', text: '', code: '01903'}
];

// Old organization list
// https://wiki.eduuni.fi/display/cscsuorat/7.6+Tutkimuslaitosten+ja+yliopistollisten+sairaaloiden+organisaatiotunnukset+2021
// https://wiki.eduuni.fi/display/cscsuorat/7.1+Korkeakoulujen+oppilaitosnumerot+2021
// export const organizations = [
//   {
//     value: "Teatterikorkeakoulu - 1717",
//     text: ""
//   },
//   {
//     value: "Kuvataideakatemia - 1740",
//     text: ""
//   },
//   {
//     value: "Sibelius-Akatemia - 1742",
//     text: ""
//   },
//   {
//     value: "Helsingin yliopisto - 1901",
//     text: ""
//   },
//   {
//     value: "Åbo Akademi - 1903",
//     text: ""
//   },
//   {
//     value: "Oulun yliopisto - 1904",
//     text: ""
//   },
//   {
//     value: "Tampereen yliopisto - 1905 - Vanha",
//     text: ""
//   },
//   {
//     value: "Tampereen yliopisto - 10122 - Uusi",
//     text: ""
//   },
//   {
//     value: "Jyväskylän yliopisto - 1906",
//     text: ""
//   },
//   {
//     value: "Svenska handelshögskolan - 1910",
//     text: ""
//   },
//   {
//     value: "Vaasan yliopisto - 1913",
//     text: ""
//   },
//   {
//     value: "Lappeenrannan tekn. yliopisto / LUT-yliopisto - 1914",
//     text: ""
//   },
//   {
//     value: "Tampereen tekn. yliopisto - 1915 - Vanha",
//     text: ""
//   },
//   {
//     value: "Lapin yliopisto - 1918",
//     text: ""
//   },
//   {
//     value: "Aalto yliopisto - 10076",
//     text: ""
//   },
//   {
//     value: "Itä-Suomen yliopisto - 10088",
//     text: ""
//   },
//   {
//     value: "Turun yliopisto - 10089",
//     text: ""
//   },
//   {
//     value: "Hämeen ammattikorkeakoulu - 2467",
//     text: ""
//   },
//   {
//     value: "Pohjois-Karjalan ammattikorkeakoulu / Karelia-ammattikorkeakoulu - 2469",
//     text: ""
//   },
//   {
//     value: "Lahden ammattikorkeakoulu - 2470 - Vanha",
//     text: ""
//   },
//   {
//     value: "Oulun ammattikorkeakoulu - 2471",
//     text: ""
//   },
//   {
//     value: "Seinäjoen ammattikorkeakoulu - 2472",
//     text: ""
//   },
//   {
//     value: "Kajaanin ammattikorkeakoulu - 2473",
//     text: ""
//   },
//   {
//     value: "Jyväskylän ammattikorkeakoulu - 2504",
//     text: ""
//   },
//   {
//     value: "Kemi-Tornion ammattikorkeakoulu - 2505",
//     text: ""
//   },
//   {
//     value: "Mikkelin ammattikorkeakoulu - 2506",
//     text: ""
//   },
//   {
//     value: "Satakunnan ammattikorkeakoulu - 2507",
//     text: ""
//   },
//   {
//     value: "Turun ammattikorkeakoulu - 2509",
//     text: ""
//   },
//   {
//     value: "Yrkeshögskolan Arcada - 2535",
//     text: ""
//   },
//   {
//     value: "Keski-Pohjanmaan ammattikorkeakoulu / Centria-ammattikorkeakoulu - 2536",
//     text: ""
//   },
//   {
//     value: "Savonia-ammattikorkeakoulu - 2537",
//     text: ""
//   },
//   {
//     value: "Rovaniemen ammattikorkeakoulu - 2538",
//     text: ""
//   },
//   {
//     value: "Lapin ammattikorkeakoulu - 10108",
//     text: ""
//   },
//   {
//     value: "Kaakkois-Suomen ammattikorkeakoulu (Xamk) - 10118",
//     text: ""
//   },
//   {
//     value: "Kymenlaakson ammattikorkeakoulu - 2608",
//     text: ""
//   },
//   {
//     value: "Saimaan ammattikorkeakoulu - 2609 - Vanha",
//     text: ""
//   },
//   {
//     value: "Diakonia-ammattikorkeakoulu - 2623",
//     text: ""
//   },
//   {
//     value: "Vaasan ammattikorkeakoulu - 2627",
//     text: ""
//   },
//   {
//     value: "Laurea-ammattikorkeakoulu - 2629",
//     text: ""
//   },
//   {
//     value: "Tampereen ammattikorkeakoulu - 2630",
//     text: ""
//   },
//   {
//     value: "Humanistinen ammattikorkeakoulu - 2631",
//     text: ""
//   },
//   {
//     value: "Haaga-Helia ammattikorkeakoulu - 10056",
//     text: ""
//   },
//   {
//     value: "Metropolia ammattikorkeakoulu - 10065",
//     text: ""
//   },
//   {
//     value: "Yrkeshögskolan Novia - 10066",
//     text: ""
//   },
//   {
//     value: "Taideyliopisto - 10103",
//     text: ""
//   },
//   {
//     value: "Ulkopoliittinen instituutti (UPI) - 1120017",
//     text: ""
//   },
//   {
//     value: "Oikeuspoliittinen tutkimuslaitos (OPTULA)",
//     text: ""
//   },
//   {
//     value: "Valtion taloudellinen tutkimuskeskus (VATT) - 3060016",
//     text: ""
//   },
//   {
//     value: "Kotimaisten kielten tutkimuskeskus (KOTUS)",
//     text: ""
//   },
//   {
//     value: "Maa- ja elintarviketalouden tutkimuskeskus (MTT)",
//     text: ""
//   },
//   {
//     value: "Elintarviketurvallisuusvirasto (EVIRA)",
//     text: ""
//   },
//   {
//     value: "Riista- ja kalatalouden tutkimuslaitos (RKTL)",
//     text: ""
//   },
//   {
//     value: "Metsäntutkimuslaitos (METLA)",
//     text: ""
//   },
//   {
//     value: "Geologian tutkimuskeskus (GTK) - 5040011",
//     text: ""
//   },
//   {
//     value: "Teknologian tutkimuskeskus VTT (VTT) - 26473754",
//     text: ""
//   },
//   {
//     value: "Mittatekniikan keskus (MIKES)",
//     text: ""
//   },
//   {
//     value: "Maanmittauslaitos (MML) - 4020217",
//     text: ""
//   },
//   {
//     value: "Ruokavirasto - 430001",
//     text: ""
//   },
//   {
//     value: "Säteilyturvakeskus (STUK) - 5550012",
//     text: ""
//   },
//   {
//     value: "Terveyden ja hyvinvoinnin laitos (THL) - 5610017",
//     text: ""
//   },
//   {
//     value: "Työterveyslaitos (TTL) - 02202669",
//     text: ""
//   },
//   {
//     value: "Suomen ympäristökeskus (SYKE) - 7020017",
//     text: ""
//   },
//   {
//     value: "Liikenne- ja viestintäministeriö (LVM)",
//     text: ""
//   },
//   {
//     value: "Maa- ja metsätalousministeriö (MMM)",
//     text: ""
//   },
//   {
//     value: "Oikeusministeriö (OM)",
//     text: ""
//   },
//   {
//     value: "Opetus- ja kulttuuriministeriö (OKM)",
//     text: ""
//   },
//   {
//     value: "Puolustusministeriö (PLM)",
//     text: ""
//   },
//   {
//     value: "Sisäasiainministeriö (SM)",
//     text: ""
//   },
//   {
//     value: "Sosiaali- ja terveysministeriö (STM)",
//     text: ""
//   },
//   {
//     value: "Työ- ja  elinkeinoministeriö (TEM)",
//     text: ""
//   },
//   {
//     value: "Ulkoasiainministeriö (UM)",
//     text: ""
//   },
//   {
//     value: "Valtioneuvoston kanslia (VNK)",
//     text: ""
//   },
//   {
//     value: "Valtiovarainministeriö (VM)",
//     text: ""
//   },
//   {
//     value: "Ympäristöministeriö (YM)",
//     text: ""
//   },
//   {
//     value: "Helsingin seudun yliopistollinen keskussairaala (HYKS)",
//     text: ""
//   },
//   {
//     value: "Turun yliopistollinen keskussairaala (TYKS)",
//     text: ""
//   },
//   {
//     value: "Oulun yliopistollinen sairaala (OYS)",
//     text: ""
//   },
//   {
//     value: "Tampereen yliopistollinen sairaala (TAYS)",
//     text: ""
//   },
//   {
//     value: "Kuopion yliopistollinen sairaala (KYS)",
//     text: ""
//   },
//   {
//     value: "Luonnonvarakeskus (LUKE) - 4100010",
//     text: ""
//   },
//   {
//     value: "Maanpuolustuskorkeakoulu (MpKK)",
//     text: ""
//   },
//   {
//     value: "Vapaa tutkija - X0001",
//     text: ""
//   },
//   {
//     value: "Muu tutkija - X0002",
//     text: ""
//   },
//   {
//     value: "Ei tietoa - X0003",
//     text: ""
//   },
//   {
//     value: "Helsingin ja Uudenmaan sairaanhoitopiiri - X0004",
//     text: ""
//   },
//   {
//     value: "Varsinais-Suomen sairaanhoitopiiri - X0005",
//     text: ""
//   },
//   {
//     value: "Satakunnan sairaanhoitopiiri - X0006",
//     text: ""
//   },
//   {
//     value: "Kanta-Hämeen sairaanhoitopiiri - X0007",
//     text: ""
//   },
//   {
//     value: "Pirkanmaan sairaanhoitopiiri - X0008",
//     text: ""
//   },
//   {
//     value: "Päijät-Hämeen sairaanhoitopiiri - X0009",
//     text: ""
//   },
//   {
//     value: "Kymenlaakson sairaanhoitopiiri - X0010",
//     text: ""
//   },
//   {
//     value: "Etelä-Karjalan sairaanhoitopiiri - X0011",
//     text: ""
//   },
//   {
//     value: "Etelä-Savon sairaanhoitopiiri - X0012",
//     text: ""
//   },
//   {
//     value: "Itä-Savon sairaanhoitopiiri - X0013",
//     text: ""
//   },
//   {
//     value: "Pohjois-Karjalan sairaanhoitopiiri - X0014",
//     text: ""
//   },
//   {
//     value: "Pohjois-Savon sairaanhoitopiiri - X0015",
//     text: ""
//   },
//   {
//     value: "Keski-Suomen sairaanhoitopiiri - X0016",
//     text: ""
//   },
//   {
//     value: "Etelä-Pohjanmaan sairaanhoitopiiri - X0017",
//     text: ""
//   },
//   {
//     value: "Vaasan sairaanhoitopiiri - X0018",
//     text: ""
//   },
//   {
//     value: "Keski-Pohjanmaan sairaanhoitopiiri - X0019",
//     text: ""
//   },
//   {
//     value: "Pohjois-Pohjanmaan sairaanhoitopiiri - X0020",
//     text: ""
//   },
//   {
//     value: "Kainuun sairaanhoitopiiri - X0021",
//     text: ""
//   },
//   {
//     value: "Länsi-Pohjan sairaanhoitopiiri - X0022",
//     text: ""
//   },
//   {
//     value: "Lapin sairaanhoitopiiri - X0023",
//     text: ""
//   },
//   {
//     value: "Ålands hälso- och sjukvård - X0024",
//     text: ""
//   },
//   {
//     value: "Kuluttajatutkimuskeskus - X0025",
//     text: ""
//   },
//   {
//     value: "Suomen Pankki (SP) - 02022481",
//     text: ""
//   },
//   {
//     value: "Tilastokeskus - X0027",
//     text: ""
//   },
//   {
//     value: "Ilmatieteen laitos (IL) - 4940015",
//     text: ""
//   },
//   {
//     value: "Geodeettinen laitos - X0029",
//     text: ""
//   }
// ]

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
