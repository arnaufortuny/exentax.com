import { OAuth2Client } from "google-auth-library";
import { db } from "./db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";
import type { Express, Request, Response } from "express";
import crypto from "crypto";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

const googleClient = GOOGLE_CLIENT_ID ? new OAuth2Client(GOOGLE_CLIENT_ID) : null;

declare module "express-session" {
  interface SessionData {
    oauthState?: string;
    oauthAction?: "login" | "connect";
  }
}

function generateClientId(): string {
  return Math.floor(10000000 + Math.random() * 90000000).toString();
}

async function findOrCreateUserByGoogle(profile: {
  googleId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
}) {
  const existingByGoogle = await db.select().from(users).where(eq(users.googleId, profile.googleId)).limit(1);
  if (existingByGoogle.length > 0) {
    return existingByGoogle[0];
  }

  const existingByEmail = await db.select().from(users).where(eq(users.email, profile.email)).limit(1);
  if (existingByEmail.length > 0) {
    await db.update(users).set({ 
      googleId: profile.googleId,
      emailVerified: true,
      profileImageUrl: profile.profileImageUrl || existingByEmail[0].profileImageUrl,
      updatedAt: new Date()
    }).where(eq(users.id, existingByEmail[0].id));
    return { ...existingByEmail[0], googleId: profile.googleId, emailVerified: true };
  }

  const newUser = await db.insert(users).values({
    email: profile.email,
    firstName: profile.firstName,
    lastName: profile.lastName,
    profileImageUrl: profile.profileImageUrl,
    googleId: profile.googleId,
    emailVerified: true,
    clientId: generateClientId(),
    isActive: true,
    accountStatus: "active",
  }).returning();

  return newUser[0];
}

