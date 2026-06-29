from datetime import timedelta

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.utils import timezone

from sessions_app.models import (
    AgeRestriction,
    CancellationPolicy,
    Category,
    LocationType,
    Session,
    SkillLevel,
)

User = get_user_model()

DEMO_CREATORS = [
    {
        "username": "maya_yoga",
        "email": "maya@example.com",
        "full_name": "Maya Kapoor",
        "bio": "Certified yoga instructor (RYT-500) helping busy people build a calm, "
        "consistent practice. I've led 600+ classes online and in studios across India.",
        "years_experience": 8,
    },
    {
        "username": "arjun_lens",
        "email": "arjun@example.com",
        "full_name": "Arjun Mehta",
        "bio": "Portrait & editorial photographer and mentor. Ex-agency, now teaching the "
        "craft of light, posing, and storytelling to the next generation of shooters.",
        "years_experience": 12,
    },
    {
        "username": "chef_riya",
        "email": "riya@example.com",
        "full_name": "Riya Sharma",
        "bio": "Home chef and culinary instructor specialising in fresh, from-scratch "
        "Italian cooking. Trained in Bologna, cooking for joy since I was ten.",
        "years_experience": 6,
    },
]

DEMO_REVIEWERS = [
    {"username": "neha_traveller", "email": "neha@example.com", "full_name": "Neha Verma"},
    {"username": "sam_books", "email": "sam@example.com", "full_name": "Sameer Iyer"},
    {"username": "priya_d", "email": "priyad@example.com", "full_name": "Priya Das"},
    {"username": "rahul_k", "email": "rahulk@example.com", "full_name": "Rahul Khanna"},
]

