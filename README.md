# Orbit - Decentralized Microblogging Platform

A censorship-resistant, decentralized microblogging platform built on the Internet Computer (ICP) blockchain. Users can post short messages called "dweets" and view a timeline of all posts from every user.

## Features

- **🔐 Secure Authentication**: Login with Internet Identity - no passwords, complete privacy
- **🌐 Decentralized**: Built on ICP blockchain - no central authority, no censorship
- **⚡ Real-time**: Instant posts and updates
- **💎 Data Ownership**: Your content, your identity, your control
- **📱 Responsive**: Works on desktop and mobile devices

## Tech Stack

- **Blockchain**: Internet Computer (ICP)
- **Backend**: Motoko canister (smart contract)
- **Frontend**: React.js with TypeScript
- **Authentication**: Internet Identity
- **Styling**: SCSS with modern design

## Project Structure

```
dwitter/
├── src/
│   ├── dwitter_backend/     # Motoko backend canister
│   │   └── main.mo         # Backend logic and data structures
│   └── dwitter_frontend/   # React frontend
│       ├── src/
│       │   ├── components/ # React components
│       │   │   ├── LandingPage.jsx
│       │   │   ├── AuthPage.jsx
│       │   │   └── Dashboard.jsx
│       │   ├── App.jsx     # Main app with routing
│       │   └── index.scss  # Global styles
│       └── package.json    # Frontend dependencies
├── dfx.json               # DFX configuration
└── README.md             # This file
```

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [DFX](https://internetcomputer.org/docs/current/developer-docs/setup/install/) (v0.28.0 or higher)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd dwitter
   ```

2. **Install dependencies**
   ```bash
   cd src/dwitter_frontend
   npm install
   cd ../..
   ```

3. **Start local ICP replica**
   ```bash
   dfx start --clean --background
   ```

4. **Deploy the application**
   ```bash
   dfx deploy
   ```

5. **Start development server** (optional)
   ```bash
   cd src/dwitter_frontend
   npm start
   ```

### Access Points

- **Frontend**: http://u6s2n-gx777-77774-qaaba-cai.localhost:4943/
- **Development Server**: http://localhost:3000 (if running)
- **Backend Candid**: http://127.0.0.1:4943/?canisterId=uzt4z-lp777-77774-qaabq-cai&id=uxrrr-q7777-77774-qaaaq-cai

## Usage

### Landing Page
- Visit the frontend URL to see the Orbit landing page
- Click "Get Started" or "Sign In" to access authentication

### Authentication
- Use Internet Identity for secure, passwordless authentication
- If you don't have an Internet Identity, create one at https://identity.ic0.app/

### Posting Dweets
- After authentication, you'll be redirected to the dashboard
- Use the text area to compose your dweet (max 280 characters)
- Click "Post Dweet" to publish your message

### Viewing Timeline
- All dweets are displayed in reverse chronological order
- Each dweet shows the author's Principal ID and timestamp
- Your own dweets are marked with "Your dweet"

## Backend Functions

The backend canister provides these functions:

- `postDweet(message: Text)`: Create a new dweet
- `getDweets()`: Retrieve all dweets in reverse chronological order
- `getDweetsCount()`: Get total number of dweets
- `getDweet(id: Nat)`: Retrieve a specific dweet by ID

## Data Structure

Each dweet contains:
- `id`: Unique identifier
- `author`: User's Principal ID (blockchain identity)
- `message`: The dweet content (max 280 characters)
- `timestamp`: When the dweet was posted

## Development

### Adding New Features
1. Update the Motoko backend in `src/dwitter_backend/main.mo`
2. Modify React components in `src/dwitter_frontend/src/components/`
3. Update styles in `src/dwitter_frontend/src/index.scss`
4. Deploy changes with `dfx deploy`

### Testing Backend Functions
```bash
# Post a dweet
dfx canister call dwitter_backend postDweet '("Hello, Orbit!")'

# Get all dweets
dfx canister call dwitter_backend getDweets

# Get dweet count
dfx canister call dwitter_backend getDweetsCount
```

## Security Features

- **Internet Identity**: Secure, privacy-preserving authentication
- **Principal-based Identity**: No personal data collection
- **Blockchain Storage**: Immutable, censorship-resistant data
- **Input Validation**: Message length and content validation

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License.

## Support

For questions or issues:
- Check the [Internet Computer documentation](https://internetcomputer.org/docs/)
- Review the [DFX documentation](https://internetcomputer.org/docs/current/developer-docs/setup/install/)
- Open an issue in this repository

---

Built with ❤️ on the Internet Computer
