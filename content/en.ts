import type { Dictionary } from "./types";

export const en: Dictionary = {
  meta: {
    title: "Setuk: the ERP for responsible politicians",
    description:
      "Political office software and a team that sets it up with you. Appointments, letters, programs, elections and citizens for MPs, MLAs, local body representatives, party teams and aspirants."
  },
  brand: { name: "Setuk", line: "ERP for responsible politicians" },
  skip: "Skip to content",
  chapters: ["Welcome", "Who we serve", "The problem", "With Setuk", "Products", "Discuss", "Design", "Train", "Run"],
  nav: {
    labels: { home: "Home", how: "How we work", engagements: "Engagements", about: "About", articles: "Articles", faqs: "FAQs", contact: "Contact" },
    demo: "Request demo",
    menu: "Menu",
    close: "Close menu",
    language: "Language",
    chapters: "Chapters",
    toDark: "Switch to dark theme",
    toLight: "Switch to light theme"
  },
  hero: {
    eyebrow: "For MPs, MLAs, local body representatives, party teams and aspirants",
    titleA: "The ERP for",
    titleB: "responsible politicians.",
    sub: "Software and a team that sets it up with you. Appointments, letters, programs, elections and citizens, run on proven SOPs.",
    primary: "Request demo",
    secondary: "See how we work"
  },
  proof: {
    label: "Handled on Setuk so far",
    note: "Illustrative figures for the prototype",
    items: ["Letters tracked", "Appointments managed", "Citizens on record", "PNR requests handled"]
  },
  serve: {
    eyebrow: "Who we serve",
    title: "Built for every level of Indian politics.",
    body: "Every seat in this House stands for an office that serves people. So does every assembly seat, every ward and every party office working toward the next election.",
    reps: "Representatives",
    pols: "Politicians",
    tiers: [
      { t: "MPs", d: "Lok Sabha and Rajya Sabha", n: "543 + 245" },
      { t: "MLAs and MLCs", d: "State legislatures", n: "4,123 MLAs" },
      { t: "Local bodies", d: "Panchayats, municipalities, corporations", n: "30 lakh+" },
      { t: "Party teams and karyakartas", d: "Office-bearers and field workers", n: "" },
      { t: "Aspiring politicians", d: "Start right, before the ticket", n: "" }
    ]
  },
  problem: {
    eyebrow: "The problem",
    title: "The problem isn't the effort. It's the broken system.",
    body: "Letters, appointments, citizen requests and constituency work still run on paper, offline habits and tools that don't talk to each other.",
    items: [
      { t: "Paper registers", d: "Letters and notes you can't search or hand over to anyone." },
      { t: "Excel sheets", d: "Only the person who made them understands them. When they leave, the data is useless." },
      { t: "One WhatsApp group", d: "Important messages get buried, and nobody is accountable." },
      { t: "Knowledge in people's heads", d: "Years of political craft, with no shared system to pass it on." }
    ]
  },
  solution: {
    eyebrow: "सेतुक, a bridge where there was none",
    title: "One system between your office and the people you serve.",
    body: "Setuk comes from the Sanskrit Setu: a path that enables movement, built with people, structure and real-time flow.",
    items: [
      { t: "Clear clicks", d: "Every routine action is one clear step. Less hunting, fewer mistakes." },
      { t: "One source of truth", d: "Online by default, from the office or the field." },
      { t: "Built for many hands", d: "Permissions, handovers and parallel work, without chaos." },
      { t: "Citizens stay informed", d: "SMS and WhatsApp updates at every step of their request." },
      { t: "SOPs built in", d: "Every feature ships with SOPs from years of real political work." }
    ]
  },
  products: {
    eyebrow: "Products",
    title: "Two products. One record of your work.",
    soon: "Coming",
    items: [
      {
        t: "Political Office Management Software",
        d: "Everything your office handles, in one place.",
        mods: [
          { t: "Appointments" }, { t: "Program calendar" }, { t: "eLetter" }, { t: "PNR letters" },
          { t: "Citizen management" }, { t: "Citizen dashboard" }, { t: "Visitor management", soon: true }
        ]
      },
      {
        t: "Election Management Software",
        d: "Win from the booth up.",
        mods: [
          { t: "Booth management" }, { t: "Voter list Excel" }, { t: "Karyakarta management", soon: true },
          { t: "Influential voters", soon: true }, { t: "Citizen surveys", soon: true }
        ]
      }
    ]
  },
  how: {
    eyebrow: "How we work",
    title: "We set it up with you, then we stay.",
    get: "You get",
    steps: [
      {
        t: "Discuss and observe",
        time: "1 to 2 meetings",
        d: "We sit down with you and your team and look at how requests move today. Where letters go, who follows up, what falls through.",
        get: "A clear picture of what's slowing the office down."
      },
      {
        t: "Design and set up",
        time: "1 week",
        d: "We write down how your office should run: who handles what, who can see which data. Then we configure Setuk to match and bring your existing records in.",
        get: "A system built around your office, not a generic one."
      },
      {
        t: "Onboard and train",
        time: "1 week",
        d: "We train your staff in your office, role by role, so everyone knows what their part is before it goes live.",
        get: "A team that's ready on day one."
      },
      {
        t: "Run",
        time: "Ongoing",
        d: "We stay on. Each month you get a report on what was handled and what's pending. Each quarter we review what's working and fix what isn't.",
        get: "An office that keeps improving and a record that keeps growing."
      }
    ]
  },
  engage: {
    eyebrow: "Engagements",
    title: "Pick the engagement that fits your office.",
    body: "Every engagement includes setup, training and a monthly report. Monthly or annual plans, priced by offices, staff and modules.",
    forLabel: "For",
    pick: "Recommended for sitting representatives",
    cta: "Ask for a quote",
    price: "Pricing on request",
    trial: "Trial available on request",
    draft: "Draft packages for the prototype",
    pkgs: [
      {
        t: "Office",
        for: "Local body representatives, aspirants and single-office MLAs",
        inc: ["Political office management software", "Discuss and observe", "Setup and record import", "Staff training, role by role", "Monthly report"]
      },
      {
        t: "Office + Election",
        for: "Sitting MLAs and MPs heading into an election",
        inc: ["Everything in Office", "Election management software", "Booth management and voter list", "Karyakarta coordination", "Quarterly review"]
      },
      {
        t: "Multi-office and Party",
        for: "MPs with several offices, ministers and party teams",
        inc: ["Everything in Office + Election", "Multiple office locations", "Party view across offices", "Custom SOPs", "A named success manager"]
      }
    ]
  },
  trust: {
    eyebrow: "Data and trust",
    title: "Citizen data is sensitive. We treat it that way.",
    body: "Your office's records belong to your office. Here is what we commit to in writing.",
    items: [
      { t: "Stored in India", d: "Data is primarily stored in India on established cloud providers." },
      { t: "Role-based access", d: "Each staff member sees only what their role allows." },
      { t: "Never sold", d: "We don't sell your data to anyone." },
      { t: "72-hour breach notice", d: "If a breach affects your data, we tell you within 72 hours." },
      { t: "Export any time", d: "Your records can be exported. You are never locked in." },
      { t: "Clear retention", d: "After cancellation, data is kept up to 60 days, then deleted or anonymised." }
    ],
    legal: "Read the policies",
    dpa: "Data Processing Agreement for organisations, governed by Indian law."
  },
  faq: {
    eyebrow: "FAQs",
    title: "Questions offices ask us.",
    more: "Still have a question?",
    items: [
      { q: "Who is Setuk for?", a: "MPs, MLAs and MLCs, local body representatives, ministers and mayors, party teams, karyakartas and aspiring politicians. Any office that deals with citizens every day." },
      { q: "How long does it take to get started?", a: "Usually 2 to 3 weeks: 1 to 2 meetings to understand your office, a week to design and set up, and a week to train your staff." },
      { q: "Can we bring in our paper records and Excel sheets?", a: "Yes. Existing registers and spreadsheets are imported during setup, so you keep your history." },
      { q: "Can several offices and staff use one account?", a: "Yes. Constituency, residence, camp and capital offices work from one system, with role-based access for every staff member." },
      { q: "Does it work on mobile?", a: "Yes. Setuk is cloud-based, so your team and the representative can use it from the office or the field." },
      { q: "Where is our data stored, and who can see it?", a: "Primarily in India. Only people you authorise can see it, based on their role. We don't sell your data." },
      { q: "What happens to requests that come on WhatsApp?", a: "Staff log them into Setuk, so they are tracked like every other request." },
      { q: "Can we export our data if we stop?", a: "Yes. Your data can be exported, and it is kept for up to 60 days after cancellation." },
      { q: "How is this different from a CRM?", a: "A CRM is built for sales. Setuk is built around a political office: citizen requests, official letters, PNR, appointments, programs, booths and karyakartas, with SOPs included." },
      { q: "What does it cost?", a: "Monthly or annual plans, priced by the number of offices, staff and modules. Request a demo for a quote." }
    ]
  },
  cta: {
    title: "Bring your office online, without losing ground control.",
    body: "Your office gets organised, every record counts at election time, and citizens get updates. Start right, whether you are elected or aspiring.",
    primary: "Request demo",
    secondary: "Chat on WhatsApp"
  },
  footer: {
    company: "Company",
    guides: "Guides",
    legal: "Legal",
    address: "H.No. 413, Nehru Nagar, Patliputra, Phulwari, Patna 800013, Bihar",
    rights: "Setuk Private Limited. All rights reserved.",
    model: "3D chamber is an illustrative model, not to scale.",
    credits: [{ t: "Consultant: “Buisness man” by art.piskov, CC BY 4.0", href: "https://sketchfab.com/3d-models/buisness-man-with-talking-animation-3fe2b15e0c884b66b987f6f48e420f56" }],
    voterList: "Voter List Excel",
    guideItems: [
      { t: "Constituency office tracking", slug: "constituency-office-tracking-system" },
      { t: "Party management system", slug: "enterprise-political-party-management-system" },
      { t: "Office operating system", slug: "indian-political-office-operating-system" },
      { t: "MLA office digitisation", slug: "mla-office-digitisation-tools" },
      { t: "Appointment scheduling", slug: "the-complete-guide-to-political-appointment-scheduling-software-in-india" },
      { t: "Office management guide", slug: "the-complete-guide-to-political-office-management-software-in-india" },
      { t: "Modernizing Indian governance", slug: "modernizing-indian-governance" },
      { t: "Political office management software", slug: "political-office-management-software" }
    ],
    legalItems: [
      { t: "Privacy policy", slug: "privacy" },
      { t: "Terms and conditions", slug: "terms" },
      { t: "Consent for data usage", slug: "consent" },
      { t: "Data retention", slug: "data-retention" },
      { t: "Data processing agreement", slug: "dpa" },
      { t: "Refund and cancellation", slug: "refund" },
      { t: "Disclaimer", slug: "disclaimer" }
    ]
  },
  pages: {
    common: {
      home: "Home",
      minRead: "{n} min read",
      onThisPage: "On this page",
      englishOnly: "",
      related: "Keep reading",
      read: "Read the guide",
      allArticles: "All articles",
      demoTitle: "See Setuk run on your own office's work.",
      demoBody: "We'll walk you through it with your letters, appointments and requests, then show you how setup would go."
    },
    how: {
      meta: {
        title: "How we work | Setuk",
        description: "We set up Setuk with your office in two to three weeks: we observe, design the system, train your staff, then stay on with monthly reports."
      },
      title: "We set it up with you, then we stay.",
      sub: "Software alone doesn't change an office. We study how yours runs, configure Setuk around it and train your staff.",
      primary: "Request demo",
      secondary: "See the modules",
      heroAlt: "A constituency office team working in Setuk on laptops, with the week's numbers on the wall screen",
      process: {
        title: "From the first meeting to a running office in two to three weeks.",
        sub: "The same four steps for a ward office or an MP's three offices. Only the size of the work changes.",
        doLabel: "What we do",
        needLabel: "What we need from you",
        steps: [
          {
            does: ["Sit in on a normal office day", "Map how letters, appointments and requests move", "Note who follows up on what, and where work stalls"],
            needs: "An hour with the representative, and time with the staff who handle requests."
          },
          {
            does: ["Write the office's SOPs: who handles what, and who sees which data", "Set up roles, permissions and the modules you need", "Import your registers and Excel sheets"],
            needs: "Your existing records, and a staff list with each person's role."
          },
          {
            does: ["Train each role on its own part of the work", "Run real requests through Setuk with your team", "Hand over the SOPs as a written reference"],
            needs: "Two to three hours with each staff member, in your office."
          },
          {
            does: ["Send a monthly report on what was handled and what is pending", "Review each quarter what works and what doesn't", "Adjust the SOPs and settings as the office changes"],
            needs: "One person in your office who owns the system day to day."
          }
        ]
      },
      modules: {
        title: "What we set up in your office.",
        sub: "Six modules are live today. Each one ships with an SOP for how your office should use it.",
        items: [
          { t: "Appointments", h: "No more missed meetings.", d: "Requests, slots and visitors tracked end to end, so the right people get the right time.", img: "appointments", alt: "A citizen greeted at a constituency office reception desk" },
          { t: "Program calendar", h: "Every commitment in one calendar.", d: "Inaugurations, public meetings, party events and visits, shared with the whole team.", img: "calendar", alt: "A staff member briefing the representative on the day's schedule from a tablet" },
          { t: "eLetter", h: "Letters that don't get lost.", d: "Every letter in or out is logged and tracked until the right action is taken.", img: "eletter", alt: "An office assistant reviewing the eLetter list in Setuk" },
          { t: "PNR letters", h: "Railway requests, kept apart.", d: "A dedicated queue for PNR letters, so urgent travel requests never sit in the general pile.", img: "pnr", alt: "A citizen handing over a railway ticket request at a help desk" },
          { t: "Booth management", h: "Win from the booth up.", d: "Map, staff and track every booth in your constituency, ready for polling day.", img: "booths", alt: "Booth workers checking voter details on phones outside a polling station" },
          { t: "Citizen management", h: "Know the people you serve.", d: "Who they are, what they asked for and what was done, searchable in seconds.", img: "citizens", alt: "A representative meeting citizens at a public gathering" }
        ]
      },
      screen: {
        title: "This is the screen your staff will open every morning.",
        body: "eLetter files every letter by where it stands, from follow-up to dispatch, with the department and the person handling it.",
        alt: "The eLetter screen in Setuk: letters grouped by follow-up, inbox, ongoing, issued and dispatched, with file number, date, department and status"
      },
      citizens: {
        title: "Citizens can follow their own requests.",
        body: "Most political software only looks inward. In Setuk, citizens get their own login, and every update on their request reaches them without a phone call.",
        points: ["Book and track appointments", "Letter and PNR status updates", "SMS and WhatsApp alerts at every step"],
        alt: "A citizen checking an appointment and a letter update on their phone"
      },
      roadmap: {
        title: "What we're building next.",
        sub: "We ship each module when it's ready. The order follows what offices ask for most.",
        nowLabel: "In progress",
        nextLabel: "Planned",
        now: [
          { t: "Visitor management", d: "Everyone who came to the office, even if they didn't get a meeting." },
          { t: "WhatsApp and SMS sender", d: "Reach citizens and workers directly, in bulk or one by one." },
          { t: "Event management", d: "Plan and run political events and public programs." },
          { t: "Karyakarta management", d: "Assignments, communication and tracking for ground workers." }
        ],
        next: [
          { t: "LADs management", d: "Local area development funds: allocation, tracking and reports." },
          { t: "Digital call center", d: "Run the office call center remotely, with memos and support." },
          { t: "Image and video management", d: "Fast uploads from the field, even on a weak network." },
          { t: "Social media management", d: "Profiles, inbox and comment moderation in one place." },
          { t: "Influential voters", d: "Identify and engage the people who move opinion locally." },
          { t: "Election management", d: "Planning from strategy to polling day." },
          { t: "Citizen surveys", d: "Ask constituents what they think, then act on it." },
          { t: "Resume maker for ticket applications", d: "Help aspirants present their work when applying for a ticket." },
          { t: "Party and office management", d: "Tools for the wider party office, beyond one representative." },
          { t: "Constituency analytics", d: "Dashboards and reports on the constituency." },
          { t: "Grievance management", d: "A structured way to receive, track and resolve grievances." },
          { t: "Constituency mapping", d: "Wards, booths and key areas on a map that stays current." }
        ]
      }
    },
    engagements: {
      meta: {
        title: "Engagements and pricing | Setuk",
        description: "Three engagements, from a single ward office to a party with many offices. Each includes setup, staff training and a monthly report."
      },
      title: "Pick the engagement that fits your office.",
      sub: "Every engagement includes setup, staff training and a monthly report. Plans are monthly or annual.",
      art: [
        { img: "localBody", alt: "Villagers meeting under a banyan tree, a local body in session" },
        { img: "vidhanSabha", alt: "A state legislative assembly building" },
        { img: "lokSabha", alt: "The Lok Sabha chamber seen from the gallery" }
      ],
      compare: {
        title: "Compare what's included.",
        feature: "Included",
        included: "Included",
        notIncluded: "Not included",
        rows: [
          { t: "Political office management software", from: 0 },
          { t: "Discuss and observe", from: 0 },
          { t: "Setup and record import", from: 0 },
          { t: "Staff training, role by role", from: 0 },
          { t: "Monthly report", from: 0 },
          { t: "Election management software", from: 1 },
          { t: "Booth management and voter list", from: 1 },
          { t: "Karyakarta coordination", from: 1 },
          { t: "Quarterly review", from: 1 },
          { t: "Multiple office locations", from: 2 },
          { t: "Party view across offices", from: 2 },
          { t: "Custom SOPs", from: 2 },
          { t: "A named success manager", from: 2 }
        ]
      },
      pricing: {
        title: "How pricing works.",
        body: "We quote after the first conversation, once we know how many offices, staff and modules you need.",
        items: [
          { t: "Monthly or annual", d: "Pay by the month, or by the year." },
          { t: "Priced by what you use", d: "The number of offices, staff and modules sets the price." },
          { t: "Trial on request", d: "Ask for a trial when you request a demo." },
          { t: "A reply within two business days", d: "For quotes and most other enquiries." }
        ]
      },
      faqTitle: "Questions about engagements",
      faqs: [
        { q: "How long does it take to get started?", a: "Usually 2 to 3 weeks: 1 to 2 meetings to understand your office, a week to design and set up, and a week to train your staff." },
        { q: "Is there a trial?", a: "Yes, a trial is available on request. Ask for one when you request a demo." },
        { q: "Can we export our data if we stop?", a: "Yes. Your data can be exported, and it is kept for up to 60 days after cancellation." }
      ],
      allFaqs: "See all FAQs"
    },
    about: {
      meta: {
        title: "About Setuk",
        description: "Setuk was built by people who spent years inside Indian election campaigns, war rooms and constituency offices, and kept watching good offices lose track of citizens."
      },
      title: "Built from years inside campaigns, war rooms and constituency offices.",
      sub: "We kept watching good offices lose track of citizens' requests. Setuk is the system we wished they had.",
      heroAlt: "A campaign war room at night: a team at laptops in front of maps and whiteboards",
      origin: {
        title: "Where it started",
        paras: [
          "I've worked with many representatives, aspiring politicians and people who genuinely wanted change.",
          "Between election campaigns, war room meetings and constituency work, I helped people win. Then I helped them govern.",
          "Every time, I used whatever I could: Excel, Word, email labels, WhatsApp groups. At one point, even Slack.",
          "Each time, I felt the gap. The data was there, but it was scattered and impossible to trace. The outcome was never what it should have been. Not because of a lack of effort, but because the tools were never meant for this work.",
          "That's where Setuk was born. Not in a meeting or on a whiteboard, but slowly, one frustration at a time."
        ]
      },
      moment: {
        quote: "The citizen came asking. The staff started searching. Nothing was found. I've seen that happen too many times.",
        by: "Founder, Setuk",
        paras: [
          "People come to their representative's office with requests. Sometimes politely, sometimes urgently, sometimes after months of waiting.",
          "When they ask for an update, the staff search through WhatsApp, old emails, physical files and memory. Nothing surfaces cleanly. The citizen leaves frustrated, the staff feel helpless, and the representative looks unreliable. Not because they don't care, but because the system failed them.",
          "This is the problem Setuk solves, with clarity rather than complexity."
        ],
        alt: "The same office before and after: desks buried in files, then one clean desk with a laptop"
      },
      beliefs: {
        title: "What we believe",
        items: [
          "Effort isn't the problem. The system is.",
          "Every citizen request deserves to be found.",
          "Political knowledge shouldn't live only in people's heads.",
          "A modern office is the first sign of a serious representative.",
          "India's democracy deserves better infrastructure.",
          "The gap we kept feeling became the product."
        ]
      },
      name: {
        title: "Why सेतुक",
        paras: [
          "Setuk comes from the Sanskrit setu, a bridge: a path that lets people and work move across.",
          "Between a representative and the people they serve, that path is the office. We build the system that keeps it open."
        ],
        alt: "A representative addressing villagers under a banyan tree, with updates arriving on a phone"
      },
      letter: {
        title: "A note from the founder",
        paras: [
          "I didn't set out to build a company. I set out to stop feeling the gap I felt in every campaign and every office, each time I watched good people lose because their systems failed them.",
          "Setuk is for every representative who knows they're capable of more, and for every aspiring politician who wants to start right.",
          "The chaos is manageable. I've seen it and lived it. Now we've built the answer."
        ],
        by: "Founder, Setuk"
      },
      company: [
        { t: "Company", d: "Setuk Private Limited" },
        { t: "Office", d: "Patna, Bihar" },
        { t: "Contact", d: "contact@setuk.org" }
      ]
    },
    articles: {
      meta: {
        title: "Articles: guides for political offices | Setuk",
        description: "Practical guides on running a political office in India: letters, appointments, constituency tracking, party management and digitisation."
      },
      title: "Guides for running a political office.",
      sub: "Practical writing on letters, appointments, constituency work and party management, from the team behind Setuk.",
      all: "All topics",
      topics: { office: "Office management", constituency: "Constituency work", party: "Party and elections", appointments: "Appointments", governance: "Governance" },
      filterLabel: "Filter articles by topic",
      empty: "No articles on this topic yet.",
      count: "{n} articles"
    },
    contact: {
      meta: {
        title: "Contact Setuk",
        description: "Talk to the Setuk team about demos, pricing, support and partnerships, by email, phone, WhatsApp or the contact form."
      },
      title: "Talk to the Setuk team.",
      sub: "Demos, pricing and product questions. Send us a note and we'll route it to the right person.",
      channels: {
        email: "Email",
        phone: "Phone",
        whatsapp: "WhatsApp",
        office: "Office",
        emailNote: "Demos, pricing and support",
        phoneNote: "The Patna office",
        whatsappNote: "Quick questions"
      },
      form: {
        title: "Send us a message",
        name: "Full name",
        email: "Work email",
        org: "Office or organisation",
        optional: "optional",
        topic: "Topic",
        topics: ["Product demo and pricing", "Technical support", "Partnership and integrations", "Press and media", "Other"],
        message: "How can we help?",
        messageHint: "Tell us about your office: how many staff, which offices, what you'd like to fix first.",
        consent: "Setuk may contact me about this request.",
        privacy: "Privacy policy",
        submit: "Send message",
        submitNote: "Opens your email app with the message ready to send.",
        errors: {
          name: "Enter your name.",
          email: "Enter a valid email address, like name@office.in.",
          message: "Tell us a little about what you need.",
          consent: "Tick this so we can reply to you."
        },
        sentTitle: "Your message is ready in your email app.",
        sentBody: "Press send there and we'll reply within two business days. If no app opened, write to us at contact@setuk.org.",
        again: "Write another message"
      },
      expect: {
        title: "What to expect",
        items: [
          "We reply within two business days to most enquiries.",
          "Existing customers: include your office's name, so we can route it faster.",
          "Don't send passwords or sensitive citizen data through this form. For security disclosures, email us with a subject starting with [Security]."
        ]
      },
      alt: "A desk with a laptop showing the Setuk dashboard, a phone, files and a notebook"
    },
    legal: {
      meta: {
        title: "Legal and policies | Setuk",
        description: "The terms, privacy policy, consent, data retention, data processing agreement and other policies that govern Setuk."
      },
      title: "Legal and policies.",
      sub: "The documents that govern how Setuk works and how we handle data. Questions about any of them go to contact@setuk.org.",
      groups: { use: "Using Setuk", data: "Your data", billing: "Billing", voterList: "Voter list Excel" },
      docs: {
        terms: { t: "Terms and conditions", d: "The rules for using the Setuk platform." },
        privacy: { t: "Privacy policy", d: "How we collect, use and protect your information." },
        consent: { t: "Consent for data usage", d: "Your consent for how we process your data." },
        "declaration-accuracy": { t: "Declaration of accuracy", d: "Your responsibility for accurate submissions." },
        disclaimer: { t: "Disclaimer and liability", d: "Disclaimers and limits on liability." },
        "data-retention": { t: "Data retention and deletion", d: "How long we keep data, and how deletion works." },
        dpa: { t: "Data processing agreement", d: "Processor terms for organisations." },
        refund: { t: "Refund and cancellation", d: "Subscriptions, refunds and cancellations." },
        "voter-list-excel-disclaimer": { t: "Voter list Excel disclaimer", d: "The terms for voter list Excel files." }
      },
      all: "All policies",
      questions: "Questions about this policy? Write to contact@setuk.org."
    },
    faqs: {
      meta: {
        title: "Frequently asked questions | Setuk",
        description: "Answers about getting started with Setuk, the product, how citizen data is stored and protected, and pricing."
      },
      title: "Questions offices ask us.",
      sub: "About getting started, the product, your data and pricing. If yours isn't here, ask us directly.",
      search: "Search the questions",
      clear: "Clear the search",
      results: "{n} matching",
      noResults: "No question matches that. Try another word, or ask us directly.",
      groups: [
        {
          t: "Getting started",
          items: [
            { q: "Who is Setuk for?", a: "MPs, MLAs and MLCs, local body representatives, ministers and mayors, party teams, karyakartas and aspiring politicians. Any office that deals with citizens every day." },
            { q: "How long does it take to get started?", a: "Usually 2 to 3 weeks: 1 to 2 meetings to understand your office, a week to design and set up, and a week to train your staff." },
            { q: "Can we bring in our paper records and Excel sheets?", a: "Yes. Existing registers and spreadsheets are imported during setup, so you keep your history." },
            { q: "Do you train our staff?", a: "Yes. We train each role in your office before go-live, and hand over the SOPs as a written reference." }
          ]
        },
        {
          t: "The product",
          items: [
            { q: "What's live today, and what's coming?", a: "Appointments, the program calendar, eLetter, PNR letters, booth management and citizen management are live. Visitor management, WhatsApp and SMS sending, event management and karyakarta management are being built now." },
            { q: "Can several offices and staff use one account?", a: "Yes. Constituency, residence, camp and capital offices work from one system, with role-based access for every staff member." },
            { q: "Does it work on mobile?", a: "Yes. Setuk is cloud-based, so your team and the representative can use it from the office or the field." },
            { q: "Do citizens get access too?", a: "Yes. Citizens get their own login to book appointments and check the status of their letters and PNR requests, with SMS and WhatsApp alerts when something changes." },
            { q: "What happens to requests that come on WhatsApp?", a: "Staff log them into Setuk, so they are tracked like every other request." },
            { q: "How is this different from a CRM?", a: "A CRM is built for sales. Setuk is built around a political office: citizen requests, official letters, PNR, appointments, programs, booths and karyakartas, with SOPs included." }
          ]
        },
        {
          t: "Your data",
          items: [
            { q: "Where is our data stored, and who can see it?", a: "Primarily in India. Only people you authorise can see it, based on their role. We don't sell your data." },
            { q: "Who owns our office's records?", a: "Your office does. We don't sell your data, and you can export it at any time." },
            { q: "What happens if there is a data breach?", a: "If a breach affects your data, we tell you within 72 hours." },
            { q: "Can we export our data if we stop?", a: "Yes. Your data can be exported, and it is kept for up to 60 days after cancellation, then deleted or anonymised." },
            { q: "How do we report a security issue?", a: "Email contact@setuk.org with a subject line starting with [Security]. Please don't include passwords or citizen data." }
          ]
        },
        {
          t: "Pricing",
          items: [
            { q: "What does it cost?", a: "Monthly or annual plans, priced by the number of offices, staff and modules. Request a demo for a quote." },
            { q: "Is there a trial?", a: "Yes, a trial is available on request. Ask for one when you request a demo." }
          ]
        }
      ],
      still: "Still have a question?",
      stillBody: "Write to us or call. We reply within two business days."
    }
  },
  scene: {
    loading: "Preparing the chamber",
    sample: "Sample data",
    dashboard: {
      title: "Constituency at a glance",
      booths: "Booths covered",
      letters: "Letters resolved",
      appts: "Appointments this week",
      byType: "Requests by type",
      types: ["Water", "Roads", "Railway PNR", "Health", "Education"]
    },
    chaos: {
      title: "Office inbox",
      sub: "No system",
      pending: "Pending",
      owner: "Owner",
      unknown: "Unknown",
      rows: ["Water pipeline complaint", "Road repair letter", "PNR confirmation, Tatkal", "Scholarship recommendation", "Ration card correction", "Hospital referral"],
      status: ["Who is handling?", "Not found", "Follow-up missed", "Searching…", "Lost in WhatsApp", "No reply"]
    },
    report: {
      title: "Monthly report",
      handled: "Handled",
      pending: "Pending",
      week: "Week",
      quarter: "Quarterly review",
      quarters: ["Q1", "Q2", "Q3", "Q4"]
    },
    desk: {
      office: "Office",
      election: "Election",
      appts: "Appointments",
      letters: "Letters",
      pnr: "PNR",
      next: "Up next",
      booths: "Booths covered",
      agents: "Polling agents",
      workers: "Karyakartas",
      booth: "Booth",
      assigned: "Agent and reliever assigned",
      pendingR: "Reliever pending",
      queue: ["Water pipeline complaint", "PNR confirmation, Tatkal", "Road repair letter", "Scholarship recommendation", "Ration card correction"]
    },
    bands: ["MPs", "MLAs and MLCs", "Local bodies"],
    fail: [
      { t: "Paper registers", why: "Can't search" },
      { t: "Excel sheets", why: "Not responding" },
      { t: "WhatsApp group", why: "999+ unread" },
      { t: "Memory", why: "Left with the staff" }
    ],
    fixed: { t: "Setuk", why: "One system" },
    excel: {
      file: "requests_final_v3 (2).xlsx",
      frozen: "Not responding",
      locked: "File locked for editing by another user",
      cols: ["Name", "Ward", "Request", "Status"],
      names: ["Ramesh K.", "Sunita D.", "Md. Arif", "Priya S.", "Gopal Y.", "Anita R.", "Vikas M.", "Kavita J."],
      ref: "#REF!"
    },
    wa: {
      group: "Constituency office",
      members: "248 participants",
      unread: "999+",
      msgs: ["Pipeline complaint, ward 14?", "Who has the PNR list?", "Forwarded: road letter", "Sir's program at 4", "Any update on scholarship?", "Please call back", "Photo", "Which register?"],
      missed: "Missed calls",
      calls: "23"
    },
    inbox: {
      title: "Requests",
      from: ["WhatsApp", "Register", "Excel"],
      owners: ["Asha (PA)", "Ravi (Office)", "Neha (Field)"],
      status: ["In progress", "Resolved", "Letter sent"],
      logged: "Request #1042 registered",
      sms: "SMS sent to citizen"
    },
    setup: {
      title: "Office setup",
      roles: "Roles",
      roleNames: ["Office in-charge", "PA", "Data operator", "Field coordinator"],
      access: "Who sees what",
      perms: ["Letters", "Citizens", "PNR", "Booths"],
      importing: "Importing records",
      sops: "SOPs",
      sopNames: ["Citizen letter", "PNR request", "Appointment"]
    },
    meet: {
      title: "Training: data operators",
      live: "Live",
      trainer: "Setuk trainer",
      roles: ["Office in-charge", "PA", "Data operator", "Field coordinator", "Data operator"],
      topic: "Logging a citizen letter",
      steps: ["Open request", "Add citizen", "Assign owner", "Send SMS"]
    },
    run: {
      title: "This month",
      tiles: ["Requests handled", "Letters resolved", "Citizens updated"],
      trend: "Handled per week",
      vs: "vs last month"
    }
  }
};
