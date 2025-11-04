
const FideliterLanding = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <MainContent />
      <Footer />
    </div>
  );
};

const Header = () => {
  return (
    <header className="sticky top-0 z-50 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Logo />
          <Navigation />
          <HeaderButtons />
        </div>
      </div>
    </header>
  );
};

const Logo = () => {
  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 text-primary">
        <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
          <path d="M13.8261 17.4264C16.7203 18.1174 20.2244 18.5217 24 18.5217C27.7756 18.5217 31.2797 18.1174 34.1739 17.4264C36.9144 16.7722 39.9967 15.2331 41.3563 14.1648L24.8486 40.6391C24.4571 41.267 23.5429 41.267 23.1514 40.6391L6.64374 14.1648C8.00331 15.2331 11.0856 16.7722 13.8261 17.4264Z" fill="currentColor"></path>
          <path clipRule="evenodd" d="M39.998 12.236C39.9944 12.2537 39.9875 12.2845 39.9748 12.3294C39.9436 12.4399 39.8949 12.5741 39.8346 12.7175C39.8168 12.7597 39.7989 12.8007 39.7813 12.8398C38.5103 13.7113 35.9788 14.9393 33.7095 15.4811C30.9875 16.131 27.6413 16.5217 24 16.5217C20.3587 16.5217 17.0125 16.131 14.2905 15.4811C12.0012 14.9346 9.44505 13.6897 8.18538 12.8168C8.17384 12.7925 8.16216 12.767 8.15052 12.7408C8.09919 12.6249 8.05721 12.5114 8.02977 12.411C8.00356 12.3152 8.00039 12.2667 8.00004 12.2612C8.00004 12.261 8 12.2607 8.00004 12.2612C8.00004 12.2359 8.0104 11.9233 8.68485 11.3686C9.34546 10.8254 10.4222 10.2469 11.9291 9.72276C14.9242 8.68098 19.1919 8 24 8C28.8081 8 33.0758 8.68098 36.0709 9.72276C37.5778 10.2469 38.6545 10.8254 39.3151 11.3686C39.9006 11.8501 39.9857 12.1489 39.998 12.236ZM4.95178 15.2312L21.4543 41.6973C22.6288 43.5809 25.3712 43.5809 26.5457 41.6973L43.0534 15.223C43.0709 15.1948 43.0878 15.1662 43.104 15.1371L41.3563 14.1648C43.104 15.1371 43.1038 15.1374 43.104 15.1371L43.1051 15.135L43.1065 15.1325L43.1101 15.1261L43.1199 15.1082C43.1276 15.094 43.1377 15.0754 43.1497 15.0527C43.1738 15.0075 43.2062 14.9455 43.244 14.8701C43.319 14.7208 43.4196 14.511 43.5217 14.2683C43.6901 13.8679 44 13.0689 44 12.2609C44 10.5573 43.003 9.22254 41.8558 8.2791C40.6947 7.32427 39.1354 6.55361 37.385 5.94477C33.8654 4.72057 29.133 4 24 4C18.867 4 14.1346 4.72057 10.615 5.94478C8.86463 6.55361 7.30529 7.32428 6.14419 8.27911C4.99695 9.22255 3.99999 10.5573 3.99999 12.2609C3.99999 13.1275 4.29264 13.9078 4.49321 14.3607C4.60375 14.6102 4.71348 14.8196 4.79687 14.9689C4.83898 15.0444 4.87547 15.1065 4.9035 15.1529C4.91754 15.1762 4.92954 15.1957 4.93916 15.2111L4.94662 15.223L4.95178 15.2312ZM35.9868 18.996L24 38.22L12.0131 18.996C12.4661 19.1391 12.9179 19.2658 13.3617 19.3718C16.4281 20.1039 20.0901 20.5217 24 20.5217C27.9099 20.5217 31.5719 20.1039 34.6383 19.3718C35.082 19.2658 35.5339 19.1391 35.9868 18.996Z" fill="currentColor" fillRule="evenodd"></path>
        </svg>
      </div>
      <h1 className="text-xl font-bold text-slate-900 dark:text-white">Fideliter</h1>
    </div>
  );
};

const Navigation = () => {
  return (
    <nav className="hidden md:flex items-center gap-8">
      <a className="text-sm font-medium hover:text-primary dark:hover:text-primary transition-colors" href="hhhhh">
        Product
      </a>
      <a className="text-sm font-medium hover:text-primary dark:hover:text-primary transition-colors" href="hhhh">
        Pricing
      </a>
      <a className="text-sm font-medium hover:text-primary dark:hover:text-primary transition-colors" href="hhhh">
        Resources
      </a>
    </nav>
  );
};

const HeaderButtons = () => {
  return (
    <div className="flex items-center gap-2">
      <button className="px-4 py-2 text-sm font-semibold rounded-lg bg-primary/20 dark:bg-primary/30 text-primary hover:bg-primary/30 dark:hover:bg-primary/40 transition-colors">
        Book a Demo
      </button>
      <button className="px-4 py-2 text-sm font-semibold rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors">
        Start Free Trial
      </button>
    </div>
  );
};

