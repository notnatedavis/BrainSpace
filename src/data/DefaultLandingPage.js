// src/data/DefaultLandingPage.js
// Default landing page profile – loaded when no user profile is active

const profile = {
  id: "exported",
  name: "DefaultLandingPage",
  tiles: [
    {
      id: 1,
      type: "info",
      row: 0,
      col: 0,
      size: 1,
      title: "Welcome to BrainSpace !",
      content: "Click around and explore the workspace"
    }
  ],
  gridRows: 3,
  gridCols: 3,
  bgColor: {
    h: 0,
    s: 0,
    l: 100
  },
  accentColor: {
    h: 152,
    s: 26,
    l: 54
  },
  backgroundType: "none",
  backgroundValue: "",
  backgroundOpacity: 0.3,
  backgroundMuted: true
};

export default profile;