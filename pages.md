# 📑 Stranice i funkcionalnosti

## 🏠 Početna stranica

Na početnoj stranici korisnik može videti vremensku liniju i poslednjih pet aktivnosti koje su izvršene na trenutnoj instanci.

## 📚 Moji predmeti

Otvaranjem stranice **Moji predmeti**, korisnik može pregledati spisak svih predmeta kojima ima pristup, bez obzira na ulogu (profesor, asistent ili demonstrator).

## 👩‍🎓 Upravljanje studentima

Na stranici **Upravljanje studentima** korisniku je omogućen pregled, pretraga, brisanje i izmena postojećih studenata, kao i dodavanje novih popunjavanjem forme sa parametrima poput imena, prezimena, broja indeksa i e-mail adrese.

## 🛠️ Korisnička zona

Na stranici **Korisnička zona** korisnik može izmeniti trenutno vidljive parametre i lozinku svog naloga.

## 👨‍💼 Upravljanje zaposlenima

Stranica **Upravljanje zaposlenima** pruža pregled svih unetih zaposlenih, kao i opcije pretrage, brisanja, izmene i dodavanja novih popunjavanjem forme sa odgovarajućim parametrima. Moguće pozicije uključuju dekana, profesora, asistenta i demonstratora.

## 🏫 Upravljanje predmetima

Na stranici **Upravljanje predmetima** moguće je pretražiti i izmeniti postojeće predmete, kao i dodati nove popunjavanjem forme sa parametrima predmeta. Pri dodavanju novog predmeta, unosi se i odgovarajući profesor pod uslovom da već postoji u sekciji *Upravljanje zaposlenima*.

## 🕰️ Istorija aktivnosti

Stranica **Istorija aktivnosti** automatski prikazuje sve aktivnosti koje su izvršene u sistemu i aplikaciji u tabelarnom formatu. Korisnik može videti tip aktivnosti (informacija, upozorenje, greška).

# 🔍 Stranice predmeta i njihove funkcionalnosti

Klikom na određeni predmet na stranici *Moji predmeti*, u navigacionom meniju pojavljuju se dodatne funkcionalnosti vezane za predmet, kao što su kreiranje kolokvijuma, spisak studenata, kreiranje konfiguracije i automatsko testiranje.

## 🛠️ Kreiraj konfiguraciju

Stranica **Kreiraj konfiguraciju** prvi je korak za pripremu automatskog testiranja. Korisnik može da:

- Unese naziv konfiguracije
- Odabere redni broj kolokvijuma
- Prevlači .ZIP datoteku sa test primerima
- Dodeli bodove za svaki primer
- Dodaje .ZIP datoteku sa rešenjem zadatka

## 📝 Novi kolokvijum

Stranica **Novi kolokvijum** drugi je korak u pripremi automatskog testiranja. Na ovoj stranici korisnik treba da:

- Prevlači .json datoteku
- Prevlači .TAR datoteku

Time se omogućava automatsko testiranje i registracija studenata na platformu.

## ⚙️ Konfiguracije

Stranica **Konfiguracije** pruža pregled svih konfiguracija sa opcijama za:

- Brisanje
- Preuzimanje
- Učitavanje dodatnih informacija

## 🏷️ Kolokvijumi

Stranica **Kolokvijumi** pruža korisniku listing svih postojećih kolokvijuma uz informacije o njima. Korisnik može:

- Obrisati kolokvijum
- Pristupiti stranici za automatsko testiranje

## 📋 Automatsko testiranje

Na stranici automatskog testiranja, korisnik može:

- Videti listing studenata koji su radili određeni kolokvijum
- Pokrenuti automatsko testiranje svih studenata
- Osvežiti prikaz bodova nakon testiranja
- Generisati ACS izveštaj u PDF formatu

Testiranje je moguće i za svakog studenta pojedinačno, a dostupne su i opcije ručnog ocenjivanja, testiranja i pregleda koda.

## 🛠️ Ručni pregled koda

Na stranici za ručni pregled koda, korisnik može:

- Videti originalni kod
- Debug-ovati kod koristeći debugger i kompajler
- Dodati varijacije koda bez izmene originalnog koda
- Ručno izmeniti bodove za svaki automatski test

## 📋 Spisak studenata

Stranica **Spisak studenata** pruža tabelarni pregled svih studenata određenog predmeta sa osnovnim informacijama.

## 🛠️ Upravljanje predmetom

Stranica **Upravljanje predmetom** omogućava korisniku upravljanje opštim parametrima o predmetu i dodavanje novih ili uklanjanje postojećih zaposlenih. Klikom na "Napusti predmet," korisnik se vraća na početni interfejs aplikacije.
