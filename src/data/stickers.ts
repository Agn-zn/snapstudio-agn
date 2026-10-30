export interface StickerData {
  id: string;
  emoji: string;
  category: string;
  label: string;
}

export const STICKER_CATEGORIES = [
  { id: 'hearts', label: '❤️ Hearts' },
  { id: 'stars', label: '⭐ Stars' },
  { id: 'flowers', label: '🌸 Flowers' },
  { id: 'cute', label: '🐱 Cute' },
  { id: 'bows', label: '🎀 Bows' },
  { id: 'sparkles', label: '✨ Sparkles' },
  { id: 'food', label: '🍓 Food' },
  { id: 'faces', label: '😊 Faces' },
  { id: 'retro', label: '📷 Retro' },
  { id: 'misc', label: '🎉 Fun' },
];

export const STICKERS: StickerData[] = [
  // Hearts
  { id: 's1', emoji: '❤️', category: 'hearts', label: 'Red Heart' },
  { id: 's2', emoji: '🩷', category: 'hearts', label: 'Pink Heart' },
  { id: 's3', emoji: '💜', category: 'hearts', label: 'Purple Heart' },
  { id: 's4', emoji: '💛', category: 'hearts', label: 'Yellow Heart' },
  { id: 's5', emoji: '🤍', category: 'hearts', label: 'White Heart' },
  { id: 's6', emoji: '💕', category: 'hearts', label: 'Two Hearts' },
  { id: 's7', emoji: '💗', category: 'hearts', label: 'Growing Heart' },
  { id: 's8', emoji: '💖', category: 'hearts', label: 'Sparkling Heart' },
  { id: 's9', emoji: '💝', category: 'hearts', label: 'Heart Ribbon' },
  { id: 's10', emoji: '💞', category: 'hearts', label: 'Revolving Hearts' },

  // Stars
  { id: 's11', emoji: '⭐', category: 'stars', label: 'Star' },
  { id: 's12', emoji: '🌟', category: 'stars', label: 'Glowing Star' },
  { id: 's13', emoji: '✨', category: 'stars', label: 'Sparkles' },
  { id: 's14', emoji: '💫', category: 'stars', label: 'Dizzy Star' },
  { id: 's15', emoji: '⚡', category: 'stars', label: 'Lightning' },
  { id: 's16', emoji: '🌙', category: 'stars', label: 'Moon' },
  { id: 's17', emoji: '☀️', category: 'stars', label: 'Sun' },
  { id: 's18', emoji: '🌈', category: 'stars', label: 'Rainbow' },
  { id: 's19', emoji: '☁️', category: 'stars', label: 'Cloud' },
  { id: 's20', emoji: '🌠', category: 'stars', label: 'Shooting Star' },

  // Flowers
  { id: 's21', emoji: '🌸', category: 'flowers', label: 'Cherry Blossom' },
  { id: 's22', emoji: '🌺', category: 'flowers', label: 'Hibiscus' },
  { id: 's23', emoji: '🌻', category: 'flowers', label: 'Sunflower' },
  { id: 's24', emoji: '🌹', category: 'flowers', label: 'Rose' },
  { id: 's25', emoji: '🌷', category: 'flowers', label: 'Tulip' },
  { id: 's26', emoji: '💐', category: 'flowers', label: 'Bouquet' },
  { id: 's27', emoji: '🌿', category: 'flowers', label: 'Herb' },
  { id: 's28', emoji: '🍀', category: 'flowers', label: 'Four Leaf Clover' },
  { id: 's29', emoji: '🌼', category: 'flowers', label: 'Blossom' },
  { id: 's30', emoji: '🪷', category: 'flowers', label: 'Lotus' },

  // Cute
  { id: 's31', emoji: '🐱', category: 'cute', label: 'Cat' },
  { id: 's32', emoji: '🐰', category: 'cute', label: 'Rabbit' },
  { id: 's33', emoji: '🐻', category: 'cute', label: 'Bear' },
  { id: 's34', emoji: '🐼', category: 'cute', label: 'Panda' },
  { id: 's35', emoji: '🦊', category: 'cute', label: 'Fox' },
  { id: 's36', emoji: '🐨', category: 'cute', label: 'Koala' },
  { id: 's37', emoji: '🦋', category: 'cute', label: 'Butterfly' },
  { id: 's38', emoji: '🐝', category: 'cute', label: 'Bee' },
  { id: 's39', emoji: '🦄', category: 'cute', label: 'Unicorn' },
  { id: 's40', emoji: '🐧', category: 'cute', label: 'Penguin' },

  // Bows
  { id: 's41', emoji: '🎀', category: 'bows', label: 'Ribbon' },
  { id: 's42', emoji: '🎁', category: 'bows', label: 'Gift' },
  { id: 's43', emoji: '🎊', category: 'bows', label: 'Confetti' },
  { id: 's44', emoji: '🎉', category: 'bows', label: 'Party' },
  { id: 's45', emoji: '🪄', category: 'bows', label: 'Magic Wand' },
  { id: 's46', emoji: '👑', category: 'bows', label: 'Crown' },
  { id: 's47', emoji: '💎', category: 'bows', label: 'Diamond' },
  { id: 's48', emoji: '🪩', category: 'bows', label: 'Disco Ball' },
  { id: 's49', emoji: '🎈', category: 'bows', label: 'Balloon' },
  { id: 's50', emoji: '🎨', category: 'bows', label: 'Palette' },

  // Sparkles
  { id: 's51', emoji: '✨', category: 'sparkles', label: 'Sparkle' },
  { id: 's52', emoji: '💥', category: 'sparkles', label: 'Boom' },
  { id: 's53', emoji: '🌀', category: 'sparkles', label: 'Swirl' },
  { id: 's54', emoji: '🔮', category: 'sparkles', label: 'Crystal Ball' },
  { id: 's55', emoji: '🪬', category: 'sparkles', label: 'Nazar' },
  { id: 's56', emoji: '🌊', category: 'sparkles', label: 'Wave' },
  { id: 's57', emoji: '🍃', category: 'sparkles', label: 'Leaves' },
  { id: 's58', emoji: '🫧', category: 'sparkles', label: 'Bubbles' },
  { id: 's59', emoji: '🌪️', category: 'sparkles', label: 'Tornado' },
  { id: 's60', emoji: '❄️', category: 'sparkles', label: 'Snowflake' },

  // Food
  { id: 's61', emoji: '🍓', category: 'food', label: 'Strawberry' },
  { id: 's62', emoji: '🍒', category: 'food', label: 'Cherries' },
  { id: 's63', emoji: '🍑', category: 'food', label: 'Peach' },
  { id: 's64', emoji: '🍋', category: 'food', label: 'Lemon' },
  { id: 's65', emoji: '🍰', category: 'food', label: 'Cake' },
  { id: 's66', emoji: '🧁', category: 'food', label: 'Cupcake' },
  { id: 's67', emoji: '🍭', category: 'food', label: 'Lollipop' },
  { id: 's68', emoji: '🍩', category: 'food', label: 'Donut' },
  { id: 's69', emoji: '🍦', category: 'food', label: 'Ice Cream' },
  { id: 's70', emoji: '☕', category: 'food', label: 'Coffee' },

  // Faces
  { id: 's71', emoji: '😊', category: 'faces', label: 'Smile' },
  { id: 's72', emoji: '🥰', category: 'faces', label: 'Loving' },
  { id: 's73', emoji: '😍', category: 'faces', label: 'Starstruck' },
  { id: 's74', emoji: '🤩', category: 'faces', label: 'Excited' },
  { id: 's75', emoji: '😎', category: 'faces', label: 'Cool' },
  { id: 's76', emoji: '🥳', category: 'faces', label: 'Party' },
  { id: 's77', emoji: '😘', category: 'faces', label: 'Blowing Kiss' },
  { id: 's78', emoji: '🤗', category: 'faces', label: 'Hugging' },
  { id: 's79', emoji: '😜', category: 'faces', label: 'Winking' },
  { id: 's80', emoji: '🫶', category: 'faces', label: 'Heart Hands' },

  // Retro
  { id: 's81', emoji: '📷', category: 'retro', label: 'Camera' },
  { id: 's82', emoji: '📸', category: 'retro', label: 'Flash Camera' },
  { id: 's83', emoji: '🎞️', category: 'retro', label: 'Film Strip' },
  { id: 's84', emoji: '📼', category: 'retro', label: 'VHS' },
  { id: 's85', emoji: '📻', category: 'retro', label: 'Radio' },
  { id: 's86', emoji: '🕹️', category: 'retro', label: 'Joystick' },
  { id: 's87', emoji: '💾', category: 'retro', label: 'Floppy' },
  { id: 's88', emoji: '📞', category: 'retro', label: 'Phone' },
  { id: 's89', emoji: '🖼️', category: 'retro', label: 'Frame' },
  { id: 's90', emoji: '✉️', category: 'retro', label: 'Letter' },

  // Misc Fun
  { id: 's91', emoji: '🎭', category: 'misc', label: 'Theatre' },
  { id: 's92', emoji: '🎵', category: 'misc', label: 'Music Note' },
  { id: 's93', emoji: '🎸', category: 'misc', label: 'Guitar' },
  { id: 's94', emoji: '🕊️', category: 'misc', label: 'Dove' },
  { id: 's95', emoji: '🌍', category: 'misc', label: 'Earth' },
  { id: 's96', emoji: '🏆', category: 'misc', label: 'Trophy' },
  { id: 's97', emoji: '🎯', category: 'misc', label: 'Target' },
  { id: 's98', emoji: '🧿', category: 'misc', label: 'Eye Charm' },
  { id: 's99', emoji: '🪋', category: 'misc', label: 'Dragon' },
  { id: 's100', emoji: '🌺', category: 'misc', label: 'Flower' },
];
