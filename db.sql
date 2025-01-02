-- public.applicant definition

-- Drop table

-- DROP TABLE applicant;

CREATE TABLE applicant (
	id serial4 NOT NULL,
	"name" varchar(60) NOT NULL,
	email varchar(60) NOT NULL,
	"password" varchar(60) NOT NULL,
	is_active bool NOT NULL DEFAULT true,
	creation_date date NOT NULL,
	modification_date date NOT NULL,
	direction varchar(60) NULL,
	identification int4 NULL,
	phone_number varchar(60) NULL,
	birth_date date NULL,
	CONSTRAINT "PK_f4a6e907b8b17f293eb073fc5ea" PRIMARY KEY (id)
);


-- public."language" definition

-- Drop table

-- DROP TABLE "language";

CREATE TABLE "language" (
	id serial4 NOT NULL,
	"name" varchar(60) NOT NULL,
	CONSTRAINT "PK_cc0a99e710eb3733f6fb42b1d4c" PRIMARY KEY (id)
);


-- public.recluter definition

-- Drop table

-- DROP TABLE recluter;

CREATE TABLE recluter (
	id serial4 NOT NULL,
	"name" varchar(60) NOT NULL,
	email varchar(60) NOT NULL,
	"password" varchar(60) NOT NULL,
	is_active bool NOT NULL DEFAULT true,
	creation_date date NOT NULL,
	modification_date date NOT NULL,
	CONSTRAINT "PK_8b7a61e5ceab21abdeb20d7fb00" PRIMARY KEY (id)
);


-- public.resume definition

-- Drop table

-- DROP TABLE resume;

CREATE TABLE resume (
	id serial4 NOT NULL,
	title varchar(60) NOT NULL,
	experience_years int4 NOT NULL,
	about_me text NOT NULL,
	create_date date NOT NULL,
	modification_date date NOT NULL,
	"applicantId" int4 NULL,
	CONSTRAINT "PK_7ff05ea7599e13fac01ac812e48" PRIMARY KEY (id),
	CONSTRAINT "FK_76dc2a925952542bc16de2142b5" FOREIGN KEY ("applicantId") REFERENCES applicant(id)
);


-- public.resume_to_language definition

-- Drop table

-- DROP TABLE resume_to_language;

CREATE TABLE resume_to_language (
	id serial4 NOT NULL,
	language_level int2 NOT NULL,
	"resumeId" int4 NULL,
	"languageId" int4 NULL,
	CONSTRAINT "PK_347315ecb797256b9a665f7e025" PRIMARY KEY (id),
	CONSTRAINT "FK_2c6c66c6ab590b2f670c7c0d6d8" FOREIGN KEY ("languageId") REFERENCES "language"(id),
	CONSTRAINT "FK_82690b9fd032e41544f04de02fa" FOREIGN KEY ("resumeId") REFERENCES resume(id)
);


-- public.skill definition

-- Drop table

-- DROP TABLE skill;

CREATE TABLE skill (
	id serial4 NOT NULL,
	"name" varchar(60) NOT NULL,
	"resumeId" int4 NULL,
	CONSTRAINT "PK_a0d33334424e64fb78dc3ce7196" PRIMARY KEY (id),
	CONSTRAINT "FK_fa2b5ae9b6fd6021d111c823aca" FOREIGN KEY ("resumeId") REFERENCES resume(id)
);


-- public.vacant definition

-- Drop table

-- DROP TABLE vacant;

CREATE TABLE vacant (
	id serial4 NOT NULL,
	title varchar(60) NOT NULL,
	description text NOT NULL,
	experience_years float8 NULL,
	creation_date date NOT NULL,
	modification_date date NOT NULL,
	salary_offer int4 NULL,
	job_type public."vacant_job_type_enum" NOT NULL,
	recluter_id int4 NULL,
	CONSTRAINT "PK_5f9866fffb96a3ad8c5e7c9e477" PRIMARY KEY (id),
	CONSTRAINT fk_recluter FOREIGN KEY (recluter_id) REFERENCES recluter(id)
);


-- public.vacant_to_language definition

