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
    labels: { home: "Home", about: "About", features: "Features", roadmap: "Roadmap", contact: "Contact", legal: "Legal", voterList: "Voter List Excel" },
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
    guideItems: [
      { t: "Constituency office tracking", href: "https://setuk.org/constituency-office-tracking-system" },
      { t: "Party management system", href: "https://setuk.org/enterprise-political-party-management-system" },
      { t: "Office operating system", href: "https://setuk.org/indian-political-office-operating-system" },
      { t: "MLA office digitisation", href: "https://setuk.org/mla-office-digitisation-tools" },
      { t: "Appointment scheduling", href: "https://setuk.org/the-complete-guide-to-political-appointment-scheduling-software-in-india" },
      { t: "Office management guide", href: "https://setuk.org/the-complete-guide-to-political-office-management-software-in-india" },
      { t: "Modernizing Indian governance", href: "https://setuk.org/modernizing-indian-governance" },
      { t: "Political office management software", href: "https://setuk.org/political-office-management-software" }
    ],
    legalItems: [
      { t: "Privacy policy", href: "https://setuk.org/legal/privacy" },
      { t: "Terms and conditions", href: "https://setuk.org/legal/terms" },
      { t: "Consent for data usage", href: "https://setuk.org/legal/consent" },
      { t: "Data retention", href: "https://setuk.org/legal/data-retention" },
      { t: "Data processing agreement", href: "https://setuk.org/legal/dpa" },
      { t: "Refund and cancellation", href: "https://setuk.org/legal/refund" },
      { t: "Disclaimer", href: "https://setuk.org/legal/disclaimer" }
    ]
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
