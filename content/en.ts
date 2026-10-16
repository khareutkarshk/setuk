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
    byRole: "By role",
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
      engage: {
        share: "Share this guide",
        shareOn: "Share on {name}",
        email: "Email",
        copy: "Copy link",
        copied: "Link copied",
        more: "Share",
        helpful: "Was this guide helpful?",
        yes: "Yes",
        no: "No",
        thanksYes: "Thank you. We're glad it helped.",
        thanksNo: "Thank you. We'll use this to improve the guide.",
        tellUs: "Tell us what was missing",
        newsletter: {
          kicker: "Newsletter",
          title: "New guides, straight to your inbox",
          body: "One short email when we publish a new guide for political offices and party teams.",
          label: "Email address",
          placeholder: "you@example.com",
          submit: "Subscribe",
          note: "Opens your email app to confirm.",
          error: "Enter a valid email address.",
          sentTitle: "One more step",
          sentBody: "Send the email that just opened in your mail app, and we'll add you to the list.",
          again: "Use a different address"
        }
      },
      prose: { note: "Note", tip: "Tip", warning: "Watch out", video: "Video", cite: "Source {n}", back: "Back to the text", external: "(opens in a new tab)" },
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
        kicker: "The process",
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
        kicker: "Modules",
        title: "What we set up in your office.",
        sub: "Twelve modules are live today, for the office and for the election, and four more are on the way. Each one ships with an SOP for how your office should use it.",
        soonLabel: "In progress",
        groups: [
          {
            t: "Office management",
            d: "The day-to-day work of the office: letters, meetings, visitors and the people you serve.",
            items: [
              { t: "Letter management", h: "Letters that don't get lost.", d: "Every letter in or out is logged and tracked until the right action is taken.", img: "eletter", alt: "An office assistant reviewing the eLetter list in Setuk" },
              { t: "Appointment management", h: "No more missed meetings.", d: "Requests, slots and visitors tracked end to end, so the right people get the right time.", img: "appointments", alt: "A citizen greeted at a constituency office reception desk" },
              { t: "Visitor logs", h: "Everyone who walked in.", d: "Every visitor recorded with the reason they came, even if they didn't get a meeting.", img: "placeholder", alt: "Placeholder for the visitor logs illustration" },
              { t: "Program calendar", h: "Every commitment in one calendar.", d: "Inaugurations, public meetings, party events and visits, shared with the whole team.", img: "calendar", alt: "A staff member briefing the representative on the day's schedule from a tablet" },
              { t: "PNR letters", h: "Railway requests, kept apart.", d: "A dedicated queue for PNR letters, so urgent travel requests never sit in the general pile.", img: "pnr", alt: "A citizen handing over a railway ticket request at a help desk" },
              { t: "Citizen management", h: "Know the people you serve.", d: "Who they are, what they asked for and what was done, searchable in seconds.", img: "citizens", alt: "A representative meeting citizens at a public gathering" },
              { t: "WhatsApp management", h: "Reach people where they read.", d: "Updates, greetings and notices to citizens and workers, in bulk or one by one.", img: "placeholder", alt: "Placeholder for the WhatsApp management illustration" },
              { t: "Reports", h: "The office at a glance.", d: "What came in, what was handled and what is pending, by staff, department and area.", img: "placeholder", alt: "Placeholder for the reports illustration" }
            ]
          },
          {
            t: "Election management",
            d: "The ground game, from the voter list to the booth.",
            items: [
              { t: "Booth management", h: "Win from the booth up.", d: "Map, staff and track every booth in your constituency, ready for polling day.", img: "booths", alt: "Booth workers checking voter details on phones outside a polling station" },
              { t: "Voter list reports", h: "Read the voter list properly.", d: "Break the roll down by booth, age, gender and area, and spot what has changed.", img: "placeholder", alt: "Placeholder for the voter list reports illustration" },
              { t: "Karyakarta management", h: "Every worker, accounted for.", d: "Assignments, communication and tracking for your ground workers, booth by booth.", img: "placeholder", alt: "Placeholder for the karyakarta management illustration" },
              { t: "Survey management", h: "Ask, then act.", d: "Run surveys in the field and see what your constituency thinks, area by area.", img: "placeholder", alt: "Placeholder for the survey management illustration" }
            ]
          },
          {
            t: "In progress",
            d: "Being built now, in the order offices ask for them.",
            soon: true,
            items: [
              { t: "Event management", h: "Events that run on time.", d: "Plan and run political events and public programs, from the guest list to the stage.", img: "placeholder", alt: "Placeholder for the event management illustration" },
              { t: "LADs management", h: "Every rupee of the fund, tracked.", d: "Local area development funds: allocation, works, tracking and reports.", img: "placeholder", alt: "Placeholder for the LADs management illustration" },
              { t: "Influential voters", h: "Know who moves opinion.", d: "Identify and engage the people whose word carries weight locally.", img: "placeholder", alt: "Placeholder for the influential voters illustration" },
              { t: "Image and video management", h: "Every photo from the field, found.", d: "Fast uploads from the field, even on a weak network, sorted by event and place.", img: "placeholder", alt: "Placeholder for the image and video management illustration" }
            ]
          }
        ]
      },
      screen: {
        kicker: "The product",
        title: "This is the screen your staff will open every morning.",
        body: "eLetter files every letter by where it stands, from follow-up to dispatch, with the department and the person handling it.",
        alt: "The eLetter screen in Setuk: letters grouped by follow-up, inbox, ongoing, issued and dispatched, with file number, date, department and status"
      },
      citizens: {
        kicker: "For citizens",
        title: "Citizens can follow their own requests.",
        body: "Most political software only looks inward. In Setuk, citizens get their own login, and every update on their request reaches them without a phone call.",
        points: ["Book and track appointments", "Letter and PNR status updates", "SMS and WhatsApp alerts at every step"],
        alt: "A citizen checking an appointment and a letter update on their phone"
      },
      roadmap: {
        kicker: "Roadmap",
        title: "What we're building next.",
        sub: "After the four in progress, this is what's planned. We ship each module when it's ready, in the order offices ask for most.",
        nextLabel: "Planned",
        next: [
          { t: "Digital call center", d: "Run the office call center remotely, with memos and support." },
          { t: "Social media management", d: "Profiles, inbox and comment moderation in one place." },
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
        kicker: "Compare",
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
        kicker: "Pricing",
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
      faqKicker: "Questions",
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
        kicker: "Our story",
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
        kicker: "Beliefs",
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
        kicker: "The name",
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
        kicker: "After you write",
        title: "What to expect",
        items: [
          "We reply within two business days to most enquiries.",
          "Existing customers: include your office's name, so we can route it faster.",
          "Don't send passwords or sensitive citizen data through this form. For security disclosures, email us with a subject starting with [Security]."
        ]
      },
      faq: {
        kicker: "Good to know",
        title: "Questions about getting in touch",
        lead: "What happens after you reach out, and what helps us help you faster.",
        items: [
          { q: "How quickly will you reply?", a: "Within two business days for most enquiries. For a quick question, WhatsApp is usually the fastest way to reach us." },
          { q: "What happens in a demo?", a: "We walk you through Setuk using the kind of work your office already does: letters, appointments and citizen requests. Then we show you how setup would go for your office." },
          { q: "What should I tell you before the demo?", a: "Roughly how many staff you have, how many offices you run (constituency, residence, camp or capital), and the one or two things you'd most like to fix first." },
          { q: "Can I get a price before the demo?", a: "Plans are monthly or annual, priced by the number of offices, staff and modules, so we'll give you a quote once we know your setup. Ask during the demo or mention it in your message." },
          { q: "Is there a free trial?", a: "Yes, a trial is available on request. Ask for one when you book the demo." },
          { q: "How long does it take to start once we decide?", a: "Usually two to three weeks: one or two meetings to understand your office, a week to design and set up, and a week to train your staff." },
          { q: "We're already a customer. How do we get support?", a: "Choose \"Technical support\" as the topic, or email or call us, and include your office's name so we can route it to the right person straight away." },
          { q: "How do we report a security issue?", a: "Email contact@setuk.org with a subject line starting with [Security]. Please don't include passwords or citizen data in any message." }
        ],
        all: "See all FAQs"
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
    },
    voterList: {
      meta: { title: "Voter List in Excel: Booth-wise, Every State | Setuk", description: "Booth-wise voter list Excel files for every state, district and assembly constituency, with every name in English and Hindi." },
      metaArea: {
        state: { title: "{name} Voter List in Excel, Booth-wise | Setuk", description: "The {roll} voter list for {name} in searchable Excel: {acs} constituencies, {booths} booths, names in English and Hindi." },
        district: { title: "{name} District Voter List in Excel, {state} | Setuk", description: "The {roll} voter list for {name} district, {state}: {acs} constituencies and {booths} booths in searchable Excel." },
        ac: { title: "{name} Voter List in Excel, All {booths} Booths | Setuk", description: "The {roll} voter list for {name} (AC {no}), {district}, {state}: every booth in one Excel workbook." }
      },
      kicker: "Voter list in Excel",
      title: "Every voter list, as a spreadsheet you can search.",
      sub: "Booth-wise voter lists in Excel for {states} states, covering {acs} assembly constituencies. One booth per sheet, one voter per row, every name in English and Hindi.",
      titleArea: {
        state: "{name} voter list in Excel",
        district: "{name} district voter list in Excel",
        ac: "{name} voter list in Excel"
      },
      subArea: {
        state: "The {roll} roll for {name}: {acs} assembly constituencies and {booths} booths, one workbook per constituency.",
        district: "{name} district, {state}: {acs} constituencies and {booths} booths, from the {roll} roll.",
        ac: "AC {no}, {district}, {state}: all {booths} booths in one workbook, from the {roll} roll."
      },
      enquire: "Enquire on WhatsApp",
      howLink: "What's in the file",
      crumbs: "Breadcrumb",
      root: "Voter list in Excel",
      finder: { title: "Find a voter list", state: "State", district: "District", ac: "Assembly constituency", allStates: "All states", allDistricts: "All districts", allAcs: "All constituencies", pickState: "Choose a state first", pickDistrict: "Choose a district first", reset: "Start over" },
      stats: { states: "States", districts: "Districts", acs: "Assembly seats", pcs: "Lok Sabha seats", booths: "Polling booths", files: "Excel sheets" },
      levels: { state: "State", district: "District", ac: "Assembly constituency" },
      selected: "Selected",
      preview: { title: "What you get", summary: "Summary", part: "Part {n}", more: "+{n} more", note: "One workbook, one sheet per booth." },
      cards: {
        heading: { all: "Choose a state", state: "Districts in {name}", district: "Constituencies in {name}", ac: "{name} and the rest of {district}" },
        count: { all: "{n} states", state: "{n} districts", district: "{n} constituencies", ac: "{n} constituencies" },
        roll: "Roll",
        order: "Get the {name} list",
        orderNote: "Opens WhatsApp with the order filled in",
        explore: { state: "See districts", district: "See constituencies" },
        perBooth: "{rate} per booth",
        total: "{price} in all",
        pc: "Lok Sabha",
        empty: { title: "Nothing listed here yet.", body: "The lists for this area aren't on the page yet. Ask on WhatsApp and we'll tell you what's available.", cta: "Ask on WhatsApp" }
      },
      detail: {
        kicker: "About this list",
        glance: "At a glance",
        includes: "What's in the file",
        sample: "How a sheet looks",
        related: "More voter lists",
        faq: "Questions",
        faqTitle: "Questions about this list.",
        disclaimer: "Read the voter list Excel disclaimer"
      },
      order: {
        kicker: "How to order",
        title: "From the list you need to a file in your inbox.",
        body: "{price} for this list at {rate} per booth. Ask for a quote on district and state orders.",
        steps: [
          { t: "Pick the list", d: "A constituency, a district, a Lok Sabha seat or a whole state." },
          { t: "Check a sample", d: "Ask for a free sample booth and check the English and Hindi columns." },
          { t: "Get the file", d: "Files arrive within 24 hours, often instantly." }
        ],
        cta: "Order on WhatsApp"
      }
    },
    roles: {
      common: {
        eg: "For example",
        soon: "In progress",
        hero: { more: "See every step" },
        setup: {
          title: "Set up with your office in two to three weeks.",
          sub: "We study how your office runs, configure Setuk around it, train each role, then stay on.",
          link: "How we work"
        },
        trust: {
          title: "Your office's records stay yours.",
          items: [
            { t: "Access by role", d: "Each person sees only the work their role needs." },
            { t: "Stored in India", d: "Data is stored primarily in India. We don't sell it." },
            { t: "Yours to export", d: "Export your records at any time. They are kept for 60 days after you stop." },
            { t: "Breaches reported fast", d: "If a breach affects your data, we tell you within 72 hours." }
          ],
          link: "Read the privacy policy"
        },
        allFaqs: "See all FAQs"
      },
      mps: {
        meta: {
          title: "MP Office Management Software | Setuk",
          description: "Setuk runs an MP's offices in one system: citizen requests, letters, PNR, appointments and programs, from Delhi to the constituency, set up with your staff."
        },
        menu: { t: "For MPs", d: "Delhi, constituency and camp offices in one record." },
        kicker: "For Members of Parliament",
        title: "Run your MP office from one clear record.",
        sub: "Citizen requests, letters, PNR, appointments and programs, tracked across Delhi and the constituency, and set up with your staff.",
        primary: "Request demo",
        secondary: "See the modules",
        word: "सांसद",
        figure: {
          label: "The Lok Sabha chamber drawn in fine lines. Point at a bench and it rises, like a member standing to speak.",
          read: { seat: "seat" }
        },
        case: {
          label: "One request, start to finish",
          title: "Confirmed berths to Delhi for a family",
          done: "Closed",
          steps: [
            { t: "Record", d: "Logged with the family's details for Friday's hospital visit." },
            { t: "Assign", d: "The PNR desk in the Delhi office has it, marked urgent." },
            { t: "Follow up", d: "A letter to the railway division; its reply joins the case." },
            { t: "Close and inform", d: "The family gets an SMS: berths confirmed." }
          ]
        },
        challenges: {
          title: "An MP's office carries more than one register can hold.",
          sub: "Where requests slip today, between Delhi, the constituency and home.",
          items: [
            { t: "Letters in many registers", d: "Citizen applications, PNR requests and replies from ministries sit in different files and inboxes." },
            { t: "Two cities, one team", d: "Work moves between Delhi and the constituency, and a request can stall in the handover." },
            { t: "Follow-ups without an owner", d: "Staff need to know who has each request, what was done and what is still pending." },
            { t: "No single view for the MP", d: "A picture of pending work means asking several people and waiting for answers." }
          ]
        },
        offices: {
          kicker: "Many offices, one record",
          title: "Delhi, the constituency and home, working from the same record.",
          body: "An MP's work runs through several offices at once. Each gets its own staff and permissions, and every request keeps one shared history.",
          centre: { t: "One record", d: "Every request, letter and visit" },
          items: [
            { t: "Delhi office", d: "Letters to ministries, the session calendar and PNR requests to the railways." },
            { t: "Constituency office", d: "Citizen requests, visitors and the programs where the MP meets people." },
            { t: "Residence and camp offices", d: "Requests taken at home or on tour, logged on a phone and passed to the right desk." }
          ]
        },
        modules: {
          title: "What we set up in an MP's office.",
          sub: "Live Setuk modules, configured around how your office already works. Each comes with an SOP for your staff.",
          items: [
            { t: "Letter management", d: "Applications, ministry replies and departmental letters, each with a reference, an owner and a status.", img: "eletter", alt: "An office assistant reviewing the eLetter list in Setuk" },
            { t: "PNR letters", d: "Railway requests in a queue of their own, so urgent travel never waits in the general pile.", img: "pnr", alt: "A citizen handing over a railway ticket request at a help desk" },
            { t: "Appointments and visitors", d: "Meeting requests, slots and every visitor recorded, in Delhi and at home.", img: "appointments", alt: "A citizen greeted at a constituency office reception desk" },
            { t: "Program calendar", d: "Sessions, inaugurations, public meetings and tours in one calendar the team shares." },
            { t: "Citizen management", d: "Who asked, what they asked for and what was done, searchable in seconds.", img: "citizens", alt: "A representative meeting citizens at a public gathering" },
            { t: "Reports", d: "Pending and completed work by staff member, department and area." },
            { t: "LADs management", d: "Local area development works, from recommendation to completion.", soon: true }
          ]
        },
        flow: {
          title: "From a citizen's request to a recorded action.",
          sub: "The same four steps for every request. Here is one PNR case running through them.",
          steps: [
            { t: "Record", d: "Staff log the request with the citizen's details and documents.", eg: "A family in the constituency needs confirmed berths to Delhi for a hospital visit on Friday." },
            { t: "Assign", d: "It goes to the right person, with a due date.", eg: "The PNR desk in the Delhi office gets it, marked urgent." },
            { t: "Follow up", d: "Every call, letter and reply joins the same history.", eg: "A letter goes to the railway division the same day. Its reply is attached to the case." },
            { t: "Close and inform", d: "The citizen hears back, and the case closes.", eg: "The family gets an SMS when the berths are confirmed." }
          ]
        },
        oversight: {
          kicker: "Oversight",
          title: "Know what is pending without asking around.",
          body: "The MP and the office manager see the office's work in one place, from today's appointments to the oldest open letter.",
          items: [
            "Requests and letters received, pending and closed",
            "Follow-ups waiting on each staff member",
            "Today's appointments and the week's programs",
            "PNR requests by status",
            "Work by department and area"
          ],
          alt: "The eLetter list in Setuk, with received, ongoing and dispatched letters and their status"
        },
        team: {
          title: "Everyone in the office works in the same system.",
          sub: "Access is set by role, so each person sees their own part of the work.",
          rows: [
            { t: "The MP", d: "Reviews pending work and the week ahead, from anywhere." },
            { t: "Personal secretary", d: "Runs the calendar, appointments and correspondence." },
            { t: "Office manager", d: "Assigns work and keeps follow-ups moving." },
            { t: "Staff in Delhi and the constituency", d: "Log requests, update statuses and close cases." }
          ]
        },
        faq: {
          title: "Questions MP offices ask",
          items: [
            { q: "Can our Delhi and constituency offices use one account?", a: "Yes. Constituency, residence, camp and Delhi offices work from one system, with role-based access for every staff member." },
            { q: "Are PNR requests kept apart from other letters?", a: "Yes. PNR letters have their own queue, so urgent railway requests are tracked separately from general correspondence." },
            { q: "Can we bring in our existing registers?", a: "Yes. Paper registers and Excel sheets are imported during setup, so you keep your history." },
            { q: "Can the MP see pending work while travelling?", a: "Yes. Setuk is cloud-based and works on a phone, so the MP and authorised staff can review the office's work from anywhere." },
            { q: "Is MPLADS work tracked?", a: "A module for local area development works is being built now. Until it ships, works can be followed as letters and requests." },
            { q: "What does it cost?", a: "Monthly or annual plans, priced by the number of offices, staff and modules. Request a demo for a quote." }
          ]
        },
        cta: {
          title: "Bring every office you run into one record.",
          body: "See how Setuk would run your offices, from Delhi to the constituency."
        }
      },
      mlas: {
        meta: {
          title: "MLA Office Management Software | Setuk",
          description: "Setuk runs an MLA's constituency office in one system: citizen requests, letters, programs, booths and karyakartas, set up and trained with your team."
        },
        menu: { t: "For MLAs", d: "Constituency office, booths and karyakartas." },
        kicker: "For Members of Legislative Assembly",
        title: "Your constituency, run from one office.",
        sub: "Citizen requests, letters, programs, booths and karyakartas in one system, so every action in the constituency is tracked.",
        primary: "Request demo",
        secondary: "See the modules",
        word: "विधायक",
        figure: {
          label: "An assembly constituency drawn in fine lines, with polling booths across it. Point at the map and the booths nearby rise.",
          read: { booth: "booth" }
        },
        case: {
          label: "One request, start to finish",
          title: "The handpump by the primary school",
          done: "Closed",
          steps: [
            { t: "Record", d: "Residents report that the handpump has stopped working." },
            { t: "Assign", d: "Filed under the village's booth, sent to the water desk." },
            { t: "Follow up", d: "A letter to PHED; the booth's karyakarta confirms the repair team." },
            { t: "Close and inform", d: "The residents get an SMS: repair recorded." }
          ]
        },
        challenges: {
          title: "A constituency asks a lot of one office.",
          sub: "Where work slips today, between the office, the villages and the departments.",
          items: [
            { t: "Requests from every direction", d: "Applications, complaints and calls arrive at the office, at home and in the field." },
            { t: "Teams spread across villages", d: "Office staff and karyakartas need a shared view of who is doing what, and where." },
            { t: "Letters that go quiet", d: "Requests sent to departments need a reference, a follow-up and a clear status." },
            { t: "Local work without a record", d: "Programs, visits and development work happen every week and are hard to show later." }
          ]
        },
        ground: {
          kicker: "From the office to every booth",
          title: "One system from the constituency office to the last booth.",
          body: "Setuk follows the way an assembly seat is organised. Work is filed by area and booth, so the office knows where each request came from and who on the ground can help.",
          levels: [
            { t: "Constituency office", d: "Requests, letters, appointments and the program calendar." },
            { t: "Areas and wards", d: "Work grouped by block, panchayat or ward, the way your office divides it." },
            { t: "Booths", d: "Every booth mapped and staffed, ready for polling day." },
            { t: "Karyakartas", d: "Assignments and updates for every worker, booth by booth." }
          ]
        },
        modules: {
          title: "What we set up in an MLA's office.",
          sub: "Live Setuk modules for the office and the ground, each with an SOP for the people who use it.",
          items: [
            { t: "Citizen management", d: "Who came, what they needed and what was done, searchable by village and booth.", img: "citizens", alt: "A representative meeting citizens at a public gathering" },
            { t: "Letter management", d: "Letters to departments, each with a reference, an owner and a status until the reply comes.", img: "eletter", alt: "An office assistant reviewing the eLetter list in Setuk" },
            { t: "Booth management", d: "Map, staff and track every booth in the constituency.", img: "booths", alt: "Booth workers checking voter details on phones outside a polling station" },
            { t: "Karyakarta management", d: "Assignments, communication and tracking for your ground workers." },
            { t: "Appointments and programs", d: "Visits, meetings and public programs in one calendar for the whole team.", img: "calendar", alt: "A staff member briefing the representative on the day's schedule from a tablet" },
            { t: "WhatsApp management", d: "Updates and notices to citizens and workers, in bulk or one by one." },
            { t: "LADs management", d: "Local area development works, from recommendation to completion.", soon: true }
          ]
        },
        flow: {
          title: "From a village request to a closed case.",
          sub: "The same four steps for every request. Here is one from a village running through them.",
          steps: [
            { t: "Record", d: "Staff log the request with where it came from.", eg: "Residents report that the handpump near the primary school has stopped working." },
            { t: "Assign", d: "It goes to the right person, filed under its area and booth.", eg: "It is filed under the village's booth and sent to the staff member who handles water." },
            { t: "Follow up", d: "Letters, calls and visits join the same history.", eg: "A letter goes to the PHED office. The booth's karyakarta confirms when the repair team arrives." },
            { t: "Close and inform", d: "The citizen hears back, and the case closes.", eg: "The residents get an SMS when the repair is recorded." }
          ]
        },
        oversight: {
          kicker: "Oversight",
          title: "See the constituency's work at a glance.",
          body: "The MLA and the office manager see what came in, what is moving and what is stuck, by area, booth and staff member.",
          items: [
            "Requests received and closed, by area and booth",
            "Letters waiting on a department's reply",
            "The week's programs and visits",
            "Work assigned to each staff member and karyakarta",
            "Booth coverage ahead of polling day"
          ],
          alt: "The eLetter list in Setuk, with received, ongoing and dispatched letters and their status"
        },
        team: {
          title: "From the MLA to the booth, one system.",
          sub: "Access is set by role, so each person sees their own part of the work.",
          rows: [
            { t: "The MLA", d: "Sees the constituency's work by area, and what needs a call." },
            { t: "Personal secretary", d: "Runs appointments, letters and the program calendar." },
            { t: "Office staff", d: "Log requests, write letters and update statuses." },
            { t: "Karyakartas and booth teams", d: "Get assignments and report back, limited to their own booths." }
          ]
        },
        faq: {
          title: "Questions MLA offices ask",
          items: [
            { q: "Does Setuk handle booths and karyakartas?", a: "Yes. Booth management maps and staffs every booth, and karyakarta management handles assignments and tracking, booth by booth." },
            { q: "Can requests be filed by village, ward or booth?", a: "Yes. During setup we create the areas your office uses, so every request carries where it came from." },
            { q: "Can karyakartas use Setuk on their phones?", a: "Yes. Setuk works on a phone, and each worker sees only the booths and tasks assigned to them." },
            { q: "What about requests that come on WhatsApp?", a: "Staff log them into Setuk, so they are tracked like every other request." },
            { q: "Can we bring in our existing records?", a: "Yes. Paper registers and Excel sheets are imported during setup, so you keep your history." },
            { q: "What does it cost?", a: "Monthly or annual plans, priced by the number of offices, staff and modules. Request a demo for a quote." }
          ]
        },
        cta: {
          title: "Bring your constituency office into one system.",
          body: "See how Setuk would run your office, from the first request to the last booth."
        }
      },
      mayors: {
        meta: {
          title: "Mayor's Office Management Software | Setuk",
          description: "Setuk runs a Mayor's office in one system: civic complaints by ward, letters to departments, hearings, programs and public works, set up with your staff."
        },
        menu: { t: "For Mayors", d: "Civic complaints, wards and municipal follow-ups." },
        kicker: "For Mayors and their offices",
        title: "Keep your city's work in view, ward by ward.",
        sub: "Civic complaints, letters to departments, hearings and public works, tracked from the Mayor's office in one system.",
        primary: "Request demo",
        secondary: "See the modules",
        word: "महापौर",
        figure: {
          label: "A city drawn in fine lines, divided into wards. Point at a ward and its buildings rise.",
          read: { ward: "ward" }
        },
        case: {
          label: "One complaint, start to finish",
          title: "A broken road outside the vegetable market",
          done: "Closed",
          steps: [
            { t: "Record", d: "A resident of Ward 14 reports it, with photos." },
            { t: "Assign", d: "Filed as Roads, Ward 14, with an owner for engineering." },
            { t: "Follow up", d: "A letter to the executive engineer; the site visit joins the case." },
            { t: "Close and inform", d: "The resident gets an SMS: repair recorded." }
          ]
        },
        challenges: {
          title: "A city reaches the Mayor's office in many pieces.",
          sub: "Where complaints slip today, between residents, wards and departments.",
          items: [
            { t: "Complaints on every channel", d: "Roads, drains, garbage and streetlights are reported by phone, letter and in person." },
            { t: "Many departments, one question", d: "An issue may need engineering, sanitation and the zonal office. Who has it now?" },
            { t: "Public works without a shared record", d: "Works, inspections and progress updates are spread across files and conversations." },
            { t: "A crowded calendar", d: "Council meetings, hearings, inaugurations and ward visits compete for the same days." }
          ]
        },
        wards: {
          kicker: "Ward by ward",
          title: "Every complaint filed by ward and kind, so patterns show.",
          body: "Setuk files each issue by ward and category. The office sees where complaints cluster and which department each one is waiting on.",
          categories: ["Roads", "Drainage", "Sanitation", "Streetlights", "Water supply", "Encroachment"],
          note: "Setuk runs the Mayor's office. It works alongside the municipal corporation's own systems and does not replace them."
        },
        modules: {
          title: "What we set up in a Mayor's office.",
          sub: "Live Setuk modules, configured for civic work. Each comes with an SOP for your staff.",
          items: [
            { t: "Citizen and complaint management", d: "Every complaint with its ward, category, owner and history.", img: "citizens", alt: "A representative meeting citizens at a public gathering" },
            { t: "Letter management", d: "Letters to departments and the corporation, each with a reference and a status.", img: "eletter", alt: "An office assistant reviewing the eLetter list in Setuk" },
            { t: "Appointments and hearings", d: "Citizen meetings, delegations and visitors, recorded and scheduled.", img: "appointments", alt: "A citizen greeted at an office reception desk" },
            { t: "Program calendar", d: "Council meetings, inaugurations and ward visits in one shared calendar.", img: "calendar", alt: "A staff member briefing the representative on the day's schedule from a tablet" },
            { t: "Reports", d: "What came in, what was handled and what is pending, by ward, department and staff." },
            { t: "WhatsApp management", d: "Notices and updates to citizens, in bulk or one by one." },
            { t: "Event management", d: "Public programs planned and run, from the guest list to the stage.", soon: true }
          ]
        },
        flow: {
          title: "From a reported pothole to a recorded repair.",
          sub: "The same four steps for every complaint. Here is one from a ward running through them.",
          steps: [
            { t: "Record", d: "Staff log the complaint with its ward and photos.", eg: "A resident of Ward 14 reports a broken road outside the vegetable market." },
            { t: "Assign", d: "It is filed by ward and category, with an owner.", eg: "It is filed as Roads, Ward 14, and assigned to the staff member who follows up with engineering." },
            { t: "Follow up", d: "Letters, site visits and replies join the same history.", eg: "A letter goes to the executive engineer. The site visit and the reply are added to the case." },
            { t: "Close and inform", d: "The citizen hears back, and the case closes.", eg: "The resident gets an SMS when the repair is recorded." }
          ]
        },
        oversight: {
          kicker: "Oversight",
          title: "See what needs attention across the city.",
          body: "The Mayor and the office manager see open complaints by ward and category, the letters waiting on departments, and the week ahead.",
          items: [
            "Open and closed complaints, by ward",
            "Issues by category: roads, drains, sanitation, lights",
            "Letters waiting on a department's reply",
            "This week's hearings, meetings and programs",
            "Work assigned to each staff member"
          ],
          alt: "The eLetter list in Setuk, with received, ongoing and dispatched letters and their status"
        },
        team: {
          title: "The Mayor's office, working as one team.",
          sub: "Access is set by role, so each person sees their own part of the work.",
          rows: [
            { t: "The Mayor", d: "Sees open issues by ward, and the week ahead." },
            { t: "Mayor's secretary", d: "Runs appointments, hearings and correspondence." },
            { t: "Office manager", d: "Assigns complaints and keeps follow-ups moving." },
            { t: "Staff and ward coordinators", d: "Log complaints, update statuses and report back." }
          ]
        },
        faq: {
          title: "Questions Mayors' offices ask",
          items: [
            { q: "Does Setuk replace the corporation's grievance system?", a: "No. Setuk runs the Mayor's office. It works alongside the municipal corporation's systems, and staff can record the reference numbers those systems give." },
            { q: "Can complaints be organised by ward?", a: "Yes. Each complaint carries its ward and category, so the office can see where issues cluster." },
            { q: "Can we track public works?", a: "Yes, as tracked items with letters, site visits and updates attached. A module for development fund works is being built." },
            { q: "Can citizens check the status of a complaint?", a: "Yes. Citizens can check the status of their requests, with SMS and WhatsApp alerts when something changes." },
            { q: "Can several staff use it?", a: "Yes. Every staff member gets a login, and access is set by role." },
            { q: "What does it cost?", a: "Monthly or annual plans, priced by the number of offices, staff and modules. Request a demo for a quote." }
          ]
        },
        cta: {
          title: "Bring your city's work into one record.",
          body: "See how Setuk would run the Mayor's office, from the first complaint to the closed case."
        }
      },
      consultants: {
        meta: {
          title: "Partner Program for Political Consultants | Setuk",
          description: "Political consultants bring strategy and execution. Setuk brings the office platform. Partner with Setuk to set up organised offices for the MPs, MLAs and Mayors you advise."
        },
        menu: { t: "For consultants", d: "One platform for every client you advise." },
        kicker: "For political consultants",
        title: "Bring Setuk to every client you advise.",
        sub: "Partner with Setuk to set up organised offices for the MPs, MLAs and Mayors you work with.",
        primary: "Become a partner",
        secondary: "See ways to partner",
        word: "सलाहकार",
        figure: {
          label: "A turntable carrying four kinds of office. Push it round and each client's office comes to the front.",
          read: { client: "client" }
        },
        case: {
          label: "One practice, many offices",
          title: "Your next client, running on Setuk",
          done: "Ready",
          steps: [
            { t: "Pick a client", d: "The office to start with, and the modules it needs." },
            { t: "Set it up together", d: "Who configures, who trains, and by when." },
            { t: "Support the client", d: "The office adopts Setuk while you advise." },
            { t: "Repeat", d: "What worked becomes the template for the next office." }
          ]
        },
        tribute: {
          kicker: "Why consultants matter",
          title: "You do more than advise. You turn strategy into work on the ground.",
          paras: [
            "Political consultants bring research, planning, communication and organisation to Indian politics. From the first survey to the last booth, they help leaders turn priorities into practical work.",
            "Much of that work continues long after the results: setting up offices, building teams, understanding local issues and keeping follow-ups moving. In a country this diverse, every client has a different team, geography and way of working.",
            "Good advice needs a system people can act on. Setuk is that system, so the offices you advise stay organised after you hand over."
          ],
          alt: "A campaign war room at night: a team at laptops in front of maps and whiteboards"
        },
        challenges: {
          title: "Your strategy deserves an office that can carry it out.",
          sub: "Where good advice loses its hold once the engagement ends.",
          items: [
            { t: "Every client works differently", d: "Each office handles requests, letters and appointments its own way, so each engagement starts from scratch." },
            { t: "Little visibility after handover", d: "Once the plan is delivered, it is hard to see whether the office is following it." },
            { t: "Advice that stays on paper", d: "Recommendations need a system the client's staff use every day, or they fade." },
            { t: "More clients, more setup", d: "Onboarding, training and support grow with every office you take on." }
          ]
        },
        model: {
          title: "You bring the expertise. Setuk brings the technology.",
          sub: "A partnership that adds to what you already do, and replaces none of it.",
          parts: [
            { t: "Your practice", d: "Client relationships, strategy, political judgement and the advice your clients come to you for." },
            { t: "Setuk's platform", d: "The office system: citizen records, letters, appointments, booths, karyakartas and reports, with SOPs." },
            { t: "Your clients' offices", d: "MPs, MLAs, Mayors and other offices that run their daily work on Setuk." }
          ]
        },
        offer: {
          title: "What you can deliver to clients with Setuk.",
          sub: "Add a working office system to your engagements, set up the way each client works.",
          items: [
            { t: "A digital office, set up", d: "Workflows for requests, letters, appointments and staff roles, designed with the client.", img: "officeTeam", alt: "A constituency office team working in Setuk on laptops" },
            { t: "Booths and karyakartas, organised", d: "Areas, booths and ground workers in one system, ready before polling day.", img: "booths", alt: "Booth workers checking voter details on phones outside a polling station" },
            { t: "Citizen service that holds", d: "Citizen records, letters and follow-ups the client's staff run every day.", img: "eletter", alt: "An office assistant reviewing the eLetter list in Setuk" },
            { t: "Training and adoption", d: "Role-by-role training and written SOPs, delivered as part of your engagement.", img: "contactDesk", alt: "A desk with a laptop, a notebook and printed reports" },
            { t: "Regular reviews", d: "Monthly reviews of pending and completed work, from the reports Setuk produces.", img: "commandCentre", alt: "A team reviewing maps and numbers on large screens in a command centre" }
          ]
        },
        paths: {
          kicker: "Ways to partner",
          title: "Choose how you want to work with us.",
          sub: "Four ways to partner. We agree the terms with each partner, in writing, before the first client.",
          items: [
            { t: "Referral", d: "You introduce a client. Setuk handles the sale, the setup and the support." },
            { t: "Implementation", d: "You configure workflows, train staff and support adoption, with Setuk behind you." },
            { t: "Reseller", d: "You offer Setuk to your clients on agreed resale terms." },
            { t: "Consulting-led", d: "You combine Setuk with your own advisory and implementation services." }
          ],
          note: "Commissions, partner pricing and branding are agreed with each partner. Nothing on this page is a published rate."
        },
        steps: {
          title: "From your first client to a service you can repeat.",
          items: [
            { t: "Talk to us", d: "Tell us about your practice, your clients and the offices you serve." },
            { t: "Pick a client", d: "Choose the office to start with and the modules it needs." },
            { t: "Set it up together", d: "Agree who configures, who trains and the timeline, then do it." },
            { t: "Support the client", d: "Help the office adopt Setuk while you deliver your own advice." },
            { t: "Repeat", d: "Use what worked as the template for your next client." }
          ]
        },
        data: {
          title: "Each client's records stay with the client.",
          body: "Consultants often advise several offices, sometimes on opposite sides. Setuk keeps them apart.",
          items: [
            { t: "An account per office", d: "Each client office has its own account and its own records." },
            { t: "Access by permission", d: "You see a client's records only if that office grants access, and only for the agreed scope." },
            { t: "The office owns its data", d: "Clients can export their records at any time and keep them if an engagement ends." },
            { t: "Stored in India", d: "Data is stored primarily in India, and breaches are reported within 72 hours." }
          ]
        },
        who: {
          title: "Who partners with Setuk",
          items: [
            { t: "Political consulting firms", d: "Strategy, research and organisation for representatives and parties." },
            { t: "Election and campaign teams", d: "Professionals who want a system that outlasts the campaign." },
            { t: "Political technology agencies", d: "Teams that help offices adopt software and new ways of working." },
            { t: "Independent advisors", d: "Consultants who want to offer clients a structured service." }
          ]
        },
        faq: {
          title: "Questions consultants ask",
          items: [
            { q: "Can I offer Setuk to my clients?", a: "Yes, that is what the partnership is for. Together we agree whether you refer, implement, resell or combine Setuk with your own services." },
            { q: "Who owns the client relationship?", a: "That is agreed per partnership, in writing, before the first client. Each client office always owns its own data." },
            { q: "Can I work across several client offices?", a: "Each client has its own account. With each office's permission, you can work in several, within the access they grant." },
            { q: "Who trains the client's staff?", a: "Setuk or you, depending on the way you partner. Training and SOPs are part of every setup." },
            { q: "What are the partner terms?", a: "Commissions, partner pricing and branding are agreed with each partner. Tell us about your practice and we will propose terms." },
            { q: "Can I offer Setuk under my own brand?", a: "Branding is discussed per partner. We don't offer white-labelling by default." }
          ]
        },
        cta: {
          title: "Bring Setuk into your consulting practice.",
          body: "Tell us about your practice and the offices you serve, and we will show you what you can deliver with Setuk."
        }
      }
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
