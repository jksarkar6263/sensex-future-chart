import fs from "fs";
import fetch from "node-fetch";

const FILE = "./data/sensex-ticks.json";

async function updateSensex() {

  try {

    const resp = await fetch(
      "https://webapi.niftytrader.in/webapi/Symbol/future-expiry-data?symbol=sensex&exchange=bse"
    );

    const json = await resp.json();

    const records =
      json?.resultData || [];

    if (!records.length) {
      console.log("No records");
      return;
    }

    let existing = { ticks: {} };

    if (fs.existsSync(FILE)) {

      existing =
        JSON.parse(
          fs.readFileSync(FILE, "utf8")
        );
    }

    for (const row of records) {

      const expiryDate =
        new Date(row.expiry_date);

      const expiry =
        expiryDate
          .toLocaleDateString("en-GB")
          .replace(/\//g, "-");

      const tickTime =
        row.time ||
        new Date().toLocaleTimeString(
          "en-IN",
          { hour12: false }
        );

      const ltp =
        Number(
          row.ltp ??
          row.last_price
        );

      if (!existing.ticks[expiry]) {
        existing.ticks[expiry] = [];
      }

      const arr =
        existing.ticks[expiry];

      const already =
        arr.find(
          x => x.time === tickTime
        );

      if (!already) {

        arr.push({
          time: tickTime,
          ltp
        });

        // keep last 400 ticks
        if (arr.length > 400) {
          arr.shift();
        }
      }
    }

    fs.writeFileSync(
      FILE,
      JSON.stringify(existing, null, 2)
    );

    console.log("Updated successfully");

  } catch (e) {

    console.error(e);
  }
}

updateSensex();