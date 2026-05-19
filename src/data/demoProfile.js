//   src/data/demoProfile.js

const demoProfile = {
  id: 'demo',
  name: 'Demo',
  gridSize: 4,
  bgHue: 210,
  accentHue: 160,
  tiles: [
    {
      id: 1001,
      type: 'info',
      row: 0,
      col: 0,
      size: 1,
      title: 'Welcome!',
      content: 'This is a demo workspace. Explore the tiles below.',
    },
    {
      id: 1002,
      type: 'note',
      row: 0,
      col: 1,
      size: 1,
      title: '',
      content: '<strong>This is a demo note.</strong><br>It supports <em>rich text</em>.',
      noteStyle: {
        backgroundColor: '#ffffcc',
        bold: false,
        italic: false,
        underline: false,
        fontSize: 'medium',
        fontFamily: 'sans',
        headerLevel: 0,
      },
    },
    {
      id: 1003,
      type: 'image',
      row: 1,
      col: 0,
      size: 1,
      title: 'Placeholder Image',
      content: 'data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22200%22%20height%3D%22200%22%3E%3Crect%20width%3D%22200%22%20height%3D%22200%22%20fill%3D%22%234283f4%22%2F%3E%3Ctext%20x%3D%22100%22%20y%3D%22100%22%20text-anchor%3D%22middle%22%20dy%3D%22.3em%22%20fill%3D%22white%22%20font-size%3D%2216%22%20font-family%3D%22sans-serif%22%3EDemo%20Image%3C%2Ftext%3E%3C%2Fsvg%3E',
      alt: 'Demo blue square',
    },
    {
      id: 1004,
      type: 'timer',
      row: 2,
      col: 2,
      size: 1,
      title: 'Demo Timer',
      mode: 'stopwatch',
      initialTime: 0,
    },
  ],
};

export default demoProfile;