DEMO_SESSIONS = [
    {
        "title": "Sunrise Vinyasa Flow",
        "description": "A 60-minute energising yoga flow suitable for all levels. Move "
        "with your breath through a balanced sequence of standing poses, gentle "
        "twists, and a calming cool-down.",
        "category": Category.FITNESS,
        "price": 0,
        "duration_minutes": 60,
        "capacity": 15,
        "location_type": LocationType.ONLINE,
        "location_text": "https://zoom.us/j/demo-sunrise-flow",
        "skill_level": SkillLevel.BEGINNER,
        "language": "English",
        "age_restriction": AgeRestriction.ALL_AGES,
        "cancellation_policy": CancellationPolicy.FLEXIBLE,
        "what_you_will_learn": [
            "Foundational Vinyasa sequencing and breath control",
            "Safe alignment for standing poses and twists",
            "A simple morning routine you can repeat at home",
        ],
        "agenda": [
            "Centering and breathwork (5 min)",
            "Gentle warm-up and sun salutations (15 min)",
            "Standing flow and balance (25 min)",
            "Cool-down, stretch, and relaxation (15 min)",
        ],
        "whats_included": [
            "Live guided session over Zoom",
            "Beginner-friendly modifications",
            "Recording available for 48 hours",
        ],
        "what_to_bring": ["Yoga mat", "Water bottle", "A quiet space"],
        "faqs": [
            {
                "question": "Do I need prior yoga experience?",
                "answer": "Not at all — every pose is offered with beginner modifications.",
            },
            {
                "question": "What if I miss the live class?",
                "answer": "A recording is shared with all attendees for 48 hours.",
            },
        ],
        "days": 2,
        "creator": "maya_yoga",
    },
    {
        "title": "Portrait Photography Masterclass",
        "description": "Learn natural-light portrait techniques, posing, and a complete "
        "editing workflow in this hands-on, small-group workshop.",
        "category": Category.PHOTOGRAPHY,
        "price": 2500,
        "duration_minutes": 120,
        "capacity": 8,
        "location_type": LocationType.IN_PERSON,
        "venue_name": "Hauz Khas Creative Studio",
        "full_address": "2nd Floor, 14 Hauz Khas Village, New Delhi 110016",
        "skill_level": SkillLevel.INTERMEDIATE,
        "language": "English",
        "age_restriction": AgeRestriction.SIXTEEN,
        "cancellation_policy": CancellationPolicy.MODERATE,
        "what_you_will_learn": [
            "Reading and shaping natural light",
            "Directing and posing people who feel awkward on camera",
            "A fast, repeatable Lightroom editing workflow",
        ],
        "agenda": [
            "Light theory and gear walkthrough (20 min)",
            "Live posing demo with a model (40 min)",
            "Hands-on shooting in pairs (40 min)",
            "Editing workflow and Q&A (20 min)",
        ],
        "whats_included": [
            "Studio access and lighting setup",
            "One model to practise with",
            "Editing preset pack",
        ],
        "what_to_bring": [
            "Any camera (DSLR, mirrorless, or phone)",
            "Laptop with Lightroom (optional)",
        ],
        "faqs": [
            {
                "question": "Is a professional camera required?",
                "answer": "No — you can fully participate with a modern smartphone.",
            },
            {
                "question": "Will there be a model to photograph?",
                "answer": "Yes, a model joins for the posing and shooting segments.",
            },
        ],
        "days": 4,
        "creator": "arjun_lens",
    },
    {
        "title": "Italian Pasta from Scratch",
        "description": "Roll, cut, and cook fresh pasta with a homemade sauce. All "
        "ingredients and equipment are provided — just bring your appetite.",
        "category": Category.COOKING,
        "price": 1800,
        "duration_minutes": 90,
        "capacity": 10,
        "location_type": LocationType.IN_PERSON,
        "venue_name": "The Indiranagar Kitchen",
        "full_address": "3rd Cross, 100 Feet Road, Indiranagar, Bengaluru 560038",
        "skill_level": SkillLevel.BEGINNER,
        "language": "English",
        "age_restriction": AgeRestriction.ALL_AGES,
        "cancellation_policy": CancellationPolicy.MODERATE,
        "what_you_will_learn": [
            "Making and kneading fresh egg pasta dough",
            "Rolling and cutting tagliatelle by hand",
            "A simple, restaurant-quality tomato-basil sauce",
        ],
        "agenda": [
            "Dough making and resting (20 min)",
            "Rolling and shaping pasta (30 min)",
            "Cooking the sauce (20 min)",
            "Plating and eating together (20 min)",
        ],
        "whats_included": [
            "All ingredients and aprons",
            "Use of kitchen equipment",
            "Recipe card to take home",
        ],
        "what_to_bring": ["An appetite", "A container for leftovers"],
        "faqs": [
            {
                "question": "Are vegetarian options available?",
                "answer": "Yes, the menu is vegetarian-friendly by default.",
            },
            {
                "question": "Can I come without any cooking experience?",
                "answer": "Absolutely — this class is designed for complete beginners.",
            },
        ],
        "days": 6,
        "creator": "chef_riya",
    },
    {
        "title": "1:1 Career Mentoring for Developers",
        "description": "A focused mentoring session covering portfolio review, interview "
        "preparation, and a personalised career roadmap.",
        "category": Category.MENTORING,
        "price": 1200,
        "duration_minutes": 45,
        "capacity": 1,
        "location_type": LocationType.ONLINE,
        "location_text": "https://meet.google.com/demo-career-mentoring",
        "skill_level": SkillLevel.INTERMEDIATE,
        "language": "English",
        "age_restriction": AgeRestriction.EIGHTEEN,
        "cancellation_policy": CancellationPolicy.FLEXIBLE,
        "what_you_will_learn": [
            "How to position your portfolio for target roles",
            "A structured approach to technical interviews",
            "A concrete 90-day career action plan",
        ],
        "agenda": [
            "Goals and current situation (10 min)",
            "Portfolio and resume review (15 min)",
            "Interview strategy (15 min)",
            "Action plan and next steps (5 min)",
        ],
        "whats_included": [
            "Live 1:1 video call",
            "Written notes and resources afterwards",
            "One follow-up question over email",
        ],
        "what_to_bring": ["Your resume", "Portfolio or GitHub link", "Specific questions"],
        "faqs": [
            {
                "question": "What experience level is this for?",
                "answer": "Best for early-to-mid career developers, but all are welcome.",
            },
            {
                "question": "Will I get notes after the call?",
                "answer": "Yes, you'll receive written notes and a resource list.",
            },
        ],
        "days": 3,
        "creator": "arjun_lens",
    },
    {
        "title": "Mindfulness & Breathwork",
        "description": "Wind down with guided breathwork and meditation. A great reset "
        "for stress relief and better sleep.",
        "category": Category.WORKSHOP,
        "price": 500,
        "duration_minutes": 45,
        "capacity": 20,
        "location_type": LocationType.ONLINE,
        "location_text": "https://zoom.us/j/demo-breathwork",
        "skill_level": SkillLevel.BEGINNER,
        "language": "English",
        "age_restriction": AgeRestriction.ALL_AGES,
        "cancellation_policy": CancellationPolicy.FLEXIBLE,
        "what_you_will_learn": [
            "Simple breathwork techniques for instant calm",
            "A short guided meditation you can reuse",
            "How to build a sustainable wind-down routine",
        ],
        "agenda": [
            "Intro and intention setting (5 min)",
            "Guided breathwork (20 min)",
            "Body-scan meditation (15 min)",
            "Reflection and Q&A (5 min)",
        ],
        "whats_included": [
            "Live guided session",
            "Audio recording of the meditation",
        ],
        "what_to_bring": ["Comfortable seating or a cushion", "Headphones"],
        "faqs": [
            {
                "question": "Is this suitable if I've never meditated?",
                "answer": "Yes — it's gentle and fully guided from start to finish.",
            },
        ],
        "days": 5,
        "creator": "maya_yoga",
    },
]

