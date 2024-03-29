import {generatef005, generatef007, generatef008, generateLeader} from './generate/generateControlFields';
import {generatef041, generatef080, generatef084} from './generate/generate0xxFields';
import {generatef245, generatef246} from './generate/generate2xxFields';
import {generatef100sf110sf700sf710s} from './generate/generate1xxFields';
import {generatef336, generatef337} from './generate/generate3xxFields';
import {generatef490} from './generate/generate4xxFields';
import {generatef500, generatef506, generatef520, generatef540, generatef567, generatef591, generatef593, generatef598, generatef599} from './generate/generate5xxFields';
import {generatef773, generatef787} from './generate/generate7xxFields';
import {generatef856} from './generate/generate8xxFields';
import {generatef960} from './generate/generate9xxFields';
import {generatef6xxs, generatef655reviews} from './generate/generate6xxFields';

export function createArtikkelitService(useMoment = 'now') {

  return {generateRecord};

  function generateRecord(data) {
    console.log(data); // eslint-disable-line
    // eslint-disable-next-line no-unused-vars
    const {source, journalNumber, abstracts, article, authors, ontologyWords, notes, udks, otherRatings, collecting, sciences, metodologys, reviews} = data;
    const titleFor773t = source.title;
    const {isElectronic} = source;
    const {isbn, issn, melindaId} = parseIncomingData(source);
    const {language: articleLanguage, title: articleTitle, titleOther: articleTitleOther} = article;
    const referenceLinks = article.link; // field 856
    const SourceTypeAsCode = source.sourceType; // eg. 'nnas', 'nnam' for field 773
    const sourceTypeAsText = getSourceTypeAsText(source); // journal, book, text, electronic
    const abstractLanguages = abstracts.map(elem => elem.language.iso6392b);
    const today = new Date();
    const year = today.getFullYear(); // journal year form value / book year form value / current year form value
    const journalJufo = 'todo'; //https://wiki.eduuni.fi/display/cscvirtajtp/Jufo-tunnistus
    const {f599a, f599x} = collecting;

    const record = {
      leader: generateLeader(sourceTypeAsText),
      fields: [
        generatef005(),
        generatef007(isElectronic),
        generatef008(useMoment, journalNumber.publishingYear, sourceTypeAsText, isElectronic, articleLanguage),
        generatef041(articleLanguage.iso6392b, abstractLanguages),
        generatef080(udks), // (lisäkentät)
        generatef084(otherRatings), // (lisäkentät)
        generatef100sf110sf700sf710s(authors),
        generatef245(articleTitle, authors, article.language.iso6392b),
        generatef246(articleTitleOther),
        generatef336(),
        generatef337(isElectronic),
        generatef490(article.sectionOrColumn),
        generatef500(notes), // general notes
        generatef506(referenceLinks, isElectronic),
        generatef520(abstracts), // Abstracts
        generatef540(article),
        generatef567(metodologys),
        generatef591(sciences, article.type),
        generatef593(journalJufo, year),
        generatef598(collecting.f589a),
        generatef599(f599a, f599x),
        generatef6xxs(ontologyWords),
        generatef655reviews(reviews),
        generatef773(sourceTypeAsText, journalNumber, melindaId, isbn, issn, SourceTypeAsCode, titleFor773t),
        generatef787(reviews), // review books
        generatef856(referenceLinks, isElectronic),
        generatef960()
      ].flat()
    };

    return record;
  }

}

export function parseIncomingData(data) {
  const [isbn] = data.isbns || [''];
  const [issn] = data.issns || [''];
  const melindaId = data.sourceIds.filter(id => (/^\(FI-MELINDA\)\d{9}$/u).test(id));

  return {
    isbn,
    issn,
    melindaId
  };
}

export function getSourceTypeAsText(input) {
  const found = input.sourceType;
  const get3rd = found.substr(2, 1);
  const get4th = found.substr(3, 1);

  if (get4th === 's' || get4th === 'i') {
    return 'journal';
  }

  if (get4th === 'm' || get4th === 'c') {
    return 'book';
  }

  if (get3rd === 'a') {
    return 'text';
  }

  if (get3rd === 'g' || get3rd === 'i' || get3rd === 'm') {
    return 'electronic';
  }

}
