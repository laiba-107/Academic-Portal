import Link from "next/link";
import { GraduationCap, Award, MessageSquare, Users, CheckCircle2, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section
        className="relative h-[85vh] flex items-center justify-center text-center px-4 overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(30, 58, 138, 0.7), rgba(15, 23, 42, 0.9)), url('/background.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="container relative z-10 space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-bold mb-4 animate-bounce">
            <CheckCircle2 className="h-4 w-4 text-primary-foreground" /> Your Success Story Starts Here
          </div>
          <h1 className="text-5xl md:text-8xl font-black tracking-tight text-white leading-tight">
            The Ultimate <span className="text-primary-foreground">Student</span> <br />
            Academic Portal
          </h1>
          <p className="text-xl md:text-2xl text-slate-200 max-w-3xl mx-auto leading-relaxed font-medium">
            Join thousands of students securing their future with our comprehensive university database,
            expert mentorship, and exclusive scholarship opportunities.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Link
              href="/signup"
              className="px-10 py-5 bg-white text-primary text-lg font-black rounded-full shadow-2xl hover:bg-slate-100 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              Get Started Now <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/login"
              className="px-10 py-5 bg-white/10 backdrop-blur-md border border-white/30 text-white text-lg font-bold rounded-full hover:bg-white/20 transition-all"
            >
              Sign In to Your Account
            </Link>
          </div>
        </div>

        {/* Abstract Shapes for Polish */}
        <div className="absolute top-1/4 left-10 w-64 h-64 bg-primary/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-10 w-64 h-64 bg-primary-foreground/10 rounded-full blur-[120px]" />
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-slate-50">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-5xl font-black text-primary">Everything You Need to Excel</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-medium">
              We provide the tools and guidance to navigate your academic journey with confidence.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <GraduationCap className="h-8 w-8" />,
                title: "University Database",
                desc: "Explore detailed requirements and fee structures for top-tier universities locally and globally.",
                color: "bg-blue-500"
              },
              {
                icon: <Award className="h-8 w-8" />,
                title: "Scholarship Portal",
                desc: "Access exclusive undergraduate and graduate funding opportunities to fuel your education.",
                color: "bg-purple-500"
              },
              {
                icon: <MessageSquare className="h-8 w-8" />,
                title: "Community Forum",
                desc: "Connect with peers, ask questions, and share insights in our moderated student community.",
                color: "bg-emerald-500"
              },
              {
                icon: <Users className="h-8 w-8" />,
                title: "Expert Mentorship",
                desc: "Get personalized guidance from experienced mentors who have walked the path you're on.",
                color: "bg-orange-500"
              }
            ].map((feature, i) => (
              <div
                key={i}
                className="group p-8 bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300"
              >
                <div className={`h-14 w-14 rounded-2xl ${feature.color} text-white flex items-center justify-center mb-6 shadow-lg shadow-black/10`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3 text-slate-900 group-hover:text-primary transition-colors">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed font-medium">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Quote */}
      <section className="py-24 bg-primary text-white text-center relative overflow-hidden">
        <div className="container relative z-10">
          <div className="max-w-4xl mx-auto space-y-8">
            <p className="text-2xl md:text-4xl font-medium italic leading-relaxed">
              "StudentPortal has been a game-changer for me. I found my university through their database and secured a scholarship that made my dreams possible."
            </p>
            <div className="flex flex-col items-center">
              <div className="h-16 w-16 bg-white/20 rounded-full flex items-center justify-center mb-4 text-2xl font-black">A</div>
              <p className="font-bold text-xl uppercase tracking-widest">Ahmed Raza</p>
              <p className="text-primary-foreground/80 font-medium">NUST Student, 2024</p>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 p-10 opacity-10">
          <GraduationCap className="h-96 w-96 transform rotate-12" />
        </div>
      </section>

      {/* Call to Action Footer */}
      <section className="py-24 bg-white text-center">
        <div className="container">
          <h2 className="text-4xl md:text-6xl font-black text-slate-900 mb-8">Ready to Start Your Journey?</h2>
          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto font-medium">
            Join our community of over 10,000 students and get access to the best academic resources.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link
              href="/signup"
              className="px-12 py-5 bg-primary text-white text-xl font-black rounded-full shadow-2xl hover:shadow-primary/30 active:scale-95 transition-all"
            >
              Sign Up for Free
            </Link>
            <Link
              href="/scholarships"
              className="px-12 py-5 border-2 border-slate-200 text-slate-900 text-xl font-bold rounded-full hover:bg-slate-50 transition-all"
            >
              Explore Scholarships
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
