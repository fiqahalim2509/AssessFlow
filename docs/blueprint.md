# **App Name**: AssessFlow

## Core Features:

- User Authentication & Authorization: Secure user registration and login via email/password, with role-based access control (Admin, Candidate) protecting app routes and features.
- Exam & Question Management: Admin users can create new exams, set titles and durations, and manage associated multiple-choice questions including text, options, and correct answers.
- AI Question Generation Tool: Admin users can leverage a generative AI tool to suggest and create multiple-choice questions automatically based on provided topics or keywords for an exam.
- Candidate Exam Interface: Candidates can browse available exams, initiate a timed exam session, select their answers for each question, and navigate through the exam.
- Real-time Exam Timer: A dynamic countdown timer is prominently displayed to candidates during an active exam session, tracking the remaining time.
- Automated Scoring & Submission: Upon exam submission, scores are automatically calculated based on correct answers, and all detailed attempt results are saved and locked in Firestore.
- Personalized Results Dashboard: Candidates can view their past exam scores and submitted answers, while Admin users have access to comprehensive analytics and results for all candidates and exams.

## Style Guidelines:

- Primary brand color: A deep, professional blue (#2455A3) signifying trust and clarity, inspired by the platform's focus on assessment integrity and professional development.
- Background color: A light, almost off-white blue-gray (#ECF1F8) to ensure high readability for questions and content, maintaining a calm and focused environment.
- Accent color: A vibrant yet serene turquoise (#26BBDB) to highlight interactive elements, calls to action, and convey an inviting, user-friendly experience.
- Headline font: 'Space Grotesk' (sans-serif) for a modern, tech-forward, and crisp display of titles and prominent text.
- Body font: 'Inter' (sans-serif) chosen for its legibility and neutral tone, ideal for long-form questions, answer options, and general content to minimize cognitive load during assessments.
- Utilize a set of simple, line-based icons for navigation and actions (e.g., 'add question', 'start exam', 'submit') to ensure universal recognition and a clean aesthetic.
- Implement clean, modular layouts with clear hierarchy. Dashboards will use multi-column designs, while exam interfaces will prioritize a focused, single-question view with intuitive progress indicators.
- Incorporate subtle transitions for page navigation and content loading, along with immediate visual feedback on interactive elements like button clicks or answer selections, to enhance responsiveness without distraction.