import * as admin from "firebase-admin";
import * as fs from "fs";
import * as path from "path";

// Load environment variables manually
const envPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, "utf-8");
    envFile.split(/\r?\n/).forEach((line) => {
        const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)$/);
        if (match) {
            let value = (match[2] || "").trim();
            // Remove surround quotes
            if (value.length > 0 && value.startsWith('"') && value.endsWith('"')) {
                value = value.substring(1, value.length - 1);
            }
            process.env[match[1]] = value;
        }
    });
} else {
    console.log("No .env.local found, checking for environment variables...");
}

if (!admin.apps.length) {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;

    if (projectId && clientEmail && privateKey) {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId,
                clientEmail,
                privateKey: privateKey.replace(/\\n/g, "\n"),
            }),
        });
    } else {
        console.error("Missing Firebase credentials. Ensure they are in your environment or Academic-Portal.env");
        process.exit(1);
    }
}

const db = admin.firestore();

const universities = [
    {
        university: "National University of Sciences & Technology (NUST)",
        location: "Islamabad",
        branchCampuses: [
            "Islamabad (H-12 – Main Campus)",
            "Rawalpindi (Military College of Signals, EME, CAE)",
            "Karachi (PNEC)"
        ],
        type: "Public Research",
        website: "https://www.nust.edu.pk/admissions/undergraduate/",
        requirements: "Minimum 60–75% in FSc/Equivalent + NUST Entry Test (NET).",
        fees: "~PKR 120,000–150,000 per semester (local students).",
        famousDepartments: [
            "Engineering (SEECS, SMME)",
            "Computer Science & AI",
            "Business (NBS)",
            "Architecture & Industrial Design (SADA)"
        ],
        image: "/images/nust.png",
        country: "Pakistan",
        program: "Engineering, Computing & Sciences",
        deadline: "July 2025"
    },

    {
        university: "Lahore University of Management Sciences (LUMS)",
        location: "Lahore",
        branchCampuses: ["Lahore (DHA – Single Campus University)"],
        type: "Private",
        website: "https://admissions.lums.edu.pk/",
        requirements: "Excellent academic record in FSc/A-Levels + SAT/LUMS Test + Interview.",
        fees: "~PKR 1.6–1.9 million per semester (program dependent).",
        famousDepartments: [
            "SDSB (Business & Management)",
            "Computer Science",
            "Economics",
            "Law (Shaikh Ahmad Hassan School of Law)"
        ],
        image: "/images/lums.jpg",
        country: "Pakistan",
        program: "Management, Economics & CS",
        deadline: "April 2025"
    },

    {
        university: "Aga Khan University (AKU)",
        location: "Karachi",
        branchCampuses: [
            "Karachi (Main)",
            "Teaching Hospitals across Pakistan"
        ],
        type: "Private",
        website: "https://www.aku.edu/admissions/Pages/home.aspx",
        requirements: "Exceptional academic merit + AKU Entry Test + Interview.",
        fees: "MBBS: ~PKR 1,000,000+ per semester.",
        famousDepartments: [
            "Medicine (MBBS)",
            "Nursing & Midwifery",
            "Public Health",
            "Biological & Health Sciences"
        ],
        image: "/images/aku.png",
        country: "Pakistan",
        program: "Medicine & Health Sciences",
        deadline: "May 2025"
    },

    {
        university: "Institute of Business Administration (IBA)",
        location: "Karachi",
        branchCampuses: [
            "Main Campus",
            "City Campus"
        ],
        type: "Public Sector",
        website: "https://admissions.iba.edu.pk/",
        requirements: "Highly competitive IBA Entry Test + Interview.",
        fees: "~PKR 175,000–225,000 per semester.",
        famousDepartments: [
            "Business Administration",
            "Accounting & Finance",
            "Economics",
            "Social Sciences"
        ],
        image: "/images/iba.jpg",
        country: "Pakistan",
        program: "Business & Economics",
        deadline: "June 2025"
    },

    {
        university: "COMSATS University Islamabad (CUI)",
        location: "Islamabad",
        branchCampuses: [
            "Islamabad (Main)",
            "Lahore",
            "Wah",
            "Abbottabad",
            "Vehari",
            "Sahiwal",
            "Attock"
        ],
        type: "Public",
        website: "https://admissions.comsats.edu.pk/",
        requirements: "Minimum 60% in Intermediate + NTS NAT / CUI Test.",
        fees: "~PKR 114,000–118,000 per semester.",
        famousDepartments: [
            "Computer Science",
            "Software Engineering",
            "Electrical Engineering",
            "Business Administration"
        ],
        image: "/images/comsats.jpg",
        country: "Pakistan",
        program: "IT & Engineering",
        deadline: "January 2026 (Spring)"
    },

    {
        university: "Air University (AU)",
        location: "Islamabad",
        branchCampuses: [
            "Islamabad (Main)",
            "Multan",
            "Kamra",
            "Kharian",
            "Karachi"
        ],
        type: "Public",
        website: "https://www.au.edu.pk/Pages/Admission/admission_schedule.aspx",
        requirements: "Minimum 50–60% in HSSC + AU-CBT Entry Test.",
        fees: "CS/IT: ~PKR 130k–155k | Business: ~PKR 108k per semester.",
        famousDepartments: [
            "Computer Science & AI",
            "Cyber Security",
            "Aerospace Engineering",
            "Business Administration"
        ],
        image: "/images/air_uni.png",
        country: "Pakistan",
        program: "Computing, AI & Engineering",
        deadline: "July 2025"
    },

    {
        university: "University of the Punjab",
        location: "Lahore",
        branchCampuses: [
            "Allama Iqbal Campus",
            "Quaid-e-Azam Campus",
            "Gujranwala Campus",
            "Jhelum Campus"
        ],
        type: "Public",
        website: "http://admissions.pu.edu.pk/",
        requirements: "Merit-based; Entry Test for selected programs.",
        fees: "Very low public-sector fee structure.",
        famousDepartments: [
            "Law",
            "Pharmacy",
            "Economics",
            "Arts & Humanities"
        ],
        image: "/images/punjab_uni.jpg",
        country: "Pakistan",
        program: "General & Professional",
        deadline: "August 2025"
    },

    {
        university: "University of Engineering & Technology (UET Lahore)",
        location: "Lahore",
        branchCampuses: [
            "Lahore (Main)",
            "Kala Shah Kaku",
            "Faisalabad",
            "Narowal"
        ],
        type: "Public",
        website: "https://admission.uet.edu.pk/",
        requirements: "FSc Pre-Engineering + ECAT.",
        fees: "Regular: ~PKR 70k–90k | Self-Finance higher.",
        famousDepartments: [
            "Electrical Engineering",
            "Mechanical Engineering",
            "Civil Engineering",
            "Computer Engineering"
        ],
        image: "/images/uet_lahore.png",
        country: "Pakistan",
        program: "Engineering",
        deadline: "August 2025"
    },

    {
        university: "Habib University",
        location: "Karachi",
        branchCampuses: ["Karachi (Single Campus)"],
        type: "Private",
        website: "https://habib.edu.pk/",
        requirements: "Strong academics + HU Admission Test / SAT.",
        fees: "~PKR 650,000+ per semester (financial aid widely available).",
        famousDepartments: [
            "Computer Science",
            "Social Development & Policy",
            "Liberal Arts",
            "Communication & Design"
        ],
        image: "/images/habib.jpg",
        country: "Pakistan",
        program: "Liberal Arts & CS",
        deadline: "March 2025"
    },

    {
        university: "Quaid-e-Azam University (QAU)",
        location: "Islamabad",
        branchCampuses: ["Islamabad (Main Campus)"],
        type: "Public Research",
        website: "https://www.qau.edu.pk/",
        requirements: "Merit-based (high competition).",
        fees: "Very low public-sector fees.",
        famousDepartments: [
            "Physics",
            "Chemistry",
            "Biological Sciences",
            "International Relations"
        ],
        image: "/images/qau.jpg",
        country: "Pakistan",
        program: "Sciences & Research",
        deadline: "July 2025"
    },

    {
        university: "Pakistan Institute of Engineering and Applied Sciences (PIEAS)",
        location: "Islamabad",
        branchCampuses: ["Islamabad (Single Campus)"],
        type: "Public Research",
        website: "http://www.pieas.edu.pk/",
        requirements: "Top merit + PIEAS Entry Test.",
        fees: "Highly subsidized; scholarships common.",
        famousDepartments: [
            "Nuclear Engineering",
            "Mechanical Engineering",
            "Computer & Information Sciences"
        ],
        image: "/images/pieas.jpg",
        country: "Pakistan",
        program: "Engineering & Applied Sciences",
        deadline: "June 2025"
    },

    {
        university: "FAST – National University of Computer & Emerging Sciences",
        location: "Islamabad",
        branchCampuses: [
            "Islamabad",
            "Lahore",
            "Karachi",
            "Peshawar",
            "Chiniot-Faisalabad"
        ],
        type: "Private",
        website: "https://isb.nu.edu.pk/",
        requirements: "FAST Entry Test / SAT.",
        fees: "~PKR 150,000–180,000 per semester.",
        famousDepartments: [
            "Computer Science",
            "Software Engineering",
            "Artificial Intelligence"
        ],
        image: "/images/fast.jpg",
        country: "Pakistan",
        program: "Computer Science",
        deadline: "July 2025"
    },

    {
        university: "Ghulam Ishaq Khan Institute (GIKI)",
        location: "Topi, Khyber Pakhtunkhwa",
        branchCampuses: ["Topi (Main Campus)"],
        type: "Private Research",
        website: "https://giki.edu.pk/",
        requirements: "Competitive merit + GIKI Entry Test (for engineering / CS).",
        fees: "~PKR 400,000+ per academic year (varies by program).",
        famousDepartments: [
            "Electrical Engineering",
            "Computer Science & Engineering",
            "Mechanical Engineering",
            "Materials Science & Engineering",
            "Management Sciences"
        ],
        image: "/images/giki.jpg",
        country: "Pakistan",
        program: "Engineering & Tech Sciences",
        deadline: "June–July 2025"
    },
    {
        university: "NED University of Engineering and Technology",
        location: "Karachi",
        branchCampuses: ["Main Campus, Karachi"],
        type: "Public Engineering",
        website: "https://www.neduet.edu.pk/",
        requirements: "Merit-based + Pre-Admission Entry Test for engineering; HSC (Pre-Eng) typical.",
        fees: "~PKR 59,000–64,000 per semester (core tuition) + other charges. ",
        famousDepartments: [
            "Civil Engineering",
            "Electrical Engineering",
            "Computer Science",
            "Mechanical Engineering",
            "Software Engineering"
        ],
        image: "/images/ned.jpg",
        country: "Pakistan",
        program: "Engineering & Tech",
        deadline: "May–June 2025"
    },
    {
        university: "National University of Modern Languages (NUML)",
        location: "Islamabad",
        branchCampuses: [
            "Islamabad (Main)",
            "Lahore",
            "Karachi",
            "Quetta",
            "Faisalabad",
            "Multan",
            "Hyderabad",
            "Peshawar",
            "Rawalpindi",
            "Mirpur (AJK)"
        ],
        type: "Public",
        website: "https://www.numl.edu.pk/",
        requirements: "Merit-based admission; varies by program & campus.",
        fees: "Varies by campus & discipline (official fee structure available on site).",
        famousDepartments: [
            "Languages & Linguistics",
            "Management Sciences",
            "Computer Science & Software Engineering",
            "Media & Communication Studies",
            "Psychology"
        ],
        image: "/images/numl.jpg",
        country: "Pakistan",
        program: "Languages, Social Sciences & Tech",
        deadline: "Varies by intake (Fall & Spring 2025–2026)"
    },
    {
        university: "Institute of Business Management (IoBM)",
        location: "Karachi",
        branchCampuses: ["Main Campus, Korangi Creek Road"],
        type: "Private",
        website: "https://iobm.edu.pk/",
        requirements: "Merit-based + IoBM admissions test/interview for some programs.",
        fees: "~PKR 140,000–180,000 per semester (depending on program).",
        famousDepartments: [
            "Business Management",
            "Computer Science & Information Systems",
            "Economics & Social Development",
            "Engineering Sciences"
        ],
        image: "/images/iobm.jpg",
        country: "Pakistan",
        program: "Business, Tech & Social Sciences",
        deadline: "December 2025 (Spring 2026 merit list)",
    },
    {
        university: "University of Lahore (UOL)",
        location: "Lahore",
        branchCampuses: [
            "Main Campus, Lahore",
            "Defence Road Campus",
            "City Campus",
            "Islamabad Campus",
            "Sargodha Campus",
            "Pakpattan Campus",
            "Gujrat Campus"
        ],
        type: "Private",
        website: "https://uol.edu.pk/",
        requirements: "Merit-based + program-specific entry requirements.",
        fees: "~PKR 85,000–150,000 per semester for many programs (estimate).",
        famousDepartments: [
            "Computer Science",
            "Electrical & Civil Engineering",
            "Medicine & Health Sciences",
            "Business & Management",
            "Pharmacy"
        ],
        image: "/images/uol.jpg",
        country: "Pakistan",
        program: "Multi-disciplinary (Engineering, Medicine, Business, Sciences)",
        deadline: "August 2025"
    },
    {
        university: "University of Karachi",
        location: "Karachi",
        branchCampuses: [
            "Main Campus (University Road)",
            "Affiliated Colleges across Sindh"
        ],
        type: "Public",
        website: "https://www.uok.edu.pk/",
        requirements: "Merit-based admission; Entry tests for specific programs; Minimum 45-50% in Intermediate/Equivalent.",
        fees: "Very low public-sector fee structure (~PKR 5,000-15,000 per semester for most programs).",
        famousDepartments: [
            "Arts & Humanities",
            "Sciences (Physics, Chemistry, Mathematics)",
            "Business Administration",
            "Law",
            "Pharmacy",
            "Engineering",
            "Computer Science",
            "Islamic Studies"
        ],
        image: "/images/ku.jpg",
        country: "Pakistan",
        program: "General & Professional (Arts, Sciences, Business, Law)",
        deadline: "Varies by program (typically July-August 2025)"
    },
    {
        university: "SZABIST (Shaheed Zulfikar Ali Bhutto Institute of Science & Technology)",
        location: "Islamabad",
        branchCampuses: [
            "Islamabad (Main)",
            "Karachi",
            "Dubai",
            "Larkana",
            "Hyderabad",
            "Gharo"
        ],
        type: "Private",
        website: "https://szabist-isb.edu.pk/",
        requirements: "Minimum 50% in Intermediate/A-Levels + SZABIST Entry Test + Interview for selected programs.",
        fees: "~PKR 120,000-180,000 per semester (varies by program and campus).",
        famousDepartments: [
            "Management Sciences (MBA, BBA)",
            "Computer Sciences (CS, SE, AI)",
            "Social Sciences (Psychology, IR)",
            "Media Sciences (Mass Communication)",
            "Executive Programs"
        ],
        image: "/images/zabist.jpg",
        country: "Pakistan",
        program: "Business, IT, Social Sciences & Media",
        deadline: "Spring 2026 (Check admission portal)"
    }

];


