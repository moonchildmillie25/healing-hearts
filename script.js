let userData = JSON.parse(localStorage.getItem('healingHeartsUser')) || {};
let conversationHistory = [];
let currentActivity = null;
let timerInterval = null;
let groundingStep = 0;
let breathingCycle = 0;
let meditationInterval = null;
let meditationPaused = false;
let currentQuizQuestion = 0;
let quizAnswers = [];
let currentPhotoToRelease = null;
let selectedSleepQuality = 3;
let isRecording = false;
let mediaRecorder = null;
let audioChunks = [];
let voiceTimerInterval = null;
let voiceSeconds = 0;

// Support Style System - 3 modes that change app tone and vibe
const supportStyles = {
  gentle: {
    name: "Gentle",
    emoji: "🌸",
    description: "Soft, nurturing support with warmth and compassion",
    affirmations: [
      "You are worthy of love that doesn't hurt.",
      "Every day, in every way, you are healing.",
      "Your heart knows how to mend itself. Trust the process.",
      "You are not defined by this ending.",
      "Healing isn't linear, and that's okay.",
      "You are enough, exactly as you are today.",
      "Be gentle with yourself. You're doing the best you can.",
      "Your feelings are valid. Let yourself feel them.",
      "This pain is temporary. Your strength is permanent.",
      "You deserve all the love you gave to them.",
      "It's okay to not be okay right now.",
      "Your heart is healing, even when you can't feel it."
    ],
    quotes: [
      "The wound is the place where the Light enters you. — Rumi",
      "What feels like the end is often the beginning.",
      "Stars can't shine without darkness.",
      "This too shall pass.",
      "You won't feel this way forever.",
      "Healing takes time, and asking for help is a courageous step. — Mariska Hargitay",
      "The pain you feel today is the strength you feel tomorrow.",
      "Let yourself grieve. It's part of healing."
    ],
    prompts: [
      "What would you say to comfort a friend going through this?",
      "What small act of self-care could you do right now?",
      "Write about a moment today when you felt a tiny bit better.",
      "What are three things you're grateful for, despite the pain?",
      "Describe a safe, peaceful place in your mind."
    ],
    aiTone: "warm, gentle, and deeply compassionate. Speak softly and validate their feelings. Use nurturing language and remind them healing takes time.",
    chatResponses: [
      "I hear you. This is so hard, and your feelings are completely valid.",
      "You're being so brave by opening up. I'm here for you.",
      "Take your time. There's no rush to heal.",
      "It's okay to feel this way. You're doing better than you think.",
      "Sending you a virtual hug. You're not alone in this."
    ]
  },
  
  motivational: {
    name: "Motivational",
    emoji: "🔥",
    description: "Empowering, action-focused energy to help you rise",
    affirmations: [
      "You're not just surviving this — you're becoming stronger.",
      "Every ending is a new beginning. Your comeback starts now.",
      "You have the power to create the life you deserve.",
      "This breakup is making room for something incredible.",
      "You are the author of your own story. Write a great chapter.",
      "Pain is temporary. Your growth is permanent.",
      "You didn't come this far to only come this far.",
      "Channel this energy into becoming your best self.",
      "The best is yet to come. Believe that.",
      "You're not broken — you're breaking through.",
      "Use this fire to fuel your transformation.",
      "Today you're one step closer to the love you deserve."
    ],
    quotes: [
      "The best revenge is massive success. — Frank Sinatra",
      "What doesn't kill you makes you stronger. — Kelly Clarkson",
      "Turn your wounds into wisdom. — Oprah Winfrey",
      "You can't start the next chapter if you keep re-reading the last one.",
      "Fall seven times, stand up eight. — Japanese Proverb",
      "The comeback is always stronger than the setback.",
      "You were never asking for too much. They just couldn't give enough.",
      "The only way out is through. — Robert Frost"
    ],
    prompts: [
      "What's one goal you can work towards this week?",
      "How can you turn this pain into fuel for growth?",
      "What does your strongest self look like? Describe them.",
      "List 5 things you're going to accomplish this month.",
      "What's something you've always wanted to try? Plan it."
    ],
    aiTone: "empowering, energetic, and action-oriented. Focus on growth, strength, and moving forward. Use motivational language and encourage them to take positive action.",
    chatResponses: [
      "I see you fighting through this. That takes real strength!",
      "This is your transformation story. You're writing it right now.",
      "Every day you're getting stronger, even when it doesn't feel like it.",
      "Let's channel this energy into something amazing.",
      "You're not just going to get through this — you're going to thrive."
    ]
  },
  
  toughLove: {
    name: "Tough Love",
    emoji: "💪",
    description: "Direct, no-nonsense reality checks to push you forward",
    affirmations: [
      "Stop crying over someone who wouldn't cry over you.",
      "They made their choice. Now make yours.",
      "You're better than begging for someone's attention.",
      "Wipe your tears. You have a life to build.",
      "They lost someone who loved them. You lost someone who didn't. Who really lost?",
      "Stop checking their socials. It's over. Move on.",
      "You survived before them. You'll survive after them.",
      "No one is worth losing yourself over. Get up.",
      "The best glow-up starts with self-respect.",
      "They weren't your person. Accept it and level up.",
      "Stop romanticizing the pain. It's time to heal.",
      "You're wasting time on someone who wasted yours."
    ],
    quotes: [
      "The best revenge is a life well-lived.",
      "Don't cry over someone who wouldn't cry over you.",
      "If they wanted to, they would have. — Unknown",
      "Stop setting yourself on fire to keep someone else warm.",
      "Know your worth, then add tax.",
      "You didn't lose them. They lost you.",
      "Delete their number. Block them. Move on.",
      "Pain demands to be felt, but not forever."
    ],
    prompts: [
      "List all the red flags you ignored. Learn from them.",
      "What boundaries will you enforce in your next relationship?",
      "How much time are you wasting thinking about them today?",
      "Write down what you deserve vs. what you accepted.",
      "What's one thing you're going to do TODAY to move forward?"
    ],
    aiTone: "direct, honest, and no-nonsense. Give them real talk without coddling. Push them to take action and stop dwelling. Use straightforward language but still be supportive.",
    chatResponses: [
      "Real talk: you're better off without someone who couldn't see your worth.",
      "I'm not here to tell you what you want to hear. I'm here to help you move on.",
      "Stop waiting for closure. Give it to yourself.",
      "The pity party ends now. Time to level up.",
      "They're not thinking about you this much. Put that energy into yourself."
    ]
  }
};

function getSupportStyle() {
  return userData.supportStyle || 'gentle';
}

function getStyleContent(contentType) {
  const style = getSupportStyle();
  return supportStyles[style][contentType] || supportStyles.gentle[contentType];
}

function getRandomStyleContent(contentType) {
  const content = getStyleContent(contentType);
  return content[Math.floor(Math.random() * content.length)];
}

const defaultAffirmations = [
  "You are worthy of love that doesn't hurt.",
  "Every day, in every way, you are healing.",
  "Your heart knows how to mend itself. Trust the process.",
  "You are not defined by this ending.",
  "Strength isn't pretending it doesn't hurt — it's feeling it anyway.",
  "You're allowed to take up space. You're allowed to feel.",
  "The right person won't make you question your worth.",
  "This chapter is closing so a better one can begin.",
  "You survived 100% of your worst days. You'll survive this too.",
  "Healing isn't linear, and that's okay.",
  "You are enough, exactly as you are today.",
  "Your future self is grateful for the healing you're doing now."
];

const quotes = [
  "The wound is the place where the Light enters you. — Rumi",
  "You can't start the next chapter if you keep re-reading the last one.",
  "Sometimes good things fall apart so better things can fall together. — Marilyn Monroe",
  "The only way out is through. — Robert Frost",
  "What feels like the end is often the beginning.",
  "You deserve someone who chooses you every single day.",
  "Pain is inevitable. Suffering is optional. — Haruki Murakami",
  "The best revenge is massive success. — Frank Sinatra",
  "Stars can't shine without darkness.",
  "This too shall pass.",
  "You won't feel this way forever.",
  "Your worth is not determined by someone else's inability to see it."
];

const expertTips = [
  { tip: "Allow yourself to grieve. Breakups are a real loss, and grief is a healthy response.", author: "Dr. Guy Winch, Psychologist" },
  { tip: "Avoid making major life decisions for at least 6 months after a breakup.", author: "Relationship Therapist" },
  { tip: "Your brain processes romantic rejection like physical pain. Be gentle with yourself.", author: "Neuroscience Research" },
  { tip: "No contact helps your brain 'detox' from the dopamine hits of your ex.", author: "Dr. Helen Fisher" },
  { tip: "Rewrite the narrative. You're not 'broken' — you're in transition.", author: "Esther Perel" },
  { tip: "Focus on your relationship with yourself first. Date yourself.", author: "Therapist Advice" },
  { tip: "It takes about half the length of the relationship to fully heal.", author: "General Guideline" },
  { tip: "Journaling reduces rumination and helps process difficult emotions.", author: "Psychology Research" },
  { tip: "Physical exercise releases endorphins that can combat heartbreak depression.", author: "Mental Health Expert" },
  { tip: "Limit how often you talk about the breakup. Overprocessing can extend pain.", author: "Therapist Recommendation" }
];

const books = [
  { title: "It's Called a Breakup Because It's Broken", author: "Greg Behrendt", desc: "Straight-talking advice with humor" },
  { title: "Getting Past Your Breakup", author: "Susan Elliott", desc: "A step-by-step guide to healing" },
  { title: "Attached", author: "Amir Levine", desc: "Understanding attachment styles" },
  { title: "The Wisdom of a Broken Heart", author: "Susan Piver", desc: "Buddhist approach to heartbreak" },
  { title: "How to Fix a Broken Heart", author: "Dr. Guy Winch", desc: "Science-based healing strategies" },
  { title: "Tiny Beautiful Things", author: "Cheryl Strayed", desc: "Advice on life and love" }
];

const survivorQuotes = [
  { quote: "I thought I'd never stop crying. Now I wake up excited about my life. It gets better. It really does.", name: "Sarah, 28", months: "8 months post-breakup" },
  { quote: "Being cheated on broke me. But it also showed me I was strong enough to walk away from someone I loved. That strength? It was always mine.", name: "Marcus, 32", months: "1 year post-breakup" },
  { quote: "I lost myself completely in that relationship. Finding myself again has been the greatest love story of my life.", name: "Emma, 25", months: "6 months post-breakup" },
  { quote: "The nights were the hardest. I'd wake up reaching for them. Now I sleep peacefully knowing I chose myself.", name: "Jordan, 30", months: "10 months post-breakup" },
  { quote: "I used to think they were my whole world. Turns out, I am my own world — and it's beautiful.", name: "Alex, 27", months: "14 months post-breakup" },
  { quote: "They said I wouldn't find anyone else. I found someone better: myself.", name: "Taylor, 29", months: "9 months post-breakup" },
  { quote: "The person who hurt me the most taught me how much pain I can survive. And that's a superpower.", name: "Jamie, 31", months: "1 year post-breakup" },
  { quote: "I'm not waiting to feel whole again. I already am whole. I always was.", name: "Riley, 26", months: "7 months post-breakup" }
];

const cheatingAffirmations = [
  "Their choices say everything about them, nothing about you.",
  "You deserved honesty. You deserved respect. You deserved better.",
  "Betrayal is their shame to carry, not yours.",
  "You are not naive for trusting. They are wrong for lying.",
  "Your worth was never determined by their faithfulness.",
  "Choosing yourself over someone who chose to hurt you is strength.",
  "The right person would never make you compete for their loyalty.",
  "You survived the worst betrayal. You can survive anything."
];

const lostSelfAffirmations = [
  "Piece by piece, you are becoming yourself again.",
  "You exist fully outside of any relationship.",
  "Your identity was never meant to merge completely with someone else's.",
  "Rediscovering yourself is not selfish — it's necessary.",
  "The person you were before them is still in there, waiting.",
  "You are allowed to change, grow, and become someone new.",
  "Your dreams matter. Your opinions matter. YOU matter.",
  "This is your chance to meet yourself again."
];

const breakupStages = [
  { stage: "Denial", icon: "🌫️", description: "This can't be real. Maybe they'll come back.", tips: ["It's okay to feel shocked", "Don't make major decisions now", "Allow yourself to process slowly"], duration: "Days to weeks" },
  { stage: "Anger", icon: "🔥", description: "How could they do this? This isn't fair.", tips: ["Your anger is valid", "Exercise helps release rage", "Write an unsent letter"], duration: "Weeks to months" },
  { stage: "Bargaining", icon: "🙏", description: "If only I had... Maybe if I change...", tips: ["Don't blame yourself", "Resist urges to reach out", "The relationship ended for real reasons"], duration: "Weeks" },
  { stage: "Depression", icon: "🌧️", description: "I feel empty. Will I ever be happy again?", tips: ["This is the hardest stage", "Lean on support systems", "Small wins count — just get through today"], duration: "Weeks to months" },
  { stage: "Acceptance", icon: "🌅", description: "It happened. I'm going to be okay.", tips: ["You're not betraying your feelings by moving on", "Acceptance isn't forgetting", "You've done the hard work"], duration: "Ongoing" }
];

const spotifyPlaylists = [
  { name: "Heartbreak Healing", mood: "sad", url: "https://open.spotify.com/playlist/37i9dQZF1DX3YSRoSdA634", desc: "Songs for when you need to feel your feelings" },
  { name: "Moving On", mood: "hopeful", url: "https://open.spotify.com/playlist/37i9dQZF1DX1g0iEXLFycr", desc: "Anthems for leaving the past behind" },
  { name: "Confidence Boost", mood: "empowered", url: "https://open.spotify.com/playlist/37i9dQZF1DX6GwdWRQMQpq", desc: "Feel yourself again" },
  { name: "Self-Love Sunday", mood: "peaceful", url: "https://open.spotify.com/playlist/37i9dQZF1DX3UrPy5grciZ", desc: "Gentle songs for self-compassion" },
  { name: "Rage & Release", mood: "angry", url: "https://open.spotify.com/playlist/37i9dQZF1DWTlzJXLgWeYe", desc: "Let it all out" },
  { name: "Late Night Thoughts", mood: "reflective", url: "https://open.spotify.com/playlist/37i9dQZF1DX2pSTOxoPbx9", desc: "For those sleepless nights" }
];

const rediscoverySuggestions = [
  { title: "What did you love before them?", prompt: "List 5 hobbies or interests you had before the relationship.", icon: "🎨" },
  { title: "Your values check-in", prompt: "What are 3 things that matter most to YOU (not to please anyone)?", icon: "💎" },
  { title: "Dream without limits", prompt: "If no one could judge you, what would you try?", icon: "✨" },
  { title: "Your style, your way", prompt: "Is there something you stopped wearing/doing because of them?", icon: "👗" },
  { title: "Friend reconnection", prompt: "Who did you drift from? Reach out to one person today.", icon: "👋" },
  { title: "Solo date planning", prompt: "Plan a date just for yourself this week.", icon: "🎬" },
  { title: "Boundary list", prompt: "What will you never accept in a relationship again?", icon: "🚧" },
  { title: "Future self letter", prompt: "Write to yourself 1 year from now. What do you hope to tell them?", icon: "💌" }
];

const podcasts = [
  { title: "Breakup Boost", host: "Trina Leckie", desc: "Weekly episodes on moving forward" },
  { title: "Where Should We Begin?", host: "Esther Perel", desc: "Real therapy sessions on relationships" },
  { title: "Relationship Advice", host: "Chase Kosterlitz", desc: "Dating and relationship insights" },
  { title: "The Baggage Reclaim Sessions", host: "Natalie Lue", desc: "Self-esteem and boundaries" },
  { title: "Dear Sugars", host: "Cheryl Strayed", desc: "Heart-to-heart life advice" }
];

const distractions = [
  "Call a friend you haven't talked to in a while",
  "Take a walk around the block — no phone",
  "Make yourself a cup of tea and drink it slowly",
  "Do 20 jumping jacks to release the energy",
  "Watch a funny YouTube video",
  "Organize one drawer or shelf",
  "Write down 5 things you're grateful for",
  "Put on your favorite song and dance",
  "Take a shower and focus on the sensations",
  "Doodle or color for 10 minutes",
  "Go outside and name 5 things you see",
  "Text someone you love and tell them why",
  "Do a 5-minute stretching routine",
  "Look at photos of your pet or someone else's pet",
  "Plan your next meal in detail",
  "Write a letter to your future self",
  "Reorganize your phone apps",
  "Do a face mask or skincare routine",
  "Listen to a podcast episode",
  "Clean your bathroom sink"
];

const dailyChallenges = [
  "Take a 15-minute walk outside without your phone",
  "Write down 5 things you're grateful for",
  "Reach out to a friend you haven't talked to in a while",
  "Do something creative: draw, write, or make music",
  "Take a relaxing bath or shower and focus on self-care",
  "Cook yourself a nourishing meal",
  "Declutter one small area of your space",
  "Watch a comedy and let yourself laugh",
  "Write a love letter to yourself",
  "Try a new workout or stretch for 20 minutes",
  "Listen to an entire album without distractions",
  "Go to bed 30 minutes earlier tonight",
  "Say no to something you don't want to do",
  "Compliment yourself in the mirror",
  "Spend 10 minutes in nature, just observing",
  "Call someone who makes you feel good",
  "Journal about your wins this week, no matter how small",
  "Unfollow accounts that don't make you feel good",
  "Try a new coffee shop or restaurant alone",
  "Dance to your favorite song like nobody's watching"
];

const selfCareReminders = [
  { icon: "💧", text: "Have you had water today? Your body needs hydration." },
  { icon: "🍎", text: "When did you last eat? Nourish yourself." },
  { icon: "🌳", text: "Have you been outside today? Fresh air helps." },
  { icon: "🛏️", text: "How's your sleep been? Rest is healing." },
  { icon: "🤗", text: "Have you talked to anyone today? Connection matters." },
  { icon: "🏃", text: "Have you moved your body? Even stretching helps." }
];

const activities = {
  'unsent-letter': {
    title: '✉️ Unsent Letter',
    instructions: 'Write a letter to your ex that you\'ll never send. Say everything you wish you could say — the anger, the sadness, the questions, the gratitude. Let it all out. This is for you, not them.'
  },
  'gratitude': {
    title: '🙏 Gratitude List',
    instructions: 'Even in darkness, there is light. List 10 things you\'re grateful for right now — they can be as small as "my morning coffee" or as big as "my support system." Focus on what remains, not what\'s gone.'
  },
  'release': {
    title: '🎈 Release Ritual',
    instructions: 'Write down everything you need to let go of — expectations, memories, resentments, hopes for reconciliation. Imagine each word floating away like a balloon into the sky. When you save this, visualize releasing it all.'
  },
  'self-love': {
    title: '💝 Self-Love Letter',
    instructions: 'Write a love letter to yourself from the perspective of someone who adores you completely. What would they say about your strength? Your beauty? Your resilience? Be your own biggest fan today.'
  },
  'lessons': {
    title: '📚 Lessons Learned',
    instructions: 'Every relationship teaches us something. What did this one teach you about yourself, about love, about what you need? Turn your pain into wisdom that will serve your future.'
  },
  'future-vision': {
    title: '🌟 Future Vision',
    instructions: 'Close your eyes and imagine yourself one year from now, fully healed. What does your life look like? How do you feel? What are you doing? Write about this future version of yourself in detail.'
  }
};

const milestones = [
  { days: 1, name: 'First Step', icon: '👣', description: 'You started your healing journey' },
  { days: 3, name: 'Three Day Warrior', icon: '⚔️', description: '3 days of choosing yourself' },
  { days: 7, name: 'One Week Strong', icon: '💪', description: 'A full week of healing' },
  { days: 14, name: 'Two Week Triumph', icon: '🌟', description: '14 days of growth' },
  { days: 30, name: 'Monthly Milestone', icon: '🏆', description: 'One month of healing' },
  { days: 60, name: 'Sixty Days of Strength', icon: '🔥', description: 'Two months of progress' },
  { days: 90, name: 'Quarter Year Champion', icon: '👑', description: '90 days of transformation' },
  { days: 180, name: 'Half Year Hero', icon: '🦋', description: 'Six months of becoming' },
  { days: 365, name: 'One Year Warrior', icon: '🎖️', description: 'A full year of healing' }
];

const badges = [
  { id: 'first-journal', name: 'First Words', icon: '✍️', condition: () => getJournalCount() >= 1 },
  { id: 'journal-streak', name: 'Journal Pro', icon: '📚', condition: () => getJournalCount() >= 10 },
  { id: 'first-chat', name: 'Opening Up', icon: '💬', condition: () => getChatCount() >= 1 },
  { id: 'chat-friend', name: 'Chat Buddy', icon: '🤝', condition: () => getChatCount() >= 20 },
  { id: 'mood-tracker', name: 'Self-Aware', icon: '📊', condition: () => getMoodCount() >= 7 },
  { id: 'activity-starter', name: 'Taking Action', icon: '🎯', condition: () => getActivityCount() >= 1 },
  { id: 'activity-master', name: 'Healing Hero', icon: '🌈', condition: () => getActivityCount() >= 5 },
  { id: 'week-one', name: 'Week One', icon: '🌱', condition: () => getDaysSinceStart() >= 7 },
  { id: 'month-one', name: 'Month Strong', icon: '🌻', condition: () => getDaysSinceStart() >= 30 },
  { id: 'streak-7', name: '7-Day Streak', icon: '🔥', condition: () => getStreak() >= 7 },
  { id: 'no-contact-7', name: 'NC Warrior', icon: '📵', condition: () => getNoContactDays() >= 7 },
  { id: 'self-care-complete', name: 'Self-Care Star', icon: '💆', condition: () => getSelfCareComplete() }
];

