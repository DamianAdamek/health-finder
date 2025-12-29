# Health Finder - Backend API

Backend systemu zarządzania siłownią/placówką zdrowia. Aplikacja oparta jest na frameworku **NestJS** oraz bazie danych **PostgreSQL**. Całe środowisko jest skonteneryzowane przy użyciu **Docker Compose**.

## 📋 Wymagania

- **Docker** oraz **Docker Compose** zainstalowane na komputerze.
- (Opcjonalnie) **Node.js** (jeśli chcesz korzystać z CLI lokalnie, a nie przez kontener).

---

## 🚀 Szybki Start

1. Przejdź do katalogu backendu:
   cd health-finder/backend

2. Utwórz plik `.env` (jeśli go nie ma) i skonfiguruj zmienne (wzoruj się na poniższym przykładzie):
   DB_HOST=postgres
   DB_PORT=5432
   DB_USERNAME=admin
   DB_PASSWORD=tajnehaslo
   DB_DATABASE=gym_db
   PORT=3000

3. Uruchom środowisko (API + Baza Danych):
   docker-compose up --build
   
   *Flagę `--build` dodajemy przy pierwszym uruchomieniu lub po zmianie w `package.json`.*

4. Aplikacja dostępna jest pod adresem: http://localhost:3000

---

## 🛠 Generowanie kodu (Nest CLI)

Ponieważ używamy Docker Volumes, pliki wygenerowane wewnątrz kontenera pojawią się automatycznie na Twoim dysku (i odwrotnie).

### Metoda 1: Przez Docker (Zalecane - nie wymaga Node.js lokalnie)
Uruchom komendę wewnątrz działającego kontenera `api`:

# Przykład: Generowanie nowego zasobu (Moduł + Controller + Service + Entity)
docker-compose exec api nest g resource modules/nazwa-modulu

### Metoda 2: Lokalnie (Jeśli masz Node.js)
Użyj `npx`, aby wywołać CLI bez instalacji globalnej:

npx nest g resource modules/nazwa-modulu

---

## 🗂 Struktura Projektu (Package by Feature)

Projekt podzielony jest na moduły funkcjonalne:

* **src/app.module.ts** - Główny moduł spinający.
* **src/database/** - Konfiguracja TypeORM i połączenia z PostgreSQL.
* **src/common/** - Elementy współdzielone (Enumy, Dekoratory, Filtry wyjątków).
* **src/modules/** - Logika biznesowa:
    * `user-management` (Użytkownicy, Trenerzy, Klienci, Auth)
    * `scheduling` (Harmonogram, Treningi, Okna Czasowe)
    * `facilities` (Infrastruktura: Siłownie, Sale)
    * `engagement` (Opinie, Formularze)

---

## 🔌 Dostęp do Bazy Danych

Możesz połączyć się z bazą danych używając klienta SQL (np. DBeaver, PgAdmin, DataGrip):

* **Host:** localhost
* **Port:** 5432
* **Użytkownik:** admin (lub wg .env)
* **Hasło:** tajnehaslo (lub wg .env)
* **Baza:** gym_db

---

## 📝 Przydatne komendy

| Komenda | Opis |
| :--- | :--- |
| `docker-compose up` | Uruchamia serwer i bazę (widoczne logi). |
| `docker-compose up -d` | Uruchamia serwer w tle. |
| `docker-compose down` | Zatrzymuje i usuwa kontenery. |
| `docker-compose down -v` | Zatrzymuje kontenery i **usuwa wolumen bazy danych** (tracisz dane!). |
| `docker logs -f gym-backend` | Podgląd logów aplikacji API na żywo. |