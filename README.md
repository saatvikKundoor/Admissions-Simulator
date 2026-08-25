<div align="center">
  <h1>🎓 Admissions Simulator</h1>
  <p><em>You think you know who gets in? Prove it.</em></p>
</div>

A browser-based game where you play college admissions officer. Read a real, anonymized applicant profile sourced from Reddit (r/chanceme, r/collegeresults), predict which schools on their list admitted them, then see how your read stacks up against what actually happened.

### Play now [here](https://admissions-simulator.pages.dev/)!

## Features

- **Real applicant profiles:** Every profile comes from a public r/collegeresults post, with identifying details removed. You see GPA, test scores, extracurriculars, awards, and demographics, the same file an admissions officer would read.
- **Two ways to guess:** Tap through each school to cycle Admitted, Waitlisted, or Rejected, or drag schools into result columns. Drag mode is the default, and your choice is remembered between sessions.
- **College info at a glance:** Tap the info icon next to any school to see its public/private status, admission rate, average SAT, and median ACT, sourced from College Scorecard data and cached for the session.
- **Filter the pool:** Narrow the applicant pool by college, intended major, ethnicity, or residence, and by SAT/ACT/GPA ranges, before starting a session. Filters reset on every visit.
- **Custom sessions:** Pick how many applicants you want to read, from 1 to 20, with the slider automatically adjusting to how many profiles match your filters.
- **Animated reveal:** After you submit, results roll in one school at a time with a count-up score animation, a round timer, and a "Check Profile" option to re-read the file before moving on.
- **Session recap:** A closing scoreboard shows accuracy, correct guesses, and applicants read, with confetti if you scored well and a stamp of shame if you didn't.
- **Submit your own profile:** Contribute a profile of your own through an in-app form. Submissions go into a separate review queue and are checked by hand before entering the game.
- **Synthesized audio:** Stamps, card flips, and background music are all played through the Web Audio API, with independent volume sliders for sound effects and music, persisted between visits.
- **Built for everyone:** Keyboard-navigable with visible focus states, screen-reader announcements for score updates, modal focus trapping, and full support for reduced-motion preferences.
- **Mobile-friendly:** Responsive layout across the header, college info popups, school rows, stat cards, and drag targets, tuned for phones and touch input.
- **Free to run:** Open-source and built entirely on free-tier infrastructure. No server to manage and no paid services required.

## Tech Stack

- [React](https://react.dev/) + [Vite](https://vite.dev/) for the frontend
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Supabase](https://supabase.com/) (Postgres + RLS) for the backend
- [Cloudflare Pages](https://pages.cloudflare.com/) for hosting
- [dnd kit](https://dndkit.com/) for the drag-and-drop guessing interface
- Web Audio API (via the [uisfx](https://www.npmjs.com/package/uisfx) library) for sound effects and music

## Acknowledgements

- [r/collegeresults](https://www.reddit.com/r/collegeresults/) communities, whose publicly shared posts are the source material for every profile in this game.
- [College Scorecard](https://collegescorecard.ed.gov/), a U.S. Department of Education dataset, for institutional stats shown in the college info popups.
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