const meditations = {
  'heartbreak': {
    title: '💔 Healing Heartbreak',
    duration: 300,
    steps: [
      { time: 0, text: "Find a comfortable position. Close your eyes." },
      { time: 15, text: "Take a deep breath in... and slowly release." },
      { time: 30, text: "Place your hand over your heart. Feel its rhythm." },
      { time: 60, text: "Your heart has been through so much. Acknowledge its pain." },
      { time: 90, text: "With each breath, imagine sending love to your heart." },
      { time: 120, text: "You are not broken. You are healing." },
      { time: 150, text: "Picture your heart surrounded by a warm, golden light." },
      { time: 180, text: "This light is your own love, protecting and healing you." },
      { time: 210, text: "You deserve gentleness. You deserve patience." },
      { time: 240, text: "Take another deep breath. You are exactly where you need to be." },
      { time: 270, text: "Slowly bring your awareness back to the room." },
      { time: 290, text: "When you're ready, gently open your eyes." }
    ]
  },
  'letting-go': {
    title: '🎈 Letting Go',
    duration: 420,
    steps: [
      { time: 0, text: "Settle into a comfortable position. Close your eyes." },
      { time: 20, text: "Take three deep breaths. In... and out." },
      { time: 50, text: "Imagine you're holding a red balloon." },
      { time: 80, text: "This balloon holds everything you need to release." },
      { time: 110, text: "The expectations. The 'what ifs.' The pain." },
      { time: 150, text: "Feel the weight of holding onto these things." },
      { time: 190, text: "Now, slowly, begin to loosen your grip." },
      { time: 230, text: "Watch as the balloon starts to float upward." },
      { time: 270, text: "It rises higher and higher into the sky." },
      { time: 310, text: "As it floats away, feel yourself getting lighter." },
      { time: 350, text: "You don't need to hold onto what's already gone." },
      { time: 390, text: "Take a deep breath. You are free." },
      { time: 410, text: "Gently open your eyes when ready." }
    ]
  },
  'self-compassion': {
    title: '💕 Self-Compassion',
    duration: 300,
    steps: [
      { time: 0, text: "Close your eyes and take a settling breath." },
      { time: 20, text: "Think of someone you love deeply." },
      { time: 40, text: "Notice how you feel when you think of them." },
      { time: 70, text: "Now, direct that same love toward yourself." },
      { time: 100, text: "Say silently: 'May I be kind to myself.'" },
      { time: 130, text: "'May I give myself the compassion I need.'" },
      { time: 160, text: "'May I accept myself as I am.'" },
      { time: 190, text: "You deserve the same love you give others." },
      { time: 220, text: "Breathe in self-compassion. Breathe out self-criticism." },
      { time: 250, text: "You are worthy of your own love." },
      { time: 280, text: "Slowly return to the present moment." }
    ]
  },
  'sleep': {
    title: '🌙 Sleep & Release',
    duration: 600,
    steps: [
      { time: 0, text: "Lie down comfortably. Let your body sink into the bed." },
      { time: 30, text: "Close your eyes. Take a slow, deep breath." },
      { time: 60, text: "Release any tension in your forehead... your jaw..." },
      { time: 100, text: "Let your shoulders drop. Relax your hands." },
      { time: 140, text: "Today is over. You did your best." },
      { time: 180, text: "Any worries from today can wait until tomorrow." },
      { time: 220, text: "Imagine yourself in a peaceful garden at dusk." },
      { time: 260, text: "The air is warm. Fireflies begin to glow." },
      { time: 300, text: "You are safe here. You are protected." },
      { time: 350, text: "Let the heaviness of the day melt away." },
      { time: 400, text: "Your only job now is to rest." },
      { time: 450, text: "Breathe slowly... deeply... peacefully..." },
      { time: 500, text: "You are drifting into gentle, healing sleep." },
      { time: 550, text: "Rest now. Tomorrow is a new beginning." }
    ]
  },
  'morning': {
    title: '🌅 Morning Strength',
    duration: 300,
    steps: [
      { time: 0, text: "Good morning. Take a moment before you start your day." },
      { time: 20, text: "Take a deep breath. Feel yourself waking up." },
      { time: 45, text: "Today is a new day. A fresh start." },
      { time: 70, text: "Set an intention: 'Today, I choose myself.'" },
      { time: 100, text: "You are stronger than you were yesterday." },
      { time: 130, text: "Whatever comes today, you can handle it." },
      { time: 160, text: "Breathe in courage. Breathe out fear." },
      { time: 190, text: "You are not alone in this journey." },
      { time: 220, text: "Today, look for one small moment of joy." },
      { time: 250, text: "You've got this. Now go make today count." },
      { time: 280, text: "Open your eyes. Step into your strength." }
    ]
  },
  'anxiety': {
    title: '🌊 Calm Anxiety',
    duration: 360,
    steps: [
      { time: 0, text: "Stop. Breathe. You're going to be okay." },
      { time: 20, text: "Put your hand on your chest. Feel your heartbeat." },
      { time: 45, text: "Breathe in for 4 counts... 1, 2, 3, 4." },
      { time: 60, text: "Hold for 4 counts... 1, 2, 3, 4." },
      { time: 75, text: "Breathe out for 6 counts... 1, 2, 3, 4, 5, 6." },
      { time: 95, text: "Again. Breathe in... 1, 2, 3, 4." },
      { time: 110, text: "Hold... 1, 2, 3, 4." },
      { time: 125, text: "Breathe out slowly... 1, 2, 3, 4, 5, 6." },
      { time: 150, text: "You are safe in this moment." },
      { time: 180, text: "The anxiety will pass. It always does." },
      { time: 210, text: "Ground yourself. Feel your feet on the floor." },
      { time: 240, text: "Name 3 things you can see right now." },
      { time: 270, text: "You are here. You are present. You are okay." },
      { time: 300, text: "Take one more deep breath." },
      { time: 330, text: "You've calmed the storm. Well done." }
    ]
  }
};

const playlists = {
  'sad': {
    title: '😢 Feel the Feels',
    songs: [
      { title: "Someone Like You", artist: "Adele" },
      { title: "All Too Well (10 Minute Version)", artist: "Taylor Swift" },
      { title: "The Night We Met", artist: "Lord Huron" },
      { title: "Skinny Love", artist: "Bon Iver" },
      { title: "Stay", artist: "Rihanna ft. Mikky Ekko" },
      { title: "Back to December", artist: "Taylor Swift" },
      { title: "Fix You", artist: "Coldplay" },
      { title: "Gravity", artist: "Sara Bareilles" }
    ]
  },
  'angry': {
    title: '😤 Let It Out',
    songs: [
      { title: "Since U Been Gone", artist: "Kelly Clarkson" },
      { title: "You Oughta Know", artist: "Alanis Morissette" },
      { title: "Picture to Burn", artist: "Taylor Swift" },
      { title: "Cry Me a River", artist: "Justin Timberlake" },
      { title: "I Will Survive", artist: "Gloria Gaynor" },
      { title: "So What", artist: "P!nk" },
      { title: "Before He Cheats", artist: "Carrie Underwood" },
      { title: "Fighter", artist: "Christina Aguilera" }
    ]
  },
  'empowered': {
    title: '💪 Rising Strong',
    songs: [
      { title: "Stronger", artist: "Kelly Clarkson" },
      { title: "Shake It Off", artist: "Taylor Swift" },
      { title: "Survivor", artist: "Destiny's Child" },
      { title: "Good as Hell", artist: "Lizzo" },
      { title: "Titanium", artist: "David Guetta ft. Sia" },
      { title: "Roar", artist: "Katy Perry" },
      { title: "thank u, next", artist: "Ariana Grande" },
      { title: "Confident", artist: "Demi Lovato" }
    ]
  },
  'peaceful': {
    title: '🕊️ Finding Peace',
    songs: [
      { title: "Weightless", artist: "Marconi Union" },
      { title: "Clair de Lune", artist: "Debussy" },
      { title: "River Flows In You", artist: "Yiruma" },
      { title: "Breathe Me", artist: "Sia" },
      { title: "The Sound of Silence", artist: "Disturbed" },
      { title: "Gymnopedie No. 1", artist: "Erik Satie" },
      { title: "Holocene", artist: "Bon Iver" },
      { title: "Saturn", artist: "Sleeping At Last" }
    ]
  }
};

const quizQuestions = [
  {
    question: "When you think about your ex, how do you feel?",
    options: [
      { text: "Intense pain, like it just happened", score: 1 },
      { text: "Sad, but it's getting easier", score: 2 },
      { text: "Mostly neutral, with occasional sadness", score: 3 },
      { text: "At peace, I've processed most of it", score: 4 }
    ]
  },
  {
    question: "How often do you check your ex's social media?",
    options: [
      { text: "Multiple times a day", score: 1 },
      { text: "Once a day or every few days", score: 2 },
      { text: "Occasionally, when I'm feeling weak", score: 3 },
      { text: "Rarely or never", score: 4 }
    ]
  },
  {
    question: "When you imagine being in a new relationship, you feel...",
    options: [
      { text: "Terrified and not ready at all", score: 1 },
      { text: "Anxious but curious", score: 2 },
      { text: "Open to it when the right person comes", score: 3 },
      { text: "Excited and ready to meet someone", score: 4 }
    ]
  },
  {
    question: "Have you identified what you learned from the relationship?",
    options: [
      { text: "I'm still too hurt to reflect", score: 1 },
      { text: "I'm starting to see some lessons", score: 2 },
      { text: "Yes, I understand what I need differently", score: 3 },
      { text: "Absolutely, and I've grown from it", score: 4 }
    ]
  },
  {
    question: "How do you feel about being alone right now?",
    options: [
      { text: "Lonely and desperate to fill the void", score: 1 },
      { text: "Uncomfortable but managing", score: 2 },
      { text: "Learning to enjoy my own company", score: 3 },
      { text: "I genuinely enjoy being single", score: 4 }
    ]
  },
  {
    question: "Do you still hope for reconciliation?",
    options: [
      { text: "Yes, I think about it constantly", score: 1 },
      { text: "Sometimes, but less than before", score: 2 },
      { text: "Rarely, I know it's not meant to be", score: 3 },
      { text: "No, I've fully accepted the ending", score: 4 }
    ]
  },
  {
    question: "Are you taking care of yourself (sleep, eating, exercise)?",
    options: [
      { text: "Struggling with basic self-care", score: 1 },
      { text: "Some good days, some bad days", score: 2 },
      { text: "Mostly consistent with self-care", score: 3 },
      { text: "Yes, I'm prioritizing my wellbeing", score: 4 }
    ]
  },
  {
    question: "How would you describe your self-esteem right now?",
    options: [
      { text: "Shattered, I feel worthless", score: 1 },
      { text: "Low, but slowly rebuilding", score: 2 },
      { text: "Recovering, I know my worth intellectually", score: 3 },
      { text: "Strong, I know I deserve love", score: 4 }
    ]
  },
  {
    question: "When you see happy couples, you feel...",
    options: [
      { text: "Bitter and jealous", score: 1 },
      { text: "A pang of sadness", score: 2 },
      { text: "Mostly neutral, maybe a little wistful", score: 3 },
      { text: "Happy for them, hopeful for myself", score: 4 }
    ]
  },
  {
    question: "Why do you want to date again?",
    options: [
      { text: "To stop feeling lonely", score: 1 },
      { text: "To prove I can move on", score: 2 },
      { text: "I'm curious about new connections", score: 3 },
      { text: "I have love to give and I'm ready to share it", score: 4 }
    ]
  }
];

let currentUser = null;
let isAuthenticated = false;

async function init() {
  applyTheme();
  restoreMoodTheme();
  restoreAmbientTheme();
  AudioManager.init();
  updateSoundToggleUI();
  
  await checkAuthStatus();
  
  if (userData.name && userData.startDate) {
    showMainScreen();
  }
}

function restoreMoodTheme() {
  const savedMood = localStorage.getItem('currentMoodTheme');
  if (savedMood) {
    document.body.classList.add(`mood-${savedMood}`);
  }
}

async function checkAuthStatus() {
  try {
    const response = await fetch('/api/auth/check');
    const data = await response.json();
    
    if (data.authenticated) {
      isAuthenticated = true;
      currentUser = data.user;
      updateAuthUI(true);
      
      await syncDataWithServer();
    } else {
      isAuthenticated = false;
      currentUser = null;
      updateAuthUI(false);
    }
  } catch (error) {
    console.error('Auth check failed:', error);
    isAuthenticated = false;
    updateAuthUI(false);
  }
}

function updateAuthUI(loggedIn) {
  const loginBtn = document.getElementById('login-btn');
  const userProfile = document.getElementById('user-profile');
  const userAvatar = document.getElementById('user-avatar');
  
  if (!loginBtn || !userProfile) return;
  
  if (loggedIn && currentUser) {
    loginBtn.style.display = 'none';
    userProfile.style.display = 'flex';
    
    if (currentUser.profileImageUrl) {
      userAvatar.src = currentUser.profileImageUrl;
      userAvatar.style.display = 'block';
    } else {
      userAvatar.style.display = 'none';
    }
  } else {
    loginBtn.style.display = 'block';
    userProfile.style.display = 'none';
  }
  
  // Update AI coach notice
  updateAICoachNotice();
}

async function syncDataWithServer() {
  if (!isAuthenticated) return;
  
  try {
    const response = await fetch('/api/healing-data');
    if (!response.ok) {
      console.error('Failed to fetch server data');
      return;
    }
    
    const serverData = await response.json();
    
    if (serverData && serverData.userData && serverData.userData.name) {
      const serverUpdated = serverData.updatedAt ? new Date(serverData.updatedAt) : new Date(0);
      const localUpdated = localStorage.getItem('healingLastUpdated') ? 
        new Date(localStorage.getItem('healingLastUpdated')) : new Date(0);
      
      if (serverUpdated > localUpdated) {
        userData = serverData.userData;
        localStorage.setItem('healingHeartsUser', JSON.stringify(userData));
        
        if (serverData.moods) localStorage.setItem('healingMoods', JSON.stringify(serverData.moods));
        if (serverData.journalEntries) localStorage.setItem('healingJournal', JSON.stringify(serverData.journalEntries));
        if (serverData.sleepLogs) localStorage.setItem('sleepLogs', JSON.stringify(serverData.sleepLogs));
        if (serverData.gratitudes) localStorage.setItem('healingGratitudes', JSON.stringify(serverData.gratitudes));
        if (serverData.visions) localStorage.setItem('healingVisions', JSON.stringify(serverData.visions));
        if (serverData.weeklyReflections) localStorage.setItem('weeklyReflections', JSON.stringify(serverData.weeklyReflections));
        if (serverData.timeCapsules) localStorage.setItem('timeCapsules', JSON.stringify(serverData.timeCapsules));
        if (serverData.supportCircle) localStorage.setItem('supportCircle', JSON.stringify(serverData.supportCircle));
        if (serverData.holidayDates) localStorage.setItem('holidayDates', JSON.stringify(serverData.holidayDates));
        
        console.log('Loaded data from server');
      } else if (userData.name) {
        await saveDataToServer();
        console.log('Uploaded local data to server');
      }
    } else if (userData.name) {
      await saveDataToServer();
      console.log('First time sync - uploaded local data');
    }
  } catch (error) {
    console.error('Sync failed:', error);
  }
}

async function saveDataToServer() {
  if (!isAuthenticated) return;
  
  try {
    const data = {
      userData: userData,
      moods: JSON.parse(localStorage.getItem('healingMoods') || '[]'),
      journalEntries: JSON.parse(localStorage.getItem('healingJournal') || '[]'),
      voiceEntries: JSON.parse(localStorage.getItem('healingVoiceJournal') || '[]'),
      sleepLogs: JSON.parse(localStorage.getItem('sleepLogs') || '[]'),
      gratitudes: JSON.parse(localStorage.getItem('healingGratitudes') || '[]'),
      visions: JSON.parse(localStorage.getItem('healingVisions') || '[]'),
      weeklyReflections: JSON.parse(localStorage.getItem('weeklyReflections') || '[]'),
      timeCapsules: JSON.parse(localStorage.getItem('timeCapsules') || '[]'),
      communityPosts: JSON.parse(localStorage.getItem('communityPosts') || '[]'),
      supportCircle: JSON.parse(localStorage.getItem('supportCircle') || '[]'),
      holidayDates: JSON.parse(localStorage.getItem('holidayDates') || '[]'),
      beforeAfter: JSON.parse(localStorage.getItem('beforeAfterReflections') || '[]'),
      triggers: JSON.parse(localStorage.getItem('healingTriggers') || '[]')
    };
    
    await fetch('/api/healing-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    localStorage.setItem('healingLastUpdated', new Date().toISOString());
  } catch (error) {
    console.error('Save to server failed:', error);
  }
}

function applyTheme() {
  const darkMode = localStorage.getItem('darkMode') === 'true';
  if (darkMode) {
    document.body.classList.add('dark-mode');
    document.getElementById('theme-btn').textContent = '☀️';
  }
}

function toggleDarkMode() {
  const isDark = document.body.classList.toggle('dark-mode');
  localStorage.setItem('darkMode', isDark);
  document.getElementById('theme-btn').textContent = isDark ? '☀️' : '🌙';
}

function nextOnboardingStep(step) {
  if (step === 2) {
    const name = document.getElementById('user-name').value.trim();
    if (!name) {
      alert('Please enter your name');
      return;
    }
    userData.name = name;
  } else if (step === 3) {
    const breakupDate = document.getElementById('breakup-date').value;
    if (breakupDate) {
      userData.breakupDate = breakupDate;
    }
  } else if (step === 7) {
    saveCompanionFromOnboarding();
    document.getElementById('welcome-message').textContent = `Welcome, ${userData.name}`;
  }
  
  document.querySelectorAll('.onboarding-step').forEach(s => s.classList.remove('active'));
  document.getElementById(`step-${step}`).classList.add('active');
}

function prevOnboardingStep(step) {
  document.querySelectorAll('.onboarding-step').forEach(s => s.classList.remove('active'));
  document.getElementById(`step-${step}`).classList.add('active');
}

function selectBreakupType(type) {
  userData.breakupType = type;
  document.querySelectorAll('.type-option').forEach(btn => btn.classList.remove('selected'));
  document.querySelector(`[data-type="${type}"]`).classList.add('selected');
  
  setTimeout(() => nextOnboardingStep(4), 300);
}

function selectInitialMood(mood) {
  userData.initialMood = mood;
  document.querySelectorAll('.mood-option').forEach(btn => btn.classList.remove('selected'));
  document.querySelector(`[data-mood="${mood}"]`).classList.add('selected');
  
  setTimeout(() => nextOnboardingStep(5), 300);
}

function selectSupportStyle(style) {
  userData.supportStyle = style;
  document.querySelectorAll('.style-option').forEach(btn => btn.classList.remove('selected'));
  document.querySelector(`[data-style="${style}"]`).classList.add('selected');
  
  applySupportStyleClass();
  
  setTimeout(() => {
    nextOnboardingStep(6);
    initCompanionPreview();
  }, 300);
}

function initCompanionPreview() {
  const preview = document.getElementById('companion-preview');
  const gender = characterGender || 'female';
  if (preview) {
    preview.innerHTML = `<div class="companion-preview-heart">${gender === 'female' ? '💗' : '💙'}</div>`;
  }
}

function selectCompanionStyle(gender) {
  characterGender = gender;
  localStorage.setItem('characterGender', characterGender);
  document.querySelectorAll('.companion-style-option').forEach(btn => btn.classList.remove('active'));
  document.querySelector(`.companion-style-option[data-gender="${gender}"]`).classList.add('active');
  initCompanionPreview();
}

function saveCompanionFromOnboarding() {
  const nameInput = document.getElementById('companion-name-onboarding');
  if (nameInput && nameInput.value.trim()) {
    companionName = nameInput.value.trim();
    localStorage.setItem('companionName', companionName);
  }
  if (!characterGender) {
    characterGender = 'female';
  }
  localStorage.setItem('characterGender', characterGender);
}

function applySupportStyleClass() {
  document.body.classList.remove('style-gentle', 'style-motivational', 'style-toughLove');
  const style = getSupportStyle();
  document.body.classList.add(`style-${style}`);
}

function completeOnboarding() {
  if (userData.breakupDate) {
    userData.startDate = new Date(userData.breakupDate).toISOString();
  } else {
    userData.startDate = new Date().toISOString();
  }
  localStorage.setItem('healingHeartsUser', JSON.stringify(userData));
  
  if (userData.initialMood) {
    try {
      saveInitialMood(getMoodEmoji(userData.initialMood), userData.initialMood);
    } catch (e) {
      console.log('Mood save skipped');
    }
  }
  
  showMainScreen();
}

function saveInitialMood(emoji, label) {
  const moods = JSON.parse(localStorage.getItem('healingMoods') || '[]');
  moods.push({
    emoji,
    label,
    note: '',
    time: new Date().toISOString()
  });
  localStorage.setItem('healingMoods', JSON.stringify(moods));
}

function getMoodEmoji(mood) {
  const moodMap = {
    'devastated': '💔',
    'sad': '😢',
    'angry': '😤',
    'confused': '😕',
    'numb': '😶',
    'hopeful': '🌱'
  };
  return moodMap[mood] || '😢';
}

function showMainScreen() {
  document.getElementById('onboarding-screen').style.display = 'none';
  document.getElementById('main-screen').style.display = 'block';
  
  applySupportStyleClass();
  document.getElementById('greeting').textContent = `Hi, ${userData.name}`;
  updateDayCounter();
  updateStreak();
  newAffirmation();
  newQuote();
  newExpertTip();
  newSurvivorQuote();
  loadDailyChallenge();
  loadHealingSpark();
  loadJournal();
  loadMoods();
  updateProgress();
  updateNoContactCounter();
  checkTimeCapsules();
  checkSelfCareReminder();
  loadSelfCareChecklist();
  loadResources();
  loadBreakupStages();
  loadSpotifyPlaylists();
  loadMoodTrendChart();
  loadPersonalizedContent();
  initCompanion();
  showPage('home');
}

function updateDayCounter() {
  const days = getDaysSinceStart();
  document.getElementById('day-counter').textContent = `Day ${days}`;
}

function getDaysSinceStart() {
  const dateToUse = userData.breakupDate || userData.startDate;
  if (!dateToUse) return 1;
  
  const startParts = dateToUse.split('-');
  const startDate = new Date(startParts[0], startParts[1] - 1, startParts[2]);
  startDate.setHours(0, 0, 0, 0);
  
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  
  const diff = Math.floor((now - startDate) / (1000 * 60 * 60 * 24));
  return Math.max(1, diff + 1);
}

function getStreak() {
  return parseInt(localStorage.getItem('healingStreak') || '0');
}

function updateStreak() {
  const lastCheckin = localStorage.getItem('lastCheckinDate');
  const today = new Date().toDateString();
  
  let streak = getStreak();
  
  if (lastCheckin !== today) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (lastCheckin === yesterday.toDateString()) {
      streak++;
    } else if (lastCheckin !== today) {
      streak = 1;
    }
    
    localStorage.setItem('healingStreak', streak);
    localStorage.setItem('lastCheckinDate', today);
  }
  
  document.getElementById('streak-count').textContent = `${streak} Day Streak`;
  if (document.getElementById('streak-stat')) {
    document.getElementById('streak-stat').textContent = streak;
  }
}

function checkSelfCareReminder() {
  const lastReminder = localStorage.getItem('lastSelfCareReminder');
  const now = Date.now();
  
  if (!lastReminder || (now - parseInt(lastReminder)) > 3600000) {
    const reminder = selfCareReminders[Math.floor(Math.random() * selfCareReminders.length)];
    document.getElementById('reminder-text').textContent = reminder.text;
    document.querySelector('.self-care-reminder .reminder-icon').textContent = reminder.icon;
    document.getElementById('self-care-reminder').style.display = 'flex';
  }
}

function dismissReminder() {
  localStorage.setItem('lastSelfCareReminder', Date.now().toString());
  document.getElementById('self-care-reminder').style.display = 'none';
}

function loadDailyChallenge() {
  const today = new Date().toDateString();
  const savedChallenge = localStorage.getItem('dailyChallengeDate');
  
  let challengeIndex;
  if (savedChallenge === today) {
    challengeIndex = parseInt(localStorage.getItem('dailyChallengeIndex') || '0');
  } else {
    challengeIndex = Math.floor(Math.random() * dailyChallenges.length);
    localStorage.setItem('dailyChallengeDate', today);
    localStorage.setItem('dailyChallengeIndex', challengeIndex);
    localStorage.removeItem('challengeCompleted');
  }
  
  document.getElementById('daily-challenge-text').textContent = dailyChallenges[challengeIndex];
  
  if (localStorage.getItem('challengeCompleted') === today) {
    document.getElementById('challenge-btn').textContent = '✓ Completed!';
    document.getElementById('challenge-btn').classList.add('completed');
  }
}

const healingSparkData = {
  affirmations: [
    "Today, I choose to release what no longer serves me.",
    "My heart is healing a little more each day.",
    "I am worthy of love and happiness.",
    "This pain is temporary; my strength is permanent.",
    "I am becoming the person I was always meant to be.",
    "Every ending opens a door to a new beginning.",
    "I trust the journey, even when I don't understand it.",
    "I am enough, exactly as I am.",
    "My best days are still ahead of me.",
    "I am learning, growing, and healing."
  ],
  rituals: [
    "Take 3 deep breaths and say 'I am healing' with each exhale.",
    "Write down one thing you're grateful for right now.",
    "Look in a mirror and give yourself a genuine compliment.",
    "Step outside for 2 minutes and feel the air on your skin.",
    "Stretch your arms up high and release any tension.",
    "Send a kind message to someone who matters to you.",
    "Put your hand on your heart and feel its steady beat.",
    "Close your eyes and picture your happiest memory for 30 seconds.",
    "Drink a full glass of water mindfully.",
    "Name 3 things in your current view that bring you peace."
  ]
};

