"use client";

import { useState } from "react";
import { signIn, signOut } from "aws-amplify/auth";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    // TODO: remove debug print
    console.log({ username, password });

    try {
      const result = await signIn({
        username,
        password,
      });

      // @TODO: remove debug print
      console.log("sign-in-result", result);
    } catch (err) {
      console.log(err);
      setError("Invalid username or password");
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <main>
      <h1>Pick&apos;em</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="username">Username</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </div>

        {error && <p>{error}</p>}

        <button type="submit">Log in</button>

        {/* @TODO: move this out once testing and auth work is done  */}
        <button type="button" onClick={handleSignOut}>
          Sign out
        </button>
      </form>
    </main>
  );
}