const MainContent = () => {
  return (
    <main className="flex-grow">
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <PricingSection />
      <TestimonialsSection />
      <CTASection />
    </main>
  );
};

const HeroSection = () => {
  return (
    <section className="py-20 md:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 text-center md:text-left">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter text-slate-900 dark:text-white">
              The Smart Loyalty Platform for Modern Retailers.
            </h1>
            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400">
              Fideliter empowers retailers to build lasting customer relationships through automated loyalty programs, multi-role management, and insightful analytics.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <button className="px-8 py-3 text-lg font-bold rounded-lg bg-primary text-white hover:bg-primary/90 transition-transform transform hover:scale-105">
                Start Free Trial
              </button>
              <button className="px-8 py-3 text-lg font-bold rounded-lg bg-primary/20 dark:bg-primary/30 text-primary hover:bg-primary/30 dark:hover:bg-primary/40 transition-transform transform hover:scale-105">
                Book a Demo
              </button>
            </div>
          </div>
          <div 
            className="w-full h-64 md:h-auto md:aspect-square bg-cover bg-center rounded-xl"
            style={{
              backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCiqn0qZoEPXCQRGtN0IPC_vcgJ_uTXcr-no31R-re9Yc1JSbXnnBh0ZNh4oCIQUXjl5sb80hR2ubar_5XE3P4Nh3GB2cavX0HLM6_ystO6zCyTu-WMEVkWnfyPsLT2hJEwcuTD9NuRBD85MbjQw1oNuq17gq-plq3xBI0er_2HbjU0-yTB5OkJSdzkyiwtTm_ienTbJVQ43yY6qjIV6bDN30tU7Xbt5VpqigX9lmyy7QU_CUk26OMmPMwhZQ7-yKY95oYBZX8829k")'
            }}
          ></div>
        </div>
      </div>
    </section>
  );
};

const FeaturesSection = () => {
  const features = [
    {
      icon: 'history',
      title: 'Automated Loyalty Points',
      description: 'Automatically award points based on purchase behavior, reducing manual effort.'
    },
    {
      icon: 'groups',
      title: 'Multi-Role System',
      description: 'Manage your program with distinct roles and permissions for your entire team.'
    },
    {
      icon: 'bar_chart',
      title: 'Smart Analytics',
      description: 'Gain valuable insights into customer behavior and program performance.'
    },
    {
      icon: 'emoji_events',
      title: 'Tombola Campaign Builder',
      description: 'Create exciting Tombola campaigns to drive customer interaction and engagement.'
    }
  ];

  return (
    <section className="py-20 bg-slate-100 dark:bg-slate-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">Key Features</h2>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
            Fideliter offers a comprehensive suite of tools designed to streamline your loyalty program and maximize customer engagement.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
};

const FeatureCard = ({ icon, title, description }) => {
  return (
    <div className="bg-background-light dark:bg-background-dark p-6 rounded-lg shadow-sm">
      <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 text-primary mb-4">
        <span className="material-symbols-outlined">
          {icon}
        </span>
      </div>
      <h3 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h3>
      <p className="mt-2 text-slate-600 dark:text-slate-400">{description}</p>
    </div>
  );
};

const HowItWorksSection = () => {
  const steps = [
    {
      icon: 'person_add',
      title: '1. Merchant Creates Account',
      description: 'Set up your Fideliter account and customize your loyalty program settings.'
    },
    {
      icon: 'group_add',
      title: '2. Vendors Register Clients',
      description: 'Vendors easily register clients into the loyalty program through the app.'
    },
    {
      icon: 'paid',
      title: '3. Clients Earn & Redeem',
      description: 'Clients earn points on purchases and redeem them for rewards.'
    },
    {
      icon: 'monitoring',
      title: '4. Admins Track Performance',
      description: 'Admins monitor activity and optimize campaigns for better results.'
    }
  ];

  return (
    <section className="py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">How It Works</h2>
        </div>
        <div className="relative">
          <div aria-hidden="true" className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-slate-200 dark:bg-slate-800"></div>
          <div className="relative grid grid-cols-1 md:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <Step key={index} {...step} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

const Step = ({ icon, title, description }) => {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary text-white z-10">
        <span className="material-symbols-outlined text-3xl">{icon}</span>
      </div>
      <h3 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">{title}</h3>
      <p className="mt-2 text-slate-600 dark:text-slate-400">{description}</p>
    </div>
  );
};

const PricingSection = () => {
  const plans = [
    {
      name: 'Free',
      description: 'For businesses just getting started.',
      price: '$0',
      period: '/month',
      buttonText: 'Get Started',
      buttonVariant: 'secondary',
      features: [
        'Basic loyalty points automation',
        'Limited reporting',
        'Up to 100 clients'
      ],
      featured: false
    },
    {
      name: 'Pro',
      description: 'For growing businesses.',
      price: '$99',
      period: '/month',
      buttonText: 'Choose Pro',
      buttonVariant: 'primary',
      features: [
        'Advanced automation rules',
        'Detailed analytics',
        'Tombola campaign builder',
        'Up to 1,000 clients'
      ],
      featured: true
    },
    {
      name: 'Enterprise',
      description: 'For large-scale operations.',
      price: 'Contact Us',
      period: '',
      buttonText: 'Contact Sales',
      buttonVariant: 'secondary',
      features: [
        'Customizable features',
        'Dedicated support',
        'Unlimited clients'
      ],
      featured: false
    }
  ];

  return (
    <section className="py-20 bg-slate-100 dark:bg-slate-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">Pricing Plans</h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <PricingCard key={index} {...plan} />
          ))}
        </div>
      </div>
    </section>
  );
};

