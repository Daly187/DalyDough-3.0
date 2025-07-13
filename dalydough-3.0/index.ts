import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

...

function serve() {
  ...
  // Example API key check:
-  // if (!apiKey) {
-  //   throw new Error("API key not provided");
-  // }
+  const apiKey = process.env.FMP_API_KEY;
+  if (!apiKey) {
+    throw new Error("FMP_API_KEY not provided in .env.local");
+  }
  ...
}

...