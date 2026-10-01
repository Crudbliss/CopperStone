const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');

const modulesData = [
    // -------------------------------------------------------------
    // 1. DISTRIBUTED INDIVIDUAL (DI Dominant -> Strengthening HC)
    // -------------------------------------------------------------
    {
        title: "Mastering Your Learning Matrix: Distributed Individual",
        description: "Personalized adaptive roadmap for Distributed Individual learners. Maximize self-directed learning and develop structured group collaboration skills (Hierarchical Collective).",
        quadrant_category: "Distributed Individual",
        difficulty: "Core",
        topic: "Adaptive Learning Strategy",
        estimated_time: "45 min",
        is_published: 1,
        is_archived: 0,
        chapters: [
            {
                title: "Chapter 1: Your Most Dominant Learning Modality",
                estimated_time: "15 min",
                content_blocks: [
                    {
                        type: "text",
                        content: `Welcome to your personalized MATRIX learning roadmap. This module is designed as an automated module guiding component to actively help you identify and improve your academic weaknesses. Let's dive into your results and unlock your full potential!\n\nYour assessment results are in, and you are officially a **Distributed Individual**! In this quadrant, the focus shifts toward self-directed learning. You take the initiative to access diverse resources such as digital platforms, books, and practical tools to facilitate personalized skill building and exploration.\n\nIn this quadrant, your primary objective is independent discovery. You are highly flexible, allowing yourself to tailor your educational path according to your specific interests and pace. When you sit down to study, you view it as your own individual responsibility, focusing intensely on the effort you invest to assimilate and report the knowledge you've accumulated.\n\nThis is a massive superpower in the BSIT program. Because you focus on flexible pacing, you excel at absorbing heavy technical fundamentals, from basic to advanced. You do not get easily distracted by group chatter when you need to memorize commands or trace logic. Your ability to navigate external digital platforms makes you incredibly reliable when it comes to open-ended technical challenges.`
                    },
                    {
                        type: "card",
                        title: "QUICK SUMMARY OF YOUR MODALITY",
                        items: [
                            "Self-Directed: You take the initiative to access diverse resources such as digital platforms, books, and practical tools.",
                            "Flexible Pacing: You allow yourself to tailor your educational path according to your specific interests and pace.",
                            "Solo Accountability: You view academic success as the direct result of the effort you invest individually."
                        ]
                    },
                    {
                        type: "text",
                        content: `However, relying strictly on this solo, teacher-independent mode is only one piece of the puzzle. Recognizing your baseline characteristics is the first step toward becoming a truly flexible, unstoppable IT professional.`
                    },
                    {
                        type: "card",
                        title: "KEY CHARACTERISTICS OF YOUR LEARNING MODE",
                        items: [
                            "Self-Directed: You take the initiative to access diverse resources independently.",
                            "Flexible Pacing: You tailor your educational path according to specific interests and pace.",
                            "Resource-Driven: You facilitate personalized skill building and exploration through practical tools.",
                            "Solo Accountability: You view academic success as the direct result of the effort you invest individually."
                        ]
                    },
                    {
                        type: "video_card",
                        title: "The Solo Achiever: Strengths of Self-Directed Learning",
                        duration: "3:15 mins",
                        url: "https://www.youtube.com/watch?v=k9WUpZqS_pU"
                    },
                    {
                        type: "video_card",
                        title: "How to Maximize Your Focus During Solo Coding Sessions",
                        duration: "4:20 mins",
                        url: "https://www.youtube.com/watch?v=kJQP7kiw5Fk"
                    },
                    {
                        type: "tips",
                        title: "STEP-BY-STEP TIPS FOR MAXIMIZING YOUR DOMINANT STRENGTH",
                        items: [
                            "Curate your digital resources: You might find it helpful to organize your favorite forums and documentation bookmarks before starting a coding project to ensure your independent exploration is highly efficient.",
                            "Consider mapping out your own milestones: Breaking down your semester schedule into a chronological sequence can be a great way to study topics strictly from basic to advanced.",
                            "Set up a solo environment: To block out distractions, you could try setting up a dedicated, quiet digital workspace when reviewing foundational concepts."
                        ]
                    }
                ],
                questions: [
                    {
                        question_text: "What is the primary strength of a Distributed Individual learner in a BSIT program?",
                        question_type: "multiple_choice",
                        options: [
                            "Waiting for direct instructor instructions for every task",
                            "Self-directed exploration, flexible pacing, and utilizing diverse digital tools",
                            "Only participating in large group lectures without individual study",
                            "Memorizing answers without hands-on coding practice"
                        ],
                        correct_answer: "Self-directed exploration, flexible pacing, and utilizing diverse digital tools",
                        explanation: "Distributed Individual learners excel in independent discovery, finding documentation, and pacing their learning flexibly."
                    }
                ]
            },
            {
                title: "Chapter 2: Why It Is Important to Strengthen Your Least Dominant Quadrant",
                estimated_time: "15 min",
                content_blocks: [
                    {
                        type: "text",
                        content: `While your solo focus is excellent, attempting to navigate a diverse BSIT curriculum using only a single, uniform method creates severe friction in academic development. Your profile indicates that your absolute weakest area is the exact opposite of your dominant mode: the **Hierarchical Collective** quadrant. This mode involves group instruction conducted under structured leadership.\n\nWhy does this matter? Because the modern IT curriculum demands constant practical application and complex problem-solving. In the real world, there will not always be the freedom to just figure things out on your own. Often, a central figure, such as a teacher or coach, directs a group of learners toward a shared goal.\n\nIf you remain trapped exclusively in the Distributed Individual quadrant, you risk extreme academic frustration when faced with strict group workshops or standardized corporate training. Strict, unstructured solo formats are highly ineffective for teaching the fluid, fast-paced realities of agile software development where entire teams must align. You need to be able to pivot.\n\nStrengthening this non-dominant quadrant is about giving yourself options. The goal is to learn how to maintain consistent delivery and organization across a collective audience, rather than waiting to just do things at your own pace. By building these collaborative muscles, you transform from a student who strictly learns alone into an adaptable tech professional who can ensure that all members of the group acquire the same core competencies simultaneously.`
                    },
                    {
                        type: "card",
                        title: "QUICK SUMMARY OF YOUR CHALLENGE",
                        items: [
                            "The Friction: Relying entirely on single, uniform study habits creates roadblocks in dynamic, team-based IT environments.",
                            "The Missing Link: You need to embrace the Hierarchical Collective mode to thrive in structured group settings.",
                            "The Goal: Shift from self-directed pacing to actively following centralized leadership and moving as a unified cohort."
                        ]
                    },
                    {
                        type: "video_card",
                        title: "Why Tech Companies Hire for Team Alignment Over Solo Hacking",
                        duration: "5:00 mins",
                        url: "https://www.youtube.com/watch?v=r8dO10Jb_eE"
                    },
                    {
                        type: "video_card",
                        title: "The Danger of the 'One-Size-Fits-All' Study Trap",
                        duration: "3:45 mins",
                        url: "https://www.youtube.com/watch?v=yW6UqBqBfmg"
                    },
                    {
                        type: "tips",
                        title: "STEP-BY-STEP TIPS FOR RECOGNIZING THE FRICTION",
                        items: [
                            "Keep an eye on your frustration levels: Notice when you feel stuck waiting for an instructor to guide the rest of the class. It is a good indicator that you might need to try a different approach.",
                            "Look for the gap: Acknowledge that moving as a unit builds team cohesion, which is just as important as individual speed.",
                            "Try to pivot: When the solo route isn't working, make a conscious decision to pause your solo study and actively listen to the group's shared instructions."
                        ]
                    },
                    {
                        type: "scenario",
                        title: "REAL-LIFE SCENARIO: CAPSTONE TEAM ALIGNMENT",
                        content: `You are assigned a massive Capstone project with three other classmates. The instructor requires everyone to follow strict group instruction under structured leadership to map out network architectures using standard Cisco Packet Tracer topologies. If you stay in your dominant mode, you might feel overwhelmed and try to do all the unstructured work yourself. But by recognizing the need for flexibility, you realize it is much more efficient to rely on your team's shared goals to ensure everyone masters the ACL restrictions together.`
                    }
                ],
                questions: [
                    {
                        question_text: "Why is strengthening the Hierarchical Collective mode important for a solo-oriented learner?",
                        question_type: "multiple_choice",
                        options: [
                            "Because software engineering in industry relies heavily on centralized team alignment, unified goals, and instructor/lead guidance",
                            "Because solo studying is completely forbidden in IT",
                            "To stop using computers and only read textbooks",
                            "To make all students code at exactly 10 words per minute"
                        ],
                        correct_answer: "Because software engineering in industry relies heavily on centralized team alignment, unified goals, and instructor/lead guidance",
                        explanation: "Aligning with leadership and maintaining consistent group delivery prepares students for agile teams and structured workshops."
                    }
                ]
            },
            {
                title: "Chapter 3: Study Habits to Strengthen Your Weakest Quadrant",
                estimated_time: "15 min",
                content_blocks: [
                    {
                        type: "text",
                        content: `To strengthen the Hierarchical Collective mode, you must embrace the idea that sometimes you must follow a central figure directing a group toward a shared goal. This involves stepping away from the solo textbook and actively participating in group instruction and standardized procedures.\n\nYou can build these habits without losing your solo-studying superpowers. Think of it as installing a new software update to your brain. You are simply adding the ability to maintain organization and consistency across a collective.\n\nBy deliberately practicing these habits, you will slowly migrate your learning mode toward the center of the matrix. This balanced approach ensures you can crush a solo exam when you need to, but also step up and seamlessly integrate with a development team when the project demands it.\n\nStart small. You do not need to become the most extroverted person in the room overnight. The focus should be on creating structured micro-interactions with your peers where you are forced to figure things out together under standard guidelines.`
                    },
                    {
                        type: "card",
                        title: "QUICK SUMMARY OF YOUR ACTION PLAN",
                        items: [
                            "Follow the Leader: Step away from self-pacing and actively follow a central figure directing a group.",
                            "Unified Competency: Ensure you and your peers acquire the same core competencies simultaneously.",
                            "Micro-Interactions: Start with small, structured peer interactions to gently ease yourself into standardized group work."
                        ]
                    },
                    {
                        type: "video_card",
                        title: "The Power of Group Instruction in IT",
                        duration: "4:10 mins",
                        url: "https://www.youtube.com/watch?v=0k1A3qO10hA"
                    },
                    {
                        type: "video_card",
                        title: "Team Alignment 101: Collaborating on Code",
                        duration: "6:20 mins",
                        url: "https://www.youtube.com/watch?v=RGOj5yH7evk"
                    },
                    {
                        type: "tips",
                        title: "STEP-BY-STEP TIPS FOR YOUR FLEXIBILITY ACTION PLAN",
                        items: [
                            "Try the 'Group Pace' Rule: During a lab, resist the urge to jump to the final step. Wait and move in sync with the instructor and your classmates.",
                            "Experiment with a Weekly Huddle: You might find it useful to form a small group with two peers. Try meeting for 30 minutes once a week strictly to follow a specific tutorial together, keeping everyone on the exact same page.",
                            "Practice the Shared Goal Switch: Rather than building your own custom environment, agree on a standard setup (like a shared XAMPP and Laravel configuration) and help ensure the whole group successfully connects to the database before moving on."
                        ]
                    },
                    {
                        type: "scenario",
                        title: "REAL-LIFE SCENARIO: 11:30 PM DEADLINE RESOLUTION",
                        content: `It is 11:30 PM, and your GUI application will not compile. The deadline is tomorrow. In the past, you would have spent hours researching obscure forums alone. Instead of giving up, you activate your new Hierarchical Collective habit: you message your class Discord server, share your screen, and ask if anyone else is following the professor's exact rubric for this error. You fix the error, proving you can generate knowledge through structured group alignment!`
                    },
                    {
                        type: "summary_card",
                        title: "SUMMARY AND CONCLUSION",
                        items: [
                            "Your Baseline: You naturally rely on self-directed learning and take the initiative to access diverse resources independently.",
                            "The Gap: You discovered that lacking structured group skills can create friction in dynamic, team-based IT projects.",
                            "The Shift: You learned actionable steps to transition from purely solo exploration to actively maintaining consistent delivery across a collective audience.",
                            "The Goal: You now have the tools to leverage the structured leadership of a team to become a highly versatile, adaptable IT professional."
                        ],
                        closing: "Looking Ahead: Mastering your learning matrix is not about abandoning your strengths; it is about expanding your adaptability. By identifying your natural reliance on distributed, individual learning and deliberately practicing hierarchical, collective habits, you are preparing yourself for the fast-paced, collaborative reality of the tech industry. Keep practicing these small shifts, and your ability to tackle any academic or professional challenge will multiply!"
                    }
                ],
                questions: [
                    {
                        question_text: "What is an effective practical habit for practicing Hierarchical Collective alignment during a laboratory session?",
                        question_type: "multiple_choice",
                        options: [
                            "Rushing ahead to the last problem while ignoring the class pacing",
                            "Adopting the 'Group Pace' rule to move synchronously with the instructor's milestones and peer group",
                            "Refusing to participate in class Q&A sessions",
                            "Leaving the room before the instructor finishes explaining the rubric"
                        ],
                        correct_answer: "Adopting the 'Group Pace' rule to move synchronously with the instructor's milestones and peer group",
                        explanation: "Moving in sync with the cohort and instructor during lab sessions reinforces collaborative pacing and shared milestone tracking."
                    }
                ]
            }
        ]
    },

    // -------------------------------------------------------------
    // 2. HIERARCHICAL INDIVIDUAL (HI Dominant -> Strengthening DC)
    // -------------------------------------------------------------
    {
        title: "Mastering Your Learning Matrix: Hierarchical Individual",
        description: "Personalized adaptive roadmap for Hierarchical Individual learners. Build upon structured expert-led strengths to develop decentralized peer-to-peer collaboration (Distributed Collective).",
        quadrant_category: "Hierarchical Individual",
        difficulty: "Core",
        topic: "Adaptive Learning Strategy",
        estimated_time: "45 min",
        is_published: 1,
        is_archived: 0,
        chapters: [
            {
                title: "Chapter 1: Your Most Dominant Learning Modality",
                estimated_time: "15 min",
                content_blocks: [
                    {
                        type: "text",
                        content: `Welcome to your personalized MATRIX learning roadmap. This module is designed as an automated module guiding component to actively help you identify and improve your academic weaknesses. Let's dive into your results and unlock your full potential!\n\nYour assessment results are in, and you are officially a **Hierarchical Individual**! This means you naturally thrive in a traditional, top-down approach to education, involving a one-on-one relationship between an instructor and a learner. You are the kind of student who loves a clear syllabus, structured lectures, and knowing exactly what is expected of you on day one.\n\nIn this quadrant, your primary objective is direct knowledge transfer. You prefer an expert to guide you step-by-step through a specific curriculum to ensure you achieve absolute mastery of foundational concepts. When you sit down to study, you view it as your own individual responsibility, focusing intensely on the effort you invest to assimilate and report the knowledge you've accumulated.\n\nThis is a massive superpower in the BSIT program. Because you focus on sequence and structure, you excel at absorbing heavy technical fundamentals, from basic to advanced. You do not get easily distracted by group chatter when you need to memorize commands or trace logic. Your ability to lock in and absorb direct instructions makes you incredibly reliable when it comes to exams and standardized performance measurements.`
                    },
                    {
                        type: "card",
                        title: "QUICK SUMMARY OF YOUR MODALITY",
                        items: [
                            "Authority-Driven: You prefer instruction delivered from an expert directly to a single student.",
                            "Sequential Processing: You like to learn things chronologically, mastering basic concepts before advancing.",
                            "Solo Accountability: You view academic success as the direct result of the effort you invest individually."
                        ]
                    },
                    {
                        type: "text",
                        content: `However, relying strictly on this solo, teacher-dependent mode is only one piece of the puzzle. Recognizing your baseline characteristics is the first step toward becoming a truly flexible, unstoppable IT professional.`
                    },
                    {
                        type: "card",
                        title: "KEY CHARACTERISTICS OF YOUR LEARNING MODE",
                        items: [
                            "Authority-Driven: You prefer instruction delivered from an expert directly to a single student.",
                            "Sequential Processing: You like to learn things chronologically, mastering basic concepts before advancing.",
                            "Clear Metrics: You rely heavily on defined rubrics, external tests, and standard measurements for success.",
                            "Solo Accountability: You view academic success as the direct result of the effort you invest individually."
                        ]
                    },
                    {
                        type: "video_card",
                        title: "The Solo Achiever: Strengths of Structured Learning",
                        duration: "3:15 mins",
                        url: "https://www.youtube.com/watch?v=t0G8p5bO1_U"
                    },
                    {
                        type: "video_card",
                        title: "How to Maximize Your Focus During Solo Coding Sessions",
                        duration: "4:20 mins",
                        url: "https://www.youtube.com/watch?v=kJQP7kiw5Fk"
                    },
                    {
                        type: "tips",
                        title: "STEP-BY-STEP TIPS FOR MAXIMIZING YOUR DOMINANT STRENGTH",
                        items: [
                            "Try asking for the rubric early: You might find it helpful to ask your professor for the grading rubric before starting a coding project. Having clear, definitive metrics for success right from the start can put your mind at ease.",
                            "Consider mapping out the syllabus: Breaking down your semester schedule into a chronological sequence can be a great way to study topics strictly from basic to advanced.",
                            "Set up a solo environment: To block out distractions, you could try setting up a dedicated, quiet digital workspace when reviewing foundational concepts."
                        ]
                    }
                ],
                questions: [
                    {
                        question_text: "Which trait characterizes a Hierarchical Individual learner best?",
                        question_type: "multiple_choice",
                        options: [
                            "Thriving in step-by-step expert guidance, clear syllabi, and sequential solo study",
                            "Refusing to follow professor guidelines",
                            "Exclusively working in large noisy group brainstorms",
                            "Skipping foundational theory and guessing on exams"
                        ],
                        correct_answer: "Thriving in step-by-step expert guidance, clear syllabi, and sequential solo study",
                        explanation: "Hierarchical Individual learners excel in structured, top-down instruction with clear metrics and sequential mastery."
                    }
                ]
            },
            {
                title: "Chapter 2: Why It Is Important to Strengthen Your Least Dominant Quadrant",
                estimated_time: "15 min",
                content_blocks: [
                    {
                        type: "text",
                        content: `While your solo focus is excellent, attempting to navigate a diverse BSIT curriculum using only a single, uniform method creates severe friction in academic development. Your profile indicates that your absolute weakest area is the exact opposite of your dominant mode: the **Distributed Collective** quadrant. This mode focuses entirely on peer-to-peer collaborative learning among equals.\n\nWhy does this matter? Because the modern IT curriculum demands constant practical application and complex problem-solving. In the real world, there will not always be a professor standing by to hand you a structured answer key. When a server crashes or your Python code breaks, you cannot just wait for the next lecture; you have to adapt immediately.\n\nIf you remain trapped exclusively in the Hierarchical Individual quadrant, you risk extreme academic frustration when faced with open-ended group projects or undocumented software bugs. Strict, traditional lecture formats are highly ineffective for teaching the fluid, fast-paced realities of agile software development. You need to be able to pivot.\n\nStrengthening this non-dominant quadrant is about giving yourself options. The goal is to learn how to generate knowledge through interaction, rather than waiting for it to be passed down from a single authority. By building these collaborative muscles, you transform from a student who simply waits for instructions into an adaptable tech professional who can troubleshoot dynamically alongside a team.`
                    },
                    {
                        type: "card",
                        title: "QUICK SUMMARY OF YOUR CHALLENGE",
                        items: [
                            "The Friction: Relying entirely on single, uniform study habits creates roadblocks in dynamic, team-based IT environments.",
                            "The Missing Link: You need to embrace the Distributed Collective mode to thrive in open-ended, peer-to-peer settings.",
                            "The Goal: Shift from waiting for a single authority to actively generating knowledge through interaction with others."
                        ]
                    },
                    {
                        type: "video_card",
                        title: "Why Tech Companies Hire for Adaptability Over Memorization",
                        duration: "5:00 mins",
                        url: "https://www.youtube.com/watch?v=1uN_U5XjFyg"
                    },
                    {
                        type: "video_card",
                        title: "The Danger of the 'One-Size-Fits-All' Study Trap",
                        duration: "3:45 mins",
                        url: "https://www.youtube.com/watch?v=yW6UqBqBfmg"
                    },
                    {
                        type: "tips",
                        title: "STEP-BY-STEP TIPS FOR RECOGNIZING THE FRICTION",
                        items: [
                            "Keep an eye on your frustration levels: Notice when you feel stuck waiting for a professor's email reply regarding a bug. It is a good indicator that you might need to try a different approach.",
                            "Look for the gap: Acknowledge that the answer likely exists within your peer group, not just with the authority figure.",
                            "Try to pivot: When the solo route isn't working, make a conscious decision to pause your solo study and seek unstructured help from a classmate."
                        ]
                    },
                    {
                        type: "scenario",
                        title: "REAL-LIFE SCENARIO: WHITEBOARD BRAINSTORMING",
                        content: `You are assigned a massive Capstone project with three other classmates. There is no step-by-step textbook for your specific system. If you stay in your dominant mode, you might feel overwhelmed and try to do all the structured work yourself. But by recognizing the need for flexibility, you realize it is much more efficient to rely on your team's diverse skills and brainstorm solutions together on a whiteboard, even if it feels unstructured at first.`
                    }
                ],
                questions: [
                    {
                        question_text: "What is the primary risk of relying exclusively on Hierarchical Individual habits?",
                        question_type: "multiple_choice",
                        options: [
                            "Frustration and delays when faced with undocumented bugs and open-ended peer collaboration where no answer key exists",
                            "Earning high marks on standardized tests",
                            "Understanding the professor's syllabus",
                            "Maintaining organized notes"
                        ],
                        correct_answer: "Frustration and delays when faced with undocumented bugs and open-ended peer collaboration where no answer key exists",
                        explanation: "Real-world agile IT environments require dynamic peer troubleshooting and collaborative brainstorming without waiting for an instructor's answer key."
                    }
                ]
            },
            {
                title: "Chapter 3: Study Habits to Strengthen Your Weakest Quadrant",
                estimated_time: "15 min",
                content_blocks: [
                    {
                        type: "text",
                        content: `To strengthen the Distributed Collective mode, you must embrace the idea that knowledge is not passed down from a single authority but is instead generated through interaction. This involves stepping away from the solo textbook and actively sharing insights, asking questions, and solving problems together with your peers.\n\nYou can build these habits without losing your solo-studying superpowers. Think of it as installing a new software update to your brain. You are simply adding the ability to leverage the collective intelligence of the network to deepen your understanding.\n\nBy deliberately practicing these habits, you will slowly migrate your learning mode toward the center of the matrix. This balanced approach ensures you can crush a solo exam when you need to, but also step up and seamlessly integrate with a development team when the project demands it.\n\nStart small. You do not need to become the most extroverted person in the room overnight. The focus should be on creating structured micro-interactions with your peers where you are forced to figure things out together, without a professor acting as a safety net.`
                    },
                    {
                        type: "card",
                        title: "QUICK SUMMARY OF YOUR ACTION PLAN",
                        items: [
                            "Share Insights: Step away from the solo textbook and actively ask questions and solve problems with your peers.",
                            "Network Intelligence: Learn to leverage the collective intelligence of the network to deepen your understanding.",
                            "Micro-Interactions: Start with small, structured peer interactions to gently ease yourself into collaborative troubleshooting without a teacher."
                        ]
                    },
                    {
                        type: "video_card",
                        title: "The Power of Peer-to-Peer Learning in IT",
                        duration: "4:10 mins",
                        url: "https://www.youtube.com/watch?v=f02mOEt11OQ"
                    },
                    {
                        type: "video_card",
                        title: "Pair Programming 101: Collaborating on Code",
                        duration: "6:20 mins",
                        url: "https://www.youtube.com/watch?v=dYbjVZF5X64"
                    },
                    {
                        type: "tips",
                        title: "STEP-BY-STEP TIPS FOR YOUR FLEXIBILITY ACTION PLAN",
                        items: [
                            "Try the 'Ask a Peer First' Rule: Before you immediately email your professor with a question, consider asking one classmate for their input first. This gently forces you to rely on a peer rather than an authority figure.",
                            "Experiment with a Weekly Huddle: You might find it useful to form a small group with two peers. Try meeting for 30 minutes once a week strictly to troubleshoot each other's code without a teacher present.",
                            "Practice the Driver/Navigator Switch: During a lab, consider pairing up with a classmate. One person types (Driver) while the other reviews the logic (Navigator). Swapping roles halfway through is a great way to ease into collaborative problem-solving."
                        ]
                    },
                    {
                        type: "scenario",
                        title: "REAL-LIFE SCENARIO: REAL-TIME DISCORD DEBUGGING",
                        content: `It is 11:30 PM, and your GUI application will not compile. The deadline is tomorrow. Your professor is asleep, so direct knowledge transfer from an expert is impossible. Instead of giving up, you activate your new Distributed Collective habit: you message your class Discord server, share your screen, and debug the logic in real-time with a classmate. You fix the error, proving you can generate knowledge through interaction without needing a teacher!`
                    },
                    {
                        type: "summary_card",
                        title: "SUMMARY AND CONCLUSION",
                        items: [
                            "Your Baseline: You naturally rely on solo accountability and expert-led instruction to master foundational concepts.",
                            "The Gap: You discovered that lacking peer-to-peer collaborative skills can create friction in dynamic, team-based IT projects.",
                            "The Shift: You learned actionable steps to transition from waiting for top-down authority to actively generating knowledge through interaction.",
                            "The Goal: You now have the tools to leverage the collective intelligence of your network to become a highly versatile, adaptable IT professional."
                        ],
                        closing: "Looking Ahead: Mastering your learning matrix is not about abandoning your strengths; it is about expanding your adaptability. By identifying your natural reliance on structured, hierarchical learning and deliberately practicing distributed, collective habits, you are preparing yourself for the fast-paced, collaborative reality of the tech industry. Keep practicing these small shifts, and your ability to tackle any academic or professional challenge will multiply!"
                    }
                ],
                questions: [
                    {
                        question_text: "What technique involves two students collaborating on code where one writes logic and the other reviews syntax?",
                        question_type: "multiple_choice",
                        options: [
                            "Driver / Navigator Pair Programming",
                            "Independent Solo Cramming",
                            "Lecture Memorization",
                            "Relying solely on teacher answer keys"
                        ],
                        correct_answer: "Driver / Navigator Pair Programming",
                        explanation: "Pair programming with Driver and Navigator roles is a proven agile method for peer-to-peer code review and knowledge sharing."
                    }
                ]
            }
        ]
    },

    // -------------------------------------------------------------
    // 3. DISTRIBUTED COLLECTIVE (DC Dominant -> Strengthening HI)
    // -------------------------------------------------------------
    {
        title: "Mastering Your Learning Matrix: Distributed Collective",
        description: "Personalized adaptive roadmap for Distributed Collective learners. Enhance your natural teamwork and crowdsourcing strengths by mastering rigorous individual accountability and structured top-down theory (Hierarchical Individual).",
        quadrant_category: "Distributed Collective",
        difficulty: "Core",
        topic: "Adaptive Learning Strategy",
        estimated_time: "45 min",
        is_published: 1,
        is_archived: 0,
        chapters: [
            {
                title: "Chapter 1: Your Most Dominant Learning Modality",
                estimated_time: "15 min",
                content_blocks: [
                    {
                        type: "text",
                        content: `Welcome to your personalized MATRIX learning roadmap. This module is designed as an automated module guiding component to actively help you identify and improve your academic weaknesses. Let's dive into your results and unlock your full potential!\n\nYour assessment results are in, and you are officially a **Distributed Collective** learner! In this quadrant, the focus shifts toward peer-to-peer collaborative learning among equals. You take the initiative to generate knowledge through interaction, leveraging the collective intelligence of the network to deepen your understanding rather than waiting for it to be passed down from a single authority.\n\nIn this quadrant, your primary objective is shared discovery. You are highly flexible, allowing yourself to tackle open-ended group projects by sharing insights, asking questions, and solving problems dynamically alongside a team. When you sit down to study, you view it as a collaborative responsibility, focusing intensely on the effort you invest to brainstorm and crowdsource solutions.\n\nThis is a massive superpower in the BSIT program. Because you focus on interaction, you excel at absorbing complex practical applications when working in a group. You do not get easily distracted by changing variables when you need to troubleshoot logic on a whiteboard. Your ability to navigate team dynamics makes you incredibly reliable when it comes to open-ended technical challenges, like brainstorming backend structures for your MATRIX Capstone project.`
                    },
                    {
                        type: "card",
                        title: "QUICK SUMMARY OF YOUR MODALITY",
                        items: [
                            "Peer-to-Peer Focus: You take the initiative to collaborate and learn among equals.",
                            "Interactive Generation: You allow yourself to generate knowledge through interaction rather than top-down instruction.",
                            "Network Intelligence: You view academic success as the direct result of leveraging the collective intelligence of your group."
                        ]
                    },
                    {
                        type: "text",
                        content: `However, relying strictly on this collaborative, interactive mode is only one piece of the puzzle. Recognizing your baseline characteristics is the first step toward becoming a truly flexible, unstoppable IT professional.`
                    },
                    {
                        type: "card",
                        title: "KEY CHARACTERISTICS OF YOUR LEARNING MODE",
                        items: [
                            "Peer-to-Peer Focus: You take the initiative to collaborate and learn among equals.",
                            "Interactive Generation: You allow yourself to generate knowledge through interaction rather than top-down instruction.",
                            "Collaborative Troubleshooting: You facilitate personalized skill building by solving problems dynamically alongside a team.",
                            "Network Intelligence: You view academic success as the direct result of leveraging the collective intelligence of your group."
                        ]
                    },
                    {
                        type: "video_card",
                        title: "The Collaborative Coder: Strengths of Peer-to-Peer Learning",
                        duration: "3:15 mins",
                        url: "https://www.youtube.com/watch?v=dYbjVZF5X64"
                    },
                    {
                        type: "video_card",
                        title: "How to Maximize Your Engagement During Group Brainstorming",
                        duration: "4:20 mins",
                        url: "https://www.youtube.com/watch?v=0k1A3qO10hA"
                    },
                    {
                        type: "tips",
                        title: "STEP-BY-STEP TIPS FOR MAXIMIZING YOUR DOMINANT STRENGTH",
                        items: [
                            "Curate your digital networks: You might find it helpful to organize your favorite study group chats and Discord servers before starting a coding project to ensure your collaborative troubleshooting is highly efficient.",
                            "Consider mapping out team milestones: Breaking down your semester schedule into shared group objectives can be a great way to tackle topics dynamically with your peers.",
                            "Set up a collaborative environment: To avoid isolation, you could try setting up a dedicated digital workspace where you can freely share screens when reviewing core concepts."
                        ]
                    }
                ],
                questions: [
                    {
                        question_text: "What defines the Distributed Collective learning modality?",
                        question_type: "multiple_choice",
                        options: [
                            "Decentralized peer-to-peer collaboration, interaction among equals, and shared discovery",
                            "Strictly studying alone in total isolation without asking peers",
                            "Only following a professor's direct lecture without any teamwork",
                            "Waiting for someone else to write all your project code"
                        ],
                        correct_answer: "Decentralized peer-to-peer collaboration, interaction among equals, and shared discovery",
                        explanation: "Distributed Collective learners thrive on crowdsourced troubleshooting, group synergy, and peer-to-peer knowledge creation."
                    }
                ]
            },
            {
                title: "Chapter 2: Why It Is Important to Strengthen Your Least Dominant Quadrant",
                estimated_time: "15 min",
                content_blocks: [
                    {
                        type: "text",
                        content: `While your collaborative focus is excellent, attempting to navigate a diverse BSIT curriculum using only a single, uniform method creates severe friction in academic development. Your profile indicates that your absolute weakest area is the exact opposite of your dominant mode: the **Hierarchical Individual** quadrant. This mode involves a traditional, top-down approach to education, involving a one-on-one relationship between an instructor and a learner.\n\nWhy does this matter? Because the modern IT curriculum demands mastery of foundational technical theories and strict compliance with standards. In the real world, there will not always be the freedom to just figure things out with a team. Often, you will need to absorb instruction delivered from an expert directly to a single student to ensure absolute mastery of basic concepts.\n\nIf you remain trapped exclusively in the Distributed Collective quadrant, you risk extreme academic frustration when faced with strict solo certification exams or rigid, chronological assignments. Strict, unstructured group formats are highly ineffective for teaching the rigid, sequential realities of theoretical memorization where you must rely heavily on defined rubrics and standardized performance measurements. You need to be able to pivot.\n\nStrengthening this non-dominant quadrant is about giving yourself options. The goal is to learn how to lock in and absorb direct instructions chronologically, rather than waiting to crowdsource an answer. By building these solo muscles, you transform from a student who strictly learns in groups into an adaptable tech professional who can ensure they master heavy technical fundamentals entirely on their own.`
                    },
                    {
                        type: "card",
                        title: "QUICK SUMMARY OF YOUR CHALLENGE",
                        items: [
                            "The Friction: Relying entirely on single, uniform study habits creates roadblocks in rigid, solo-assessment IT environments.",
                            "The Missing Link: You need to embrace the Hierarchical Individual mode to thrive in structured, independent settings.",
                            "The Goal: Shift from collaborative pacing to actively following top-down instruction and moving strictly from basic to advanced concepts."
                        ]
                    },
                    {
                        type: "video_card",
                        title: "Why Tech Companies Require Mastery of Solo Fundamentals",
                        duration: "5:00 mins",
                        url: "https://www.youtube.com/watch?v=t0G8p5bO1_U"
                    },
                    {
                        type: "video_card",
                        title: "The Danger of the 'One-Size-Fits-All' Study Trap",
                        duration: "3:45 mins",
                        url: "https://www.youtube.com/watch?v=yW6UqBqBfmg"
                    },
                    {
                        type: "tips",
                        title: "STEP-BY-STEP TIPS FOR RECOGNIZING THE FRICTION",
                        items: [
                            "Keep an eye on your distraction levels: Notice when you feel stuck waiting for a classmate to reply to your question. It is a good indicator that you might need to try a different approach.",
                            "Look for the gap: Acknowledge that mastering a theoretical concept alone builds individual accountability, which is just as important as team speed.",
                            "Try to pivot: When the group route isn't working, make a conscious decision to pause your collaborative study and actively read the professor's syllabus independently."
                        ]
                    },
                    {
                        type: "scenario",
                        title: "REAL-LIFE SCENARIO: RIGID THEORETICAL EXAM RUBRIC",
                        content: `You are working on the theoretical documentation for your MATRIX Capstone project. The instructor requires everyone to pass a strict solo exam on the underlying Fuzzy K-Nearest Neighbor logic using a highly specific grading rubric. If you stay in your dominant mode, you might feel overwhelmed and try to crowdsource the study session with your team. But by recognizing the need for flexibility, you realize it is much more efficient to rely on the professor's direct lecture notes to ensure you master the foundational concepts individually.`
                    }
                ],
                questions: [
                    {
                        question_text: "Why is individual accountability (Hierarchical Individual) vital when preparing for technical certification exams?",
                        question_type: "multiple_choice",
                        options: [
                            "Because exams and certifications test individual mastery of precise rubrics, syntax, and foundational theory without group help",
                            "Because group work is completely useless",
                            "Because teachers do not like questions",
                            "To avoid talking to other programmers"
                        ],
                        correct_answer: "Because exams and certifications test individual mastery of precise rubrics, syntax, and foundational theory without group help",
                        explanation: "Standardized IT certifications and individual theoretical exams require rigorous personal comprehension of exact specifications."
                    }
                ]
            },
            {
                title: "Chapter 3: Study Habits to Strengthen Your Weakest Quadrant",
                estimated_time: "15 min",
                content_blocks: [
                    {
                        type: "text",
                        content: `To strengthen the Hierarchical Individual mode, you must embrace the idea that sometimes you must follow instruction delivered from an expert directly to a single student. This involves stepping away from the shared whiteboard and actively participating in solo accountability and sequential processing.\n\nYou can build these habits without losing your team-player superpowers. Think of it as installing a new software update to your brain. You are simply adding the ability to maintain deep focus and follow clear metrics on your own.\n\nBy deliberately practicing these habits, you will slowly migrate your learning mode toward the center of the matrix. This balanced approach ensures you can seamlessly integrate with a development team when the project demands it, but also step up and crush a solo exam when you need to.\n\nStart small. You do not need to become a completely isolated hermit overnight. The focus should be on creating structured solo micro-sessions where you are forced to figure things out independently under standard guidelines.`
                    },
                    {
                        type: "card",
                        title: "QUICK SUMMARY OF YOUR ACTION PLAN",
                        items: [
                            "Direct Instruction: Step away from the group and actively absorb top-down knowledge directly from an expert.",
                            "Solo Accountability: Ensure you acquire the core competencies completely on your own.",
                            "Sequential Processing: Start learning things chronologically, mastering basic concepts before advancing."
                        ]
                    },
                    {
                        type: "video_card",
                        title: "The Power of Solo Accountability in IT",
                        duration: "4:10 mins",
                        url: "https://www.youtube.com/watch?v=kJQP7kiw5Fk"
                    },
                    {
                        type: "video_card",
                        title: "Deep Work 101: Mastering Foundational Concepts",
                        duration: "6:20 mins",
                        url: "https://www.youtube.com/watch?v=gT_Z4hE8t0s"
                    },
                    {
                        type: "tips",
                        title: "STEP-BY-STEP TIPS FOR YOUR FLEXIBILITY ACTION PLAN",
                        items: [
                            "Try the 'Solo Syllabus' Rule: During a study session, resist the urge to jump around topics with friends. Wait and move in sync with the chronological order of the textbook.",
                            "Experiment with a Weekly Solo Hour: You might find it useful to separate from your peers for a set time. Try dedicating 30 minutes once a week strictly to following a specific lecture without any group chat open.",
                            "Practice the Rubric Check: Rather than asking your team if a Laravel deployment looks good, pull up the professor's exact grading rubric and ensure your work meets the standard measurements independently."
                        ]
                    },
                    {
                        type: "scenario",
                        title: "REAL-LIFE SCENARIO: LOCAL DATABASE DEBUGGING",
                        content: `It is 11:30 PM, and your local XAMPP database will not connect to your framework. The deadline is tomorrow. In the past, you would have spent hours messaging your Discord server for a quick fix. Instead of giving up, you activate your new Hierarchical Individual habit: you pull up the instructor's official step-by-step documentation, trace the logic chronologically, and verify your environment path variables. You fix the error, proving you can achieve mastery through structured solo accountability!`
                    },
                    {
                        type: "summary_card",
                        title: "SUMMARY AND CONCLUSION",
                        items: [
                            "Your Baseline: You naturally rely on peer-to-peer collaboration and take the initiative to generate knowledge through interaction.",
                            "The Gap: You discovered that lacking top-down, solo study skills can create friction in rigid, individual IT assessments.",
                            "The Shift: You learned actionable steps to transition from purely group-based exploration to actively maintaining solo accountability and sequential processing.",
                            "The Goal: You now have the tools to leverage the structured instruction of an expert to become a highly versatile, adaptable IT professional."
                        ],
                        closing: "Looking Ahead: Mastering your learning matrix is not about abandoning your strengths; it is about expanding your adaptability. By identifying your natural reliance on distributed, collective learning and deliberately practicing hierarchical, individual habits, you are preparing yourself for the fast-paced, demanding reality of the tech industry. Keep practicing these small shifts, and your ability to tackle any academic or professional challenge will multiply!"
                    }
                ],
                questions: [
                    {
                        question_text: "What habit helps a collective learner build strong solo accountability during development?",
                        question_type: "multiple_choice",
                        options: [
                            "Practicing the 'Rubric Check' and dedicating focused solo study blocks to official documentation",
                            "Ignoring error messages and hoping a teammate fixes them",
                            "Leaving all database configurations until 5 minutes before submission",
                            "Only studying when in a noisy discord call"
                        ],
                        correct_answer: "Practicing the 'Rubric Check' and dedicating focused solo study blocks to official documentation",
                        explanation: "Scheduling solo deep work blocks and verifying code against rubrics ensures independent mastery and technical precision."
                    }
                ]
            }
        ]
    },

    // -------------------------------------------------------------
    // 4. HIERARCHICAL COLLECTIVE (HC Dominant -> Strengthening DI)
    // -------------------------------------------------------------
    {
        title: "Mastering Your Learning Matrix: Hierarchical Collective",
        description: "Personalized adaptive roadmap for Hierarchical Collective learners. Leverage your teacher-led and classroom alignment strengths while developing independent, self-directed exploration skills (Distributed Individual).",
        quadrant_category: "Hierarchical Collective",
        difficulty: "Core",
        topic: "Adaptive Learning Strategy",
        estimated_time: "45 min",
        is_published: 1,
        is_archived: 0,
        chapters: [
            {
                title: "Chapter 1: Your Most Dominant Learning Modality",
                estimated_time: "15 min",
                content_blocks: [
                    {
                        type: "text",
                        content: `Welcome to your personalized MATRIX learning roadmap. This module is designed as an automated module guiding component to actively help you identify and improve your academic weaknesses. Let's dive into your results and unlock your full potential!\n\nYour assessment results are in, and you are officially a **Hierarchical Collective** learner! This means you naturally thrive in environments featuring group instruction conducted under structured leadership. You are the kind of student who loves a traditional classroom setting where a professor lectures, the whole class moves at the exact same pace, and everyone shares the same academic milestones.\n\nIn this quadrant, you rely on a central figure, such as a teacher or coach, who directs a group of learners toward a shared goal. You prefer situations with consistent delivery and organization across a collective audience. When you sit down to study, you are most comfortable knowing that you and all members of your group are acquiring the same core competencies simultaneously.\n\nThis is a massive superpower in the BSIT program. Because you focus on structured group dynamics, you excel in large lecture halls and organized class projects. You do not get lost in the weeds because you always follow the instructor's pacing. Your ability to lock in on the central figure's guidance makes you incredibly reliable when it comes to keeping up with the class syllabus and participating in guided, collective discussions.`
                    },
                    {
                        type: "card",
                        title: "QUICK SUMMARY OF YOUR MODALITY",
                        items: [
                            "Structured Group Focus: You thrive in group instruction conducted under structured leadership.",
                            "Guided by a Leader: You depend on a central figure, like a teacher, to direct the group toward a shared goal.",
                            "Synchronized Pacing: You prefer ensuring that all members of the group acquire the same core competencies simultaneously."
                        ]
                    },
                    {
                        type: "text",
                        content: `However, relying strictly on this teacher-led, group-dependent mode is only one piece of the puzzle. Recognizing your baseline characteristics is the first step toward becoming a truly flexible, unstoppable IT professional.`
                    },
                    {
                        type: "card",
                        title: "KEY CHARACTERISTICS OF YOUR LEARNING MODE",
                        items: [
                            "Structured Group Focus: You thrive in group instruction conducted under structured leadership.",
                            "Guided by a Leader: You depend on a central figure, like a teacher, to direct the group toward a shared goal.",
                            "Synchronized Pacing: You prefer ensuring that all members of the group acquire the same core competencies simultaneously."
                        ]
                    },
                    {
                        type: "video_card",
                        title: "The Power of the Classroom: Maximizing Group Instruction",
                        duration: "3:15 mins",
                        url: "https://www.youtube.com/watch?v=0k1A3qO10hA"
                    },
                    {
                        type: "video_card",
                        title: "How to Get the Most Out of Teacher-Led IT Lectures",
                        duration: "4:20 mins",
                        url: "https://www.youtube.com/watch?v=RGOj5yH7evk"
                    },
                    {
                        type: "tips",
                        title: "STEP-BY-STEP TIPS FOR MAXIMIZING YOUR DOMINANT STRENGTH",
                        items: [
                            "Try sitting near the front: You might find it helpful to position yourself where you have a direct line of sight to the central figure, minimizing distractions from the rest of the collective audience.",
                            "Consider tracking class milestones: Keeping a checklist of the shared goals your professor sets for the week can help you stay perfectly synchronized with the group's pacing.",
                            "Engage in guided Q&A: When the teacher opens the floor to the group, try to ask questions that benefit everyone, ensuring the whole class acquires the same core competencies."
                        ]
                    }
                ],
                questions: [
                    {
                        question_text: "What is a signature advantage of the Hierarchical Collective learning style?",
                        question_type: "multiple_choice",
                        options: [
                            "Synchronized group pacing, structured lecture tracking, and achieving shared class milestones under an instructor",
                            "Ignoring teacher guidelines and building unrelated side tools",
                            "Only studying when everyone else is asleep",
                            "Skipping all group discussions"
                        ],
                        correct_answer: "Synchronized group pacing, structured lecture tracking, and achieving shared class milestones under an instructor",
                        explanation: "Hierarchical Collective learners thrive in guided classroom environments where a leader steers the cohort toward unified competencies."
                    }
                ]
            },
            {
                title: "Chapter 2: Why It Is Important to Strengthen Your Least Dominant Quadrant",
                estimated_time: "15 min",
                content_blocks: [
                    {
                        type: "text",
                        content: `While your focus on guided group learning is excellent, attempting to navigate a diverse BSIT curriculum using only a single, uniform method creates severe friction in academic development. Your profile indicates that your absolute weakest area is the exact opposite of your dominant mode: the **Distributed Individual** quadrant. In this quadrant, the focus shifts entirely toward self-directed learning.\n\nWhy does this matter? Because the modern IT curriculum is not always neatly packaged into a guided classroom lecture. In the real world, you will face niche technical problems, obscure bugs, and specialized certifications that the rest of your class is not studying. You cannot always wait for a central figure to direct the group; sometimes, you have to break away from the pack and forge your own path.\n\nIf you remain trapped exclusively in the Hierarchical Collective quadrant, you risk extreme academic frustration when faced with independent, self-paced coding projects. Waiting for a professor to teach a concept to the whole group is highly ineffective when you need to fix a specific error right now. You need to be able to pivot and take control of your own pacing.\n\nStrengthening this non-dominant quadrant is about giving yourself options. The goal is to become an individual learner who takes the initiative to access diverse resources such as digital platforms, books, and practical tools to facilitate personalized skill building and exploration. By building these solo muscles, you transform from a student who simply waits for the class into an adaptable tech professional who is highly flexible, tailoring your educational path according to your specific interests and pace.`
                    },
                    {
                        type: "card",
                        title: "QUICK SUMMARY OF YOUR CHALLENGE",
                        items: [
                            "The Friction: Relying entirely on a teacher-led group creates roadblocks when you need to learn something outside the standard class syllabus.",
                            "The Missing Link: You need to embrace the Distributed Individual mode, where the focus shifts toward self-directed learning.",
                            "The Goal: Learn to take the initiative to access diverse resources and tailor your educational path to your specific interests and pace."
                        ]
                    },
                    {
                        type: "video_card",
                        title: "Breaking the Mold: The Importance of Self-Directed IT Learning",
                        duration: "5:00 mins",
                        url: "https://www.youtube.com/watch?v=k9WUpZqS_pU"
                    },
                    {
                        type: "video_card",
                        title: "How to Build Your Own Personalized Tech Curriculum",
                        duration: "3:45 mins",
                        url: "https://www.youtube.com/watch?v=gT_Z4hE8t0s"
                    },
                    {
                        type: "tips",
                        title: "STEP-BY-STEP TIPS FOR RECOGNIZING THE FRICTION",
                        items: [
                            "Keep an eye on your pacing: Notice when you feel bored waiting for the rest of the class to catch up, or anxious when the class moves on before you are ready. It is a good indicator that you need a personalized pace.",
                            "Look for the gap: Acknowledge when a specific IT interest you have (like advanced GUI development) isn't being covered by the central figure in class.",
                            "Try to pivot: When the group syllabus isn't covering what you need, make a conscious decision to pause your reliance on the professor and seek out your own digital platforms or books."
                        ]
                    },
                    {
                        type: "scenario",
                        title: "REAL-LIFE SCENARIO: CISCO LAB EXPLORATION",
                        content: `You are working on a network configuration lab, and the professor is slowly walking the entire class through a basic Cisco IOS setup. You finish early, but instead of exploring further, you just sit and wait for the instructor to give the next command to the group. By recognizing the need for flexibility, you realize it is much more efficient to pull up an advanced Cisco documentation page on your own and start exploring independent routing protocols at your own pace.`
                    }
                ],
                questions: [
                    {
                        question_text: "Why should a student accustomed to teacher-led instruction practice self-directed exploration?",
                        question_type: "multiple_choice",
                        options: [
                            "Because tech stacks, specialized frameworks, and niche errors frequently require independent research and self-paced initiative",
                            "Because teachers should never lecture again",
                            "Because group communication is unnecessary",
                            "To drop out of school"
                        ],
                        correct_answer: "Because tech stacks, specialized frameworks, and niche errors frequently require independent research and self-paced initiative",
                        explanation: "Self-directed learning allows IT students to master frameworks and troubleshoot bugs outside the classroom syllabus."
                    }
                ]
            },
            {
                title: "Chapter 3: Study Habits to Strengthen Your Weakest Quadrant",
                estimated_time: "15 min",
                content_blocks: [
                    {
                        type: "text",
                        content: `To strengthen the Distributed Individual mode, you must embrace the idea that you do not need a central figure to tell you what to learn next. This involves stepping away from the synchronized class pacing and taking the initiative to access diverse resources such as digital platforms and practical tools on your own.\n\nYou can build these habits without losing your ability to excel in a lecture hall. Think of it as installing a new software update to your brain. You are simply adding the ability to facilitate personalized skill building and exploration outside of the classroom.\n\nBy deliberately practicing these habits, you will slowly migrate your learning mode toward the center of the matrix. This balanced approach ensures you can follow a professor's lecture perfectly when you need to, but also dive deep into a self-paced, independent programming project when the curriculum demands it.\n\nStart small. You do not need to drop out of your lectures to become a self-taught maverick overnight. The focus should be on creating structured micro-sessions where you are forced to explore topics that interest you, entirely independent of the class syllabus.`
                    },
                    {
                        type: "card",
                        title: "QUICK SUMMARY OF YOUR ACTION PLAN",
                        items: [
                            "Take Initiative: Stop waiting for the teacher; actively seek out diverse digital platforms and books.",
                            "Personalize Your Path: Allow yourself to be highly flexible, tailoring your educational path to your specific interests.",
                            "Solo Exploration: Start with small, self-directed study blocks to gently ease yourself into independent skill building."
                        ]
                    },
                    {
                        type: "video_card",
                        title: "The Self-Taught Developer: Using Online Platforms for Skill Building",
                        duration: "4:10 mins",
                        url: "https://www.youtube.com/watch?v=kJQP7kiw5Fk"
                    },
                    {
                        type: "video_card",
                        title: "How to Read Technical Documentation Independently",
                        duration: "6:20 mins",
                        url: "https://www.youtube.com/watch?v=dYbjVZF5X64"
                    },
                    {
                        type: "tips",
                        title: "STEP-BY-STEP TIPS FOR YOUR FLEXIBILITY ACTION PLAN",
                        items: [
                            "Try the 'One Digital Resource' Rule: For every class module, challenge yourself to find one external YouTube tutorial, forum post, or article that goes deeper into the topic than what the professor taught the group.",
                            "Experiment with a 'Personal Interest' Block: You might find it useful to schedule 45 minutes a week dedicated strictly to an IT topic not on your syllabus. Use this time for highly flexible, personalized exploration.",
                            "Practice Independent Troubleshooting: When you hit a roadblock, do not immediately ask the professor in front of the whole class. Try to consult practical tools and digital documentation on your own first."
                        ]
                    },
                    {
                        type: "scenario",
                        title: "REAL-LIFE SCENARIO: PYTHON TKINTER GUI DEVELOPMENT",
                        content: `It is the weekend, and you are trying to build a custom application interface using Python classes and Tkinter. This specific GUI framework was not covered by your professor in the group lecture. Instead of giving up or waiting until Monday to ask the central figure to teach it to the class, you activate your new Distributed Individual habit: you independently pull up the official Tkinter documentation, watch a specialized digital tutorial, and tailor your learning to your specific pace. You build the application entirely on your own!`
                    },
                    {
                        type: "summary_card",
                        title: "SUMMARY AND CONCLUSION",
                        items: [
                            "Your Baseline: You naturally rely on structured group instruction and a central figure to guide you alongside your peers.",
                            "The Gap: You discovered that relying solely on synchronized, teacher-led pacing can limit your ability to dive into niche, personalized IT topics.",
                            "The Shift: You learned actionable steps to transition from waiting for the group to taking the initiative to access diverse resources independently.",
                            "The Goal: You now have the tools to facilitate self-directed learning and tailor your educational path to your specific interests and pace."
                        ],
                        closing: "Looking Ahead: Mastering your learning matrix is not about abandoning your strengths; it is about expanding your adaptability. By identifying your natural reliance on collective, hierarchical learning and deliberately practicing distributed, individual habits, you are preparing yourself for the fast-paced, highly specialized reality of the tech industry. Keep practicing these small shifts, and your ability to tackle any academic or professional challenge will multiply!\n\nReflection Question: What specific technical topic outside of your current class syllabus could you explore during a 45-minute 'Personal Interest' block this week?"
                    }
                ],
                questions: [
                    {
                        question_text: "What is the 'One Digital Resource' rule designed to encourage?",
                        question_type: "multiple_choice",
                        options: [
                            "Finding an external technical article, tutorial, or documentation to expand beyond class lectures",
                            "Only visiting one website per week",
                            "Deleting external bookmarks",
                            "Copying homework directly from peers"
                        ],
                        correct_answer: "Finding an external technical article, tutorial, or documentation to expand beyond class lectures",
                        explanation: "Finding external documentation or tutorials trains students in self-directed research and independent problem solving."
                    }
                ]
            }
        ]
    }
];

