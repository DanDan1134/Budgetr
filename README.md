# Budgetr

A minimal and simple budgeting app built with React Native and Expo.

## Features

- Set monthly budget and optional income
- Create and edit categories with percentage or dollar allocations
- Track spending with filters, search, and day groups
- Recurring bills, save goals, and period history with CSV export
- Optional device lock and a 1st-of-month reminder
- Dark theme with green accents
- Local SQLite storage (no login required)

## Getting Started

```bash
npm install
npm start
```

Then scan the QR code with Expo Go app on your phone, or press 'a' for Android or 'i' for iOS simulator.

## Tech Stack

- React Native
- Expo
- TypeScript
- Expo Router (file-based routing)
- Expo SQLite (local database)
- React Native Picker

## Project Structure

- `app/` - Screens and navigation
- `components/` - Reusable UI components
- `services/` - Database services
- `utils/` - Helper functions
- `constants/` - Theme and styling constants
