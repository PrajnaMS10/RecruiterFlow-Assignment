-- SQLite; run once against a fresh database. Dataset preserved as supplied.
CREATE TABLE recruiters (
    id INT PRIMARY KEY,
    name VARCHAR(100),
    region VARCHAR(50)
);

CREATE TABLE job_postings (
    id INT PRIMARY KEY,
    title VARCHAR(100),
    recruiter_id INT,
    department VARCHAR(50),
    opened_date DATE,
    status VARCHAR(20)
);

CREATE TABLE applicants (
    id INT PRIMARY KEY,
    full_name VARCHAR(100),
    email VARCHAR(100),
    source VARCHAR(50),
    applied_date DATE
);

CREATE TABLE interviews (
    id INT PRIMARY KEY,
    applicant_id INT,
    job_posting_id INT,
    stage VARCHAR(20),
    scheduled_date DATE,
    outcome VARCHAR(20)
);


INSERT INTO recruiters VALUES
(1, 'Priya Shah', 'APAC'),
(2, 'Daniel Ortiz', 'NA'),
(3, 'Fatima Al-Sayed', 'EMEA'),
(4, 'Wei Zhang', 'APAC'),
(5, 'Grace Okafor', 'EMEA');


INSERT INTO job_postings VALUES
(1, 'Backend Engineer I', 1, 'Engineering', '2026-01-05', 'open'),
(2, 'Backend Engineer I', 2, 'Engineering', '2026-01-10', 'open'),
(3, 'Data Analyst', 3, 'Data', '2026-01-08', 'closed'),
(4, 'Backend Engineer II', 1, 'Engineering', '2026-02-01', 'open'),
(5, 'DevOps Engineer', 4, 'Infrastructure', '2026-01-20', 'open'),
(6, 'Data Analyst', 5, 'Data', '2026-02-05', 'on_hold'),
(7, 'Backend Engineer I', 2, 'Engineering', '2026-02-15', 'closed');


INSERT INTO applicants VALUES
(1, 'Ananya Rao', 'ananya.rao@mail.com', 'LinkedIn', '2026-01-06'),
(2, 'Ananya Rao', 'Ananya.Rao@mail.com', 'Referral', '2026-02-04'),
(3, 'Ben Turner', 'ben.turner@mail.com', 'Job Board', '2026-01-07'),
(4, 'Chloe Martin', 'chloe.martin@mail.com', NULL, '2026-01-09'),
(5, 'Devansh Patel', 'devansh.patel@mail.com', 'LinkedIn', '2026-01-11'),
(6, 'Elena Popescu', 'elena.popescu@mail.com', 'Referral', '2026-01-12'),
(7, 'Farid Haidari', 'farid.haidari@mail.com', 'Job Board', '2026-01-13'),
(8, 'Grace Lin', 'grace.lin@mail.com', 'LinkedIn', '2026-01-15'),
(9, 'Hassan Malik', 'hassan.malik@mail.com', NULL, '2026-01-16'),
(10, 'Isla Fraser', 'isla.fraser@mail.com', 'Referral', '2026-01-18'),
(11, 'Jonas Weber', 'jonas.weber@mail.com', 'Job Board', '2026-02-10');


