# Health Finder

System zarządzania siłownią/placówką zdrowia. Aplikacja składa się z backendu opartego na **NestJS**, frontendu zbudowanego w **React** oraz bazy danych **PostgreSQL**. Całe środowisko jest skonteneryzowane przy użyciu **Docker Compose**.

## Wymagania

- **Docker** oraz **Docker Compose** zainstalowane na komputerze.
- (Opcjonalnie) **Node.js** jeśli chcesz korzystać z CLI lokalnie.

## Szybki Start

1. Skopiuj przykładowy plik konfiguracyjny:
   ```bash
   cp backend/.env.example backend/.env
   ```
   
   Możesz edytować `.env` w razie potrzeby (domyślne wartości działają z docker-compose).

2. Uruchom środowisko (Frontend + Backend + Baza Danych):
   ```bash
   docker-compose up --build
   ```
   
   Flagę `--build` dodajemy przy pierwszym uruchomieniu lub po zmianach w `package.json`.

3. Aplikacje są dostępne pod adresami:
   - **Frontend**: http://localhost:5173
   - **Backend API**: http://localhost:3000


## Testy

Backend zawiera testy jednostkowe oraz funkcjonalne:

* **Testy jednostkowe** - każdy moduł posiada własne pliki testów (*.spec.ts)
* **Testy funkcjonalne (E2E)** - znajdują się w katalogu `backend/test/`

Uruchamianie testów:

```bash
# Testy jednostkowe
cd backend
npm run test

# Testy funkcjonalne (E2E)
npm run test:e2e

# Testy funkcjonalne konkretnego modułu
npm run test:e2e user-management
```

## Struktura Projektu

Projekt podzielony jest na:

* **backend/** - API NestJS
  * **src/database/** - Konfiguracja TypeORM i połączenia z PostgreSQL
  * **src/common/** - Elementy współdzielone (Enumy, Serwisy)
  * **src/modules/** - Logika biznesowa (user-management, scheduling, facilities, engagement)

* **frontend/** - Aplikacja React
  * **src/pages/** - Strony aplikacji
  * **src/components/** - Komponenty UI
  * **src/lib/** - Serwisy komunikacji z API

## Dostęp do Bazy Danych

Połączenie za pomocą klienta SQL (DBeaver, PgAdmin, DataGrip):

* **Host:** localhost
* **Port:** 5432
* **Użytkownik:** admin
* **Hasło:** tajnehaslo
* **Baza:** gym_db

## Przydatne komendy

| Komenda | Opis |
| :--- | :--- |
| `docker-compose up` | Uruchamia wszystkie serwisy (widoczne logi) |
| `docker-compose up -d` | Uruchamia serwisy w tle |
| `docker-compose down` | Zatrzymuje i usuwa kontenery |
| `docker-compose down -v` | Zatrzymuje kontenery i usuwa wolumeny (tracisz dane!) |
| `docker-compose logs -f api` | Podgląd logów backendu na żywo |
| `docker-compose logs -f frontend` | Podgląd logów frontendu na żywo |