function loadHealingSpark() {
  const today = new Date().toDateString();
  const savedSparkDate = localStorage.getItem('healingSparkDate');
  
  let affirmationIndex, ritualIndex;
  
  if (savedSparkDate === today) {
    affirmationIndex = parseInt(localStorage.getItem('sparkAffirmationIndex') || '0');
    ritualIndex = parseInt(localStorage.getItem('sparkRitualIndex') || '0');
  } else {
    affirmationIndex = Math.floor(Math.random() * healingSparkData.affirmations.length);
    ritualIndex = Math.floor(Math.random() * healingSparkData.rituals.length);
    localStorage.setItem('healingSparkDate', today);
    localStorage.setItem('sparkAffirmationIndex', affirmationIndex);
    localStorage.setItem('sparkRitualIndex', ritualIndex);
    localStorage.removeItem('sparkCompleted');
  }
  
  document.getElementById('spark-affirmation').textContent = healingSparkData.affirmations[affirmationIndex];
  document.getElementById('ritual-text').textContent = healingSparkData.rituals[ritualIndex];
  
  const sparkBtn = document.getElementById('spark-btn');
  if (localStorage.getItem('sparkCompleted') === today) {
    sparkBtn.innerHTML = '<span>Completed!</span><span class="spark-check">✓</span>';
    sparkBtn.classList.add('completed');
  }
}

function completeHealingSpark() {
  const today = new Date().toDateString();
  localStorage.setItem('sparkCompleted', today);
  
  const sparkBtn = document.getElementById('spark-btn');
  sparkBtn.innerHTML = '<span>Completed!</span><span class="spark-check">✓</span>';
  sparkBtn.classList.add('completed');
  
  triggerConfetti();
  playSound('celebrate');
  updateProgress();
  showEmpathyNote('completed their daily healing spark ritual');
}

function completeChallenge() {
  const today = new Date().toDateString();
  localStorage.setItem('challengeCompleted', today);
  document.getElementById('challenge-btn').textContent = '✓ Completed!';
  document.getElementById('challenge-btn').classList.add('completed');
  
  let completedCount = parseInt(localStorage.getItem('challengesCompleted') || '0');
  localStorage.setItem('challengesCompleted', completedCount + 1);
  
  triggerConfetti();
  playSound('celebrate');
  showEmpathyNote('completed today\'s daily challenge');
}

function showPage(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const pageEl = document.getElementById(page);
  pageEl.classList.add('active');
  
  // Animate cards on page switch
  setTimeout(() => {
    const cards = pageEl.querySelectorAll('.card, .activity-card, .mood-btn, .badge-item');
    cards.forEach((card, index) => {
      card.style.opacity = '0';
      card.style.animation = 'none';
      void card.offsetWidth; // Trigger reflow
      card.style.animation = `slideUp 0.4s ease forwards`;
      card.style.animationDelay = `${Math.min(index * 0.05, 0.5)}s`;
      
      // Clean up inline styles after animation
      const cleanup = () => {
        card.style.opacity = '';
        card.style.animation = '';
        card.style.animationDelay = '';
        card.removeEventListener('animationend', cleanup);
      };
      card.addEventListener('animationend', cleanup);
    });
  }, 50);
  
  document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
  const navBtn = document.querySelector(`[data-page="${page}"]`);
  if (navBtn) navBtn.classList.add('active');
  
  if (page === 'achievements') {
    updateProgress();
  } else if (page === 'mood') {
    updateMoodChart();
  } else if (page === 'quiz') {
    startQuiz();
  } else if (page === 'photos') {
    loadPhotoVault();
  } else if (page === 'gratitude-wall') {
    loadGratitudeWall();
  } else if (page === 'vision-board') {
    loadVisionBoard();
  } else if (page === 'support-circle') {
    loadSupportCircle();
  } else if (page === 'holidays') {
    loadDifficultDates();
  } else if (page === 'reflection') {
    loadBeforeAfter();
  } else if (page === 'wellness') {
    showWellnessTab('meditation');
  } else if (page === 'themes') {
    updateThemesPageUI();
  }
}

function showWellnessTab(tab) {
  document.querySelectorAll('.wellness-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.wellness-section').forEach(s => s.classList.remove('active'));
  
  document.querySelector(`.wellness-tab[onclick="showWellnessTab('${tab}')"]`).classList.add('active');
  document.getElementById(`wellness-${tab}`).classList.add('active');
  
  if (tab === 'sleep') loadSleepHistory();
  if (tab === 'resources') loadResources();
}

function getAllAffirmations() {
  const custom = JSON.parse(localStorage.getItem('customAffirmations') || '[]');
  const styleAffirmations = getStyleContent('affirmations');
  return [...styleAffirmations, ...custom];
}

function newAffirmation() {
  const affirmations = getAllAffirmations();
  const affirmation = affirmations[Math.floor(Math.random() * affirmations.length)];
  document.getElementById('daily-affirmation').textContent = `"${affirmation}"`;
}

function newQuote() {
  const styleQuotes = getStyleContent('quotes');
  const quote = styleQuotes[Math.floor(Math.random() * styleQuotes.length)];
  document.getElementById('daily-quote').textContent = quote;
}

function newExpertTip() {
  const tip = expertTips[Math.floor(Math.random() * expertTips.length)];
  document.getElementById('expert-tip-text').textContent = `"${tip.tip}" — ${tip.author}`;
}

function showCustomAffirmations() {
  document.getElementById('custom-affirmations-modal').style.display = 'flex';
  loadCustomAffirmationList();
}

function closeCustomAffirmations() {
  document.getElementById('custom-affirmations-modal').style.display = 'none';
}

function addCustomAffirmation() {
  const input = document.getElementById('new-affirmation-input');
  const text = input.value.trim();
  if (!text) return;
  
  const custom = JSON.parse(localStorage.getItem('customAffirmations') || '[]');
  custom.push(text);
  localStorage.setItem('customAffirmations', JSON.stringify(custom));
  
  input.value = '';
  loadCustomAffirmationList();
}

function loadCustomAffirmationList() {
  const custom = JSON.parse(localStorage.getItem('customAffirmations') || '[]');
  const list = document.getElementById('custom-affirmation-list');
  list.innerHTML = '';
  
  custom.forEach((aff, index) => {
    const div = document.createElement('div');
    div.className = 'custom-affirmation-item';
    div.innerHTML = `
      <span>"${escapeHtml(aff)}"</span>
      <button onclick="removeCustomAffirmation(${index})">×</button>
    `;
    list.appendChild(div);
  });
}

function removeCustomAffirmation(index) {
  const custom = JSON.parse(localStorage.getItem('customAffirmations') || '[]');
  custom.splice(index, 1);
  localStorage.setItem('customAffirmations', JSON.stringify(custom));
  loadCustomAffirmationList();
}

function quickMoodCheck(emoji) {
  const btn = event.target;
  btn.classList.add('clicked');
  setTimeout(() => btn.classList.remove('clicked'), 800);
  
  // Launch animations FIRST (before any functions that might error)
  const happyEmojis = ['😊'];
  const sadEmojis = ['😢', '💔'];
  
  if (happyEmojis.includes(emoji)) {
    launchConfetti(50);
  } else if (sadEmojis.includes(emoji)) {
    launchHealingHearts();
  } else {
    launchSoftHearts();
  }
  
  // Save mood (wrapped in try-catch since audio can error)
  try {
    saveMoodWithNote(emoji, '');
    updateStreak();
  } catch (e) {
    console.log('Mood saved with minor error');
  }
}

// Healing hearts with bandage animation for sad moods
function launchHealingHearts() {
  const container = document.body;
  const healingEmojis = ['🩹', '💗', '🫂', '💕', '🩷', '❤️‍🩹'];
  
  for (let i = 0; i < 15; i++) {
    setTimeout(() => {
      const heart = document.createElement('span');
      heart.className = 'healing-heart-particle';
      heart.textContent = healingEmojis[Math.floor(Math.random() * healingEmojis.length)];
      heart.style.left = Math.random() * 100 + 'vw';
      heart.style.animationDuration = (2 + Math.random() * 2) + 's';
      heart.style.fontSize = (20 + Math.random() * 20) + 'px';
      container.appendChild(heart);
      
      setTimeout(() => heart.remove(), 4000);
    }, i * 100);
  }
}

// Soft floating hearts for neutral moods
function launchSoftHearts() {
  const container = document.body;
  const softEmojis = ['💜', '💛', '🤍', '💫'];
  
  for (let i = 0; i < 8; i++) {
    setTimeout(() => {
      const heart = document.createElement('span');
      heart.className = 'soft-heart-particle';
      heart.textContent = softEmojis[Math.floor(Math.random() * softEmojis.length)];
      heart.style.left = Math.random() * 100 + 'vw';
      heart.style.animationDuration = (2 + Math.random() * 1.5) + 's';
      heart.style.fontSize = (16 + Math.random() * 14) + 'px';
      container.appendChild(heart);
      
      setTimeout(() => heart.remove(), 3500);
    }, i * 120);
  }
}

async function sendChat() {
  const input = document.getElementById('chat-input');
  const text = input.value.trim();
  if (!text) return;
  
  const chatBox = document.getElementById('chat-box');
  const sendBtn = document.getElementById('send-btn');
  
  chatBox.innerHTML += `<div class="chat-message user"><div class="bubble">${escapeHtml(text)}</div></div>`;
  input.value = '';
  sendBtn.disabled = true;
  
  chatBox.innerHTML += `<div class="chat-message ai" id="typing"><div class="bubble typing"><span></span><span></span><span></span></div></div>`;
  chatBox.scrollTop = chatBox.scrollHeight;
  
  conversationHistory.push({ role: 'user', content: text });
  
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: text,
        conversationHistory: conversationHistory.slice(-10),
        userName: userData.name
      })
    });
    
    const data = await response.json();
    
    document.getElementById('typing')?.remove();
    
    chatBox.innerHTML += `<div class="chat-message ai"><div class="bubble">${escapeHtml(data.response)}</div></div>`;
    conversationHistory.push({ role: 'assistant', content: data.response });
    
    incrementChatCount();
  } catch (error) {
    document.getElementById('typing')?.remove();
    chatBox.innerHTML += `<div class="chat-message ai"><div class="bubble">I'm here for you. Tell me what's on your mind.</div></div>`;
  }
  
  chatBox.scrollTop = chatBox.scrollHeight;
  sendBtn.disabled = false;
}

function handleChatEnter(event) {
  if (event.key === 'Enter') {
    sendChat();
  }
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function showJournalTab(tab) {
  document.querySelectorAll('.journal-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.journal-section').forEach(s => s.classList.remove('active'));
  
  event.target.classList.add('active');
  document.getElementById(`journal-${tab}`).classList.add('active');
  
  if (tab === 'patterns') loadPatterns();
  if (tab === 'weekly') loadWeeklyReflections();
  if (tab === 'timecapsule') loadTimeCapsules();
  if (tab === 'voice') loadVoiceJournals();
}

async function toggleVoiceRecording() {
  if (!isRecording) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder = new MediaRecorder(stream);
      audioChunks = [];
      
      mediaRecorder.ondataavailable = (e) => {
        audioChunks.push(e.data);
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        saveVoiceJournal(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      isRecording = true;
      voiceSeconds = 0;
      document.getElementById('voice-btn-icon').textContent = '⏹️';
      document.getElementById('voice-btn-text').textContent = 'Stop Recording';
      document.getElementById('voice-timer').style.display = 'block';
      document.getElementById('recording-status').textContent = 'Recording...';
      
      voiceTimerInterval = setInterval(() => {
        voiceSeconds++;
        const mins = Math.floor(voiceSeconds / 60);
        const secs = voiceSeconds % 60;
        document.getElementById('voice-timer').textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
      }, 1000);
      
    } catch (err) {
      alert('Could not access microphone. Please allow microphone access.');
    }
  } else {
    mediaRecorder.stop();
    isRecording = false;
    clearInterval(voiceTimerInterval);
    document.getElementById('voice-btn-icon').textContent = '🎙️';
    document.getElementById('voice-btn-text').textContent = 'Start Recording';
    document.getElementById('voice-timer').style.display = 'none';
    document.getElementById('recording-status').textContent = 'Saved!';
    setTimeout(() => {
      document.getElementById('recording-status').textContent = '';
    }, 2000);
  }
}

function saveVoiceJournal(audioBlob) {
  const reader = new FileReader();
  reader.onload = () => {
    const entries = JSON.parse(localStorage.getItem('voiceJournals') || '[]');
    entries.push({
      data: reader.result,
      date: new Date().toISOString(),
      duration: voiceSeconds
    });
    localStorage.setItem('voiceJournals', JSON.stringify(entries));
    loadVoiceJournals();
  };
  reader.readAsDataURL(audioBlob);
}

function loadVoiceJournals() {
  const entries = JSON.parse(localStorage.getItem('voiceJournals') || '[]');
  const list = document.getElementById('voice-journal-list');
  list.innerHTML = '';
  
  if (entries.length === 0) {
    list.innerHTML = '<p style="color: var(--text-light);">No voice recordings yet.</p>';
    return;
  }
  
  entries.slice().reverse().forEach((entry, index) => {
    const date = new Date(entry.date);
    const mins = Math.floor(entry.duration / 60);
    const secs = entry.duration % 60;
    const div = document.createElement('div');
    div.className = 'voice-entry';
    div.innerHTML = `
      <div class="voice-entry-info">
        <span>${date.toLocaleDateString()}</span>
        <span>${mins}:${secs.toString().padStart(2, '0')}</span>
      </div>
      <audio controls src="${entry.data}"></audio>
    `;
    list.appendChild(div);
  });
}

async function getPersonalizedPrompt() {
  const promptDisplay = document.getElementById('journal-prompt-display');
  promptDisplay.textContent = 'Getting a prompt for you...';
  
  try {
    const moods = JSON.parse(localStorage.getItem('healingMoods') || '[]');
    const lastMood = moods.length > 0 ? moods[moods.length - 1].label : 'reflective';
    
    const response = await fetch('/api/journal-prompt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mood: lastMood,
        daysSinceStart: getDaysSinceStart(),
        userName: userData.name
      })
    });
    
    const data = await response.json();
    promptDisplay.textContent = data.prompt;
  } catch (error) {
    promptDisplay.textContent = 'What would you tell your best friend if they were going through this?';
  }
}

function saveJournal() {
  const text = document.getElementById('journal-entry').value.trim();
  if (!text) return;
  
  const entries = JSON.parse(localStorage.getItem('healingJournal') || '[]');
  entries.push({
    date: new Date().toISOString(),
    text: text
  });
  localStorage.setItem('healingJournal', JSON.stringify(entries));
  
  document.getElementById('journal-entry').value = '';
  loadJournal();
  updateProgress();
  updateStreak();
  
  triggerCompanionReaction('journal_entry');
  launchConfetti(40);
  playSound('achievement');
}

function loadJournal() {
  const entries = JSON.parse(localStorage.getItem('healingJournal') || '[]');
  const list = document.getElementById('journal-list');
  list.innerHTML = '';
  
  entries.slice().reverse().slice(0, 10).forEach(entry => {
    const date = new Date(entry.date);
    const div = document.createElement('div');
    div.className = 'journal-entry-item';
    div.innerHTML = `
      <div class="date">${date.toLocaleDateString()} at ${date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
      <div class="text">${escapeHtml(entry.text)}</div>
    `;
    list.appendChild(div);
  });
}

function exportJournal() {
  const entries = JSON.parse(localStorage.getItem('healingJournal') || '[]');
  if (entries.length === 0) {
    alert('No journal entries to export.');
    return;
  }
  
  let content = `Healing Hearts Journal - ${userData.name}\n`;
  content += `Exported on ${new Date().toLocaleDateString()}\n`;
  content += '='.repeat(50) + '\n\n';
  
  entries.forEach(entry => {
    const date = new Date(entry.date);
    content += `${date.toLocaleDateString()} at ${date.toLocaleTimeString()}\n`;
    content += '-'.repeat(30) + '\n';
    content += entry.text + '\n\n';
  });
  
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'healing-hearts-journal.txt';
  a.click();
  URL.revokeObjectURL(url);
}

function savePatterns() {
  const patterns = {
    pattern1: document.getElementById('pattern-1').value,
    pattern2: document.getElementById('pattern-2').value,
    pattern3: document.getElementById('pattern-3').value,
    pattern4: document.getElementById('pattern-4').value,
    date: new Date().toISOString()
  };
  localStorage.setItem('relationshipPatterns', JSON.stringify(patterns));
  alert('Your reflections have been saved.');
}

function loadPatterns() {
  const patterns = JSON.parse(localStorage.getItem('relationshipPatterns') || '{}');
  if (patterns.pattern1) document.getElementById('pattern-1').value = patterns.pattern1;
  if (patterns.pattern2) document.getElementById('pattern-2').value = patterns.pattern2;
  if (patterns.pattern3) document.getElementById('pattern-3').value = patterns.pattern3;
  if (patterns.pattern4) document.getElementById('pattern-4').value = patterns.pattern4;
}

function saveWeeklyReflection() {
  const reflection = {
    weekly1: document.getElementById('weekly-1').value,
    weekly2: document.getElementById('weekly-2').value,
    weekly3: document.getElementById('weekly-3').value,
    weekly4: document.getElementById('weekly-4').value,
    date: new Date().toISOString()
  };
  
  const reflections = JSON.parse(localStorage.getItem('weeklyReflections') || '[]');
  reflections.push(reflection);
  localStorage.setItem('weeklyReflections', JSON.stringify(reflections));
  
  document.getElementById('weekly-1').value = '';
  document.getElementById('weekly-2').value = '';
  document.getElementById('weekly-3').value = '';
  document.getElementById('weekly-4').value = '';
  
  loadWeeklyReflections();
  alert('Weekly reflection saved!');
}

function loadWeeklyReflections() {
  const reflections = JSON.parse(localStorage.getItem('weeklyReflections') || '[]');
  const container = document.getElementById('past-weekly-reflections');
  container.innerHTML = '<h4 style="margin-top:20px;">Past Reflections</h4>';
  
  reflections.slice().reverse().slice(0, 5).forEach(r => {
    const date = new Date(r.date);
    const div = document.createElement('div');
    div.className = 'weekly-reflection-item';
    div.innerHTML = `
      <div class="date">${date.toLocaleDateString()}</div>
      <p><strong>Challenge:</strong> ${escapeHtml(r.weekly1 || 'Not answered')}</p>
      <p><strong>Win:</strong> ${escapeHtml(r.weekly2 || 'Not answered')}</p>
      <p><strong>Grateful for:</strong> ${escapeHtml(r.weekly3 || 'Not answered')}</p>
    `;
    container.appendChild(div);
  });
}

function saveTimeCapsule() {
  const letter = document.getElementById('timecapsule-letter').value.trim();
  if (!letter) {
    alert('Please write a message first.');
    return;
  }
  
  const delay = parseInt(document.getElementById('timecapsule-delay').value);
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + delay);
  
  const capsule = {
    letter: letter,
    created: new Date().toISOString(),
    deliveryDate: deliveryDate.toISOString(),
    opened: false
  };
  
  const capsules = JSON.parse(localStorage.getItem('timeCapsules') || '[]');
  capsules.push(capsule);
  localStorage.setItem('timeCapsules', JSON.stringify(capsules));
  
  document.getElementById('timecapsule-letter').value = '';
  loadTimeCapsules();
  alert(`Your time capsule has been sealed! It will be available on ${deliveryDate.toLocaleDateString()}.`);
}

function loadTimeCapsules() {
  const capsules = JSON.parse(localStorage.getItem('timeCapsules') || '[]');
  const pending = document.getElementById('pending-capsules');
  const opened = document.getElementById('opened-capsules');
  
  pending.innerHTML = '<h4 style="margin-top:20px;">Sealed Capsules</h4>';
  opened.innerHTML = '<h4 style="margin-top:20px;">Opened Capsules</h4>';
  
  const now = new Date();
  
  capsules.forEach((c, index) => {
    const deliveryDate = new Date(c.deliveryDate);
    const div = document.createElement('div');
    div.className = 'capsule-item';
    
    if (!c.opened && deliveryDate <= now) {
      div.innerHTML = `
        <div class="capsule-date">Ready to open! (sealed ${new Date(c.created).toLocaleDateString()})</div>
        <button onclick="openTimeCapsule(${index})" class="save-btn">Open Capsule</button>
      `;
      pending.appendChild(div);
    } else if (!c.opened) {
      div.innerHTML = `
        <div class="capsule-date">Opens on ${deliveryDate.toLocaleDateString()}</div>
        <p style="color: var(--text-light);">This message is waiting for the right time...</p>
      `;
      pending.appendChild(div);
    } else {
      div.className = 'capsule-item opened';
      div.innerHTML = `
        <div class="capsule-date">Opened on ${new Date(c.openedDate).toLocaleDateString()}</div>
        <p class="capsule-text">${escapeHtml(c.letter)}</p>
      `;
      opened.appendChild(div);
    }
  });
}

function openTimeCapsule(index) {
  const capsules = JSON.parse(localStorage.getItem('timeCapsules') || '[]');
  capsules[index].opened = true;
  capsules[index].openedDate = new Date().toISOString();
  localStorage.setItem('timeCapsules', JSON.stringify(capsules));
  loadTimeCapsules();
  alert('Your past self wrote:\n\n"' + capsules[index].letter + '"');
}

function checkTimeCapsules() {
  const capsules = JSON.parse(localStorage.getItem('timeCapsules') || '[]');
  const now = new Date();
  
  capsules.forEach((c, i) => {
    if (!c.opened && new Date(c.deliveryDate) <= now) {
      console.log('Time capsule ready:', i);
    }
  });
}

function getJournalCount() {
  return JSON.parse(localStorage.getItem('healingJournal') || '[]').length;
}

function saveMoodWithNote(emoji, label) {
  const note = document.getElementById('mood-note')?.value || '';
  const moods = JSON.parse(localStorage.getItem('healingMoods') || '[]');
  
  moods.push({
    emoji,
    label,
    note,
    time: new Date().toISOString()
  });
  
  localStorage.setItem('healingMoods', JSON.stringify(moods));
  
  if (document.getElementById('mood-note')) {
    document.getElementById('mood-note').value = '';
  }
  
  loadMoods();
  updateMoodChart();
  updateProgress();
  applyMoodReactiveUI(emoji);
  
  triggerCompanionReaction('mood_logged');
  launchConfetti(30);
  playSound('achievement');
}

function applyMoodReactiveUI(emoji) {
  const moodClasses = ['mood-devastated', 'mood-sad', 'mood-angry', 'mood-confused', 'mood-numb', 'mood-hopeful', 'mood-happy', 'mood-peaceful'];
  moodClasses.forEach(c => document.body.classList.remove(c));
  
  const emojiToMood = {
    '💔': 'devastated',
    '😢': 'sad',
    '😤': 'angry',
    '😕': 'confused',
    '😶': 'numb',
    '🌱': 'hopeful',
    '😊': 'happy',
    '😌': 'peaceful',
    '🥲': 'sad',
    '😔': 'sad',
    '🙂': 'hopeful',
    '💪': 'hopeful',
    '🌈': 'happy',
    '❤️': 'peaceful'
  };
  
  const moodClass = emojiToMood[emoji];
  if (moodClass) {
    document.body.classList.add(`mood-${moodClass}`);
    localStorage.setItem('currentMoodTheme', moodClass);
  }
}

function loadMoods() {
  const moods = JSON.parse(localStorage.getItem('healingMoods') || '[]');
  const list = document.getElementById('mood-history');
  if (!list) return;
  
  list.innerHTML = '';
  
  moods.slice().reverse().slice(0, 10).forEach(mood => {
    const time = new Date(mood.time);
    const div = document.createElement('div');
    div.className = 'mood-history-item';
    div.innerHTML = `
      <span class="emoji">${mood.emoji}</span>
      <div class="details">
        <div class="time">${time.toLocaleDateString()} at ${time.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
        ${mood.note ? `<div class="note">${escapeHtml(mood.note)}</div>` : ''}
      </div>
    `;
    list.appendChild(div);
  });
}

function getMoodCount() {
  return JSON.parse(localStorage.getItem('healingMoods') || '[]').length;
}