const PricingCard = ({ name, description, price, period, buttonText, buttonVariant, features, featured }) => {
  const cardClass = featured 
    ? 'bg-primary text-white p-8 rounded-xl shadow-lg ring-4 ring-primary/50 flex flex-col'
    : 'bg-background-light dark:bg-background-dark p-8 rounded-xl shadow-lg flex flex-col';

  const priceClass = featured ? 'text-white' : 'text-slate-900 dark:text-white';
  const descriptionClass = featured ? 'text-primary/80' : 'text-slate-600 dark:text-slate-400';

  return (
    <div className={cardClass}>
      <h3 className={`text-2xl font-bold ${featured ? '' : 'text-slate-900 dark:text-white'}`}>{name}</h3>
      <p className={`mt-2 ${descriptionClass}`}>{description}</p>
      <div className="my-6">
        <span className={`text-5xl font-black ${priceClass}`}>{price}</span>
        {period && <span className={`text-lg font-semibold ${featured ? 'text-primary/80' : 'text-slate-500 dark:text-slate-400'}`}>{period}</span>}
      </div>
      <button className={`w-full px-6 py-3 font-semibold rounded-lg ${
        buttonVariant === 'primary' 
          ? 'bg-white text-primary hover:bg-slate-100' 
          : 'bg-primary/20 dark:bg-primary/30 text-primary hover:bg-primary/30 dark:hover:bg-primary/40'
      } transition-colors`}>
        {buttonText}
      </button>
      <ul className={`mt-6 space-y-3 flex-grow ${featured ? '' : 'text-slate-600 dark:text-slate-400'}`}>
        {features.map((feature, index) => (
          <li key={index} className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary">check</span>
            {feature}
          </li>
        ))}
      </ul>
    </div>
  );
};

const TestimonialsSection = () => {
  const testimonials = [
    {
      quote: '"Fideliter has revolutionized our customer loyalty program. The automated points system saves us time, and the analytics help us understand our customers better."',
      name: 'Sarah Miller',
      position: 'Owner of The Cozy Corner Cafe'
    },
    {
      quote: '"The multi-role system is fantastic. Our vendors can easily manage client registrations, and we have full control over the program."',
      name: 'David Lee',
      position: 'Manager at The Style Hub'
    },
    {
      quote: '"The Tombola campaign builder is a game-changer. We\'ve seen a significant increase in customer engagement and repeat purchases since implementing it."',
      name: 'Emily Chen',
      position: 'Marketing Director at The Gadget Store'
    }
  ];

  return (
    <section className="py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">Loved by Retailers Worldwide</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard key={index} {...testimonial} />
          ))}
        </div>
      </div>
    </section>
  );
};

const TestimonialCard = ({ quote, name, position }) => {
  return (
    <div className="bg-slate-100 dark:bg-slate-900 p-8 rounded-lg">
      <p className="text-slate-700 dark:text-slate-300">{quote}</p>
      <div className="mt-4">
        <p className="font-bold text-slate-900 dark:text-white">{name}</p>
        <p className="text-sm text-slate-500 dark:text-slate-400">{position}</p>
      </div>
    </div>
  );
};

const CTASection = () => {
  return (
    <section className="py-20 bg-primary/10 dark:bg-primary/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">Ready to Elevate Your Customer Loyalty?</h2>
        <p className="mt-4 text-lg max-w-2xl mx-auto text-slate-600 dark:text-slate-400">
          Join thousands of retailers who trust Fideliter to grow their business.
        </p>
        <div className="mt-8">
          <button className="px-8 py-3 text-lg font-bold rounded-lg bg-primary text-white hover:bg-primary/90 transition-transform transform hover:scale-105">
            Start Your Free Trial
          </button>
        </div>
      </div>
    </section>
  );
};

const Footer = () => {
  return (
    <footer className="bg-slate-100 dark:bg-slate-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <Logo />
            <p className="text-slate-600 dark:text-slate-400 mt-2 col-span-2 md:col-span-1">
              The smart loyalty platform for modern retailers.
            </p>
          </div>
        </div>
        <div className="mt-8 border-t border-slate-200 dark:border-slate-800 pt-8 flex flex-col md:flex-row items-center justify-between">
          <p className="text-sm text-slate-500 dark:text-slate-400">© 2024 Fideliter. All rights reserved.</p>
          <div className="flex items-center gap-6 mt-4 md:mt-0">
            <a className="text-sm text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-primary" href="hhhh">
              Terms
            </a>
            <a className="text-sm text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-primary" href="hhhh">
              Privacy
            </a>
            <a className="text-sm text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-primary" href="hhhh">
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FideliterLanding;