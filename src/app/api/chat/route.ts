import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export async function POST(req: Request) {
    try {
        const { message } = await req.json();
        const query = message.toLowerCase();

        // 1. Fetch search data (Admissions & Scholarships)
        const [admissionsSnap, scholarshipsSnap] = await Promise.all([
            adminDb.collection("admissions").get(),
            adminDb.collection("scholarships").get()
        ]);

        const admissions = admissionsSnap.docs.map((doc: any) => doc.data());
        const scholarships = scholarshipsSnap.docs.map((doc: any) => doc.data());

        let reply = "";

        // 2. Simple matching logic
        // Check for specific university mentions
        const matchedUni = admissions.find((uni: any) =>
            query.includes(uni.university.toLowerCase()) ||
            (uni.location && query.includes(uni.location.toLowerCase())) ||
            (uni.program && query.includes(uni.program.toLowerCase()))
        );

        // Check for scholarship mentions
        const matchedSch = scholarships.find((sch: any) =>
            query.includes(sch.name.toLowerCase()) ||
            query.includes("scholarship")
        );

        if (matchedUni && query.includes("fee")) {
            reply = `The fees for ${matchedUni.university} are: ${matchedUni.fees}. Would you like to check their requirements as well?`;
        } else if (matchedUni && query.includes("requirement")) {
            reply = `To get into ${matchedUni.university}, you need: ${matchedUni.requirements}`;
        } else if (matchedUni && query.includes("deadline")) {
            reply = `The admission deadline for ${matchedUni.university} is ${matchedUni.deadline}. Make sure to apply soon!`;
        } else if (matchedUni) {
            reply = `${matchedUni.university} is located in ${matchedUni.location}. They offer programs in ${matchedUni.departments}. Their website is ${matchedUni.website}. How else can I help?`;
        } else if (matchedSch && (query.includes("eligible") || query.includes("eligibility"))) {
            reply = `For the ${matchedSch.name}, the eligibility is: ${matchedSch.eligibility}`;
        } else if (matchedSch && query.includes("amount")) {
            reply = `The ${matchedSch.name} offers: ${matchedSch.amount}`;
        } else if (matchedSch) {
            reply = `I found a scholarship: ${matchedSch.name}. It's a ${matchedSch.category}. ${matchedSch.description}`;
        } else if (query.includes("hello") || query.includes("hi")) {
            reply = "Hello! I'm your Academic Portal Assistant. How can I help you with your university search or scholarship applications today?";
        } else if (query.includes("scholarship")) {
            const schNames = scholarships.slice(0, 3).map((s: any) => s.name).join(", ");
            reply = `I can help you with several scholarships like ${schNames}, and many more. Which one are you interested in?`;
        } else if (query.includes("university") || query.includes("admissions")) {
            const uniNames = admissions.slice(0, 3).map((u: any) => u.university).join(", ");
            reply = `We have information on top universities like ${uniNames}. Are you looking for fees, requirements, or deadlines?`;
        } else {
            reply = "I'm not quite sure I understand. I can help with university fees, admission requirements, deadlines, or scholarship details. Could you please specify which university or scholarship you're interested in?";
        }

        return NextResponse.json({ reply });
    } catch (error) {
        console.error("Chat API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