export function setupOAuth(app: Express) {
  app.get("/api/auth/google", async (req: Request, res: Response) => {
    const isConnect = req.query.connect === "true";
    
    if (isConnect && !req.session.userId) {
      return res.redirect("/login?error=login_required");
    }
    
    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
      return res.redirect("/login?error=google_not_configured");
    }

    const protocol = req.headers["x-forwarded-proto"] || req.protocol;
    const host = req.headers.host || "localhost:5000";
    const redirectUri = `${protocol}://${host}/api/auth/google/callback`;

    const oauthState = crypto.randomBytes(32).toString("hex");
    req.session.oauthState = oauthState;
    req.session.oauthAction = isConnect ? "connect" : "login";
    
    await new Promise<void>((resolve, reject) => {
      req.session.save((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    authUrl.searchParams.set("client_id", GOOGLE_CLIENT_ID);
    authUrl.searchParams.set("redirect_uri", redirectUri);
    authUrl.searchParams.set("response_type", "code");
    authUrl.searchParams.set("scope", "openid email profile");
    authUrl.searchParams.set("state", oauthState);
    authUrl.searchParams.set("access_type", "offline");
    authUrl.searchParams.set("prompt", "select_account");

    return res.redirect(authUrl.toString());
  });

  app.get("/api/auth/google/callback", async (req: Request, res: Response) => {
    try {
      const { code, state, error } = req.query;
      
      const expectedState = req.session.oauthState;
      const action = req.session.oauthAction;
      
      delete req.session.oauthState;
      delete req.session.oauthAction;
      
      if (error) {
        console.error("Google OAuth error:", error);
        return res.redirect("/login?error=oauth_denied");
      }

      if (!state || state !== expectedState) {
        console.error("OAuth state mismatch:", { state, expectedState });
        return res.redirect("/login?error=invalid_state");
      }

      if (!code || typeof code !== "string") {
        return res.redirect("/login?error=no_code");
      }

      if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
        return res.redirect("/login?error=google_not_configured");
      }

      const protocol = req.headers["x-forwarded-proto"] || req.protocol;
      const host = req.headers.host || "localhost:5000";
      const redirectUri = `${protocol}://${host}/api/auth/google/callback`;

      const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: GOOGLE_CLIENT_ID,
          client_secret: GOOGLE_CLIENT_SECRET,
          code,
          grant_type: "authorization_code",
          redirect_uri: redirectUri,
        }),
      });

      if (!tokenResponse.ok) {
        const errorData = await tokenResponse.text();
        console.error("Token exchange failed:", errorData);
        return res.redirect("/login?error=token_exchange_failed");
      }

      const tokens = await tokenResponse.json();
      const idToken = tokens.id_token;

      if (!idToken) {
        return res.redirect("/login?error=no_id_token");
      }

      const ticket = await googleClient!.verifyIdToken({
        idToken,
        audience: GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      if (!payload || !payload.email) {
        return res.redirect("/login?error=invalid_token");
      }

      const isConnect = action === "connect";

      if (isConnect && req.session.userId) {
        const [existingUser] = await db.select().from(users).where(eq(users.id, req.session.userId)).limit(1);
        if (existingUser) {
          await db.update(users).set({ 
            googleId: payload.sub, 
            updatedAt: new Date() 
          }).where(eq(users.id, existingUser.id));
          return res.redirect("/dashboard?connected=google");
        }
      }

      const user = await findOrCreateUserByGoogle({
        googleId: payload.sub,
        email: payload.email,
        firstName: payload.given_name,
        lastName: payload.family_name,
        profileImageUrl: payload.picture,
      });

      if (!user.isActive || user.accountStatus === "deactivated") {
        return res.redirect("/login?error=account_deactivated");
      }

      req.session.userId = user.id;
      await new Promise<void>((resolve, reject) => {
        req.session.save((err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      return res.redirect("/dashboard");
    } catch (error) {
      console.error("Google OAuth callback error:", error);
      return res.redirect("/login?error=auth_failed");
    }
  });

  app.post("/api/auth/google", async (req: Request, res: Response) => {
    try {
      const { credential } = req.body;

      if (!credential) {
        return res.status(400).json({ message: "Credencial de Google requerida" });
      }

      if (!googleClient || !GOOGLE_CLIENT_ID) {
        return res.status(503).json({ message: "Google OAuth no esta configurado" });
      }

      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      if (!payload || !payload.email) {
        return res.status(400).json({ message: "Token de Google invalido" });
      }

      const user = await findOrCreateUserByGoogle({
        googleId: payload.sub,
        email: payload.email,
        firstName: payload.given_name,
        lastName: payload.family_name,
        profileImageUrl: payload.picture,
      });

      if (!user.isActive || user.accountStatus === "deactivated") {
        return res.status(403).json({ message: "Cuenta desactivada" });
      }

      req.login(user, (err) => {
        if (err) {
          console.error("Error en login de Google:", err);
          return res.status(500).json({ message: "Error al iniciar sesion" });
        }
        return res.json({
          message: "Inicio de sesion exitoso",
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            profileImageUrl: user.profileImageUrl,
            clientId: user.clientId,
            isAdmin: user.isAdmin,
            emailVerified: user.emailVerified,
            googleId: user.googleId ? true : false,
          }
        });
      });
    } catch (error) {
      console.error("Error en autenticacion de Google:", error);
      return res.status(401).json({ message: "Error al verificar credencial de Google" });
    }
  });

  app.post("/api/auth/connect/google", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated() || !req.user) {
        return res.status(401).json({ message: "No autenticado" });
      }

      const { credential } = req.body;
      if (!credential || !googleClient || !GOOGLE_CLIENT_ID) {
        return res.status(400).json({ message: "Credencial de Google requerida" });
      }

      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      if (!payload) {
        return res.status(400).json({ message: "Token invalido" });
      }

      const existingUser = await db.select().from(users).where(eq(users.googleId, payload.sub)).limit(1);
      if (existingUser.length > 0 && existingUser[0].id !== (req.user as any).id) {
        return res.status(409).json({ message: "Esta cuenta de Google ya esta vinculada a otro usuario" });
      }

      await db.update(users).set({ 
        googleId: payload.sub,
        updatedAt: new Date()
      }).where(eq(users.id, (req.user as any).id));

      return res.json({ message: "Cuenta de Google vinculada exitosamente" });
    } catch (error) {
      console.error("Error conectando Google:", error);
      return res.status(500).json({ message: "Error al vincular cuenta de Google" });
    }
  });

  app.post("/api/auth/disconnect/google", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated() || !req.user) {
        return res.status(401).json({ message: "No autenticado" });
      }

      const userId = (req.user as any).id;
      const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);

      if (user.length === 0) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }

      if (!user[0].passwordHash) {
        return res.status(400).json({ 
          message: "Debes tener una contrasena configurada antes de desvincular Google" 
        });
      }

      await db.update(users).set({ 
        googleId: null,
        updatedAt: new Date()
      }).where(eq(users.id, userId));

      return res.json({ message: "Cuenta de Google desvinculada exitosamente" });
    } catch (error) {
      console.error("Error desconectando Google:", error);
      return res.status(500).json({ message: "Error al desvincular cuenta de Google" });
    }
  });
}