function seedModules() {
    db.serialize(() => {
        // Clear previous placeholder modules to ensure fresh exact match with the new curriculum
        db.run(`DELETE FROM module_questions WHERE module_id IN (SELECT id FROM modules)`);
        db.run(`DELETE FROM module_chapters WHERE module_id IN (SELECT id FROM modules)`);
        db.run(`DELETE FROM modules`);

        const insertModule = db.prepare(`INSERT INTO modules (title, description, quadrant_category, difficulty, topic, estimated_time, is_published, is_archived) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);
        const insertChapter = db.prepare(`INSERT INTO module_chapters (module_id, chapter_order, title, text_content, learning_objectives, examples, estimated_time, content_blocks_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);
        const insertQuestion = db.prepare(`INSERT INTO module_questions (module_id, chapter_id, question_type, question_order, question_text, options_json, correct_answer_json, explanation) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);

        modulesData.forEach((mod, modIdx) => {
            insertModule.run(
                mod.title,
                mod.description,
                mod.quadrant_category,
                mod.difficulty,
                mod.topic,
                mod.estimated_time,
                mod.is_published,
                mod.is_archived,
                function(err) {
                    if (err) {
                        console.error("Error inserting module:", err);
                        return;
                    }
                    const moduleId = this.lastID;
                    console.log(`Inserted Module ${moduleId}: ${mod.title}`);

                    mod.chapters.forEach((ch, chIdx) => {
                        const blocksJson = JSON.stringify(ch.content_blocks);
                        insertChapter.run(
                            moduleId,
                            chIdx + 1,
                            ch.title,
                            '',
                            '',
                            '',
                            ch.estimated_time,
                            blocksJson,
                            function(chErr) {
                                if (chErr) {
                                    console.error("Error inserting chapter:", chErr);
                                    return;
                                }
                                const chapterId = this.lastID;
                                console.log(`  -> Inserted Chapter ${chapterId}: ${ch.title}`);

                                if (ch.questions && ch.questions.length > 0) {
                                    ch.questions.forEach((q, qIdx) => {
                                        insertQuestion.run(
                                            moduleId,
                                            chapterId,
                                            q.question_type,
                                            qIdx + 1,
                                            q.question_text,
                                            JSON.stringify(q.options),
                                            JSON.stringify(q.correct_answer),
                                            q.explanation
                                        );
                                    });
                                }
                            }
                        );
                    });
                }
            );
        });

        insertModule.finalize();
    });
}

seedModules();
setTimeout(() => {
    console.log("Seeding complete!");
    db.close();
}, 2000);
