// config/questions.js
// v1.1 | last: renamed to DC Closet Profile | next: —

(function () {
  const GOLD = "#AB8900";

  function alphaOtherLast(list) {
    const core = list.filter(x => String(x).trim().toLowerCase() !== "other")
                     .slice()
                     .sort((a,b) => a.toLowerCase().localeCompare(b.toLowerCase()));
    return core.concat(["Other"]);
  }

  const Q1_OPTIONS = alphaOtherLast(["Bags & Purses", "Folded Clothes", "Long Hanging", "Shoes", "Short Hanging", "Other"]);
  const Q3_OPTIONS = alphaOtherLast(["Belt & Tie Rack", "Drawers", "Hamper", "LED Lighting", "Mirrors", "Other"]);

  const MATERIALS = ["White (most popular)", "Black", "Costland Oak", "Gray", "Maple", "Moscato Elme", "Natural Oak", "Pewter Pine", "Regal Cherry", "Sable Glow", "Spring Blossom", "Umbria Elme"];
  const MATERIALS_SORTED = [MATERIALS[0]].concat(
    MATERIALS.slice(1).slice().sort((a,b) => a.toLowerCase().localeCompare(b.toLowerCase()))
  );

  const FINISHES = ["Gold", "Black", "Chrome", "Brushed Nickel"];
  const STYLES = ["Style 1", "Style 2"];

  function materialImg(name) {
    return `assets/images/materials/${slug(name)}.jpg`;
  }

  function hardwareImg(category, finish, style) {
    return `assets/images/hardware/${category}-${slug(finish)}-${slug(style)}.jpg`;
  }

  function slug(s) {
    return String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  }

  window.DCV_CONFIG = {
    meta: {
      gold: GOLD,
      stepsCount: 8,
      tagline: "inspired by her",
      iconPath: "assets/images/icons/Icon.png",
      logoPath: "assets/images/icons/Logo.png"
    },
    welcome: {
      headlineParts: ["from desire to ", "reality"],
      subtext: "Tell us what matters most — so we can design a closet that's truly yours.",
      cta: "Begin"
    },
    flow: [
      { id: "welcome", type: "welcome" },
      {
        id: "q1",
        type: "rank3",
        section: "PRIORITIES",
        step: 1,
        title: "What do you need the most space for?",
        subtitle: "Tap up to 3 priorities. They'll be numbered in the order you tap.",
        options: Q1_OPTIONS
      },
      {
        id: "q2",
        type: "balance",
        section: "BALANCE",
        step: 2,
        title: "Hanging space vs. shelving — what's your balance?",
        subtitle: "Slide to set your ideal ratio.",
        presets: [
          { label: "Mostly\nHanging", shelving: 25 },
          { label: "Balanced\n50/50", shelving: 50 },
          { label: "Mostly\nShelving", shelving: 75 }
        ]
      },
      {
        id: "q3",
        type: "multi_list",
        section: "FEATURES",
        step: 3,
        title: "Which features are important to you?",
        subtitle: "Select all that apply.",
        options: Q3_OPTIONS
      },
      {
        id: "q4",
        type: "single_grid",
        section: "MATERIALS",
        step: 4,
        title: "What material finish speaks to you?",
        subtitle: "Select one that matches your vision.",
        options: MATERIALS_SORTED.map(name => ({ name, image: materialImg(name) }))
      },
      {
        id: "q5",
        type: "hardware",
        section: "HARDWARE",
        step: 5,
        title: "Let's talk about hardware.",
        subtitle: "Select your preferred option for each.",
        categories: [
          {
            id: "pulls_handles",
            heading: "Pulls / Handles",
            imageCategory: "pulls-handles",
            options: FINISHES.flatMap(fin => STYLES.map(st => ({ finish: fin, style: st, label: `${fin} · ${st}`, image: hardwareImg("pulls-handles", fin, st) })))
          },
          {
            id: "hanging_rods",
            heading: "Hanging Rods",
            imageCategory: "hanging-rods",
            options: FINISHES.flatMap(fin => STYLES.map(st => ({ finish: fin, style: st, label: `${fin} · ${st}`, image: hardwareImg("hanging-rods", fin, st) })))
          }
        ]
      },
      {
        id: "q6",
        type: "textarea",
        section: "DETAILS",
        step: 6,
        title: "Anything else we should know?",
        subtitle: "Tell us about your dream closet — special needs, ideas, must-haves. This is optional.",
        max: 500,
        placeholder: "Type here…"
      },
      {
        id: "q7",
        type: "yesno",
        section: "INSPIRATION",
        step: 7,
        title: "Do you have inspiration photos?",
        subtitle: "Pinterest boards, Instagram saves — anything that captures your vision.",
        yes: "Yes",
        no: "No",
        promptTitle: "Wonderful! Please send your photos or links to:",
        email: "rangelp@desirecabinets.com",
        phone: "678-709-3790"
      },
      {
        id: "contact",
        type: "contact",
        section: "CONTACT",
        step: 8,
        title: "Almost done!",
        subtitle: "How should we reach you?",
        methods: ["Email","Phone","Text"],
        defaultMethod: "Email"
      },
      {
        id: "review",
        type: "review",
        section: "REVIEW",
        title: "Review Your Answers",
        subtitle: "Everything look good?",
        cta: "Generate Summary"
      }
    ]
  };
})();
