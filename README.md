
# CourseTrack - Build Learning Paths

A modern web application for organizing and tracking your learning journey. Create skills, build playlists of learning resources, and monitor your progress as you develop new capabilities.

Live project link: https://makeplaylist.netlify.app/

## 🚀 Features

- **Skill Management**: Create and organize different skills you want to learn
- **Playlist Organization**: Build curated playlists of learning resources for each skill
- **Progress Tracking**: Mark completed items and track your learning progress
- **Modern UI**: Clean, responsive design with smooth animations
- **Drag & Drop**: Reorder playlist items with intuitive drag-and-drop functionality

## 🛠️ Tech Stack

- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Icons**: Lucide React
- **Drag & Drop**: react-beautiful-dnd
- **State Management**: @tanstack/react-query
- **Notifications**: Sonner

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Chetan1930/playlistarchitect.git
   cd coursetrack
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:8080` to view the application.

## 🎯 Usage

### Creating Skills
1. Click the "Add New Skill" button on the homepage
2. Enter a skill name and description
3. Optionally add a custom thumbnail URL
4. Save to create your new skill

### Managing Playlists
1. Click on any skill card to view its details
2. Add new playlists with the "Add Playlist" button
3. Drag and drop to reorder playlist items
4. Mark items as complete to track your progress

### Editing and Deleting
- Hover over skill cards to reveal edit and delete options
- Use the edit button to modify skill details
- Delete skills (and all associated playlists) with the delete button

## 🚀 Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory, ready for deployment to any static hosting service.

## 📱 Responsive Design

CourseTrack is fully responsive and works seamlessly across:
- Desktop computers
- Tablets
- Mobile devices

## 🎨 Customization

The application uses Tailwind CSS for styling, making it easy to customize:
- Colors and themes can be modified in `tailwind.config.ts`
- Component styles are located in `src/components/`
- Global styles are in `src/index.css`

## 📂 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   ├── Header.tsx      # Application header
│   ├── SkillCard.tsx   # Individual skill cards
│   └── ...
├── pages/              # Application pages
│   ├── Index.tsx       # Homepage
│   ├── SkillDetail.tsx # Skill detail page
│   └── ...
├── utils/              # Utility functions
│   ├── api.ts          # API functions
│   └── types.ts        # TypeScript types
└── hooks/              # Custom React hooks
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 👨‍💻 Author

**Chetan Chauhan**
- Email: chetanchauhan1930@gmail.com
- GitHub: https://github.com/Chetan1930

## 🙏 Acknowledgments

- Built with modern React and TypeScript
- UI components powered by shadcn/ui
- Icons provided by Lucide React
- Styling with Tailwind CSS

---

*Happy Learning! 🎓*
