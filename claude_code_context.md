# Project Context for Claude Code

## What we are building
We are building a web platform that helps job seekers turn their real GitHub work into a recruiter-friendly, job-specific technical summary.

A user signs into our platform with GitHub and gives permission for us to inspect their contribution history. We analyze their contributions across repositories, extract meaningful technical signals, and store enriched representations of that work in a vector database.

Then, inside the app, the user submits a job posting URL. We scrape and parse the posting to identify the core requirements, technologies, responsibilities, and signals of what the company actually wants. Using those requirements, we retrieve the most relevant GitHub contributions from that user’s indexed history and generate a shareable page on our domain.

That shareable page is meant for recruiters, hiring managers, or anyone reviewing the candidate. It should act like a one-page technical cover letter backed by actual GitHub evidence. Instead of a recruiter manually digging through commits, pull requests, repos, and contribution history, the page should clearly explain why this person is a fit for that specific role and reference concrete work they have done.

## Core product idea
The product is basically a relevance engine between:
1. a job posting’s technical and role requirements
2. a candidate’s actual GitHub contribution history

The output is not a generic AI summary. It should be a grounded, evidence-based page that maps job requirements to real contributions.

## Main user flow
1. User lands on the platform.
2. User authenticates with GitHub.
3. We ingest and analyze their GitHub contributions.
4. We enrich those contributions with tags, scores, embeddings, and metadata.
5. User submits a job posting URL in the app.
6. We scrape and structure the job posting.
7. We match the job requirements against the most relevant GitHub contributions.
8. We generate a public or shareable link on our domain, likely tied to the user’s username and that specific job.
9. A recruiter opens that link and sees a concise, polished, evidence-backed summary of the user’s fit for the role.

## What the recruiter-facing page should do
The recruiter-facing page should communicate, at a glance:
- who the candidate is
- why they are relevant for this specific role
- which job requirements they appear to satisfy
- which GitHub contributions support those claims
- some lightweight stats, signals, or highlights that make the case more tangible

The page should feel like a mix of:
- a technical cover letter
- a job-specific fit summary
- a curated GitHub evidence report

It should not feel like a raw GitHub dump or a generic AI paragraph.

## GitHub contribution analysis concept
Once the user authenticates, we examine their GitHub contribution history. That can include things like:
- repositories they contributed to
- commits
- pull requests
- issues
- code changes
- possibly repo metadata and languages

We then build a vector database from those contributions so we can do semantic retrieval later when matching against job postings.

Each contribution or grouped unit of work should be enriched with metadata and signals such as:
- what the work is about
- technologies involved
- domain or problem area
- complexity
- usefulness or impact
- quality/relevance signals
- tags that help retrieval and explanation

## Multi-agent analysis system
We already have the concept of a multi-agent system that scores and tags GitHub contributions.

The purpose of this multi-agent system is to take raw contribution data and transform it into structured, high-signal artifacts that are easier to retrieve and reason over later.

Examples of what agents may be responsible for:
- summarizing a contribution
- tagging technologies and concepts
- estimating complexity
- estimating usefulness or business/engineering relevance
- identifying evidence that maps well to job requirements
- generating embeddings or structured retrieval metadata

Important principle: every generated claim should stay grounded in real GitHub evidence.

## Job posting ingestion concept
When the user submits a job posting URL, we need to:
1. scrape the job posting content
2. extract the important requirements from it
3. structure those requirements in a way that can be matched against GitHub contribution data

The scraper/parser should identify things like:
- core technical skills
- required frameworks/languages/tools
- years-of-experience style signals if relevant
- responsibilities
- nice-to-haves
- domain context
- seniority clues

The goal is not just to summarize the posting. The goal is to convert it into structured requirement signals that our matching system can use.

## Matching concept
After we have:
- structured job requirements
- enriched GitHub contributions in a vector database

We retrieve the most relevant contributions and use them to build a grounded explanation of fit.

This means the system should be able to say things like:
- this role wants backend API development, and the user has relevant contributions in these repos
- this role values distributed systems or production engineering, and these pull requests or commits show that
- this role wants React or TypeScript, and here are the most relevant contributions supporting that

The point is evidence-based matching, not generic résumé rewriting.

## Shareable link generation concept
A major feature is generating a shareable link on our own domain after job submission.

This link should:
- be unique to the user and the job posting
- be easy to paste into a LinkedIn comment, résumé, application, or direct message to a recruiter
- open a polished recruiter-facing page

This page is essentially a personalized, job-specific proof-of-skill page.

A likely shape is something like:
- `/username/company-role`
- `/username/job/<id>`
- or another clean permalink structure

Exact route structure can be decided in implementation, but the key idea is that each generated page is tied to both:
- a specific authenticated user
- a specific submitted job posting

## What I am building right now
My current implementation focus is:
1. job posting scraping/parsing
2. shareable link generation

That means the immediate work should prioritize:
- taking a submitted job URL
- fetching and parsing the page content
- extracting structured requirements
- storing the processed job post in a way that can later connect to a generated page
- creating the shareable page route or permalink generation logic

This is the area Claude Code should mainly help with right now.

## What my teammate is working on
My teammate is working on more of the backend boilerplate and core Express setup.

That likely includes things like:
- Express app structure
- server boilerplate
- foundational routing setup
- possibly auth scaffolding and shared backend infrastructure
- other baseline application plumbing

So when generating code or proposing structure, keep in mind that some lower-level Express scaffolding may be owned by another person and may already be in progress.

## Expectations for implementation help
When helping with implementation, prioritize:
- practical architecture
- clean data flow
- grounded retrieval and generation
- modular design that can plug into existing Express backend work
- clear boundaries between ingestion, analysis, matching, and page generation

Avoid drifting into vague product copy or overcomplicated abstractions unless they directly help implementation.

## Product principles
- Everything should be grounded in real GitHub evidence.
- The recruiter-facing output should be concise, useful, and credible.
- The generated page should save recruiters time.
- The system should make technical contributions legible to non-deeply-technical reviewers without losing specificity.
- Matching should be job-specific, not generic.
- The platform should highlight actual tangible work, not just claimed skills.

## Suggested mental model for the system
Think of the system as four main layers:

### 1. Identity and ingestion
- GitHub auth
- permissioned access to contribution history
- fetching contribution data

### 2. Enrichment and indexing
- multi-agent scoring/tagging/summarization
- embeddings
- vector database storage
- metadata indexing

### 3. Job understanding and matching
- scrape job posting
- extract requirements
- retrieve relevant contributions
- map requirements to evidence

### 4. Presentation and sharing
- generate permalink
- render recruiter-facing summary page
- display fit summary, proof points, and references

## Near-term coding priority
For now, Claude Code should treat the highest-priority problem as:
- implementing the job post scraping pipeline
- structuring parsed job requirements
- wiring job submissions to a generated shareable link/page

Everything else should support that direction.

## Good implementation mindset
When writing code or proposing architecture, optimize for:
- future integration with GitHub contribution retrieval and vector search
- easy handoff between teammate-owned Express boilerplate and my feature work
- structured data models for jobs, generated pages, and requirement extraction
- clean interfaces for later plugging in retrieval and generation

## One-sentence product summary
This is a web app that turns a user’s GitHub contribution history into a job-specific, recruiter-friendly proof-of-fit page by matching real technical contributions against a submitted job posting.
