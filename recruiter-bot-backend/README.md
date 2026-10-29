# Recruiter Bot

A backend service that ranks candidates for job opportunities and jobs for candidates using skill overlap and professional experience.

The repository includes the Recruiter Bot application and a standalone SQL analytics challenge.

## Features

- Candidate matching across 15 fictional candidates and six job openings.
- Ranked matches in both directions.
- Numerical scores, matched skills, missing skills, and explanations.
- SQLite database with handwritten SQL and no ORM or query builder.
- Repeatable database initialization and seeding.
- Input validation and consistent JSON error responses.
- Automated tests for matching, APIs, database integrity, and SQL queries.
- SQL analytics for recruiter performance and hiring outcomes.

## Tech Stack

- Node.js 24.13+ (24.x release line)
- TypeScript
- Express 5
- SQLite using Node.js's native `node:sqlite` driver
- Vitest
- Supertest

The built-in SQLite driver avoids the need for a separate database server or native addon compilation.

## Getting Started

### Prerequisites

Install Node.js 24.13 or later in the 24.x release line, npm, and Git.

Check your installed versions:

```powershell
node --version
npm.cmd --version
git --version
```

### Installation

Clone the repository and navigate to the project directory:

```powershell
git clone https://github.com/PrajnaMS10/RecruiterBot-Backend.git
Set-Location RecruiterBot-Backend
npm.cmd install
```

### Initialize the Database

```powershell
npm.cmd run db:init
```

This creates the database tables and inserts the supplied candidates and jobs.

The database seed command is also available:

```powershell
npm.cmd run db:seed
```

Both commands perform repeatable initialization, adding missing seed records without deleting existing data. Running both is unnecessary.

The default database file is `data/recruiterflow.db`. The server also initializes a fresh database automatically.

### Start the Development Server

```powershell
npm.cmd run dev
```

The server starts at:

`http://localhost:3000`

Keep the terminal running while using the API. Stop the server with `Ctrl+C`.

### Run the Compiled Application

```powershell
npm.cmd run build
npm.cmd start
```

The build command compiles TypeScript into the `dist/` directory.

### Configuration

The default port is `3000`. To use another port in PowerShell:

```powershell
$env:PORT = "3001"
npm.cmd run dev
```

The optional `DATABASE_PATH` environment variable can be used to change the database location.

Run application commands from the project root because the schema and seed SQL files are loaded relative to that directory.

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| GET | `/health` | Check application and database health |
| GET | `/jobs/:id/matches` | Rank candidates for a job |
| GET | `/candidates/:id/matches` | Rank jobs for a candidate |

### Example Requests

With the server running, open a second terminal:

```powershell
curl.exe http://localhost:3000/health
curl.exe http://localhost:3000/jobs/1/matches
curl.exe http://localhost:3000/candidates/1/matches
```

To format a JSON response in PowerShell:

```powershell
Invoke-RestMethod http://localhost:3000/jobs/1/matches |
    ConvertTo-Json -Depth 10
```

The health endpoint returns:

```json
{
  "status": "ok"
}
```

The job matching endpoint returns the requested job and its ranked candidate matches. Each match includes candidate details, scores, matched and missing skills, and an explanation.

The candidate matching endpoint returns the candidate and ranked job matches, including job details, required skills, culture keywords, scores, and explanations.

### Error Responses

- `400 Bad Request` — Invalid ID.
- `404 Not Found` — Unknown candidate, job, or route.
- `500 Internal Server Error` — Unexpected internal or database error.

IDs must be positive safe integers without leading zeros. Errors are returned as JSON, for example:

```json
{
  "error": "Job not found"
}
```

Internal stack traces are not returned to clients.

## Matching Algorithm

Each candidate-job pair receives a score between 0 and 100.

**Skill match** measures the proportion of distinct required skills matched by the candidate.

**Experience match** measures the candidate's experience relative to the job's minimum experience requirement, capped at full credit.

The scoring formula is:

```text
skillRatio = matched distinct required skills / total distinct required skills

experienceRatio = min(candidate experience / job minimum experience, 1)

score = 70 × skillRatio + 30 × experienceRatio
```

Skills contribute 70% of the score, while experience contributes 30%.

### Example

Backend Detective requires three skills and at least three years of experience.

| Candidate | Required Skills Matched | Skill Points | Experience Points | Total |
|---|---:|---:|---:|---:|
| Sherlock H. | 3 of 3 | 70 | 30 | 100 |
| Sheldon C. | 1 of 3 | 23.33 | 30 | 53.33 |

### Edge Cases and Ranking

- No required skills: full skill credit.
- Zero minimum experience: full experience credit.
- Experience below the minimum: proportional experience credit.
- Experience above the minimum: capped at full experience credit.
- Extra candidate skills do not increase or reduce the score.
- Scores are rounded to two decimal places for output.
- Ranking uses unrounded scores, highest first.
- Ties are resolved by candidate name or job title in ascending order, followed by ID.
- Both endpoints use the same scoring function.