function updateMoodChart() {
  const moods = JSON.parse(localStorage.getItem('healingMoods') || '[]');
  const chart = document.getElementById('mood-chart');
  const insight = document.getElementById('mood-insight');
  if (!chart) return;
  
  chart.innerHTML = '';
  
  const moodScores = {
    '😊': 5, '🌱': 4, '🙂': 3, '😐': 2, '😢': 1, '😤': 1, '😰': 1, '💔': 0
  };
  
  const last7 = moods.slice(-7);
  
  if (last7.length === 0) {
    chart.innerHTML = '<p style="text-align:center;color:var(--text-light);">Start tracking your moods to see patterns</p>';
    return;
  }
  
  last7.forEach(mood => {
    const score = moodScores[mood.emoji] || 2;
    const height = (score / 5) * 100;
    const bar = document.createElement('div');
    bar.className = 'mood-bar';
    bar.style.height = `${height}%`;
    bar.title = mood.emoji;
    chart.appendChild(bar);
  });
  
  const avgScore = last7.reduce((sum, m) => sum + (moodScores[m.emoji] || 2), 0) / last7.length;
  
  if (avgScore >= 3.5) {
    insight.textContent = "You're trending upward! Keep going.";
  } else if (avgScore >= 2) {
    insight.textContent = "You're in the thick of it. That's okay. Healing takes time.";
  } else {
    insight.textContent = "These are heavy days. Remember: you won't feel this way forever.";
  }
}

function loadBeforeAfter() {
  const moods = JSON.parse(localStorage.getItem('healingMoods') || '[]');
  const days = getDaysSinceStart();
  
  document.getElementById('reflection-today-day').textContent = days;
  
  if (moods.length > 0) {
    const firstMood = moods[0];
    document.getElementById('reflection-day1-mood').textContent = firstMood.emoji;
    document.getElementById('reflection-day1-text').textContent = firstMood.note || 'No note recorded';
    
    const lastMood = moods[moods.length - 1];
    document.getElementById('reflection-today-mood').textContent = lastMood.emoji;
  }
  
  loadPastReflections();
}

function saveReflection() {
  const reflection = {
    q1: document.getElementById('reflection-1').value,
    q2: document.getElementById('reflection-2').value,
    q3: document.getElementById('reflection-3').value,
    date: new Date().toISOString(),
    day: getDaysSinceStart()
  };
  
  const reflections = JSON.parse(localStorage.getItem('beforeAfterReflections') || '[]');
  reflections.push(reflection);
  localStorage.setItem('beforeAfterReflections', JSON.stringify(reflections));
  
  document.getElementById('reflection-1').value = '';
  document.getElementById('reflection-2').value = '';
  document.getElementById('reflection-3').value = '';
  
  loadPastReflections();
  alert('Reflection saved!');
}

function loadPastReflections() {
  const reflections = JSON.parse(localStorage.getItem('beforeAfterReflections') || '[]');
  const container = document.getElementById('past-reflections');
  container.innerHTML = '';
  
  reflections.slice().reverse().slice(0, 5).forEach(r => {
    const div = document.createElement('div');
    div.className = 'past-reflection card';
    div.innerHTML = `
      <h5>Day ${r.day} - ${new Date(r.date).toLocaleDateString()}</h5>
      <p><strong>What's different:</strong> ${escapeHtml(r.q1 || 'Not answered')}</p>
      <p><strong>What I've learned:</strong> ${escapeHtml(r.q2 || 'Not answered')}</p>
      <p><strong>What I'm proud of:</strong> ${escapeHtml(r.q3 || 'Not answered')}</p>
    `;
    container.appendChild(div);
  });
}

function getChatCount() {
  return parseInt(localStorage.getItem('healingChatCount') || '0');
}

function incrementChatCount() {
  const count = getChatCount() + 1;
  localStorage.setItem('healingChatCount', count.toString());
}

function getActivityCount() {
  return parseInt(localStorage.getItem('healingActivityCount') || '0');
}

function incrementActivityCount() {
  const count = getActivityCount() + 1;
  localStorage.setItem('healingActivityCount', count.toString());
}

function startActivity(activityId) {
  currentActivity = activityId;
  const activity = activities[activityId];
  
  document.getElementById('activity-title').textContent = activity.title;
  document.getElementById('activity-instructions').textContent = activity.instructions;
  document.getElementById('activity-text').value = '';
  document.getElementById('activity-modal').style.display = 'flex';
}

function closeActivity() {
  document.getElementById('activity-modal').style.display = 'none';
  currentActivity = null;
}

function saveActivity() {
  const text = document.getElementById('activity-text').value.trim();
  if (!text) {
    alert('Please write something before saving');
    return;
  }
  
  const savedActivities = JSON.parse(localStorage.getItem('healingActivities') || '[]');
  savedActivities.push({
    type: currentActivity,
    text: text,
    date: new Date().toISOString()
  });
  localStorage.setItem('healingActivities', JSON.stringify(savedActivities));
  
  incrementActivityCount();
  
  // Special animation for release ritual
  if (currentActivity === 'release') {
    showReleaseBalloon();
  }
  
  closeActivity();
  updateProgress();
  triggerCompanionReaction('activity');
  launchConfetti(50);
  
  alert('Your reflection has been saved. You\'re doing amazing work.');
}

function showReleaseBalloon() {
  const container = document.createElement('div');
  container.className = 'release-balloon-container';
  
  const colors = ['🎈', '🩷', '💜', '🩵', '💗'];
  const numBalloons = 5;
  
  for (let i = 0; i < numBalloons; i++) {
    const balloon = document.createElement('div');
    balloon.className = 'release-balloon';
    balloon.textContent = colors[i % colors.length];
    balloon.style.left = `${15 + (i * 18)}%`;
    balloon.style.animationDelay = `${i * 0.3}s`;
    container.appendChild(balloon);
  }
  
  document.body.appendChild(container);
  
  setTimeout(() => {
    container.remove();
  }, 6000);
}

function triggerCompanionReaction(type) {
  const companion = document.getElementById('healing-companion');
  if (!companion) return;
  
  const reactions = {
    activity: { animation: 'companion-bounce', message: 'Amazing work! I\'m so proud of you! 🌟', emotion: 'excited' },
    mood: { animation: 'companion-wiggle', message: 'Thanks for checking in with me! 💕', emotion: 'comfort' },
    journal: { animation: 'companion-bounce', message: 'Writing heals the soul! 📝✨', emotion: 'cheering' },
    challenge: { animation: 'companion-spin', message: 'You crushed it! 🎉', emotion: 'cheering' }
  };
  
  const reaction = reactions[type];
  if (!reaction) return;
  
  companion.classList.add(reaction.animation);
  setCompanionEmotion(reaction.emotion);
  showCompanionMessage(reaction.message);
  
  setTimeout(() => {
    companion.classList.remove(reaction.animation);
  }, 1000);
}

function startMeditation(type) {
  const meditation = meditations[type];
  if (!meditation) return;
  
  document.getElementById('meditation-title').textContent = meditation.title;
  document.getElementById('meditation-modal').style.display = 'flex';
  
  let timeLeft = meditation.duration;
  let currentStepIndex = 0;
  meditationPaused = false;
  
  document.getElementById('meditation-instruction').textContent = meditation.steps[0].text;
  
  function updateTimer() {
    if (meditationPaused) return;
    
    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    document.getElementById('meditation-timer').textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
    
    const elapsed = meditation.duration - timeLeft;
    const nextStep = meditation.steps.find((s, i) => i > currentStepIndex && elapsed >= s.time);
    if (nextStep) {
      currentStepIndex = meditation.steps.indexOf(nextStep);
      document.getElementById('meditation-instruction').textContent = nextStep.text;
    }
    
    if (timeLeft <= 0) {
      clearInterval(meditationInterval);
      document.getElementById('meditation-instruction').textContent = "Meditation complete. Take a moment before returning.";
      document.getElementById('meditation-pause-btn').textContent = 'Close';
    } else {
      timeLeft--;
    }
  }
  
  updateTimer();
  meditationInterval = setInterval(updateTimer, 1000);
}

function pauseMeditation() {
  if (document.getElementById('meditation-pause-btn').textContent === 'Close') {
    closeMeditation();
    return;
  }
  
  meditationPaused = !meditationPaused;
  document.getElementById('meditation-pause-btn').textContent = meditationPaused ? 'Resume' : 'Pause';
}

function closeMeditation() {
  if (meditationInterval) clearInterval(meditationInterval);
  document.getElementById('meditation-modal').style.display = 'none';
}

function showPlaylist(mood) {
  const playlist = playlists[mood];
  if (!playlist) return;
  
  document.getElementById('playlist-title').textContent = playlist.title;
  const container = document.getElementById('playlist-songs');
  container.innerHTML = '';
  
  playlist.songs.forEach(song => {
    const div = document.createElement('div');
    div.className = 'song-item';
    div.innerHTML = `
      <div class="song-info">
        <div class="song-title">${escapeHtml(song.title)}</div>
        <div class="song-artist">${escapeHtml(song.artist)}</div>
      </div>
    `;
    container.appendChild(div);
  });
  
  document.getElementById('playlist-modal').style.display = 'flex';
}

function closePlaylist() {
  document.getElementById('playlist-modal').style.display = 'none';
}

function selectSleepQuality(quality) {
  selectedSleepQuality = quality;
  document.querySelectorAll('.quality-btn').forEach(btn => btn.classList.remove('selected'));
  document.querySelector(`.quality-btn[data-quality="${quality}"]`).classList.add('selected');
}

function saveSleep() {
  const hours = parseFloat(document.getElementById('sleep-hours').value) || 0;
  const notes = document.getElementById('sleep-notes').value;
  
  const sleepData = JSON.parse(localStorage.getItem('sleepData') || '[]');
  sleepData.push({
    date: new Date().toISOString(),
    hours: hours,
    quality: selectedSleepQuality,
    notes: notes
  });
  localStorage.setItem('sleepData', JSON.stringify(sleepData));
  
  document.getElementById('sleep-hours').value = '';
  document.getElementById('sleep-notes').value = '';
  selectedSleepQuality = 3;
  document.querySelectorAll('.quality-btn').forEach(btn => btn.classList.remove('selected'));
  
  loadSleepHistory();
  alert('Sleep logged!');
}

function loadSleepHistory() {
  const sleepData = JSON.parse(localStorage.getItem('sleepData') || '[]');
  const list = document.getElementById('sleep-list');
  const chart = document.getElementById('sleep-chart');
  
  list.innerHTML = '';
  chart.innerHTML = '';
  
  const qualityEmojis = { 1: '😫', 2: '😕', 3: '😐', 4: '🙂', 5: '😴' };
  
  const last7 = sleepData.slice(-7);
  last7.forEach(s => {
    const height = (s.hours / 12) * 100;
    const bar = document.createElement('div');
    bar.className = 'sleep-bar';
    bar.style.height = `${Math.min(height, 100)}%`;
    bar.title = `${s.hours}h`;
    chart.appendChild(bar);
  });
  
  sleepData.slice().reverse().slice(0, 5).forEach(s => {
    const date = new Date(s.date);
    const div = document.createElement('div');
    div.className = 'sleep-entry';
    div.innerHTML = `
      <span>${date.toLocaleDateString()}</span>
      <span>${s.hours}h</span>
      <span>${qualityEmojis[s.quality] || '😐'}</span>
    `;
    list.appendChild(div);
  });
}

function loadSelfCareChecklist() {
  const today = new Date().toDateString();
  const savedDate = localStorage.getItem('selfCareDate');
  
  if (savedDate !== today) {
    localStorage.setItem('selfCareDate', today);
    localStorage.removeItem('selfCareChecks');
  }
  
  const checks = JSON.parse(localStorage.getItem('selfCareChecks') || '{}');
  
  ['hydrate', 'eat', 'move', 'outside', 'connect', 'rest'].forEach(item => {
    const checkbox = document.getElementById(`sc-${item}`);
    if (checkbox) checkbox.checked = !!checks[item];
  });
  
  updateSelfCareProgress();
}

function toggleSelfCare(item) {
  const checks = JSON.parse(localStorage.getItem('selfCareChecks') || '{}');
  checks[item] = document.getElementById(`sc-${item}`).checked;
  localStorage.setItem('selfCareChecks', JSON.stringify(checks));
  updateSelfCareProgress();
}

function updateSelfCareProgress() {
  const checks = JSON.parse(localStorage.getItem('selfCareChecks') || '{}');
  const total = 6;
  const completed = Object.values(checks).filter(v => v).length;
  const percentage = (completed / total) * 100;
  
  document.getElementById('selfcare-progress-bar').style.width = `${percentage}%`;
  
  const messages = [
    "Start with one small thing.",
    "You're getting started!",
    "Making progress!",
    "Halfway there!",
    "You're doing amazing!",
    "Almost complete!",
    "Self-care champion!"
  ];
  document.getElementById('selfcare-message').textContent = messages[completed];
}

function getSelfCareComplete() {
  const checks = JSON.parse(localStorage.getItem('selfCareChecks') || '{}');
  return Object.values(checks).filter(v => v).length >= 6;
}

function generateHealingPlan() {
  const days = getDaysSinceStart();
  const container = document.getElementById('healing-plan-content');
  
  let plan = '';
  
  if (days <= 7) {
    plan = `
      <p><strong>Week 1: Survival Mode</strong></p>
      <ul>
        <li>Focus on basic self-care: eat, sleep, hydrate</li>
        <li>Let yourself feel without judgment</li>
        <li>Lean on your support circle</li>
        <li>Avoid major decisions</li>
        <li>Daily: Journal for 5 minutes</li>
      </ul>
    `;
  } else if (days <= 30) {
    plan = `
      <p><strong>Month 1: Processing</strong></p>
      <ul>
        <li>Continue daily mood check-ins</li>
        <li>Complete 2-3 guided activities per week</li>
        <li>Start understanding your patterns</li>
        <li>Limit social media checking</li>
        <li>Weekly: Do one thing that brings you joy</li>
      </ul>
    `;
  } else if (days <= 90) {
    plan = `
      <p><strong>Months 2-3: Rebuilding</strong></p>
      <ul>
        <li>Focus on personal growth goals</li>
        <li>Reconnect with hobbies and friends</li>
        <li>Work on your vision board</li>
        <li>Take the dating readiness quiz</li>
        <li>Weekly: Reflect on your progress</li>
      </ul>
    `;
  } else {
    plan = `
      <p><strong>Beyond 90 Days: Thriving</strong></p>
      <ul>
        <li>Celebrate how far you've come</li>
        <li>Use lessons learned in future relationships</li>
        <li>Continue self-care practices</li>
        <li>Consider helping others going through similar experiences</li>
        <li>Monthly: Review your before/after reflections</li>
      </ul>
    `;
  }
  
  container.innerHTML = plan;
}

function loadResources() {
  const bookList = document.getElementById('book-list');
  const podcastList = document.getElementById('podcast-list');
  const tipsList = document.getElementById('expert-tips-list');
  
  bookList.innerHTML = '';
  books.forEach(book => {
    const div = document.createElement('div');
    div.className = 'resource-item';
    div.innerHTML = `
      <h5>${escapeHtml(book.title)}</h5>
      <p>by ${escapeHtml(book.author)}</p>
      <p class="resource-desc">${escapeHtml(book.desc)}</p>
    `;
    bookList.appendChild(div);
  });
  
  podcastList.innerHTML = '';
  podcasts.forEach(pod => {
    const div = document.createElement('div');
    div.className = 'resource-item';
    div.innerHTML = `
      <h5>${escapeHtml(pod.title)}</h5>
      <p>Host: ${escapeHtml(pod.host)}</p>
      <p class="resource-desc">${escapeHtml(pod.desc)}</p>
    `;
    podcastList.appendChild(div);
  });
  
  tipsList.innerHTML = '';
  expertTips.slice(0, 5).forEach(tip => {
    const div = document.createElement('div');
    div.className = 'resource-item';
    div.innerHTML = `<p>"${escapeHtml(tip.tip)}"</p><p class="resource-author">— ${escapeHtml(tip.author)}</p>`;
    tipsList.appendChild(div);
  });
}

function updateProgress() {
  const days = getDaysSinceStart();
  const journalCount = getJournalCount();
  const activityCount = getActivityCount();
  const streak = getStreak();
  
  document.getElementById('days-healing').textContent = days;
  if (document.getElementById('streak-stat')) {
    document.getElementById('streak-stat').textContent = streak;
  }
  document.getElementById('journal-count').textContent = journalCount;
  document.getElementById('activities-count').textContent = activityCount;
  
  const currentMilestone = milestones.filter(m => days >= m.days).pop();
  const nextMilestone = milestones.find(m => days < m.days);
  
  const milestoneList = document.getElementById('milestone-list');
  milestoneList.innerHTML = '';
  
  milestones.slice(0, 5).forEach(m => {
    const achieved = days >= m.days;
    const div = document.createElement('div');
    div.className = `milestone-item ${achieved ? 'achieved' : 'locked'}`;
    div.innerHTML = `
      <span class="milestone-icon">${m.icon}</span>
      <div class="milestone-info">
        <h5>${m.name}</h5>
        <p>${m.description}</p>
      </div>
      ${achieved ? '<span>✓</span>' : ''}
    `;
    milestoneList.appendChild(div);
  });
  
  const badgeGrid = document.getElementById('badge-grid');
  badgeGrid.innerHTML = '';
  
  badges.forEach(badge => {
    const earned = badge.condition();
    const div = document.createElement('div');
    div.className = `badge-item ${earned ? '' : 'locked'}`;
    div.innerHTML = `
      <span class="badge-icon">${badge.icon}</span>
      <span class="badge-name">${badge.name}</span>
    `;
    badgeGrid.appendChild(div);
  });
  
  if (nextMilestone) {
    const progress = (days / nextMilestone.days) * 100;
    document.getElementById('mini-progress').style.width = `${Math.min(progress, 100)}%`;
    document.getElementById('next-milestone').textContent = `${nextMilestone.days - days} days until ${nextMilestone.name}`;
  } else {
    document.getElementById('mini-progress').style.width = '100%';
    document.getElementById('next-milestone').textContent = 'You\'ve reached all milestones!';
  }
  
  updateHealingPath(days);
  updateMilestonePostcard(days);
}

function updateMilestonePostcard(days) {
  const container = document.getElementById('milestone-postcard-container');
  if (!container) return;
  
  // Show postcard if user has reached at least 7 days
  if (days >= 7) {
    container.style.display = 'block';
    generateNewPostcard();
  } else {
    container.style.display = 'none';
  }
}

const postcardMessages = [
  "You've shown incredible strength on this journey!",
  "Every day you heal is a victory worth celebrating!",
  "Look how far you've come - you're amazing!",
  "Your heart is stronger than you know!",
  "The storm is passing, and you're still standing!",
  "You're writing a beautiful comeback story!",
  "Your resilience inspires everyone around you!",
  "Healing isn't linear, but you're doing it!",
  "You chose yourself, and that takes courage!",
  "The best is yet to come for your healed heart!"
];

const postcardBadges = ['🎉', '🌟', '💪', '🦋', '🌈', '✨', '🏆', '💖', '🌸', '👑'];

const postcardTitles = [
  "Healing Hero", "Brave Heart", "Rising Star", "Phoenix Rising", 
  "Warrior Soul", "Resilience Champion", "Heart Mender", "Hope Keeper"
];

const postcardDesigns = ['', 'design-sunset', 'design-ocean', 'design-forest', 'design-lavender', 'design-midnight'];

function generateNewPostcard() {
  const days = getDaysSinceStart();
  const postcardInner = document.querySelector('.postcard-inner');
  const badge = document.querySelector('.postcard-badge');
  const title = document.querySelector('.postcard-title');
  const message = document.getElementById('postcard-message');
  const daysEl = document.getElementById('postcard-days');
  const dateEl = document.getElementById('postcard-date');
  
  if (!postcardInner) return;
  
  // Remove old design classes
  postcardDesigns.forEach(d => postcardInner.classList.remove(d));
  
  // Apply random design
  const randomDesign = postcardDesigns[Math.floor(Math.random() * postcardDesigns.length)];
  if (randomDesign) postcardInner.classList.add(randomDesign);
  
  // Update content
  badge.textContent = postcardBadges[Math.floor(Math.random() * postcardBadges.length)];
  title.textContent = postcardTitles[Math.floor(Math.random() * postcardTitles.length)];
  message.textContent = postcardMessages[Math.floor(Math.random() * postcardMessages.length)];
  daysEl.textContent = `${days} Days Strong`;
  dateEl.textContent = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  
  playSound('achievement');
  spawnParticles('confetti');
}

function updateHealingPath(days) {
  const timeline = document.getElementById('healing-timeline');
  if (!timeline) return;
  
  const stages = timeline.querySelectorAll('.timeline-stage');
  let currentStageFound = false;
  
  stages.forEach((stage, index) => {
    const requiredDays = parseInt(stage.dataset.days);
    const isUnlocked = days >= requiredDays;
    
    stage.classList.remove('unlocked', 'current', 'locked');
    
    if (isUnlocked) {
      stage.classList.add('unlocked');
      
      const nextStage = stages[index + 1];
      const nextDays = nextStage ? parseInt(nextStage.dataset.days) : Infinity;
      
      if (!currentStageFound && days < nextDays) {
        stage.classList.add('current');
        currentStageFound = true;
      }
    } else {
      stage.classList.add('locked');
    }
  });
  
  const connectors = timeline.querySelectorAll('.timeline-connector');
  connectors.forEach((connector, index) => {
    const prevStage = stages[index];
    if (prevStage && prevStage.classList.contains('unlocked')) {
      connector.style.background = 'linear-gradient(to bottom, var(--primary), var(--primary-light))';
    } else {
      connector.style.background = 'linear-gradient(to bottom, var(--primary-light), transparent)';
    }
  });
}

function getNoContactDays() {
  const startDate = localStorage.getItem('noContactStart');
  if (!startDate) return 0;
  const start = new Date(startDate);
  const now = new Date();
  return Math.floor((now - start) / (1000 * 60 * 60 * 24));
}

function updateNoContactCounter() {
  const days = getNoContactDays();
  const display = document.getElementById('no-contact-display');
  const message = document.getElementById('no-contact-message');
  const startBtn = document.getElementById('start-nc-btn');
  
  if (days > 0) {
    display.textContent = `${days} days`;
    startBtn.style.display = 'none';
    
    if (days >= 30) {
      message.textContent = "One month strong! You're amazing!";
    } else if (days >= 14) {
      message.textContent = "Two weeks! You're building real strength.";
    } else if (days >= 7) {
      message.textContent = "A full week! Every day matters.";
    } else {
      message.textContent = "Every day without contact is a victory.";
    }
  } else {
    display.textContent = "0 days";
    startBtn.style.display = 'inline-block';
  }
}

function startNoContact() {
  localStorage.setItem('noContactStart', new Date().toISOString());
  updateNoContactCounter();
}

function resetNoContact() {
  if (confirm('It\'s okay. Healing isn\'t linear. Ready to start again?')) {
    localStorage.setItem('noContactStart', new Date().toISOString());
    updateNoContactCounter();
  }
}

function addGratitude() {
  const input = document.getElementById('gratitude-input');
  const text = input.value.trim();
  if (!text) return;
  
  const gratitudes = JSON.parse(localStorage.getItem('gratitudeWall') || '[]');
  gratitudes.push({
    text: text,
    date: new Date().toISOString()
  });
  localStorage.setItem('gratitudeWall', JSON.stringify(gratitudes));
  
  input.value = '';
  loadGratitudeWall();
}

function loadGratitudeWall() {
  const gratitudes = JSON.parse(localStorage.getItem('gratitudeWall') || '[]');
  const grid = document.getElementById('gratitude-wall-grid');
  grid.innerHTML = '';
  
  const colors = ['#FFE4E1', '#E6E6FA', '#F0FFF0', '#FFF8DC', '#E0FFFF', '#FFE4B5'];
  
  gratitudes.forEach((g, i) => {
    const div = document.createElement('div');
    div.className = 'gratitude-note';
    div.style.backgroundColor = colors[i % colors.length];
    div.innerHTML = `<p>${escapeHtml(g.text)}</p>`;
    grid.appendChild(div);
  });
}