# Reviews keyed by session title. (reviewer username, rating, comment, is_featured)
DEMO_REVIEWS = {
    "Sunrise Vinyasa Flow": [
        ("neha_traveller", 5, "The perfect way to start my day. Calm, clear, and energising.", True),
        ("sam_books", 5, "Maya explains alignment so well — I never felt lost.", False),
        ("priya_d", 4, "Loved it. Wished it ran a little longer!", False),
    ],
    "Portrait Photography Masterclass": [
        ("rahul_k", 5, "My portraits genuinely transformed after this. Worth every rupee.", True),
        ("priya_d", 5, "Arjun is a fantastic teacher — patient and full of practical tips.", False),
        ("sam_books", 4, "Great hands-on practice. The studio was lovely.", False),
    ],
    "Italian Pasta from Scratch": [
        ("neha_traveller", 5, "I made tagliatelle from scratch and it actually worked!", True),
        ("rahul_k", 4, "So much fun and the sauce recipe is a keeper.", False),
    ],
    "Mindfulness & Breathwork": [
        ("priya_d", 5, "I slept better that very night. Highly recommend.", True),
        ("neha_traveller", 4, "Gentle and grounding. A lovely reset.", False),
    ],
    # "1:1 Career Mentoring for Developers" intentionally has no reviews (new-ish listing).
}

RICH_FIELDS = [
    "description",
    "category",
    "price",
    "duration_minutes",
    "capacity",
    "location_type",
    "location_text",
    "venue_name",
    "full_address",
    "skill_level",
    "language",
    "age_restriction",
    "cancellation_policy",
    "what_you_will_learn",
    "agenda",
    "whats_included",
    "what_to_bring",
    "faqs",
]