-- Drop table

-- DROP TABLE vacant_to_language;

CREATE TABLE vacant_to_language (
	id serial4 NOT NULL,
	laguage_level int2 NOT NULL,
	"vacantId" int4 NULL,
	"languageId" int4 NULL,
	CONSTRAINT "PK_91b4892d17d20feab8fbbee8373" PRIMARY KEY (id),
	CONSTRAINT "FK_920ccab6162f43a22e7a93931d4" FOREIGN KEY ("languageId") REFERENCES "language"(id),
	CONSTRAINT "FK_a47f9801ab0caae29a36ff6868b" FOREIGN KEY ("vacantId") REFERENCES vacant(id)
);


-- public.application definition

-- Drop table

-- DROP TABLE application;

CREATE TABLE application (
	id serial4 NOT NULL,
	feed_back text NULL,
	affinity float8 NULL,
	status public."application_status_enum" NOT NULL DEFAULT 'APPLIED'::application_status_enum,
	create_applicantion_date date NOT NULL,
	ia_time_taken int4 NULL,
	"vacantId" int4 NULL,
	"resumeId" int4 NULL,
	CONSTRAINT "PK_569e0c3e863ebdf5f2408ee1670" PRIMARY KEY (id),
	CONSTRAINT "FK_27be63440a0f4933f2f67717a72" FOREIGN KEY ("vacantId") REFERENCES vacant(id),
	CONSTRAINT "FK_d766061b6c7f8c34bccd454f4f8" FOREIGN KEY ("resumeId") REFERENCES resume(id)
);


-- public.education definition

-- Drop table

-- DROP TABLE education;

CREATE TABLE education (
	id serial4 NOT NULL,
	institute varchar(60) NOT NULL,
	title varchar(60) NOT NULL,
	start_date date NOT NULL,
	end_date date NULL,
	keep_study bool NULL,
	"resumeId" int4 NULL,
	CONSTRAINT "PK_bf3d38701b3030a8ad634d43bd6" PRIMARY KEY (id),
	CONSTRAINT "FK_0f65a811d17b239cbcd6afdcc58" FOREIGN KEY ("resumeId") REFERENCES resume(id)
);


-- public.experience definition

-- Drop table

-- DROP TABLE experience;

CREATE TABLE experience (
	id serial4 NOT NULL,
	rol varchar(60) NOT NULL,
	company varchar(60) NOT NULL,
	start_date date NOT NULL,
	end_date date NULL,
	keep_working bool NULL,
	description text NOT NULL,
	"resumeId" int4 NULL,
	CONSTRAINT "PK_5e8d5a534100e1b17ee2efa429a" PRIMARY KEY (id),
	CONSTRAINT "FK_9bfd4060e7f71a77c6b82b1745b" FOREIGN KEY ("resumeId") REFERENCES resume(id)
);


-- public.laboral_reference definition

-- Drop table

-- DROP TABLE laboral_reference;

CREATE TABLE laboral_reference (
	id serial4 NOT NULL,
	"name" varchar(60) NOT NULL,
	"number" varchar(60) NOT NULL,
	rol varchar(60) NOT NULL,
	company varchar(60) NOT NULL,
	"resumeId" int4 NULL,
	CONSTRAINT "PK_15098e7f5eeedd12001c88dd806" PRIMARY KEY (id),
	CONSTRAINT "FK_f0ac42313fe412f8cddbcb430a6" FOREIGN KEY ("resumeId") REFERENCES resume(id)
);


-- public.personal_reference definition

-- Drop table

-- DROP TABLE personal_reference;

CREATE TABLE personal_reference (
	id serial4 NOT NULL,
	"name" varchar(60) NOT NULL,
	"number" varchar(60) NOT NULL,
	relationship varchar(60) NOT NULL,
	"resumeId" int4 NULL,
	CONSTRAINT "PK_5c522225265ac5187319f4a4d2a" PRIMARY KEY (id),
	CONSTRAINT "FK_354ca4e335540012ef10e697d4b" FOREIGN KEY ("resumeId") REFERENCES resume(id)
);