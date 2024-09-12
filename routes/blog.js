const express = require('express');
const router = express.Router();
const { fetchFromDB, geminiAI } = require('../controller/readEmails'); // Adjust the path
const Blog = require('./../models/storeBlogsModel');

// API route to fetch blog content

// run this as a cron job to generate blog content few minutes before the blog is published
router.get('/generateBlog', async (req, res) => {
    try {
        console.log("Called")
        const emails = await fetchFromDB();
        if (emails.length === 0) {
            return res.status(404).json({ message: "No emails found for today." });
        }

        // Concatenate subjects and bodies with a special symbol
        const combinedContent = emails.map(email => `Title: ${email.subject} ### Body: ${email.body} ||| `).join("\n\n");

        // Generate blog content in HTML format
        const blogContent = await geminiAI(combinedContent);

        const titleMatch = blogContent.match(/Title:\s*(.*?)\n/);
        const bodyMatch = blogContent.match(/Body:\s*([\s\S]*)/);

        const title = titleMatch ? titleMatch[1].trim() : "No Title Found";
        const body = bodyMatch ? bodyMatch[1].trim() : "No Body Found";

        // Return the blog content as a JSON response
        console.log("Blog content generated successfully.");
        await Blog.create({ title, body });
        // console.log("Blog content saved successfully.");
        res.status(200).json({
            title,
            body
        });
    } catch (error) {
        console.error("Error generating blog content:", error);
        res.status(500).json({ message: "Error generating blog content." });
    }
});

// API route to fetch all blogs
router.get('/blog', async (req, res) => {
    try {
        const blogs = await Blog.find();
        console.log("Blogs fetched successfully.");
        res.status(200).json(blogs);
    } catch (error) {
        console.error("Error fetching blogs:", error);
        res.status(500).json({ message: "Error fetching blogs." });
    }
});

// API route to fetch a specific blog
router.get('/blog/:id', async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);

        if (!blog) {
            return res.status(404).json({ message: "Blog not found." });
        }

        res.status(200).json(blog);
    } catch (error) {
        console.error("Error fetching blog:", error);
        res.status(500).json({ message: "Error fetching blog." });
    }
});

module.exports = router;