# --- Bulk catalog generation ---------------------------------------------
# Additional creators so the catalog has variety across many hosts.
NEW_CREATORS = [
    {"username": "liam_fit", "email": "liam@example.com", "full_name": "Liam O'Brien",
     "bio": "Strength & conditioning coach making fitness approachable for everyone.",
     "years_experience": 7},
    {"username": "sofia_art", "email": "sofia@example.com", "full_name": "Sofia Rossi",
     "bio": "Visual artist and photographer who loves teaching the fundamentals of seeing.",
     "years_experience": 10},
    {"username": "noah_code", "email": "noah@example.com", "full_name": "Noah Williams",
     "bio": "Software engineer and mentor focused on careers, interviews, and craft.",
     "years_experience": 9},
    {"username": "ava_chef", "email": "ava@example.com", "full_name": "Ava Nguyen",
     "bio": "Chef and recipe developer obsessed with food from around the world.",
     "years_experience": 11},
    {"username": "ethan_biz", "email": "ethan@example.com", "full_name": "Ethan Carter",
     "bio": "Consultant helping founders and freelancers with strategy and finance.",
     "years_experience": 13},
    {"username": "mia_sound", "email": "mia@example.com", "full_name": "Mia Fernandes",
     "bio": "Sound healer and mindfulness facilitator for calm, creative living.",
     "years_experience": 6},
    {"username": "lucas_lens", "email": "lucas@example.com", "full_name": "Lucas Martin",
     "bio": "Commercial photographer teaching light, gear, and post-processing.",
     "years_experience": 8},
    {"username": "emma_craft", "email": "emma@example.com", "full_name": "Emma Schmidt",
     "bio": "Maker and craft instructor — calligraphy, pottery, and paper arts.",
     "years_experience": 5},
]

# How many generated sessions per category (curated ones add to the totals,
# so every category ends up with well over 5 sessions).
GEN_COUNTS = {
    Category.WORKSHOP: 9,
    Category.MENTORING: 9,
    Category.FITNESS: 9,
    Category.PHOTOGRAPHY: 9,
    Category.COOKING: 9,
    Category.CONSULTATION: 10,
    Category.OTHER: 10,
}

