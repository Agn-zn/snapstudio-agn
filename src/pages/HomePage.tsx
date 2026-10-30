import { motion } from 'framer-motion';
import { Camera, Sparkles, Image, Info, ArrowRight, Star, Heart } from 'lucide-react';
import { useApp } from '../store/appStore';

const floatingItems = [
  { emoji: '📸', x: '8%', y: '20%', delay: 0, rotation: -12 },
  { emoji: '✨', x: '85%', y: '15%', delay: 0.3, rotation: 8 },
  { emoji: '🌸', x: '12%', y: '65%', delay: 0.6, rotation: 15 },
  { emoji: '💕', x: '80%', y: '60%', delay: 0.9, rotation: -8 },
  { emoji: '🎀', x: '70%', y: '80%', delay: 1.2, rotation: 12 },
  { emoji: '⭐', x: '25%', y: '85%', delay: 1.5, rotation: -5 },
  { emoji: '🦋', x: '90%', y: '40%', delay: 0.4, rotation: 20 },
  { emoji: '🌺', x: '5%', y: '45%', delay: 0.8, rotation: -18 },
];

const features = [
  { icon: Camera, title: 'Pro Camera', desc: 'Crystal-clear webcam captures with countdown timer and flash', color: 'from-blush-100 to-blush-50' },
  { icon: Sparkles, title: 'Creative Editor', desc: 'Stickers, filters, frames, and text to make it uniquely yours', color: 'from-lavender-100 to-lavender-50' },
  { icon: Image, title: 'Beautiful Layouts', desc: '9 gorgeous layouts from strips to collages to polaroids', color: 'from-sand-100 to-sand-50' },
];

const samplePhotos = [
  { bg: 'from-blush-200 to-lavender-200', emoji: '📷', rotate: -6 },
  { bg: 'from-lavender-200 to-sage-100', emoji: '🌸', rotate: 3 },
  { bg: 'from-sand-200 to-blush-100', emoji: '✨', rotate: -2 },
];

