import db from "../Drizzle/db";
import { users, admins, staff, sessions } from "../Drizzle/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendEmail } from "../mailer/mailer";

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;

const generateCode = () => Math.floor(100000 + Math.random() * 900000).toString();

export const registerService = async (
  fullName: string,
  email: string,
  phone: string,
  password: string
) => {
  const existingUser = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  const verificationCode = generateCode();
  const passwordHash = await bcrypt.hash(password, 10);
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  if (existingUser) {
    if (existingUser.isVerified) throw new Error("User already registered");
    await db.update(users)
      .set({
        passwordHash,
        verificationCode,
        verificationCodeExpiresAt: expiresAt,
      })
      .where(eq(users.userId, existingUser.userId));
    return;
  }

  const [newUser] = await db.insert(users).values({
    fullName,
    email,
    phone,
    passwordHash,
    role: "customer",
    verificationCode,
    verificationCodeExpiresAt: expiresAt,
    isVerified: false,
    isActive: true,
  }).returning();

  const adminRecord = await db.query.admins.findFirst({
    where: eq(admins.email, email),
  });
  const staffRecord = await db.query.staff.findFirst({
    where: eq(staff.email, email),
  });

  if (adminRecord) {
    await db.update(admins)
      .set({ userId: newUser.userId })
      .where(eq(admins.adminId, adminRecord.adminId));
    await db.update(users)
      .set({ role: "admin" })
      .where(eq(users.userId, newUser.userId));
  } else if (staffRecord) {
    await db.update(staff)
      .set({ userId: newUser.userId })
      .where(eq(staff.staffId, staffRecord.staffId));
    await db.update(users)
      .set({ role: "staff" })
      .where(eq(users.userId, newUser.userId));
  }

  await sendEmail(
    email,
    "Account Verification - GMNEX",
    `Your verification code is ${verificationCode}`,
    `<h2>Verify Account</h2>
     <p>Hi ${fullName},</p>
     <p>Thank you for registering. Your verification code is:</p>
     <h1 style="background:#0b6b3a;color:#fff;padding:15px;text-align:center;border-radius:5px;">${verificationCode}</h1>
     <p>This code expires in 24 hours.</p>
     <br>
     <p>Best regards,<br>GMNEX Team</p>`
  );
};

export const verifyService = async (email: string, code: string) => {
  const user = await db.query.users.findFirst({ where: eq(users.email, email) });
  if (!user) throw new Error("User not found");
  if (user.isVerified) throw new Error("Email already verified");
  if (user.verificationCode !== code) throw new Error("Invalid verification code");
  if (user.verificationCodeExpiresAt && new Date() > user.verificationCodeExpiresAt)
    throw new Error("Verification code expired");
  await db.update(users)
    .set({ isVerified: true, verificationCode: null, verificationCodeExpiresAt: null })
    .where(eq(users.userId, user.userId));
};

export const loginService = async (email: string, password: string) => {
  const user = await db.query.users.findFirst({ where: eq(users.email, email) });
  if (!user) throw new Error("User not registered");
  if (!user.isVerified) throw new Error("Account not verified");

  const match = await bcrypt.compare(password.trim(), user.passwordHash);
  if (!match) throw new Error("Invalid credentials");

  let role = user.role;
  let dashboard = "customer";

  if (role === "admin") {
    dashboard = "admin";
  } else if (role === "staff") {
    dashboard = "staff";
  }

  await db.update(users).set({ lastLogin: new Date() }).where(eq(users.userId, user.userId));

  const token = jwt.sign(
    { userId: user.userId, role, email: user.email },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
  const refreshToken = jwt.sign(
    { userId: user.userId },
    JWT_REFRESH_SECRET,
    { expiresIn: "30d" }
  );

  await db.insert(sessions).values({
    userId: user.userId,
    sessionToken: refreshToken,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  });

  return {
    token,
    refreshToken,
    role: role,
    dashboard: dashboard,
    userId: user.userId,
    email: user.email,
    fullName: user.fullName,
  };
};

export const forgotPasswordService = async (email: string) => {
  const user = await db.query.users.findFirst({ where: eq(users.email, email) });
  if (!user || !user.isVerified) throw new Error("User not found or not verified");
  const resetCode = generateCode();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
  await db.update(users)
    .set({ resetToken: resetCode, resetTokenExpiry: expiresAt })
    .where(eq(users.userId, user.userId));
  await sendEmail(
    email,
    "Password Reset - GMNEX",
    `Reset code: ${resetCode}`,
    `<h2>Password Reset</h2>
     <p>Hi ${user.fullName},</p>
     <p>Your reset code is:</p>
     <h1 style="background:#0b6b3a;color:#fff;padding:15px;text-align:center;border-radius:5px;">${resetCode}</h1>
     <p>This code expires in 10 minutes.</p>
     <br>
     <p>Best regards,<br>GMNEX Team</p>`
  );
};

export const verifyResetCodeService = async (email: string, code: string) => {
  const user = await db.query.users.findFirst({ where: eq(users.email, email) });
  if (!user) throw new Error("User not found");
  if (user.resetToken !== code) throw new Error("Invalid reset code");
  if (!user.resetTokenExpiry || new Date() > user.resetTokenExpiry)
    throw new Error("Reset code expired");
};

export const resetPasswordService = async (email: string, password: string) => {
  if (!email) throw new Error("Email is required");
  const user = await db.query.users.findFirst({ where: eq(users.email, email) });
  if (!user) throw new Error("User not found");
  const passwordHash = await bcrypt.hash(password.trim(), 10);
  await db.update(users)
    .set({ passwordHash, resetToken: null, resetTokenExpiry: null })
    .where(eq(users.userId, user.userId));
};