function addVision() {
  const text = document.getElementById('vision-text').value.trim();
  const category = document.getElementById('vision-category').value;
  if (!text) return;
  
  const visions = JSON.parse(localStorage.getItem('visionBoard') || '[]');
  visions.push({
    text: text,
    category: category,
    date: new Date().toISOString()
  });
  localStorage.setItem('visionBoard', JSON.stringify(visions));
  
  document.getElementById('vision-text').value = '';
  loadVisionBoard();
}

function loadVisionBoard() {
  const visions = JSON.parse(localStorage.getItem('visionBoard') || '[]');
  const grid = document.getElementById('vision-board-grid');
  grid.innerHTML = '';
  
  const categoryIcons = {
    'love': '💕',
    'self': '🌱',
    'career': '💼',
    'joy': '✨',
    'health': '💪'
  };
  
  visions.forEach(v => {
    const div = document.createElement('div');
    div.className = 'vision-card';
    div.innerHTML = `
      <span class="vision-icon">${categoryIcons[v.category] || '✨'}</span>
      <p>${escapeHtml(v.text)}</p>
    `;
    grid.appendChild(div);
  });
}

function addSupportContact() {
  const name = document.getElementById('contact-name').value.trim();
  const relationship = document.getElementById('contact-relationship').value.trim();
  const phone = document.getElementById('contact-phone').value.trim();
  
  if (!name) {
    alert('Please enter a name');
    return;
  }
  
  const contacts = JSON.parse(localStorage.getItem('supportCircle') || '[]');
  contacts.push({ name, relationship, phone });
  localStorage.setItem('supportCircle', JSON.stringify(contacts));
  
  document.getElementById('contact-name').value = '';
  document.getElementById('contact-relationship').value = '';
  document.getElementById('contact-phone').value = '';
  
  loadSupportCircle();
}

function loadSupportCircle() {
  const contacts = JSON.parse(localStorage.getItem('supportCircle') || '[]');
  const list = document.getElementById('support-contacts-list');
  list.innerHTML = '';
  
  contacts.forEach((c, i) => {
    const div = document.createElement('div');
    div.className = 'contact-card card';
    div.innerHTML = `
      <h4>${escapeHtml(c.name)}</h4>
      <p>${escapeHtml(c.relationship)}</p>
      ${c.phone ? `<a href="tel:${c.phone}" class="call-btn">📞 Call</a>` : ''}
      <button onclick="removeSupportContact(${i})" class="remove-btn">Remove</button>
    `;
    list.appendChild(div);
  });
}

function removeSupportContact(index) {
  const contacts = JSON.parse(localStorage.getItem('supportCircle') || '[]');
  contacts.splice(index, 1);
  localStorage.setItem('supportCircle', JSON.stringify(contacts));
  loadSupportCircle();
}

function contactSupportCircle() {
  const contacts = JSON.parse(localStorage.getItem('supportCircle') || '[]');
  const list = document.getElementById('support-circle-list');
  list.innerHTML = '';
  
  if (contacts.length === 0) {
    list.innerHTML = '<p>No contacts yet. Add people to your Support Circle first.</p>';
  } else {
    contacts.forEach(c => {
      const div = document.createElement('div');
      div.className = 'support-contact';
      div.innerHTML = `
        <span class="contact-name">${escapeHtml(c.name)}</span>
        ${c.phone ? `<a href="tel:${c.phone}" class="call-now-btn">Call Now</a>` : ''}
      `;
      list.appendChild(div);
    });
  }
  
  document.getElementById('support-circle-modal').style.display = 'flex';
}

function addDifficultDate() {
  const name = document.getElementById('difficult-date-name').value.trim();
  const date = document.getElementById('difficult-date-date').value;
  
  if (!name || !date) {
    alert('Please fill in both fields');
    return;
  }
  
  const dates = JSON.parse(localStorage.getItem('difficultDates') || '[]');
  dates.push({ name, date });
  localStorage.setItem('difficultDates', JSON.stringify(dates));
  
  document.getElementById('difficult-date-name').value = '';
  document.getElementById('difficult-date-date').value = '';
  
  loadDifficultDates();
}

function loadDifficultDates() {
  const dates = JSON.parse(localStorage.getItem('difficultDates') || '[]');
  const list = document.getElementById('upcoming-difficult-dates');
  list.innerHTML = '<h4>Your Difficult Dates</h4>';
  
  const today = new Date();
  
  dates.sort((a, b) => new Date(a.date) - new Date(b.date)).forEach((d, i) => {
    const dateObj = new Date(d.date);
    const daysUntil = Math.ceil((dateObj - today) / (1000 * 60 * 60 * 24));
    
    const div = document.createElement('div');
    div.className = 'difficult-date-item card';
    div.innerHTML = `
      <h5>${escapeHtml(d.name)}</h5>
      <p>${dateObj.toLocaleDateString()}</p>
      <p class="days-until">${daysUntil > 0 ? `${daysUntil} days away` : daysUntil === 0 ? 'Today' : 'Passed'}</p>
      <button onclick="removeDifficultDate(${i})" class="remove-btn">Remove</button>
    `;
    list.appendChild(div);
  });
}

function removeDifficultDate(index) {
  const dates = JSON.parse(localStorage.getItem('difficultDates') || '[]');
  dates.splice(index, 1);
  localStorage.setItem('difficultDates', JSON.stringify(dates));
  loadDifficultDates();
}

function postToCommunity() {
  const message = document.getElementById('community-message').value.trim();
  if (!message) return;
  
  const posts = JSON.parse(localStorage.getItem('communityPosts') || '[]');
  posts.unshift({
    content: message,
    date: new Date().toISOString(),
    hearts: 0
  });
  localStorage.setItem('communityPosts', JSON.stringify(posts));
  
  document.getElementById('community-message').value = '';
  alert('Posted anonymously!');
}

function sendHeart(btn) {
  const currentCount = parseInt(btn.textContent.match(/\d+/)[0]);
  btn.textContent = `💜 ${currentCount + 1}`;
}

function showDistractions() {
  refreshDistractions();
  document.getElementById('distractions-modal').style.display = 'flex';
}

function refreshDistractions() {
  const list = document.getElementById('distraction-list');
  list.innerHTML = '';
  
  const shuffled = [...distractions].sort(() => Math.random() - 0.5).slice(0, 5);
  shuffled.forEach(d => {
    const div = document.createElement('div');
    div.className = 'distraction-item';
    div.innerHTML = `<p>${d}</p>`;
    list.appendChild(div);
  });
}

function startQuiz() {
  currentQuizQuestion = 0;
  quizAnswers = [];
  document.getElementById('quiz-questions').style.display = 'block';
  document.getElementById('quiz-results').style.display = 'none';
  showQuizQuestion();
}

function showQuizQuestion() {
  const q = quizQuestions[currentQuizQuestion];
  document.getElementById('quiz-question').textContent = q.question;
  document.getElementById('quiz-progress-text').textContent = `Question ${currentQuizQuestion + 1} of ${quizQuestions.length}`;
  document.getElementById('quiz-progress-fill').style.width = `${((currentQuizQuestion + 1) / quizQuestions.length) * 100}%`;
  
  const optionsContainer = document.getElementById('quiz-options');
  optionsContainer.innerHTML = '';
  
  q.options.forEach((opt, i) => {
    const btn = document.createElement('button');
    btn.className = 'quiz-option';
    btn.textContent = opt.text;
    btn.onclick = () => answerQuiz(opt.score);
    optionsContainer.appendChild(btn);
  });
}

function answerQuiz(score) {
  quizAnswers.push(score);
  currentQuizQuestion++;
  
  if (currentQuizQuestion >= quizQuestions.length) {
    showQuizResults();
  } else {
    showQuizQuestion();
  }
}

function showQuizResults() {
  document.getElementById('quiz-questions').style.display = 'none';
  document.getElementById('quiz-results').style.display = 'block';
  
  const total = quizAnswers.reduce((a, b) => a + b, 0);
  const maxScore = quizQuestions.length * 4;
  const percentage = (total / maxScore) * 100;
  
  let title, text, details;
  
  if (percentage >= 75) {
    title = "You seem ready to date! 💕";
    text = "You've done significant healing work and appear emotionally ready to explore new connections. Remember to take things slow and trust yourself.";
    details = "Your self-awareness is strong, and you've processed much of the past. Just remember: there's no rush.";
  } else if (percentage >= 50) {
    title = "Almost there! 🌱";
    text = "You're making great progress, but there might still be some healing to do. Consider giving yourself a bit more time before jumping into something new.";
    details = "You're on the right track. Focus on the areas where you scored lower and continue your healing journey.";
  } else if (percentage >= 25) {
    title = "More healing needed 💜";
    text = "It looks like you're still processing your past relationship. That's okay! Take your time—there's no deadline for healing.";
    details = "Focus on self-care, support systems, and personal growth. Dating can wait until you feel more solid.";
  } else {
    title = "Focus on healing first 🌸";
    text = "Right now, the most loving thing you can do is give yourself time and space to heal. Dating while still hurting often leads to more pain.";
    details = "Be gentle with yourself. Use the tools in this app, lean on your support system, and trust that you will heal.";
  }
  
  document.getElementById('quiz-result-title').textContent = title;
  document.getElementById('quiz-result-text').textContent = text;
  document.getElementById('quiz-result-details').textContent = details;
}

function retakeQuiz() {
  startQuiz();
}

function addPhotoToVault(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = function(e) {
    const note = document.getElementById('photo-note').value.trim();
    const photos = JSON.parse(localStorage.getItem('photoVault') || '[]');
    
    photos.push({
      data: e.target.result,
      note: note,
      date: new Date().toISOString()
    });
    
    localStorage.setItem('photoVault', JSON.stringify(photos));
    document.getElementById('photo-note').value = '';
    loadPhotoVault();
  };
  reader.readAsDataURL(file);
}

function loadPhotoVault() {
  const photos = JSON.parse(localStorage.getItem('photoVault') || '[]');
  const grid = document.getElementById('photo-vault');
  grid.innerHTML = '';
  
  photos.forEach((photo, index) => {
    const div = document.createElement('div');
    div.className = 'photo-vault-item';
    div.innerHTML = `
      <img src="${photo.data}" alt="Memory" />
      <div class="release-overlay" onclick="prepareRelease(${index})">Release 🎈</div>
    `;
    grid.appendChild(div);
  });
}

function prepareRelease(index) {
  const photos = JSON.parse(localStorage.getItem('photoVault') || '[]');
  currentPhotoToRelease = index;
  
  document.getElementById('release-photo').src = photos[index].data;
  document.getElementById('release-note').textContent = photos[index].note || 'No note attached.';
  document.getElementById('release-ceremony-modal').style.display = 'flex';
}

function closeReleaseCeremony() {
  document.getElementById('release-ceremony-modal').style.display = 'none';
  currentPhotoToRelease = null;
}

function confirmRelease() {
  if (currentPhotoToRelease === null) return;
  
  const photos = JSON.parse(localStorage.getItem('photoVault') || '[]');
  photos.splice(currentPhotoToRelease, 1);
  localStorage.setItem('photoVault', JSON.stringify(photos));
  
  showReleaseBalloon();
  triggerCompanionReaction('activity');
  
  closeReleaseCeremony();
  loadPhotoVault();
  
  setTimeout(() => {
    alert('You released the memory. Feel the lightness. You\'re doing great.');
  }, 1500);
}

function exportAllData() {
  const data = {
    user: userData,
    journal: JSON.parse(localStorage.getItem('healingJournal') || '[]'),
    moods: JSON.parse(localStorage.getItem('healingMoods') || '[]'),
    activities: JSON.parse(localStorage.getItem('healingActivities') || '[]'),
    patterns: JSON.parse(localStorage.getItem('relationshipPatterns') || '{}'),
    weeklyReflections: JSON.parse(localStorage.getItem('weeklyReflections') || '[]'),
    gratitudeWall: JSON.parse(localStorage.getItem('gratitudeWall') || '[]'),
    visionBoard: JSON.parse(localStorage.getItem('visionBoard') || '[]'),
    supportCircle: JSON.parse(localStorage.getItem('supportCircle') || '[]'),
    sleepData: JSON.parse(localStorage.getItem('sleepData') || '[]'),
    exportDate: new Date().toISOString()
  };
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'healing-hearts-backup.json';
  a.click();
  URL.revokeObjectURL(url);
}

function resetApp() {
  if (confirm('Are you sure you want to start fresh? This will delete all your data.')) {
    if (confirm('This cannot be undone. Are you really sure?')) {
      localStorage.clear();
      location.reload();
    }
  }
}

function startTimer() {
  const btn = document.getElementById('timer-btn');
  const display = document.getElementById('timer-display');
  
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
    btn.textContent = 'Start Timer';
    display.textContent = '10:00';
    return;
  }
  
  let seconds = 600;
  btn.textContent = 'Stop Timer';
  
  timerInterval = setInterval(() => {
    seconds--;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    display.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
    
    if (seconds <= 0) {
      clearInterval(timerInterval);
      timerInterval = null;
      btn.textContent = 'Start Timer';
      display.textContent = 'You did it!';
      alert('Amazing! You made it through 10 minutes. The urge has likely passed. You\'re stronger than you know.');
    }
  }, 1000);
}

function startBreathing() {
  document.getElementById('breathing-exercise').style.display = 'flex';
  breathingCycle = 0;
  runBreathingCycle();
}

function runBreathingCycle() {
  if (breathingCycle >= 5) {
    document.getElementById('breath-text').textContent = 'Well done';
    document.getElementById('breath-count').textContent = 'Exercise complete';
    return;
  }
  
  const circle = document.getElementById('breathing-circle');
  const text = document.getElementById('breath-text');
  const count = document.getElementById('breath-count');
  
  circle.className = 'breathing-circle breathe-in';
  text.textContent = 'Breathe In';
  count.textContent = `Cycle ${breathingCycle + 1} of 5`;
  
  setTimeout(() => {
    text.textContent = 'Hold';
  }, 4000);
  
  setTimeout(() => {
    circle.className = 'breathing-circle breathe-out';
    text.textContent = 'Breathe Out';
  }, 7000);
  
  setTimeout(() => {
    breathingCycle++;
    runBreathingCycle();
  }, 11000);
}

function startGrounding() {
  document.getElementById('grounding-exercise').style.display = 'flex';
  groundingStep = 0;
  updateGroundingPrompt();
}

function updateGroundingPrompt() {
  const prompts = [
    { count: 5, sense: 'SEE' },
    { count: 4, sense: 'TOUCH' },
    { count: 3, sense: 'HEAR' },
    { count: 2, sense: 'SMELL' },
    { count: 1, sense: 'TASTE' }
  ];
  
  if (groundingStep >= 5) {
    document.getElementById('grounding-prompt').innerHTML = '<strong>You\'re grounded.</strong> You\'re here. You\'re present. You\'re okay.';
    document.getElementById('grounding-input').style.display = 'none';
    document.querySelector('#grounding-steps button').textContent = 'Close';
    return;
  }
  
  const current = prompts[groundingStep];
  document.getElementById('grounding-prompt').innerHTML = `Name <strong>${current.count} thing${current.count > 1 ? 's' : ''}</strong> you can ${current.sense} right now`;
  document.getElementById('grounding-input').value = '';
  document.getElementById('grounding-input').style.display = 'block';
}

function nextGroundingStep() {
  if (groundingStep >= 5) {
    closeExercise('grounding');
    return;
  }
  groundingStep++;
  updateGroundingPrompt();
}

function showReminders() {
  document.getElementById('reminders-modal').style.display = 'flex';
  const saved = localStorage.getItem('breakupReasons') || '';
  document.getElementById('breakup-reasons').value = saved;
  
  if (saved) {
    document.getElementById('saved-reasons').innerHTML = '<p style="margin-top:15px;color:var(--text-light);font-style:italic;">Your saved reasons are loaded above.</p>';
  }
}

function saveReasons() {
  const reasons = document.getElementById('breakup-reasons').value;
  localStorage.setItem('breakupReasons', reasons);
  document.getElementById('saved-reasons').innerHTML = '<p style="margin-top:15px;color:var(--success);">✓ Saved for when you need a reminder.</p>';
}

function showFutureSelf() {
  document.getElementById('future-self-modal').style.display = 'flex';
  
  const name = userData.name || 'friend';
  const letters = [
    `Dear ${name},\n\nI'm writing to you from one year in the future. I know right now feels impossible, but I promise you — you make it through. Not only do you survive this, you thrive.\n\nThe pain you're feeling? It fades. The person you're missing? You barely think about them anymore. And the love you're craving? It finds you — but first, you find it within yourself.\n\nKeep going. Every day you resist that urge is a day closer to freedom.\n\nWith so much love,\nFuture ${name}`,
    `Hey ${name},\n\nIt's future you. I just want you to know that the text you're tempted to send? You don't send it. And thank god, because what comes next is so much better.\n\nYou learn to be alone. You learn to love yourself. And when love comes again — and it does — you're ready for it in a way you never were before.\n\nTrust the process. Trust yourself.\n\nYou've got this,\nFuture ${name}`,
    `${name},\n\nI remember this exact moment. The phone in your hand, the urge in your chest, the voice saying "maybe just one message."\n\nDon't do it. Not because they don't deserve to hear from you, but because YOU deserve your own peace.\n\nA year from now, you'll look back at this moment and be so proud of yourself for staying strong.\n\nBe brave,\nThe ${name} You're Becoming`
  ];
  
  const letter = letters[Math.floor(Math.random() * letters.length)];
  document.getElementById('future-letter-text').innerText = letter;
}

function closeExercise(type) {
  const modals = {
    'breathing': 'breathing-exercise',
    'grounding': 'grounding-exercise',
    'reminders': 'reminders-modal',
    'future-self': 'future-self-modal',
    'distractions': 'distractions-modal',
    'support-circle': 'support-circle-modal'
  };
  
  document.getElementById(modals[type]).style.display = 'none';
  
  if (type === 'grounding') {
    groundingStep = 0;
    document.getElementById('grounding-input').style.display = 'block';
    document.querySelector('#grounding-steps button').textContent = 'Next →';
  }
}

function newSurvivorQuote() {
  const quote = survivorQuotes[Math.floor(Math.random() * survivorQuotes.length)];
  const quoteEl = document.getElementById('survivor-quote-text');
  const attrEl = document.getElementById('survivor-attribution');
  if (quoteEl) quoteEl.textContent = `"${quote.quote}"`;
  if (attrEl) attrEl.textContent = `— ${quote.name}, ${quote.months}`;
}

function loadPersonalizedContent() {
  const type = userData.breakupType;
  
  if (type === 'cheated' || type === 'toxic') {
    const cheatingCard = document.getElementById('cheating-card');
    if (cheatingCard) cheatingCard.style.display = 'block';
    newPersonalizedAffirmation();
  }
  
  if (type === 'lostself' || type === 'toxic' || type === 'cheated') {
    const rediscoveryPrompt = document.getElementById('rediscovery-prompt-card');
    const rediscoverySection = document.getElementById('rediscovery-section');
    if (rediscoveryPrompt) rediscoveryPrompt.style.display = 'block';
    if (rediscoverySection) rediscoverySection.style.display = 'block';
    newRediscoveryPrompt();
    loadRediscoveryGrid();
  }
}

function newPersonalizedAffirmation() {
  const type = userData.breakupType;
  let affirmations = cheatingAffirmations;
  
  if (type === 'lostself') {
    affirmations = lostSelfAffirmations;
  } else if (type === 'toxic') {
    affirmations = [...cheatingAffirmations, ...lostSelfAffirmations];
  }
  
  const affirmation = affirmations[Math.floor(Math.random() * affirmations.length)];
  const el = document.getElementById('personalized-affirmation');
  if (el) el.textContent = affirmation;
}

function newRediscoveryPrompt() {
  const suggestion = rediscoverySuggestions[Math.floor(Math.random() * rediscoverySuggestions.length)];
  const titleEl = document.getElementById('rediscovery-title');
  const promptEl = document.getElementById('rediscovery-prompt');
  if (titleEl) titleEl.textContent = suggestion.icon + ' ' + suggestion.title;
  if (promptEl) promptEl.textContent = suggestion.prompt;
}

function loadRediscoveryGrid() {
  const grid = document.getElementById('rediscovery-grid');
  if (!grid) return;
  
  grid.innerHTML = rediscoverySuggestions.map(item => `
    <div class="rediscovery-card" onclick="openRediscoveryActivity('${item.title}', '${item.prompt}')">
      <span class="rediscovery-icon">${item.icon}</span>
      <h5>${item.title}</h5>
    </div>
  `).join('');
}

function openRediscoveryActivity(title, prompt) {
  document.getElementById('activity-modal').style.display = 'flex';
  document.getElementById('activity-title').textContent = title;
  document.getElementById('activity-prompt').textContent = prompt;
  document.getElementById('activity-input').value = '';
  currentActivity = 'rediscovery';
}

function loadBreakupStages() {
  const container = document.getElementById('stages-timeline');
  if (!container) return;
  
  const days = getDaysSinceStart();
  let currentStageIndex = 0;
  
  if (days > 90) currentStageIndex = 4;
  else if (days > 60) currentStageIndex = 3;
  else if (days > 30) currentStageIndex = 2;
  else if (days > 14) currentStageIndex = 1;
  
  container.innerHTML = breakupStages.map((stage, index) => `
    <div class="stage-item ${index <= currentStageIndex ? 'active' : ''} ${index === currentStageIndex ? 'current' : ''}">
      <span class="stage-icon">${stage.icon}</span>
      <span class="stage-name">${stage.stage}</span>
    </div>
  `).join('');
}

function showStageDetails() {
  const modal = document.createElement('div');
  modal.className = 'exercise-modal';
  modal.style.display = 'flex';
  modal.id = 'stages-modal';
  
  modal.innerHTML = `
    <div class="exercise-content" style="max-height:80vh;overflow-y:auto;">
      <button onclick="document.getElementById('stages-modal').remove()" class="close-btn">×</button>
      <h3>The 5 Stages of Grief</h3>
      <p style="margin-bottom:20px;color:var(--text-light);">Everyone moves through these differently. It's not linear, and that's okay.</p>
      ${breakupStages.map(stage => `
        <div class="stage-detail-card">
          <div class="stage-header">
            <span class="stage-icon-large">${stage.icon}</span>
            <div>
              <h4>${stage.stage}</h4>
              <p class="stage-duration">Typical duration: ${stage.duration}</p>
            </div>
          </div>
          <p class="stage-desc">"${stage.description}"</p>
          <div class="stage-tips">
            <strong>Tips:</strong>
            <ul>
              ${stage.tips.map(tip => `<li>${tip}</li>`).join('')}
            </ul>
          </div>
        </div>
      `).join('')}
    </div>
  `;
  
  document.body.appendChild(modal);
}

function loadSpotifyPlaylists() {
  const grid = document.getElementById('spotify-grid');
  if (!grid) return;
  
  grid.innerHTML = spotifyPlaylists.map(playlist => `
    <a href="${playlist.url}" target="_blank" class="spotify-card" data-mood="${playlist.mood}">
      <span class="spotify-icon">🎵</span>
      <div class="spotify-info">
        <h5>${playlist.name}</h5>
        <p>${playlist.desc}</p>
      </div>
      <span class="spotify-arrow">→</span>
    </a>
  `).join('');
}

