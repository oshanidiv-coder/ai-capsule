require("dotenv").config();

const passport = require("./passport");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const express = require("express");
const db = require("./database");
const verifyJWT = require("./middleware/auth");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const app = express();
const dataDir = process.env.DATA_DIR || __dirname;
const uploadsDir = path.join(dataDir, "uploads");
if (!fs.existsSync(uploadsDir)) {

 fs.mkdirSync(uploadsDir, { recursive: true });

}

const frontendDist = path.join(__dirname, "../frontend/dist");
app.use(express.static(frontendDist));

app.use(cors({
    origin: process.env.FRONTEND_URL ||"http://localhost:5173",
    credentials: true
}));


app.use(express.json());

app.use("/uploads", express.static(uploadsDir));

app.use(cookieParser());

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });

});

const storage = multer.diskStorage({

 destination: function (req, file, cb) {

 cb(null, uploadsDir);

 },

 filename: function (req, file, cb) {

 const uniqueName = Date.now() + "-" + file.originalname;

 cb(null, uniqueName);

 }

});

const upload = multer({

 storage: storage,

 limits: {

 fileSize: 5 * 1024 * 1024

 },

 fileFilter: function (req, file, cb) {

 if (file.mimetype.startsWith("image/")) {

 cb(null, true);

 } else {

 cb(new Error("Only image files are allowed."), false);

 }

 }

});

const deleteUploadedFile = (screenshotUrl) => {

 if (!screenshotUrl) return;

 if (!screenshotUrl.includes("/uploads/")) return;

 const filename = screenshotUrl.split("/uploads/")[1];

 if (!filename) return;

 const filePath = path.join(uploadsDir, filename);

 fs.unlink(filePath, (err) => {

 if (err && err.code !== "ENOENT") {

 console.error("Unable to delete old screenshot:", err.message);

 }

 });

};

// ADD THE POST /api/capsules ROUTE HERE

app.post("/api/capsules", verifyJWT, 
upload.single("screenshot"), (req, res) => {
    const {
        project_name,
        prompt_title,
        prompt_version,
        prompt_text,
        response_summary,
        category,
        usefulness,
        reviewed,
        improved,
        screenshot_url,
        notes
    } = req.body;

    const savedScreenshotUrl = req.file

    ? "/uploads/" + req.file.filename

    : screenshot_url;

    const sql = `
        INSERT INTO capsules (
            user_id,
            project_name,
            prompt_title,
            prompt_version,
            prompt_text,
            response_summary,
            category,
            usefulness,
            reviewed,
            improved,
            screenshot_url,
            notes
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.run(
        sql,
        [
            req.user.userId,
            project_name,
            prompt_title,
            prompt_version,
            prompt_text,
            response_summary,
            category,
            usefulness,
            reviewed,
            improved,
            savedScreenshotUrl,
            notes
        ],
        function (err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            res.status(201).json({
                message: "Capsule created",
                id: this.lastID
            });
        }
    );
});

app.get("/api/capsules", verifyJWT, (req, res) => {
    db.all(
    "SELECT * FROM capsules WHERE user_id = ?",
    [req.user.userId],
    (err, rows) => {
        if (err) {
            return res.status(500).json({
                error: err.message
            });
        }

        res.json(rows);
    }
);
});


app.put("/api/capsules/:id", verifyJWT, upload.single("screenshot"), (req, res) => {
    const { id } = req.params;

    const {
        project_name,
        prompt_title,
        prompt_version,
        prompt_text,
        response_summary,
        category,
        usefulness,
        reviewed,
        improved,
        screenshot_url,
        notes
    } = req.body;

    const savedScreenshotUrl = req.file

 ? "/uploads/" + req.file.filename

 : screenshot_url;

 db.get(

 "SELECT screenshot_url FROM capsules WHERE id = ? AND user_id = ?",

 [id, req.user.userId],

 (findErr, existingCapsule) => {

 if (findErr) {

 return res.status(500).json({ error: findErr.message });

 }

 if (!existingCapsule) {

 return res.status(404).json({ message: "Capsule not found" });

 }

    const sql = `
        UPDATE capsules
        SET project_name = ?,
            prompt_title = ?,
            prompt_version = ?,
            prompt_text = ?,
            response_summary = ?,
            category = ?,
            usefulness = ?,
            reviewed = ?,
            improved = ?,
            screenshot_url = ?,
            notes = ?
        WHERE id = ? AND user_id = ?
    `;

    db.run(
        sql,
        [project_name, prompt_title, prompt_version, prompt_text, response_summary, category, usefulness, reviewed, improved, savedScreenshotUrl, notes, id, req.user.userId],
        function (err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            if (this.changes === 0) {
            return res.status(404).json({

            message: "Capsule not found"

            });
        }
if (req.file && existingCapsule.screenshot_url !== savedScreenshotUrl) {

 deleteUploadedFile(existingCapsule.screenshot_url);

}

        
            res.json({
                message: "Capsule updated"
            });
        }
    );
}
 );
});

app.delete("/api/capsules/:id", verifyJWT, (req, res) => {
    const { id } = req.params;

    db.get(

 "SELECT screenshot_url FROM capsules WHERE id = ? AND user_id = ?",

 [id, req.user.userId],

 (findErr, existingCapsule) => {

 if (findErr) {

 return res.status(500).json({ error: findErr.message });

 }

 if (!existingCapsule) {

 return res.status(404).json({ message: "Capsule not found" });

 }

    db.run(
        "DELETE FROM capsules WHERE id = ? AND user_id = ?",
        [id,req.user.userId],
        function (err) {
            if (err) {
                return res.status(500).json({
                    error: err.message
                });
            }

            if (this.changes === 0) {
                return res.status(404).json({
                    message: "Capsule not found"
                });
            }

            deleteUploadedFile(existingCapsule.screenshot_url);

            res.json({
                message: "Capsule deleted"
            });
        }
    );
}
    );
});

app.get(
  "/auth/github",
  passport.authenticate("github", {
    scope: ["user:email"],
  })
);

app.get(
  "/auth/github/callback",
  passport.authenticate("github", {
    session: false,
    failureRedirect: "/login",
  }),

  (req, res) => {
    const token = jwt.sign(
      {
        userId: req.user.id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });

    res.redirect("/dashboard");
  }
);

app.post("/auth/logout", (req, res) => {

 res.clearCookie("token", {

 httpOnly: true,

 secure: process.env.NODE_ENV === "production",

 });

 res.json({ message: "Logged out successfully" });

});

app.get("/{*splat}", (req, res) => {

 res.sendFile(path.join(frontendDist, "index.html"));

});

app.use((err, req, res, next) => {

 if (err instanceof multer.MulterError) {

 if (err.code === "LIMIT_FILE_SIZE") {

 return res.status(400).json({

 error: "Screenshot must be smaller than 5 MB."

 });

 }

 return res.status(400).json({ error: err.message });

 }

 if (err) {

 return res.status(400).json({ error: err.message });

 }

 next();

});

const PORT = process.env.PORT || 5000;

//Keep app.listen


app.listen(PORT, () => {
    console.log("Server running on port " + PORT);
});
