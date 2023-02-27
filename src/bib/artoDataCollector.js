/* eslint-disable no-unused-vars,no-console */
import {MarcRecord} from '@natlibfi/marc-record';
import {getSubfieldValue, getSubfieldValues, getIsElectronic, getRecordType, getSourceType} from './collectorUtils';

const titleTrimCharacters = /\s?(?:,|\.|-|;|:|_|\/|'|"|\+|!|\?)\s?$/gu;

export function collectData(jsonRecord) {
  const record = new MarcRecord(jsonRecord, {subfieldValues: false});

  const recordType = getRecordType(record);
  const sourceType = getSourceType(record);

  const authors = collectAuthorInfo(record);
  const titles = record.get(/245/u).flatMap(field => field.subfields.filter(sub => sub.code === 'a' || sub.code === 'b' || sub.code === 'n' || sub.code === 'p').map(sub => sub.value));
  const title = titles.map(titlePart => String(titlePart).replace(titleTrimCharacters, '').replace(/\s{2}/u, ' ')).join(' : ');

  const publicationInfo = collectPublicationInfo(recordType, record);
  const commonData = collectCommonData(record);
  const simpleGroups = collectSimpleGroups(record);
  const simpleElements = collectSimpleElements(record);
  const isElectronic = getIsElectronic(record);

  return {
    title,
    isElectronic,
    ...publicationInfo,
    ...commonData,
    authors,
    simpleGroups,
    simpleElements,
    recordType,
    sourceType
  };
}

function collectPublicationInfo(sourceType, record) {
  if (sourceType === 'Kausijulkaisu' || sourceType === 'Päivittyvä julkaisu' || sourceType === 'Monografia') {
    return collectHostItemData(record);
  }

  if (sourceType === 'Osakohde kausijulkaisussa' || sourceType === 'Osakohde kokoelmassa' || sourceType === 'Osakohde monografiassa') {
    return collectComponentPartData(record);
  }

  throw new Error('Invalid source type');
}

function collectHostItemData(record) {
  const [years] = getSubfieldValue(record, /260/u, 'c');
  const issns = getSubfieldValue(record, /022/u, 'a');
  const isbns = record.get(/020/u).map(field => field.subfields.filter(sub => sub.code === 'a').map(sub => sub.value));
  const sourceIds = record.get(/035/u).flatMap(field => field.subfields.filter(sub => sub.code === 'a').map(sub => sub.value));

  return {
    years,
    issns,
    isbns,
    sourceIds
  };

}

function collectComponentPartData(record) {
  const hostLink = record.get(/773/u).map(field => field.subfields.filter(sub => sub.code === 'g').flatMap(sub => sub.value));
  const hostItemIds = record.get(/773/u).map(field => field.subfields.filter(sub => sub.code === 'w').flatMap(sub => sub.value));
  const [year] = record.get(/008/u).map(field => field.value.slice(7, 12));

  return {
    hostItemIds,
    hostLink,
    year
  };
}

function collectCommonData(record) {
  const notices = record.get(/591/u).map(field => field.subfields.filter(sub => sub.code === 'd').map(sub => sub.value));
  const {publishing, publisherInfo} = collectPublisherData(record);

  return {
    publishing,
    publisherInfo,
    notices
  };

  function collectPublisherData(record) {
    // 260 - JULKAISUTIEDOT (T) Teoksen julkaisutiedot: kustannus-, paino-, jakelu-, julkistamis-, tai tuotantotiedot.
    const [f260Data] = getSubfieldValues(record, /260/u, ['a', 'b', 'c']);
    const [publisherLocation] = f260Data.filter(sub => sub.code === 'a').map(sub => sub.value);
    const [publisher] = f260Data.filter(sub => sub.code === 'b').map(sub => sub.value);
    const [publisherYearsNotParsed] = f260Data.filter(sub => sub.code === 'c').map(sub => sub.value);
    const [start, end] = publisherYearsNotParsed ? publisherYearsNotParsed.split('-') : ['', ''];
    return {
      publishing: `${publisherLocation} ${publisher} ${publisherYearsNotParsed}`,
      publisherInfo: {
        publisherLocation: publisherLocation.replace(titleTrimCharacters, '').trim(),
        publisher: publisher.replace(titleTrimCharacters, '').trim(),
        publisherYears: {
          start: start.replace(titleTrimCharacters, '').trim(),
          end: end?.replace(titleTrimCharacters, '').trim()
        }
      }
    };
  }
}

function collectSimpleElements(record) {
  //   "041" => "articleLanguage" => "m:datafield[@tag='041']/m:subfield[@code='a']", "fooKey" => "label"
  const articleLanguage = getSubfieldValue(record, /041/u, 'a');
  // "246" => "title_other" => "m:datafield[@tag='246']/m:subfield[@code='a']" "fooKey" => "label"
  const titleOther = getSubfieldValue(record, /246/u, 'a');
  // "490" => "articleReference" => "m:datafield[@tag='490']/m:subfield[@code='a']"
  const articleReference = getSubfieldValue(record, /490/u, 'a');
  // "500" => "note_general" => "m:datafield[@tag='500']/m:subfield[@code='a']"
  const noteGeneral = getSubfieldValue(record, /500/u, 'a');
  // "567" => "methodology" => "m:datafield[@tag='567']/m:subfield[@code='a']", "trim" => "."
  const methodology = getSubfieldValue(record, /567/u, 'a').map(value => value.replace(/\./u, ''));
  // "591" => "articleSciences" => "m:datafield[@tag='591']/m:subfield[@code='i']", "fooKey" => "label"
  const articleSciences = getSubfieldValue(record, /591/u, 'i');
  // "598" => "local_notes_598" => "m:datafield[@tag='598']/m:subfield[@code='a']"
  const localNotes598 = getSubfieldValue(record, /598/u, 'a').map(value => value.replace(/\./u, ''));
  // "600" => "term_other_person" => "m:datafield[@tag='600']/m:subfield[@code='a']", "trim" => "."
  const f600s = getSubfieldValue(record, /600/u, 'a').map(value => value.replace(/\./u, ''));
  // "610_other_community" => "term_other_community" => "m:datafield[@tag='610'][not(m:subfield[@code='0'])]/m:subfield[@code='a']", "trim" => "."
  // "610" => "term_cn" => "m:datafield[@tag='610'][m:subfield[@code='2'] = 'finaf']/m:subfield[@code='0']", "trim" => "."
  const f610s = getSubfieldValues(record, /610/u, ['a', '2', '0']);
  // "648" => "term_other_time" => "m:datafield[@tag='648']/m:subfield[@code='a']", "trim" => "."
  const f648s = getSubfieldValue(record, /648/u, 'a').map(value => value.replace(/\./u, ''));
  // "650_yso" => "term_yso" => "m:datafield[@tag='650'][m:subfield[@code='2'] = 'yso/fin']/m:subfield[@code='0']"
  // "650_allfo" => "term_allfo" => "m:datafield[@tag='650'][m:subfield[@code='2'] = 'yso/swe']/m:subfield[@code='0']"
  // "650_agrifors" => "term_afo" => "m:datafield[@tag='650'][m:subfield[@code='2'] = 'afo']/m:subfield[@code='0']"
  // "650_kassu" => "term_kassu" => "m:datafield[@tag='650'][m:subfield[@code='2'] = 'kassu']/m:subfield[@code='0']"
  // "650_soto" => "term_soto" => "m:datafield[@tag='650'][m:subfield[@code='2'] = 'soto']/m:subfield[@code='0']"
  // "650_finmesh" => "term_finmesh" => "m:datafield[@tag='650'][m:subfield[@code='2'] = 'finmesh']/m:subfield[@code='0']"
  // "650_maotao" => "term_maotao" => "m:datafield[@tag='650'][m:subfield[@code='2'] = 'maotao']/m:subfield[@code='0']"
  const f650s = getSubfieldValues(record, /650/u, ['a', '2', '0']);
  // "651_yso_geo" => "term_yso_geo" => "m:datafield[@tag='651'][m:subfield[@code='2'] = 'yso/fin']/m:subfield[@code='0']"
  // "651_allfo_geo" => "term_allfo_geo" => "m:datafield[@tag='651'][m:subfield[@code='2'] = 'yso/swe']/m:subfield[@code='0']"
  const f651s = getSubfieldValues(record, /651/u, ['a', '2', '0']);
  // "655_slm" => "term_slm" => "m:datafield[@tag='655'][m:subfield[@code='2'] = 'slm/fin']/m:subfield[@code='0']"
  // "655_fgf" => "term_fgf" => "m:datafield[@tag='655'][m:subfield[@code='2'] = 'slm/swe']/m:subfield[@code='0']"
  // "655" => "term_other_category" => "m:datafield[@tag='655']/m:subfield[@code='a']", "trim" => "."
  const f655s = getSubfieldValues(record, /655/u, ['a', '2', '0']);
  // "653" => "term_other" => "m:datafield[@tag='653']/m:subfield[@code='a']", "trim" => "."
  const f653s = getSubfieldValue(record, /653/u, 'a').map(value => value.replace(/\./u, ''));
  // "856" => "referenceLink" => "m:datafield[@tag='856']/m:subfield[@code='u']"
  const referenceLink = getSubfieldValue(record, /856/u, 'u');

  return {
    referenceLink,
    f655s,
    f653s,
    f651s,
    f650s,
    f648s,
    f610s,
    f600s,
    articleLanguage,
    articleReference,
    articleSciences,
    titleOther,
    localNotes598,
    noteGeneral,
    methodology
  };
}

function collectSimpleGroups(record) {
  // "080" => "universal_decimal_classification_number"
  //         "a" "m:datafield[@tag='080']/m:subfield[@code='a']"
  //         "x" "m:datafield[@tag='080']/m:subfield[@code='x']"
  const universalDecimalClassificationNumber = getSubfieldValues(record, /080/u, ['a', 'x']);
  // "084"=> "other_classification_number"
  //         "a" "m:datafield[@tag='084']/m:subfield[@code='a']"
  //         "two" "m:datafield[@tag='084']/m:subfield[@code='2']"
  const otherClassificationNumber = getSubfieldValues(record, /084/u, ['a', '2']);
  // "041_520" => "abstract"
  //         "term" "m:datafield[@tag='520']/m:subfield[@code='a']" "trim" => "."
  //         "language" "m:datafield[@tag='041']/m:subfield[@code='b']" "fooKey" => "label"
  const f041s = getSubfieldValue(record, /041/u, 'b');
  const f520s = getSubfieldValue(record, /520/u, 'a').map(value => value.replace(/\./u, ''));
  const abstract = {term: f520s, language: f041s};
  // "599" => "local_notes_599",
  //         "a" "m:datafield[@tag='599']/m:subfield[@code='a']" "trim" => "."
  //         "x" "m:datafield[@tag='599']/m:subfield[@code='x']"
  const localNotes599 = getSubfieldValues(record, /599/u, ['a', 'x']);

  return {
    universalDecimalClassificationNumber,
    otherClassificationNumber,
    abstract,
    localNotes599
  };
}

function collectAuthorInfo(record) {
  const f100s = record.get(/100/u);
  const f110s = record.get(/110/u);
  const f700s = record.get(/700/u);
  const f710s = record.get(/710/u);

  return [...f100s, ...f110s, ...f700s, ...f710s].map(field => {
    const names = field.subfields.filter(sub => sub.code === 'a').flatMap(sub => sub.value.split(','));
    const lastName = names[0]?.trim().replace(/\./u, '');
    const firstName = names[1]?.trim().replace(/\./u, '');
    const organisations = field.subfields.filter(sub => sub.code === 'g').map(sub => sub.value.replace(/^\(orgn\)/u, ''));
    const relatorResult = field.subfields.filter(sub => sub.code === 'e').map(sub => sub.value);
    const [asteriId] = field.subfields.filter(sub => sub.code === '0').map(sub => sub.value.replace(/^\(FI-ASTERI-N\)/u, ''));


    if (lastName === undefined && firstName === undefined) {
      return false;
    }

    const relator = selectRelator(field, relatorResult);

    return {
      firstName,
      lastName,
      relator,
      organisations,
      asteriId
    };

    function selectRelator(field, relatorResult) {
      if (relatorResult.length < 1) {
        if (field.tag === '710') {
          return 'yhteisö';
        }

        return '';
      }

      return relatorResult[0];
    }
  }).filter(value => value);
}

// private function convertMarcToDataset($doc) {
//   $record = $sourceType = $sourceType = null;
//   $xpath = new \DOMXpath($doc);
//   $dataset = array(
//     "elements" => array(),
//     "groups" => array()
//   );
//   $authors = array();
//   $logger = $this -> logger;


//   $xpath -> registerNamespace("m", self:: NAMESPACE_MARC21SLIM);

//   $record = $xpath -> query("/m:record", $doc) -> item(0);
//   $sourceType = $xpath -> query("m:datafield[@tag='773']/m:subfield[@code='7']", $record) -> item(0) -> nodeValue;

//   foreach($this -> datasetSimpleElements as $spec) {
//     $nodes = $xpath -> query($spec["xpath"], $record);

//     if ($nodes -> length > 0) {
//       $dataset["elements"][$spec["id"]] = array();

//       foreach($nodes as $node) {
//         $values = array(
//           $spec["valueKey"] => !isset($spec["trim"]) ? $node -> nodeValue : trim($node -> nodeValue, $spec["trim"])
//         );

//         if (isset($spec["fooKey"])) {
//           $values[$spec["fooKey"]] = "";
//         }

//         array_push($dataset["elements"][$spec["id"]], $values);
//       }
//     }
//   }

//   foreach($this -> datasetSimpleGroups as $spec) {
//     $group = array();

//     foreach($spec["elements"] as $elementName => $elementSpec) {
//       $nodes = $xpath -> query($elementSpec["xpath"], $record);

//       if ($nodes -> length > 0) {
//         foreach($nodes as $nodeIndex => $node) {
//           $values = array(
//             $elementSpec["valueKey"] => !isset($elementSpec["trim"]) ? $node -> nodeValue : trim($node -> nodeValue, $elementSpec["trim"])
//           );

//           if (!isset($group[(int)$nodeIndex])) {
//             $group[$nodeIndex] = array();
//           }

//           if (isset($spec["fooKey"])) {
//             $values[$spec["fooKey"]] = "";
//           }

//           $group[$nodeIndex][$elementName][0] = $values;
//         }
//       }
//     }

//     if (!empty($group)) {
//       $dataset["groups"][$spec["id"]] = $group;
//     }
//   }

//   /**
//    * @internal Get rest of the data (journal/book data and author)
//    */
//   if ($sourceType == "nnas") {
//     $issn = null;
//     $xpathContext = $xpath -> query("m:datafield[@tag='773']", $record) -> item(0);
//     $journal_id = $xpath -> query("m:subfield[@code='w']", $xpathContext) -> item(0) -> nodeValue;
//     $elements = array(
//       "sourceType" => array("journal"),
//       "articleTitle_journal" => array(
//         $this -> combineSubfields($xpath -> query("m:datafield[@tag='245']/m:subfield[@code='a' or @code='b' or @code='n' or @code='p']", $record), " ")
//       ),
//       "journalYear" => array(substr($xpath -> query("m:controlfield[@tag='008']", $record) -> item(0) -> nodeValue, 7, 4)),
//     );

//     $elements["journal"] = array(
//       $xpath -> query("m:subfield[@code='w']", $xpathContext) -> length == 0 ? array() : array(
//         "id" => preg_replace("/^\(.*\)/", '', $journal_id)
//       )
//     );

//     $issn = $xpath -> query("m:datafield[@tag='022']", $record);

//     if ($issn -> length > 0) {
//       $elements["journal"]["issn"] = $xpath -> query("m:subfield[@code='a']", $issn -> item(0)) -> item(0) -> nodeValue;
//     }

//     if ($xpath -> query("m:datafield[@tag='591']/m:subfield[@code='d']", $record) -> length == 0) {
//       $elements["articleType_journal"] = array("");
//     } else {
//       $elements["articleType_journal"] = array(trim($xpath -> query("m:datafield[@tag='591']/m:subfield[@code='d']", $record) -> item(0) -> nodeValue, "."));
//     }

//     $elements = array_merge($elements, array_map(function ($value) {
//       return array("value" => $value);
//     }, \Artiva\MelindaARTOLookup:: getArticleDetails($xpath -> query("m:subfield[@code='g']", $xpathContext) -> item(0) -> nodeValue, "journal")));

//     if (!isset($elements["journalNumber"])) {
//       $elements["journalNumber"] = array("0");
//     }
//   } elseif($sourceType == "nnam") {
//     $xpathContext = $xpath -> query("m:datafield[@tag='773']", $record) -> item(0);
//     $subfield = $xpath -> query("m:subfield[@code='g']", $xpathContext) -> item(0) -> nodeValue;


//     $elements = array(
//       "sourceType" => array("book"),
//       "articleTitle_book" => array(
//         $this -> combineSubfields($xpath -> query("m:datafield[@tag='245']/m:subfield[@code='a' or @code='b' or @code='n' or @code='p']", $record), " ")
//       )
//     );

//     if ($xpath -> query("m:datafield[@tag='591']/m:subfield[@code='d']", $record) -> length == 0) {
//       $elements["articleType_book"] = array("");
//     } else {
//       $elements["articleType_book"] = array(trim($xpath -> query("m:datafield[@tag='591']/m:subfield[@code='d']", $record) -> item(0) -> nodeValue, "."));
//     }

//     $elements = array_merge($elements, array_map(function ($value) {
//       return array("value" => $value);
//     }, \Artiva\MelindaARTOLookup:: getArticleDetails($xpath -> query("m:subfield[@code='g']", $xpathContext) -> item(0) -> nodeValue, "book")));


//     if ($xpath -> query("m:subfield[@code='w']", $xpathContext) -> length > 0) {
//       $elements["book"] = array(
//         array(
//           "id" => preg_replace("/^\(FI-MELINDA\)/", "", $xpath -> query("m:subfield[@code='w']", $xpathContext) -> item(0) -> nodeValue)
//         )
//       );
//     }

//     $elements["bookISBN"] = array(
//       trim($xpath -> query("m:subfield[@code='z']", $xpathContext) -> item(0) -> nodeValue, ". -")
//     );
//   }
