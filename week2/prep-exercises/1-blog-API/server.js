const express = require("express");
const fs = require("fs").promises; // Using the Promise-based `fs` module
const path = require("path");
const app = express();

app.use(express.json());

// Utility function to get the file path for a blog post
const getFilePath = (title) => path.join(__dirname, "blogs", title);

// Ensure the "blogs" directory exists
const ensureBlogsDirectory = async () => {
    try {
        await fs.mkdir(path.join(__dirname, "blogs"), { recursive: true });
    } catch (err) {
        console.error("Error creating blogs directory:", err);
    }
};

// Initialize blogs directory
ensureBlogsDirectory();

// **1. Create a new blog post**
app.post("/blogs", async (req, res) => {
    const { title, content } = req.body;

    if (!title || !content) {
        return res.status(400).json({ error: "Title and content are required." });
    }

    const filePath = getFilePath(title);
    try {
        await fs.access(filePath); // Check if the file exists
        return res.status(409).json({ error: "Blog post with this title already exists." });
    } catch {
        // File does not exist, proceed to create
    }

    try {
        await fs.writeFile(filePath, content, "utf8");
        res.status(201).json({ message: "Blog post created." });
    } catch (err) {
        res.status(500).json({ error: "Failed to create the blog post." });
    }
});

// **2. Read a single blog post**
app.get("/blogs/:title", async (req, res) => {
    const title = req.params.title;
    const filePath = getFilePath(title);

    try {
        const content = await fs.readFile(filePath, "utf8");
        res.status(200).send(content);
    } catch {
        res.status(404).json({ error: "This post does not exist!" });
    }
});

// **3. Update an existing blog post**
app.put("/blogs/:title", async (req, res) => {
    const title = req.params.title;
    const { content } = req.body;

    if (!content) {
        return res.status(400).json({ error: "Content is required." });
    }

    const filePath = getFilePath(title);

    try {
        await fs.access(filePath); // Check if the file exists
        await fs.writeFile(filePath, content, "utf8");
        res.status(200).json({ message: "Blog post updated." });
    } catch {
        res.status(404).json({ error: "This post does not exist!" });
    }
});

// **4. Delete a blog post**
app.delete("/blogs/:title", async (req, res) => {
    const title = req.params.title;
    const filePath = getFilePath(title);

    try {
        await fs.access(filePath); // Check if the file exists
        await fs.unlink(filePath);
        res.status(200).json({ message: "Blog post deleted." });
    } catch {
        res.status(404).json({ error: "This post does not exist!" });
    }
});

// **Bonus: List all blog posts**
app.get("/blogs", async (req, res) => {
    try {
        const files = await fs.readdir(path.join(__dirname, "blogs"));
        const blogs = files.map((file) => ({ title: file }));
        res.status(200).json(blogs);
    } catch (err) {
        res.status(500).json({ error: "Failed to retrieve blog posts." });
    }
});

// **Basic server setup**
app.listen(3000, () => {
    console.log("Server is running on http://localhost:3000");
});