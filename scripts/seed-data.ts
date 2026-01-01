import * as admin from "firebase-admin";
import * as fs from "fs";
import * as path from "path";

// Load .env.local manually
const envPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, "utf-8");
    envFile.split("\n").forEach((line) => {
        const [key, ...valueParts] = line.split("=");
        if (key && valueParts.length > 0) {
            process.env[key.trim()] = valueParts.join("=").trim().replace(/^"(.*)"$/, "$1");
        }
    });
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
        console.error("Missing Firebase credentials in .env.local");
        process.exit(1);
    }
}

const db = admin.firestore();

const universities = [
    {
        university: "National University of Sciences & Technology (NUST)",
        location: "Islamabad",
        type: "Public Research",
        website: "https://www.nust.edu.pk/admissions/undergraduate/",
        requirements: "Minimum 60–70% in FSc/Equivalent + NUST Entry Test (NET).",
        fees: "~ $2,500–$3,200 per semester for international / ~PKR 120,000 for locals.",
        departments: "Engineering, IT, Business, Natural Sciences, Architecture, Law.",
        image: "https://images.unsplash.com/photo-1592280771190-3e2e4d571952?q=80&w=1974&auto=format&fit=crop",
        country: "Pakistan",
        program: "Engineering & Tech",
        deadline: "July 2025"
    },
    {
        university: "Lahore University of Management Sciences (LUMS)",
        location: "Lahore",
        type: "Private",
        website: "https://admissions.lums.edu.pk/",
        requirements: "High merit in FSc/A-Levels + SAT/LUMS Entry Test + Interview.",
        fees: "~PKR 23,760 per credit hour (Approx. $1,500+ per semester).",
        departments: "Business, Economics, Computer Science, Law, Social Sciences.",
        image: "https://images.unsplash.com/photo-1519452575417-564c1401ecc0?q=80&w=2070&auto=format&fit=crop",
        country: "Pakistan",
        program: "Management & CS",
        deadline: "April 2025"
    },
    {
        university: "Aga Khan University (AKU)",
        location: "Karachi",
        type: "Private",
        website: "https://www.aku.edu/admissions/Pages/home.aspx",
        requirements: "Top-tier merit + AKU Entry Test (very competitive).",
        fees: "Medical: ~10.32L per semester.",
        departments: "MBBS, Nursing, Public Health, Allied Health.",
        image: "https://images.unsplash.com/photo-1576091160550-217359f4814c?q=80&w=2070&auto=format&fit=crop",
        country: "Pakistan",
        program: "Medicine",
        deadline: "May 2025"
    },
    {
        university: "Institute of Business Administration (IBA)",
        location: "Karachi",
        type: "Public Sector",
        website: "https://admissions.iba.edu.pk/",
        requirements: "Competitive Entry Test + Interview.",
        fees: "~PKR 350,000 - 450,000 per year.",
        departments: "Business Administration, Economics, Finance, Social Sciences.",
        image: "https://images.unsplash.com/photo-152305085306e-8233a5763ffc?q=80&w=2070&auto=format&fit=crop",
        country: "Pakistan",
        program: "Business & Social Sciences",
        deadline: "June 2025"
    },
    {
        university: "COMSATS University Islamabad (CUI)",
        location: "Islamabad",
        type: "Public",
        website: "https://admissions.comsats.edu.pk/",
        requirements: "Minimum 60% in Intermediate + NTS NAT/CUI Test.",
        fees: "~PKR 114,000 - 118,000 per semester.",
        departments: "Computer Science, Software Engineering, Electrical Engineering, Business.",
        image: "https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=1986&auto=format&fit=crop",
        country: "Pakistan",
        program: "IT & Engineering",
        deadline: "Jan 2026 (Spring)"
    },
    {
        university: "Air University (AU)",
        location: "Islamabad",
        type: "Public",
        website: "https://www.au.edu.pk/Pages/Admission/admission_schedule.aspx",
        requirements: "Minimum 50-60% in HSSC + AU-CBT Entry Test.",
        fees: "CS/IT: ~PKR 127k-153k | Business: ~PKR 108k per semester.",
        departments: "Computing & AI, Aerospace, Business, Law, Social Sciences.",
        image: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=2073&auto=format&fit=crop",
        country: "Pakistan",
        program: "Computing & AI",
        deadline: "July 2025"
    },
    {
        university: "University of the Punjab",
        location: "Lahore",
        type: "Public",
        website: "http://admissions.pu.edu.pk/",
        requirements: "Merit based on prior qualifications + Entry Test for specific programs.",
        fees: "Relatively low (Public sector rates).",
        departments: "Arts, Sciences, Business, Law, Pharmacy, Engineering.",
        image: "https://images.unsplash.com/photo-1541339907198-e08756ebafe3?q=80&w=2070&auto=format&fit=crop",
        country: "Pakistan",
        program: "General & Professional",
        deadline: "August 2025"
    },
    {
        university: "UET Lahore",
        location: "Lahore",
        type: "Public",
        website: "https://admission.uet.edu.pk/",
        requirements: "FSc Pre-Engineering + ECAT Entry Test.",
        fees: "Regular: ~PKR 70k-88k | Self-Finance: ~PKR 150k+.",
        departments: "Electrical, Mechanical, Civil, Chemical, Computer Engineering.",
        image: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?q=80&w=2070&auto=format&fit=crop",
        country: "Pakistan",
        program: "Engineering",
        deadline: "August 2025"
    },
    {
        university: "Sindh Agriculture University",
        location: "Tando Jam",
        type: "Public",
        website: "https://sau.edu.pk/admissions/",
        requirements: "Merit based on HSSC + Entrance Test.",
        fees: "Standard Public Sector fees.",
        departments: "Agriculture, Food Science, Veterinary, Engineering.",
        image: "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?q=80&w=2070&auto=format&fit=crop",
        country: "Pakistan",
        program: "Agriculture",
        deadline: "September 2025"
    }
];

const scholarships = [
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
        name: "LUMS National Outreach Programme (NOP)",
        category: "Undergraduate Scholarship",
        amount: "100% Funding (Tuition + Books + Hostel + Stipend)",
        eligibility: "Exceptional matric/FSc results + financial need.",
        description: "LUMS signature programme to provide quality education to brilliant students regardless of their financial status.",
        link: "https://nop.lums.edu.pk/",
        deadline: "March each year"
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
        name: "DAAD Scholarships (Germany)",
        category: "Graduate Program",
        amount: "Tuition Free + Living Allowance (~€934/month)",
        eligibility: "Bachelors degree + relevant work experience.",
        description: "Study in top German universities with full funding for Master's programs.",
        link: "https://www.daad.de/",
        deadline: "Oct - Dec (for next year)"
    }
];

async function seed() {
    console.log("Starting seed...");

    // Clear existing (optional, but good for fresh start)
    // For safety, we'll just add.

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
}

seed();