INSERT INTO interviews VALUES
(1, 1, 1, 'Screen', '2026-01-10', 'passed'),
(2, 1, 1, 'Technical', '2026-01-15', 'passed'),
(3, 1, 1, 'Final', '2026-01-22', 'passed'),
(4, 2, 4, 'Screen', '2026-02-05', 'passed'),
(5, 3, 1, 'Screen', '2026-01-11', 'passed'),
(6, 3, 1, 'Technical', '2026-01-16', 'failed'),
(7, 3, 3, 'Final', '2026-01-28', 'passed'),
(8, 4, 1, 'Screen', '2026-01-12', 'passed'),
(9, 4, 1, 'Final', '2026-01-24', 'failed'),
(10, 5, 2, 'Screen', '2026-01-14', 'passed'),
(11, 5, 2, 'Technical', '2026-01-19', 'passed'),
(12, 5, 2, 'Final', '2026-01-25', 'passed'),
(13, 6, 2, 'Screen', '2026-01-15', 'passed'),
(14, 6, 2, 'Final', '2026-01-26', 'failed'),
(15, 7, 2, 'Screen', '2026-01-16', 'no_show'),
(16, 8, 4, 'Screen', '2026-02-03', 'passed'),
(17, 8, 4, 'Technical', '2026-02-08', 'passed'),
(18, 8, 4, 'Final', '2026-02-12', 'passed'),
(19, 9, 4, 'Screen', '2026-02-04', 'passed'),
(20, 9, 4, 'Final', '2026-02-14', 'passed'),
(21, 10, 5, 'Screen', '2026-01-22', 'passed'),
(22, 10, 5, 'Technical', '2026-01-28', NULL),
(23, 11, 7, 'Final', '2026-02-20', 'passed'),
(24, 6, 7, 'Final', '2026-02-21', 'failed');


-- Question 1: Open postings and their recruiters.
SELECT j.id, j.title, j.department, j.opened_date, r.name AS recruiter
FROM job_postings j JOIN recruiters r ON r.id=j.recruiter_id
WHERE j.status='open' ORDER BY j.id;

-- Question 2: Distinct applicant records reaching Final, including zero counts.
SELECT j.id, j.title, COUNT(DISTINCT i.applicant_id) AS final_applicants
FROM job_postings j LEFT JOIN interviews i ON i.job_posting_id=j.id AND i.stage='Final'
GROUP BY j.id,j.title ORDER BY j.id;

-- Question 3: Identity = normalized email AND normalized name; never name alone.
-- Missing email falls back to applicant ID, avoiding merging unrelated unknowns.
-- Interviews establish applications; distinct jobs prevent stage duplication.
SELECT MIN(a.full_name) AS full_name, LOWER(TRIM(a.email)) AS email,
 COUNT(DISTINCT i.job_posting_id) AS job_count
FROM applicants a JOIN interviews i ON i.applicant_id=a.id
GROUP BY CASE WHEN NULLIF(TRIM(a.email),'') IS NULL THEN 'id:' || a.id
 ELSE 'email:' || LOWER(TRIM(a.email)) END, LOWER(TRIM(a.full_name))
HAVING COUNT(DISTINCT i.job_posting_id)>1 ORDER BY full_name,email;

-- Question 4: All Final interviews count in denominator, including pending/no-show.
SELECT r.id, r.name, COUNT(*) AS final_interviews,
 SUM(CASE WHEN i.outcome='passed' THEN 1 ELSE 0 END) AS passed,
 ROUND(100.0*SUM(CASE WHEN i.outcome='passed' THEN 1 ELSE 0 END)/NULLIF(COUNT(*),0),2) AS conversion_percent
FROM recruiters r JOIN job_postings j ON j.recruiter_id=r.id
JOIN interviews i ON i.job_posting_id=j.id AND i.stage='Final'
GROUP BY r.id,r.name HAVING COUNT(*)>=3 ORDER BY conversion_percent DESC,r.id;

-- Question 5 (Bonus): Ties choose smallest recruiter ID. Include departments
-- with zero placements; choose their smallest owning recruiter ID consistently.
WITH placements AS (
 SELECT j.department,r.id,r.name,
 SUM(CASE WHEN i.stage='Final' AND i.outcome='passed' THEN 1 ELSE 0 END) AS placement_count
 FROM job_postings j JOIN recruiters r ON r.id=j.recruiter_id
 LEFT JOIN interviews i ON i.job_posting_id=j.id
 GROUP BY j.department,r.id,r.name
), ranked AS (
 SELECT *,ROW_NUMBER() OVER (PARTITION BY department ORDER BY placement_count DESC,id) AS position FROM placements
)
SELECT department,id AS recruiter_id,name AS recruiter,placement_count
FROM ranked WHERE position=1 ORDER BY department;
