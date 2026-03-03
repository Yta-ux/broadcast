import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  deleteUser,
} from "firebase/auth";
import {
  doc,
  writeBatch,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "../lib/firebase";
import type { SignupData } from "../types";

export const signup = async ({ email, password, tenantName }: SignupData) => {
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );
  const user = userCredential.user;

  try {
    const tenantRef = doc(db, "tenants", crypto.randomUUID());
    const tenantUserRef = doc(db, "tenantUsers", user.uid);

    const batch = writeBatch(db);

    batch.set(tenantRef, {
      name: tenantName,
      createdBy: user.uid,
      createdAt: serverTimestamp(),
    });

    batch.set(tenantUserRef, {
      userId: user.uid,
      tenantId: tenantRef.id,
      email: user.email,
      createdAt: serverTimestamp(),
    });

    await batch.commit();

    return { user, tenantId: tenantRef.id };
  } catch (error) {
    // Rollback: delete the auth user if Firestore write fails
    await deleteUser(user);
    throw error;
  }
};

export const login = async (email: string, password: string) => {
  const userCredential = await signInWithEmailAndPassword(
    auth,
    email,
    password
  );
  return userCredential.user;
};

export const logout = async () => {
  await signOut(auth);
};
