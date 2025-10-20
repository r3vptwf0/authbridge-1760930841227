export const ENV_VARIABLES: EnvVariable[] = [
  {
    name: "NEXT_PUBLIC_SUPABASE_URL",
    description: "Supabase project URL for client-side authentication and API calls",
    required: true,
    instructions: "Go to [Supabase Dashboard](https://supabase.com/dashboard) → Your Project → Settings → API → Copy the 'Project URL' field (format: https://[project-id].supabase.co)"
  },
  {
    name: "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    description: "Supabase anonymous/publishable key for client-side authentication",
    required: true,
    instructions: "Go to [Supabase Dashboard](https://supabase.com/dashboard) → Your Project → Settings → API → Copy the 'anon public' key under Project API keys"
  },
  {
    name: "TELEGRAM_BOT_TOKEN",
    description: "Telegram Bot Token for sending calendar reminders",
    required: false,
    instructions: "Message @BotFather on Telegram, use /newbot command to create a bot, and copy the token provided"
  },
  {
    name: "TELEGRAM_CHAT_ID",
    description: "Your Telegram Chat ID to receive reminders",
    required: false,
    instructions: "Message @userinfobot on Telegram to get your chat ID, or use @RawDataBot to get your user ID"
  }
];

export interface EnvVariable {
  name: string
  description: string
  instructions: string
  required: boolean
}

export function checkMissingEnvVars(): string[] {
  return ENV_VARIABLES.filter(envVar => envVar.required && !process.env[envVar.name]).map(envVar => envVar.name)
}