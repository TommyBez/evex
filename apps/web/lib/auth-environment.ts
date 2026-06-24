export const isDevelopment = process.env.NODE_ENV === 'development'
export const isVercelPreview = process.env.VERCEL_ENV === 'preview'

const isAuthProductionEnvironment = process.env.VERCEL_ENV
  ? process.env.VERCEL_ENV === 'production'
  : process.env.NODE_ENV === 'production'

export const shouldBypassAuthOtp = !isAuthProductionEnvironment