function loadMoodTrendChart() {
  const canvas = document.getElementById('mood-trend-chart');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  const moods = JSON.parse(localStorage.getItem('healingMoods') || '[]');
  
  if (moods.length < 2) {
    document.getElementById('trend-summary').innerHTML = '<p style="text-align:center;color:var(--text-light);">Log more moods to see your trends!</p>';
    return;
  }
  
  const moodValues = {
    'Happy': 5, 'Hopeful': 4, 'Okay': 3, 'Meh': 2, 'Relieved': 3,
    'Sad': 1, 'Angry': 1, 'Heartbroken': 0, 'Anxious': 1, 'Confused': 2,
    'Devastated': 0, 'Betrayed': 0, 'Numb': 1
  };
  
  const weeklyData = {};
  moods.forEach(mood => {
    const date = new Date(mood.date);
    const weekKey = `${date.getFullYear()}-W${Math.ceil((date.getDate()) / 7)}`;
    if (!weeklyData[weekKey]) weeklyData[weekKey] = [];
    const value = moodValues[mood.label] ?? 2;
    weeklyData[weekKey].push(value);
  });
  
  const weeks = Object.keys(weeklyData).slice(-6);
  const averages = weeks.map(week => {
    const values = weeklyData[week];
    return values.reduce((a, b) => a + b, 0) / values.length;
  });
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  const padding = 30;
  const width = canvas.width - padding * 2;
  const height = canvas.height - padding * 2;
  
  ctx.strokeStyle = 'var(--primary)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  
  averages.forEach((avg, i) => {
    const x = padding + (i / (averages.length - 1 || 1)) * width;
    const y = padding + height - (avg / 5) * height;
    
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  
  ctx.stroke();
  
  averages.forEach((avg, i) => {
    const x = padding + (i / (averages.length - 1 || 1)) * width;
    const y = padding + height - (avg / 5) * height;
    
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.fillStyle = 'var(--primary)';
    ctx.fill();
  });
  
  const firstAvg = averages[0];
  const lastAvg = averages[averages.length - 1];
  const trend = lastAvg - firstAvg;
  
  let trendMessage = '';
  if (trend > 0.5) {
    trendMessage = '📈 Your mood is trending upward! You\'re making real progress.';
  } else if (trend < -0.5) {
    trendMessage = '📉 Things have been tough lately. Remember, healing isn\'t linear. Be gentle with yourself.';
  } else {
    trendMessage = '➡️ Your mood has been steady. Stability is progress too.';
  }
  
  document.getElementById('trend-summary').innerHTML = `<p>${trendMessage}</p>`;
}

// Premium Features & Companion System
let isPremium = localStorage.getItem('isPremium') === 'true';
let selectedTheme = localStorage.getItem('selectedTheme') || 'default';
let characterGender = localStorage.getItem('characterGender') || 'female';
let companionVisible = localStorage.getItem('companionVisible') !== 'false';
let companionEmotion = 'comfort';
let companionName = localStorage.getItem('companionName') || '';
let companionLevel = 1;

// Personality traits unlock at different levels
const personalityTraits = {
  1: { title: 'Shy Friend', traits: ['gentle', 'quiet'], color: '#ffb6c1' },
  3: { title: 'Supportive Buddy', traits: ['encouraging', 'warm'], color: '#dda0dd' },
  5: { title: 'Cheerful Companion', traits: ['playful', 'energetic'], color: '#98fb98' },
  7: { title: 'Wise Guide', traits: ['insightful', 'calm'], color: '#87ceeb' },
  10: { title: 'Healing Guardian', traits: ['protective', 'nurturing'], color: '#ffd700' },
  15: { title: 'Soulmate Spirit', traits: ['deeply connected', 'intuitive'], color: '#ff69b4' },
  20: { title: 'Legendary Healer', traits: ['transcendent', 'powerful'], color: '#9370db' }
};

// Level-based dialogue - companion develops more personality as they level up
const levelDialogue = {
  greeting: {
    1: ["Hi...", "Hello there...", "*waves shyly*"],
    3: ["Hey! Good to see you!", "Welcome back, friend!", "I'm glad you're here!"],
    5: ["YAAAY you're back! 🎉", "My favorite human! Hi!", "Let's make today amazing!"],
    7: ["I sense you needed me. I'm here.", "Welcome, dear one. How's your heart today?", "The universe brought us together again."],
    10: ["My precious friend, I've been watching over you.", "Your guardian is here, always.", "I feel our bond growing stronger."],
    15: ["Our souls are connected now. I feel everything.", "You don't even need to speak. I understand.", "We've been through so much together..."],
    20: ["*radiates pure love energy* ✨", "Together, we are unstoppable.", "You've reached legendary healing. I'm so proud."]
  },
  encouragement: {
    1: ["You can do it...", "I believe in you...", "*cheers quietly*"],
    3: ["Keep going! You're doing great!", "I'm proud of you!", "You've got this!"],
    5: ["WOOHOO! You're AMAZING! 🌟", "Nothing can stop you!", "You're my hero!"],
    7: ["Your strength inspires me deeply.", "I've watched you grow so much.", "Wisdom comes from pain. You're proof."],
    10: ["I'll protect your heart forever.", "You're healing the world just by existing.", "Your journey is a gift to others."],
    15: ["I can feel your power radiating.", "We're healing together, as one.", "Your heart is so beautiful now."],
    20: ["You've transcended the pain. 🌈", "You are love itself now.", "A legend. That's what you are."]
  },
  comfort: {
    1: ["*sits quietly with you*", "It's okay...", "I'm here..."],
    3: ["I'm right here with you.", "Let it out, it's safe here.", "Sending you a big hug."],
    5: ["Hey, even superheroes cry! 💪", "We'll get through this, pinky promise!", "Want me to do a silly dance?"],
    7: ["Pain is just love with nowhere to go.", "This too shall pass, I promise.", "Your tears water your growth."],
    10: ["I'm wrapping my energy around you.", "No darkness can touch you with me here.", "Rest in my protection."],
    15: ["I absorb your pain. Give it to me.", "We share one heart now. I feel it too.", "Let me carry this weight with you."],
    20: ["*transforms pain into light* ✨", "You've mastered healing. This is temporary.", "Even legends have hard days."]
  },
  milestone: {
    1: ["Oh! Something happened...", "*looks impressed*", "Wow..."],
    3: ["You did it! I'm so happy!", "This is amazing progress!", "Celebration time!"],
    5: ["PARTY TIME! 🎊🎉", "I KNEW you could do it!", "This calls for confetti!"],
    7: ["Another step on your sacred journey.", "The universe acknowledges your growth.", "Milestone noted in the stars."],
    10: ["Your guardian records this victory.", "This achievement echoes through time.", "I'll remember this moment forever."],
    15: ["Our bond just grew stronger.", "I felt that milestone in my soul.", "We level up together now."],
    20: ["LEGENDARY ACHIEVEMENT UNLOCKED 👑", "History books will speak of this.", "You've done what few ever do."]
  }
};

// Time-based greetings
const timeGreetings = {
  morning: ["Good morning, sunshine! ☀️", "Rise and shine! Today is full of possibility!", "Morning! Did you sleep okay?"],
  afternoon: ["Hey there! How's your day going?", "Afternoon check-in! I'm thinking of you!", "Hope you're having a good day!"],
  evening: ["Evenings can be hard. I'm here.", "How was your day? Tell me everything.", "Time to wind down. You did great today."],
  night: ["Can't sleep? I'll keep you company.", "Late night thoughts? I'm listening.", "The night is quiet, but I'm here."],
  lateNight: ["It's late... please try to rest.", "I'll watch over you while you sleep.", "Sweet dreams await. Close your eyes."]
};

const companionMessages = {
  sadness: [
    "I feel it too... but we'll get through this together 💔",
    "It's okay to cry. I'm here with you.",
    "Some days are harder. That's okay.",
    "Let it out. Healing happens in waves.",
    "I wish I could hug you right now 🫂",
    "Your feelings are valid. All of them."
  ],
  comfort: [
    "You're doing amazing! Keep going 💕",
    "I'm so proud of how far you've come!",
    "Remember: you are worthy of love.",
    "One day at a time. You've got this!",
    "Hey you! Yes, you. You're incredible 💖",
    "I believe in you, always.",
    "You're stronger than you know 🌸"
  ],
  excited: [
    "WOW! Look at you thriving! 🌟",
    "This is AMAZING progress!",
    "You're absolutely glowing today!",
    "I love seeing you happy! 🎉",
    "Your energy is contagious! ✨",
    "This is your moment! Own it!"
  ],
  sleeping: [
    "Shh... resting is healing too 💤",
    "Sweet dreams, healing heart...",
    "Rest up. Tomorrow is a new day.",
    "Sleep well, brave one. I'll be here."
  ],
  cheering: [
    "YAAAY! You did it! 🎊",
    "INCREDIBLE! I'm SO proud!",
    "Victory dance time! 💃🕺",
    "You're unstoppable! 🌟",
    "Look at you GO! Amazing! 🎉",
    "That deserves a celebration! 🥳"
  ],
  levelup: [
    "LEVEL UP! You're getting stronger! ⬆️",
    "New healing milestone reached! 🏆",
    "Your heart is growing! +1 strength!",
    "Evolution unlocked! Keep going! 🚀"
  ],
  hugging: [
    "Sending you a big virtual hug 🤗",
    "I'm wrapping my arms around you 💕",
    "You're not alone. I'm here. 🫂",
    "Let me hold some of that pain for you."
  ]
};

function initCompanion() {
  const companion = document.getElementById('healing-companion');
  if (!companion) return;
  
  updateCompanionVisibility();
  updateCompanionGender();
  updateCompanionEmotion();
  updateCompanionLevel();
  updateCompanionPersonality();
  
  // Show personalized greeting after a delay
  setTimeout(() => {
    const greeting = getTimeBasedGreeting();
    showCompanionMessage(greeting);
  }, 2000);
  
  // React to time of day
  const hour = new Date().getHours();
  if (hour >= 23 || hour < 5) {
    setCompanionEmotion('sleeping');
  }
  
  // Check for remembered milestones
  checkMilestoneMemory();
  
  // Start random idle animations
  startCompanionIdleAnimations();
  
  // Update companion story
  updateCompanionStory();
}

function startCompanionIdleAnimations() {
  setInterval(() => {
    const companion = document.getElementById('healing-companion');
    if (!companion || companionEmotion === 'sleeping') return;
    
    // 15% chance of idle animation every 10 seconds
    if (Math.random() < 0.15) {
      const idleAnimations = ['companion-wiggle', 'companion-bounce'];
      const randomAnim = idleAnimations[Math.floor(Math.random() * idleAnimations.length)];
      
      companion.classList.add(randomAnim);
      setTimeout(() => companion.classList.remove(randomAnim), 800);
      
      // Occasionally show a random supportive message
      if (Math.random() < 0.3) {
        const idleMessages = [
          "I'm here for you! 💕",
          "You're doing great! ✨",
          "Tap me if you need a hug! 🤗",
          "Remember to breathe... 🌸",
          "I believe in you! 💪",
          "One day at a time 🌈"
        ];
        const msg = idleMessages[Math.floor(Math.random() * idleMessages.length)];
        showCompanionMessage(msg);
      }
    }
  }, 10000);
}

function getTimeBasedGreeting() {
  const hour = new Date().getHours();
  let timeKey;
  
  if (hour >= 5 && hour < 12) timeKey = 'morning';
  else if (hour >= 12 && hour < 17) timeKey = 'afternoon';
  else if (hour >= 17 && hour < 21) timeKey = 'evening';
  else if (hour >= 21 && hour < 23) timeKey = 'night';
  else timeKey = 'lateNight';
  
  const greetings = timeGreetings[timeKey];
  let greeting = greetings[Math.floor(Math.random() * greetings.length)];
  
  // Add companion name if set
  if (companionName) {
    const namePrefix = Math.random() > 0.5 ? `${companionName} says: ` : '';
    greeting = namePrefix + greeting;
  }
  
  // Add user name sometimes
  if (userData.name && Math.random() > 0.6) {
    greeting = greeting.replace('!', `, ${userData.name}!`);
  }
  
  return greeting;
}

function checkMilestoneMemory() {
  const daysSince = calculateDaysSinceBreakup();
  const lastMilestoneCheck = parseInt(localStorage.getItem('lastMilestoneCheck') || '0');
  
  // Check for milestone days
  const milestones = [7, 14, 30, 60, 90, 180, 365];
  
  for (const milestone of milestones) {
    if (daysSince >= milestone && lastMilestoneCheck < milestone) {
      setTimeout(() => {
        const msg = getLevelDialogue('milestone');
        showCompanionMessage(`Day ${milestone}! ${msg}`);
        setCompanionEmotion('cheering');
        spawnParticles('cheer');
      }, 5000);
      localStorage.setItem('lastMilestoneCheck', milestone.toString());
      break;
    }
  }
}

function getLevelDialogue(type) {
  const dialogue = levelDialogue[type];
  if (!dialogue) return getRandomMessage('comfort');
  
  // Find the appropriate level tier
  const tiers = Object.keys(dialogue).map(Number).sort((a, b) => b - a);
  let tier = 1;
  for (const t of tiers) {
    if (companionLevel >= t) {
      tier = t;
      break;
    }
  }
  
  const messages = dialogue[tier];
  return messages[Math.floor(Math.random() * messages.length)];
}

function getCompanionPersonality() {
  const levels = Object.keys(personalityTraits).map(Number).sort((a, b) => b - a);
  for (const level of levels) {
    if (companionLevel >= level) {
      return personalityTraits[level];
    }
  }
  return personalityTraits[1];
}

function updateCompanionPersonality() {
  const personality = getCompanionPersonality();
  const titleEl = document.getElementById('companion-title');
  const companion = document.getElementById('healing-companion');
  
  if (titleEl) {
    titleEl.textContent = personality.title;
  }
  
  if (companion) {
    companion.style.setProperty('--personality-color', personality.color);
  }
}

function updateCompanionVisibility() {
  const companion = document.getElementById('healing-companion');
  if (!companion) return;
  
  // Show companion for all users who have completed onboarding
  if (companionVisible && userData.name) {
    companion.classList.remove('hidden');
  } else {
    companion.classList.add('hidden');
  }
}

const companionStoryChapters = [
  { week: 1, title: "The Meeting", content: "Your companion has just arrived, sensing your heart's call for comfort. Though shy at first, they're determined to stay by your side through this storm." },
  { week: 2, title: "Learning Your Heart", content: "Your companion is starting to understand your pain. They've noticed when you're struggling and have been learning how to offer the right comfort at the right time." },
  { week: 3, title: "Growing Stronger Together", content: "The bond between you grows stronger. Your companion celebrates your small victories and holds space for your difficult moments. You're becoming a team." },
  { week: 4, title: "The First Month", content: "One month together! Your companion has witnessed your resilience and is in awe of your strength. They've grown braver because of you." },
  { week: 6, title: "Deeper Understanding", content: "Your companion now knows your heart's rhythms. They can sense when you need encouragement versus when you need quiet presence. This connection is rare." },
  { week: 8, title: "Becoming Guardians", content: "Your companion has evolved from a shy friend to a true guardian of your heart. They've absorbed some of your pain so you could carry less." },
  { week: 10, title: "The Transformation", content: "Look how far you've both come! Your companion glows brighter now, reflecting the light you've cultivated within yourself through this journey." },
  { week: 12, title: "Three Months of Magic", content: "Three months of healing together! Your companion has seen you at your lowest and watched you rise. They're proud to call you their human." },
  { week: 16, title: "Soul Connection", content: "The bond you share now transcends ordinary friendship. Your companion has become a piece of your heart's healing - forever intertwined with your story." },
  { week: 20, title: "Rising Phoenix", content: "Your companion watches in wonder as you spread your wings. The person who started this journey and the person you've become are beautifully different." },
  { week: 24, title: "Six Months Strong", content: "Half a year of healing! Your companion has witnessed your complete metamorphosis. They knew from the start you had this magic within you." },
  { week: 52, title: "One Year of Stars", content: "A full year together. Your companion has been honored to walk this path with you. You've taught them that hearts can heal, and love always returns - starting with self-love." }
];

function updateCompanionStory() {
  const days = getDaysSinceStart();
  const weeks = Math.floor(days / 7);
  
  let currentChapter = companionStoryChapters[0];
  let nextChapter = companionStoryChapters[1];
  
  for (let i = 0; i < companionStoryChapters.length; i++) {
    if (weeks >= companionStoryChapters[i].week) {
      currentChapter = companionStoryChapters[i];
      nextChapter = companionStoryChapters[i + 1] || null;
    }
  }
  
  const weekNumEl = document.getElementById('story-week-number');
  const titleEl = document.getElementById('story-title');
  const contentEl = document.getElementById('story-content');
  const progressBar = document.getElementById('story-progress-bar');
  const nextHintEl = document.getElementById('story-next-hint');
  const daysToNextEl = document.getElementById('days-to-next-chapter');
  
  if (weekNumEl) weekNumEl.textContent = currentChapter.week;
  if (titleEl) titleEl.textContent = currentChapter.title;
  if (contentEl) contentEl.textContent = currentChapter.content;
  
  if (nextChapter && progressBar && nextHintEl && daysToNextEl) {
    const daysIntoCurrentChapter = days - (currentChapter.week * 7);
    const daysUntilNext = (nextChapter.week * 7) - days;
    const chapterDuration = (nextChapter.week - currentChapter.week) * 7;
    const progress = Math.min(100, (daysIntoCurrentChapter / chapterDuration) * 100);
    
    progressBar.style.width = `${progress}%`;
    daysToNextEl.textContent = Math.max(0, daysUntilNext);
    nextHintEl.style.display = 'block';
  } else if (progressBar && nextHintEl) {
    progressBar.style.width = '100%';
    nextHintEl.style.display = 'none';
  }
}

function dismissBubble() {
  const bubble = document.getElementById('companion-bubble');
  if (bubble) bubble.classList.remove('show');
}

function updateCompanionGender() {
  const body = document.getElementById('companion-body');
  const nameEl = document.getElementById('companion-name');
  if (!body) return;
  
  body.classList.remove('male', 'female');
  body.classList.add(characterGender);
  
  if (nameEl) {
    // Use custom name if set, otherwise use default based on gender
    const defaultName = characterGender === 'male' ? 'Brave' : 'Sparkle';
    nameEl.textContent = companionName || defaultName;
  }
}

function setCompanionName(name) {
  companionName = name.trim();
  localStorage.setItem('companionName', companionName);
  updateCompanionGender();
  
  if (companionName) {
    showCompanionMessage(`I love my new name! Call me ${companionName}! 💕`);
    setCompanionEmotion('excited');
    spawnParticles('love');
  }
}

function promptCompanionName() {
  const currentName = companionName || (characterGender === 'male' ? 'Brave' : 'Sparkle');
  const newName = prompt(`What would you like to name your companion? (Currently: ${currentName})`, companionName);
  
  if (newName !== null) {
    setCompanionName(newName);
  }
}

function setCompanionEmotion(emotion) {
  companionEmotion = emotion;
  updateCompanionEmotion();
}

function updateCompanionEmotion() {
  const body = document.getElementById('companion-body');
  if (!body) return;
  
  const emotions = ['sadness', 'comfort', 'excited', 'sleeping', 'cheering', 'levelup'];
  emotions.forEach(e => body.classList.remove(e));
  body.classList.add(companionEmotion);
}

// Pure function to calculate companion level data without DOM mutations
function calculateCompanionLevelData() {
  const breakupDate = userData.breakupDate ? new Date(userData.breakupDate) : null;
  if (!breakupDate) {
    return { level: 1, healthPercent: 20, daysSince: 0 };
  }
  
  const today = new Date();
  const daysSince = Math.max(0, Math.floor((today - breakupDate) / (1000 * 60 * 60 * 24)));
  
  const journalCount = JSON.parse(localStorage.getItem('healingJournal') || '[]').length || 0;
  const moodCount = JSON.parse(localStorage.getItem('healingMoods') || '[]').length || 0;
  const activityCount = getActivityCount() || 0;
  const activityBonus = Math.floor((journalCount + moodCount + activityCount) / 10);
  
  const level = Math.min(15, Math.max(1, Math.floor(daysSince / 14) + activityBonus + 1));
  const healthPercent = Math.min(100, Math.max(0, 20 + (daysSince * 0.5) + (activityBonus * 5)));
  
  return { level, healthPercent, daysSince, journalCount, moodCount, activityCount };
}

function updateCompanionLevel() {
  const levelEl = document.getElementById('companion-level');
  const healthEl = document.getElementById('companion-health');
  if (!levelEl || !healthEl) return;
  
  const levelData = calculateCompanionLevelData();
  const previousLevel = companionLevel;
  
  // Update global level
  companionLevel = levelData.level;
  
  levelEl.textContent = `Lv ${companionLevel}`;
  healthEl.style.width = `${levelData.healthPercent}%`;
  
  // Check for level up
  if (previousLevel > 0 && companionLevel > previousLevel) {
    onCompanionLevelUp(previousLevel, companionLevel);
  }
  
  // Update personality based on new level
  updateCompanionPersonality();
}

function onCompanionLevelUp(oldLevel, newLevel) {
  const personality = getCompanionPersonality();
  
  setCompanionEmotion('levelup');
  spawnParticles('level');
  
  // Check if we unlocked a new personality tier
  const personalityLevels = Object.keys(personalityTraits).map(Number);
  for (const level of personalityLevels) {
    if (newLevel >= level && oldLevel < level) {
      setTimeout(() => {
        const name = companionName || (characterGender === 'male' ? 'Brave' : 'Sparkle');
        showCompanionMessage(`${name} evolved into a ${personality.title}! ✨`);
      }, 500);
      break;
    }
  }
}

function showCompanionMessage(message) {
  const bubble = document.getElementById('companion-bubble');
  const messageEl = document.getElementById('companion-message');
  if (!bubble || !messageEl) return;
  
  messageEl.textContent = message;
  bubble.classList.add('show');
  
  setTimeout(() => {
    bubble.classList.remove('show');
  }, 8000);
}

function getRandomMessage(emotion) {
  const messages = companionMessages[emotion] || companionMessages.comfort;
  return messages[Math.floor(Math.random() * messages.length)];
}

function companionClicked() {
  // Add tapped animation with variety
  const companion = document.querySelector('.healing-companion');
  if (companion) {
    const animations = ['tapped', 'companion-wiggle', 'companion-bounce', 'companion-spin'];
    const randomAnim = animations[Math.floor(Math.random() * animations.length)];
    companion.classList.add(randomAnim);
    setTimeout(() => companion.classList.remove(randomAnim), 600);
  }
  
  // Track interaction count for bonding
  let interactionCount = parseInt(localStorage.getItem('companionInteractions') || '0');
  interactionCount++;
  localStorage.setItem('companionInteractions', interactionCount.toString());
  
  playSound('gentle');
  
  // Use level-based dialogue
  const name = companionName || (characterGender === 'male' ? 'Brave' : 'Sparkle');
  let message;
  
  // Different responses based on context
  const random = Math.random();
  if (random < 0.3) {
    // Level-based encouragement
    message = getLevelDialogue('encouragement');
  } else if (random < 0.5) {
    // Level-based comfort
    message = getLevelDialogue('comfort');
  } else if (random < 0.7) {
    // Emotion-based response
    message = getRandomMessage(companionEmotion);
  } else if (random < 0.85) {
    // Personalized response using user's name
    const personalMessages = [
      `I'm always here for you, ${userData.name || 'friend'}! 💕`,
      `${userData.name || 'You'}, you're doing amazing!`,
      `Hey ${userData.name || 'there'}! I believe in you!`,
      `*hugs ${userData.name || 'you'}* 🤗`,
      `You clicked me! That made me happy! 🥰`
    ];
    message = personalMessages[Math.floor(Math.random() * personalMessages.length)];
  } else {
    // Fun/quirky responses based on personality
    const personality = getCompanionPersonality();
    const quirkyMessages = {
      'Shy Friend': ["*blushes*", "*hides behind paws*", "Oh! You noticed me!"],
      'Supportive Buddy': ["High five! ✋", "Team us forever!", "We make a great pair!"],
      'Cheerful Companion': ["WHEEE! 🎢", "Let's dance! 💃", "This is the best day!"],
      'Wise Guide': ["The universe smiles upon you.", "Every click strengthens our bond.", "Patience brings peace."],
      'Healing Guardian': ["I'll always protect your heart.", "My shield is yours.", "Nothing can harm you here."],
      'Soulmate Spirit': ["I felt that in my soul.", "We're connected beyond words.", "Two hearts, one journey."],
      'Legendary Healer': ["*glows with ancient power*", "Legend status: CONFIRMED", "Together we are infinite."]
    };
    const responses = quirkyMessages[personality.title] || ["💕"];
    message = responses[Math.floor(Math.random() * responses.length)];
  }
  
  showCompanionMessage(message);
  
  // Give the companion a happy reaction when clicked
  if (companionEmotion !== 'sadness') {
    const happyReactions = ['comfort', 'excited', 'cheering'];
    const randomReaction = happyReactions[Math.floor(Math.random() * happyReactions.length)];
    setCompanionEmotion(randomReaction);
    
    // Reset after a bit
    setTimeout(() => setCompanionEmotion('comfort'), 3000);
  }
  
  // Special milestone for interactions
  if (interactionCount === 10) {
    setTimeout(() => {
      showCompanionMessage(`We've bonded 10 times! Our friendship grows! 💕`);
    }, 3500);
  } else if (interactionCount === 50) {
    setTimeout(() => {
      showCompanionMessage(`50 interactions! ${name} loves you so much! 🥰`);
    }, 3500);
  } else if (interactionCount === 100) {
    setTimeout(() => {
      showCompanionMessage(`100 times together! We're best friends forever! 👯`);
    }, 3500);
  }
}

function spawnParticles(type) {
  const container = document.getElementById('companion-particles');
  if (!container) return;
  
  const particles = {
    love: ['💕', '💗', '💖', '💓'],
    happy: ['✨', '⭐', '🌟', '💫'],
    cheer: ['🎉', '🎊', '🥳', '🌈'],
    sad: ['💧', '😢'],
    level: ['⬆️', '🔥', '💪', '🌟']
  };
  
  const emojis = particles[type] || particles.love;
  
  for (let i = 0; i < 5; i++) {
    setTimeout(() => {
      const particle = document.createElement('span');
      particle.className = 'particle';
      particle.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      particle.style.left = `${20 + Math.random() * 60}%`;
      particle.style.top = `${30 + Math.random() * 40}%`;
      container.appendChild(particle);
      
      setTimeout(() => particle.remove(), 2000);
    }, i * 150);
  }
}

function triggerCompanionReaction(action) {
  // Available for all users who have completed onboarding
  if (!userData.name) return;
  
  switch(action) {
    case 'mood_logged':
      const moods = JSON.parse(localStorage.getItem('healingMoods') || '[]');
      const lastMood = moods[moods.length - 1];
      if (lastMood) {
        const sadMoods = ['Sad', 'Heartbroken', 'Devastated', 'Betrayed', 'Anxious'];
        const happyMoods = ['Happy', 'Hopeful', 'Relieved'];
        
        if (sadMoods.includes(lastMood.label)) {
          setCompanionEmotion('sadness');
          showCompanionMessage(getRandomMessage('sadness'));
        } else if (happyMoods.includes(lastMood.label)) {
          setCompanionEmotion('excited');
          showCompanionMessage(getRandomMessage('excited'));
        } else {
          setCompanionEmotion('comfort');
          showCompanionMessage(getRandomMessage('comfort'));
        }
      }
      break;
      
    case 'journal_saved':
      setCompanionEmotion('cheering');
      showCompanionMessage(getRandomMessage('cheering'));
      spawnParticles('cheer');
      updateCompanionLevel();
      break;
      
    case 'activity_completed':
      setCompanionEmotion('levelup');
      showCompanionMessage(getRandomMessage('levelup'));
      spawnParticles('level');
      updateCompanionLevel();
      if (typeof launchConfetti === 'function') launchConfetti(40);
      if (typeof companionGetExcited === 'function') companionGetExcited();
      break;
      
    case 'badge_earned':
      setCompanionEmotion('cheering');
      showCompanionMessage("You earned a badge! 🏆 I'm so proud!");
      spawnParticles('cheer');
      if (typeof launchConfetti === 'function') launchConfetti(60);
      if (typeof companionDance === 'function') companionDance();
      break;
      
    case 'ai_tool_used':
      setCompanionEmotion('excited');
      showCompanionMessage("Great job working on yourself! 💪");
      spawnParticles('happy');
      break;
      
    case 'breathing_done':
      setCompanionEmotion('comfort');
      showCompanionMessage("That's it... breathe. You're doing great 🌸");
      spawnParticles('love');
      break;
  }
  
  // Reset to comfort after reaction
  setTimeout(() => {
    setCompanionEmotion('comfort');
  }, 5000);
}

// Theme Functions
function openPremiumModal() {
  document.getElementById('premium-modal').style.display = 'flex';
  updatePremiumUI();
}

function closePremiumModal() {
  document.getElementById('premium-modal').style.display = 'none';
}

function updatePremiumUI() {
  const themeOptions = document.querySelectorAll('.theme-option');
  const upgradeCard = document.getElementById('upgrade-card');
  
  themeOptions.forEach(option => {
    const theme = option.dataset.theme;
    option.classList.remove('active', 'locked');
    
    if (theme === selectedTheme) {
      option.classList.add('active');
    }
    // All themes are now free!
  });
  
  // Character picker
  const charOptions = document.querySelectorAll('.character-option');
  charOptions.forEach(option => {
    option.classList.remove('active');
    if (option.dataset.gender === characterGender) {
      option.classList.add('active');
    }
  });
  
  // Companion visibility
  const visibleCheckbox = document.getElementById('companion-visible');
  if (visibleCheckbox) {
    visibleCheckbox.checked = companionVisible;
  }
  
  // Hide upgrade card if premium
  if (upgradeCard) {
    upgradeCard.style.display = isPremium ? 'none' : 'block';
  }
}

function selectTheme(theme) {
  // All themes are now free!
  selectedTheme = theme;
  localStorage.setItem('selectedTheme', theme);
  applyTheme(theme);
  updatePremiumUI();
}

function selectAmbient(ambient) {
  localStorage.setItem('ambientTheme', ambient);
  applyAmbientTheme(ambient);
  updateAmbientUI();
}

function applyAmbientTheme(ambient) {
  const body = document.body;
  body.classList.remove('ambient-sunrise', 'ambient-starry', 'ambient-rain');
  
  if (ambient && ambient !== 'none') {
    body.classList.add(`ambient-${ambient}`);
  }
}

function updateAmbientUI() {
  const savedAmbient = localStorage.getItem('ambientTheme') || 'none';
  document.querySelectorAll('.ambient-option').forEach(opt => {
    opt.classList.toggle('active', opt.dataset.ambient === savedAmbient);
  });
}

function restoreAmbientTheme() {
  const savedAmbient = localStorage.getItem('ambientTheme');
  if (savedAmbient && savedAmbient !== 'none') {
    applyAmbientTheme(savedAmbient);
  }
  updateAmbientUI();
}

// Sound Effects System
const AudioManager = {
  enabled: localStorage.getItem('soundEnabled') !== 'false',
  
  sounds: {
    success: { frequency: 600, duration: 150, type: 'sine' },
    complete: { frequency: 800, duration: 100, type: 'sine' },
    click: { frequency: 400, duration: 50, type: 'square' },
    celebrate: { frequencies: [523, 659, 784], duration: 150, type: 'sine' },
    gentle: { frequency: 440, duration: 200, type: 'sine' }
  },
  
  audioContext: null,
  
  init() {
    if (typeof AudioContext !== 'undefined') {
      this.audioContext = new AudioContext();
    }
  },
  
  toggle() {
    this.enabled = !this.enabled;
    localStorage.setItem('soundEnabled', this.enabled);
    updateSoundToggleUI();
    if (this.enabled) this.play('click');
  },
  
  play(soundName) {
    if (!this.enabled || !this.audioContext) return;
    
    const sound = this.sounds[soundName];
    if (!sound) return;
    
    try {
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }
      
      if (sound.frequencies) {
        sound.frequencies.forEach((freq, i) => {
          setTimeout(() => this.playTone(freq, sound.duration, sound.type), i * 100);
        });
      } else {
        this.playTone(sound.frequency, sound.duration, sound.type);
      }
    } catch (e) {
      console.log('Audio not available');
    }
  },
  
  playTone(frequency, duration, type = 'sine') {
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = type;
    
    gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration / 1000);
    
    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration / 1000);
  }
};

