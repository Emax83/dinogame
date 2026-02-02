# 🦖 Dino Game

A fun Chrome dinosaur game clone built with vanilla JavaScript, HTML5 Canvas, and integrated with **Vercel Web Analytics**.

## 🎮 Game Features

- **Simple Controls**: Press `Space` or `↑` arrow key to jump (or tap on mobile)
- **Score Tracking**: Keep track of your current score and high score
- **Persistent High Score**: Your best score is saved in browser local storage
- **Responsive Design**: Works on desktop and mobile devices
- **Analytics Integration**: Tracks game events using Vercel Web Analytics

## 🚀 Quick Start

### Play Online

Deploy to Vercel with one click:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Emax83/dinogame)

### Run Locally

1. Clone the repository:
```bash
git clone https://github.com/Emax83/dinogame.git
cd dinogame
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:3000`

## 📊 Vercel Web Analytics Integration

This game is integrated with **Vercel Web Analytics** to track visitor behavior and game events.

### How It Works

The analytics implementation uses the `@vercel/analytics` package via CDN:

```html
<script type="module">
    import { inject } from 'https://cdn.jsdelivr.net/npm/@vercel/analytics/+esm';
    inject();
</script>
```

### Tracked Events

- **Page Views**: Automatically tracked when users visit the game
- **Game Over Events**: Custom events tracked with score data:
  ```javascript
  window.va('event', {
    name: 'game_over',
    data: {
      score: score,
      high_score: highScore
    }
  });
  ```

### Enabling Analytics on Vercel

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Click the **Analytics** tab
4. Click **Enable** to activate Web Analytics
5. Deploy your app - analytics routes will be available at `/_vercel/insights/*`

### Viewing Analytics Data

After deployment and user visits:
1. Navigate to your project in the Vercel Dashboard
2. Click the **Analytics** tab
3. View real-time visitor data, page views, and custom events
4. Filter and analyze game over events to see player performance

## 🎯 How to Play

1. Click "Start Game" or press `Space`/`↑` to begin
2. Jump over the cacti obstacles by pressing `Space`, `↑`, or tapping the screen
3. Try to achieve the highest score possible!
4. When you hit an obstacle, the game ends
5. Press `Space`/`↑` or click "Start Game" to play again

## 🛠️ Technical Details

### Technologies Used

- **HTML5 Canvas**: For rendering the game graphics
- **Vanilla JavaScript**: Pure JavaScript with no frameworks
- **CSS3**: Modern styling with gradients and responsive design
- **LocalStorage**: For persistent high score tracking
- **Vercel Web Analytics**: For visitor and event tracking

### Project Structure

```
dinogame/
├── index.html      # Main HTML file with analytics integration
├── game.js         # Game logic and mechanics
├── style.css       # Styling and responsive design
├── package.json    # Project configuration
├── vercel.json     # Vercel deployment configuration
└── README.md       # Documentation
```

### Game Mechanics

- **Gravity**: Realistic gravity physics for jumping
- **Collision Detection**: Precise hitbox collision detection
- **Dynamic Obstacles**: Randomly spawned cacti at intervals
- **Score System**: +10 points for each obstacle successfully passed

## 📱 Browser Compatibility

The game works on all modern browsers:
- ✅ Chrome
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest new features
- Submit pull requests

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Learn More

- [Vercel Web Analytics Documentation](https://vercel.com/docs/analytics)
- [Vercel Analytics Package](https://vercel.com/docs/analytics/package)
- [Custom Events in Vercel Analytics](https://vercel.com/docs/analytics/custom-events)

---

Made with ❤️ and deployed on [Vercel](https://vercel.com)
