

import {generatef005, generatef007, generatef008, generateLeader} from './generate/generateControlFields';
import {generatef041, generatef080, generatef084} from './generate/generate0xxFields';
import {generatef245, generatef246} from './generate/generate2xxFields';
import {generatef100sf110sf700sf710s} from './generate/generate1xxFields';
import {generatef336, generatef337, generatef380} from './generate/generate3xxFields';
import {generatef490} from './generate/generate4xxFields';
import {generatef500, generatef520, generatef567, generatef591, generatef593, generatef598, generatef599} from './generate/generate5xxFields';
import {generatef773, generatef787} from './generate/generate7xxFields';
import {generatef856} from './generate/generate8xxFields';
import {generatef960} from './generate/generate9xxFields';
import {generatef6xxs} from './generate/generate6xxFields';

//import {generateTests} from './generate/index.spec.js'; // ***

export function createArtikkelitService() {

  return {generateRecord};

  function generateRecord(data) {

    console.log(data); // eslint-disable-line        
    //console.log('   ***   INPUT DATA artikkelitService.js - inputdata stringified', JSON.stringify(data, null, " ")); // eslint-disable-line
    // eslint-disable-next-line no-unused-vars
    const {source, journalNumber, abstracts, article, authors, ontologyWords, notes, udks, otherRatings, collecting, sciences, metodologys} = data;
    const titleFor773t = source.title;
    const {isElectronic, publishing} = source;
    const {issn, melindaId} = parseIncomingData(source);
    const {language: articleLanguage, title: articleTitle, titleOther: articleTitleOther} = article;
    const articleCategory = article.type; // for field 591
    const referenceLinks = article.link; // field 856; at the moment only one link
    const sourceType = getSourceType(source);
    const SourceTypeAsCode = source.sourceType; // eg. 'nnas', 'nnam' for field 773
    const abstractLanguages = abstracts.map(elem => elem.language.iso6392b);
    const year = '2022'; // journal year form value / book year form value / current year form value
    const journalJufo = 'todo'; //https://wiki.eduuni.fi/display/cscvirtajtp/Jufo-tunnistus
    const isbn = '951-isbn';
    const {f599a, f599x} = collecting;

    const record = {
      leader: generateLeader(sourceType),
      fields: [
        ...generatef005(),
        ...generatef007(isElectronic),
        ...generatef008(journalNumber.publishingYear, sourceType, isElectronic, articleLanguage),
        ...generatef041(articleLanguage.iso6392b, abstractLanguages),
        ...generatef080(udks), // (lisäkentät)
        ...generatef084(otherRatings), // (lisäkentät)
        ...generatef100sf110sf700sf710s(authors),
        ...generatef245(articleTitle, authors, article.language.iso6392b),
        ...generatef246(articleTitleOther),
        ...generatef336(),
        ...generatef337(isElectronic),
        ...generatef380(article.reviewType),
        ...generatef490(article.sectionOrColumn),
        ...generatef500(notes), // general notes
        ...generatef520(abstracts), // Abstracts
        ...generatef567(metodologys),
        ...generatef591(sourceType, sciences, articleCategory),
        ...generatef593(journalJufo, year),
        ...generatef598(), // local notes (lisäkentät)
        ...generatef599(f599a, f599x),
        ...generatef6xxs(ontologyWords),
        ...generatef773(sourceType, journalNumber, melindaId, publishing, isbn, issn, SourceTypeAsCode, titleFor773t),
        ...generatef787(), // review books
        ...generatef856(referenceLinks, isElectronic),
        ...generatef960()
      ]
    };

    //console.log('   ***   artikkelitService.js - record stringified', JSON.stringify(record, null, " ")); // eslint-disable-line
    // <- OUTPUT eli muokattu tietue
    //generateTests(); // ***

    return record;
  }

  function parseIncomingData(data) {
    const [issn] = data.issns || [''];
    const melindaId = data.sourceIds.filter(id => (/^\(FI-MELINDA\)\d{9}$/u).test(id));

    return {
      issn,
      melindaId
    };
  }
}

function getSourceType(input) {
  const found = input.sourceType;
  const get3rd = found.substr(2, 1);
  const get4th = found.substr(3, 1);

  if (get4th.includes('s', 'i')) {
    return 'journal';
  }

  if (get4th.includes('c', 'm')) {
    return 'book';
  }

  if (get3rd.includes('a')) {
    return 'text';
  }

  if (get3rd.includes('g', 'i', 'm')) {
    return 'electronic';
  }

}
