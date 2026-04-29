// Kimi OAuth modules - disabled in favor of custom JWT auth
// These files are kept for compatibility but are not used

export async function authenticateRequest(_headers: Headers) {
  return undefined;
}

export function createOAuthCallbackHandler() {
  return async () => {
    return new Response("OAuth disabled", { status: 403 });
  };
}
