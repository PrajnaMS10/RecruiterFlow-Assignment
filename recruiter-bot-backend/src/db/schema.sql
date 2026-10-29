CREATE TABLE IF NOT EXISTS candidates (
 id INTEGER PRIMARY KEY, name TEXT NOT NULL UNIQUE,
 experienceYears REAL NOT NULL CHECK(experienceYears >= 0),
 availability TEXT NOT NULL CHECK(availability IN ('Immediate','2 weeks','Not looking')),
 quirk TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS jobs (
 id INTEGER PRIMARY KEY, title TEXT NOT NULL UNIQUE,
 minimumExperience REAL NOT NULL CHECK(minimumExperience >= 0), tagline TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS skills (name TEXT PRIMARY KEY CHECK(length(name)>0 AND name=lower(name)));
CREATE TABLE IF NOT EXISTS keywords (name TEXT PRIMARY KEY CHECK(length(name)>0 AND name=lower(name)));
CREATE TABLE IF NOT EXISTS candidate_skills (
 candidate_id INTEGER NOT NULL REFERENCES candidates(id), skill TEXT NOT NULL REFERENCES skills(name), PRIMARY KEY(candidate_id,skill)
);
CREATE TABLE IF NOT EXISTS candidate_traits (
 candidate_id INTEGER NOT NULL REFERENCES candidates(id), keyword TEXT NOT NULL REFERENCES keywords(name), PRIMARY KEY(candidate_id,keyword)
);
CREATE TABLE IF NOT EXISTS job_skills (
 job_id INTEGER NOT NULL REFERENCES jobs(id), skill TEXT NOT NULL REFERENCES skills(name), PRIMARY KEY(job_id,skill)
);
CREATE TABLE IF NOT EXISTS job_culture (
 job_id INTEGER NOT NULL REFERENCES jobs(id), keyword TEXT NOT NULL REFERENCES keywords(name), PRIMARY KEY(job_id,keyword)
);
