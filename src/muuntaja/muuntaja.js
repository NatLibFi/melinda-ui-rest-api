/* eslint-disable no-console, no-undef, no-unused-vars */
/* eslint-disable functional/no-conditional-statement, array-callback-return */
/* eslint-disable functional/no-loop-statement */

// Auth header
// backend-commons / commons?

//localhost:8081/muuntaja/

console.log('Starting muuntaja');

function onLoad() {
  console.log('Loaded');
  showPage('login');
}

function showPage(...pages) {
  const root = document.getElementById('root');
  for (const child of root.children) {
    if (pages.includes(child.getAttribute('id'))) {
      child.removeAttribute('hidden');
    } else {
      child.setAttribute('hidden', true);
    }
  }
}

/*
    onload --> tarkasta selaimen storagesta, onko siellä muuntaja-avain (päätä nimi)
    melinda-rest-api -avain = jaetaan kaikkien apukäyttöliittymien kanssa
    tallenna token, ei user-passwd -paria (response.headers.get("Token"))
    Jos avain löytyy -->

      1. lähetetään REST:iin (tee auth -route): Auth-route:
         https://github.com/NatLibFi/melinda-record-import-api/blob/master/src/routes/auth.js

      2. katotaan, onko validi (millä kutsulla? Pyydetään recordia):
         https://github.com/NatLibFi/melinda-record-import-commons-js/blob/4ff4d2dea852ed91d41a531a650874b57ced07d2/src/api-client.js#L317
         // Koeta löytää selaimen kirjautumistiedot resetointia varten
      3. Jos on validi --> perussivun lataus (lataa apu-UI)
      4. Jos ei --> login page (käy kattoon: ui-commons) (tee reactiton login page)
         https://github.com/NatLibFi/melinda-ui-commons/blob/master/frontend/js/components/signin-form-panel.jsx
      5. Koetetaan onko validi -> jos on, tallennetaan tiedot & ladataan UI, jos ei, annetaan virheilmoitus
         (ilmoitus: salasana tai käyttäjätunnus väärin)

    UI reactiton, mutta otetaan material UI
    */

