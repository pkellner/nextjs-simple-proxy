import { useEffect, useState } from "react";

export default function Home() {
  const [jokes, setJokes] = useState([]);
  const [loggedIn, setLoggedIn] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  //const fetchBaseUrl  = "https://proxytest.73rdst.com"; // THIS WILL NEVER WORK! Next.js is http://localhost:3000 only

  const fetchBaseUrl  = "https://localhost:5200";
  //const fetchBaseUrl = "https://localhost:7172";
  //const fetchBaseUrl  = "http://localhost:5200";
  //const fetchBaseUrl = "http://localhost:7172";

  // Check login status and fetch jokes
  useEffect(() => {
    async function fetchJokes() {
      try {
        const res = await fetch(`${fetchBaseUrl}/jokes`, {
          method: "GET",
          credentials: "include",
        });

        if (res.ok) {
          const data = await res.json();
          setJokes(data);
          setLoggedIn(true);
        } else if (res.status === 401) {
          setErrorMessage("Please log in to view jokes.");
          setLoggedIn(false);
        }
      } catch (error) {
        setErrorMessage("Error fetching jokes. Please try again later.");
      }
    }
    fetchJokes();
  }, []);

  // Handle login
  const handleLogin = async () => {
    try {
      await fetch(`${fetchBaseUrl}/login`, {
        method: "GET",
        credentials: "include",
      });
      setLoggedIn(true);
      location.reload(); // Reload to update jokes
    } catch (error) {
      setErrorMessage("Login failed. Please try again.");
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await fetch(`${fetchBaseUrl}/logout`, {
        method: "GET",
        credentials: "include",
      });
      setLoggedIn(false);
      setJokes([]);
    } catch (error) {
      setErrorMessage("Logout failed. Please try again.");
    }
  };

  return (
    <div className="p-6 font-sans">
      <h1 className="text-2xl font-bold mb-4">Cookie Test and SSL Jokes App (REST GET to: {fetchBaseUrl}/jokes)</h1>

      {loggedIn ? (
        <p className="text-green-600">Welcome! You are logged in.</p>
      ) : (
        <p className="text-red-600">You are not logged in.</p>
      )}
      <div className="mb-6">
        <button
          onClick={handleLogin}
          className="px-4 py-2 bg-blue-500 text-white rounded mr-2 hover:bg-blue-600"
        >
          Login
        </button>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Logout
        </button>
      </div>
      <div>
        <h2 className="text-xl font-semibold mb-2">Jokes</h2>
        {errorMessage && (
          <p className="text-red-500 mb-2">{errorMessage}</p>
        )}
        {jokes.length > 0 ? (
          <ul className="list-disc list-inside space-y-1">
            {jokes.map((joke, index) => (
              <li key={index} className="text-blue-500">
                {joke}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-red-500">No jokes available.</p>
        )}
      </div>
    </div>
  );
}
