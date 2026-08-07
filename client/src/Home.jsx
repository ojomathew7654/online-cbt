import { Link } from "react-router-dom";
import {
  FaArrowRight,
  FaBookOpen,
  FaCheckCircle,
  FaGraduationCap,
  FaLaptop,
  FaShieldAlt,
} from "react-icons/fa";

const Home = () => {
  return (
    <div className="min-h-screen overflow-hidden bg-bg text-white">
      {/* Hero */}
      <section className="relative min-h-screen">
        {/* Background image */}
        <img
          src="/img/stu3.jpg"
          alt="Students taking an examination"
          className="absolute inset-0 h-full w-full object-cover"
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-bg/90" />
        <div className="absolute inset-0 bg-gradient-to-r from-bg via-bg/90 to-bg/60" />

        {/* Navigation */}
        <header className="relative z-10 border-b border-white/10">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 lg:px-8">
            <Link to="/" className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-bg">
                <FaGraduationCap className="text-xl" />
              </div>

              <div>
                <h2 className="text-lg font-bold tracking-tight">
                  As Code Elevate
                </h2>
                <p className="text-xs text-light">CBT Examination System</p>
              </div>
            </Link>

            <Link
              to="/login"
              className="rounded-lg border border-primary/40 bg-primary/10 px-5 py-2.5 text-sm font-semibold text-primary transition hover:bg-primary hover:text-bg"
            >
              Login
            </Link>
          </div>
        </header>

        {/* Hero content */}
        <div className="relative z-10 mx-auto flex min-h-[calc(100vh-81px)] max-w-7xl items-center px-5 py-16 lg:px-8">
          <div className="grid w-full items-center gap-14 lg:grid-cols-2">
            {/* Left */}
            <div className="max-w-2xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm text-primary">
                <FaCheckCircle />
                Secure Online Examination Platform
              </div>

              <h1 className="text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
                Welcome to{" "}
                <span className="text-primary">As Code Elevate CBT</span>
              </h1>

              <p className="mt-6 max-w-xl text-base leading-7 text-light sm:text-lg">
                A modern computer-based testing platform designed to make
                examinations simple, secure, organized, and accessible.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/login"
                  className="group inline-flex items-center justify-center gap-3 rounded-xl bg-primary px-7 py-3.5 font-semibold text-bg transition hover:opacity-90"
                >
                  Login to Continue
                  <FaArrowRight className="transition-transform group-hover:translate-x-1" />
                </Link>

                <a
                  href="#features"
                  className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-7 py-3.5 font-semibold text-white transition hover:bg-white/10"
                >
                  Explore Platform
                </a>
              </div>

              <p className="mt-5 text-sm text-light">
                Students and authorized school users use the same login page.
              </p>
            </div>

            {/* Right feature card */}
            <div className="hidden lg:block">
              <div className="relative mx-auto max-w-md">
                <div className="absolute -inset-4 rounded-3xl bg-primary/10 blur-2xl" />

                <div className="relative rounded-3xl border border-white/10 bg-bg-deep/90 p-7 shadow-2xl backdrop-blur-md">
                  <div className="mb-7 flex items-center justify-between">
                    <div>
                      <p className="text-sm text-light">Examination Portal</p>
                      <h3 className="mt-1 text-xl font-semibold">
                        Ready to begin?
                      </h3>
                    </div>

                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <FaLaptop className="text-xl" />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <FeatureItem
                      icon={<FaBookOpen />}
                      title="Computer-Based Tests"
                      description="Take examinations online with ease."
                    />

                    <FeatureItem
                      icon={<FaShieldAlt />}
                      title="Secure Environment"
                      description="Controlled access for authorized users."
                    />

                    <FeatureItem
                      icon={<FaCheckCircle />}
                      title="Organized Results"
                      description="Examination results are recorded efficiently."
                    />
                  </div>

                  <Link
                    to="/login"
                    className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 font-semibold text-bg transition hover:opacity-90"
                  >
                    Access Examination Portal
                    <FaArrowRight />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-t border-white/10 bg-bg-deep">
        <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">
              Platform Features
            </p>

            <h2 className="mt-2 text-3xl font-bold">
              Everything needed for modern CBT examinations
            </h2>

            <p className="mt-4 text-light">
              A centralized platform for managing and taking computer-based
              examinations.
            </p>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            <FeatureCard
              icon={<FaLaptop />}
              title="Online Examination"
              description="Students can access their available examinations directly through the platform."
            />

            <FeatureCard
              icon={<FaShieldAlt />}
              title="Controlled Access"
              description="Different account roles can access only the areas relevant to their responsibilities."
            />

            <FeatureCard
              icon={<FaCheckCircle />}
              title="Results & History"
              description="Examination results and history can be managed through the system."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-bg px-5 py-6">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 text-sm text-light sm:flex-row">
          <p>© {new Date().getFullYear()} As Code Elevate CBT</p>

          <Link
            to="/login"
            className="font-medium text-primary hover:underline"
          >
            Login
          </Link>
        </div>
      </footer>
    </div>
  );
};

const FeatureItem = ({ icon, title, description }) => {
  return (
    <div className="flex gap-4 rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>

      <div>
        <h4 className="font-semibold text-white">{title}</h4>
        <p className="mt-1 text-sm text-light">{description}</p>
      </div>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }) => {
  return (
    <div className="rounded-2xl border border-white/10 bg-bg p-6 transition hover:-translate-y-1 hover:border-primary/30">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
        {icon}
      </div>

      <h3 className="mt-5 text-lg font-semibold">{title}</h3>

      <p className="mt-2 leading-6 text-light">{description}</p>
    </div>
  );
};

export default Home;
