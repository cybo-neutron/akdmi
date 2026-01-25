import { createUser, getUserByEmail } from '@org/database/repo';
import bcrypt from 'bcrypt';
import z from 'zod';
import jwt from 'jsonwebtoken';

export async function registerNewUser(newUserData: any) {
  const validateUser = z.object({
    firstName: z.string().max(255).optional(),
    lastName: z.string().max(255).optional(),
    email: z.email(),
    password: z.string().min(8).max(255),
  });
  const validateUserResult = validateUser.safeParse(newUserData);

  if (!validateUserResult.success) {
    throw new Error(validateUserResult.error.message);
  }

  const { firstName, lastName, email, password } = newUserData;
  const findUser = await getUserByEmail({ email });

  if (findUser) {
    throw new Error('User already exists');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const newUser = await createUser({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });

    const tokenPayload = {
      userId: newUser.id,
      email: newUser.email,
    };

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET as string, {
      expiresIn: '1m',
    });

    return {
      token,
    };
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function loginUser(loginData: {
  email: string;
  password: string;
}) {
  const validateUser = z.object({
    email: z.email(),
    password: z.string().min(8).max(255),
  });

  const { email, password } = loginData;

  const validateUserResult = validateUser.safeParse(loginData);

  if (!validateUserResult.success) {
    throw new Error(validateUserResult.error.message);
  }

  try {
    const user = await getUserByEmail({ email });

    if (!user) {
      throw new Error('User not found');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new Error('Invalid password');
    }

    const tokenPayload = {
      userId: user.id,
      email: user.email,
    };

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET as string, {
      expiresIn: '1m',
    });

    return {
      token,
    };
  } catch (error: any) {
    throw new Error(error.message);
  }
}
