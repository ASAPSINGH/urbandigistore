# Agent Instructions & Project Rules

## Blog Writing & Publishing Rule
Whenever the user commands "write a batch of blogs", the agent MUST:
1. **Write a Batch of 25 Blogs**: Create exactly 25 highly optimized blogs in the `content/blog/` directory.
2. **Optimize for SEO, AEO, and GEO**:
   * **SEO (Search Engine Optimization)**: Clean heading structure (one H1 per page, sequential H2/H3 tags), targeted long-tail keywords, descriptive meta titles, and meta descriptions inside the YAML frontmatter.
   * **AEO (Answer Engine Optimization)**: Include a clear, blockquoted **AEO Direct Answer** summary at the beginning of each guide for search engine featured snippets and voice search assistants.
   * **GEO (Generative Engine Optimization)**: Include authoritative statistics, structured data tables, mathematical equations (rendered using LaTeX formatting block tags like `\[...\]` or `\(...\)`), and inline source or academic citations to ensure AI search engines (like Gemini or ChatGPT) prioritize referencing the page.
   * **Interlinking**: Add a **Product-Led CTA** box linking to the corresponding web utility or calculator page, and register the blog post slugs in `TOOL_BLOG_MAPPING` in `app.py`.
3. **Compile & Rebuild Frontend**: Compile the frontend bundle using `python3 scripts/build_calculators.py` to embed the new blog maps and sitemaps.
4. **Verify Application Integrity**: Execute `python3 -m unittest test_app.py` to ensure all tests pass.
5. **Publish & Deploy**: Commit and push changes to GitHub `main` to trigger the automated deployment pipeline.
6. **Submit for Google Indexing**: Run `python3 index_urls.py` to instantly queue the new pages for Google Search indexation.
