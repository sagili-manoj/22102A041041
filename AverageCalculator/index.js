const express = require("express");
const axios = require("axios");

const app = express();
const PORT = 9876;
const WINDOW_SIZE = 10;

const urls = {
  p: "http://20.244.56.144/evaluation-service/primes",
  f: "http://20.244.56.144/evaluation-service/fibo",
  e: "http://20.244.56.144/evaluation-service/even",
  r: "http://20.244.56.144/evaluation-service/rand",
  primes: "http://20.244.56.144/evaluation-service/primes",
  fibo: "http://20.244.56.144/evaluation-service/fibo",
  even: "http://20.244.56.144/evaluation-service/even",
  rand: "http://20.244.56.144/evaluation-service/rand",
};

let windowNumbers = [];

const fetchToken = async () => {
  try {
    const response = await axios.post("http://20.244.56.144/evaluation-service/auth", {
      email: "22102a041041@mbu.asia",
      name: "sagili manoj kumar reddy",
      rollNo: "22102a041041",
      accessCode: "dJFufE",
      clientID: "c85d1d92-480d-4cac-8488-5e1c4b83c145",
      clientSecret: "ZrvGyDCepXsKpkrG",
    });
    console.log("New token fetched:", response.data.access_token);
    return response.data.access_token;
  } catch (error) {
    console.error("Error fetching token:", error.message);
    return null;
  }
};

const fetchWithTimeout = async (url, timeout = 500) => {
  try {
    const token = await fetchToken();
    if (!token) {
      throw new Error("Failed to fetch token");
    }

    const response = await axios.get(url, {
      timeout,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log(`Fetched numbers from ${url}:`, response.data?.numbers);
    return response.data?.numbers || [];
  } catch (error) {
    console.error(`Error fetching from ${url}:`, error.message);
    console.log("Using mock data due to upstream server error");
    return [];
  }
};

app.get("/numbers/:numberid", async (req, res) => {
  const id = req.params.numberid;

  if (!urls[id]) {
    return res.status(400).json({ error: "Invalid number ID" });
  }

  const prevWindow = [...windowNumbers];

  const numbers = await fetchWithTimeout(urls[id]);
  const uniqueNew = numbers.filter((num) => !windowNumbers.includes(num));
  windowNumbers.push(...uniqueNew);
  if (windowNumbers.length > WINDOW_SIZE) {
    windowNumbers = windowNumbers.slice(windowNumbers.length - WINDOW_SIZE);
  }
  const val = parseFloat(
    (
      windowNumbers.reduce((acc, val) => acc + val, 0) / windowNumbers.length
    ).toFixed(2)
  );
  const avg = windowNumbers.length === 0 ? 0 : val;

  res.json({
    windowPrevState: prevWindow,
    windowCurrState: windowNumbers,
    numbers,
    avg,
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});