CATEGORY_CONTENT = {
    Category.WORKSHOP: {
        "titles": [
            "Creative Writing Lab", "Public Speaking Bootcamp", "Watercolour Basics Workshop",
            "Resume & LinkedIn Makeover", "Digital Marketing Crash Course",
            "Notion Productivity Workshop", "Storytelling for Founders",
            "Hand Lettering Workshop", "Intro to UX Design", "Personal Finance 101",
        ],
        "description": "A hands-on workshop packed with practical exercises you can apply "
        "right away. Friendly, beginner-welcoming, and interactive throughout.",
        "what_you_will_learn": [
            "Core concepts explained simply", "A repeatable process you can reuse",
            "Common mistakes and how to avoid them",
        ],
        "agenda": [
            "Intro and goals (10 min)", "Core teaching and demo (30 min)",
            "Guided hands-on practice (35 min)", "Feedback and Q&A (15 min)",
        ],
        "whats_included": ["Live guided workshop", "Worksheets and templates", "Q&A time"],
        "what_to_bring": ["Notebook and pen", "Your questions"],
        "faqs": [
            {"question": "Is this beginner-friendly?",
             "answer": "Yes — no prior experience is assumed."},
            {"question": "Will I get the materials?",
             "answer": "Yes, templates and notes are shared with attendees."},
        ],
    },
    Category.MENTORING: {
        "titles": [
            "1:1 Product Management Mentoring", "Startup Idea Validation Session",
            "Data Science Career Mentoring", "UX Portfolio Review",
            "Public Speaking Coaching", "Frontend Interview Prep",
            "Leadership Coaching Call", "Freelancing Kickstart Mentoring",
            "PhD Application Guidance", "Negotiation Skills Coaching",
        ],
        "description": "A focused 1:1 mentoring session tailored to your goals, with concrete "
        "feedback and a clear set of next steps to act on.",
        "what_you_will_learn": [
            "An honest assessment of where you stand", "A prioritised action plan",
            "Resources tailored to your situation",
        ],
        "agenda": [
            "Goals and context (10 min)", "Deep dive and feedback (25 min)",
            "Action plan and next steps (10 min)",
        ],
        "whats_included": ["Live 1:1 video call", "Written notes afterwards",
                           "One follow-up question by email"],
        "what_to_bring": ["Your goals", "Any work to review", "Specific questions"],
        "faqs": [
            {"question": "Who is this for?",
             "answer": "Anyone looking for personalised, practical guidance."},
            {"question": "Do I get notes afterwards?",
             "answer": "Yes, you'll receive written notes and resources."},
        ],
    },
    Category.FITNESS: {
        "titles": [
            "HIIT Burn Express", "Power Yoga Session", "Beginner Pilates Mat Class",
            "Strength Training Fundamentals", "Zumba Dance Party",
            "Mobility & Stretch Flow", "Kettlebell Conditioning",
            "Core & Abs Blast", "Restorative Yin Yoga", "Functional Fitness Circuit",
        ],
        "description": "An energising, all-levels session with clear coaching and modifications "
        "so you can move safely and have fun while you sweat.",
        "what_you_will_learn": [
            "Proper form and safe technique", "How to scale movements to your level",
            "A routine you can repeat at home",
        ],
        "agenda": [
            "Warm-up (10 min)", "Main workout (30 min)",
            "Cooldown and stretch (10 min)",
        ],
        "whats_included": ["Live coached session", "Beginner modifications",
                           "Recording for 48 hours"],
        "what_to_bring": ["Water bottle", "Exercise mat", "A towel"],
        "faqs": [
            {"question": "Do I need equipment?",
             "answer": "A mat is enough; any extra equipment is optional."},
            {"question": "Is it suitable for beginners?",
             "answer": "Yes, every movement is offered with easier options."},
        ],
    },
    Category.PHOTOGRAPHY: {
        "titles": [
            "Street Photography Walk", "Food Photography Workshop", "Astrophotography Night",
            "Smartphone Photography Basics", "Wedding Photography Intro",
            "Product Photography Studio", "Lightroom Editing Lab",
            "Black & White Film Workshop", "Travel Photography Storytelling",
            "Macro Photography Deep Dive",
        ],
        "description": "A practical photography session covering technique, composition, and "
        "editing — bring any camera, including your phone, and start shooting better.",
        "what_you_will_learn": [
            "Composition and framing", "Working with available light",
            "A simple editing workflow",
        ],
        "agenda": [
            "Theory and examples (20 min)", "Hands-on shooting (40 min)",
            "Editing and review (20 min)",
        ],
        "whats_included": ["Live instruction", "Editing preset pack", "Feedback on your shots"],
        "what_to_bring": ["Any camera or smartphone", "Spare battery (optional)"],
        "faqs": [
            {"question": "Do I need a pro camera?",
             "answer": "No — a modern smartphone works perfectly well."},
            {"question": "Will we edit photos?",
             "answer": "Yes, we cover a quick, repeatable editing workflow."},
        ],
    },
    Category.COOKING: {
        "titles": [
            "Sushi Rolling Workshop", "French Patisserie Basics", "Thai Street Food Class",
            "Artisan Bread Baking", "Vegan Comfort Food", "Chocolate Truffle Making",
            "North Indian Curries", "Cocktail Mixology Night",
            "Farm-to-Table Brunch", "Authentic Ramen Workshop",
        ],
        "description": "A hands-on cooking class where you'll make a complete dish from scratch "
        "and sit down to enjoy what you cooked. Ingredients and equipment provided.",
        "what_you_will_learn": [
            "Key techniques for the dish", "Balancing flavour and seasoning",
            "Plating and presentation",
        ],
        "agenda": [
            "Prep and mise en place (20 min)", "Cooking together (40 min)",
            "Plating and tasting (20 min)",
        ],
        "whats_included": ["All ingredients", "Aprons and equipment", "Recipe card to take home"],
        "what_to_bring": ["An appetite", "A container for leftovers"],
        "faqs": [
            {"question": "Are dietary swaps possible?",
             "answer": "Yes, let us know in advance and we'll accommodate where we can."},
            {"question": "Is experience needed?",
             "answer": "Not at all — beginners are very welcome."},
        ],
    },
    Category.CONSULTATION: {
        "titles": [
            "Tax Planning Consultation", "Legal Startup Setup Advice",
            "Nutrition & Diet Consultation", "Career Change Strategy Call",
            "Interior Design Consultation", "Branding Strategy Session",
            "SEO Audit Consultation", "Wedding Planning Consultation",
            "Financial Investment Review", "Skincare Routine Consultation",
        ],
        "description": "A private consultation to get expert answers to your specific situation, "
        "with clear, actionable recommendations you can put into practice immediately.",
        "what_you_will_learn": [
            "Answers tailored to your situation", "Clear, prioritised recommendations",
            "Pitfalls to watch out for",
        ],
        "agenda": [
            "Understanding your needs (10 min)", "Expert review and advice (25 min)",
            "Recommendations and next steps (10 min)",
        ],
        "whats_included": ["Private 1:1 call", "Summary of recommendations",
                           "Resource suggestions"],
        "what_to_bring": ["Relevant documents", "Your key questions"],
        "faqs": [
            {"question": "Is this confidential?",
             "answer": "Yes, everything discussed stays private."},
            {"question": "Will I get a summary?",
             "answer": "Yes, you'll receive a written summary afterwards."},
        ],
    },
    Category.OTHER: {
        "titles": [
            "Tarot Reading Session", "Sound Healing Circle", "Calligraphy & Ink",
            "Bonsai Care Basics", "Astrology Birth Chart Reading", "Origami Masterclass",
            "Wine Tasting Evening", "Pottery Wheel Intro",
            "Board Game Design Jam", "Beginner Magic Tricks",
        ],
        "description": "A relaxed, hands-on experience guided from start to finish — come "
        "curious, no prior experience needed, and leave with something new.",
        "what_you_will_learn": [
            "The essentials to get started", "A technique to practise on your own",
            "Tips to keep improving",
        ],
        "agenda": [
            "Welcome and intro (10 min)", "Guided activity (40 min)",
            "Wrap-up and Q&A (10 min)",
        ],
        "whats_included": ["Guided session", "All materials needed", "Friendly small group"],
        "what_to_bring": ["Curiosity", "Comfortable clothing"],
        "faqs": [
            {"question": "Do I need any experience?",
             "answer": "No — this is designed for complete beginners."},
            {"question": "Are materials provided?",
             "answer": "Yes, everything you need is included."},
        ],
    },
}

