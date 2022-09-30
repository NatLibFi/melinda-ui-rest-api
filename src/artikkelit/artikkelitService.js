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

export function createArtikkelitService() {

  return {generateRecord};

  function generateRecord(data) {
    console.log(data); // eslint-disable-line
    // eslint-disable-next-line no-unused-vars
    const {source, journalNumber, abstract, article, authors, ontologyWords, notes, udks, otherRatings} = data;
    const {isElectronic, publishing} = source;
    const {issn, melindaId} = parseIncomingData(source);
    const {language: articleLanguage, title: articleTitle, titleOther: articleTitleOther} = article;


    const sourceType = 'journal'; // journal or book
    const abstractLanguages = []; // languages from abstracts form value (language.iso6392b)
    const year = '2022'; // journal year form value / book year form value / current year form value
    const journalJufo = 'todo'; //https://wiki.eduuni.fi/display/cscvirtajtp/Jufo-tunnistus
    const isbn = '951-isbn';

    const record = {
      leader: generateLeader(sourceType),
      fields: [
        ...generatef005(),
        ...generatef007(isElectronic),
        ...generatef008(year, sourceType, isElectronic, articleLanguage),
        ...generatef041(articleLanguage.iso6392b, abstractLanguages),
        ...generatef080(udks), // (lisäkentät)
        ...generatef084(otherRatings), // (lisäkentät)
        ...generatef100sf110sf700sf710s(authors),
        ...generatef245(articleTitle),
        ...generatef246(articleTitleOther),
        ...generatef336(),
        ...generatef337(isElectronic),
        ...generatef380(article.reviewType),
        ...generatef490(article.sectionOrColumn),
        ...generatef500(notes), // general notes
        ...generatef520(), // Absracts
        ...generatef567(), // Metodologys
        ...generatef591(sourceType, [{label: 'todo', value: 'todo'}]),
        ...generatef593(journalJufo, year),
        ...generatef598(), // local notes (lisäkentät)
        ...generatef599(), // local notes (lisäkentät)
        ...generatef6xxs(ontologyWords),
        ...generatef773(sourceType, journalNumber, melindaId, article, publishing, isbn, issn),
        ...generatef787(), // review books
        ...generatef856(), // referenceLinks
        ...generatef960()
      ]
    };

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