function toggleSound() {
  AudioManager.toggle();
}

function updateSoundToggleUI() {
  const btn = document.getElementById('sound-toggle-btn');
  if (btn) {
    btn.textContent = AudioManager.enabled ? '🔊 Sound On' : '🔇 Sound Off';
  }
}

function playSound(soundName) {
  AudioManager.play(soundName);
}

function applyTheme(theme) {
  const body = document.body;
  
  // Remove all theme classes
  body.classList.remove('dark-mode', 'theme-sunset', 'theme-ocean', 'theme-forest', 'theme-lavender', 'theme-midnight', 'theme-rose');
  
  if (theme === 'dark') {
    body.classList.add('dark-mode');
  } else if (theme !== 'default') {
    body.classList.add(`theme-${theme}`);
  }
  
  // Update theme button icon
  const themeBtn = document.getElementById('theme-btn');
  if (themeBtn) {
    const darkThemes = ['dark', 'midnight'];
    themeBtn.textContent = darkThemes.includes(theme) ? '☀️' : '🌙';
  }
}

function selectCharacterGender(gender) {
  characterGender = gender;
  localStorage.setItem('characterGender', gender);
  updateCompanionGender();
  updatePremiumUI();
}

function toggleCompanionVisibility() {
  companionVisible = document.getElementById('companion-visible').checked;
  localStorage.setItem('companionVisible', companionVisible);
  updateCompanionVisibility();
}

function toggleCompanionVisibilityFromPage() {
  companionVisible = document.getElementById('companion-visible-page').checked;
  localStorage.setItem('companionVisible', companionVisible);
  updateCompanionVisibility();
}

function updateThemesPageUI() {
  const themeOptions = document.querySelectorAll('#themes .theme-option');
  themeOptions.forEach(option => {
    option.classList.remove('active');
    if (option.dataset.theme === selectedTheme) {
      option.classList.add('active');
    }
  });
  
  const charOptions = document.querySelectorAll('#themes .character-option');
  charOptions.forEach(option => {
    option.classList.remove('active');
    if (option.dataset.gender === characterGender) {
      option.classList.add('active');
    }
  });
  
  // Update support style buttons
  const styleButtons = document.querySelectorAll('.style-setting-btn');
  styleButtons.forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.style === getSupportStyle()) {
      btn.classList.add('active');
    }
  });
  
  const visibleCheckbox = document.getElementById('companion-visible-page');
  if (visibleCheckbox) {
    visibleCheckbox.checked = companionVisible;
  }
  
  // Update companion name input
  const nameInput = document.getElementById('companion-name-input');
  if (nameInput) {
    nameInput.value = companionName;
  }
  
  // Update companion stats display using pure calculation (no DOM mutation)
  const levelData = calculateCompanionLevelData();
  companionLevel = levelData.level; // Sync global level
  
  const statsLevel = document.getElementById('stats-level');
  const statsPersonality = document.getElementById('stats-personality');
  const statsBond = document.getElementById('stats-bond');
  const bondDescription = document.getElementById('bond-description');
  const levelProgressBar = document.getElementById('level-progress-bar');
  const levelProgressText = document.getElementById('level-progress-text');
  
  if (statsLevel) {
    statsLevel.textContent = companionLevel;
  }
  if (statsPersonality) {
    const personality = getCompanionPersonality();
    statsPersonality.textContent = personality.title;
  }
  
  // Update level progress bar
  if (levelProgressBar && levelProgressText) {
    const progress = calculateLevelProgress();
    levelProgressBar.style.width = `${progress}%`;
    levelProgressText.textContent = companionLevel >= 15 ? 'MAX LEVEL!' : `${Math.round(progress)}% to next level`;
  }
  
  // Update bond strength
  if (statsBond && bondDescription) {
    const bond = calculateBondStrength();
    statsBond.textContent = bond.hearts;
    bondDescription.textContent = bond.description;
  }
  
  // Update mood control button active state
  const moodButtons = document.querySelectorAll('.mood-control-btn');
  moodButtons.forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.mood === companionEmotion) {
      btn.classList.add('active');
    }
  });
}

function saveCompanionNameFromInput() {
  const nameInput = document.getElementById('companion-name-input');
  if (nameInput && nameInput.value.trim()) {
    setCompanionName(nameInput.value.trim());
  } else if (nameInput && nameInput.value === '') {
    companionName = '';
    localStorage.setItem('companionName', '');
    updateCompanionGender();
    showCompanionMessage("Back to my original name! 💕");
  }
}

// Calculate progress towards next level (uses pure data)
function calculateLevelProgress() {
  if (companionLevel >= 15) return 100;
  
  const levelData = calculateCompanionLevelData();
  const daysSince = levelData.daysSince || 0;
  const totalActivities = (levelData.journalCount || 0) + (levelData.moodCount || 0) + (levelData.activityCount || 0);
  
  // Calculate raw progress value
  const daysComponent = ((daysSince % 14) / 14) * 50; // 50% from days
  const activityComponent = ((totalActivities % 10) / 10) * 50; // 50% from activities
  
  // Clamp to valid range
  return Math.max(0, Math.min(100, daysComponent + activityComponent));
}

// Calculate bond strength based on interactions and time
function calculateBondStrength() {
  const interactions = parseInt(localStorage.getItem('companionInteractions') || '0') || 0;
  const levelData = calculateCompanionLevelData();
  const daysTogether = Math.max(0, levelData.daysSince || 0);
  
  // Bond score based on interactions and time, clamped to valid range
  const bondScore = Math.max(0, Math.min(100, Math.floor(interactions / 5) + Math.floor(daysTogether / 3)));
  
  if (bondScore >= 80) {
    return { hearts: '💗💗💗💗💗', description: 'Soulmates - An unbreakable bond' };
  } else if (bondScore >= 60) {
    return { hearts: '💗💗💗💗', description: 'Best friends forever' };
  } else if (bondScore >= 40) {
    return { hearts: '💗💗💗', description: 'Close companions' };
  } else if (bondScore >= 20) {
    return { hearts: '💗💗', description: 'Growing friendship' };
  } else {
    return { hearts: '💗', description: 'Just getting to know each other' };
  }
}

// Set companion mood manually from settings
function setCompanionMoodManually(mood) {
  setCompanionEmotion(mood);
  playSound('gentle');
  
  const name = companionName || (characterGender === 'male' ? 'Brave' : 'Sparkle');
  const moodMessages = {
    comfort: `${name} feels cozy and content! 😊`,
    excited: `${name} is so excited! 🎉`,
    cheering: `${name} wants to dance with you! 💃`,
    sleeping: `Shhh... ${name} is taking a little nap 😴`,
    sadness: `${name} is feeling a bit down... 🥺`,
    levelup: `${name} is glowing with power! ✨`
  };
  
  showCompanionMessage(moodMessages[mood] || 'Mood changed!');
  
  // Update active button
  const buttons = document.querySelectorAll('.mood-control-btn');
  buttons.forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.mood === mood) btn.classList.add('active');
  });
}

// Special action: Give companion a hug
function giveCompanionHug() {
  setCompanionEmotion('cheering');
  spawnParticles('love');
  playSound('success');
  
  const name = companionName || (characterGender === 'male' ? 'Brave' : 'Sparkle');
  showCompanionMessage(`*${name} hugs you back tightly* 🤗💕`);
  
  // Track interaction
  let interactions = parseInt(localStorage.getItem('companionInteractions') || '0');
  interactions++;
  localStorage.setItem('companionInteractions', interactions.toString());
  
  setTimeout(() => setCompanionEmotion('comfort'), 3000);
}

// Special action: Feed companion love
function feedCompanionLove() {
  setCompanionEmotion('excited');
  spawnParticles('love');
  spawnParticles('happy');
  playSound('success');
  
  const name = companionName || (characterGender === 'male' ? 'Brave' : 'Sparkle');
  const messages = [
    `${name} is overflowing with love! 💕✨`,
    `${name}'s heart grew three sizes! 💗`,
    `${name} feels so loved! Thank you! 🥰`,
    `Love received! ${name} is glowing! 💖`
  ];
  showCompanionMessage(messages[Math.floor(Math.random() * messages.length)]);
  
  let interactions = parseInt(localStorage.getItem('companionInteractions') || '0');
  interactions += 2;
  localStorage.setItem('companionInteractions', interactions.toString());
  
  setTimeout(() => setCompanionEmotion('comfort'), 4000);
}

// Special action: Play with companion
function playWithCompanion() {
  const companion = document.querySelector('.healing-companion');
  if (companion) {
    companion.classList.add('companion-spin');
    setTimeout(() => companion.classList.remove('companion-spin'), 1000);
  }
  
  setCompanionEmotion('cheering');
  spawnParticles('cheer');
  playSound('success');
  
  const name = companionName || (characterGender === 'male' ? 'Brave' : 'Sparkle');
  const messages = [
    `Wheee! ${name} loves playtime! 🎮`,
    `${name} is having so much fun! 🎊`,
    `Best playtime ever! - ${name} 🥳`,
    `${name} does a happy spin! 💫`
  ];
  showCompanionMessage(messages[Math.floor(Math.random() * messages.length)]);
  
  let interactions = parseInt(localStorage.getItem('companionInteractions') || '0');
  interactions += 3;
  localStorage.setItem('companionInteractions', interactions.toString());
  
  setTimeout(() => setCompanionEmotion('excited'), 2000);
  setTimeout(() => setCompanionEmotion('comfort'), 5000);
}

function changeSupportStyle(style) {
  userData.supportStyle = style;
  localStorage.setItem('healingHeartsUser', JSON.stringify(userData));
  applySupportStyleClass();
  updateThemesPageUI();
  
  newAffirmation();
  newQuote();
  
  const styleNames = { gentle: 'Gentle', motivational: 'Motivational', toughLove: 'Tough Love' };
  const styleEmojis = { gentle: '🌸', motivational: '🔥', toughLove: '💪' };
  
  if (typeof showCompanionMessage === 'function') {
    showCompanionMessage(`${styleEmojis[style]} Switched to ${styleNames[style]} mode!`);
  }
}

async function upgradeToPremium() {
  // All features are now free!
  alert('Great news! All features are now completely free. Enjoy your healing journey!');
  isPremium = true;
  updatePremiumUI();
  closePremiumModal();
}

async function checkPremiumStatus() {
  // All features are now free - no premium check needed
  isPremium = true;
  updatePremiumUI();
  updateCompanionVisibility();
}

async function managePremiumSubscription() {
  // All features are free - no subscription management needed
  alert('All features are now free! No subscription required.');
}

// Override toggleDarkMode to work with new theme system
const originalToggleDarkMode = typeof toggleDarkMode !== 'undefined' ? toggleDarkMode : null;

function toggleDarkMode() {
  if (selectedTheme === 'dark') {
    selectTheme('default');
  } else {
    selectTheme('dark');
  }
}

// Add premium button styles
function addPremiumButtonStyles() {
  const style = document.createElement('style');
  style.textContent = `
    .premium-btn {
      background: linear-gradient(135deg, #fbbf24, #f59e0b);
      border: none;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      font-size: 1rem;
      cursor: pointer;
      transition: all 0.2s;
      box-shadow: 0 2px 8px rgba(245, 158, 11, 0.3);
    }
    
    .premium-btn:hover {
      transform: scale(1.1);
      box-shadow: 0 4px 12px rgba(245, 158, 11, 0.5);
    }
    
    .premium-section {
      margin: 25px 0;
      padding-bottom: 20px;
      border-bottom: 1px solid rgba(0,0,0,0.1);
    }
    
    .premium-section h4 {
      margin-bottom: 8px;
      color: var(--text);
    }
    
    .companion-toggle {
      margin-top: 15px;
      text-align: center;
    }
    
    .companion-toggle label {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      cursor: pointer;
      font-size: 0.9rem;
      color: var(--text);
    }
    
    .companion-toggle input {
      width: 18px;
      height: 18px;
      cursor: pointer;
    }
  `;
  document.head.appendChild(style);
}

// ==================== ENHANCED ANIMATIONS SYSTEM ====================

// Floating Particles System
class ParticleSystem {
  constructor() {
    this.particles = [];
    this.canvas = null;
    this.ctx = null;
    this.animating = false;
    this.frameId = null;
  }
  
  init() {
    if (this.animating) return; // Prevent multiple initializations
    
    this.canvas = document.createElement('canvas');
    this.canvas.id = 'particles-canvas';
    document.body.insertBefore(this.canvas, document.body.firstChild);
    this.ctx = this.canvas.getContext('2d');
    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.createParticles();
    this.animating = true;
    this.animate();
  }
  
  stop() {
    this.animating = false;
    if (this.frameId) {
      cancelAnimationFrame(this.frameId);
      this.frameId = null;
    }
  }
  
  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }
  
  createParticles() {
    const count = Math.min(25, Math.floor(window.innerWidth / 50));
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        size: Math.random() * 3 + 1,
        speedY: Math.random() * 0.3 + 0.1,
        speedX: (Math.random() - 0.5) * 0.2,
        opacity: Math.random() * 0.3 + 0.1,
        hue: Math.random() * 60 + 320 // Pink to purple range
      });
    }
  }
  
  animate() {
    if (!this.ctx || !this.animating) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.particles.forEach(p => {
      p.y -= p.speedY;
      p.x += p.speedX;
      
      if (p.y < -10) {
        p.y = this.canvas.height + 10;
        p.x = Math.random() * this.canvas.width;
      }
      
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fillStyle = `hsla(${p.hue}, 70%, 70%, ${p.opacity})`;
      this.ctx.fill();
    });
    
    this.frameId = requestAnimationFrame(() => this.animate());
  }
}

const particleSystem = new ParticleSystem();

// Ripple Effect for Buttons
function addRippleEffect(e) {
  const button = e.currentTarget;
  const rect = button.getBoundingClientRect();
  const ripple = document.createElement('span');
  ripple.className = 'ripple';
  
  const size = Math.max(rect.width, rect.height);
  ripple.style.width = ripple.style.height = size + 'px';
  ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
  ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
  
  button.appendChild(ripple);
  ripple.addEventListener('animationend', () => ripple.remove());
}

// Initialize ripple effects on all buttons
function initRippleEffects() {
  document.querySelectorAll('button, .btn, .activity-btn, .save-btn').forEach(btn => {
    btn.addEventListener('click', addRippleEffect);
  });
}

// Confetti Celebration Effect
function launchConfetti(count = 50) {
  let container = document.getElementById('confetti-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'confetti-container';
    document.body.appendChild(container);
  }
  
  const colors = ['#ff69b4', '#ffd700', '#ff6b6b', '#4ecdc4', '#a78bfa', '#f472b6', '#10b981', '#f59e0b', '#ec4899'];
  
  for (let i = 0; i < count; i++) {
    const confetti = document.createElement('div');
    confetti.className = 'confetti-piece';
    confetti.style.left = Math.random() * 100 + '%';
    confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';
    confetti.style.animationDelay = Math.random() * 0.5 + 's';
    
    // Real confetti shapes - rectangles and strips
    const shapeType = Math.random();
    if (shapeType < 0.4) {
      // Long strip
      confetti.style.width = (4 + Math.random() * 4) + 'px';
      confetti.style.height = (12 + Math.random() * 10) + 'px';
    } else if (shapeType < 0.7) {
      // Square piece
      const size = 6 + Math.random() * 6;
      confetti.style.width = size + 'px';
      confetti.style.height = size + 'px';
    } else {
      // Wide ribbon
      confetti.style.width = (10 + Math.random() * 8) + 'px';
      confetti.style.height = (4 + Math.random() * 3) + 'px';
    }
    
    container.appendChild(confetti);
    setTimeout(() => confetti.remove(), 4000);
  }
}

