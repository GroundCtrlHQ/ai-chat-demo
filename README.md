# AI Chat Demo - Rorie Marketing Expert

A Next.js-based AI chat application featuring "Rorie", an AI assistant inspired by Rory Sutherland's marketing expertise and behavioral economics insights.

## Features

- **AI-Powered Chat Interface**: Real-time streaming chat with OpenRouter integration
- **Personality-Driven AI**: Rorie channels Rory Sutherland's contrarian marketing wisdom
- **Modern UI**: Clean, responsive design with dark theme and glassmorphism effects
- **Copy Functionality**: Easy message copying with visual feedback
- **Streaming Responses**: Real-time AI responses using Vercel AI SDK

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **AI Integration**: Vercel AI SDK with OpenRouter
- **Styling**: Tailwind CSS
- **Language**: TypeScript
- **Deployment**: Vercel-ready

## Environment Variables

Create a `.env.local` file with the following variables:

```env
OPENROUTER_API_KEY=your_openrouter_api_key
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
OPENROUTER_MODEL=anthropic/claude-3.7-sonnet
OPENROUTER_SITE_URL=your_site_url
OPENROUTER_SITE_NAME=your_site_name
```

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   - Copy `.env.local.example` to `.env.local`
   - Add your OpenRouter API key and configuration

3. **Run the development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## AI Personality

Rorie is designed to embody Rory Sutherland's marketing philosophy:

- **Contrarian Thinking**: Questions conventional wisdom and approaches problems from unexpected angles
- **Behavioral Economics**: References cognitive biases and psychological insights
- **Creative Solutions**: Focuses on perception, framing, and context over pure logic
- **Engaging Communication**: Uses humor, analogies, and memorable examples

## Project Structure

```
ai-chat/
├── app/
│   ├── api/chat/route.ts    # AI chat API endpoint
│   ├── globals.css          # Global styles
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Chat interface
├── public/                  # Static assets
├── package.json             # Dependencies
└── README.md               # This file
```

## Deployment

This project is optimized for Vercel deployment:

1. **Connect to Vercel**:
   - Push to GitHub
   - Import project in Vercel dashboard

2. **Configure environment variables**:
   - Add all required environment variables in Vercel dashboard

3. **Deploy**:
   - Vercel will automatically build and deploy

## Development

- **TypeScript**: Full type safety throughout the application
- **ESLint**: Code quality and consistency
- **Turbopack**: Fast development builds
- **Hot Reload**: Instant feedback during development

## Future Enhancements

- [ ] Session persistence with Neon database
- [ ] User authentication
- [ ] Conversation history
- [ ] Multiple AI personalities
- [ ] File upload support
- [ ] Voice input/output

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details.
