#!/usr/bin/env node
"use strict";

/**
 * Simple webhook server for automatic deployments
 * Listens for GitHub webhooks and triggers git pull & service restart
 */

const http = require("node:http");
const crypto = require("node:crypto");
const { exec } = require("node:child_process");

// Configuration
const PORT = process.env.WEBHOOK_PORT || 9000;
const SECRET = process.env.WEBHOOK_SECRET || "";
const DEPLOY_PATH = process.env.DEPLOY_PATH || "/home/apps/fereshteh_website";
const SERVICE_NAME = process.env.SERVICE_NAME || "fereshteh-website";

function verifySignature(payload, signature) {
  if (!SECRET) {
    return true; // Skip verification if no secret set
  }

  const hmac = crypto.createHmac("sha256", SECRET);
  const digest = `sha256=${hmac.update(payload).digest("hex")}`;
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
}

function deploy() {
  console.log(`[${new Date().toISOString()}] Starting deployment...`);

  exec(`${DEPLOY_PATH}/deploy.sh`, { maxBuffer: 1024 * 1024 * 10 }, (error, stdout, stderr) => {
    if (error) {
      console.error(`[${new Date().toISOString()}] Deployment failed:`, error);
      console.error(stderr);
      return;
    }
    console.log(`[${new Date().toISOString()}] Deployment successful!`);
    console.log(stdout);
  });
}

const server = http.createServer((req, res) => {
  if (req.method === "POST" && req.url === "/webhook") {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", () => {
      const signature = req.headers["x-hub-signature-256"];

      if (!verifySignature(body, signature)) {
        console.log(`[${new Date().toISOString()}] Invalid signature`);
        res.writeHead(401);
        res.end("Invalid signature");
        return;
      }

      try {
        const payload = JSON.parse(body);

        // Only deploy on push to main branch
        if (payload.ref === "refs/heads/main") {
          console.log(
            `[${new Date().toISOString()}] Received push to main, deploying...`
          );
          deploy();
          res.writeHead(200);
          res.end("Deployment triggered");
        } else {
          console.log(
            `[${new Date().toISOString()}] Received push to ${payload.ref}, ignoring`
          );
          res.writeHead(200);
          res.end("Not main branch, ignoring");
        }
      } catch (error) {
        console.error(`[${new Date().toISOString()}] Error:`, error);
        res.writeHead(400);
        res.end("Bad request");
      }
    });
  } else if (req.method === "GET" && req.url === "/health") {
    res.writeHead(200);
    res.end("OK");
  } else {
    res.writeHead(404);
    res.end("Not found");
  }
});

server.listen(PORT, () => {
  console.log(
    `[${new Date().toISOString()}] Webhook server listening on port ${PORT}`
  );
  console.log(`[${new Date().toISOString()}] Deploy path: ${DEPLOY_PATH}`);
  console.log(
    `[${new Date().toISOString()}] Secret configured: ${SECRET ? "Yes" : "No"}`
  );
});
