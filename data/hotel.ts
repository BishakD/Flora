export type Room = {
  slug: string;
  name: string;
  eyebrow: string;
  summary: string;
  description: string;
  size: string;
  occupancy: string;
  bed: string;
  view: string;
  images: string[];
  amenities: string[];
  rates: {
    name: string;
    policy: string;
    note: string;
    price: number;
  }[];
};

export const rooms: Room[] = [
  {
    slug: "charming-room",
    name: "Charming Room",
    eyebrow: "An intimate Florentine retreat",
    summary: "Velvet tones, considered details and a serene king bed for slow mornings in the city.",
    description:
      "A softly layered room imagined for two, where contemporary comfort meets the collected character of a private palazzo. Photography, dimensions and exact in-room details are editorial placeholders pending the final property survey.",
    size: "28–32 m²",
    occupancy: "2 guests",
    bed: "King bed",
    view: "Palazzo courtyard",
    images: ["/images/room-05.jpg", "/images/room-01.jpg", "/images/room-08.jpg", "/images/room-09.jpg"],
    amenities: [
      "Individually controlled climate",
      "Walk-in rainfall shower",
      "Italian linen and pillow menu",
      "Curated minibar and tea service",
      "High-speed Wi-Fi",
      "Evening turndown on request",
    ],
    rates: [
      {
        name: "Flora Flexible",
        policy: "Illustrative policy: free cancellation until 3 days before arrival.",
        note: "Card guarantee required. Breakfast inclusion to be confirmed.",
        price: 420,
      },
      {
        name: "Quiet Escape",
        policy: "Illustrative non-refundable rate.",
        note: "Full prepayment would be required in a live booking engine.",
        price: 365,
      },
    ],
  },
  {
    slug: "heritage-suite",
    name: "Heritage Suite",
    eyebrow: "A dialogue between past and present",
    summary: "A generous sitting room, architectural proportions and tactile layers in deep blue and rose.",
    description:
      "The Heritage Suite is conceived as a private salon above Florence: generous in scale, quietly theatrical and composed around an unhurried sequence of sleeping and living spaces.",
    size: "46–52 m²",
    occupancy: "3 guests",
    bed: "King bed + daybed",
    view: "Historic rooftops",
    images: ["/images/room-02.jpg", "/images/room-05.jpg", "/images/room-06.jpg", "/images/room-04.jpg"],
    amenities: [
      "Separate salon seating area",
      "King bed with Italian linen",
      "Double vanity bathroom",
      "Espresso and tea ritual",
      "Bluetooth speaker",
      "Unpacking service on request",
    ],
    rates: [
      {
        name: "Heritage Flexible",
        policy: "Illustrative policy: free cancellation until 5 days before arrival.",
        note: "Card guarantee required. Taxes are not calculated in this prototype.",
        price: 610,
      },
      {
        name: "Stay Awhile",
        policy: "Illustrative non-refundable rate for two nights or more.",
        note: "Full prepayment would be required in a live booking engine.",
        price: 545,
      },
    ],
  },
  {
    slug: "majestic-suite",
    name: "Majestic Suite",
    eyebrow: "A private palazzo in miniature",
    summary: "Grand proportions, a salon for lingering and evening light across the rooftops.",
    description:
      "Flora’s most expansive suite is shaped as a sequence of private rooms, each with its own atmosphere. It is an editorial promise of scale and service; final specifications remain to be supplied by the hotel.",
    size: "68–76 m²",
    occupancy: "4 guests",
    bed: "King bed + salon sofa",
    view: "Duomo-facing, to confirm",
    images: ["/images/room-06.jpg", "/images/room-05.jpg", "/images/room-09.jpg", "/images/room-02.jpg"],
    amenities: [
      "Private salon and dining table",
      "Dressing room",
      "Marble bathroom with soaking tub",
      "Dedicated host on request",
      "Premium minibar selection",
      "Arrival amenity",
    ],
    rates: [
      {
        name: "Majestic Flexible",
        policy: "Illustrative policy: free cancellation until 7 days before arrival.",
        note: "Card guarantee required. Live inventory is not connected.",
        price: 890,
      },
      {
        name: "Palazzo Advance",
        policy: "Illustrative advance-purchase, non-refundable rate.",
        note: "Full prepayment would be required in a live booking engine.",
        price: 795,
      },
    ],
  },
  {
    slug: "deluxe-double",
    name: "Deluxe Double",
    eyebrow: "Light, calm and beautifully composed",
    summary: "A luminous double room with a generous window, quiet materials and room to exhale.",
    description:
      "A fresh, light-filled interpretation of Florentine elegance. The room balances tailored utility with the soft finish of a private residence.",
    size: "34–38 m²",
    occupancy: "2 guests",
    bed: "King or twin beds",
    view: "City lane",
    images: ["/images/room-08.jpg", "/images/room-10.jpg", "/images/room-01.jpg", "/images/room-05.jpg"],
    amenities: [
      "King or twin configuration",
      "Walk-in shower",
      "Reading chair and writing desk",
      "Italian bath amenities",
      "High-speed Wi-Fi",
      "In-room safe",
    ],
    rates: [
      {
        name: "Deluxe Flexible",
        policy: "Illustrative policy: free cancellation until 3 days before arrival.",
        note: "Card guarantee required. Taxes are not calculated in this prototype.",
        price: 485,
      },
      {
        name: "Advance Florence",
        policy: "Illustrative non-refundable rate.",
        note: "Full prepayment would be required in a live booking engine.",
        price: 430,
      },
    ],
  },
];

export const services = [
  "24-hour concierge and local recommendations",
  "Private Florence itineraries and museum visits",
  "In-room dining — hours to be confirmed",
  "Airport and rail transfers on request",
  "Laundry and pressing service",
  "Celebration and floral arrangements",
  "Restaurant and theatre reservations",
  "Wellness rituals and in-room treatments",
];

export const imageCredits = [
  ["Hero / Palazzo Vecchio at night", "Yilei (Jerry) Bao", "P1WKXp8Q1RY"],
  ["Florence evening street", "Anton Volnuhin", "Yo_MLq8E4aE"],
  ["Florence at dusk", "Zuoranyi", "_p1_bGrpqg8"],
  ["Florence city view", "Giuseppe Mondì", "Qq1fwSLM0N0"],
  ["Duomo study", "Joseph Quam", "NN_vPCzkU3M"],
  ["Hotel interior study", "Quang Nguyen Vinh", "WR1bkBstInw"],
  ["Hotel interior study", "Brandon Hooper", "TzlERxVhGfc"],
  ["Restaurant table", "Jay Wennington", "N_Y88TWmGwA"],
  ["Cocktail detail", "Adam Jaime", "dmkmrNptMpw"],
  ["Dining detail", "K8", "sWEpcc0Rm0U"],
  ["Spa interior", "Ishan @seefromthesky", "EOAnV_C1a4w"],
  ["Spa study", "Maximilien T'Scharner", "FD0Ga_KJTwM"],
  ["Wellness study", "Roberto Nickson", "YCW4BEhKluw"],
] as const;