Availability, traits, culture keywords, and quirks are returned as information but do not affect the numerical score.

## Design Decisions and Trade-offs

Skills receive 70% of the weight because relevant capabilities should matter more than years of experience alone. Experience receives 30%, with no additional reward for exceeding the minimum.

Candidates below the experience requirement remain visible rather than being excluded. Candidates with no required skill matches can still receive up to 30 points for experience, with the skill breakdown making the limitation clear.

Skill matching uses exact normalized identifiers rather than synonyms or fuzzy matching. This keeps the results deterministic and explainable but limits semantic matching.

Availability is treated separately from capability, while personality labels are informational rather than numerical scoring factors.

Matches are calculated when requested instead of being stored, avoiding stale scores when data changes.

## Database Design

The application uses eight relational tables:

- `candidates`
- `jobs`
- `skills`
- `keywords`
- `candidate_skills`
- `candidate_traits`
- `job_skills`
- `job_culture`

Shared skill and keyword tables avoid repeating definitions. Relationship tables use composite primary keys and foreign keys.

Foreign-key enforcement is enabled for each database connection. Constraints validate nonnegative experience, supported availability values, and required fields.

Schema creation, seed inserts, and retrieval use handwritten SQL. User-supplied IDs are bound through parameterized queries. No ORM or query builder is used.

Initialization runs within a transaction, and seed inserts use `INSERT OR IGNORE` to make repeated initialization safe without replacing existing records.

## SQL Analytics

The `sql_detective.sql` file contains a standalone SQL schema, sample dataset, and five analytical queries.

The queries cover:

1. Open job postings and their recruiters.
2. Counts of applicants at the Final interview stage for each job, including jobs with zero.
3. Applicants associated with multiple distinct job postings.
4. Final-stage interview conversion rates for qualifying recruiters.
5. The recruiter with the most successful placements in each department, using a SQL window function.

For applicant identification, normalized email and name are used to avoid relying on names alone. Repeated interview stages do not inflate distinct-job counts.

Recruiter conversion rates include recruiters with at least three Final interviews. Successful placements are defined as passed Final-stage interviews.

The bonus query uses `ROW_NUMBER()` to rank recruiters within each department, breaking ties by the smallest recruiter ID. Departments with no successful placements are included with zero.

### Execute and Verify

Run the SQL queries and verify their results:

```powershell
npm.cmd run sql:run
npm.cmd run sql:test
```

- `sql:run` prints all five result tables.
- `sql:test` checks the expected results.

Both commands use a fresh in-memory SQLite database and do not modify the application database.

If the SQLite command-line tool is installed, the SQL file can also be executed directly:

```powershell
Get-Content -Raw .\sql_detective.sql | sqlite3 :memory:
```

## Testing and Build

Run the automated test suite:

```powershell
npm.cmd test
```

Run tests in watch mode:

```powershell
npm.cmd run test:watch
```

Run API smoke tests against the database file using HTTP requests:

```powershell
npm.cmd run test:smoke
```

Build the application and check TypeScript:

```powershell
npm.cmd run build
```

The automated tests cover:

- Exact, partial, and zero skill overlap.
- Experience requirements and scoring boundaries.
- Empty required skills and zero minimum experience.
- Deterministic ranking and rounding.
- Successful API responses and invalid or unknown IDs.
- Database error handling.
- Consistency across all 90 candidate-job pairs.
- Seed data and relational constraints.
- Repeatable database initialization.
- All five SQL analytics query results.

## Project Structure

```text
.
├── src/
│   ├── app.ts
│   ├── server.ts
│   ├── config/
│   │   └── database.ts
│   ├── db/
│   │   ├── schema.sql
│   │   ├── seed.sql
│   │   └── initialize.ts
│   ├── middleware/
│   │   └── errorHandler.ts
│   ├── repositories/
│   ├── routes/
│   ├── services/
│   │   └── matching.ts
│   └── types/
│       └── index.ts
├── scripts/
│   ├── seed.ts
│   ├── smoke.ts
│   └── sql.ts
├── tests/
│   ├── api.test.ts
│   ├── database.test.ts
│   ├── matching.test.ts
│   ├── sql.test.ts
│   └── fixtures/
│       └── seeds.json
├── data/
│   └── .gitkeep
├── sql_detective.sql
├── package.json
├── package-lock.json
├── tsconfig.json
├── vitest.config.ts
├── .gitignore
└── README.md
```

## Limitations and Future Improvements

This is a small backend service designed for a fixed dataset. It does not include candidate or job editing endpoints, authentication, pagination, or a database migration framework.

The synchronous SQLite driver and in-memory ranking are suitable for the current dataset. Larger datasets would require more selective queries, pagination, and concurrency planning.

Potential improvements include configurable scoring weights, skill priorities, synonym support, availability filters, and database migrations.

Node.js 24 may display an experimental warning for `node:sqlite`. This warning does not necessarily indicate a failed command.