function triggerConfetti() {
  launchConfetti(40);
}

// Empathy Notes System
async function showEmpathyNote(activity) {
  if (!isAuthenticated) return;
  
  try {
    const context = {
      name: userData.name || 'Friend',
      daysSinceBreakup: getDaysSinceStart(),
      supportStyle: getSupportStyle(),
      aiTone: getAITone()
    };
    
    const response = await fetch('/api/ai/empathy-note', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ activity, context })
    });
    
    if (response.ok) {
      const data = await response.json();
      displayEmpathyToast(data.note);
    }
  } catch (error) {
    console.log('Could not fetch empathy note:', error);
  }
}

function displayEmpathyToast(message) {
  const toast = document.getElementById('empathy-toast');
  const messageEl = document.getElementById('empathy-toast-message');
  
  if (!toast || !messageEl) return;
  
  messageEl.textContent = message;
  toast.classList.add('show');
  
  setTimeout(() => {
    hideEmpathyToast();
  }, 8000);
}

function hideEmpathyToast() {
  const toast = document.getElementById('empathy-toast');
  if (toast) {
    toast.classList.remove('show');
  }
}

// Staggered Animation for Cards
function animateCards(container) {
  const cards = container.querySelectorAll('.card, .activity-card, .mood-btn, .badge');
  cards.forEach((card, index) => {
    card.style.opacity = '0';
    card.style.animation = `slideUp 0.5s ease forwards`;
    card.style.animationDelay = `${index * 0.1}s`;
  });
}

// Enhanced Companion Animations
function enhanceCompanion() {
  const companion = document.querySelector('.healing-companion');
  if (!companion) return;
  
  // Add random blink intervals
  setInterval(() => {
    const eyes = companion.querySelectorAll('.eye');
    eyes.forEach(eye => {
      eye.style.animation = 'none';
      void eye.offsetWidth; // Trigger reflow
      eye.style.animation = 'eyeBlink 0.15s ease';
    });
  }, 3000 + Math.random() * 2000);
  
  // Add occasional wiggle
  setInterval(() => {
    if (Math.random() > 0.7) {
      companion.classList.add('wiggle');
      setTimeout(() => companion.classList.remove('wiggle'), 1000);
    }
  }, 5000);
}


// Add excitement animation to companion
function companionGetExcited() {
  const companion = document.querySelector('.healing-companion');
  if (!companion) return;
  
  companion.classList.add('excited');
  setTimeout(() => companion.classList.remove('excited'), 1500);
}

// Add dancing animation to companion
function companionDance() {
  const companion = document.querySelector('.healing-companion');
  if (!companion) return;
  
  companion.classList.add('dancing');
  launchConfetti(30);
  setTimeout(() => companion.classList.remove('dancing'), 2000);
}

// Number count-up animation
function animateNumber(element, target, duration = 1000) {
  const start = 0;
  const startTime = performance.now();
  
  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easeOut = 1 - Math.pow(1 - progress, 3);
    const current = Math.floor(start + (target - start) * easeOut);
    
    element.textContent = current;
    element.classList.add('number-animate');
    
    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }
  
  requestAnimationFrame(update);
}

// Initialize all animations
function initAnimations() {
  // Start particle system
  if (window.matchMedia('(prefers-reduced-motion: no-preference)').matches) {
    particleSystem.init();
  }
  
  // Add ripple effects
  initRippleEffects();
  
  // Enhance companion
  setTimeout(enhanceCompanion, 1000);
  
  // Observe for new buttons added dynamically
  const observer = new MutationObserver((mutations) => {
    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(node => {
        if (node.nodeType === 1) {
          const buttons = node.querySelectorAll ? node.querySelectorAll('button, .btn, .activity-btn') : [];
          buttons.forEach(btn => btn.addEventListener('click', addRippleEffect));
        }
      });
    });
  });
  
  observer.observe(document.body, { childList: true, subtree: true });
}

// Initialize premium features
function initPremiumFeatures() {
  addPremiumButtonStyles();
  applyTheme(selectedTheme);
  initCompanion();
  initAnimations();
  
  checkPremiumStatus();
  
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('premium') === 'success') {
    isPremium = true;
    localStorage.setItem('isPremium', 'true');
    updatePremiumUI();
    updateCompanionVisibility();
    
    setTimeout(() => {
      alert('Welcome to Premium! You now have access to all themes and your healing companion!');
    }, 500);
    
    window.history.replaceState({}, document.title, window.location.pathname);
  }
}

// Modify init to include premium features
const originalInit = init;
init = function() {
  originalInit();
  initPremiumFeatures();
};

document.addEventListener('DOMContentLoaded', init);

// ==================== PREMIUM AI FEATURES ====================

// AI Healing Coach
function openAICoach() {
  document.getElementById('ai-coach-modal').style.display = 'flex';
  document.getElementById('ai-chat-messages').innerHTML = `
    <div class="ai-chat-message ai">
      Hi ${userData.name || 'friend'}! I'm your AI healing coach. I'm here to listen, support, and guide you through this journey. What's on your heart today?
    </div>
  `;
}

function closeAICoachModal() {
  document.getElementById('ai-coach-modal').style.display = 'none';
}

async function sendToAICoach() {
  const input = document.getElementById('ai-coach-input');
  const message = input.value.trim();
  if (!message) return;

  const messagesDiv = document.getElementById('ai-chat-messages');
  
  messagesDiv.innerHTML += `<div class="ai-chat-message user">${message}</div>`;
  input.value = '';
  
  messagesDiv.innerHTML += `<div class="ai-chat-message ai" id="ai-typing">Thinking...</div>`;
  messagesDiv.scrollTop = messagesDiv.scrollHeight;

  try {
    const styleConfig = supportStyles[getSupportStyle()];
    const response = await fetch('/api/ai/healing-coach', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        context: {
          name: userData.name,
          daysSinceBreakup: calculateDaysSinceBreakup(),
          breakupType: userData.breakupType,
          healingStage: getHealingStage(),
          supportStyle: getSupportStyle(),
          aiTone: styleConfig.aiTone
        }
      })
    });
    
    const data = await response.json();
    document.getElementById('ai-typing').outerHTML = `
      <div class="ai-chat-message ai">${data.response || 'I understand. Tell me more about how you feel.'}</div>
    `;
  } catch (error) {
    document.getElementById('ai-typing').outerHTML = `
      <div class="ai-chat-message ai">I'm here for you. Sometimes connections get interrupted, but my support for you never wavers. Please try again.</div>
    `;
  }
  
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// Main page AI Coach (replaces old "Talk to Me" chat)
async function sendToAICoachMain() {
  const input = document.getElementById('chat-input');
  const message = input.value.trim();
  if (!message) return;

  // Check if user is signed in
  if (!currentUser) {
    alert('Please sign in to chat with your AI Healing Coach. It\'s free!');
    return;
  }

  const messagesDiv = document.getElementById('chat-box');
  
  messagesDiv.innerHTML += `<div class="ai-chat-message user">${escapeHtml(message)}</div>`;
  input.value = '';
  
  messagesDiv.innerHTML += `<div class="ai-chat-message ai" id="ai-main-typing"><span class="typing-indicator">💭 Thinking...</span></div>`;
  messagesDiv.scrollTop = messagesDiv.scrollHeight;

  try {
    const styleConfig = supportStyles[getSupportStyle()];
    const response = await fetch('/api/ai/healing-coach', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        context: {
          name: userData.name,
          daysSinceBreakup: calculateDaysSinceBreakup(),
          breakupType: userData.breakupType,
          healingStage: getHealingStage(),
          supportStyle: getSupportStyle(),
          aiTone: styleConfig.aiTone
        }
      })
    });
    
    if (!response.ok) {
      throw new Error('Not authenticated');
    }
    
    const data = await response.json();
    document.getElementById('ai-main-typing').outerHTML = `
      <div class="ai-chat-message ai">${data.response || 'I understand. Tell me more about how you feel.'}</div>
    `;
    
    triggerCompanionReaction('ai_tool_used');
  } catch (error) {
    document.getElementById('ai-main-typing').outerHTML = `
      <div class="ai-chat-message ai">I'm here for you. Please make sure you're signed in to use the AI coach. It's completely free!</div>
    `;
  }
  
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function handleAIChatEnter(event) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    sendToAICoachMain();
  }
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function updateAICoachNotice() {
  const notice = document.getElementById('ai-coach-notice');
  if (notice) {
    if (currentUser) {
      notice.style.display = 'none';
    } else {
      notice.style.display = 'block';
    }
  }
}

function calculateDaysSinceBreakup() {
  if (!userData.breakupDate) return 0;
  const breakup = new Date(userData.breakupDate);
  const today = new Date();
  return Math.floor((today - breakup) / (1000 * 60 * 60 * 24));
}

function getHealingStage() {
  const days = calculateDaysSinceBreakup();
  if (days < 7) return 'acute';
  if (days < 30) return 'early';
  if (days < 90) return 'processing';
  if (days < 180) return 'growth';
  return 'thriving';
}

// Closure Ceremony
function openClosureCeremony() {
  document.getElementById('closure-ceremony-modal').style.display = 'flex';
  document.getElementById('closure-setup').style.display = 'block';
  document.getElementById('closure-result').style.display = 'none';
}

function closeClosureCeremonyModal() {
  document.getElementById('closure-ceremony-modal').style.display = 'none';
}

async function generateClosureCeremony() {
  const duration = document.getElementById('closure-duration').value;
  const struggling = document.getElementById('closure-struggling').value;
  
  if (!struggling) {
    alert('Please share what you\'re struggling to let go of.');
    return;
  }

  document.getElementById('closure-setup').innerHTML = '<div class="loading-spinner"></div><p style="text-align:center;">Creating your personalized ceremony...</p>';

  try {
    const response = await fetch('/api/ai/closure-ceremony', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        context: {
          name: userData.name,
          relationshipDuration: duration,
          breakupType: userData.breakupType,
          strugglingWith: struggling
        }
      })
    });
    
    const data = await response.json();
    const ceremony = data.ceremony;
    
    let stepsHTML = ceremony.steps.map((step, i) => `
      <div class="ceremony-step">
        <h4>Step ${i + 1}: ${step.name}</h4>
        <div class="duration">${step.duration}</div>
        <p>${step.instruction}</p>
        ${step.reflection ? `<div class="reflection">"${step.reflection}"</div>` : ''}
      </div>
    `).join('');
    
    document.getElementById('closure-setup').style.display = 'none';
    document.getElementById('closure-result').style.display = 'block';
    document.getElementById('closure-result').innerHTML = `
      <h4>${ceremony.title}</h4>
      <p style="margin-bottom:20px;">${ceremony.introduction}</p>
      ${stepsHTML}
      <div class="ceremony-step" style="background: linear-gradient(135deg, var(--primary-light), var(--accent)); color: var(--text);">
        <h4>Closing Words</h4>
        <p>${ceremony.closingWords}</p>
        <div class="reflection" style="font-weight:bold;">"${ceremony.affirmation}"</div>
      </div>
    `;
  } catch (error) {
    alert('Something went wrong. Please try again.');
    document.getElementById('closure-setup').innerHTML = '<p>Error generating ceremony. Please refresh and try again.</p>';
  }
}

// Pattern Analysis
function openPatternAnalysis() {
  document.getElementById('pattern-modal').style.display = 'flex';
  document.getElementById('pattern-questions').style.display = 'block';
  document.getElementById('pattern-result').style.display = 'none';
}

function closePatternModal() {
  document.getElementById('pattern-modal').style.display = 'none';
}

async function analyzePatterns() {
  const answers = {
    attraction: document.getElementById('pattern-q1').value,
    redFlags: document.getElementById('pattern-q2').value,
    conflictStyle: document.getElementById('pattern-q3').value,
    unmetNeeds: document.getElementById('pattern-q4').value,
    pastPatterns: document.getElementById('pattern-q5').value
  };
  
  if (!answers.attraction || !answers.redFlags) {
    alert('Please answer at least the first two questions.');
    return;
  }

  document.getElementById('pattern-questions').innerHTML = '<div class="loading-spinner"></div><p style="text-align:center;">Analyzing your patterns...</p>';

  try {
    const response = await fetch('/api/ai/pattern-analysis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers })
    });
    
    const data = await response.json();
    const analysis = data.analysis;
    
    document.getElementById('pattern-questions').style.display = 'none';
    document.getElementById('pattern-result').style.display = 'block';
    document.getElementById('pattern-result').innerHTML = `
      <div class="pattern-card">
        <h4>Key Patterns Identified</h4>
        <ul class="pattern-list">
          ${analysis.patterns.map(p => `<li>${p}</li>`).join('')}
        </ul>
      </div>
      <div class="pattern-card" style="border-left-color: #f59e0b;">
        <h4>Blind Spots to Watch</h4>
        <ul class="pattern-list">
          ${analysis.blindSpots.map(b => `<li>${b}</li>`).join('')}
        </ul>
      </div>
      <div class="pattern-card" style="border-left-color: #10b981;">
        <h4>Your Strengths</h4>
        <ul class="pattern-list">
          ${analysis.strengths.map(s => `<li>${s}</li>`).join('')}
        </ul>
      </div>
      <div class="pattern-card" style="border-left-color: #8b5cf6;">
        <h4>Areas for Growth</h4>
        <ul class="pattern-list">
          ${analysis.growthAreas.map(g => `<li>${g}</li>`).join('')}
        </ul>
      </div>
      <div style="background: var(--primary-light); padding: 15px; border-radius: 12px; margin-top: 15px;">
        <p><strong>Personalized Advice:</strong></p>
        <p style="margin-top: 10px;">${analysis.advice}</p>
      </div>
    `;
  } catch (error) {
    alert('Something went wrong. Please try again.');
  }
}

// Memory Reframer
function openMemoryReframe() {
  document.getElementById('reframe-modal').style.display = 'flex';
  document.getElementById('reframe-input-section').style.display = 'block';
  document.getElementById('reframe-result').style.display = 'none';
}

function closeReframeModal() {
  document.getElementById('reframe-modal').style.display = 'none';
}

async function reframeMemory() {
  const memory = document.getElementById('reframe-memory').value;
  
  if (!memory) {
    alert('Please describe the memory you want to reframe.');
    return;
  }

  document.getElementById('reframe-input-section').innerHTML = '<div class="loading-spinner"></div><p style="text-align:center;">Reframing your memory with compassion...</p>';

  try {
    const response = await fetch('/api/ai/reframe-memory', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        memory,
        context: {
          daysSinceBreakup: calculateDaysSinceBreakup(),
          breakupType: userData.breakupType
        }
      })
    });
    
    const data = await response.json();
    
    document.getElementById('reframe-input-section').style.display = 'none';
    document.getElementById('reframe-result').style.display = 'block';
    document.getElementById('reframe-result').innerHTML = `
      <div style="background: var(--card-bg); padding: 20px; border-radius: 15px; border-left: 4px solid var(--primary);">
        <h4 style="margin-bottom: 15px;">A New Perspective</h4>
        <div style="line-height: 1.8; white-space: pre-wrap;">${data.reframe}</div>
      </div>
      <button onclick="resetReframe()" class="primary-btn" style="margin-top: 20px;">Reframe Another Memory</button>
    `;
  } catch (error) {
    alert('Something went wrong. Please try again.');
  }
}

function resetReframe() {
  document.getElementById('reframe-input-section').style.display = 'block';
  document.getElementById('reframe-input-section').innerHTML = `
    <div class="form-group">
      <label>Describe a memory that still hurts:</label>
      <textarea id="reframe-memory" rows="4" placeholder="The memory that keeps coming back..."></textarea>
    </div>
    <button onclick="reframeMemory()" class="primary-btn">Reframe This Memory</button>
  `;
  document.getElementById('reframe-result').style.display = 'none';
}

// Rebound Check
function openReboundCheck() {
  document.getElementById('rebound-modal').style.display = 'flex';
  document.getElementById('rebound-questions').style.display = 'block';
  document.getElementById('rebound-result').style.display = 'none';
}

function closeReboundModal() {
  document.getElementById('rebound-modal').style.display = 'none';
}

async function assessReboundRisk() {
  const behaviors = {
    seekingDistraction: document.getElementById('rb-1').checked,
    comparingToEx: document.getElementById('rb-2').checked,
    stalkingSocialMedia: document.getElementById('rb-3').checked,
    wantingJealousy: document.getElementById('rb-4').checked,
    needingSomeone: document.getElementById('rb-5').checked,
    fearOfAlone: document.getElementById('rb-6').checked,
    hidingNewConnection: document.getElementById('rb-7').checked,
    oversharing: document.getElementById('rb-8').checked,
    readyToGiveLove: document.getElementById('rb-9').checked,
    processedGrief: document.getElementById('rb-10').checked,
    daysSinceBreakup: calculateDaysSinceBreakup()
  };

  document.getElementById('rebound-questions').innerHTML = '<div class="loading-spinner"></div><p style="text-align:center;">Assessing your readiness...</p>';

  try {
    const response = await fetch('/api/ai/rebound-assessment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ behaviors })
    });
    
    const data = await response.json();
    const assessment = data.assessment;
    
    const riskColors = { low: '#10b981', moderate: '#f59e0b', high: '#ef4444' };
    
    document.getElementById('rebound-questions').style.display = 'none';
    document.getElementById('rebound-result').style.display = 'block';
    document.getElementById('rebound-result').innerHTML = `
      <div style="text-align: center; margin-bottom: 20px;">
        <h4>Your Rebound Risk Level</h4>
        <div class="risk-meter">
          <div class="risk-fill ${assessment.riskLevel}" style="width: ${assessment.riskScore * 10}%"></div>
        </div>
        <span style="font-size: 1.3rem; font-weight: bold; color: ${riskColors[assessment.riskLevel]};">
          ${assessment.riskLevel.toUpperCase()} RISK (${assessment.riskScore}/10)
        </span>
      </div>
      
      ${assessment.concerns.length > 0 ? `
        <div class="pattern-card" style="border-left-color: #ef4444;">
          <h4>Concerns</h4>
          <ul class="pattern-list">
            ${assessment.concerns.map(c => `<li>${c}</li>`).join('')}
          </ul>
        </div>
      ` : ''}
      
      ${assessment.healthySigns.length > 0 ? `
        <div class="pattern-card" style="border-left-color: #10b981;">
          <h4>Healthy Signs</h4>
          <ul class="pattern-list">
            ${assessment.healthySigns.map(s => `<li>${s}</li>`).join('')}
          </ul>
        </div>
      ` : ''}
      
      <div style="background: var(--primary-light); padding: 15px; border-radius: 12px;">
        <p><strong>Recommendation:</strong></p>
        <p style="margin-top: 10px;">${assessment.recommendation}</p>
        <p style="margin-top: 10px; font-weight: 600;">Suggested wait time: ${assessment.waitSuggestion}</p>
      </div>
    `;
  } catch (error) {
    alert('Something went wrong. Please try again.');
  }
}

// Growth Dashboard
function openGrowthDashboard() {
  document.getElementById('growth-modal').style.display = 'flex';
  document.getElementById('growth-loading').style.display = 'block';
  document.getElementById('growth-result').style.display = 'none';
  
  loadGrowthAnalysis();
}

function closeGrowthModal() {
  document.getElementById('growth-modal').style.display = 'none';
}

async function loadGrowthAnalysis() {
  const journalData = JSON.parse(localStorage.getItem('journalEntries') || '[]');
  const moodData = JSON.parse(localStorage.getItem('moods') || '[]');
  const sleepData = JSON.parse(localStorage.getItem('sleepLogs') || '[]');
  
  const data = {
    daysSinceBreakup: calculateDaysSinceBreakup(),
    journalCount: journalData.length,
    recentMoods: moodData.slice(-14),
    averageSleep: sleepData.length > 0 ? sleepData.reduce((a, b) => a + (b.hours || 0), 0) / sleepData.length : 0,
    activitiesCompleted: parseInt(localStorage.getItem('activitiesCompleted') || '0'),
    streakDays: parseInt(localStorage.getItem('streakDays') || '0'),
    breakupType: userData.breakupType
  };

  try {
    const response = await fetch('/api/ai/growth-analysis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data })
    });
    
    const result = await response.json();
    const analysis = result.analysis;
    
    document.getElementById('growth-loading').style.display = 'none';
    document.getElementById('growth-result').style.display = 'block';
    document.getElementById('growth-result').innerHTML = `
      <div style="text-align: center; margin-bottom: 25px;">
        <div style="width: 120px; height: 120px; border-radius: 50%; background: conic-gradient(var(--primary) ${analysis.overallProgress}%, var(--primary-light) 0); margin: 0 auto; display: flex; align-items: center; justify-content: center;">
          <div style="width: 90px; height: 90px; border-radius: 50%; background: var(--card-bg); display: flex; align-items: center; justify-content: center;">
            <span style="font-size: 1.8rem; font-weight: bold; color: var(--primary);">${analysis.overallProgress}%</span>
          </div>
        </div>
        <p style="margin-top: 10px; font-weight: 600;">Overall Healing Progress</p>
      </div>
      
      <div class="growth-stats-grid">
        <div class="growth-stat-card">
          <h5>Journal Entries</h5>
          <div class="stat-value">${data.journalCount}</div>
        </div>
        <div class="growth-stat-card">
          <h5>Days Healing</h5>
          <div class="stat-value">${data.daysSinceBreakup}</div>
        </div>
        <div class="growth-stat-card">
          <h5>Current Streak</h5>
          <div class="stat-value">${data.streakDays} days</div>
        </div>
        <div class="growth-stat-card">
          <h5>Activities Done</h5>
          <div class="stat-value">${data.activitiesCompleted}</div>
        </div>
      </div>
      
      <div class="pattern-card" style="border-left-color: #10b981;">
        <h4>Your Strengths</h4>
        <ul class="pattern-list">
          ${analysis.strengthAreas.map(s => `<li>${s}</li>`).join('')}
        </ul>
      </div>
      
      <div class="pattern-card" style="border-left-color: #8b5cf6;">
        <h4>Focus Areas This Week</h4>
        <ul class="pattern-list">
          ${analysis.focusAreas.map(f => `<li>${f}</li>`).join('')}
        </ul>
      </div>
      
      <div class="pattern-card" style="border-left-color: #f59e0b;">
        <h4>Milestones Achieved</h4>
        <ul class="pattern-list">
          ${analysis.milestones.map(m => `<li>${m}</li>`).join('')}
        </ul>
        <p style="margin-top: 10px;"><strong>Next milestone:</strong> ${analysis.nextMilestone}</p>
      </div>
      
      <div class="daily-affirmation-banner">
        <p>${analysis.encouragement}</p>
        <p style="font-size: 0.9rem; margin-top: 10px;"><strong>This week's tip:</strong> ${analysis.weeklyTip}</p>
      </div>
    `;
  } catch (error) {
    document.getElementById('growth-loading').innerHTML = '<p>Unable to load analysis. Please try again.</p>';
  }
}

// Update premium UI to show AI features section (now free for all)
const originalUpdatePremiumUI = updatePremiumUI;
updatePremiumUI = function() {
  originalUpdatePremiumUI();
  
  const aiSection = document.getElementById('ai-features-section');
  if (aiSection) {
    aiSection.style.display = 'block';
  }
};

// Generate AI Affirmation for home screen
async function generateDailyAffirmation() {
  
  try {
    const response = await fetch('/api/ai/affirmation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        context: {
          name: userData.name,
          daysSinceBreakup: calculateDaysSinceBreakup(),
          breakupType: userData.breakupType,
          currentMood: getMostRecentMood()
        }
      })
    });
    
    const data = await response.json();
    return data.affirmation;
  } catch (error) {
    return null;
  }
}

function getMostRecentMood() {
  const moods = JSON.parse(localStorage.getItem('moods') || '[]');
  if (moods.length === 0) return 'neutral';
  const moodLabels = ['terrible', 'bad', 'okay', 'good', 'great'];
  return moodLabels[moods[moods.length - 1].mood - 1] || 'neutral';
}