GEN_VENUES = [
    ("The Loft Studio", "5th Floor, 22 MG Road, Bengaluru 560001"),
    ("Sunset Community Hall", "Plot 7, Sector 18, Noida 201301"),
    ("Riverside Arts Centre", "12 Marine Drive, Mumbai 400020"),
    ("The Workshop Space", "3rd Cross, Jubilee Hills, Hyderabad 500033"),
    ("Garden Pavilion", "44 Park Street, Kolkata 700016"),
    ("Old Town Studio", "9 Church Street, Pune 411001"),
]

GEN_REVIEW_COMMENTS = [
    "Fantastic session — learned a lot and had fun.",
    "Really well organised and easy to follow.",
    "Highly recommend to anyone curious about this.",
    "Great host, super knowledgeable and patient.",
    "Exceeded my expectations. Will book again!",
]

# --- Cover images --------------------------------------------------------
# Every seeded session gets a unique Unsplash cover (no image is reused).
CURATED_IMAGES = {
    "Sunrise Vinyasa Flow": "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=1200&q=80",
    "Portrait Photography Masterclass": "https://images.unsplash.com/photo-1599058917765-a780eda07a3e?auto=format&fit=crop&w=1200&q=80",
    "Italian Pasta from Scratch": "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=1200&q=80",
    "1:1 Career Mentoring for Developers": "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1200&q=80",
    "Mindfulness & Breathwork": "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=1200&q=80",
}

