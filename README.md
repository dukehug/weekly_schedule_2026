# Weekly Schedule 2026

![schedule_make](public/og-image.jpg)

Project started: January 7, 2026

A personal weekly planner built with React, Vite, and Tailwind CSS. It provides a simple and intuitive way to organize your weekly schedule.

Try it online: https://weekly.52hz.im

This is a personal, non-commercial project. You are welcome to use and modify it freely under the license provided at the end of this document.

## Changelog and Support

- [Changelog](CHANGELOG.md)
- [Support and issue reports](https://github.com/dukehug/weekly_schedule_2026/issues)

## Features

- Plan and manage your schedule one week at a time
- Keep your data on your own device without creating an account
- Optional Google Analytics 4 usage tracking, which can be disabled as explained below

## Local Development Setup

Follow these steps to run the project on your computer.

### Get the Project

If you cloned this repository, skip the "Create a New Project from Scratch" option below and go directly to "Install Dependencies."

**Option 1: Clone This Repository (Recommended)**

```bash
git clone https://github.com/dukehug/weekly_schedule_2026.git
cd weekly_schedule_2026
```

**Option 2: Create a New Project from Scratch**

```bash
npm create vite@latest weekly-schedule -- --template react
cd weekly-schedule
```

### Install Dependencies

```bash
npm install
```

If you created a new project from scratch using Option 2, you also need to install Tailwind CSS:

```bash
npm install -D tailwindcss @tailwindcss/vite
```

### Start the Development Server

```bash
npm run dev
```

To test the app on another device connected to the same local network, such as a phone, use:

```bash
npm run dev -- --host 0.0.0.0
```

After the server starts, open the app in a browser using `localhost` or your computer's local network IP address.

### Build and Preview the Production Version

```bash
npm run build
npm run preview
```

## Google Analytics 4 (Optional)

To enable usage tracking, first create a GA4 web data stream in Google Analytics. Then copy the example environment file:

```bash
cp .env.example .env
```

Replace `G-XXXXXXXXXX` in `.env` with your own GA4 Measurement ID:

```env
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

Restart the development server after changing the environment variable. If the variable is missing or invalid, analytics will be disabled automatically and the rest of the app will continue to work normally.

**Privacy note:** This feature only tracks page views and actions such as saving, importing, exporting, adding, editing, deleting, and resetting schedules. It never sends course names, classroom names, or any actual schedule content to Google Analytics.

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for the full update history.

## License

MIT
