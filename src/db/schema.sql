-- Run in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS colleges (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(200) NOT NULL,
  trust_name  VARCHAR(200),
  affiliation VARCHAR(200),
  address     VARCHAR(300),
  logo_url    TEXT,
  created_at  TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tc_records (
  id               SERIAL PRIMARY KEY,
  tc_number        VARCHAR(20) UNIQUE NOT NULL,
  id_number        VARCHAR(50),
  student_name     VARCHAR(200) NOT NULL,
  parent_name      VARCHAR(200),
  gender           VARCHAR(10),
  nationality      VARCHAR(100),
  religion         VARCHAR(100),
  community        VARCHAR(100),
  caste            VARCHAR(100),
  dob              DATE,
  dob_words        VARCHAR(200),
  admission_date   DATE,
  study_period     VARCHAR(100),
  leaving_date     DATE,
  class_at_leaving VARCHAR(100),
  medium           VARCHAR(100),
  promotion_status VARCHAR(100),
  application_date DATE,
  reason           TEXT,
  conduct          VARCHAR(100),
  college_id       INTEGER REFERENCES colleges(id),
  created_at       TIMESTAMP DEFAULT NOW()
);

-- Enable Row Level Security and allow all for anon key (adjust policies as needed)
ALTER TABLE colleges   ENABLE ROW LEVEL SECURITY;
ALTER TABLE tc_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_all_colleges"   ON colleges   FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_tc_records" ON tc_records FOR ALL USING (true) WITH CHECK (true);
