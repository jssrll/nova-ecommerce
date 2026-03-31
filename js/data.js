// PRODUCT DATABASE - FIREWORKS SHOP
const products = [
  // Aerial Fireworks
  { id: 1, name: "Roman Candle", category: "Aerial", price: 150, image: "🎇", description: "Multi-shot aerial effects with colorful bursts" },
  { id: 2, name: "Sky Rocket", category: "Aerial", price: 200, image: "🚀", description: "High-flying rocket with whistle and burst" },
  { id: 3, name: "Aerial Shell", category: "Aerial", price: 350, image: "💥", description: "Professional-grade aerial display shell" },
  { id: 4, name: "Mortar Kit", category: "Aerial", price: 500, image: "🎆", description: "Complete mortar set with multiple shells" },
  
  // Ground Fireworks
  { id: 5, name: "Firecracker Roll", category: "Ground", price: 50, image: "🧨", description: "Classic firecracker roll - 100 pieces" },
  { id: 6, name: "Fountain", category: "Ground", price: 120, image: "⛲", description: "Ground fountain with colorful sparks" },
  { id: 7, name: "Wheel", category: "Ground", price: 180, image: "🎡", description: "Spinning wheel with crackling effects" },
  { id: 8, name: "Mine", category: "Ground", price: 90, image: "💣", description: "Ground mine with shower of sparks" },
  
  // Sparklers
  { id: 9, name: "Sparklers Pack", category: "Sparklers", price: 30, image: "✨", description: "Pack of 10 hand-held sparklers" },
  { id: 10, name: "Glitter Stick", category: "Sparklers", price: 45, image: "🌟", description: "Long-lasting glitter sparkler" },
  { id: 11, name: "Heart Sparkler", category: "Sparklers", price: 60, image: "❤️", description: "Heart-shaped sparkler for special moments" },
  { id: 12, name: "Star Sparkler", category: "Sparklers", price: 55, image: "⭐", description: "Star-shaped sparkler for celebrations" },
  
  // Fountains
  { id: 13, name: "Mini Fountain", category: "Fountains", price: 80, image: "🌊", description: "Small fountain with colorful sparks" },
  { id: 14, name: "Cascade Fountain", category: "Fountains", price: 150, image: "💧", description: "Waterfall effect fountain" },
  { id: 15, name: "Color Changing Fountain", category: "Fountains", price: 200, image: "🌈", description: "Multi-color changing fountain" },
  { id: 16, name: "Palm Tree Fountain", category: "Fountains", price: 250, image: "🌴", description: "Palm tree effect with crackling finale" }
];

// ========================================
// PROMO CODES DATABASE
// ========================================
const promoCodeRewards = {
  // #1 Peso Codes
  "L5@P6^Z2": { type: "peso", value: 1, message: "You won ₱1 credit!" },
  "V8!H9%T1": { type: "peso", value: 1, message: "You won ₱1 credit!" },
  "kU3#C1$S7": { type: "peso", value: 1, message: "You won ₱1 credit!" },
  "G2&Q4!Y6": { type: "peso", value: 1, message: "You won ₱1 credit!" },
  
  // #2 Peso Codes
  "J1!R6%T8": { type: "peso", value: 2, message: "You won ₱2 credit!" },
  "Z8#D2$N5": { type: "peso", value: 2, message: "You won ₱2 credit!" },
  
  // #5 Peso Codes
  "U8@M7^P6": { type: "peso", value: 5, message: "You won ₱5 credit!" },
  "C7!Z4%N1": { type: "peso", value: 5, message: "You won ₱5 credit!" },
  
  // #10 Peso Codes
  "A4@K2^T3": { type: "peso", value: 10, message: "You won ₱10 credit!" },
  "M3!L6%H7": { type: "peso", value: 10, message: "You won ₱10 credit!" },
  
  // #50 Peso Codes
  "B7!mQ3$pR": { type: "peso", value: 50, message: "You won ₱50 credit!" },
  
  // #100 Peso Codes
  "sR5$D8!oG": { type: "peso", value: 100, message: "You won ₱100 credit!" },
  
  // Fireworks Special Codes
  "FIREWORK2024": { type: "peso", value: 50, message: "🎆 You won ₱50 fireworks credit! 🎇" },
  "NYE2025": { type: "peso", value: 100, message: "🎉 New Year Special! ₱100 credit added! 🎉" },
  "SPARKLE": { type: "peso", value: 20, message: "✨ Sparkle credit added! ₱20 ✨" }
};