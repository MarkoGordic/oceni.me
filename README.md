# ![Banner](./assets/banner.png)

#  OCENI.ME

**OCENI.ME** je studentski projekat za **Fakultet Tehničkih Nauka u Novom Sadu**. Cilj aplikacije je pojednostavljeno i ubrzano pregledanje studentskih radova radi veće efikasnosti i bezbednosti asistenata i njihovih uređaja.

Aplikacija omogućava **brzo, efikasno i pre svega bezbedno** testiranje studentskih kodova u okviru **ograničenog Docker okruženja**. Na taj način pregledanje i ocenjivanje postaju brži, a ujedno se sprečava pokretanje potencijalno nestabilnih ili malicioznih kodova na ličnim računarima zaposlenih.

# 💻 Tehnologije

Aplikacija je razvijena uz sledeće tehnologije:
<div style="display:inline-block">
    <img src="https://user-images.githubusercontent.com/25181517/192108891-d86b6220-e232-423a-bf5f-90903e6887c3.png" width="40px" height="40px">
    <img src="https://user-images.githubusercontent.com/25181517/192158954-f88b5814-d510-4564-b285-dff7d6400dad.png" width="40px" height="40px">
    <img src="https://user-images.githubusercontent.com/25181517/183898674-75a4a1b1-f960-4ea9-abcb-637170a00a75.png" width="40px" height="40px">
    <img src="https://user-images.githubusercontent.com/25181517/117447155-6a868a00-af3d-11eb-9cfe-245df15c9f3f.png" width="40px" height="40px">
    <img src="https://user-images.githubusercontent.com/25181517/183897015-94a058a6-b86e-4e42-a37f-bf92061753e5.png" width="40px" height="40px">
    <img src="https://user-images.githubusercontent.com/25181517/121401671-49102800-c959-11eb-9f6f-74d49a5e1774.png" width="40px" height="40px">
    <img src="https://user-images.githubusercontent.com/25181517/183568594-85e280a7-0d7e-4d1a-9028-c8c2209e073c.png" width="40px" height="40px">
    <img src="https://user-images.githubusercontent.com/25181517/183859966-a3462d8d-1bc7-4880-b353-e2cbed900ed6.png" width="40px" height="40px">
    <img src="https://user-images.githubusercontent.com/25181517/183423507-c056a6f9-1ba8-4312-a350-19bcbc5a8697.png" width="40px" height="40px">
    <img src="https://user-images.githubusercontent.com/25181517/183896128-ec99105a-ec1a-4d85-b08b-1aa1620b2046.png" width="40px" height="40px">
    <img src="https://user-images.githubusercontent.com/25181517/117207330-263ba280-adf4-11eb-9b97-0ac5b40bc3be.png" width="40px" height="40px">
<br><br>
</div>

# 🚀 Pokretanje aplikacije

Aplikacija je dostupna za Windows i Linux operativne sisteme. Može se pokrenuti pomoću Docker tehnologije.

## UNIX

1. Preuzmite [**Git**](https://git-scm.com/downloads)
2. `git clone https://github.com/MarkoGordic/oceni.me`
3. `cd ./oceni.me`
4. Preuzmite [**Docker Desktop**](https://www.docker.com/products/docker-desktop/)  
5. `./docker-compose build`
6. `cd ./server/util`
7. `docker build . -t gcc-build`
8. `cd ../../`
9. `./docker-compose up`
10. Pratite instrukcije od same aplikacije

Po pokretanju, korisnik treba uneti lične podatke radi konfiguracije svog naloga. Nakon prijave, otvara se korisnički interfejs.

### Za pregled svih stranica/funkcionalnosti kliknite <a href="./pages.md">OVDE</a>
### Za detaljnu tehničku dokumentaciju kliknite <a href="./docs.md">OVDE</a>

# 💙 Posebno priznanje

Ovaj projekat mi je veoma drag, jer verujem da će pomoći kako mnogim asistentima tako i studentima. Želeo bih **posebno da se zahvalim** jednoj meni veoma posebnoj osobi koja je moja najveća motivacija za sve stvari u životu i bez koje ovaj projekat ne bi bio to što jeste. Takve osobe su nezamenljive, i ukoliko ih pronađete, čuvajte ih. Hvala ti, N. 💙


# 👥 Autori i priznanja

+ [Marko Gordić](https://github.com/MarkoGordic) - Autor  
+ [Radovan Turović]() - Inicijator projekta  
+ [Sara Poparić]() - Pomoć pri realizaciji aplikacije  
+ [Nađa Jakšić]() - README i tehnička dokumentacija
+ [Jovana Minčić]() - Tehnička dokumentacija
+ [Dušan Lazić](https://github.com/dusanlazic) - DevOps podrška

# 📜 Licenca

Projekat je zaštićen pod [MIT](https://choosealicense.com/licenses/mit/) licencom.