export default function HomePage() {
  const { goToLayout, goToGallery } = useApp();

  return (
    <div className="min-h-screen overflow-hidden">
      {/* Navbar */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 glass border-b border-white/40"
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blush-400 to-lavender-400 rounded-xl flex items-center justify-center shadow-glow-pink">
            <Camera className="w-4 h-4 text-white" />
          </div>
          <span className="font-display font-bold text-xl text-charcoal-800">SnapStudio</span>
        </div>

        <div className="hidden md:flex items-center gap-1">
          {[
            { label: 'Home', active: true },
            { label: 'Templates', action: goToLayout },
            { label: 'Gallery', action: goToGallery },
            { label: 'About', action: undefined },
          ].map(item => (
            <button
              key={item.label}
              onClick={item.action}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                item.active
                  ? 'bg-blush-50 text-blush-500'
                  : 'text-gray-600 hover:bg-blush-50 hover:text-blush-500'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={goToLayout}
          className="btn-primary text-sm px-5 py-2.5"
        >
          <Camera className="w-4 h-4" />
          Start
        </motion.button>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-soft pt-20 overflow-hidden">
        {/* Floating decorative elements */}
        {floatingItems.map((item, i) => (
          <motion.div
            key={i}
            className="absolute text-4xl select-none pointer-events-none"
            style={{ left: item.x, top: item.y }}
            initial={{ opacity: 0, scale: 0, rotate: item.rotation }}
            animate={{
              opacity: 1,
              scale: 1,
              rotate: item.rotation,
              y: [0, -12, 0],
            }}
            transition={{
              opacity: { delay: item.delay + 0.5, duration: 0.5 },
              scale: { delay: item.delay + 0.5, duration: 0.5, type: 'spring', bounce: 0.4 },
              y: {
                delay: item.delay + 1,
                duration: 3 + i * 0.5,
                repeat: Infinity,
                ease: 'easeInOut',
              },
            }}
          >
            {item.emoji}
          </motion.div>
        ))}

        {/* Blurred gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blush-200/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-lavender-200/30 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-6xl mx-auto px-6 flex flex-col lg:flex-row items-center gap-16">
          {/* Left: Text */}
          <div className="flex-1 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="inline-flex items-center gap-2 bg-blush-50 text-blush-500 border border-blush-200 rounded-full px-4 py-2 text-sm font-medium mb-6"
            >
              <Sparkles className="w-4 h-4" />
              Your digital photobooth
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.7 }}
              className="font-display text-5xl lg:text-7xl font-bold text-charcoal-800 leading-tight mb-6"
            >
              Your Moments,{' '}
              <span className="text-gradient">Your Style.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.6 }}
              className="text-gray-500 text-xl leading-relaxed mb-10 max-w-xl mx-auto lg:mx-0"
            >
              Create memories, one snapshot at a time. Add filters, stickers, and frames to make every photo uniquely yours.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <motion.button
                whileHover={{ scale: 1.04, boxShadow: '0 0 40px rgba(255,133,161,0.5)' }}
                whileTap={{ scale: 0.97 }}
                onClick={goToLayout}
                className="btn-primary text-base px-8 py-4"
              >
                <Camera className="w-5 h-5" />
                START PHOTOBOOTH
                <ArrowRight className="w-4 h-4" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                onClick={goToLayout}
                className="btn-secondary text-base px-8 py-4"
              >
                <Image className="w-5 h-5" />
                EXPLORE LAYOUTS
              </motion.button>
            </motion.div>

            {/* Social proof */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="flex items-center gap-4 mt-10 justify-center lg:justify-start"
            >
              <div className="flex -space-x-2">
                {['🧑‍🎨', '👩‍💻', '🧑‍🎤', '👩‍🎨'].map((emoji, i) => (
                  <div
                    key={i}
                    className="w-9 h-9 rounded-full bg-gradient-to-br from-blush-100 to-lavender-100 border-2 border-white flex items-center justify-center text-sm"
                  >
                    {emoji}
                  </div>
                ))}
              </div>
              <div className="text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <span>Loved by creators everywhere</span>
              </div>
            </motion.div>
          </div>

          {/* Right: Animated photo preview */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.7 }}
            className="flex-1 flex items-center justify-center"
          >
            <div className="relative w-80 h-96">
              {samplePhotos.map((photo, i) => (
                <motion.div
                  key={i}
                  className={`absolute bg-gradient-to-br ${photo.bg} rounded-2xl shadow-medium border border-white/80`}
                  style={{
                    width: 200,
                    height: 260,
                    left: `${15 + i * 20}%`,
                    top: `${5 + i * 8}%`,
                    rotate: photo.rotate,
                  }}
                  initial={{ opacity: 0, scale: 0.8, y: 40 }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    y: [0, -8, 0],
                  }}
                  transition={{
                    opacity: { delay: 0.6 + i * 0.15, duration: 0.5 },
                    scale: { delay: 0.6 + i * 0.15, duration: 0.5, type: 'spring' },
                    y: { delay: 1 + i * 0.3, duration: 3, repeat: Infinity, ease: 'easeInOut' },
                  }}
                >
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                    <div className="text-5xl">{photo.emoji}</div>
                    <div className="w-16 h-1.5 bg-white/50 rounded-full" />
                    <div className="w-10 h-1 bg-white/30 rounded-full" />
                  </div>
                  {/* Corner decoration */}
                  <div className="absolute top-3 right-3 text-white/60 text-xs">SnapStudio</div>
                </motion.div>
              ))}

              {/* Camera icon in center */}
              <motion.div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <div className="w-16 h-16 bg-white rounded-2xl shadow-strong flex items-center justify-center">
                  <Camera className="w-8 h-8 text-blush-400" />
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <div className="w-6 h-10 border-2 border-blush-300 rounded-full flex items-start justify-center pt-1.5">
            <div className="w-1.5 h-3 bg-blush-300 rounded-full" />
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold text-charcoal-800 mb-4">
              Everything you need to create
            </h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              Professional photobooth features packed into a beautiful, easy-to-use interface.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                whileHover={{ y: -4, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
                className="card group cursor-default"
              >
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-6 h-6 text-charcoal-800" />
                </div>
                <h3 className="font-semibold text-charcoal-800 text-lg mb-2">{feature.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section className="py-20 px-6 bg-gradient-soft">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold text-charcoal-800 mb-4">
              Simple, step by step
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: '01', title: 'Choose Layout', desc: 'Pick your perfect photo arrangement', emoji: '🖼️' },
              { step: '02', title: 'Take Photos', desc: 'Smile! Countdown and capture', emoji: '📸' },
              { step: '03', title: 'Customize', desc: 'Add stickers, filters & text', emoji: '🎨' },
              { step: '04', title: 'Download', desc: 'Save or print your creation', emoji: '💾' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="relative inline-block mb-4">
                  <div className="w-16 h-16 bg-white rounded-2xl shadow-soft flex items-center justify-center text-3xl mx-auto">
                    {item.emoji}
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-blush-400 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {i + 1}
                  </div>
                </div>
                <h3 className="font-semibold text-charcoal-800 mb-1">{item.title}</h3>
                <p className="text-gray-500 text-sm">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-blush-400 to-lavender-400">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto text-center"
        >
          <div className="text-5xl mb-6">📸</div>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to create your first photo?
          </h2>
          <p className="text-white/80 text-lg mb-8">No signup required. Just you and your camera.</p>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={goToLayout}
            className="bg-white text-blush-500 font-bold px-10 py-4 rounded-full shadow-strong hover:shadow-glow-pink transition-all duration-200 inline-flex items-center gap-3 text-lg"
          >
            <Camera className="w-5 h-5" />
            Start Creating Now
          </motion.button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 bg-charcoal-900 text-gray-400 text-center text-sm">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Camera className="w-4 h-4 text-blush-400" />
          <span className="font-display font-bold text-white">SnapStudio</span>
        </div>
        <p>Made with <Heart className="w-3 h-3 inline text-blush-400" /> for creative moments</p>
      </footer>
    </div>
  );
}