# Unique Unsplash cover images for generated sessions, ordered to match
# build_generated_sessions() (category blocks in GEN_COUNTS order).
GEN_IMAGES = [
    # Workshop
    "https://images.unsplash.com/photo-1593510987185-1ec2256148a3?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1542435503-956c469947f6?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1556745757-8d76bdb6984b?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?auto=format&fit=crop&w=1200&q=80",
    # Mentoring
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1542744095-fcf48d80b0fd?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=1200&q=80",
    # Fitness
    "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1588286840104-8957b019727f?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1524594152303-9fd13543fe6e?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1605296867304-46d5465a13f1?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1554284126-aa88f22d8b74?auto=format&fit=crop&w=1200&q=80",
    # Photography
    "https://images.unsplash.com/photo-1559925393-8be0ec4767c8?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1473042904451-00171c69419d?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1502301197179-65228ab57f78?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1612817159949-195b6eb9e31a?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1453728013993-6d66e9c9123a?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1559181567-c3190ca9959b?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1454942901704-3c44c11b2ad1?auto=format&fit=crop&w=1200&q=80",
    # Cooking
    "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1466637574441-749b8f19452f?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1532634922-8fe0b757fb13?auto=format&fit=crop&w=1200&q=80",
    # Consultation
    "https://images.unsplash.com/photo-1633158829585-23ba8f7c8caf?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1543007630-9710e4a00a20?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1604871000636-074fa5117945?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1606857521015-7f9fcf423740?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1469371670807-013ccf25f16a?auto=format&fit=crop&w=1200&q=80",
    # Other
    "https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1495195134817-aeb325a55b65?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1518972559570-7cc1309f3229?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1620325867502-221cfb5faa5f?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=1200&q=80",
]


def build_generated_sessions():
    """Deterministically generate the bulk catalog (idempotent across runs)."""
    skills = [SkillLevel.BEGINNER, SkillLevel.INTERMEDIATE, SkillLevel.ADVANCED]
    policies = [
        CancellationPolicy.FLEXIBLE,
        CancellationPolicy.MODERATE,
        CancellationPolicy.STRICT,
    ]
    out = []
    gi = 0
    for category, count in GEN_COUNTS.items():
        content = CATEGORY_CONTENT[category]
        one_to_one = category in (Category.MENTORING, Category.CONSULTATION)
        price_pool = [0, 500, 800, 1200, 1500, 2000, 2500]
        for i in range(count):
            online = gi % 2 == 1
            title = content["titles"][i]
            session = {
                "title": title,
                "description": content["description"],
                "category": category,
                "price": 0 if gi % 6 == 0 else price_pool[gi % len(price_pool)] or 800,
                "duration_minutes": [30, 45, 60, 90, 120][gi % 5],
                "capacity": 1 if one_to_one else [6, 8, 10, 12, 15, 20][gi % 6],
                "location_type": LocationType.ONLINE if online else LocationType.IN_PERSON,
                "skill_level": skills[gi % 3],
                "language": "English",
                "age_restriction": (
                    AgeRestriction.EIGHTEEN
                    if ("Wine" in title or "Cocktail" in title or "Investment" in title)
                    else AgeRestriction.ALL_AGES
                ),
                "cancellation_policy": policies[gi % 3],
                "what_you_will_learn": content["what_you_will_learn"],
                "agenda": content["agenda"],
                "whats_included": content["whats_included"],
                "what_to_bring": content["what_to_bring"],
                "faqs": content["faqs"],
                "days": 1 + (gi % 50),
                "creator": NEW_CREATORS[gi % len(NEW_CREATORS)]["username"],
            }
            if online:
                session["location_text"] = f"https://meet.google.com/demo-{gi:03d}"
            else:
                venue, address = GEN_VENUES[gi % len(GEN_VENUES)]
                session["venue_name"] = venue
                session["full_address"] = address
            out.append(session)
            gi += 1
    return out


