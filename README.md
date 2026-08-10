<div align="center">
  <h1>🎓 Admissions Simulator</h1>
  <p><em>You think you know who gets in? Prove it.</em></p>
</div>

A browser-based game where you play college admissions officer. Read a real, anonymized applicant profile sourced from Reddit (r/chanceme, r/collegeresults), predict which schools on their list admitted them, then see how your read stacks up against what actually happened.

### Play now [here](https://admissions-simulator.pages.dev/)!
#### [Join the Discord community](https://discord.gg/zJBtP7bUm)

## Features

- **Real applicant profiles:** Every profile comes from a public r/collegeresults post, with identifying details removed. You see GPA, test scores, extracurriculars, awards, and demographics, the same file an admissions officer would read.
- **Two ways to guess:** Tap through each school to cycle Admitted, Waitlisted, or Rejected, or drag schools into result columns. Whichever feels more natural. Your choice is remembered between sessions.
- **Animated reveal:** After you submit, results roll in one school at a time with a score count-up and a note on how you did.
- **Custom sessions:** Pick how many applicants you want to read, anywhere from 1 to 20.
- **Synthesized audio:** Stamps, card flips, and background music are all generated with the Web Audio API at playback time, so there are no audio files to ship. Sound effects and music volume can be set independently.
- **Session recap:** A closing scoreboard shows accuracy, correct guesses, and applicants read, with confetti if you scored well and a stamp of shame if you didn't.
- **Free to run:** Open-source and built entirely on free-tier infrastructure. No server to manage and no paid services required.

## Acknowledgements

- [r/collegeresults](https://www.reddit.com/r/collegeresults/) communities, whose publicly shared posts are the source material for every profile in this game.
- [Supabase](https://supabase.com/) for the Postgres backend and API.
- [dnd kit](https://dndkit.com/) for the drag-and-drop guessing interface.
- [Tailwind CSS](https://tailwindcss.com/) for styling.
- [Vite](https://vite.dev/) and [React](https://react.dev/) for the frontend tooling and framework.
- Google Fonts for Playfair Display, Inter, and JetBrains Mono.

## Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".
Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Community

Join the Discord community [here](https://discord.gg/zJBtP7bUm) to discuss new features, report bugs, talk to the developer, and connect with other players.