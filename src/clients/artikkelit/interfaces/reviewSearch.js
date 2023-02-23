import {idbGet, idbClear, idbSet, idbAddValueToLastIndex, idbGetStoredValues} from "/artikkelit/indexDB.js";
import {formToJson, setOptions, createIconButton, createP} from "/common/ui-utils.js";
import {getPublicationByTitle} from "/common/rest.js";

export function initReviews() {
  console.log("initializing review search...");
  document.getElementById("arvosteltu-teos-hae-form").addEventListener("submit", searchPublications);
  document.getElementById("arvosteltu-teos-lisaa-form").addEventListener("submit", addReview)

  document.getElementById("tyhjenna-arvostelut-form").addEventListener("submit", clearReviews);

  refreshReviewsList();
  resetSearchResultSelect();
}

export function addReview(event) {
  event.preventDefault();
  const reviewIndex = document.getElementById("arvosteltu-teos-tulos-lista").value;
  idbGet("artoTempReviews", parseInt(reviewIndex)).then(tempReview => {
    console.log(tempReview);
    console.log(reviewIndex)

    idbAddValueToLastIndex("artoReviews", tempReview).then(() => {
      refreshReviewsList();
    })
  })
}

export function refreshReviewsList() {
  const reviewList = document.getElementById("arvostelut-list");
  reviewList.innerHTML = "";

  idbGetStoredValues("artoReviews").then(reviews => {
    reviews.forEach(reviewData => {
      console.log(reviewData)
      const form = document.createElement("form");
      const div = document.createElement("div");
      div.classList.add("full-width");
      const removeButton = createIconButton("delete", ["no-border", "negative"], `return removeReviewedBook(event, ${reviewData.key})`, "Poista");
      div.appendChild(createP("Arvosteltu teos", "", "&nbsp;-&nbsp;", ["label-text"]));
      div.appendChild(createP(reviewData.title));
      div.appendChild(createP("ISBN", "", "&nbsp;-&nbsp;", ["label-text"]));
      div.appendChild(createP(reviewData.isbns))

      div.appendChild(removeButton);
      form.appendChild(div);
      reviewList.appendChild(form);
    });

    if (reviews.length > 1) {
      document.getElementById("tyhjenna-arvostelut-form").style.display = "block";
    }

    if (reviews.length < 2) {
      document.getElementById("tyhjenna-arvostelut-form").style.display = "none";
    }
  });
}

export function clearReviews(event) {
  event.preventDefault();
  idbClear("artoReviews").then(() => refreshReviewsList());
}

function resetSearchResultSelect(searching) {
  const select = document.getElementById("arvosteltu-teos-tulos-lista");
  select.innerHTML = "";

  if (searching) {
    return setOptions(select, [{value: "", text: "Etsitään..."}], true);
  }

  setOptions(select, [{value: "", text: "Ei tuloksia"}], true);
}

function searchPublications(event) {
  event.preventDefault();
  idbClear("artoTempReviews").then(() => {
    resetSearchResultSelect(true);
  });

  const formJson = formToJson(event);

  return getPublicationByTitle(formJson["arvosteltu-teos"]).then(result => {
    if (result.error === undefined) {
      return setRecordsToSearch(result);
    }

    return resetSearchResultSelect();
  });
}

function setRecordsToSearch(records) {
  if (records.length === 0) {
    return resetSearchResultSelect();
  }

  const promises = records.map((record, index) => {
    console.log(record.data.title);
    return idbSet("artoTempReviews", index, record.data);
  });

  Promise.all(promises).then(() => refreshSearchResultSelect());
}

function refreshSearchResultSelect() {
  const select = document.getElementById("arvosteltu-teos-tulos-lista");
  select.innerHTML = "";

  idbGetStoredValues("artoTempReviews").then(sources => {
    const data = sources.map(record => {
      console.log(record);
      const title = record.title;
      const publicationType = record.isElectric ? "E-aineisto" : "Painettu";
      const years = `${record.publisherInfo.publisherYears.start}-${record.publisherInfo.publisherYears.end}`;
      const text = `${title} (${publicationType}: ${years})`;
      return {value: record.key, text};
    });

    setOptions(select, data);
  })
}

export function resetReview(event) {
  event.preventDefault();
  idbClear("artoTempReviews").then(() => {
    document.getElementById("arvosteltu-teos-hae-form").reset();
    resetSearchResultSelect();
  });
}