class Command(BaseCommand):
    help = "Seed demo creators, sessions, and reviews (idempotent)."

    def handle(self, *args, **options):
        from reviews.models import Review

        creators = {}
        for data in DEMO_CREATORS + NEW_CREATORS:
            user, created = User.objects.get_or_create(
                username=data["username"],
                defaults={"email": data["email"], "full_name": data["full_name"]},
            )
            # Keep creator profile fresh on every run (backfills existing rows).
            user.full_name = data["full_name"]
            user.role = "creator"
            user.bio = data["bio"]
            user.years_experience = data["years_experience"]
            user.is_verified = True
            user.save()
            creators[data["username"]] = user
            if created:
                self.stdout.write(f"Created creator {user.username}")

        reviewers = {}
        for data in DEMO_REVIEWERS:
            user, _ = User.objects.get_or_create(
                username=data["username"],
                defaults={"email": data["email"], "full_name": data["full_name"]},
            )
            reviewers[data["username"]] = user

        now = timezone.now()
        sessions_by_title = {}
        for data in DEMO_SESSIONS:
            creator = creators[data["creator"]]
            session, created = Session.objects.get_or_create(
                title=data["title"],
                creator=creator,
                defaults={
                    "start_time": now + timedelta(days=data["days"], hours=2),
                },
            )
            # Keep rich fields fresh on every run (backfills existing rows).
            for field in RICH_FIELDS:
                setattr(session, field, data.get(field, getattr(session, field)))
            session.image_url = CURATED_IMAGES.get(data["title"], session.image_url)
            session.save()
            sessions_by_title[data["title"]] = session
            if created:
                self.stdout.write(f"Created session {session.title}")

        for title, rows in DEMO_REVIEWS.items():
            session = sessions_by_title.get(title)
            if not session:
                continue
            for username, rating, comment, featured in rows:
                author = reviewers.get(username)
                if not author:
                    continue
                Review.objects.get_or_create(
                    session=session,
                    author=author,
                    defaults={
                        "rating": rating,
                        "comment": comment,
                        "is_featured": featured,
                    },
                )

        # --- bulk catalog ---------------------------------------------------
        generated = build_generated_sessions()
        reviewer_list = list(reviewers.values())
        ratings_cycle = [5, 4, 5, 4, 5]
        created_count = 0
        for gi, data in enumerate(generated):
            creator = creators[data["creator"]]
            session, created = Session.objects.get_or_create(
                title=data["title"],
                creator=creator,
                defaults={"start_time": now + timedelta(days=data["days"], hours=2)},
            )
            for field in RICH_FIELDS:
                setattr(session, field, data.get(field, getattr(session, field)))
            if gi < len(GEN_IMAGES):
                session.image_url = GEN_IMAGES[gi]
            session.save()
            if created:
                created_count += 1

            # Give most (but not all) generated sessions a few reviews, so some
            # listings naturally show the empty "No reviews yet" state.
            if gi % 3 == 2:
                continue
            for n in range(1 + (gi % 3)):  # 1–3 reviews
                author = reviewer_list[(gi + n) % len(reviewer_list)]
                Review.objects.get_or_create(
                    session=session,
                    author=author,
                    defaults={
                        "rating": ratings_cycle[(gi + n) % len(ratings_cycle)],
                        "comment": GEN_REVIEW_COMMENTS[(gi + n) % len(GEN_REVIEW_COMMENTS)],
                        "is_featured": n == 0 and gi % 4 == 0,
                    },
                )

        self.stdout.write(
            self.style.SUCCESS(
                f"Demo data ready. ({created_count} new generated sessions)"
            )
        )