const scholarships = [
    {
        name: "Jenabai Hussainali Shariff and Family Scholarship",
        category: "Undergraduate Scholarship",
        amount: "Variable (Merit-cum-Need Based)",
        eligibility: "High academic merit, financial need, undergraduate enrollment.",
        description: "A prestigious scholarship established to support meritorious students from disadvantaged backgrounds in their undergraduate studies.",
        link: "https://www.google.com/search?q=Jenabai+Hussainali+Shariff+and+Family+Scholarship",
        deadline: "August 2025"
    },
    {
        name: "National Outreach Programme (NOP) – LUMS",
        category: "Undergraduate Scholarship",
        amount: "100% Tuition Fee + Living Allowance + Accommodation",
        eligibility: "Pakistani students from financially disadvantaged backgrounds with strong academic performance; Intermediate/A-Level students meeting LUMS merit criteria.",
        description: "The National Outreach Programme (NOP) by LUMS aims to provide fully funded undergraduate education to talented students from underserved communities across Pakistan. It includes academic preparation, mentorship, and complete financial support for selected students.",
        link: "https://nop.lums.edu.pk/",
        deadline: "December–January (varies annually)"
    },
    {
        name: "National Talent Hunt Program (NTHP) – IBA Karachi",
        category: "Undergraduate Scholarship",
        amount: "Up to 100% Tuition Fee + Stipend (Need-Based)",
        eligibility: "Students from underprivileged backgrounds across Pakistan with strong academic potential; must qualify IBA admission requirements after preparatory program.",
        description: "The National Talent Hunt Program (NTHP) is a flagship initiative of IBA Karachi designed to identify and support bright students from low-income families. The program provides preparatory education, mentorship, and financial assistance leading to undergraduate admission at IBA.",
        link: "https://www.iba.edu.pk/nthp",
        deadline: "January–February (varies annually)"
    },
    {
        name: "Habib University Talent Outreach Promotion & Support (HuTOPS)",
        category: "Undergraduate Scholarship",
        amount: "Up to 100% Tuition Fee (Need-Based Financial Aid)",
        eligibility: "Pakistani students from financially disadvantaged backgrounds with strong academic potential; must apply and qualify for Habib University undergraduate programs.",
        description: "HuTOPS is Habib University’s outreach and financial aid initiative aimed at increasing access to liberal arts education for talented students from underrepresented communities. It provides extensive need-based financial support along with academic mentoring.",
        link: "https://habib.edu.pk/admissions/financial-aid/",
        deadline: "January–March (varies annually)"
    },
    {
        name: "Ehsaas Undergraduate Scholarship (BISP)",
        category: "Undergraduate Scholarship",
        amount: "Full Tuition + Living Allowance",
        eligibility: "Student from low-income family, enrolled in HEC recognized uni.",
        description: "A major financial aid initiative by HEC and BISP for deserving students.",
        link: "https://www.hec.gov.pk/english/scholarshipsgrants/Ehsaas",
        deadline: "Varies (usually Fall)"
    },
    {
        name: "HEC Need-Based Scholarships",
        category: "Undergraduate Scholarship",
        amount: "Tuition Fee + Stipend",
        eligibility: "Based on family income and merit.",
        description: "Financial assistance provided by HEC to talented but needy students.",
        link: "https://www.hec.gov.pk/english/scholarshipsgrants/pages/default.aspx",
        deadline: "Check HEC Portal"
    },
    {
        name: "Chevening Scholarship (UK)",
        category: "Graduate Program",
        amount: "Full Coverage (Tuition + Travel + Living)",
        eligibility: "Bachelor's degree, 2 years work experience, leadership potential.",
        description: "The UK government's international awards programme aimed at developing global leaders.",
        link: "https://www.chevening.org/apply/",
        deadline: "November each year"
    },
    {
        name: "Fulbright Scholarship (USA)",
        category: "Graduate Program",
        amount: "Full Coverage (Tuition, Travel, Health, Living)",
        eligibility: "BS/Masters degree with high academic merit.",
        description: "One of the most prestigious scholarships for Pakistani students to study in the USA.",
        link: "https://usefp.org/",
        deadline: "May 2025"
    },
    {
        name: "Chinese Government Scholarship",
        category: "Undergraduate Scholarship",
        amount: "Full Tuition + Accommodation + Monthly Stipend",
        eligibility: "Pakistani citizenship, relevant academic background.",
        description: "Covers undergraduate programs in various Chinese universities.",
        link: "https://www.campuschina.org/",
        deadline: "Feb - March 2025"
    },
    {
        name: "Aga Khan Foundation International Scholarship",
        category: "Graduate Program",
        amount: "50% Grant + 50% Loan (interest-free for study period)",
        eligibility: "Pakistani students with Bachelor's degree, excellent academic record, admission to reputable university, financial need, commitment to development.",
        description: "The Aga Khan Foundation provides scholarships for postgraduate studies to outstanding students from developing countries who have no other means of financing their education. Priority is given to students pursuing Master's degrees.",
        link: "https://the.akdn/en/what-we-do/developing-human-capacity/education/international-scholarships",
        deadline: "March 31 annually"
    },
    {
        name: "Erasmus Mundus Joint Masters",
        category: "Graduate Program",
        amount: "Full Tuition + Monthly Stipend (€1,400) + Travel Costs",
        eligibility: "Pakistani students with Bachelor's degree, strong academic record, English proficiency (IELTS/TOEFL), admission to Erasmus Mundus program.",
        description: "Erasmus Mundus offers fully-funded scholarships for international students to pursue joint Master's degrees across multiple European universities. Students study in at least two different EU countries.",
        link: "https://erasmus-plus.ec.europa.eu/opportunities/opportunities-for-individuals/students/erasmus-mundus-joint-masters",
        deadline: "Varies by program (typically October-January)"
    },
    {
        name: "Korean Government Scholarship (GKS) - Graduate",
        category: "Graduate Program",
        amount: "Full Tuition + Monthly Stipend (₩1,000,000) + Airfare + Korean Language Training",
        eligibility: "Pakistani citizens under 40 years, Bachelor's degree with GPA 2.64+/4.0, good health, no previous Korean government scholarship.",
        description: "The Korean Government Scholarship Program (GKS) offers fully-funded opportunities for international students to pursue Master's and PhD degrees at Korean universities. Includes 1-year Korean language training.",
        link: "https://www.studyinkorea.go.kr/in/plan/scholarship.do",
        deadline: "February - March annually"
    },
    {
        name: "Chinese Government Scholarship - Master's Program",
        category: "Graduate Program",
        amount: "Full Tuition + Monthly Stipend (¥3,000) + Accommodation + Medical Insurance",
        eligibility: "Pakistani citizens with Bachelor's degree, under 35 years, good academic record, good health, HSK certification (for Chinese-taught programs).",
        description: "The Chinese Government offers full scholarships for international students pursuing Master's degrees at Chinese universities. Programs available in English and Chinese across various disciplines.",
        link: "https://www.china-admissions.com/study-a-masters-degree-in-china/",
        deadline: "January - April annually"
    },
    {
        name: "HEC International Scholarships for Master's",
        category: "Graduate Program",
        amount: "Full Tuition + Monthly Stipend + Travel Allowance",
        eligibility: "Pakistani citizens with 16 years education (Bachelor's), minimum 60% marks, admission to foreign university, age under 35, no previous foreign scholarship.",
        description: "Higher Education Commission (HEC) of Pakistan offers scholarships for Pakistani students to pursue Master's and PhD degrees at top universities worldwide. Covers various countries including USA, UK, China, Turkey, and more.",
        link: "https://www.hec.gov.pk/english/scholarshipsgrants/Pages/internationalScholarships.aspx",
        deadline: "Varies by country (check HEC portal)"
    }
];

async function clearCollection(collectionName: string) {
    const snapshot = await db.collection(collectionName).get();
    const batch = db.batch();
    snapshot.docs.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();
    console.log(`Cleared collection: ${collectionName}`);
}

async function seed() {
    try {
        console.log("Starting full seed...");

        // Clear existing for a fresh start
        await clearCollection("admissions");
        await clearCollection("scholarships");

        for (const uni of universities) {
            await db.collection("admissions").add({
                ...uni,
                createdAt: new Date().toISOString()
            });
            console.log(`Added university: ${uni.university}`);
        }

        for (const scholarship of scholarships) {
            await db.collection("scholarships").add({
                ...scholarship,
                createdAt: new Date().toISOString()
            });
            console.log(`Added scholarship: ${scholarship.name}`);
        }

        console.log("Seed finished successfully!");
        process.exit(0);
    } catch (error) {
        console.error("Seed failed!");
        console.error(error);
        process.exit(1);
    }
}

seed();
